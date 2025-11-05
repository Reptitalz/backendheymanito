# Imagen base ligera con Node.js
FROM node:20

# Establecer directorio de trabajo
WORKDIR /usr/src/app

# Copiar package.json y lockfile primero para cachear dependencias
COPY package.json package-lock.json ./

# Instalar dependencias de producción
RUN npm install --omit=dev

# Copiar el resto del código fuente
COPY . .

# Variables de entorno
ENV NODE_ENV=production
ENV PORT=8080

# Exponer el puerto para Cloud Run
EXPOSE 8080

# Comando para iniciar la aplicación
CMD ["node", "index.js"]
