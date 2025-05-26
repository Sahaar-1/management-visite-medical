const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middleware/authMiddleware');

// Route pour créer une notification
router.post('/', 
  authMiddleware.verifierToken, 
  notificationController.createNotification
);

// Route pour récupérer toutes les notifications
router.get('/', 
  authMiddleware.verifierToken, 
  notificationController.getNotifications
);

// Route pour récupérer les notifications par destinataire
router.get('/destinataire/:role', 
  authMiddleware.verifierToken,
  notificationController.getNotificationsByDestinataire
);

// Route pour marquer une notification comme lue
router.put('/:id/marquer-comme-lu', 
  authMiddleware.verifierToken, 
  notificationController.marquerCommeLu
);

// Route pour supprimer une notification
router.delete('/:id', 
  authMiddleware.verifierToken, 
  notificationController.deleteNotification
);

// Route de test pour créer une notification admin
router.post('/test-admin', 
  authMiddleware.verifierToken, 
  async (req, res) => {
    try {
      const Notification = require('../models/Notification');
      
      const notification = new Notification({
        destinataire: 'admin',
        titre: 'Notification de test',
        message: 'Ceci est une notification de test pour l\'administrateur',
        type: 'SYSTEME',
        dateCreation: new Date()
      });
      
      await notification.save();
      
      res.status(201).json({
        message: 'Notification de test créée avec succès',
        notification
      });
    } catch (error) {
      console.error('Erreur lors de la création de la notification de test:', error);
      res.status(500).json({
        message: 'Erreur lors de la création de la notification de test',
        error: error.message
      });
    }
  }
);

module.exports = router;