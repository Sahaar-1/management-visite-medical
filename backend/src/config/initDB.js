const User = require('../models/User');
const bcrypt = require('bcryptjs');

const createDefaultAdmin = async () => {
  try {

    // Vérifier si un admin existe déjà
    const adminExistant = await User.findOne({ role: 'admin' });
    
    if (adminExistant) {
      console.log('Admin existant trouvé, pas de création nécessaire');
      return;
    }
    
    // Créer l'admin avec le mot de passe non haché
    const admin = new User({
      nom: 'Admin',
      prenom: 'System',
      email: 'saharelmabrouk14@gmail.com',
      motDePasse: 'admin123', // Le middleware pre('save') se chargera du hachage
      role: 'admin',
      telephone: '0123456789',
      premierConnexion: true // Définir à true pour forcer la réinitialisation
    });

    await admin.save();
    
    // Vérification post-création
    const savedAdmin = await User.findOne({ email: 'saharelmabrouk14@gmail.com' }).select('+motDePasse');
    const verifyAfterSave = await bcrypt.compare('admin123', savedAdmin.motDePasse);
    console.log('Vérification après sauvegarde:', verifyAfterSave);
    
    console.log('Admin créé avec succès');
  } catch (error) {
    console.error('Erreur création admin:', error);
    throw error;
  }
};

module.exports = { createDefaultAdmin };
