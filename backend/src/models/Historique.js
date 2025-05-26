const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const historiqueSchema = new mongoose.Schema({
  consultation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Consultation',
    required: true
  },
  employe: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employe',
    required: true
  },
  medecin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dateConsultation: {
    type: Date,
    required: true,
    default: Date.now
  },
  statut: {
    type: String,
    enum: ['FAITE', 'NON_FAITE', 'NON_PRESENTE'],
    default: 'FAITE'
  },
  observations: {
    type: String,
    default: ''
  },
  rendezVousId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RendezVous'
  },
  aptitudeDetails: {
    hc: {
      type: String,
      enum: ['APTE', 'INAPTE'],
      default: 'APTE'
    },
    th: {
      type: String,
      enum: ['APTE', 'INAPTE'],
      default: 'APTE'
    },
    cir: {
      type: String,
      enum: ['APTE', 'INAPTE'],
      default: 'APTE'
    }
  },
  classe: {
    type: String,
    default: '1'
  },
  metadonnees: {
    type: Map,
    of: String,
    default: {}
  }
}, { timestamps: true });

// Ajouter le plugin de pagination
historiqueSchema.plugin(mongoosePaginate);

const Historique = mongoose.model('Historique', historiqueSchema);
module.exports = Historique;