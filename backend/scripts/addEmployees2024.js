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

// Nouveaux employés avec dates 2024 (ou sans dates)
const nouveauxEmployes = [
  { matricule: "46313", nom: "FATIH", prenom: "Mustapha", entite: "OIG/B/M", date: "23/04/2024" },
  { matricule: "47219", nom: "CHAKOUB", prenom: "Said", entite: "OIG/B/E/T", date: "16/04/2024" },
  { matricule: "40041", nom: "TAIA", prenom: "Nabil", entite: "OIG/B/L", date: null },
  { matricule: "40189", nom: "EL OUARDI", prenom: "Abdelouahed", entite: "OIG/B/M", date: null },
  { matricule: "40231", nom: "JELLOULI", prenom: "Taoufiq", entite: "OIG/B/L", date: "31/01/2024" },
  { matricule: "40384", nom: "BOURICH", prenom: "Ayoub", entite: "OIG/B/E/I", date: "02/04/2024" },
  { matricule: "40386", nom: "BENAICHE", prenom: "Abdelileh", entite: "OIG/B/M", date: "24/04/2024" },
  { matricule: "41077", nom: "OUASLAMI", prenom: "Youssef", entite: "OIG/B/E/I", date: "29/03/2024" },
  { matricule: "41171", nom: "OUARDI", prenom: "Imad", entite: "OIG/B/L", date: "31/01/2024" },
  { matricule: "41791", nom: "ZEROUAL", prenom: "Rabii", entite: "OIG/B/L", date: null },
  { matricule: "43076", nom: "FEKHKHARI", prenom: "Fouad", entite: "OIG/B/M", date: "02/04/2024" },
  { matricule: "43427", nom: "STENTANI", prenom: "Wadia", entite: "OIG/B/E/I", date: "15/04/2024" },
  { matricule: "43610", nom: "MENNAN", prenom: "Abdelkabir", entite: "OIG/B/L", date: null },
  { matricule: "43667", nom: "EL FATHI LALAOUI", prenom: "ISSAM", entite: "OIG/B/P", date: null },
  { matricule: "48714", nom: "HARRAG", prenom: "Ahmed", entite: "OIG/B/M", date: "26/04/2024" },
  { matricule: "48782", nom: "ZAHRAOUI", prenom: "Radouane", entite: "OIG/B/E/I", date: "22/04/2024" },
  { matricule: "49216", nom: "MAHBOUB", prenom: "Mohammed", entite: "OIG/B/E/I", date: "03/04/2024" },
  { matricule: "49294", nom: "ZAITOUNI", prenom: "Youssef", entite: "OIG/B/M", date: null },
  { matricule: "49408", nom: "MOUROU", prenom: "Khalid", entite: "OIG/B/M", date: "27/02/2024" },
  { matricule: "49532", nom: "BOUZIT", prenom: "Mohammed", entite: "OIG/B/L", date: null },
  { matricule: "50395", nom: "EL OUIDANI", prenom: "Salaheddine", entite: "OIG/B/E/I", date: "15/04/2024" },
  { matricule: "50733", nom: "BOULUIZ", prenom: "Youness", entite: "OIG/B/M", date: null },
  { matricule: "50975", nom: "FARID", prenom: "Zitouni", entite: "OIG/B/L", date: "01/02/2024" },
  { matricule: "51198", nom: "FAHM", prenom: "Abdellah", entite: "OIG/B/B", date: "24/04/2024" },
  { matricule: "51319", nom: "EL KHARKI", prenom: "Abdelbasset", entite: "OIG/B/P", date: "15/04/2024" },
  { matricule: "51802", nom: "CHERIF", prenom: "Ahmed", entite: "OIG/B/M", date: "02/04/2024" },
  { matricule: "52342", nom: "MESROURI", prenom: "Aziz", entite: "OIG/B/L", date: "03/04/2024" },
  { matricule: "52446", nom: "EL AACHIK", prenom: "Moulay Said", entite: "OIG/B/E/T", date: null },
  { matricule: "52991", nom: "KERDOUSS", prenom: "Samir", entite: "OIG/B/B", date: "23/04/2024" },
  { matricule: "53008", nom: "BAHRAM", prenom: "Mohamed", entite: "OIG/B/M", date: "07/02/2024" },
  { matricule: "47963", nom: "FAKHRI", prenom: "Mohammed", entite: "OIG/B/E/T", date: "17/04/2024" },
  { matricule: "54464", nom: "NOUAIL", prenom: "Larbi", entite: "OIG/B/L", date: "02/05/2024" },
  { matricule: "54771", nom: "MALHABI", prenom: "Khalid", entite: "OIG/B/E/D", date: null },
  { matricule: "55191", nom: "SINAMI", prenom: "Larabi", entite: "OIG/B/M", date: "02/05/2024" },
  { matricule: "55203", nom: "KHIRI", prenom: "Brahim", entite: "OIG/B/M", date: null },
  { matricule: "49132", nom: "GLIOUI", prenom: "El Mostafa", entite: "OIG/B/E/T", date: "28/03/2024" },
  { matricule: "55313", nom: "EL MAADAOUI", prenom: "Said", entite: "OIG/B/M", date: "03/04/2024" },
  { matricule: "55380", nom: "BENHARRAF", prenom: "Abdelali", entite: "OIG/B/B", date: "23/04/2024" },
  { matricule: "56001", nom: "EL AALLAOUI", prenom: "Salah", entite: "OIG/B/M", date: "09/04/2024" },
  { matricule: "56601", nom: "EL AMRANI", prenom: "Radouan", entite: "OIG/B/P", date: "06/03/2024" },
  { matricule: "57740", nom: "AHL LHOUCINE", prenom: "Hicham", entite: "OIG/B/P", date: null },
  { matricule: "57960", nom: "MAJDALLAH", prenom: "Mohammed", entite: "OIG/B/M", date: null },
  { matricule: "58021", nom: "BAKRAOUI", prenom: "El Haj", entite: "OIG/B/E/I", date: "28/02/2024" },
  { matricule: "58023", nom: "CHAHDI", prenom: "Morad", entite: "OIG/B/E/I", date: "20/02/2024" },
  { matricule: "58777", nom: "NAHID", prenom: "Abdelilah", entite: "OIG/B/E/T", date: "01/04/2024" },
  { matricule: "58797", nom: "JANAH", prenom: "Mohamed", entite: "OIG/B/M", date: "02/05/2024" },
  { matricule: "58798", nom: "MEZRIOUI", prenom: "Abdelilah", entite: "OIG/B/B", date: "02/05/2024" },
  { matricule: "58935", nom: "SAKKOUR", prenom: "Ismail", entite: "OIG/B/L", date: "01/02/2024" },
  { matricule: "76233", nom: "BENABDENBI", prenom: "Jihad", entite: "OIG/B/M", date: "08/04/2024" },
  { matricule: "76928", nom: "CHITOUKLI", prenom: "Rachid Jalal", entite: "OIG/B/E/I", date: "25/04/2024" },
  { matricule: "77224", nom: "AMRANI", prenom: "Hatim", entite: "OIG/B/E/D", date: null },
  { matricule: "92032", nom: "EL HNA", prenom: "Rachid", entite: "OIG/B/L", date: "31/01/2024" },
  { matricule: "92079", nom: "ELHAN", prenom: "Abdelmoumen", entite: "OIG/B/M", date: "23/04/2024" },
  { matricule: "47134", nom: "TOURABI", prenom: "Abdelilah", entite: "OIG/B/E/I", date: null },
  { matricule: "9671", nom: "EL HAJLAOUI", prenom: "Mohamed", entite: "OIG/B/L", date: "26/04/2024" },
  { matricule: "40234", nom: "ENNIRRI", prenom: "Tarik", entite: "OIG/B/E/I", date: "28/02/2024" },
  { matricule: "42312", nom: "ELRHAZLANI", prenom: "Abdelouahed", entite: "OIG/B/E/I", date: null },
  { matricule: "42588", nom: "EL BAROUDI", prenom: "Jamal", entite: "OIG/B/E/I", date: "24/04/2024" },
  { matricule: "42990", nom: "KADIRI", prenom: "Brahim", entite: "OIG/B/M", date: null },
  { matricule: "43578", nom: "FATTOUH", prenom: "Abdellah", entite: "OIG/B/L", date: "08/04/2024" },
  { matricule: "43597", nom: "KHOUZAR", prenom: "Abdelhakim", entite: "OIG/B/E/I", date: "25/04/2024" },
  { matricule: "53032", nom: "BYA", prenom: "Mohammed", entite: "OIG/B/E/I", date: "02/04/2024" },
  { matricule: "59091", nom: "TASDARTE", prenom: "Ahmed", entite: "OIG/B/L", date: "03/04/2024" },
  { matricule: "57995", nom: "EL AAMRI", prenom: "Mohammed", entite: "OIG/B/P", date: "20/02/2024" },
  { matricule: "58761", nom: "EL AMMARI", prenom: "Abdelkhalek", entite: "OIG/B/E/I", date: "22/04/2024" },
  { matricule: "76228", nom: "CHETOUI", prenom: "Rachid", entite: "OIG/B/M", date: "24/01/2024" },
  { matricule: "76872", nom: "KAZBIR", prenom: "Abdelmajid", entite: "OIG/B/M", date: null },
  { matricule: "76881", nom: "ABID ALLAH", prenom: "Mohammed", entite: "OIG/B/M", date: "02/05/2024" },
  { matricule: "76882", nom: "DOURTI", prenom: "Abderrahim", entite: "OIG/B/M", date: "15/04/2024" },
  { matricule: "76990", nom: "BEDDAD", prenom: "Jaouad", entite: "OIG/B/E/I", date: "02/05/2024" },
  { matricule: "76993", nom: "ZARHOUNI", prenom: "Abdelkader", entite: "OIG/B/E/I", date: "08/04/2024" },
  { matricule: "77191", nom: "MOUNIB", prenom: "Abdellatif", entite: "OIG/B/M", date: null }
];

