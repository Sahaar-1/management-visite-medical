const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  destinataire: {
    type: String,
    enum: ['admin', 'medecin', 'employe'],
    required: true
  },
  titre: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['CONSULTATION', 'RENDEZ_VOUS', 'SYSTEME', 'AUTRE'],
    required: true
  },
  lu: {
    type: Boolean,
    default: false
  },
  dateCreation: {
    type: Date,
    default: Date.now
  },
  employe: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employe',
    required: false
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    required: false
  },
  archived: {
    type: Boolean,
    default: false
  }
});

// Méthode statique pour archiver les notifications anciennes
notificationSchema.statics.archiverAnciennesNotifications = async function() {
  const dateLimite = new Date();
  dateLimite.setDate(dateLimite.getDate() - 30); // Archiver après 30 jours
  
  return this.updateMany(
    { 
      dateCreation: { $lt: dateLimite },
      archived: false
    },
    { 
      $set: { archived: true } 
    }
  );
};

module.exports = mongoose.model('Notification', notificationSchema);