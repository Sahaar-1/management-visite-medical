const express = require('express');
const router = express.Router();
const employeController = require('../controllers/employeController');
const authMiddleware = require('../middleware/authMiddleware');

// Route pour ajouter un employé (réservée à l'admin)
router.post('/', 
  authMiddleware.verifierToken,
  authMiddleware.autoriserRoles('admin'),
  employeController.ajouterEmploye
);

// Route pour importer des employés en masse (réservée à l'admin)
router.post('/importer', 
  authMiddleware.verifierToken,
  authMiddleware.autoriserRoles('admin'),
  employeController.importerEmployes
);

// Route pour lister les employés (admin et médecin)
router.get('/', 
  authMiddleware.verifierToken,
  authMiddleware.autoriserRoles('admin', 'medecin'),
  employeController.listerEmployes
);

// Route pour obtenir les statistiques (réservée à l'admin)
router.get('/statistiques', 
  authMiddleware.verifierToken,
  authMiddleware.autoriserRoles('admin'),
  employeController.statistiques
);

module.exports = router;
