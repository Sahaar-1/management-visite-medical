const mongoose = require('mongoose');
const Employe = require('../src/models/Employe');
const User = require('../src/models/User');
const RendezVous = require('../src/models/RendezVous');
const Historique = require('../src/models/Historique');

// Configuration de la base de données
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gestion-visites-med';

async function addTestData() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connexion à MongoDB réussie');

    // 1. Créer un employé de test
    const employeTest = new Employe({
      matricule: 'TEST001',
      nom: 'MARTIN',
      prenom: 'Jean',
      entite: 'Service Test',
      telephone: '0123456789'
    });

    // Vérifier si l'employé existe déjà
    const employeExistant = await Employe.findOne({ matricule: 'TEST001' });
    let employe;
    if (employeExistant) {
      console.log('📋 Employé TEST001 existe déjà');
      employe = employeExistant;
    } else {
      employe = await employeTest.save();
      console.log('✅ Employé de test créé:', employe.matricule);
    }

    // 2. Trouver un médecin existant
    const medecin = await User.findOne({ role: 'medecin' });
    if (!medecin) {
      console.error('❌ Aucun médecin trouvé dans la base de données');
      console.log('💡 Veuillez d\'abord créer un compte médecin');
      return;
    }
    console.log('👨‍⚕️ Médecin trouvé:', medecin.email);

    // 3. Créer une date d'il y a 11 mois
    const dateIlYa11Mois = new Date();
    dateIlYa11Mois.setMonth(dateIlYa11Mois.getMonth() - 11);
    dateIlYa11Mois.setHours(9, 0, 0, 0); // 9h00 du matin

    console.log('📅 Date de consultation (il y a 11 mois):', dateIlYa11Mois.toLocaleDateString('fr-FR'));

    // 4. Créer un rendez-vous d'il y a 11 mois
    const rendezVousTest = new RendezVous({
      date: dateIlYa11Mois,
      medecin: medecin._id,
      employes: [employe._id],
      statut: 'termine'
    });

    // Vérifier si le rendez-vous existe déjà
    const rdvExistant = await RendezVous.findOne({
      medecin: medecin._id,
      employes: employe._id,
      date: {
        $gte: new Date(dateIlYa11Mois.getTime() - 24 * 60 * 60 * 1000), // 1 jour avant
        $lte: new Date(dateIlYa11Mois.getTime() + 24 * 60 * 60 * 1000)  // 1 jour après
      }
    });

    let rendezVous;
    if (rdvExistant) {
      console.log('📅 Rendez-vous existe déjà pour cette date');
      rendezVous = rdvExistant;
    } else {
      rendezVous = await rendezVousTest.save();
      console.log('✅ Rendez-vous de test créé');
    }

    // 5. Créer une consultation dans l'historique
    const consultationTest = new Historique({
      employe: employe._id,
      medecin: medecin._id,
      dateConsultation: dateIlYa11Mois,
      statut: 'FAITE',
      aptitudeDetails: {
        hc: 'APTE',
        th: 'APTE',
        cir: 'APTE'
      },
      classe: 5,
      observations: 'Consultation de test - employé en bonne santé',
      rendezVous: rendezVous._id
    });

    // Vérifier si la consultation existe déjà
    const consultationExistante = await Historique.findOne({
      employe: employe._id,
      medecin: medecin._id,
      dateConsultation: {
        $gte: new Date(dateIlYa11Mois.getTime() - 24 * 60 * 60 * 1000),
        $lte: new Date(dateIlYa11Mois.getTime() + 24 * 60 * 60 * 1000)
      }
    });

    if (consultationExistante) {
      console.log('🩺 Consultation existe déjà pour cette date');
    } else {
      await consultationTest.save();
      console.log('✅ Consultation de test créée');
    }

    // 6. Calculer et afficher le statut attendu
    const dateAujourdhui = new Date();
    const dateProchaineVisite = new Date(dateIlYa11Mois);
    dateProchaineVisite.setFullYear(dateProchaineVisite.getFullYear() + 1);
    
    const dateAlerte = new Date(dateProchaineVisite);
    dateAlerte.setMonth(dateAlerte.getMonth() - 1);

    console.log('\n📊 RÉSULTATS ATTENDUS:');
    console.log('👤 Employé:', employe.prenom, employe.nom, '(' + employe.matricule + ')');
    console.log('📅 Dernière visite:', dateIlYa11Mois.toLocaleDateString('fr-FR'));
    console.log('📅 Prochaine visite:', dateProchaineVisite.toLocaleDateString('fr-FR'));
    console.log('⚠️  Date d\'alerte:', dateAlerte.toLocaleDateString('fr-FR'));
    
    if (dateAujourdhui > dateProchaineVisite) {
      console.log('🔴 Statut attendu: VISITE REQUISE (rouge)');
    } else if (dateAujourdhui >= dateAlerte) {
      console.log('🟡 Statut attendu: VISITE PROCHE (jaune)');
    } else {
      console.log('🟢 Statut attendu: À JOUR (vert)');
    }

    console.log('\n🎯 INSTRUCTIONS DE TEST:');
    console.log('1. Aller sur /admin/employes');
    console.log('2. Chercher l\'employé "MARTIN Jean" (TEST001)');
    console.log('3. Vérifier le badge de statut dans la colonne STATUS VISITE');
    console.log('4. Cliquer sur l\'œil pour voir les détails');
    console.log('5. Vérifier les informations de visite médicale');

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnexion de MongoDB');
  }
}

// Exécuter le script
if (require.main === module) {
  addTestData();
}

module.exports = addTestData;
