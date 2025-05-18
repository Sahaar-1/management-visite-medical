const express = require('express');
const router = express.Router();
const rendezVousController = require('../controllers/rendezVousController');
const { verifierToken, verifierRole } = require('../middleware/authMiddleware');

// Routes existantes
router.get('/', rendezVousController.getAllRendezVous);
router.post('/', rendezVousController.createRendezVous);
router.get('/employes', rendezVousController.getAllEmployes);

// Nouvelle route pour les statistiques - PLACÉE AVANT /:id
router.get('/statistiques', verifierToken, verifierRole(['admin']), rendezVousController.getRendezVousStats);

// Routes avec paramètres - APRÈS les routes spécifiques
router.get('/:id', rendezVousController.getRendezVousById);
router.put('/:id', rendezVousController.updateRendezVous);
router.delete('/:id', rendezVousController.deleteRendezVous);

module.exports = router;


