FROM node:18-alpine as build

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm ci

# Copier le code source
COPY . .

# Build de l'application React
RUN npm run build

# Image de production avec nginx
FROM nginx:alpine

# Copier les fichiers buildés vers nginx
COPY --from=build /app/build /usr/share/nginx/html

# Copier la configuration nginx personnalisée
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exposer le port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]