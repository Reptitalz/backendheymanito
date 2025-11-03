# 1. Usa una imagen oficial de Node.js como base
FROM node:20-slim

# 2. Establece el directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# 3. Instala git, que es necesario para algunas dependencias de npm
RUN apt-get update && apt-get install -y git

# 4. Copia los archivos de definición de dependencias
COPY package*.json ./

# 5. Instala las dependencias del proyecto
RUN npm install

# 6. Copia el resto de los archivos de la aplicación
COPY . .

# 7. Expone el puerto que usará la aplicación
EXPOSE 8080

# 8. El comando para iniciar la aplicación cuando el contenedor se inicie
CMD [ "node", "index.js" ]
