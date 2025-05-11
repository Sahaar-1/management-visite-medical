const Notification = require('../models/Notification');

const notificationController = {
  // Créer une notification
  creerNotification: async (employe, medecin, dateVisite, typeInaptitude, observation) => {
    try {
      // Créer une notification pour l'administrateur
      const notification = new Notification({
        titre: `Inaptitude ${typeInaptitude} détectée`,
        message: `L'employé ${employe.nom} ${employe.prenom} a été déclaré INAPTE pour ${typeInaptitude} lors de sa visite médicale du ${new Date(dateVisite).toLocaleDateString('fr-FR')}. Observation: ${observation}`,
        type: 'warning',
        destinataire: employe.utilisateur || employe._id,
        lien: `/employes/${employe._id}`
      });
      
      await notification.save();
      return notification;
    } catch (error) {
      console.error('Erreur lors de la création de la notification:', error);
      throw error;
    }
  },
  
  // Récupérer les notifications de l'utilisateur connecté
  getNotifications: async (req, res) => {
    try {
      const notifications = await Notification.find({ 
        destinataire: req.user._id 
      }).sort({ createdAt: -1 });
      
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ 
        message: 'Erreur lors de la récupération des notifications', 
        error: error.message 
      });
    }
  },

  // Marquer une notification comme lue
  marquerCommeLue: async (req, res) => {
    try {
      const notification = await Notification.findOne({
        _id: req.params.id,
        destinataire: req.user._id
      });

      if (!notification) {
        return res.status(404).json({ 
          message: 'Notification non trouvée' 
        });
      }

      notification.lue = true;
      await notification.save();

      res.json({ 
        message: 'Notification marquée comme lue', 
        notification 
      });
    } catch (error) {
      res.status(500).json({ 
        message: 'Erreur lors de la mise à jour de la notification', 
        error: error.message 
      });
    }
  },

  // Supprimer une notification
  supprimerNotification: async (req, res) => {
    try {
      const notification = await Notification.findOneAndDelete({
        _id: req.params.id,
        destinataire: req.user._id
      });

      if (!notification) {
        return res.status(404).json({ 
          message: 'Notification non trouvée' 
        });
      }

      res.json({ 
        message: 'Notification supprimée avec succès' 
      });
    } catch (error) {
      res.status(500).json({ 
        message: 'Erreur lors de la suppression de la notification', 
        error: error.message 
      });
    }
  }
};

module.exports = notificationController;
