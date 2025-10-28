
import { DisconnectReason, useMultiFileAuthState } from '@whiskeysockets/baileys';
import makeWASocket from '@whiskeysockets/baileys/WAConnection';
import pino from 'pino';
import axios from 'axios';
import fs from 'fs/promises';
import FormData from 'form-data';
import { fileTypeFromBuffer } from 'file-type';


// --- CONFIGURACIÓN ---
const NEXTJS_WEBHOOK_URL = 'http://localhost:3000/api/webhook'; // URL de tu webhook en Next.js
const NEXTJS_QR_URL = 'http://localhost:3000/api/qr'; // URL para enviar el QR
const SESSION_FILE_PATH = './wa-session';
// --- FIN CONFIGURACIÓN ---

const logger = pino({ level: 'info', transport: { target: 'pino-pretty' } });

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState(SESSION_FILE_PATH);

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false, // Ya no imprimimos en terminal
        logger,
    });

    // Manejo de la conexión
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            logger.info('Nuevo código QR generado. Enviando al frontend...');
            try {
                // Enviar QR al frontend
                await axios.post(NEXTJS_QR_URL, { qr });
                logger.info('Código QR enviado al frontend exitosamente.');
            } catch (error) {
                logger.error('Error enviando el código QR al frontend:', error.message);
            }
        }

        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            logger.error('Conexión cerrada por:', lastDisconnect.error, ', reconectando:', shouldReconnect);
            if (shouldReconnect) {
                connectToWhatsApp();
            } else {
                 try {
                    // Limpiar el QR en el frontend cuando la sesión se cierra permanentemente
                    await axios.post(NEXTJS_QR_URL, { qr: null });
                } catch (error) {
                    logger.error('Error limpiando el QR en el frontend:', error.message);
                }
            }
        } else if (connection === 'open') {
            logger.info('¡Conexión abierta con WhatsApp!');
             try {
                // Limpiar el QR en el frontend una vez conectado
                await axios.post(NEXTJS_QR_URL, { qr: null });
            } catch (error) {
                logger.error('Error limpiando el QR en el frontend:', error.message);
            }
        }
    });

    // Guardar credenciales
    sock.ev.on('creds.update', saveCreds);

    // Escuchar mensajes entrantes
    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message) return;

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
                
                // Guardar temporalmente para enviar
                const tempFilePath = `temp_${Date.now()}.ogg`;
                await fs.writeFile(tempFilePath, audioBuffer);
                
                formData.append('audio', await fs.readFile(tempFilePath), {
                    filename: 'audio.ogg',
                    contentType: 'audio/ogg',
                });
                
                await fs.unlink(tempFilePath); // Limpiar archivo temporal

            } else {
                logger.warn(`Tipo de mensaje no soportado: ${messageType}`);
                return;
            }

            await sock.sendPresenceUpdate('composing', sender);

            // Enviar al webhook de Next.js
            logger.info('Enviando datos al webhook de Next.js...');
            const response = await axios.post(NEXTJS_WEBHOOK_URL, formData, {
                headers: formData.getHeaders(),
            });

            const { replyText, replyAudio } = response.data;
            
            logger.info(`Respuesta de la IA: "${replyText}"`);

            // Enviar respuesta de texto
            await sock.sendMessage(sender, { text: replyText });

            // Enviar respuesta de audio si existe
            if (replyAudio) {
                logger.info('Enviando respuesta de audio...');
                const audioData = Buffer.from(replyAudio.split(';base64,').pop(), 'base64');
                await sock.sendMessage(sender, {
                    audio: audioData,
                    mimetype: 'audio/wav',
                });
            }

             await sock.sendPresenceUpdate('paused', sender);

        } catch (error) {
            logger.error('Error procesando el mensaje:', error.response?.data || error.message);
            await sock.sendMessage(sender, { text: 'Lo siento, ocurrió un error al procesar tu solicitud.' });
        }
    });

    return sock;
}

// Iniciar la conexión
connectToWhatsApp();
