
#!/bin/bash

# ==============================================================================
# Script de inicio para la VM del Gateway de HeyManito
# Este script se ejecuta automáticamente al crear la VM.
#
# Tareas que realiza:
# 1. Actualiza el sistema e instala dependencias (Node.js, Git, etc.).
# 2. Configura el entorno para Node.js.
# 3. Clona el repositorio de la aplicación desde GitHub.
# 4. Instala las dependencias del gateway.
# 5. Instala y configura PM2 para mantener el gateway siempre en ejecución.
# 6. Abre el puerto 8080 en el firewall.
# ==============================================================================

# Detener en caso de error
set -e

# --- 1. INSTALACIÓN DE DEPENDENCIAS ---
echo "✅ 1/6 - Actualizando sistema e instalando dependencias..."
apt-get update -y
# Instala curl y gnupg para añadir repositorios, y git para clonar el código
apt-get install -y curl git gnupg

# --- 2. CONFIGURACIÓN DE NODE.JS ---
echo "✅ 2/6 - Configurando Node.js v20..."
# Añade el repositorio oficial de NodeSource para Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# --- 3. CLONAR REPOSITORIO ---
echo "✅ 3/6 - Clonando el repositorio de la aplicación..."
# Ve al directorio home del usuario
cd /home/user
# Clona tu repositorio.
# IMPORTANTE: Asegúrate de que tu repositorio sea público o usa un token para repositorios privados.
git clone https://github.com/Reptitalz/servidormanito.git app
cd app/gateway

# --- 4. INSTALAR DEPENDENCIAS DEL GATEWAY ---
echo "✅ 4/6 - Instalando dependencias del gateway..."
npm install

# --- 5. CONFIGURAR PM2 PARA GESTIÓN DEL PROCESO ---
echo "✅ 5/6 - Instalando y configurando PM2..."
# Instala PM2 globalmente
npm install pm2 -g

# IMPORTANTE: Define aquí el nombre de tu bucket de Google Cloud Storage
export BUCKET_NAME="tu-nombre-de-bucket-aqui"

# Inicia el gateway con PM2, pasando la variable de entorno
pm2 start index.js --name "whatsapp-gateway" -- --
# Configura PM2 para que se inicie automáticamente en los reinicios del sistema
pm2 startup
pm2 save

echo "🚀 El gateway de WhatsApp ha sido iniciado con PM2."

# --- 6. CONFIGURAR FIREWALL ---
echo "✅ 6/6 - Configurando reglas de firewall..."
# Permite el tráfico entrante en el puerto 8080
gcloud compute firewall-rules create allow-http-8080 --allow tcp:8080 --source-ranges 0.0.0.0/0 --target-tags http-server --description "Allow port 8080" || echo "La regla de firewall ya existe o no se pudo crear."

echo "🎉 ¡Configuración de la VM completada!"
