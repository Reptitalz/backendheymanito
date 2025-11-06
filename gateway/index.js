
import express from 'express';
import { makeWASocket, useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys';
import pino from 'pino';
import { Storage } from '@google-cloud/storage';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const bucketName = process.env.BUCKET_NAME || 'manito-sessions';
if (!bucketName) {
  throw new Error("BUCKET_NAME environment variable is not set.");
}

const storage = new Storage();
// Usamos una ruta relativa para que funcione en cualquier entorno de VM
const authFolder = path.join(__dirname, 'auth_state'); 

let sock;
let latestQR = null;
let connectionStatus = 'initializing'; // 'initializing', 'qr', 'connected', 'disconnected'

// 🔧 Descargar persistencia desde el bucket al iniciar
async function downloadAuthState() {
  try {
    await fs.promises.mkdir(authFolder, { recursive: true });
    const [files] = await storage.bucket(bucketName).getFiles({ prefix: 'auth_state/' });
    if (files.length === 0) {
      console.log('⚠️ No se encontró estado previo, iniciando nuevo.');
      return;
    }
    for (const file of files) {
      const dest = path.join(authFolder, path.basename(file.name));
      await file.download({ destination: dest });
    }
    console.log('✅ Auth state descargado desde el bucket');
  } catch (err) {
    console.error('Error al descargar el estado de autenticación:', err);
    console.log('⚠️ No se encontró estado previo o hubo un error, iniciando nuevo.');
  }
}

// 🔼 Subir persistencia al bucket
async function uploadAuthState() {
  try {
    const files = await fs.promises.readdir(authFolder);
    for (const file of files) {
      const filePath = path.join(authFolder, file);
      if ((await fs.promises.lstat(filePath)).isFile()) {
        await storage.bucket(bucketName).upload(filePath, {
          destination: `auth_state/${file}`,
          resumable: false,
        });
      }
    }
    console.log('☁️ Auth state sincronizado con el bucket');
  } catch (err) {
    console.error("Error al subir el estado de autenticación:", err);
  }
}

// 🧠 Inicializar conexión Baileys
async function startSock() {
  connectionStatus = 'initializing';
  latestQR = null;
  await downloadAuthState();
  const { state, saveCreds } = await useMultiFileAuthState(authFolder);

  sock = makeWASocket({
    printQRInTerminal: true,
    auth: state,
    logger: pino({ level: 'silent' }),
    browser: ['HeyManito VM', 'Chrome', '1.0.0'],
    version: [2, 2413, 51],
    generateHighQualityLinkPreview: true,
  });

  sock.ev.on('creds.update', async () => {
    await saveCreds();
    await uploadAuthState();
  });

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log("Nuevo QR recibido, actualizando...");
      latestQR = qr;
      connectionStatus = 'qr';
    }

    if (connection === 'open') {
      connectionStatus = 'connected';
      console.log('✅ Conectado a WhatsApp');
      latestQR = null;
    } else if (connection === 'close') {
      connectionStatus = 'disconnected';
      const shouldReconnect =
        (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log(`Desconectado. Causa: ${lastDisconnect?.error}, reconectando: ${shouldReconnect}`);
      if (shouldReconnect) {
        startSock();
      } else {
        console.log('Desconectado permanentemente, se requiere nuevo QR.');
        fs.rm(authFolder, { recursive: true, force: true }, (err) => {
          if (err) console.error("Error limpiando la carpeta de autenticación:", err);
          else console.log("Carpeta de autenticación local eliminada.");
        });
      }
    }
  });

   sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const sender = msg.key.remoteJid;
        console.log(`Mensaje recibido de: ${sender}`);
        await sock.sendMessage(sender, { text: 'Hola desde el gateway en la VM!' });
    });
}

app.get('/', (req, res) => res.status(200).send('🚀 WhatsApp Gateway activo en VM'));
app.get('/_health', (req, res) => res.status(200).send('OK'));

// Endpoint para obtener el QR y el estado actual
app.get('/status', async (req, res) => {
    res.status(200).json({ status: connectionStatus, qr: latestQR });
});

// Reiniciar sesión manualmente
app.post('/reset', async (req, res) => {
  try {
    await sock?.logout();
  } catch (e) {
    console.error("Error durante el logout, puede que la sesión ya estuviera cerrada.", e);
  }
  
  try {
    // Eliminar archivos del bucket y locales
    await storage.bucket(bucketName).deleteFiles({ prefix: 'auth_state/' });
    if (fs.existsSync(authFolder)) {
      fs.rmSync(authFolder, { recursive: true, force: true });
    }
    
    res.send('🔄 Sesión reiniciada. El bot intentará obtener un nuevo QR.');
    
    // Reiniciar la conexión para generar un nuevo QR
    startSock();

  } catch (err) {
    console.error("Error reiniciando la sesión:", err);
    res.status(500).send(err.message);
  }
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`🌐 Servidor iniciado en puerto ${port}`);
  startSock();
});
