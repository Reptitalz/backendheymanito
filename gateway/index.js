
import express from 'express';
import { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } from '@whiskeysockets/baileys';
import pino from 'pino';
import { Storage } from '@google-cloud/storage';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import axios from 'axios';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors()); // Permitir cualquier origen
app.use(express.json());

// --- CONFIGURACIÓN ---
const BUCKET_NAME = process.env.BUCKET_NAME;
const NEXTJS_APP_URL = process.env.NEXTJS_APP_URL; // URL del webhook de la app Next.js
const AUTH_DIR = path.join(__dirname, 'auth_state');

if (!BUCKET_NAME) {
  console.error("Error: La variable de entorno BUCKET_NAME es obligatoria.");
  process.exit(1);
}
if (!NEXTJS_APP_URL) {
    console.warn("Advertencia: NEXTJS_APP_URL no está configurada. No se enviarán webhooks.");
}

const storage = new Storage();

// --- ESTADO GLOBAL ---
let sock;
let gatewayStatus = 'initializing'; // initializing | qr | connected | disconnected
let lastQRCode = null;

// --- FUNCIONES DE PERSISTENCIA ---

async function downloadAuthState() {
  console.log('Iniciando descarga del estado de autenticación desde el bucket...');
  try {
    await fs.promises.mkdir(AUTH_DIR, { recursive: true });
    const [files] = await storage.bucket(BUCKET_NAME).getFiles({ prefix: 'auth_state/' });
    if (files.length === 0) {
      console.log('No se encontró estado de autenticación previo en el bucket.');
      return;
    }
    for (const file of files) {
      const destination = path.join(AUTH_DIR, path.basename(file.name));
      await file.download({ destination });
    }
    console.log('✅ Estado de autenticación descargado correctamente.');
  } catch (error) {
    console.error('⚠️ Error al descargar el estado de autenticación:', error);
  }
}

async function uploadAuthState() {
  console.log('Iniciando subida del estado de autenticación al bucket...');
  try {
    const files = await fs.promises.readdir(AUTH_DIR);
    for (const file of files) {
      const filePath = path.join(AUTH_DIR, file);
      if ((await fs.promises.lstat(filePath)).isFile()) {
        await storage.bucket(BUCKET_NAME).upload(filePath, {
          destination: `auth_state/${file}`,
          resumable: false,
        });
      }
    }
    console.log('☁️ Estado de autenticación sincronizado con el bucket.');
  } catch (error) {
    console.error('⚠️ Error al subir el estado de autenticación:', error);
  }
}

async function clearAuthState() {
    try {
        console.log('Limpiando estado de autenticación local y remoto...');
        if (fs.existsSync(AUTH_DIR)) {
            await fs.promises.rm(AUTH_DIR, { recursive: true, force: true });
            console.log('Directorio de autenticación local eliminado.');
        }
        const [files] = await storage.bucket(BUCKET_NAME).getFiles({ prefix: 'auth_state/' });
        await Promise.all(files.map(f => f.delete()));
        console.log('Archivos de autenticación remotos eliminados.');
    } catch(error) {
        console.error('⚠️ Error durante la limpieza del estado de autenticación:', error);
    }
}


// --- LÓGICA DE BAILEYS ---

async function startSock() {
  gatewayStatus = 'initializing';
  lastQRCode = null;
  console.log('Iniciando Baileys...');
  
  await downloadAuthState();
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
  const { version, isLatest } = await fetchLatestBaileysVersion();
  console.log(`Usando la versión de Baileys: ${version.join('.')}, ¿es la última?: ${isLatest}`);

  sock = makeWASocket({
    version,
    printQRInTerminal: true,
    auth: state,
    logger: pino({ level: 'silent' }),
    browser: ['HeyManito Cloud', 'Chrome', '1.0.0'],
    generateHighQualityLinkPreview: true,
  });

  sock.ev.on('creds.update', async () => {
    await saveCreds();
    await uploadAuthState();
  });

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log("Nuevo código QR recibido.");
      gatewayStatus = 'qr';
      lastQRCode = qr;
    }

    if (connection === 'open') {
      console.log('✅ Conexión con WhatsApp establecida.');
      gatewayStatus = 'connected';
      lastQRCode = null;
    } else if (connection === 'close') {
      const statusCode = (lastDisconnect?.error as any)?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
      
      console.error('Conexión cerrada. Motivo:', lastDisconnect?.error, `Reconexión: ${shouldReconnect}`);
      gatewayStatus = 'disconnected';
      
      if (shouldReconnect) {
        console.log('Intentando reconectar...');
        startSock();
      } else {
        console.log('Desconexión permanente (loggedOut). Se requiere un nuevo escaneo de QR.');
        clearAuthState(); // Limpiar estado para forzar nuevo QR
      }
    }
  });

  sock.ev.on('messages.upsert', async (m) => {
    const msg = m.messages[0];
    if (!msg.message || msg.key.fromMe || !NEXTJS_APP_URL) return;

    const sender = msg.key.remoteJid;
    console.log(`Mensaje recibido de ${sender}. Enviando a webhook...`);

    try {
        await axios.post(NEXTJS_APP_URL, {
            from: sender,
            message: msg.message.conversation || msg.message.extendedTextMessage?.text || '',
            // Aquí se podría añadir la lógica para manejar audios y otros tipos de mensajes
        });
        console.log(`Webhook enviado correctamente para ${sender}.`);
    } catch (error) {
        console.error(`⚠️ Error al enviar webhook para ${sender}:`, error.message);
    }
  });
}


// --- ENDPOINTS DE EXPRESS ---

app.get('/', (req, res) => {
  res.status(200).send(`🚀 Gateway de WhatsApp activo. Estado: ${gatewayStatus}`);
});

app.get('/_health', (req, res) => res.status(200).send('OK'));

app.get('/status', (req, res) => {
  res.status(200).json({
    status: gatewayStatus,
    qr: lastQRCode,
  });
});

app.post('/reset', async (req, res) => {
    console.log('Recibida solicitud para reiniciar la sesión...');
    gatewayStatus = 'initializing';
    lastQRCode = null;
    try {
        await sock?.logout();
    } catch(e) {
        console.warn("Error durante el logout (puede que la sesión ya estuviera cerrada):", e.message);
    }
    await clearAuthState();
    res.status(200).send('🔄 Sesión reiniciada. Se generará un nuevo QR.');
    // La conexión se reiniciará automáticamente en el evento 'close' o puede forzarse aquí
    startSock();
});


const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`🌐 Servidor escuchando en el puerto ${port}`);
  startSock();
});
