const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Route d'inscription (nécessite une authentification admin)
router.post('/inscription', 
  authMiddleware.verifierToken,
  authMiddleware.verifierRole(['admin']),
  authController.inscrire);

// Route de connexion
router.post('/connexion', authController.connecter);

// Route pour obtenir le profil (nécessite une authentification)
router.get('/profil', 
  authMiddleware.verifierToken, 
  authController.getProfil
);

// Route pour mettre à jour le profil (nécessite une authentification)
router.put('/profil', 
  authMiddleware.verifierToken, 
  authController.mettreAJourProfil
);

// Route pour obtenir la liste des médecins (nécessite une authentification admin)
router.get('/medecins', 
  authMiddleware.verifierToken,  authMiddleware.verifierRole(['admin']), 
  authController.getMedecins
);

// Route pour obtenir les dernières connexions des médecins
router.get('/medecins/connexions',
  authMiddleware.verifierToken,
  authMiddleware.verifierRole(['admin']),
  authController.getMedecinConnexions
);

// Routes pour la gestion des médecins (admin uniquement)
router.put('/medecins/:id', authMiddleware.verifierToken, authMiddleware.verifierRole(['admin']), authController.mettreAJourMedecin);
router.delete('/medecins/:id', authMiddleware.verifierToken, authMiddleware.verifierRole(['admin']), authController.supprimerMedecin);
router.post('/medecins/:id/reset-password', authMiddleware.verifierToken, authMiddleware.verifierRole(['admin']), authController.reinitialiserMotDePasse);
module.exports = router;

