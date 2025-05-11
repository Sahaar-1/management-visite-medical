// const express = require('express');
// const router = express.Router();
// const serviceController = require('../controllers/serviceController');
// const authMiddleware = require('../middleware/authMiddleware');

// // Route pour ajouter un service (réservée à l'admin)
// router.post('/', 
//   authMiddleware.verifierToken,
//   authMiddleware.verifierRole(['admin']),
//   serviceController.ajouterService
// );

// // Route pour lister les services
// router.get('/', 
//   authMiddleware.verifierToken,
//   serviceController.listerServices
// );

// // Route pour obtenir un service par son ID
// router.get('/:id', 
//   authMiddleware.verifierToken,
//   serviceController.getServiceById
// );

// // Route pour mettre à jour un service (réservée à l'admin)
// router.put('/:id', 
//   authMiddleware.verifierToken,
//   authMiddleware.verifierRole(['admin']),
//   serviceController.mettreAJourService
// );

// // Route pour supprimer un service (réservée à l'admin)
// router.delete('/:id', 
//   authMiddleware.verifierToken,
//   authMiddleware.verifierRole(['admin']),
//   serviceController.supprimerService
// );

// module.exports = router;
