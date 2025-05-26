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

// Données réelles avec dates 2025
const donneesReelles = [
  { matricule: "47574", nom: "MASKINI", prenom: "Lahcen", entite: "OIG/B/L", date: "12/02/2025" },
  { matricule: "9810", nom: "ERRIAHI", prenom: "Abdelghani", entite: "OIG/B/E/I", date: "19/02/2025" },
  { matricule: "40174", nom: "BOUALALA", prenom: "Elmehdi", entite: "OIG/B/L", date: "12/02/2025" },
  { matricule: "41164", nom: "AGOURYA", prenom: "Said", entite: "OIG/B/E/T", date: "15/04/2025" },
  { matricule: "41437", nom: "SABRI", prenom: "Majid", entite: "OIG/B/E/D", date: "26/03/2025" },
  { matricule: "42537", nom: "SIRRY", prenom: "Mohammed", entite: "OIG/B/H", date: "15/04/2025" },
  { matricule: "42551", nom: "AISSA-OUHADOU", prenom: "Zakaria", entite: "OIG/B/E/D", date: "16/04/2025" },
  { matricule: "42596", nom: "EL HADDANI", prenom: "Mouhcine", entite: "OIG/B/E/I", date: "04/04/2025" },
  { matricule: "42799", nom: "AMAHROUD", prenom: "Ottman", entite: "OIG/B/L", date: "12/02/2025" },
  { matricule: "43059", nom: "CHEBCHOUB", prenom: "Noureddine", entite: "OIG/B/E/T", date: "23/04/2025" },
  { matricule: "43905", nom: "ISSIL", prenom: "Khalid", entite: "OIG/B/L", date: "12/02/2025" },
  { matricule: "43924", nom: "SBAAI", prenom: "Soufiane", entite: "OIG/B/E/I", date: "03/04/2025" },
  { matricule: "48722", nom: "ABOUSSAD", prenom: "Said", entite: "OIG/B/E/I", date: "17/03/2025" },
  { matricule: "48777", nom: "ROUSTANI", prenom: "Abderrahim", entite: "OIG/B/P", date: "25/04/2025" },
  { matricule: "48999", nom: "HAJEB", prenom: "Hamid", entite: "OIG/B/E/T", date: "15/04/2025" },
  { matricule: "49132", nom: "NACHIT", prenom: "Abderrahim", entite: "OIG/B/E/T", date: "24/03/2025" },
  { matricule: "49154", nom: "AMANE", prenom: "Ahmed", entite: "OIG/B/E/T", date: "25/02/2025" },
  { matricule: "49160", nom: "BENKARROUM", prenom: "Amine", entite: "OIG/B/E/T", date: "24/03/2025" },
  { matricule: "49162", nom: "EL ALLALI", prenom: "Rafik", entite: "OIG/B/M", date: "18/04/2025" },
  { matricule: "49394", nom: "EL BALADI", prenom: "Hicham", entite: "OIG/B/E/T", date: "03/04/2025" },
  { matricule: "49395", nom: "AHDIDOU", prenom: "Youness", entite: "OIG/B/E/T", date: "23/04/2025" },
  { matricule: "49644", nom: "ESSOKTANI", prenom: "Haddi", entite: "OIG/B/M", date: "11/02/2025" },
  { matricule: "49886", nom: "EL HASNAOUY", prenom: "Hamid", entite: "OIG/B/B", date: "17/02/2025" },
  { matricule: "49991", nom: "TALEB", prenom: "Morad", entite: "OIG/B/E/I", date: "22/04/2025" },
  { matricule: "50009", nom: "HAMMALATE", prenom: "Lahcen", entite: "OIG/B/E/I", date: "06/03/2025" },
  { matricule: "50023", nom: "AZAGHAR", prenom: "Lhabib", entite: "OIG/B/E/T", date: "04/04/2025" },
  { matricule: "50183", nom: "DADSI", prenom: "Rhafour", entite: "OIG/B/B", date: "10/04/2025" },
  { matricule: "50497", nom: "RAMNI", prenom: "Hassan", entite: "OIG/B/E/D", date: "11/02/2025" },
  { matricule: "50526", nom: "ZERHOUNI", prenom: "Kamal", entite: "OIG/B/E/T", date: "24/02/2025" },
  { matricule: "50528", nom: "CHKAR", prenom: "Rachid", entite: "OIG/B/E/D", date: "12/02/2025" },
  { matricule: "51245", nom: "CHRAIBI", prenom: "Mohamed", entite: "OIG/B/B", date: "17/04/2025" },
  { matricule: "51702", nom: "IHARTI", prenom: "Youssef", entite: "OIG/B/L", date: "12/02/2025" },
  { matricule: "52627", nom: "ALIOUINE", prenom: "Khalid", entite: "OIG/B/E/T", date: "04/04/2025" },
  { matricule: "52989", nom: "CHOUNI", prenom: "Mouhcine", entite: "OIG/B/B", date: "02/04/2025" },
  { matricule: "52994", nom: "LEMBAIAD", prenom: "Mohammed", entite: "OIG/B/B", date: "15/04/2025" },
  { matricule: "53540", nom: "BARJE", prenom: "Zakaria", entite: "OIG/B/E/I", date: "18/03/2025" },
  { matricule: "46498", nom: "SOUSSI", prenom: "Omar", entite: "OIG/B/E/T", date: "26/03/2025" },
  { matricule: "46624", nom: "DEROUICH", prenom: "Ahmed", entite: "OIG/B/E/D", date: "03/04/2025" },
  { matricule: "47063", nom: "ALLAM", prenom: "Abdellatif", entite: "OIG/B/E/T", date: "24/02/2025" },
  { matricule: "48053", nom: "ADDI", prenom: "Ali", entite: "OIG/B/L", date: "04/04/2025" },
  { matricule: "53069", nom: "LOURIKA", prenom: "Najib", entite: "OIG/B/M", date: "22/04/2025" },
  { matricule: "55188", nom: "LAAROSSI", prenom: "Mohamed", entite: "OIG/B/B", date: "08/04/2025" },
  { matricule: "55194", nom: "HOUSNI", prenom: "Moulay M Hamed", entite: "OIG/B/M", date: "22/04/2025" },
  { matricule: "55228", nom: "FAKIR", prenom: "Abdechafi", entite: "OIG/B/E/I", date: "15/04/2025" },
  { matricule: "55298", nom: "JAROUAOU", prenom: "Brahim", entite: "OIG/B/E/D", date: "23/04/2025" },
  { matricule: "55303", nom: "OULD CHERIF", prenom: "Moulay El Hassan", entite: "OIG/B/E/T", date: "13/02/2025" },
  { matricule: "55341", nom: "EZZARI", prenom: "Abdelhadi", entite: "OIG/B/E/D", date: "15/04/2025" },
  { matricule: "55343", nom: "AIT AHMAD", prenom: "Abdellatif", entite: "OIG/B/E/T", date: "04/04/2025" },
  { matricule: "55347", nom: "NAOUI", prenom: "Mohamed Taha", entite: "OIG/B/E/D", date: "16/04/2025" },
  { matricule: "55358", nom: "DARSI", prenom: "Younes", entite: "OIG/B/B", date: "09/04/2025" },
  { matricule: "55368", nom: "BENELKHABBAR", prenom: "Abdelbaqui", entite: "OIG/B/B", date: "08/04/2025" },
  { matricule: "55412", nom: "ENNAJI", prenom: "Adil", entite: "OIG/B/E/T", date: "18/04/2025" },
  { matricule: "56012", nom: "KHALID", prenom: "Ahmed", entite: "OIG/B/M", date: "23/04/2025" },
  { matricule: "56064", nom: "EL BOUNDOUKKI", prenom: "Adil", entite: "OIG/B/B", date: "08/04/2025" },
  { matricule: "56464", nom: "ELAAYDY", prenom: "Abdelmajid", entite: "OIG/B/B", date: "09/04/2025" },
  { matricule: "56642", nom: "EZOUITI", prenom: "Abdellah", entite: "OIG/B/E/I", date: "07/04/2025" },
  { matricule: "56988", nom: "RHAIOUT", prenom: "Brahim", entite: "OIG/B/B", date: "17/02/2025" },
  { matricule: "58095", nom: "EROUAGDA", prenom: "Rachid", entite: "OIG/B/E/T", date: "24/01/2025" },
  { matricule: "58107", nom: "SOFFI", prenom: "Abdelaziz", entite: "OIG/B/E/T", date: "26/03/2025" },
  { matricule: "58760", nom: "DOUBAJ", prenom: "Driss", entite: "OIG/B/E/I", date: "18/03/2025" },
  { matricule: "58765", nom: "BAITAR", prenom: "Brahim", entite: "OIG/B/E/I", date: "20/02/2025" },
  { matricule: "58800", nom: "MOUSSA", prenom: "Youssef", entite: "OIG/B/B", date: "11/02/2025" },
  { matricule: "76870", nom: "EL OUARGUI", prenom: "Abdelhadi", entite: "OIG/B/M", date: "17/02/2025" },
  { matricule: "76901", nom: "NADYF", prenom: "Abderrazaq", entite: "OIG/B/E/T", date: "23/04/2025" },
  { matricule: "76904", nom: "RDIMI", prenom: "Aziz", entite: "OIG/B/E/T", date: "12/02/2025" },
  { matricule: "76915", nom: "BENFATAH", prenom: "Hicham", entite: "OIG/B/B", date: "17/04/2025" },
  { matricule: "76921", nom: "SAQQAA", prenom: "Imad", entite: "OIG/B/B", date: "10/04/2025" },
  { matricule: "76944", nom: "MALLAL", prenom: "Abdeltif", entite: "OIG/B/E/D", date: "23/04/2025" },
  { matricule: "76966", nom: "ASSANAA", prenom: "Rachid", entite: "OIG/B/E/I", date: "20/02/2025" },
  { matricule: "76989", nom: "EL BOUZIDI", prenom: "Youssef", entite: "OIG/B/E/I", date: "09/04/2025" },
  { matricule: "77352", nom: "AIT ABBOU", prenom: "Abdelhak", entite: "OIG/B/E/I", date: "17/03/2025" },
  { matricule: "47523", nom: "ELHAINE", prenom: "Mohammed", entite: "OIG/B/E/T", date: "10/03/2025" },
  { matricule: "40430", nom: "KOUDRI", prenom: "Hamza", entite: "OIG/B/E/I", date: "11/02/2025" },
  { matricule: "40641", nom: "BOUDRA", prenom: "JAWAD", entite: "OIG/B/E/I", date: "07/02/2025" },
  { matricule: "40927", nom: "EL BAHI", prenom: "OTHMANE", entite: "OIG/B/E/I", date: "18/04/2025" },
  { matricule: "41163", nom: "CHTOUKI", prenom: "Abdelmajid", entite: "OIG/B/L", date: "26/03/2025" },
  { matricule: "41528", nom: "SRAIDI", prenom: "Adil", entite: "OIG/B/E/D", date: "18/04/2025" },
  { matricule: "42577", nom: "BOURROUS", prenom: "Hicham", entite: "OIG/B/E/I", date: "10/04/2025" },
  { matricule: "42653", nom: "NAIM", prenom: "Chams-Eddine", entite: "OIG/B/E/D", date: "24/03/2025" },
  { matricule: "43008", nom: "MECHRI", prenom: "Ahmed", entite: "OIG/B/E/D", date: "22/04/2025" },
  { matricule: "43018", nom: "NKIRA", prenom: "Hamza", entite: "OIG/B/M", date: "18/04/2025" },
  { matricule: "43439", nom: "BASSAM", prenom: "Abdelhak", entite: "OIG/B/E/D", date: "17/04/2025" },
  { matricule: "43476", nom: "AJROUB", prenom: "RABI", entite: "OIG/B/E/I", date: "28/02/2025" },
  { matricule: "43485", nom: "EL MDAOUER", prenom: "Nabil", entite: "OIG/B/M", date: "22/04/2025" },
  { matricule: "43766", nom: "ATBIR", prenom: "Ahmed", entite: "OIG/B/E/D", date: "16/04/2025" },
  { matricule: "49651", nom: "ELHAMRI", prenom: "Mounir", entite: "OIG/B/B", date: "09/04/2025" },
  { matricule: "49989", nom: "JOOKARE", prenom: "El Mahdi", entite: "OIG/B/E/I", date: "09/04/2025" },
  { matricule: "51168", nom: "ELLAOUI", prenom: "Ahmed", entite: "OIG/B/B", date: "09/04/2025" },
  { matricule: "52801", nom: "KASIMI", prenom: "Hicham", entite: "OIG/B/B", date: "09/04/2025" },
  { matricule: "53006", nom: "ROUINA", prenom: "Said", entite: "OIG/B/E/D", date: "08/04/2025" },
  { matricule: "53007", nom: "MEKKASS", prenom: "Abdelkader", entite: "OIG/B/E/T", date: "19/03/2025" },
  { matricule: "53021", nom: "EL MESTANNI", prenom: "Khalid", entite: "OIG/B/B", date: "08/04/2025" },
  { matricule: "47169", nom: "EL HAYANY", prenom: "Mohammed", entite: "OIG/B/E/T", date: "25/02/2025" },
  { matricule: "47171", nom: "GUERMAOUI", prenom: "Samir", entite: "OIG/B/E/I", date: "25/02/2025" },
  { matricule: "47175", nom: "GHACHI", prenom: "Hassan", entite: "OIG/B/E/T", date: "24/02/2025" },
  { matricule: "47352", nom: "LOTFALLAH", prenom: "Ahmed", entite: "OIG/B/E/T", date: "26/03/2025" },
  { matricule: "54963", nom: "BELLABCHARA", prenom: "Amine", entite: "OIG/B/E/I", date: "09/04/2025" },
  { matricule: "55193", nom: "EL KHARRAT", prenom: "Najib", entite: "OIG/B/B", date: "15/04/2025" },
  { matricule: "57831", nom: "CHEIKH", prenom: "El Mahjoub", entite: "OIG/B/L", date: "03/04/2025" },
  { matricule: "58015", nom: "AIT TALEB ALI", prenom: "Mostapha", entite: "OIG/B/E/I", date: "09/04/2025" },
  { matricule: "58059", nom: "SAADALLAH", prenom: "Zakaria", entite: "OIG/B/L", date: "14/04/2025" },
  { matricule: "76235", nom: "DOUKARNE", prenom: "Abdessadek", entite: "OIG/B/B", date: "10/04/2025" },
  { matricule: "76283", nom: "MALLOUK", prenom: "Mhammed", entite: "OIG/B/E/I", date: "04/04/2025" },
  { matricule: "76867", nom: "MEZDIOUI", prenom: "Younes", entite: "OIG/B/M", date: "18/04/2025" },
  { matricule: "77199", nom: "LACHTANE", prenom: "Jamal", entite: "OIG/B/M", date: "22/04/2025" },
  { matricule: "77207", nom: "LAMKHANTER", prenom: "Rachid", entite: "OIG/B/E/T", date: "12/02/2025" },
  { matricule: "78315", nom: "AOUINATI", prenom: "Noureddine", entite: "OIG/B/E/I", date: "26/03/2025" }
];

