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

// === CONFIGURACIÓN ===
const NEXTJS_APP_URL = "https://studio--studio-1128284178-7d125.us-central1.hosted.app";
const NEXTJS_WEBHOOK_URL = `${NEXTJS_APP_URL}/api/webhook`;
const NEXTJS_QR_URL = `${NEXTJS_APP_URL}/api/qr`;
const NEXTJS_STATUS_URL = `${NEXTJS_APP_URL}/api/status`;
const SESSION_FILE_PATH = path.join(os.tmpdir(), 'wa-session');
// =====================

const logger = pino({
  level: 'info',
  transport: { target: 'pino-pretty' }
});

async function updateGatewayStatus(status) {
  try {
    await axios.post(NEXTJS_STATUS_URL, { status });
    logger.info(`Estado del gateway actualizado a: ${status}`);
  } catch (err) {
    logger.error(`Error actualizando estado del gateway (${status}):`, err.message);
  }
}

async function connectToWhatsApp() {
  try {
    const { state, saveCreds } = await useMultiFileAuthState(SESSION_FILE_PATH);

    const sock = makeWASocket.default({
      auth: state,
      printQRInTerminal: false,
      logger,
      browser: ['Hey Manito!', 'Cloud Run', '2.0']
    });

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        logger.info('Nuevo código QR generado');
        await updateGatewayStatus('qr');
        try {
          await axios.post(NEXTJS_QR_URL, { qr });
        } catch (e) {
          logger.error('Error enviando QR:', e.message);
        }
      }

      if (connection === 'close') {
        const reason = (lastDisconnect?.error)?.output?.statusCode;
        const shouldReconnect = reason !== DisconnectReason.loggedOut;
        logger.warn('Conexión cerrada. Motivo:', reason, 'Reconectar:', shouldReconnect);

        await updateGatewayStatus(shouldReconnect ? 'error' : 'disconnected');

        if (shouldReconnect) {
          setTimeout(connectToWhatsApp, 3000); // intenta reconectar
        } else {
          try {
            await axios.post(NEXTJS_QR_URL, { qr: null });
            await fsp.rm(SESSION_FILE_PATH, { recursive: true, force: true });
            logger.info('Sesión eliminada tras logout');
          } catch (e) {
            logger.error('Error limpiando sesión:', e.message);
          }
        }
      } else if (connection === 'open') {
        logger.info('✅ Conectado con WhatsApp');
        await updateGatewayStatus('connected');
        try {
          await axios.post(NEXTJS_QR_URL, { qr: null });
        } catch (e) {
          logger.error('Error limpiando QR:', e.message);
        }
      }
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', async (m) => {
      const msg = m.messages[0];
      if (!msg.message || msg.key.fromMe) return;

      const sender = msg.key.remoteJid;
      logger.info(`📩 Mensaje recibido de ${sender}`);

      try {
        const type = Object.keys(msg.message)[0];
        const formData = new FormData();
        formData.append('from', sender);

        if (type === 'conversation') {
          formData.append('message', msg.message.conversation);
        } else if (type === 'extendedTextMessage') {
          formData.append('message', msg.message.extendedTextMessage.text);
        } else if (type === 'audioMessage') {
          logger.info('Mensaje de audio detectado');
          const audioBuffer = await sock.downloadMediaMessage(msg);
          const tempPath = path.join(os.tmpdir(), `temp_${Date.now()}.ogg`);
          await fsp.writeFile(tempPath, audioBuffer);
          formData.append('audio', fs.createReadStream(tempPath));
        } else {
          logger.warn(`Tipo de mensaje no soportado: ${type}`);
          return;
        }

        await sock.sendPresenceUpdate('composing', sender);

        const response = await axios.post(NEXTJS_WEBHOOK_URL, formData, {
          headers: formData.getHeaders()
        });

        const { replyText, replyAudio } = response.data || {};
        if (replyText) {
          await sock.sendMessage(sender, { text: replyText });
          logger.info(`💬 Enviado: ${replyText}`);
        }

        if (replyAudio) {
          const audioData = Buffer.from(replyAudio.split(';base64,').pop(), 'base64');
          await sock.sendMessage(sender, { audio: audioData, mimetype: 'audio/wav' });
          logger.info('🔊 Audio enviado');
        }

        await sock.sendPresenceUpdate('paused', sender);
      } catch (err) {
        logger.error('Error procesando mensaje:', err.message);
        await sock.sendMessage(sender, { text: 'Ocurrió un error al procesar tu mensaje.' });
      }
    });

    return sock;
  } catch (err) {
    logger.error('❌ Error al iniciar WhatsApp:', err.message);
    await updateGatewayStatus('error');
  }
}

// === Servidor HTTP para Cloud Run ===
const server = http.createServer((req, res) => {
  if (req.url === '/' || req.url === '/_health') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('OK');
  } else {
    res.writeHead(404);
    res.end();
  }
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  logger.info(`🚀 Servidor HTTP listo en el puerto ${PORT}`);
  updateGatewayStatus('disconnected');
  // 🔹 Conecta en segundo plano (no bloquea el arranque)
  connectToWhatsApp();
});

// Evita que el contenedor muera por errores no manejados
process.on('unhandledRejection', (r) => logger.error('Unhandled Rejection:', r));
process.on('uncaughtException', (e) => logger.error('Uncaught Exception:', e));


logger.info('NEXTJS_APP_URL:', process.env.NEXTJS_APP_URL);
