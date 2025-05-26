const mongoose = require('mongoose');
const Consultation = require('../src/models/Consultation');
const Historique = require('../src/models/Historique');
const RendezVous = require('../src/models/RendezVous');
const Employe = require('../src/models/Employe');
const User = require('../src/models/User');

// Configuration de la base de données
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gestion-visites-med';

async function diagnosticConsultations() {
  try {
    console.log('🔍 Diagnostic des consultations et statuts...\n');

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

    // 2. Vérifier les rendez-vous d'aujourd'hui
    console.log('\n📅 RENDEZ-VOUS D\'AUJOURD\'HUI:');
    const rendezVousAujourdhui = await RendezVous.find({
      date: {
        $gte: startOfToday,
        $lte: endOfToday
      }
    }).populate('employes', 'nom prenom matricule').populate('medecin', 'nom prenom');

    console.log(`Total rendez-vous aujourd'hui: ${rendezVousAujourdhui.length}`);
    
    rendezVousAujourdhui.forEach((rdv, index) => {
      console.log(`${index + 1}. RDV ${rdv._id} - Statut: ${rdv.statut} - Employés: ${rdv.employes?.length || 0}`);
      rdv.employes?.forEach(emp => {
        console.log(`   - ${emp.prenom} ${emp.nom} (${emp.matricule})`);
      });
    });

    // 3. Vérifier la cohérence entre consultations et rendez-vous
    console.log('\n🔄 COHÉRENCE CONSULTATIONS/RENDEZ-VOUS:');
    for (const consultation of consultationsAujourdhui) {
      const rdv = await RendezVous.findById(consultation.rendezVousId);
      if (rdv) {
        console.log(`✅ Consultation ${consultation._id} liée au RDV ${rdv._id} (statut RDV: ${rdv.statut})`);
        
        // Vérifier si le statut du RDV doit être mis à jour
        if (consultation.statut === 'FAITE' && rdv.statut !== 'termine') {
          console.log(`⚠️  RDV ${rdv._id} devrait être marqué comme 'termine'`);
        }
      } else {
        console.log(`❌ Consultation ${consultation._id} sans RDV valide`);
      }
    }

    // 4. Vérifier l'historique
    console.log('\n📚 HISTORIQUE:');
    const historiqueAujourdhui = await Historique.find({
      dateConsultation: {
        $gte: startOfToday,
        $lte: endOfToday
      }
    }).populate('employe', 'nom prenom matricule').populate('medecin', 'nom prenom');

    console.log(`Total historique aujourd'hui: ${historiqueAujourdhui.length}`);
    
    historiqueAujourdhui.forEach((hist, index) => {
      console.log(`${index + 1}. ${hist.employe?.prenom} ${hist.employe?.nom} - Statut: ${hist.statut}`);
    });

    // 5. Identifier les problèmes
    console.log('\n🚨 PROBLÈMES IDENTIFIÉS:');
    
    // Consultations sans historique
    const consultationsSansHistorique = [];
    for (const consultation of consultationsAujourdhui) {
      const histExiste = historiqueAujourdhui.find(h => 
        h.employe?._id.toString() === consultation.employeId?._id.toString() &&
        h.medecin?._id.toString() === consultation.medecinId?._id.toString()
      );
      if (!histExiste) {
        consultationsSansHistorique.push(consultation);
      }
    }

    if (consultationsSansHistorique.length > 0) {
      console.log(`❌ ${consultationsSansHistorique.length} consultations sans historique:`);
      consultationsSansHistorique.forEach(c => {
        console.log(`   - ${c.employeId?.prenom} ${c.employeId?.nom} (${c.statut})`);
      });
    }

    // RDV pas mis à jour
    const rdvNonMisAJour = [];
    for (const rdv of rendezVousAujourdhui) {
      const consultationsRdv = consultationsAujourdhui.filter(c => 
        c.rendezVousId?.toString() === rdv._id.toString()
      );
      
      if (consultationsRdv.length > 0 && rdv.statut !== 'termine') {
        rdvNonMisAJour.push({ rdv, consultations: consultationsRdv });
      }
    }

    if (rdvNonMisAJour.length > 0) {
      console.log(`❌ ${rdvNonMisAJour.length} rendez-vous pas mis à jour:`);
      rdvNonMisAJour.forEach(item => {
        console.log(`   - RDV ${item.rdv._id} (statut: ${item.rdv.statut}) avec ${item.consultations.length} consultations`);
      });
    }

    return {
      consultationsAujourdhui,
      rendezVousAujourdhui,
      historiqueAujourdhui,
      consultationsSansHistorique,
      rdvNonMisAJour
    };

  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnexion de MongoDB');
  }
}

async function corrigerProblemes() {
  try {
    console.log('🔧 Correction des problèmes identifiés...\n');

    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connexion à MongoDB réussie');

    const diagnostic = await diagnosticConsultations();
    
    let corrections = 0;

    // 1. Créer l'historique manquant
    if (diagnostic.consultationsSansHistorique.length > 0) {
      console.log('\n🔧 Création de l\'historique manquant...');
      
      for (const consultation of diagnostic.consultationsSansHistorique) {
        try {
          const historique = new Historique({
            employe: consultation.employeId._id,
            medecin: consultation.medecinId._id,
            dateConsultation: consultation.dateConsultation,
            statut: consultation.statut,
            observations: consultation.observationMedecin || '',
            rendezVous: consultation.rendezVousId
          });

          // Ajouter les détails si consultation FAITE
          if (consultation.statut === 'FAITE') {
            historique.aptitudeDetails = consultation.aptitudeDetails || {
              hc: 'APTE',
              th: 'APTE',
              cir: 'APTE'
            };
            historique.aptitudeGenerale = consultation.aptitudeGenerale || 'APTE';
            historique.classe = consultation.classe || 1;
          }

          await historique.save();
          console.log(`✅ Historique créé pour ${consultation.employeId.prenom} ${consultation.employeId.nom}`);
          corrections++;
        } catch (error) {
          console.error(`❌ Erreur création historique pour ${consultation.employeId.prenom} ${consultation.employeId.nom}:`, error.message);
        }
      }
    }

    // 2. Mettre à jour les statuts des rendez-vous
    if (diagnostic.rdvNonMisAJour.length > 0) {
      console.log('\n🔧 Mise à jour des statuts de rendez-vous...');
      
      for (const item of diagnostic.rdvNonMisAJour) {
        try {
          await RendezVous.findByIdAndUpdate(
            item.rdv._id,
            { statut: 'termine' },
            { new: true }
          );
          console.log(`✅ RDV ${item.rdv._id} marqué comme terminé`);
          corrections++;
        } catch (error) {
          console.error(`❌ Erreur mise à jour RDV ${item.rdv._id}:`, error.message);
        }
      }
    }

    console.log(`\n🎯 ${corrections} corrections appliquées`);

  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error);
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
      await diagnosticConsultations();
      break;
    case 'corriger':
      await corrigerProblemes();
      break;
    default:
      console.log('🔧 Script de diagnostic des consultations');
      console.log('');
      console.log('Usage:');
      console.log('  node diagnosticConsultations.js diagnostic    # Analyser les problèmes');
      console.log('  node diagnosticConsultations.js corriger      # Corriger les problèmes');
      console.log('');
      console.log('Description:');
      console.log('  Ce script identifie et corrige les problèmes de cohérence');
      console.log('  entre consultations, rendez-vous et historique.');
      break;
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  main();
}

module.exports = { diagnosticConsultations, corrigerProblemes };
