import express from "express";
import makeWASocket, { useMultiFileAuthState, DisconnectReason } from "@whiskeysockets/baileys";
import qrcode from "qrcode";
import fs from "fs/promises";
import path from "path";

const app = express();
app.use(express.json());

const sessionPath = path.join(process.cwd(), "session");

let latestQR = null;
let connectionStatus = 'initializing'; // 'initializing', 'qr', 'connected', 'disconnected'

// Función para limpiar la sesión
const clearSession = async () => {
  try {
    await fs.rm(sessionPath, { recursive: true, force: true });
    console.log("Sesión local eliminada.");
  } catch (error) {
    console.error("Error al limpiar la sesión:", error);
  }
};


// Inicializa Baileys y gestiona la sesión
const startBot = async () => {
  connectionStatus = 'initializing';
  latestQR = null;

  const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true, // Útil para debug en la terminal
    browser: ['HeyManito VM', 'Chrome', '1.0.0'],
  });

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;
    
    if (qr) {
      console.log("Nuevo QR recibido, actualizando...");
      latestQR = qr;
      connectionStatus = 'qr';
    }
    
    if (connection === "open") {
      connectionStatus = 'connected';
      latestQR = null; // Limpiamos el QR una vez conectados
      console.log("✅ WhatsApp conectado!");
    }
    
    if (connection === "close") {
      const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log(`Conexión cerrada. Causa: ${lastDisconnect?.error}, reconectando: ${shouldReconnect}`);
      connectionStatus = 'disconnected';

      if (shouldReconnect) {
        startBot();
      } else {
        console.log("Desconexión permanente. Se requiere nuevo escaneo de QR.");
        // Si la sesión se cierra (logout), limpiamos los archivos para forzar un nuevo QR
        await clearSession();
        // Opcional: reiniciar el bot para que genere un nuevo QR inmediatamente
        startBot();
      }
    }
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    // Aquí irá tu lógica de manejo de mensajes en el futuro
    console.log(`💬 Mensaje recibido de ${msg.key.remoteJid}`);
    await sock.sendMessage(msg.key.remoteJid, { text: 'Hola desde el gateway en la VM!' });
  });
};

// Endpoint para obtener el estado y el QR
app.get("/status", (req, res) => {
  res.status(200).json({ status: connectionStatus, qr: latestQR });
});

// Endpoint de salud para verificaciones
app.get("/_health", (req, res) => res.status(200).send("OK"));
app.get("/", (req, res) => res.status(200).send("🚀 Gateway activo"));


app.listen(process.env.PORT || 8080, () => {
  console.log("🚀 Gateway activo en puerto 8080");
  startBot();
});
