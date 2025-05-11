FROM node:16-alpine

# Créer le répertoire de l'application
WORKDIR /usr/src/app

# Copier package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier les fichiers sources
COPY . .

# Construire l'application
RUN npm run build

# Installer un serveur statique
RUN npm install -g serve

# Exposer le port
EXPOSE 3000

# Commande de démarrage
CMD ["serve", "-s", "build", "-l", "3000"]
