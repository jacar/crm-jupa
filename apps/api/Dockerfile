FROM node:20-alpine AS builder

# Instalar dependencias del sistema necesarias para Puppeteer/WhatsApp
RUN apk add --no-cache \
      chromium \
      nss \
      freetype \
      harfbuzz \
      ca-certificates \
      ttf-freefont

WORKDIR /app

# Copiar dependencias de workspace
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY apps/web/package*.json ./apps/web/

# Instalar dependencias
RUN npm install

# Copiar cdigo fuente
COPY . .

# Generar Prisma
RUN cd apps/api && npx prisma generate

# Construir API
RUN npm run build --workspace=@crm/api

EXPOSE 4000
CMD [ "npm", "run", "start:prod", "--workspace=@crm/api" ]
