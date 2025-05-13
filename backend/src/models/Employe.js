
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const employeeSchema = new mongoose.Schema({
  matricule: {
    type: String,
    required: true,
    unique: true,
  },
  nom: {
    type: String,
    required: true,
  },
  prenom: {
    type: String,
    required: true,
  },
  entite: {
    type: String,
    required: true,
    enum: ['OIG/B', 'OIG/B/E', 'OIG/B/L', 'OIG/B/M', 'OIG/B/P', 'OIG/B/M/C'],
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt fields
});

module.exports = mongoose.model('Employe', employeeSchema);