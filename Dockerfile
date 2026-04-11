# ==========================================
# Etapa 1: Compilación (Build Stage)
# ==========================================
# Usamos una imagen ligera de Node.js basada en Alpine Linux
FROM node:20-alpine as build-stage

WORKDIR /app

COPY package*.json ./

RUN npm install

# Coppiamos el resto del código del proyecto
COPY . .

RUN npm run build

# ==========================================
# Etapa 2: Producción (Production Stage)
# ==========================================
# Usamos Nginx para servir los archivos estáticos a alta velocidad
FROM nginx:stable-alpine as production-stage

# Copiamos la carpeta compilada de la Etapa 1 a la carpeta pública de Nginx
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Exponemos el puerto 80 hacia el exterior
EXPOSE 80

# Arrancamos Nginx
CMD ["nginx", "-g", "daemon off;"]