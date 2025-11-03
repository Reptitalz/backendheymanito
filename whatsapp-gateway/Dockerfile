# 1. Usa una imagen base de Node.js
FROM node:20-slim

# 2. Establece el directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# 3. Copia los archivos de definición de dependencias
COPY whatsapp-gateway/package*.json ./

# 4. Instala las dependencias del gateway
RUN npm install

# 5. Copia el código fuente del gateway al contenedor
COPY whatsapp-gateway/index.js .

# 6. Expone el puerto en el que escuchará el servicio
# Cloud Run proporcionará el valor de PORT a través de una variable de entorno.
EXPOSE 8080

# 7. El comando para iniciar el gateway cuando el contenedor se inicie
CMD [ "node", "index.js" ]
