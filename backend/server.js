const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { createDefaultAdmin } = require('./src/config/initDB');
const rendezVousRoutes = require('./src/routes/rendezVousRoutes');

// Charger les variables d'environnement
dotenv.config();

// Initialiser l'application Express
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Middleware pour empêcher la mise en cache des pages authentifiées
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('Connecté à MongoDB');
  // Créer le compte admin par défaut
  await createDefaultAdmin();
})
.catch((err) => console.error('Erreur de connexion à MongoDB:', err));

// Ajouter la pagination à Mongoose
const mongoosePaginate = require('mongoose-paginate-v2');
mongoose.plugin(mongoosePaginate);

// Routes
const authRoutes = require('./src/routes/authRoutes');
const employeRoutes = require('./src/routes/employeRoutes'); // Ensure this is included
// Commenté pour se concentrer uniquement sur l'authentification
// const employeRoutes = require('./src/routes/employeRoutes');
// const serviceRoutes = require('./src/routes/serviceRoutes');

// Route racine de l'API
app.get('/api', (req, res) => {
  res.json({ message: 'API Gestion des Visites Médicales' });
});

// Routes de l'API avec préfixe /api
app.use('/api/auth', authRoutes);
// Commenté pour se concentrer uniquement sur l'authentification
app.use('/api', employeRoutes);
// app.use('/api/services', serviceRoutes);
// app.use('/api/notifications', require('./src/routes/notificationRoutes'));
app.use('/api/rendez-vous', rendezVousRoutes);
// Middleware pour gérer CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Gestion des erreurs 404
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route non trouvée' });
});

// Gestionnaire d'erreurs global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Une erreur serveur est survenue', 
    error: process.env.NODE_ENV === 'production' ? {} : err.message 
  });
});

// Démarrer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
