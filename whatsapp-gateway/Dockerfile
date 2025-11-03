# 1. Usa una imagen oficial de Node.js como base
FROM node:20-slim

# 2. Establece el directorio de trabajo
WORKDIR /usr/src/app

# 3. Instala git y ca-certificates (necesario para HTTPS)
RUN apt-get update && \
    apt-get install -y git ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# 4. Copia los archivos de dependencias
COPY package*.json ./

# 5. Instala las dependencias
RUN npm install

# 6. Copia el resto de los archivos
COPY . .

# 7. Expone el puerto
EXPOSE 8080

# 8. Comando de inicio
CMD ["node", "index.js"]
