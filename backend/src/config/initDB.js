const User = require('../models/User');
const bcrypt = require('bcryptjs');

const createDefaultAdmin = async () => {
  try {
    // Vérifier si l'admin existe déjà
    const adminExists = await User.findOne({ email: 'admin@example.com' });
    
    if (!adminExists) {
      // Hasher le mot de passe
      const salt = await bcrypt.genSalt(10);
      const hashedPazssword = await bcrypt.hash('admin123', salt);

      // Créer l'administrateur par défaut
      const admin = new User({
        nom: 'Admin',
        prenom: 'System',
        email: 'admin@example.com',
        motDePasse: hashedPassword,
        role: 'admin'
      });

      await admin.save();
      console.log('Compte administrateur par défaut créé avec succès');
    }
  } catch (error) {
    console.error('Erreur lors de la création du compte admin:', error);
  }
};

module.exports = { createDefaultAdmin };
