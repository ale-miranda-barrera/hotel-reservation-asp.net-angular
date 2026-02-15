# Etapa 1: Build
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build --configuration=production

# Etapa 2: Servidor Web (Nginx)
FROM nginx:stable-alpine
# Copiamos la configuración de Nginx que creamos antes
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Nota: En Angular 17+ con el nuevo Application Builder, la salida suele estar en /browser
COPY --from=build /app/dist/hotel-reservation-app/browser /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]