FROM node:20-alpine AS builder

WORKDIR /app

# Copiar dependencias de workspace
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY apps/web/package*.json ./apps/web/

RUN npm install

# Copiar cdigo fuente
COPY . .

# Construir Web
RUN npm run build --workspace=@crm/web

EXPOSE 3000
CMD [ "npm", "run", "start", "--workspace=@crm/web" ]
