
import { DisconnectReason, useMultiFileAuthState } from '@whiskeysockets/baileys';
import makeWASocket from '@whiskeysockets/baileys';
import pino from 'pino';
import axios from 'axios';
import fs from 'fs/promises';
import FormData from 'form-data';
import os from 'os';
import path from 'path';

// --- CONFIGURACIÓN ---
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';
const NEXTJS_WEBHOOK_URL = `${BASE_URL}/api/webhook`;
const NEXTJS_QR_URL = `${BASE_URL}/api/qr`;
const NEXTJS_STATUS_URL = `${BASE_URL}/api/status`;
const SESSION_FILE_PATH = path.join(os.tmpdir(), 'wa-session');
// --- FIN CONFIGURACIÓN ---

// Configuración de Pino para evitar conflictos.
const logger = pino({
    level: 'info',
    transport: {
        target: 'pino-pretty'
    }
});


async function updateGatewayStatus(status: 'connected' | 'disconnected' | 'qr' | 'error') {
    try {
        await axios.post(NEXTJS_STATUS_URL, { status });
        logger.info(`Estado del gateway actualizado a: ${status}`);
    } catch (error: any) {
        logger.error(`Error actualizando el estado del gateway a ${status}:`, error.message);
    }
}

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState(SESSION_FILE_PATH);

    const sock = makeWASocket.default({
        auth: state,
        printQRInTerminal: false,
        logger,
        browser: ['Hey Manito!', 'Chrome', '1.0.0']
    });

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            logger.info('Nuevo código QR generado. Enviando al frontend...');
            await updateGatewayStatus('qr');
            try {
                await axios.post(NEXTJS_QR_URL, { qr });
                logger.info('Código QR enviado al frontend exitosamente.');
            } catch (error: any) {
                logger.error('Error enviando el código QR al frontend:', error.message);
            }
        }

        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error as any)?.output?.statusCode !== DisconnectReason.loggedOut;
            logger.error('Conexión cerrada por:', lastDisconnect?.error, ', reconectando:', shouldReconnect);
            
            await updateGatewayStatus(shouldReconnect ? 'error' : 'disconnected');

            if (shouldReconnect) {
                connectToWhatsApp();
            } else {
                 try {
                    await axios.post(NEXTJS_QR_URL, { qr: null });
                    logger.info('QR limpiado en el frontend debido a cierre de sesión.');
                    await fs.rm(SESSION_FILE_PATH, { recursive: true, force: true });
                    logger.info('Carpeta de sesión eliminada.');
                 } catch (error: any) {
                    logger.error('Error durante la limpieza de cierre de sesión:', error.message);
                 }
            }
        } else if (connection === 'open') {
            logger.info('¡Conexión abierta con WhatsApp!');
            await updateGatewayStatus('connected');
             try {
                await axios.post(NEXTJS_QR_URL, { qr: null });
                logger.info('Conexión exitosa, QR limpiado en el frontend.');
            } catch (error: any) {
                logger.error('Error limpiando el QR en el frontend:', error.message);
            }
        }
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const sender = msg.key.remoteJid;
        logger.info(`Mensaje recibido de: ${sender}`);

        try {
            const messageType = Object.keys(msg.message)[0];
            const formData = new FormData();
            formData.append('from', sender);

            let messageContent = '';

            if (messageType === 'conversation') {
                messageContent = msg.message.conversation;
                formData.append('message', messageContent);
                logger.info(`Texto: "${messageContent}"`);

            } else if (messageType === 'audioMessage') {
                logger.info('Mensaje de audio detectado. Descargando...');
                const audioBuffer = await sock.downloadMediaMessage(msg);
                
                const tempFilePath = path.join(os.tmpdir(), `temp_${Date.now()}.ogg`);
                await fs.writeFile(tempFilePath, audioBuffer);
                
                formData.append('audio', fs.createReadStream(tempFilePath));
                
            } else if (messageType === 'extendedTextMessage') {
                messageContent = msg.message.extendedTextMessage.text;
                formData.append('message', messageContent);
                logger.info(`Texto (extendido): "${messageContent}"`);
            } else {
                logger.warn(`Tipo de mensaje no soportado: ${messageType}. Se ignorará.`);
                return;
            }

            await sock.sendPresenceUpdate('composing', sender);

            logger.info('Enviando datos al webhook de Next.js...');
            const response = await axios.post(NEXTJS_WEBHOOK_URL, formData, {
                headers: formData.getHeaders(),
            });

            const { replyText, replyAudio } = response.data;
            
            logger.info(`Respuesta de la IA: "${replyText}"`);

            await sock.sendMessage(sender, { text: replyText });

            if (replyAudio) {
                logger.info('Enviando respuesta de audio...');
                const audioData = Buffer.from(replyAudio.split(';base64,').pop(), 'base64');
                await sock.sendMessage(sender, {
                    audio: audioData,
                    mimetype: 'audio/wav',
                });
            }

             await sock.sendPresenceUpdate('paused', sender);

        } catch (error: any) {
            logger.error('Error procesando el mensaje:', error.response?.data || error.message);
            await sock.sendMessage(sender, { text: 'Lo siento, ocurrió un error al procesar tu solicitud.' });
        }
    });

    return sock;
}

updateGatewayStatus('disconnected');
connectToWhatsApp().catch(err => {
    logger.error("Error fatal al iniciar:", err)
    updateGatewayStatus('error');
});
