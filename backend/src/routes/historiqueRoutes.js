const express = require('express');
const router = express.Router();
const historiqueController = require('../controllers/historiqueController');
const authMiddleware = require('../middleware/authMiddleware');

// Protéger toutes les routes avec l'authentification
router.use(authMiddleware.verifierToken);

// Route principale pour récupérer l'historique - s'assurer qu'elle est bien définie
router.get('/', 
  authMiddleware.verifierRole(['admin', 'medecin']), 
  historiqueController.getHistorique
);

// Récupérer l'historique d'un employé spécifique
router.get('/employe/:id', 
  authMiddleware.verifierRole(['admin', 'medecin']), 
  historiqueController.getHistoriqueEmploye
);

module.exports = router;