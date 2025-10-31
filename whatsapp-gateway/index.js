
import { DisconnectReason, useMultiFileAuthState } from '@whiskeysockets/baileys';
import makeWASocket from '@whiskeysockets/baileys';
import pino from 'pino';
import axios from 'axios';
import fs from 'fs/promises';
import FormData from 'form-data';

// --- CONFIGURACIÓN ---
const NEXTJS_WEBHOOK_URL = 'https://studio--studio-1128284178-7d125.us-central1.hosted.app/api/webhook'; // URL de tu webhook en Next.js
const NEXTJS_QR_URL = 'https://studio--studio-1128284178-7d125.us-central1.hosted.app/api/qr'; // URL para enviar el QR
const SESSION_FILE_PATH = './wa-session';
// --- FIN CONFIGURACIÓN ---

const logger = pino({ level: 'info', transport: { target: 'pino-pretty' } });

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState(SESSION_FILE_PATH);

    const sock = makeWASocket.default({
        auth: state,
        printQRInTerminal: false, // Ya no imprimimos en terminal
        logger,
        browser: ['Hey Manito!', 'Chrome', '1.0.0'] // Agregado para una mejor identificación
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
            const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            logger.error('Conexión cerrada por:', lastDisconnect?.error, ', reconectando:', shouldReconnect);
            if (shouldReconnect) {
                connectToWhatsApp();
            } else {
                 try {
                    // Limpiar el QR en el frontend cuando la sesión se cierra permanentemente
                    await axios.post(NEXTJS_QR_URL, { qr: null });
                    logger.info('QR limpiado en el frontend debido a cierre de sesión.');
                    // Opcional: Eliminar la carpeta de sesión para empezar de cero
                    await fs.rm(SESSION_FILE_PATH, { recursive: true, force: true });
                    logger.info('Carpeta de sesión eliminada.');
                 } catch (error) {
                    logger.error('Error durante la limpieza de cierre de sesión:', error.message);
                 }
            }
        } else if (connection === 'open') {
            logger.info('¡Conexión abierta con WhatsApp!');
             try {
                // Limpiar el QR en el frontend una vez conectado
                await axios.post(NEXTJS_QR_URL, { qr: null });
                logger.info('Conexión exitosa, QR limpiado en el frontend.');
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
        if (!msg.message || msg.key.fromMe) return; // Ignorar mensajes propios

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
                
                formData.append('audio', fs.createReadStream(tempFilePath));
                // No es necesario leer el archivo dos veces, se puede usar un stream
                
                // El archivo temporal se puede eliminar después del envío, pero axios no lo facilita.
                // Lo dejamos para simplicidad, pero en producción se necesitaría un mejor manejo.

            } else if (messageType === 'extendedTextMessage') {
                messageContent = msg.message.extendedTextMessage.text;
                formData.append('message', messageContent);
                logger.info(`Texto (extendido): "${messageContent}"`);
            } else {
                logger.warn(`Tipo de mensaje no soportado: ${messageType}. Se ignorará.`);
                // await sock.sendMessage(sender, { text: `Lo siento, no puedo procesar este tipo de mensaje: ${messageType}` });
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
                    mimetype: 'audio/wav', // La IA responde en WAV
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
connectToWhatsApp().catch(err => logger.error("Error fatal al iniciar:", err));
