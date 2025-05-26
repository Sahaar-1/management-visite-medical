// Routes pour les consultations
const express = require('express');
const router = express.Router();
const consultationController = require('../controllers/consultationController');
const authMiddleware = require('../middleware/authMiddleware');

// Routes protégées nécessitant une authentification
router.use(authMiddleware.verifierToken);

// Routes spécifiques AVANT les routes avec paramètres
// Marquer les consultations comme envoyées à l'admin
router.post('/marquer-envoyees',
  authMiddleware.verifierRole(['medecin']),
  consultationController.marquerConsultationsEnvoyees
);

// Route pour récupérer les consultations à envoyer à l'admin
router.get('/a-envoyer',
  authMiddleware.verifierRole(['medecin']),
  consultationController.getConsultationsAEnvoyer
);

// Route pour envoyer les consultations à l'admin
router.post('/envoyer-admin',
  authMiddleware.verifierRole(['medecin']),
  consultationController.envoyerConsultationsAdmin
);

// Route pour récupérer l'historique des consultations d'un médecin
router.get('/medecin/:medecinId/historique',
  authMiddleware.verifierRole(['medecin']),
  consultationController.getHistoriqueConsultationsMedecin
);

// Créer une nouvelle consultation (médecin uniquement)
router.post('/',
  authMiddleware.verifierRole(['medecin']),
  consultationController.createConsultation
);

// Obtenir les consultations par statut et date
router.get('/',
  authMiddleware.verifierRole(['medecin', 'admin']),
  consultationController.getConsultationsByStatusAndDate
);

// Route pour récupérer une consultation par son ID - DOIT ÊTRE EN DERNIER
router.get('/:id', consultationController.getConsultationById);

module.exports = router;