const mongoose = require('mongoose');

const RendezVousSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  lieu: {
    type: String,
    required: true
  },
  notes: {
    type: String
  },
  employes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employe'  // Modifié de 'User' à 'Employe'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('RendezVous', RendezVousSchema);