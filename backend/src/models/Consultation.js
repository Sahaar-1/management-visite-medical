const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema({
  rendezVousId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RendezVous',
    required: true
  },
  employeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employe',
    required: true
  },
  medecinId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  statut: {
    type: String,
    enum: ['NON_FAITE', 'FAITE', 'NON_PRESENTE'],
    default: 'NON_FAITE'
  },
  aptitudeGenerale: {
    type: String,
    enum: ['APTE', 'INAPTE'],
    required: function() {
      return this.statut === 'FAITE';
    }
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
    type: Number,
    min: 0,
    max: 10,
    required: function() {
      return this.statut === 'FAITE';
    }
  },
  observationMedecin: {
    type: String,
    default: ''
  },
  dateConsultation: {
    type: Date,
    default: Date.now
  },
  envoyeAdmin: {
    type: Boolean,
    default: false
  },
  dateEnvoi: {
    type: Date
  }
}, { timestamps: true });

// Créer un index composé pour éviter les doublons de consultation pour un même employé le même jour
consultationSchema.index({
  employeId: 1,
  dateConsultation: 1
}, {
  unique: false // Permettre plusieurs consultations le même jour pour le même employé
});

const Consultation = mongoose.model('Consultation', consultationSchema);
module.exports = Consultation;