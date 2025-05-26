const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Charger les variables d'environnement
dotenv.config();

// Modèle Employe
const employeSchema = new mongoose.Schema({
  matricule: { type: String, required: true, unique: true },
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  entite: { type: String, required: true },
  service: String,
  poste: String,
  telephone: String,
  email: String,
  dateDerniereVisite: Date,
  dateEmbauche: Date,
  statut: { type: String, enum: ['actif', 'inactif'], default: 'actif' },
  updatedAt: { type: Date, default: Date.now }
});

const Employe = mongoose.model('Employe', employeSchema);

async function fixFutureDates() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connecté à MongoDB');

    // Obtenir la date actuelle
    const maintenant = new Date();
    console.log('📅 Date actuelle:', maintenant.toLocaleDateString('fr-FR'));

    // Trouver tous les employés avec des dates dans le futur
    const employesAvecDatesFutures = await Employe.find({
      dateDerniereVisite: { $gt: maintenant }
    });

    console.log(`🔍 Trouvé ${employesAvecDatesFutures.length} employés avec des dates dans le futur`);

    if (employesAvecDatesFutures.length === 0) {
      console.log('✅ Aucune correction nécessaire');
      return;
    }

    // Afficher les employés concernés
    console.log('\n📋 Employés avec dates futures:');
    employesAvecDatesFutures.forEach(emp => {
      console.log(`- ${emp.matricule} ${emp.nom} ${emp.prenom}: ${emp.dateDerniereVisite.toLocaleDateString('fr-FR')}`);
    });

    // Demander confirmation
    console.log('\n🔧 Options de correction:');
    console.log('1. Convertir 2025 → 2024 (recommandé)');
    console.log('2. Convertir 2025 → 2023');
    console.log('3. Supprimer les dates (mettre à null)');

    // Pour ce script, on va convertir 2025 → 2024
    const option = 1;

    let compteurCorrige = 0;

    for (const employe of employesAvecDatesFutures) {
      const ancienneDate = new Date(employe.dateDerniereVisite);
      let nouvelleDate;

      switch (option) {
        case 1:
          // Convertir 2025 → 2024
          nouvelleDate = new Date(ancienneDate);
          nouvelleDate.setFullYear(2024);
          break;
        case 2:
          // Convertir 2025 → 2023
          nouvelleDate = new Date(ancienneDate);
          nouvelleDate.setFullYear(2023);
          break;
        case 3:
          // Supprimer la date
          nouvelleDate = null;
          break;
        default:
          continue;
      }

      // Mettre à jour l'employé
      await Employe.updateOne(
        { _id: employe._id },
        { 
          dateDerniereVisite: nouvelleDate,
          updatedAt: new Date()
        }
      );

      console.log(`✅ ${employe.matricule} ${employe.nom}: ${ancienneDate.toLocaleDateString('fr-FR')} → ${nouvelleDate ? nouvelleDate.toLocaleDateString('fr-FR') : 'null'}`);
      compteurCorrige++;
    }

    console.log(`\n🎉 Correction terminée! ${compteurCorrige} employés corrigés.`);

    // Vérification finale
    const employesRestants = await Employe.find({
      dateDerniereVisite: { $gt: maintenant }
    });

    if (employesRestants.length === 0) {
      console.log('✅ Toutes les dates futures ont été corrigées!');
    } else {
      console.log(`⚠️ Il reste ${employesRestants.length} employés avec des dates futures`);
    }

  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
}

// Fonction pour afficher les statistiques
async function afficherStatistiques() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    const maintenant = new Date();
    
    const total = await Employe.countDocuments();
    const avecDates = await Employe.countDocuments({ dateDerniereVisite: { $exists: true, $ne: null } });
    const datesFutures = await Employe.countDocuments({ dateDerniereVisite: { $gt: maintenant } });
    const datesPassees = await Employe.countDocuments({ dateDerniereVisite: { $lte: maintenant } });
    const sansDates = await Employe.countDocuments({ $or: [{ dateDerniereVisite: { $exists: false } }, { dateDerniereVisite: null }] });

    console.log('\n📊 STATISTIQUES DES DATES:');
    console.log(`👥 Total employés: ${total}`);
    console.log(`📅 Avec dates: ${avecDates}`);
    console.log(`🔮 Dates futures: ${datesFutures}`);
    console.log(`✅ Dates passées: ${datesPassees}`);
    console.log(`❌ Sans dates: ${sansDates}`);

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

// Exécuter selon l'argument
const action = process.argv[2];

if (action === 'stats') {
  afficherStatistiques();
} else {
  fixFutureDates();
}
