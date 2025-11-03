# 1. Base oficial de Node.js con Git incluido
FROM node:20

# 2. Directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# 3. Copiar package.json y package-lock.json primero
COPY package*.json ./

# 4. Instalar dependencias de producción
RUN npm ci --omit=dev

# 5. Copiar el resto de la aplicación
COPY . .

# 6. Puerto que usará la app en Cloud Run
EXPOSE 8080

# 7. Comando para iniciar la aplicación
CMD ["node", "index.js"]
