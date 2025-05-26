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

async function testLogicDejaVisite() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connecté à MongoDB');

    // Scénarios de test
    const scenarios = [
      {
        nom: "Test RDV en 2025 avec employé ayant visite en 2025",
        dateRdv: "2025-06-15",
        employeTest: { matricule: "47574", nom: "MASKINI", dateVisite: "2025-02-12" },
        resultatAttendu: "Déjà programmé (Visite déjà faite)"
      },
      {
        nom: "Test RDV en 2025 avec employé ayant visite en 2024",
        dateRdv: "2025-06-15", 
        employeTest: { matricule: "46313", nom: "FATIH", dateVisite: "2024-04-23" },
        resultatAttendu: "Disponible"
      },
      {
        nom: "Test RDV en 2024 avec employé ayant visite en 2024",
        dateRdv: "2024-12-15",
        employeTest: { matricule: "46313", nom: "FATIH", dateVisite: "2024-04-23" },
        resultatAttendu: "Déjà programmé (Visite déjà faite)"
      },
      {
        nom: "Test RDV en 2024 avec employé sans visite",
        dateRdv: "2024-12-15",
        employeTest: { matricule: "40041", nom: "TAIA", dateVisite: null },
        resultatAttendu: "Disponible"
      }
    ];

    console.log('\n🧪 TESTS DU NOUVEAU LOGIC "DÉJÀ PROGRAMMÉ"\n');

    for (const scenario of scenarios) {
      console.log(`📋 ${scenario.nom}`);
      console.log(`   📅 Date RDV: ${scenario.dateRdv}`);
      console.log(`   👤 Employé: ${scenario.employeTest.nom} (${scenario.employeTest.matricule})`);
      console.log(`   🏥 Date dernière visite: ${scenario.employeTest.dateVisite || 'Aucune'}`);
      
      // Simuler la logique du frontend
      const dateRdv = new Date(scenario.dateRdv);
      const anneeRdv = dateRdv.getFullYear();
      
      // Récupérer l'employé de la base
      const employe = await Employe.findOne({ matricule: scenario.employeTest.matricule });
      
      if (!employe) {
        console.log(`   ❌ Employé non trouvé dans la base`);
        continue;
      }
      
      let estDejaAssigne = false;
      let raison = '';
      
      // Vérifier s'il a déjà fait sa visite cette année
      if (employe.dateDerniereVisiteMedicale) {
        const dateDerniereVisite = new Date(employe.dateDerniereVisiteMedicale);
        const anneeDerniereVisite = dateDerniereVisite.getFullYear();
        const maintenant = new Date();
        
        console.log(`   📊 Année dernière visite: ${anneeDerniereVisite}`);
        console.log(`   📊 Année RDV: ${anneeRdv}`);
        console.log(`   📊 Date dans le futur: ${dateDerniereVisite > maintenant ? 'Oui' : 'Non'}`);
        
        // Si la dernière visite est dans la même année que le RDV ET n'est pas dans le futur
        if (anneeDerniereVisite === anneeRdv && dateDerniereVisite <= maintenant) {
          estDejaAssigne = true;
          raison = 'Visite déjà faite cette année';
        } else if (anneeDerniereVisite === anneeRdv && dateDerniereVisite > maintenant) {
          raison = 'Date de visite dans le futur (ignorée)';
        }
      } else {
        console.log(`   📊 Aucune date de dernière visite`);
      }
      
      const resultat = estDejaAssigne ? `Déjà programmé (${raison})` : 'Disponible';
      const estCorrect = resultat === scenario.resultatAttendu;
      
      console.log(`   🎯 Résultat attendu: ${scenario.resultatAttendu}`);
      console.log(`   📊 Résultat obtenu: ${resultat}`);
      console.log(`   ${estCorrect ? '✅' : '❌'} Test ${estCorrect ? 'RÉUSSI' : 'ÉCHOUÉ'}`);
      console.log('');
    }

    // Test avec des exemples concrets de la base
    console.log('\n🔍 EXEMPLES CONCRETS DE LA BASE DE DONNÉES:\n');
    
    const exemples = [
      { matricule: "47574", nom: "MASKINI" },
      { matricule: "46313", nom: "FATIH" },
      { matricule: "40041", nom: "TAIA" },
      { matricule: "49395", nom: "AHDIDOU" }
    ];
    
    for (const exemple of exemples) {
      const employe = await Employe.findOne({ matricule: exemple.matricule });
      
      if (employe) {
        console.log(`👤 ${employe.nom} ${employe.prenom} (${employe.matricule})`);
        
        if (employe.dateDerniereVisiteMedicale) {
          const dateVisite = new Date(employe.dateDerniereVisiteMedicale);
          const anneeVisite = dateVisite.getFullYear();
          const maintenant = new Date();
          
          console.log(`   📅 Dernière visite: ${dateVisite.toLocaleDateString('fr-FR')} (${anneeVisite})`);
          console.log(`   🔮 Dans le futur: ${dateVisite > maintenant ? 'Oui' : 'Non'}`);
          
          // Test pour RDV en 2024
          const peutRdv2024 = !(anneeVisite === 2024 && dateVisite <= maintenant);
          console.log(`   📋 Peut avoir RDV en 2024: ${peutRdv2024 ? 'Oui' : 'Non (visite déjà faite)'}`);
          
          // Test pour RDV en 2025
          const peutRdv2025 = !(anneeVisite === 2025 && dateVisite <= maintenant);
          console.log(`   📋 Peut avoir RDV en 2025: ${peutRdv2025 ? 'Oui' : 'Non (visite déjà faite)'}`);
          
        } else {
          console.log(`   📅 Aucune visite enregistrée`);
          console.log(`   📋 Peut avoir RDV: Oui (première visite)`);
        }
        console.log('');
      }
    }

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
}

// Exécuter le test
testLogicDejaVisite();
