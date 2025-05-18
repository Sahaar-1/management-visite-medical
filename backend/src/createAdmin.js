const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

dotenv.config();

async function createAdminUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    const salt = await bcrypt.genSalt(10);
// Dans createAdmin.js
const hashedPassword = await bcrypt.hash('admin123', salt);
    const adminUser = new User({
      nom: 'Admin',
      prenom: 'System',
      email: 'saharelmabrouk14@gmail.com',
      motDePasse: hashedPassword,
      role: 'admin'
    });

    await adminUser.save();
    console.log('Compte administrateur créé avec succès');
    process.exit(0);
  } catch (error) {
    console.error('Erreur:', error);
    process.exit(1);
  }
}

createAdminUser();
