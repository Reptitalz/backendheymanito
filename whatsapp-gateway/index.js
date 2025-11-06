
import express from 'express';
import { makeWASocket, useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys';
import pino from 'pino';
import { Storage } from '@google-cloud/storage';
import fs from 'fs/promises';
import path from 'path';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// IMPORTANTE: Debes crear un bucket en Google Cloud Storage y poner el nombre aquí.
// Opcionalmente, puedes configurarlo como una variable de entorno en tu VM.
const bucketName = process.env.WHATSAPP_BUCKET_NAME || 'heymanito-sessions-bucket'; 

const storage = new Storage();
const authFolder = path.join(process.cwd(), 'session_auth_info');

let sock;
let latestQR = null;
let connectionStatus = 'initializing'; // 'initializing', 'qr', 'connected', 'disconnected'

// Descarga la sesión desde Google Cloud Storage al iniciar
async function downloadAuthState() {
  try {
    await fs.mkdir(authFolder, { recursive: true });
    const [files] = await storage.bucket(bucketName).getFiles({ prefix: 'auth_state/' });
    if (files.length === 0) {
      console.log('No se encontró estado de autenticación previo, se creará uno nuevo.');
      return;
    }
    for (const file of files) {
      const dest = path.join(authFolder, path.basename(file.name));
      await file.download({ destination: dest });
    }
    console.log('Estado de autenticación descargado desde el bucket.');
  } catch (err) {
    console.error('Error al descargar el estado de autenticación:', err);
    console.log('Iniciando sin estado de autenticación previo.');
  }
}

// Sube la sesión a Google Cloud Storage cada vez que se actualiza
async function uploadAuthState() {
  try {
    const files = await fs.readdir(authFolder);
    for (const file of files) {
      const filePath = path.join(authFolder, file);
      if ((await fs.lstat(filePath)).isFile()) {
        await storage.bucket(bucketName).upload(filePath, {
          destination: `auth_state/${file}`,
          resumable: false,
        });
      }
    }
    console.log('Estado de autenticación sincronizado con el bucket.');
  } catch (err) {
    console.error("Error al subir el estado de autenticación:", err);
  }
}

// Inicializa Baileys
async function startBot() {
  connectionStatus = 'initializing';
  latestQR = null;
  await downloadAuthState();
  const { state, saveCreds } = await useMultiFileAuthState(authFolder);

  sock = makeWASocket({
    printQRInTerminal: true,
    auth: state,
    logger: pino({ level: 'silent' }),
    browser: ['HeyManito VM', 'Chrome', '1.0.0'],
  });

  // Guardar credenciales y subirlas a GCS
  sock.ev.on('creds.update', async () => {
    await saveCreds();
    await uploadAuthState();
  });

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log("Nuevo QR recibido.");
      latestQR = qr;
      connectionStatus = 'qr';
    }

    if (connection === 'open') {
      connectionStatus = 'connected';
      console.log('Conectado a WhatsApp');
      latestQR = null;
    } else if (connection === 'close') {
      connectionStatus = 'disconnected';
      const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log(`Desconectado. Causa: ${lastDisconnect?.error}, reconectando: ${shouldReconnect}`);
      if (shouldReconnect) {
        startBot();
      } else {
        console.log('Desconectado permanentemente, se requiere nuevo QR.');
        fs.rm(authFolder, { recursive: true, force: true }).catch(err => console.error("Error limpiando auth folder:", err));
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

// Endpoints del servidor Express
app.get('/', (req, res) => res.status(200).send('🚀 WhatsApp Gateway activo en VM'));
app.get('/_health', (req, res) => res.status(200).send('OK'));
app.get('/status', (req, res) => res.status(200).json({ status: connectionStatus, qr: latestQR }));

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`🌐 Servidor iniciado en puerto ${port}`);
  startBot();
});
