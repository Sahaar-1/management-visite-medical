const express = require('express');
const router = express.Router();
const visiteController = require('../controllers/visiteController');
const authMiddleware = require('../middleware/authMiddleware');

// Route pour récupérer les employés (accessible par admin et medecin)
router.get('/employes', 
  authMiddleware.verifierToken,
  authMiddleware.autoriserRoles('admin', 'medecin'),
  visiteController.getEmployesPourMedecin
);

// Route pour récupérer les statistiques des visites médicales
router.get('/statistiques', 
  authMiddleware.verifierToken,
  authMiddleware.autoriserRoles('admin'),
  visiteController.getStatistiquesVisites
);

// Route pour mettre à jour la visite médicale (accessible uniquement par admin)
router.put('/employes/:id', 
  authMiddleware.verifierToken,
  authMiddleware.autoriserRoles('admin'),
  visiteController.updateVisiteMedicale
);

module.exports = router;
