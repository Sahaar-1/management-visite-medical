const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const EmployeSchema = new mongoose.Schema({
  matricule: {
    type: String,
    required: true,
    unique: true
  },
  nom: {
    type: String,
    required: true
  },
  prenom: {
    type: String,
    required: true
  },
  entite: {
    type: String,
    required: true
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  historiqueVisites: [{
    annee: { 
      type: Number,
      required: true,
      default: () => new Date().getFullYear()
    },
    dateVMS: { 
      type: Date,
      default: Date.now 
    },
    statut: { 
      type: String, 
      enum: ['En attente', 'Effectuée', 'Planifiée'], 
      default: 'En attente' 
    },
    eligibilite: { 
      type: Number, 
      default: 1,
      min: 0,
      max: 1
    },
    aptitudeHC: { 
      type: String, 
      enum: ['', 'APTE', 'INAPTE'], 
      default: '' 
    },
    dateAptitudeHC: { 
      type: Date
    },
    aptitudeTH: { 
      type: String, 
      enum: ['', 'APTE', 'INAPTE'], 
      default: '' 
    },
    dateAptitudeTH: { 
      type: Date
    },
    aptitudeEC: { 
      type: String, 
      enum: ['', 'APTE', 'INAPTE'], 
      default: '' 
    },
    dateAptitudeEC: { 
      type: Date
    },
    medecin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    observations: String
  }],
  dernierStatut: {
    type: String,
    enum: ['APTE', 'INAPTE'],
    default: 'APTE'
  }
}, {
  timestamps: true
});

EmployeSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Employe', EmployeSchema);
