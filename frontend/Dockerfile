# Etapa 1: Build de React con Node
FROM node:20-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Etapa 2: Servir con Nginx
FROM nginx:alpine

# Copiar build de React
COPY --from=build /app/dist /usr/share/nginx/html

# Copiar configuración de Nginx
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
