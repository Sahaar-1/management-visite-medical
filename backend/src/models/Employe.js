
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const employeSchema = new mongoose.Schema({
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
  telephone: {
    type: String,
    required: false // Le téléphone n'est pas obligatoire
  },
  dateDerniereVisiteMedicale: {
    type: Date,
    default: null, // Champ optionnel pour la dernière visite médicale
    validate: {
      validator: function(value) {
        // Si la valeur est null ou undefined, c'est valide
        if (!value) return true;

        // Vérifier que la date n'est pas dans le futur
        const today = new Date();
        today.setHours(23, 59, 59, 999); // Fin de la journée d'aujourd'hui
        return value <= today;
      },
      message: 'La date de la dernière visite médicale ne peut pas être dans le futur'
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Employe', employeSchema);