
import express from 'express';
import { makeWASocket, useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys';
import pino from 'pino';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// La sesión se guardará localmente en la VM, en esta carpeta.
const authFolder = path.join(__dirname, 'auth_state'); 

let sock;
let latestQR = null;
let connectionStatus = 'initializing'; // 'initializing', 'qr', 'connected', 'disconnected'


// 🧠 Inicializar conexión Baileys (Versión simplificada sin bucket)
async function startSock() {
  connectionStatus = 'initializing';
  latestQR = null;
  
  // Si la carpeta de sesión existe, la usamos, si no, se crea una nueva.
  const { state, saveCreds } = await useMultiFileAuthState(authFolder);

  sock = makeWASocket({
    printQRInTerminal: true, // Aún útil para depuración, pero obtenemos el QR del endpoint
    auth: state,
    logger: pino({ level: 'silent' }),
    browser: ['HeyManito VM', 'Chrome', '1.0.0'],
    version: [2, 2413, 51],
    generateHighQualityLinkPreview: true,
  });

  // Cada vez que las credenciales se actualizan (ej. al conectar), se guardan en el disco de la VM.
  sock.ev.on('creds.update', saveCreds);

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
        console.log('Desconectado permanentemente (logged out), se requiere nuevo QR.');
        // Si se cierra la sesión, borramos la carpeta local para forzar un nuevo inicio.
        fs.rm(authFolder, { recursive: true, force: true }, (err) => {
          if (err) console.error("Error limpiando la carpeta de autenticación:", err);
          else console.log("Carpeta de autenticación local eliminada para generar nuevo QR.");
          // No reiniciamos automáticamente. Se necesita una acción manual (ej. /reset)
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

// Endpoint para obtener el QR y el estado actual, que el frontend consume.
app.get('/status', async (req, res) => {
    res.status(200).json({ status: connectionStatus, qr: latestQR });
});

// Reiniciar sesión manualmente
app.post('/reset', async (req, res) => {
  try {
    await sock?.logout();
    console.log('Logout forzado.');
  } catch (e) {
    console.error("Error durante el logout, puede que la sesión ya estuviera cerrada.", e);
  }
  
  try {
    // Eliminar archivos locales
    if (fs.existsSync(authFolder)) {
      fs.rmSync(authFolder, { recursive: true, force: true });
    }
    
    res.send('🔄 Sesión reiniciada. El bot intentará obtener un nuevo QR.');
    
    // Reiniciar la conexión para generar un nuevo QR
    // Damos un pequeño respiro antes de reiniciar.
    setTimeout(startSock, 2000);

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
