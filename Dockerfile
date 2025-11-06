# Imagen base completa de Node.js para asegurar que todas las librerías del sistema estén presentes
FROM node:20

# Establecer directorio de trabajo
WORKDIR /usr/src/app

# Copiar package.json y el lockfile para asegurar builds predecibles
COPY package.json package-lock.json* ./

# Instalar TODAS las dependencias. En este enfoque unificado, no podemos separar dev y prod fácilmente.
# Para Cloud Run, esto es aceptable.
RUN npm install

# Copiar el resto del código fuente (incluyendo el gateway.js y el código de Next.js)
COPY . .

# Comando para iniciar SOLAMENTE el gateway
CMD ["node", "gateway.js"]
