
import { DisconnectReason, useMultiFileAuthState } from '@whiskeysockets/baileys';
import makeWASocket from '@whiskeysockets/baileys';
import pino from 'pino';
import axios from 'axios';
import fs from 'fs';
import fsp from 'fs/promises';
import FormData from 'form-data';
import os from 'os';
import path from 'path';
import http from 'http';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { URL } from 'url';

// === CONFIGURACIÓN ===
const NEXTJS_APP_URL = process.env.NEXTJS_APP_URL || "https://heymanito.com";
const NEXTJS_WEBHOOK_URL = `${NEXTJS_APP_URL}/api/webhook`;
const SESSION_BASE_PATH = path.join(os.tmpdir(), 'wa-sessions');
const GATEWAY_SECRET = process.env.GATEWAY_SECRET;
const logger = pino({ level: 'info', transport: { target: 'pino-pretty' } });

// Mapa para gestionar las instancias de los bots
const activeBots = new Map();
let db = null; // Firestore se inicializa después

if (!GATEWAY_SECRET) {
    logger.warn("⚠️ ADVERTENCIA: La variable de entorno GATEWAY_SECRET no está definida. El gateway es vulnerable.");
}


// ======== SERVIDOR HTTP PRIMERO ========
const server = http.createServer((req, res) => {
  // Middleware de seguridad y CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Gateway-Secret');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  
  // Auth check for protected routes
  const protectedRoutes = ['/status', '/qr'];
  const requestUrl = new URL(req.url, `http://${req.headers.host}`);

  if (protectedRoutes.includes(requestUrl.pathname)) {
    const providedSecret = req.headers['x-gateway-secret'];
    if (GATEWAY_SECRET && providedSecret !== GATEWAY_SECRET) {
      logger.warn(`🚫 Acceso denegado a ruta protegida. Secreto incorrecto o no proporcionado.`);
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Forbidden' }));
      return;
    }
  }
  
  const assistantId = requestUrl.searchParams.get('assistantId');

  if (requestUrl.pathname === '/status') {
    let botState = activeBots.get(assistantId);
    // Si el bot no se encuentra, créalo.
    if (!botState) {
        logger.info(`[${assistantId}] No encontrado en memoria. Iniciando instancia bajo demanda...`);
        createBotInstance(assistantId);
        botState = activeBots.get(assistantId); // Recupera el estado recién creado
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: botState ? botState.status : 'loading' }));

  } else if (requestUrl.pathname === '/qr') {
    const botState = activeBots.get(assistantId);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ qr: botState ? botState.qr : null }));
  } else if (requestUrl.pathname === '/' || requestUrl.pathname === '/_health' || requestUrl.pathname === '/healthz') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hey Manito! Gateway - OK');
  } else {
    res.writeHead(404);
    res.end();
  }
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  logger.info(`🚀 Servidor HTTP activo en puerto ${PORT}`);
  initializeBackend();
});

// ======== INICIALIZACIÓN BACKEND ========

async function initializeBackend() {
  const firebaseReady = await initializeFirebaseAdmin();
  if (!firebaseReady) {
    logger.error("❌ No se pudo inicializar Firebase Admin. El gateway no podrá sincronizar asistentes.");
    return;
  }

  logger.info("✅ Firebase listo. Iniciando sincronización de bots...");
  syncBotsWithFirestore();
}

async function initializeFirebaseAdmin() {
  try {
    const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (!key) throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY no está definida.");
    const serviceAccount = JSON.parse(key);
    initializeApp({ credential: cert(serviceAccount) });
    db = getFirestore();
    logger.info("✅ Conexión con Firebase Admin establecida.");
    return true;
  } catch (e) {
    logger.error(`❌ Error al inicializar Firebase: ${e.message}`);
    return false;
  }
}

// ======== LÓGICA DE BOTS (REFACTORIZADA) ========

