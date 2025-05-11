const mongoose = require('mongoose');

const VisiteMedicaleSchema = new mongoose.Schema({
  employe: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Un employé est requis']
  },
  medecin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Un médecin est requis']
  },
  date: {
    type: Date,
    required: [true, 'La date de la visite est requise']
  },
  statut: {
    type: String,
    enum: ['planifiee', 'en_cours', 'terminee', 'annulee'],
    default: 'planifiee'
  },
  observations: {
    type: String,
    trim: true
  },
  aptitude: {
    type: String,
    enum: ['apte', 'inapte', 'apte_avec_reserves'],
    default: null
  },
  rapportMedical: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('VisiteMedicale', VisiteMedicaleSchema);
