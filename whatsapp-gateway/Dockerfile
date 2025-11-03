# 1. Base oficial de Node.js (slim para que sea liviana)
FROM node:20-slim

# 2. Directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# 3. Instalar git y certificados (necesarios para npm con repositorios Git)
RUN apt-get update && \
    apt-get install -y git ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# 4. Copiar package.json y package-lock.json (si existe) primero para cachear npm install
COPY package*.json ./

# 5. Instalar dependencias de producción (más rápido y liviano)
RUN npm ci --omit=dev

# 6. Copiar el resto de la aplicación
COPY . .

# 7. Puerto que usará la app en Cloud Run
EXPOSE 8080

# 8. Comando para iniciar la aplicación
CMD ["node", "index.js"]
