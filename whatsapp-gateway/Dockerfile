# 1. Usa una imagen base oficial de Node.js (elige una versión LTS)
FROM node:18-slim

# 2. Establece el directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# 3. Copia los archivos de definición de dependencias
# Se copian primero para aprovechar el cache de capas de Docker.
# Si no cambian las dependencias, no se volverá a ejecutar `npm install`.
COPY package*.json ./

# 4. Instala las dependencias del proyecto
# Usamos --only=production para no instalar dependencias de desarrollo (como pino-pretty)
RUN npm install --only=production

# 5. Copia el resto del código de la aplicación
COPY . .

# 6. Expone el puerto en el que correrá la aplicación (Cloud Run usa 8080 por defecto)
EXPOSE 8080

# 7. Define el comando para iniciar la aplicación
CMD [ "node", "index.js" ]