async function connectToWhatsApp(assistantId) {
    const botState = activeBots.get(assistantId);
    if (!botState) {
        logger.error(`[${assistantId}] No se encontró el estado del bot para la conexión.`);
        return;
    }

    const sessionPath = path.join(SESSION_BASE_PATH, assistantId);
    await fsp.mkdir(sessionPath, { recursive: true });

    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        logger,
        browser: ['Hey Manito!', 'Cloud Run', '3.0']
    });

    botState.sock = sock;

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;
        const current = activeBots.get(assistantId);
        if (!current) return;

        if (qr) {
            current.status = 'qr';
            current.qr = qr;
            logger.info(`[${assistantId}] QR disponible para escanear.`);
        }

        if (connection === 'close') {
            const reason = (lastDisconnect?.error)?.output?.statusCode;
            const shouldReconnect = reason !== DisconnectReason.loggedOut;
            
            logger.warn(`[${assistantId}] Conexión cerrada. Razón: ${reason}. Reintentando: ${shouldReconnect}`);

            current.qr = null;
            if (shouldReconnect) {
                current.status = 'disconnected';
                connectToWhatsApp(assistantId); // Llama a la función para reconectar
            } else {
                current.status = 'disconnected';
                 logger.error(`[${assistantId}] Sesión cerrada permanentemente. Eliminando credenciales.`);
                await stopBotInstance(assistantId); // Llama a la función completa de limpieza
            }
        } else if (connection === 'open') {
            current.status = 'connected';
            current.qr = null;
            logger.info(`✅ [${assistantId}] Conexión establecida.`);
        }
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;
        const sender = msg.key.remoteJid;

        try {
            const type = Object.keys(msg.message)[0];
            const formData = new FormData();
            formData.append('from', sender);
            formData.append('assistantId', assistantId);

            if (type === 'conversation')
                formData.append('message', msg.message.conversation);
            else if (type === 'extendedTextMessage')
                formData.append('message', msg.message.extendedTextMessage.text);
            else if (type === 'audioMessage') {
                const audioBuffer = await sock.downloadMediaMessage(msg);
                const tempPath = path.join(os.tmpdir(), `temp_${Date.now()}.ogg`);
                await fsp.writeFile(tempPath, audioBuffer);
                formData.append('audio', fs.createReadStream(tempPath));
            } else return;

            await sock.sendPresenceUpdate('composing', sender);
            const response = await axios.post(NEXTJS_WEBHOOK_URL, formData, { headers: formData.getHeaders() });
            const { replyText, replyAudio } = response.data || {};

            if (replyText) await sock.sendMessage(sender, { text: replyText });
            if (replyAudio) {
                const audioData = Buffer.from(replyAudio.split(';base64,').pop(), 'base64');
                await sock.sendMessage(sender, { audio: audioData, mimetype: 'audio/wav' });
            }
            await sock.sendPresenceUpdate('paused', sender);
        } catch (err) {
            logger.error(`[${assistantId}] Error procesando mensaje: ${err.message}`);
            await sock.sendMessage(sender, { text: 'Ocurrió un error al procesar tu mensaje.' });
        }
    });
}

function createBotInstance(assistantId) {
    if (activeBots.has(assistantId)) {
        logger.warn(`El bot para ${assistantId} ya está en proceso.`);
        return;
    }
    logger.info(`Iniciando nueva instancia de bot para el asistente: ${assistantId}`);

    const botState = {
        status: 'loading', // Estado inicial
        qr: null,
        sock: null,
    };
    activeBots.set(assistantId, botState);
    connectToWhatsApp(assistantId).catch(e => logger.error(`[${assistantId}] Fallo al conectar: ${e.message}`));
}

function syncBotsWithFirestore() {
  if (!db) {
    logger.error("⚠️ Firestore no disponible, reintentando en 10s...");
    setTimeout(syncBotsWithFirestore, 10000);
    return;
  }

  db.collectionGroup('assistants').onSnapshot(
    (snapshot) => {
      logger.info(`Sincronizando ${snapshot.size} asistentes desde Firestore...`);
      const firestoreAssistants = new Set(snapshot.docs.map((d) => d.id));
      
      // Iniciar bots para asistentes nuevos o no activos
      for (const id of firestoreAssistants) {
        if (!activeBots.has(id)) {
          createBotInstance(id);
        }
      }
      
      // Detener bots para asistentes eliminados
      for (const id of activeBots.keys()) {
        if (!firestoreAssistants.has(id)) {
          stopBotInstance(id).catch(e => logger.error(`Error deteniendo bot ${id}: ${e.message}`));
        }
      }
    },
    (err) => logger.error("❌ Error escuchando cambios en Firestore:", err)
  );
}

async function stopBotInstance(assistantId) {
  const bot = activeBots.get(assistantId);
  if (!bot) return;

  logger.warn(`Deteniendo bot ${assistantId}...`);
  if (bot.sock) {
    try {
      await bot.sock.logout();
    } catch (e) {
      logger.error(`[${assistantId}] Error durante el logout: ${e.message}`);
    }
  }
  
  const sessionPath = path.join(SESSION_BASE_PATH, assistantId);
  await fsp.rm(sessionPath, { recursive: true, force: true }).catch(e => logger.error(`No se pudo eliminar la carpeta de sesión para ${assistantId}: ${e.message}`));
  
  activeBots.delete(assistantId);
  logger.info(`Bot ${assistantId} detenido y eliminado.`);
}

process.on('unhandledRejection', (r) => logger.error('Unhandled Rejection:', r));
process.on('uncaughtException', (e) => logger.error('Uncaught Exception:', e));
