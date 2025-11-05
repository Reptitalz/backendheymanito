
import fs from "fs";
import path from "path";
import os from "os";
import { useMultiFileAuthState } from "@whiskeysockets/baileys";
import { Storage } from "@google-cloud/storage";

const storage = new Storage();
const bucket = storage.bucket(process.env.BUCKET_NAME);

/**
 * Genera las rutas de sesión para un assistantId específico.
 */
const getSessionPaths = (assistantId) => {
    const sessionDir = path.join(os.tmpdir(), "baileys_auth", assistantId);
    const credsFile = path.join(sessionDir, "creds.json");
    const gcsPath = `sessions/${assistantId}/creds.json`;
    return { sessionDir, credsFile, gcsPath };
};


/**
 * Descarga las credenciales desde Cloud Storage (si existen)
 */
async function downloadSession(assistantId) {
  const { sessionDir, credsFile, gcsPath } = getSessionPaths(assistantId);
  try {
    await fs.promises.mkdir(sessionDir, { recursive: true });
    const file = bucket.file(gcsPath);
    const exists = (await file.exists())[0];
    if (exists) {
      await file.download({ destination: credsFile });
      console.log(`✅ Sesión de Baileys para [${assistantId}] descargada desde GCS.`);
    } else {
      console.log(`⚠️ No se encontró sesión previa para [${assistantId}] en GCS.`);
    }
  } catch (err) {
    console.error(`Error al descargar la sesión para [${assistantId}]:`, err);
  }
}

/**
 * Sube las credenciales actualizadas a Cloud Storage
 */
async function uploadSession(assistantId) {
  const { credsFile, gcsPath } = getSessionPaths(assistantId);
  try {
    await bucket.upload(credsFile, {
      destination: gcsPath,
      resumable: false,
      metadata: { cacheControl: "no-cache" },
    });
    console.log(`☁️ Sesión de Baileys para [${assistantId}] subida a GCS.`);
  } catch (err) {
    console.error(`Error al subir la sesión para [${assistantId}]:`, err);
  }
}

/**
 * Elimina los archivos de sesión del directorio temporal y de GCS.
 */
export async function removeSession(assistantId) {
    const { sessionDir, gcsPath } = getSessionPaths(assistantId);
    console.log(`🧹 Limpiando sesión para [${assistantId}]...`);
    try {
        // Eliminar localmente
        await fs.promises.rm(sessionDir, { recursive: true, force: true });
        // Eliminar de GCS
        await bucket.file(gcsPath).delete({ ignoreNotFound: true });
        console.log(`✅ Sesión para [${assistantId}] eliminada localmente y de GCS.`);
    } catch (err) {
        console.error(`Error al eliminar la sesión para [${assistantId}]:`, err);
    }
}


/**
 * Inicializa el estado de autenticación de Baileys con sincronización automática
 */
export async function getBaileysAuthState(assistantId) {
  await downloadSession(assistantId);
  const { sessionDir } = getSessionPaths(assistantId);

  const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

  const wrappedSaveCreds = async () => {
    await saveCreds();
    await uploadSession(assistantId);
  };

  return { state, saveCreds: wrappedSaveCreds };
}
