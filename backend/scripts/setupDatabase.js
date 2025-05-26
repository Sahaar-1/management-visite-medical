const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');
const Employe = require('../src/models/Employe');
const RendezVous = require('../src/models/RendezVous');
const Historique = require('../src/models/Historique');

// Configuration de la base de données
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gestion-visites-med';

async function setupCompleteDatabase() {
  try {
    console.log('🚀 Configuration complète de la base de données...\n');

    // Connexion à MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connexion à MongoDB réussie');

    // 1. Créer un médecin admin
    console.log('\n👨‍⚕️ Création du compte médecin...');
    
    let medecin = await User.findOne({ role: 'medecin' });
    if (!medecin) {
      const hashedPassword = await bcrypt.hash('medecin123', 10);
      medecin = new User({
        nom: 'BENALI',
        prenom: 'Dr. Ahmed',
        email: 'medecin@test.com',
        motDePasse: hashedPassword,
        role: 'medecin'
      });
      await medecin.save();
      console.log('✅ Médecin créé: medecin@test.com / medecin123');
    } else {
      console.log('✅ Médecin existe déjà:', medecin.email);
    }

    // 2. Créer un admin
    console.log('\n👨‍💼 Création du compte admin...');
    
    let admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      admin = new User({
        nom: 'ADMIN',
        prenom: 'Système',
        email: 'admin@test.com',
        motDePasse: hashedPassword,
        role: 'admin'
      });
      await admin.save();
      console.log('✅ Admin créé: admin@test.com / admin123');
    } else {
      console.log('✅ Admin existe déjà:', admin.email);
    }

    // 3. Importer les données VMS 2025
    console.log('\n📊 Import des données VMS 2025...');
    
    // Données VMS 2025 (échantillon pour test rapide)
    const vms2025Sample = [
      { matricule: '47574', nom: 'MASKINI', prenom: 'Lahcen', entite: 'OIG/B/L', dateVMS: '12/02/2025' },
      { matricule: '9810', nom: 'ERRIAHI', prenom: 'Abdelghani', entite: 'OIG/B/E/I', dateVMS: '19/02/2025' },
      { matricule: '40174', nom: 'BOUALALA', prenom: 'Elmehdi', entite: 'OIG/B/L', dateVMS: '12/02/2025' },
      { matricule: '41164', nom: 'AGOURYA', prenom: 'Said', entite: 'OIG/B/E/T', dateVMS: '15/04/2025' },
      { matricule: '41437', nom: 'SABRI', prenom: 'Majid', entite: 'OIG/B/E/D', dateVMS: '26/03/2025' },
      { matricule: '42537', nom: 'SIRRY', prenom: 'Mohammed', entite: 'OIG/B/H', dateVMS: '15/04/2025' },
      { matricule: '42551', nom: 'AISSA-OUHADOU', prenom: 'Zakaria', entite: 'OIG/B/E/D', dateVMS: '16/04/2025' },
      { matricule: '42596', nom: 'EL HADDANI', prenom: 'Mouhcine', entite: 'OIG/B/E/I', dateVMS: '04/04/2025' },
      { matricule: '42799', nom: 'AMAHROUD', prenom: 'Ottman', entite: 'OIG/B/L', dateVMS: '12/02/2025' },
      { matricule: '43059', nom: 'CHEBCHOUB', prenom: 'Noureddine', entite: 'OIG/B/E/T', dateVMS: '23/04/2025' }
    ];

    // Fonction pour convertir une date DD/MM/YYYY en objet Date
    function parseDate(dateStr) {
      const [day, month, year] = dateStr.split('/');
      return new Date(year, month - 1, day, 10, 0, 0);
    }

    let employesImportes = 0;
    let consultationsCreees = 0;

    for (const employeData of vms2025Sample) {
      // Créer l'employé
      let employe = await Employe.findOne({ matricule: employeData.matricule });
      if (!employe) {
        employe = new Employe({
          matricule: employeData.matricule,
          nom: employeData.nom,
          prenom: employeData.prenom,
          entite: employeData.entite,
          telephone: null
        });
        await employe.save();
        employesImportes++;
      }

      // Créer la consultation VMS 2025
      const dateVMS = parseDate(employeData.dateVMS);
      
      const consultationExistante = await Historique.findOne({
        employe: employe._id,
        medecin: medecin._id,
        dateConsultation: {
          $gte: new Date(dateVMS.getTime() - 24 * 60 * 60 * 1000),
          $lte: new Date(dateVMS.getTime() + 24 * 60 * 60 * 1000)
        }
      });

      if (!consultationExistante) {
        // Créer un rendez-vous
        const rendezVous = new RendezVous({
          date: dateVMS,
          medecin: medecin._id,
          employes: [employe._id],
          statut: 'termine'
        });
        await rendezVous.save();

        // Créer la consultation
        const consultation = new Historique({
          employe: employe._id,
          medecin: medecin._id,
          dateConsultation: dateVMS,
          statut: 'FAITE',
          aptitudeDetails: {
            hc: 'APTE',
            th: 'APTE',
            cir: 'APTE'
          },
          aptitudeGenerale: 'APTE',
          classe: 1,
          observations: `VMS 2025 - Visite médicale effectuée le ${dateVMS.toLocaleDateString('fr-FR')}`,
          rendezVous: rendezVous._id
        });
        await consultation.save();
        consultationsCreees++;
      }
    }

    console.log(`✅ ${employesImportes} employés importés`);
    console.log(`✅ ${consultationsCreees} consultations créées`);

    // 4. Créer quelques employés sans consultation (pour tester les statuts)
    console.log('\n👥 Création d\'employés de test...');
    
    const employesTest = [
      { matricule: 'TEST001', nom: 'MARTIN', prenom: 'Jean', entite: 'Service Test', statut: 'sans_consultation' },
      { matricule: 'TEST002', nom: 'DUPONT', prenom: 'Marie', entite: 'Service RH', statut: 'consultation_ancienne' },
      { matricule: 'TEST003', nom: 'BERNARD', prenom: 'Pierre', entite: 'Service IT', statut: 'consultation_proche' }
    ];

    for (const empTest of employesTest) {
      let employe = await Employe.findOne({ matricule: empTest.matricule });
      if (!employe) {
        employe = new Employe({
          matricule: empTest.matricule,
          nom: empTest.nom,
          prenom: empTest.prenom,
          entite: empTest.entite,
          telephone: '0123456789'
        });
        await employe.save();

        // Créer des consultations selon le statut
        if (empTest.statut === 'consultation_ancienne') {
          // Consultation il y a 13 mois (visite requise)
          const dateAncienne = new Date();
          dateAncienne.setMonth(dateAncienne.getMonth() - 13);
          
          const rdvAncien = new RendezVous({
            date: dateAncienne,
            medecin: medecin._id,
            employes: [employe._id],
            statut: 'termine'
          });
          await rdvAncien.save();

          const consultationAncienne = new Historique({
            employe: employe._id,
            medecin: medecin._id,
            dateConsultation: dateAncienne,
            statut: 'FAITE',
            aptitudeDetails: { hc: 'APTE', th: 'APTE', cir: 'APTE' },
            aptitudeGenerale: 'APTE',
            classe: 1,
            observations: 'Consultation de test - ancienne',
            rendezVous: rdvAncien._id
          });
          await consultationAncienne.save();
        } else if (empTest.statut === 'consultation_proche') {
          // Consultation il y a 11 mois (visite proche)
          const dateProche = new Date();
          dateProche.setMonth(dateProche.getMonth() - 11);
          
          const rdvProche = new RendezVous({
            date: dateProche,
            medecin: medecin._id,
            employes: [employe._id],
            statut: 'termine'
          });
          await rdvProche.save();

          const consultationProche = new Historique({
            employe: employe._id,
            medecin: medecin._id,
            dateConsultation: dateProche,
            statut: 'FAITE',
            aptitudeDetails: { hc: 'APTE', th: 'APTE', cir: 'APTE' },
            aptitudeGenerale: 'APTE',
            classe: 1,
            observations: 'Consultation de test - proche',
            rendezVous: rdvProche._id
          });
          await consultationProche.save();
        }
        // Pour 'sans_consultation', on ne crée rien
      }
    }

    console.log('✅ Employés de test créés');

    // 5. Afficher le résumé
    const totalEmployes = await Employe.countDocuments();
    const totalConsultations = await Historique.countDocuments();
    const totalRendezVous = await RendezVous.countDocuments();
    const totalUsers = await User.countDocuments();

    console.log('\n🎯 RÉSUMÉ DE LA BASE DE DONNÉES:');
    console.log(`👥 Utilisateurs: ${totalUsers}`);
    console.log(`👤 Employés: ${totalEmployes}`);
    console.log(`📅 Rendez-vous: ${totalRendezVous}`);
    console.log(`🩺 Consultations: ${totalConsultations}`);

    console.log('\n🔑 COMPTES CRÉÉS:');
    console.log('👨‍⚕️ Médecin: medecin@test.com / medecin123');
    console.log('👨‍💼 Admin: admin@test.com / admin123');

    console.log('\n🧪 TESTS DISPONIBLES:');
    console.log('1. Connexion admin: http://localhost:3000/admin');
    console.log('2. Connexion médecin: http://localhost:3000/medecin');
    console.log('3. Gestion employés: http://localhost:3000/admin/employes');
    console.log('4. Filtrer par statut: Utiliser les filtres dans l\'interface');

    console.log('\n✅ Base de données configurée avec succès !');

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnexion de MongoDB');
  }
}

// Exécuter le script
if (require.main === module) {
  setupCompleteDatabase();
}

module.exports = setupCompleteDatabase;
