const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Charger les variables d'environnement
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Modèle d'employé
const employeSchema = new mongoose.Schema({
  matricule: {
    type: String,
    required: true,
    unique: true
  },
  nom: {
    type: String,
    required: true
  },
  prenom: {
    type: String,
    required: true
  },
  entite: {
    type: String,
    required: true
  }
});

const Employe = mongoose.model('Employe', employeSchema);

// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Connecté à MongoDB');
  importEmployes();
})
.catch((err) => console.error('Erreur de connexion à MongoDB:', err));

// Fonction pour importer les employés
async function importEmployes() {
  try {
    // Données des employés (copiez-collez votre liste ici)
    const employesData = `47574 	 MASKINI 	 Lahcen 	 OIG/B/L 
9810 	 ERRIAHI 	 Abdelghani 	 OIG/B/E/I 
40174 	 BOUALALA 	 Elmehdi 	 OIG/B/L 
41164 	 AGOURYA 	 Said 	 OIG/B/E/T 
41437 	 SABRI 	 Majid 	 OIG/B/E/D 
42537 	 SIRRY 	 Mohammed 	 OIG/B/H 
42551 	 AISSA-OUHADOU 	 Zakaria 	 OIG/B/E/D 
42596 	 EL HADDANI 	 Mouhcine 	 OIG/B/E/I 
42799 	 AMAHROUD 	 Ottman 	 OIG/B/L 
43059 	 CHEBCHOUB 	 Noureddine 	 OIG/B/E/T 
43905 	 ISSIL 	 Khalid 	 OIG/B/L 
43924 	 SBAAI 	 Soufiane 	 OIG/B/E/I 
48722 	 ABOUSSAD 	 Said 	 OIG/B/E/I 
48777 	 ROUSTANI 	 Abderrahim 	 OIG/B/P 
48999 	 HAJEB 	 Hamid 	 OIG/B/E/T 
49132 	 NACHIT 	 Abderrahim 	 OIG/B/E/T 
49154 	 AMANE 	 Ahmed 	 OIG/B/E/T 
49160 	 BENKARROUM 	 Amine 	 OIG/B/E/T 
49162 	 EL ALLALI 	 Rafik 	 OIG/B/M 
49394 	 EL BALADI 	 Hicham 	 OIG/B/E/T 
49395 	 AHDIDOU 	 Youness 	 OIG/B/E/T 
49644 	 ESSOKTANI 	 Haddi 	 OIG/B/M 
49886 	 EL HASNAOUY 	 Hamid 	 OIG/B/B 
49991 	 TALEB 	 Morad 	 OIG/B/E/I 
50009 	 HAMMALATE 	 Lahcen 	 OIG/B/E/I 
50023 	 AZAGHAR 	 Lhabib 	 OIG/B/E/T 
50183 	 DADSI 	 Rhafour 	 OIG/B/B 
50497 	 RAMNI 	 Hassan 	 OIG/B/E/D 
50526 	 ZERHOUNI 	 Kamal 	 OIG/B/E/T 
50528 	 CHKAR 	 Rachid 	 OIG/B/E/D 
51245 	 CHRAIBI 	 Mohamed 	 OIG/B/B 
51702 	 IHARTI 	 Youssef 	 OIG/B/L 
52627 	 ALIOUINE 	 Khalid 	 OIG/B/E/T 
52989 	 CHOUNI 	 Mouhcine 	 OIG/B/B 
52994 	 LEMBAIAD 	 Mohammed 	 OIG/B/B 
53540 	 BARJE 	 Zakaria 	 OIG/B/E/I 
46498 	 SOUSSI 	 Omar 	 OIG/B/E/T 
46624 	 DEROUICH 	 Ahmed 	 OIG/B/E/D 
47063 	 ALLAM 	 Abdellatif 	 OIG/B/E/T 
48053 	 ADDI 	 Ali 	 OIG/B/L 
53069 	 LOURIKA 	 Najib 	 OIG/B/M 
55188 	 LAAROSSI 	 Mohamed 	 OIG/B/B 
55194 	 HOUSNI 	 Moulay M Hamed 	 OIG/B/M 
55228 	 FAKIR 	 Abdechafi 	 OIG/B/E/I 
55298 	 JAROUAOU 	 Brahim 	 OIG/B/E/D 
55303 	 OULD CHERIF 	 Moulay El Hassan 	 OIG/B/E/T 
55341 	 EZZARI 	 Abdelhadi 	 OIG/B/E/D 
55343 	 AIT AHMAD 	 Abdellatif 	 OIG/B/E/T 
55347 	 NAOUI 	 Mohamed Taha 	 OIG/B/E/D 
55358 	 DARSI 	 Younes 	 OIG/B/B 
55368 	 BENELKHABBAR 	 Abdelbaqui 	 OIG/B/B 
55412 	 ENNAJI 	 Adil 	 OIG/B/E/T 
56012 	 KHALID 	 Ahmed 	 OIG/B/M 
56064 	 EL BOUNDOUKKI 	 Adil 	 OIG/B/B 
56464 	 ELAAYDY 	 Abdelmajid 	 OIG/B/B 
56642 	 EZOUITI 	 Abdellah 	 OIG/B/E/I 
56988 	 RHAIOUT 	 Brahim 	 OIG/B/B 
58095 	 EROUAGDA 	 Rachid 	 OIG/B/E/T 
58107 	 SOFFI 	 Abdelaziz 	 OIG/B/E/T 
58760 	 DOUBAJ 	 Driss 	 OIG/B/E/I 
58765 	 BAITAR 	 Brahim 	 OIG/B/E/I 
58800 	 MOUSSA 	 Youssef 	 OIG/B/B 
76870 	 EL OUARGUI 	 Abdelhadi 	 OIG/B/M 
76901 	 NADYF 	 Abderrazaq 	 OIG/B/E/T 
76904 	 RDIMI 	 Aziz 	 OIG/B/E/T 
76915 	 BENFATAH 	 Hicham 	 OIG/B/B 
76921 	 SAQQAA 	 Imad 	 OIG/B/B 
76944 	 MALLAL 	 Abdeltif 	 OIG/B/E/D 
76966 	 ASSANAA 	 Rachid 	 OIG/B/E/I 
76989 	 EL BOUZIDI 	 Youssef 	 OIG/B/E/I 
77352 	 AIT ABBOU 	 Abdelhak 	 OIG/B/E/I 
47523 	 ELHAINE 	 Mohammed 	 OIG/B/E/T 
40430 	 KOUDRI 	 Hamza 	 OIG/B/E/I 
40641 	 BOUDRA 	 JAWAD 	 OIG/B/E/I 
40927 	 EL BAHI 	 OTHMANE 	 OIG/B/E/I 
41163 	 CHTOUKI 	 Abdelmajid 	 OIG/B/L 
41528 	 SRAIDI 	 Adil 	 OIG/B/E/D 
42577 	 BOURROUS 	 Hicham 	 OIG/B/E/I 
42653 	 NAIM 	 Chams-Eddine 	 OIG/B/E/D 
43008 	 MECHRI 	 Ahmed 	 OIG/B/E/D 
43018 	 NKIRA 	 Hamza 	 OIG/B/M 
43439 	 BASSAM 	 Abdelhak 	 OIG/B/E/D 
43476 	 AJROUB 	 RABI 	 OIG/B/E/I 
43485 	 EL MDAOUER 	 Nabil 	 OIG/B/M 
43766 	 ATBIR 	 Ahmed 	 OIG/B/E/D 
49651 	 ELHAMRI 	 Mounir 	 OIG/B/B 
49989 	 JOOKARE 	 El Mahdi 	 OIG/B/E/I 
51168 	 ELLAOUI 	 Ahmed 	 OIG/B/B 
52801 	 KASIMI 	 Hicham 	 OIG/B/B 
53006 	 ROUINA 	 Said 	 OIG/B/E/D 
53007 	 MEKKASS 	 Abdelkader 	 OIG/B/E/T 
53021 	 EL MESTANNI 	 Khalid 	 OIG/B/B 
47169 	 EL HAYANY 	 Mohammed 	 OIG/B/E/T 
47171 	 GUERMAOUI 	 Samir 	 OIG/B/E/I 
47175 	 GHACHI 	 Hassan 	 OIG/B/E/T 
47352 	 LOTFALLAH 	 Ahmed 	 OIG/B/E/T 
54963 	 BELLABCHARA 	 Amine 	 OIG/B/E/I 
55193 	 EL KHARRAT 	 Najib 	 OIG/B/B 
57831 	 CHEIKH 	 El Mahjoub 	 OIG/B/L 
58015 	 AIT TALEB ALI 	 Mostapha 	 OIG/B/E/I 
58059 	 SAADALLAH 	 Zakaria 	 OIG/B/L 
76235 	 DOUKARNE 	 Abdessadek 	 OIG/B/B 
76283 	 MALLOUK 	 Mhammed 	 OIG/B/E/I 
76867 	 MEZDIOUI 	 Younes 	 OIG/B/M 
77199 	 LACHTANE 	 Jamal 	 OIG/B/M 
77207 	 LAMKHANTER 	 Rachid 	 OIG/B/E/T 
78315 	 AOUINATI 	 Noureddine 	 OIG/B/E/I 
46313 	 FATIH 	 Mustapha 	 OIG/B/M 
47219 	 CHAKOUB 	 Said 	 OIG/B/E/T 
40041 	 TAIA 	 Nabil 	 OIG/B/L 
40189 	 EL OUARDI 	 Abdelouahed 	 OIG/B/M 
40231 	 JELLOULI 	 Taoufiq 	 OIG/B/L 
40384 	 BOURICH 	 Ayoub 	 OIG/B/E/I 
40386 	 BENAICHE 	 Abdelileh 	 OIG/B/M 
41077 	 OUASLAMI 	 Youssef 	 OIG/B/E/I 
41171 	 OUARDI 	 Imad 	 OIG/B/L 
41791 	 ZEROUAL 	 Rabii 	 OIG/B/L 
43076 	 FEKHKHARI 	 Fouad 	 OIG/B/M 
43427 	 STENTANI 	 Wadia 	 OIG/B/E/I 
43610 	 MENNAN 	 Abdelkabir 	 OIG/B/L 
43667 	 EL FATHI LALAOUI 	 ISSAM 	 OIG/B/P 
48714 	 HARRAG 	 Ahmed 	 OIG/B/M 
48782 	 ZAHRAOUI 	 Radouane 	 OIG/B/E/I 
49216 	 MAHBOUB 	 Mohammed 	 OIG/B/E/I 
49294 	 ZAITOUNI 	 Youssef 	 OIG/B/M 
49408 	 MOUROU 	 Khalid 	 OIG/B/M 
49532 	 BOUZIT 	 Mohammed 	 OIG/B/L 
50395 	 EL OUIDANI 	 Salaheddine 	 OIG/B/E/I 
50733 	 BOULUIZ 	 Youness 	 OIG/B/M 
50975 	 FARID 	 Zitouni 	 OIG/B/L 
51198 	 FAHM 	 Abdellah 	 OIG/B/B 
51319 	 EL KHARKI 	 Abdelbasset 	 OIG/B/P 
51802 	 CHERIF 	 Ahmed 	 OIG/B/M 
52342 	 MESROURI 	 Aziz 	 OIG/B/L 
52446 	 EL AACHIK 	 Moulay Said 	 OIG/B/E/T 
52991 	 KERDOUSS 	 Samir 	 OIG/B/B 
53008 	 BAHRAM 	 Mohamed 	 OIG/B/M 
47963 	 FAKHRI 	 Mohammed 	 OIG/B/E/T 
54464 	 NOUAIL 	 Larbi 	 OIG/B/L 
54771 	 MALHABI 	 Khalid 	 OIG/B/E/D 
55191 	 SINAMI 	 Larabi 	 OIG/B/M 
55203 	 KHIRI 	 Brahim 	 OIG/B/M 
49132 	 GLIOUI 	 El Mostafa 	 OIG/B/E/T 
55313 	 EL MAADAOUI 	 Said 	 OIG/B/M 
55380 	 BENHARRAF 	 Abdelali 	 OIG/B/B 
56001 	 EL AALLAOUI 	 Salah 	 OIG/B/M 
56601 	 EL AMRANI 	 Radouan 	 OIG/B/P 
57740 	 AHL LHOUCINE 	 Hicham 	 OIG/B/P 
57960 	 MAJDALLAH 	 Mohammed 	 OIG/B/M 
58021 	 BAKRAOUI 	 El Haj 	 OIG/B/E/I 
58023 	 CHAHDI 	 Morad 	 OIG/B/E/I 
58777 	 NAHID 	 Abdelilah 	 OIG/B/E/T 
58797 	 JANAH 	 Mohamed 	 OIG/B/M 
58798 	 MEZRIOUI 	 Abdelilah 	 OIG/B/B 
58935 	 SAKKOUR 	 Ismail 	 OIG/B/L 
76233 	 BENABDENBI 	 Jihad 	 OIG/B/M 
76928 	 CHITOUKLI 	 Rachid Jalal 	 OIG/B/E/I 
77224 	 AMRANI 	 Hatim 	 OIG/B/E/D 
92032 	 EL HNA 	 Rachid 	 OIG/B/L 
92079 	 ELHAN 	 Abdelmoumen 	 OIG/B/M 
47134 	 TOURABI 	 Abdelilah 	 OIG/B/E/I 
9671 	 EL HAJLAOUI 	 Mohamed 	 OIG/B/L 
40234 	 ENNIRRI 	 Tarik 	 OIG/B/E/I 
42312 	 ELRHAZLANI 	 Abdelouahed 	 OIG/B/E/I 
42588 	 EL BAROUDI 	 Jamal 	 OIG/B/E/I 
42990 	 KADIRI 	 Brahim 	 OIG/B/M 
43578 	 FATTOUH 	 Abdellah 	 OIG/B/L 
43597 	 KHOUZAR 	 Abdelhakim 	 OIG/B/E/I 
53032 	 BYA 	 Mohammed 	 OIG/B/E/I 
59091 	 TASDARTE 	 Ahmed 	 OIG/B/L 
57995 	 EL AAMRI 	 Mohammed 	 OIG/B/P 
58761 	 EL AMMARI 	 Abdelkhalek 	 OIG/B/E/I 
76228 	 CHETOUI 	 Rachid 	 OIG/B/M 
76872 	 KAZBIR 	 Abdelmajid 	 OIG/B/M 
76881 	 ABID ALLAH 	 Mohammed 	 OIG/B/M 
76882 	 DOURTI 	 Abderrahim 	 OIG/B/M 
76990 	 BEDDAD 	 Jaouad 	 OIG/B/E/I`;

    // Traiter les données
    const employes = employesData.split('\n').map(line => {
      const parts = line.trim().split(/\s+/);
      const matricule = parts[0];
      
      // Trouver l'index de la dernière colonne (entité)
      let entiteIndex = parts.length - 1;
      while (entiteIndex > 0 && !parts[entiteIndex].startsWith('OIG')) {
        entiteIndex--;
      }
      
      // Extraire l'entité
      const entite = parts[entiteIndex];
      
      // Extraire le nom (tout ce qui est entre le matricule et le prénom)
      const nom = parts.slice(1, entiteIndex - 1).join(' ');
      
      // Extraire le prénom (juste avant l'entité)
      const prenom = parts[entiteIndex - 1];
      
      return {
        matricule,
        nom,
        prenom,
        entite
      };
    });

    // Vérifier s'il y a des employés à insérer
    if (employes.length === 0) {
      console.log('Aucun employé à insérer');
      mongoose.disconnect();
      return;
    }

    // Insérer les employés dans la base de données
    console.log(`Tentative d'insertion de ${employes.length} employés...`);
    
    // Utiliser insertMany avec l'option ordered: false pour continuer même en cas d'erreur
    const result = await Employe.insertMany(employes, { ordered: false });
    console.log(`${result.length} employés insérés avec succès`);
    
    mongoose.disconnect();
    console.log('Déconnecté de MongoDB');
  } catch (error) {
    if (error.writeErrors) {
      console.log(`Erreur lors de l'insertion: ${error.writeErrors.length} erreurs`);
      console.log(`${error.insertedDocs.length} employés insérés avec succès`);
    } else {
      console.error('Erreur lors de l\'importation des employés:', error);
    }
    mongoose.disconnect();
  }
}