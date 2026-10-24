# Etapa 1: Construcción
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Argumento para inyectar la URL del backend al compilar con Vite (opcional)
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

# Etapa 2: Servidor Web Nginx
FROM nginx:alpine

# Variables de entorno por defecto para Railway y Nginx
ENV PORT=80
ENV BACKEND_URL=https://backendidi-production.up.railway.app
ENV BACKEND_HOST=backendidi-production.up.railway.app
ENV NGINX_ENVSUBST_FILTER="PORT BACKEND_URL BACKEND_HOST"

# Copiar plantilla para envsubst dinámico en Railway
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar estáticos compilados
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
