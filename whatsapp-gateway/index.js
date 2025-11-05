
import express from "express";
import makeWASocket, { useMultiFileAuthState, DisconnectReason } from "@whiskeysockets/baileys";
import pino from "pino";
import fs from "fs";
import fsp from "fs/promises";
import cors from "cors";
import path from "path";
import axios from 'axios';
import FormData from 'form-data';
import os from 'os';

// === CONFIGURACIÓN ===
const NEXTJS_APP_URL = process.env.NEXTJS_APP_URL || "https://heymanito.com";
const NEXTJS_WEBHOOK_URL = `${NEXTJS_APP_URL}/api/webhook`;
const SESSIONS_DIR = path.join(process.cwd(), 'sessions'); // Usar directorio local para persistencia

// Logger principal para nuestros eventos de aplicación
const logger = pino({ level: 'info', transport: { target: 'pino-pretty' } });
// Logger para Baileys, configurado en silent para evitar ruido
const baileysLogger = pino({ level: 'silent' });


const app = express();
app.use(cors()); // Permitir todas las peticiones CORS
app.use(express.json());

const sessions = {}; // guardará las conexiones por ID

async function createSession(assistantId) {
  const sessionPath = path.join(SESSIONS_DIR, assistantId);
  await fsp.mkdir(sessionPath, { recursive: true });

  const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
  const sock = makeWASocket({
    auth: state,
    logger: baileysLogger, // Usar el logger silencioso para Baileys
    printQRInTerminal: false,
    browser: ["HeyManito", "Cloud Run", "3.0"],
  });

  sessions[assistantId] = { sock, qr: null, status: "loading" };

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;
    const session = sessions[assistantId];
    if (!session) return;

    if (qr) {
      session.qr = qr;
      session.status = "qr";
      logger.info(`[${assistantId}] QR disponible para escanear.`);
    }

    if (connection === "open") {
      session.status = "connected";
      session.qr = null; // Una vez conectado, el QR ya no es necesario
      logger.info(`[${assistantId}] Conectado exitosamente.`);
    }

    if (connection === "close") {
      const reason = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = reason !== DisconnectReason.loggedOut;
      
      logger.warn(`[${assistantId}] Conexión cerrada. Razón: ${reason}. Reintentando: ${shouldReconnect}`);
      
      session.status = "disconnected";

      if (reason === DisconnectReason.loggedOut) {
          logger.info(`[${assistantId}] Sesión cerrada por el usuario. Limpiando...`);
          if (fs.existsSync(sessionPath)) {
              await fsp.rm(sessionPath, { recursive: true, force: true });
          }
          delete sessions[assistantId];
      } else if (reason === DisconnectReason.notAllowed) {
            logger.error(`[${assistantId}] Error de sesión irrecuperable (405). Forzando limpieza y reinicio.`);
            if (fs.existsSync(sessionPath)) {
                await fsp.rm(sessionPath, { recursive: true, force: true });
            }
            delete sessions[assistantId];
            // La próxima llamada a /status creará una nueva sesión desde cero.
      } else if (shouldReconnect) {
        // La librería intentará reconectar automáticamente para otros errores (ej. de red)
        logger.info(`[${assistantId}] Se intentará reconectar automáticamente.`);
      }
    }
  });

  sock.ev.on("creds.update", saveCreds);

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


  return sock;
}

// 🔹 Endpoint para obtener el estado
app.get("/status", async (req, res) => {
  const { assistantId } = req.query;
  if (!assistantId) return res.status(400).json({ error: "Falta assistantId" });

  let session = sessions[assistantId];
  if (!session || session.status === 'disconnected') {
    logger.info(`[${assistantId}] No hay sesión activa o está desconectada. Creando una nueva...`);
    try {
        await createSession(assistantId);
        // La sesión se está inicializando. El frontend volverá a preguntar.
        return res.json({ status: "initializing" });
    } catch(e) {
        logger.error(`[${assistantId}] Error al crear sesión:`, e);
        return res.status(500).json({ error: 'No se pudo crear la sesión' });
    }
  }

  res.json({ status: session.status, qr: session.status === 'qr' ? session.qr : null });
});

// Endpoint de salud para Cloud Run
app.get("/", (req, res) => {
    res.status(200).send("Hey Manito! Gateway - OK");
});
app.get("/_health", (req, res) => {
    res.status(200).send("OK");
});


const PORT = process.env.PORT || 8080;
app.listen(PORT, () => logger.info(`🚀 Servidor corriendo en puerto ${PORT}`));