function parseDate(dateStr) {
  // Convertir DD/MM/YYYY en objet Date
  const [day, month, year] = dateStr.split('/');
  return new Date(year, month - 1, day); // month - 1 car les mois commencent à 0
}

async function addRealData2025() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connecté à MongoDB');

    console.log(`📋 Traitement de ${donneesReelles.length} employés avec dates 2025...`);

    let compteurMisAJour = 0;
    let compteurCrees = 0;
    let compteurErreurs = 0;

    for (const donnee of donneesReelles) {
      try {
        // Convertir la date
        const dateVisite = parseDate(donnee.date);
        
        // Chercher l'employé existant
        const employeExistant = await Employe.findOne({ matricule: donnee.matricule });
        
        if (employeExistant) {
          // Mettre à jour l'employé existant
          await Employe.updateOne(
            { matricule: donnee.matricule },
            { 
              dateDerniereVisiteMedicale: dateVisite,
              updatedAt: new Date()
            }
          );
          console.log(`✅ Mis à jour: ${donnee.matricule} ${donnee.nom} → ${donnee.date}`);
          compteurMisAJour++;
        } else {
          // Créer un nouvel employé
          const nouvelEmploye = new Employe({
            matricule: donnee.matricule,
            nom: donnee.nom,
            prenom: donnee.prenom,
            entite: donnee.entite,
            dateDerniereVisiteMedicale: dateVisite,
            statut: 'actif'
          });
          
          await nouvelEmploye.save();
          console.log(`🆕 Créé: ${donnee.matricule} ${donnee.nom} → ${donnee.date}`);
          compteurCrees++;
        }
      } catch (error) {
        console.error(`❌ Erreur pour ${donnee.matricule} ${donnee.nom}:`, error.message);
        compteurErreurs++;
      }
    }

    console.log(`\n🎉 Traitement terminé!`);
    console.log(`✅ Employés mis à jour: ${compteurMisAJour}`);
    console.log(`🆕 Employés créés: ${compteurCrees}`);
    console.log(`❌ Erreurs: ${compteurErreurs}`);

    // Afficher les statistiques finales
    await afficherStatistiques();

  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout des données réelles:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
}

async function afficherStatistiques() {
  try {
    const maintenant = new Date();
    
    const total = await Employe.countDocuments();
    const avecDates2025 = await Employe.countDocuments({ 
      dateDerniereVisiteMedicale: { 
        $gte: new Date('2025-01-01'),
        $lt: new Date('2026-01-01')
      } 
    });

    console.log('\n📊 STATISTIQUES APRÈS IMPORT:');
    console.log(`👥 Total employés: ${total}`);
    console.log(`📅 Avec dates 2025: ${avecDates2025}`);
    console.log(`⚠️  ATTENTION: Toutes les dates 2025 sont dans le futur!`);
    console.log(`🔧 Le système les traitera comme "Visite Requise" automatiquement.`);

  } catch (error) {
    console.error('❌ Erreur lors du calcul des statistiques:', error);
  }
}

// Exécuter le script
addRealData2025();
