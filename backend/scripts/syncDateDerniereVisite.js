const mongoose = require('mongoose');
const Employe = require('../src/models/Employe');
const Historique = require('../src/models/Historique');

// Configuration de la base de données
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gestion-visites-med';

async function syncDateDerniereVisite() {
  try {
    console.log('🔄 Synchronisation des dates de dernière visite médicale...\n');

    // Connexion à MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connexion à MongoDB réussie');

    // Récupérer tous les employés qui n'ont pas de dateDerniereVisiteMedicale
    const employesSansDate = await Employe.find({
      $or: [
        { dateDerniereVisiteMedicale: null },
        { dateDerniereVisiteMedicale: { $exists: false } }
      ]
    });

    console.log(`📊 ${employesSansDate.length} employés sans date de dernière visite trouvés\n`);

    let employesMisAJour = 0;
    let employesSansConsultation = 0;

    for (const employe of employesSansDate) {
      console.log(`👤 Traitement de ${employe.prenom} ${employe.nom} (${employe.matricule})`);

      // Chercher la dernière consultation FAITE pour cet employé
      const derniereConsultation = await Historique.findOne({
        employe: employe._id,
        statut: 'FAITE'
      }).sort({ dateConsultation: -1 });

      if (derniereConsultation) {
        // Mettre à jour l'employé avec la date de la dernière consultation
        await Employe.findByIdAndUpdate(
          employe._id,
          { dateDerniereVisiteMedicale: derniereConsultation.dateConsultation },
          { new: true }
        );

        console.log(`  ✅ Date mise à jour: ${derniereConsultation.dateConsultation.toLocaleDateString('fr-FR')}`);
        employesMisAJour++;
      } else {
        console.log(`  ⚠️  Aucune consultation FAITE trouvée`);
        employesSansConsultation++;
      }
    }

    console.log('\n🎯 RÉSUMÉ DE LA SYNCHRONISATION:');
    console.log(`✅ ${employesMisAJour} employés mis à jour avec leur dernière date de consultation`);
    console.log(`⚠️  ${employesSansConsultation} employés sans consultation FAITE`);
    console.log(`📊 ${employesSansDate.length} employés traités au total`);

    // Vérification finale
    const employesAvecDate = await Employe.countDocuments({
      dateDerniereVisiteMedicale: { $exists: true, $ne: null }
    });

    const totalEmployes = await Employe.countDocuments();

    console.log('\n📈 STATISTIQUES FINALES:');
    console.log(`👥 Total employés: ${totalEmployes}`);
    console.log(`📅 Employés avec date: ${employesAvecDate}`);
    console.log(`❌ Employés sans date: ${totalEmployes - employesAvecDate}`);

    console.log('\n🧪 INSTRUCTIONS DE TEST:');
    console.log('1. Aller sur /admin/employes');
    console.log('2. Cliquer sur "Modifier" pour un employé qui avait une consultation');
    console.log('3. Vérifier que le champ "Date Dernière Visite Médicale" est maintenant rempli');
    console.log('4. Observer que le statut de l\'employé est correct');

  } catch (error) {
    console.error('❌ Erreur lors de la synchronisation:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnexion de MongoDB');
  }
}

// Fonction pour vérifier l'état avant synchronisation
async function verifierEtat() {
  try {
    await mongoose.connect(MONGODB_URI);
    
    const totalEmployes = await Employe.countDocuments();
    const employesAvecDate = await Employe.countDocuments({
      dateDerniereVisiteMedicale: { $exists: true, $ne: null }
    });
    const employesSansDate = totalEmployes - employesAvecDate;
    
    const totalConsultations = await Historique.countDocuments({ statut: 'FAITE' });
    
    console.log('📊 ÉTAT ACTUEL:');
    console.log(`👥 Total employés: ${totalEmployes}`);
    console.log(`📅 Employés avec date: ${employesAvecDate}`);
    console.log(`❌ Employés sans date: ${employesSansDate}`);
    console.log(`🩺 Total consultations FAITES: ${totalConsultations}`);
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Erreur:', error);
    await mongoose.disconnect();
  }
}

// Interface en ligne de commande
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'check':
      await verifierEtat();
      break;
    case 'sync':
      await syncDateDerniereVisite();
      break;
    default:
      console.log('🔧 Script de synchronisation des dates de dernière visite médicale');
      console.log('');
      console.log('Usage:');
      console.log('  node syncDateDerniereVisite.js check    # Vérifier l\'état actuel');
      console.log('  node syncDateDerniereVisite.js sync     # Synchroniser les dates');
      console.log('');
      console.log('Description:');
      console.log('  Ce script met à jour le champ dateDerniereVisiteMedicale');
      console.log('  pour tous les employés qui ont des consultations FAITES');
      console.log('  mais pas de date manuelle renseignée.');
      break;
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  main();
}

module.exports = { syncDateDerniereVisite, verifierEtat };
