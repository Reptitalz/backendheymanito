# 1. Usa una imagen base de Node.js ligera y específica
FROM node:18-slim

# 2. Establece el directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# 3. Copia los archivos de definición de dependencias
# Se copian primero para aprovechar el caché de capas de Docker.
# Si package.json no cambia, no se reinstalan las dependencias.
COPY package*.json ./

# 4. Instala las dependencias del proyecto, incluyendo las de producción
RUN npm install

# 5. Copia el resto del código de la aplicación
COPY . .

# 6. Expone el puerto en el que la aplicación se ejecutará
# Cloud Run inyectará la variable de entorno PORT, por defecto es 8080.
EXPOSE 8080

# 7. Define el comando para iniciar la aplicación
CMD [ "npm", "start" ]
