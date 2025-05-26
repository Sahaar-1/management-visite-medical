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

// Route pour récupérer les employés avec rendez-vous du jour - PLACÉE AVANT /:id
router.get('/jour', verifierToken, rendezVousController.getRendezVousJour);

// Route pour récupérer les rendez-vous d'un médecin par date - PLACÉE AVANT /:id
router.get('/medecin/:medecinId', verifierToken, verifierRole(['medecin']), rendezVousController.getRendezVousMedecinParDate);

// Routes avec paramètres - APRÈS les routes spécifiques
router.get('/:id', rendezVousController.getRendezVousById);
router.put('/:id', rendezVousController.updateRendezVous);
router.delete('/:id', rendezVousController.deleteRendezVous);

module.exports = router;