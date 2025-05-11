FROM node:16-alpine

# Créer le répertoire de l'application
WORKDIR /usr/src/app

# Copier package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier les fichiers sources
COPY . .

# Exposer le port
EXPOSE 5000

# Commande de démarrage
CMD ["npm", "start"]
