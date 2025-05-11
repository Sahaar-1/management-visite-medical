const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
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
    enum: ['info', 'success', 'warning', 'danger'],
    default: 'info'
  },
  lue: {
    type: Boolean,
    default: false
  },
  destinataire: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lien: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', NotificationSchema);
