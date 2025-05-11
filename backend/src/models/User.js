const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, 'Veuillez entrer un nom'],
    trim: true
  },
  prenom: {
    type: String,
    required: [true, 'Veuillez entrer un prénom'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Veuillez entrer un email'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Veuillez entrer un email valide']
  },
  motDePasse: {
    type: String,
    required: [true, 'Veuillez entrer un mot de passe'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['admin', 'medecin', 'employe'],
    default: 'employe'
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
  },
  dateNaissance: {
    type: Date
  },
  telephone: {
    type: String,
    match: [/^[0-9]{10}$/, 'Veuillez entrer un numéro de téléphone valide']
  },
  adresse: {
    type: String
  },
  statutVisite: {
    type: String,
    enum: ['en_attente', 'effectuee', 'non_requise'],
    default: 'en_attente'
  },
  dateVisite: {
    type: Date
  },
  actif: {
    type: Boolean,
    default: true
  },
  dernierConnexion: {
    type: Date,
    default: null
  },
  estActif: {
    type: Boolean,
    default: true
  },
  specialite: {
    type: String,
    required: function() {
      return this.role === 'medecin';
    }
  }
}, {
  timestamps: true
});

// Validation du mot de passe
UserSchema.path('motDePasse').validate(function(value) {
  if (!this.isModified('motDePasse')) return true;
  return value && value.length >= 6;
}, 'Le mot de passe doit contenir au moins 6 caractères.');

// Middleware pour hacher le mot de passe avant la sauvegarde
UserSchema.pre('save', async function(next) {
  // Ne hacher le mot de passe que s'il a été modifié ou est nouveau
  if (!this.isModified('motDePasse')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.motDePasse = await bcrypt.hash(this.motDePasse, salt);
    console.log('Mot de passe haché avec succès');
    next();
  } catch (error) {
    next(error);
  }
});

// Méthode pour vérifier le mot de passe
UserSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    console.log('Comparaison des mots de passe...');
    const isMatch = await bcrypt.compare(candidatePassword, this.motDePasse);
    console.log('Résultat de la comparaison:', isMatch);
    return isMatch;
  } catch (error) {
    console.error('Erreur lors de la comparaison des mots de passe:', error);
    throw error;
  }
};

// Méthode pour obtenir les informations du profil sans le mot de passe
UserSchema.methods.getProfil = function() {
  const profil = this.toObject();
  delete profil.motDePasse;
  return profil;
};

// Méthode pour mettre à jour la dernière connexion
UserSchema.methods.updateDernierConnexion = function() {
  this.dernierConnexion = new Date();
  return this.save();
};

module.exports = mongoose.model('User', UserSchema);
