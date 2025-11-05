# Imagen base completa con Node.js
FROM node:20

# Instalar git (necesario para dependencias npm con repositorios)
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

# Establecer directorio de trabajo
WORKDIR /usr/src/app

# Copiar package.json y lockfile primero
COPY package*.json ./

# Instalar dependencias de producción
RUN npm install --omit=dev

# Copiar el resto del código fuente
COPY . .

# Variables de entorno
ENV NODE_ENV=production
ENV PORT=8080
ENV NEXTJS_APP_URL=https://studio--studio-1128284178-7d125.us-central1.hosted.app

# Exponer el puerto para Cloud Run
EXPOSE 8080

# Comando para iniciar la aplicación
CMD ["node", "index.js"]
