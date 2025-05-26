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
  dateDerniereVisiteMedicale: Date,
  dateEmbauche: Date,
  statut: { type: String, enum: ['actif', 'inactif'], default: 'actif' },
  updatedAt: { type: Date, default: Date.now }
});

const Employe = mongoose.model('Employe', employeSchema);

async function addTestDates() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connecté à MongoDB');

    // Obtenir tous les employés
    const employes = await Employe.find({});
    console.log(`📋 Trouvé ${employes.length} employés`);

    if (employes.length === 0) {
      console.log('❌ Aucun employé trouvé');
      return;
    }

    // Créer différents scénarios de test
    const scenarios = [
      {
        type: 'Visite Requise',
        description: 'Pas de visite ou visite très ancienne',
        dateOffset: -400, // Il y a plus d'un an
        count: Math.floor(employes.length * 0.4) // 40%
      },
      {
        type: 'Visite Proche',
        description: 'Visite dans moins d\'un mois',
        dateOffset: -340, // Il y a 11 mois (dans 1 mois = visite proche)
        count: Math.floor(employes.length * 0.3) // 30%
      },
      {
        type: 'À jour',
        description: 'Visite récente',
        dateOffset: -200, // Il y a 6-7 mois
        count: Math.floor(employes.length * 0.3) // 30%
      }
    ];

    let index = 0;
    let compteurMisAJour = 0;

    for (const scenario of scenarios) {
      console.log(`\n🔧 Application du scénario: ${scenario.type}`);
      console.log(`📝 ${scenario.description}`);
      
      for (let i = 0; i < scenario.count && index < employes.length; i++) {
        const employe = employes[index];
        
        let dateVisite = null;
        if (scenario.type !== 'Visite Requise' || Math.random() > 0.5) {
          // Créer une date dans le passé
          dateVisite = new Date();
          dateVisite.setDate(dateVisite.getDate() + scenario.dateOffset);
          
          // Ajouter un peu de randomness (±30 jours)
          const randomDays = Math.floor(Math.random() * 60) - 30;
          dateVisite.setDate(dateVisite.getDate() + randomDays);
        }

        // Mettre à jour l'employé
        await Employe.updateOne(
          { _id: employe._id },
          { 
            dateDerniereVisiteMedicale: dateVisite,
            updatedAt: new Date()
          }
        );

        console.log(`✅ ${employe.matricule} ${employe.nom}: ${dateVisite ? dateVisite.toLocaleDateString('fr-FR') : 'null'}`);
        compteurMisAJour++;
        index++;
      }
    }

    // Pour les employés restants, les laisser sans date (Visite Requise)
    while (index < employes.length) {
      const employe = employes[index];
      await Employe.updateOne(
        { _id: employe._id },
        { 
          dateDerniereVisiteMedicale: null,
          updatedAt: new Date()
        }
      );
      console.log(`✅ ${employe.matricule} ${employe.nom}: null (Visite Requise)`);
      compteurMisAJour++;
      index++;
    }

    console.log(`\n🎉 Mise à jour terminée! ${compteurMisAJour} employés mis à jour.`);

    // Afficher les statistiques finales
    await afficherStatistiques();

  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout des dates de test:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
}

async function afficherStatistiques() {
  try {
    const maintenant = new Date();
    
    const total = await Employe.countDocuments();
    const avecDates = await Employe.countDocuments({ 
      dateDerniereVisiteMedicale: { $exists: true, $ne: null } 
    });
    const sansDates = await Employe.countDocuments({ 
      $or: [
        { dateDerniereVisiteMedicale: { $exists: false } }, 
        { dateDerniereVisiteMedicale: null }
      ] 
    });

    // Calculer les statuts
    let visiteRequise = 0;
    let visiteProche = 0;
    let aJour = 0;

    const employesAvecDates = await Employe.find({ 
      dateDerniereVisiteMedicale: { $exists: true, $ne: null } 
    });

    employesAvecDates.forEach(employe => {
      const derniereVisite = new Date(employe.dateDerniereVisiteMedicale);
      const prochaineDateVisite = new Date(derniereVisite);
      prochaineDateVisite.setFullYear(derniereVisite.getFullYear() + 1);

      const diffMs = prochaineDateVisite.getTime() - maintenant.getTime();
      const diffJours = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      if (diffJours < 0) {
        visiteRequise++;
      } else if (diffJours <= 30) {
        visiteProche++;
      } else {
        aJour++;
      }
    });

    // Ajouter les employés sans dates aux "Visite Requise"
    visiteRequise += sansDates;

    console.log('\n📊 STATISTIQUES FINALES:');
    console.log(`👥 Total employés: ${total}`);
    console.log(`📅 Avec dates: ${avecDates}`);
    console.log(`❌ Sans dates: ${sansDates}`);
    console.log('\n🎯 RÉPARTITION DES STATUTS:');
    console.log(`🔴 Visite Requise: ${visiteRequise} (${Math.round(visiteRequise/total*100)}%)`);
    console.log(`🟡 Visite Proche: ${visiteProche} (${Math.round(visiteProche/total*100)}%)`);
    console.log(`🟢 À jour: ${aJour} (${Math.round(aJour/total*100)}%)`);

  } catch (error) {
    console.error('❌ Erreur lors du calcul des statistiques:', error);
  }
}

// Fonction pour nettoyer toutes les dates
async function cleanAllDates() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    const result = await Employe.updateMany(
      {},
      { 
        $unset: { dateDerniereVisiteMedicale: "" },
        updatedAt: new Date()
      }
    );

    console.log(`✅ ${result.modifiedCount} employés nettoyés`);
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

// Exécuter selon l'argument
const action = process.argv[2];

if (action === 'clean') {
  cleanAllDates();
} else if (action === 'stats') {
  mongoose.connect(process.env.MONGODB_URI).then(afficherStatistiques).then(() => mongoose.disconnect());
} else {
  addTestDates();
}
