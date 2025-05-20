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
    select: false  // Changer à false pour la sécurité
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
    // Supprimer la contrainte required
    validate: {
      validator: function(v) {
        // Si la valeur est vide ou null, c'est valide
        if (!v || v === '') return true;
        
        // Sinon, vérifier le format
        return /^[0-9]{10}$/.test(v);
      },
      message: 'Le numéro de téléphone doit contenir exactement 10 chiffres'
    }
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
    },
    validate: {
      validator: function(v) {
        return this.role !== 'medecin' || (v && v.length > 0);
      },
      message: 'La spécialité est requise pour les médecins'
    }
  },
  premierConnexion: {
    type: Boolean,
    default: true
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
    console.log('Mot de passe haché avec succès pour:', this.email);
    console.log('Hash généré (début):', this.motDePasse.substring(0, 10) + '...');
    next();
  } catch (error) {
    console.error('Erreur lors du hachage du mot de passe:', error);
    next(error);
  }
});

// Méthode pour vérifier le mot de passe
UserSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    if (!this.motDePasse) {
      console.error('Erreur: Mot de passe non disponible dans l\'objet utilisateur pour:', this.email);
      return false;
    }
    
    console.log('Détails de comparaison pour:', this.email);
    console.log('- Longueur du mot de passe fourni:', candidatePassword.length);
    console.log('- Longueur du hash stocké:', this.motDePasse.length);
    console.log('- Hash stocké commence par:', this.motDePasse.substring(0, 10) + '...');
    
    const isMatch = await bcrypt.compare(candidatePassword, this.motDePasse);
    console.log('- Résultat de la comparaison:', isMatch);
    return isMatch;
  } catch (error) {
    console.error('Erreur détaillée dans comparePassword pour', this.email, ':', error);
    return false;
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
