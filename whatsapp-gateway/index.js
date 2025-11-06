import express from "express";
import makeWASocket, { useMultiFileAuthState } from "@whiskeysockets/baileys";
import qrcode from "qrcode";
import fs from "fs/promises";
import path from "path";
import { GoogleGenerativeAI } from "@google/generative-ai";

const app = express();
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const sessionPath = path.join(process.cwd(), "session");

let latestQR = null;

// Inicializa Baileys y gestiona la sesión
const startBot = async () => {
  const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
  });

  sock.ev.on("connection.update", async (update) => {
    const { connection, qr } = update;
    if (qr) latestQR = await qrcode.toDataURL(qr);
    if (connection === "open") console.log("✅ WhatsApp conectado!");
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      "";

    if (!text.trim()) return;

    console.log(`💬 Mensaje recibido: ${text}`);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent(text);
      const reply = result.response.text();

      await sock.sendMessage(msg.key.remoteJid, { text: reply });
    } catch (err) {
      console.error("Error con Gemini:", err);
      await sock.sendMessage(msg.key.remoteJid, {
        text: "⚠️ Ocurrió un error al procesar tu mensaje.",
      });
    }
  });
};

// Endpoint para obtener el QR (para mostrarlo en tu frontend)
app.get("/qr", (req, res) => {
  if (!latestQR) return res.status(404).send("QR no generado aún");
  res.send(`<img src="${latestQR}" style="width:300px;height:300px"/>`);
});

app.listen(process.env.PORT || 8080, () => {
  console.log("🚀 Gateway activo en puerto 8080");
  startBot();
});
