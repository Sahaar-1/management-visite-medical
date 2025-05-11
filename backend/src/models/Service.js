const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, 'Veuillez entrer un nom de service'],
    unique: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  responsable: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  employes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  actif: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Service', ServiceSchema);
