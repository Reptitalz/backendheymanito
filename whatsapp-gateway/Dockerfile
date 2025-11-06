# 1. Usar una imagen base de Node.js completa para evitar problemas de dependencias
FROM node:20

# Instalar dependencias del sistema operativo necesarias para Baileys (ej. git)
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

# Establecer el directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# Copiar los archivos de definición de dependencias
COPY package*.json ./

# Instalar las dependencias del proyecto (solo producción)
RUN npm install --omit=dev

# Copiar el resto del código
COPY . .

# Variables de entorno
ENV NODE_ENV=production
ENV PORT=8080

# Exponer el puerto en el que se ejecutará la aplicación
EXPOSE 8080

# Comando para iniciar la aplicación cuando el contenedor arranque
CMD [ "npm", "start" ]
