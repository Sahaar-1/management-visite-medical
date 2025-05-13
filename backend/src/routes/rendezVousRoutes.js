const express = require('express');
const router = express.Router();
const rendezVousController = require('../controllers/rendezVousController');
const authMiddleware = require('../middleware/authMiddleware');

// Routes protégées par authentification et rôle admin
router.use(authMiddleware.verifierToken);
router.use(authMiddleware.verifierRole(['admin']));

// Routes pour les rendez-vous
router.get('/', rendezVousController.getAllRendezVous);
router.post('/', rendezVousController.createRendezVous);
router.get('/employes', rendezVousController.getAllEmployes);
router.get('/:id', rendezVousController.getRendezVousById);
router.put('/:id', rendezVousController.updateRendezVous);
router.delete('/:id', rendezVousController.deleteRendezVous);

module.exports = router;


