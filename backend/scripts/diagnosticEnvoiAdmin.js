const mongoose = require('mongoose');
const Consultation = require('../src/models/Consultation');
const Historique = require('../src/models/Historique');
const Notification = require('../src/models/Notification');

// Configuration de la base de données
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gestion-visites-med';

async function diagnosticEnvoiAdmin() {
  try {
    console.log('🔍 Diagnostic du problème d\'envoi admin...\n');

    // Connexion à MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connexion à MongoDB réussie');

    // 1. Vérifier les consultations d'aujourd'hui
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    console.log('\n📊 CONSULTATIONS D\'AUJOURD\'HUI:');
    const consultationsAujourdhui = await Consultation.find({
      dateConsultation: {
        $gte: startOfToday,
        $lte: endOfToday
      }
    }).populate('employeId', 'nom prenom matricule').populate('medecinId', 'nom prenom');

    console.log(`Total consultations aujourd'hui: ${consultationsAujourdhui.length}`);
    
    consultationsAujourdhui.forEach((consultation, index) => {
      console.log(`${index + 1}. ${consultation.employeId?.prenom} ${consultation.employeId?.nom} - Statut: ${consultation.statut} - Envoyé admin: ${consultation.envoyeAdmin || false}`);
    });

    // 2. Vérifier les consultations non envoyées
    const consultationsNonEnvoyees = consultationsAujourdhui.filter(c => !c.envoyeAdmin);
    console.log(`\n📤 CONSULTATIONS NON ENVOYÉES: ${consultationsNonEnvoyees.length}`);
    
    consultationsNonEnvoyees.forEach((consultation, index) => {
      console.log(`${index + 1}. ${consultation.employeId?.prenom} ${consultation.employeId?.nom} - ${consultation.statut}`);
    });

    // 3. Vérifier les notifications
    console.log('\n🔔 NOTIFICATIONS ADMIN:');
    const notifications = await Notification.find({
      type: 'CONSULTATION',
      destinataire: 'admin'
    }).sort({ createdAt: -1 }).limit(5);

    console.log(`Total notifications consultation: ${notifications.length}`);
    notifications.forEach((notif, index) => {
      console.log(`${index + 1}. ${notif.createdAt.toLocaleDateString()} - ${notif.details?.statistiques?.total || 0} consultations`);
    });

    // 4. Vérifier l'historique
    console.log('\n📚 HISTORIQUE D\'AUJOURD\'HUI:');
    const historiqueAujourdhui = await Historique.find({
      dateConsultation: {
        $gte: startOfToday,
        $lte: endOfToday
      }
    }).populate('employe', 'nom prenom matricule');

    console.log(`Total historique aujourd'hui: ${historiqueAujourdhui.length}`);
    historiqueAujourdhui.forEach((hist, index) => {
      console.log(`${index + 1}. ${hist.employe?.prenom} ${hist.employe?.nom} - ${hist.statut}`);
    });

    return {
      consultationsAujourdhui,
      consultationsNonEnvoyees,
      notifications,
      historiqueAujourdhui
    };

  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnexion de MongoDB');
  }
}

async function corrigerEnvoiAdmin() {
  try {
    console.log('🔧 Correction du problème d\'envoi admin...\n');

    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connexion à MongoDB réussie');

    // 1. Réinitialiser le flag envoyeAdmin pour toutes les consultations d'aujourd'hui
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    console.log('\n🔄 Réinitialisation des flags envoyeAdmin...');
    
    const result = await Consultation.updateMany(
      {
        dateConsultation: {
          $gte: startOfToday,
          $lte: endOfToday
        }
      },
      {
        $unset: { envoyeAdmin: "" } // Supprimer le champ envoyeAdmin
      }
    );

    console.log(`✅ ${result.modifiedCount} consultations réinitialisées`);

    // 2. Vérifier le résultat
    const consultationsApres = await Consultation.find({
      dateConsultation: {
        $gte: startOfToday,
        $lte: endOfToday
      }
    }).populate('employeId', 'nom prenom matricule');

    console.log('\n📊 ÉTAT APRÈS CORRECTION:');
    console.log(`Total consultations: ${consultationsApres.length}`);
    
    const nonEnvoyees = consultationsApres.filter(c => !c.envoyeAdmin);
    console.log(`Consultations non envoyées: ${nonEnvoyees.length}`);
    
    nonEnvoyees.forEach((consultation, index) => {
      console.log(`${index + 1}. ${consultation.employeId?.prenom} ${consultation.employeId?.nom} - ${consultation.statut} - Envoyé: ${consultation.envoyeAdmin || false}`);
    });

    console.log('\n🎯 INSTRUCTIONS:');
    console.log('1. Actualiser la page médecin');
    console.log('2. Le bouton "Envoyer à l\'admin" devrait maintenant être activé');
    console.log('3. Tester l\'envoi des consultations');

  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error);
  } finally {
    await mongoose.disconnect();
  }
}

async function testerEnvoiAPI() {
  try {
    console.log('🧪 Test de l\'API d\'envoi...\n');

    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connexion à MongoDB réussie');

    // Simuler l'envoi d'une consultation
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    const consultationsTest = await Consultation.find({
      dateConsultation: {
        $gte: startOfToday,
        $lte: endOfToday
      },
      envoyeAdmin: { $ne: true }
    }).limit(1);

    if (consultationsTest.length === 0) {
      console.log('❌ Aucune consultation disponible pour le test');
      return;
    }

    const consultation = consultationsTest[0];
    console.log(`🧪 Test avec consultation: ${consultation._id}`);

    // Marquer comme envoyée
    await Consultation.findByIdAndUpdate(
      consultation._id,
      { envoyeAdmin: true },
      { new: true }
    );

    console.log('✅ Consultation marquée comme envoyée');

    // Vérifier
    const consultationVerif = await Consultation.findById(consultation._id);
    console.log(`Vérification - envoyeAdmin: ${consultationVerif.envoyeAdmin}`);

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Interface en ligne de commande
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'diagnostic':
      await diagnosticEnvoiAdmin();
      break;
    case 'corriger':
      await corrigerEnvoiAdmin();
      break;
    case 'test':
      await testerEnvoiAPI();
      break;
    default:
      console.log('🔧 Script de diagnostic envoi admin');
      console.log('');
      console.log('Usage:');
      console.log('  node diagnosticEnvoiAdmin.js diagnostic    # Analyser le problème');
      console.log('  node diagnosticEnvoiAdmin.js corriger      # Réinitialiser les flags');
      console.log('  node diagnosticEnvoiAdmin.js test          # Tester l\'API');
      console.log('');
      console.log('Description:');
      console.log('  Ce script diagnostique et corrige les problèmes');
      console.log('  d\'envoi des consultations à l\'admin.');
      break;
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  main();
}

module.exports = { diagnosticEnvoiAdmin, corrigerEnvoiAdmin, testerEnvoiAPI };
