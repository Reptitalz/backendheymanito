# 1. Base Image
FROM node:20-slim

# 2. Set working directory
WORKDIR /usr/src/app

# 3. Copy package files and install dependencies
COPY package*.json ./
RUN npm install --omit=dev

# 4. Copy application source
COPY . .

# 5. Expose port and define command
EXPOSE 8080
CMD ["node", "index.js"]
