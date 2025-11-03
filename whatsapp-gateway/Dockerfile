# 1. Usar una imagen base de Node.js ligera
FROM node:20-slim

# 2. Establecer el directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# 3. Copiar los archivos de definición de dependencias
# ¡Corregido! No se necesita el prefijo 'whatsapp-gateway/' aquí.
COPY package*.json ./

# 4. Instalar las dependencias del proyecto
RUN npm install

# 5. Copiar el resto del código de la aplicación
# ¡Corregido! No se necesita el prefijo 'whatsapp-gateway/' aquí.
COPY . .

# 6. Exponer el puerto en el que la aplicación se ejecutará (el mismo que en index.js)
EXPOSE 8080

# 7. El comando para iniciar la aplicación cuando el contenedor se inicie
CMD [ "node", "index.js" ]