function parseDate(dateStr) {
  if (!dateStr) return null;
  // Convertir DD/MM/YYYY en objet Date
  const [day, month, year] = dateStr.split('/');
  return new Date(year, month - 1, day); // month - 1 car les mois commencent à 0
}

async function addEmployees2024() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connecté à MongoDB');

    console.log(`📋 Traitement de ${nouveauxEmployes.length} nouveaux employés avec dates 2024...`);

    let compteurMisAJour = 0;
    let compteurCrees = 0;
    let compteurErreurs = 0;

    for (const donnee of nouveauxEmployes) {
      try {
        // Convertir la date (peut être null)
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
          console.log(`✅ Mis à jour: ${donnee.matricule} ${donnee.nom} → ${donnee.date || 'null'}`);
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
          console.log(`🆕 Créé: ${donnee.matricule} ${donnee.nom} → ${donnee.date || 'null'}`);
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
    console.error('❌ Erreur lors de l\'ajout des nouveaux employés:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
}

async function afficherStatistiques() {
  try {
    const maintenant = new Date();
    
    const total = await Employe.countDocuments();
    
    // Employés avec dates 2024
    const avecDates2024 = await Employe.countDocuments({ 
      dateDerniereVisiteMedicale: { 
        $gte: new Date('2024-01-01'),
        $lt: new Date('2025-01-01')
      } 
    });
    
    // Employés avec dates 2025 (futures)
    const avecDates2025 = await Employe.countDocuments({ 
      dateDerniereVisiteMedicale: { 
        $gte: new Date('2025-01-01'),
        $lt: new Date('2026-01-01')
      } 
    });
    
    // Employés sans dates
    const sansDates = await Employe.countDocuments({ 
      $or: [
        { dateDerniereVisiteMedicale: { $exists: false } }, 
        { dateDerniereVisiteMedicale: null }
      ] 
    });

    console.log('\n📊 STATISTIQUES FINALES:');
    console.log(`👥 Total employés: ${total}`);
    console.log(`📅 Avec dates 2024: ${avecDates2024} (Visite Requise)`);
    console.log(`📅 Avec dates 2025: ${avecDates2025} (Futures - traitées comme Visite Requise)`);
    console.log(`❌ Sans dates: ${sansDates} (Visite Requise)`);
    console.log(`\n🎯 RÉPARTITION ATTENDUE:`);
    console.log(`🔴 Visite Requise: ${avecDates2024 + avecDates2025 + sansDates} (${Math.round((avecDates2024 + avecDates2025 + sansDates)/total*100)}%)`);
    console.log(`🟡 Visite Proche: 0 (0%)`);
    console.log(`🟢 À jour: 0 (0%)`);

  } catch (error) {
    console.error('❌ Erreur lors du calcul des statistiques:', error);
  }
}

// Exécuter le script
addEmployees2024();
