
# 1. Usa una imagen base oficial de Node.js (versión 20)
FROM node:20

# 2. Instala dependencias del sistema operativo (git es necesario para Baileys)
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

# 3. Establece el directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# 4. Copia los archivos de definición de dependencias
COPY package*.json ./

# 5. Instala las dependencias de producción
# --omit=dev asegura que solo se instalen las dependencias necesarias para correr
RUN npm install --omit=dev

# 6. Copia el resto del código de la aplicación al directorio de trabajo
COPY . .

# 7. Expone el puerto en el que correrá la aplicación
EXPOSE 8080

# 8. Define el comando para iniciar la aplicación cuando el contenedor arranque
CMD ["node", "index.js"]
