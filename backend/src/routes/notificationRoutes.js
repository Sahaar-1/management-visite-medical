// const express = require('express');
// const router = express.Router();
// const notificationController = require('../controllers/notificationController');
// const authMiddleware = require('../middleware/authMiddleware');

// // Route pour récupérer les notifications de l'utilisateur connecté
// router.get('/', 
//   authMiddleware.verifierToken,
//   notificationController.getNotifications
// // );

// // Route pour marquer une notification comme lue
// router.put('/:id/lire', 
//   authMiddleware.verifierToken,
//   notificationController.marquerCommeLue
// );

// // Route pour supprimer une notification
// router.delete('/:id', 
//   authMiddleware.verifierToken,
//   notificationController.supprimerNotification
// );

// module.exports = router;
