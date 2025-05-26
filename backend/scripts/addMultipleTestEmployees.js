const mongoose = require('mongoose');
const Employe = require('../src/models/Employe');
const User = require('../src/models/User');
const RendezVous = require('../src/models/RendezVous');
const Historique = require('../src/models/Historique');

// Configuration de la base de données
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gestion-visites-med';

async function addMultipleTestEmployees() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connexion à MongoDB réussie');

    // Trouver un médecin existant
    const medecin = await User.findOne({ role: 'medecin' });
    if (!medecin) {
      console.error('❌ Aucun médecin trouvé dans la base de données');
      return;
    }

    // Définir les employés de test avec différents statuts
    const employesTest = [
      {
        matricule: 'TEST002',
        nom: 'DUPONT',
        prenom: 'Marie',
        entite: 'Service RH',
        telephone: '0123456790',
        consultationMoisAgo: null, // Aucune consultation = Rouge
        description: 'Aucune consultation'
      },
      {
        matricule: 'TEST003',
        nom: 'BERNARD',
        prenom: 'Pierre',
        entite: 'Service IT',
        telephone: '0123456791',
        consultationMoisAgo: 13, // Il y a 13 mois = Rouge (dépassé)
        description: 'Consultation expirée'
      },
      {
        matricule: 'TEST004',
        nom: 'MOREAU',
        prenom: 'Sophie',
        entite: 'Service Comptabilité',
        telephone: '0123456792',
        consultationMoisAgo: 11, // Il y a 11 mois = Jaune (proche)
        description: 'Visite proche'
      },
      {
        matricule: 'TEST005',
        nom: 'PETIT',
        prenom: 'Luc',
        entite: 'Service Production',
        telephone: '0123456793',
        consultationMoisAgo: 6, // Il y a 6 mois = Vert (à jour)
        description: 'À jour'
      },
      {
        matricule: 'TEST006',
        nom: 'ROUX',
        prenom: 'Julie',
        entite: 'Service Marketing',
        telephone: '0123456794',
        consultationMoisAgo: 3, // Il y a 3 mois = Vert (à jour)
        description: 'Récemment consulté'
      }
    ];

    console.log('🏭 Création de', employesTest.length, 'employés de test...\n');

    for (const employeData of employesTest) {
      console.log(`👤 Traitement de ${employeData.prenom} ${employeData.nom} (${employeData.description})`);

      // 1. Créer ou récupérer l'employé
      let employe = await Employe.findOne({ matricule: employeData.matricule });
      if (!employe) {
        employe = new Employe({
          matricule: employeData.matricule,
          nom: employeData.nom,
          prenom: employeData.prenom,
          entite: employeData.entite,
          telephone: employeData.telephone
        });
        await employe.save();
        console.log('  ✅ Employé créé');
      } else {
        console.log('  📋 Employé existe déjà');
      }

      // 2. Créer une consultation si spécifiée
      if (employeData.consultationMoisAgo) {
        const dateConsultation = new Date();
        dateConsultation.setMonth(dateConsultation.getMonth() - employeData.consultationMoisAgo);
        dateConsultation.setHours(10, 0, 0, 0);

        // Vérifier si la consultation existe déjà
        const consultationExistante = await Historique.findOne({
          employe: employe._id,
          medecin: medecin._id,
          dateConsultation: {
            $gte: new Date(dateConsultation.getTime() - 24 * 60 * 60 * 1000),
            $lte: new Date(dateConsultation.getTime() + 24 * 60 * 60 * 1000)
          }
        });

        if (!consultationExistante) {
          // Créer un rendez-vous
          const rendezVous = new RendezVous({
            date: dateConsultation,
            medecin: medecin._id,
            employes: [employe._id],
            statut: 'termine'
          });
          await rendezVous.save();

          // Créer la consultation
          const consultation = new Historique({
            employe: employe._id,
            medecin: medecin._id,
            dateConsultation: dateConsultation,
            statut: 'FAITE',
            aptitudeDetails: {
              hc: 'APTE',
              th: 'APTE',
              cir: 'APTE'
            },
            classe: Math.floor(Math.random() * 5) + 1, // Classe aléatoire 1-5
            observations: `Consultation de test - ${employeData.description}`,
            rendezVous: rendezVous._id
          });
          await consultation.save();
          console.log(`  🩺 Consultation créée (il y a ${employeData.consultationMoisAgo} mois)`);
        } else {
          console.log('  🩺 Consultation existe déjà');
        }

        // Calculer le statut attendu
        const dateAujourdhui = new Date();
        const dateProchaineVisite = new Date(dateConsultation);
        dateProchaineVisite.setFullYear(dateProchaineVisite.getFullYear() + 1);
        
        const dateAlerte = new Date(dateProchaineVisite);
        dateAlerte.setMonth(dateAlerte.getMonth() - 1);

        let statutAttendu;
        if (dateAujourdhui > dateProchaineVisite) {
          statutAttendu = '🔴 VISITE REQUISE';
        } else if (dateAujourdhui >= dateAlerte) {
          statutAttendu = '🟡 VISITE PROCHE';
        } else {
          statutAttendu = '🟢 À JOUR';
        }
        console.log(`  📊 Statut attendu: ${statutAttendu}`);
      } else {
        console.log('  📊 Statut attendu: 🔴 VISITE REQUISE (aucune consultation)');
      }
      console.log('');
    }

    console.log('🎯 RÉSUMÉ DES EMPLOYÉS DE TEST:');
    console.log('┌─────────┬─────────────────┬─────────────────────┬─────────────────┐');
    console.log('│ Matricule│ Nom             │ Entité              │ Statut Attendu  │');
    console.log('├─────────┼─────────────────┼─────────────────────┼─────────────────┤');
    console.log('│ TEST002 │ DUPONT Marie    │ Service RH          │ 🔴 Visite Requise│');
    console.log('│ TEST003 │ BERNARD Pierre  │ Service IT          │ 🔴 Visite Requise│');
    console.log('│ TEST004 │ MOREAU Sophie   │ Service Comptabilité│ 🟡 Visite Proche │');
    console.log('│ TEST005 │ PETIT Luc       │ Service Production  │ 🟢 À jour        │');
    console.log('│ TEST006 │ ROUX Julie      │ Service Marketing   │ 🟢 À jour        │');
    console.log('└─────────┴─────────────────┴─────────────────────┴─────────────────┘');

    console.log('\n🧪 INSTRUCTIONS DE TEST:');
    console.log('1. Aller sur /admin/employes');
    console.log('2. Observer la colonne STATUS VISITE pour chaque employé TEST');
    console.log('3. Vérifier que les badges correspondent aux statuts attendus');
    console.log('4. Cliquer sur l\'œil pour voir les détails de chaque employé');
    console.log('5. Vérifier les informations de visite médicale dans les détails');

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnexion de MongoDB');
  }
}

// Exécuter le script
if (require.main === module) {
  addMultipleTestEmployees();
}

module.exports = addMultipleTestEmployees;
