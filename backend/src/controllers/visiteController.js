const Employe = require('../models/Employe');
const User = require('../models/User');
const notificationController = require('./notificationController');

// Fonction utilitaire pour créer des notifications d'inaptitude
const createInaptitudeNotifications = async (employe, medecin, dateVisite, aptitudes, observations) => {
  const inaptitudes = [];
  
  // Vérifier chaque type d'aptitude pour créer les notifications appropriées
  if (aptitudes.aptitude === 'INAPTE') {
    inaptitudes.push({
      type: 'GENERALE',
      observation: observations.aptitudeGenerale || 'Aucune observation fournie'
    });
  }
  
  if (aptitudes.aptitudeHC === 'INAPTE') {
    inaptitudes.push({
      type: 'HC',
      observation: observations.aptitudeHC || 'Aucune observation fournie'
    });
  }
  
  if (aptitudes.aptitudeTH === 'INAPTE') {
    inaptitudes.push({
      type: 'TH',
      observation: observations.aptitudeTH || 'Aucune observation fournie'
    });
  }
  
  if (aptitudes.aptitudeEC === 'INAPTE') {
    inaptitudes.push({
      type: 'EC',
      observation: observations.aptitudeEC || 'Aucune observation fournie'
    });
  }

  // Créer une notification pour chaque inaptitude
  for (const inaptitude of inaptitudes) {
    await notificationController.creerNotification(
      employe,
      medecin,
      dateVisite,
      inaptitude.type,
      inaptitude.observation
    );
  }
};

const visiteController = {
  // Récupérer la liste des employés pour le médecin
  getEmployesPourMedecin: async (req, res) => {
    try {
      // Récupérer l'ID du médecin connecté
      const medecinId = req.user._id;
      
      // Récupérer tous les employés (le filtrage par service est géré côté client)
      const employes = await Employe.find()
        .populate('utilisateur', '-motDePasse')
        .lean();
      
      if (!employes || employes.length === 0) {
        return res.status(404).json({ message: 'Aucun employé trouvé' });
      }
      
      // Formater les données pour l'affichage
      const employesFormates = employes.map(employe => {
        // Récupérer les visites pour l'année en cours et l'année suivante
        const anneeActuelle = new Date().getFullYear();
        const visiteActuelle = employe.visitesMedicales.find(v => v.annee === anneeActuelle) || {};
        const visiteSuivante = employe.visitesMedicales.find(v => v.annee === anneeActuelle + 1) || {};
        
        return {
          _id: employe._id,
          matricule: employe.matricule,
          nom: employe.nom,
          prenom: employe.prenom,
          entite: employe.entite,
          service: employe.service,
          dateVisite2024: visiteActuelle.dateVMS ? new Date(visiteActuelle.dateVMS).toISOString().split('T')[0] : '',
          dateVisite2025: visiteSuivante.dateVMS ? new Date(visiteSuivante.dateVMS).toISOString().split('T')[0] : '',
          eligibilite: visiteActuelle.eligibilite ? '1' : '0',
          aptitude: visiteActuelle.aptitude || 'APTE',
          aptitudeHC: visiteActuelle.aptitudeHC || 'APTE',
          aptitudeTH: visiteActuelle.aptitudeTH || 'APTE',
          aptitudeEC: visiteActuelle.aptitudeEC || 'APTE',
          dateHC: visiteActuelle.dateAptitudeHC ? new Date(visiteActuelle.dateAptitudeHC).toISOString().split('T')[0] : '',
          dateTH: visiteActuelle.dateAptitudeTH ? new Date(visiteActuelle.dateAptitudeTH).toISOString().split('T')[0] : '',
          dateEC: visiteActuelle.dateAptitudeEC ? new Date(visiteActuelle.dateAptitudeEC).toISOString().split('T')[0] : '',
          statut: visiteActuelle.statut || 'Non faite'
        };
      });
      
      res.json(employesFormates);
    } catch (error) {
      console.error('Erreur lors de la récupération des employés:', error);
      res.status(500).json({ 
        message: 'Erreur lors de la récupération des employés', 
        error: error.message 
      });
    }
  },
  
  // Mettre à jour la visite médicale d'un employé
  updateVisiteMedicale: async (req, res) => {
    try {
      const { id } = req.params;
      const { 
        dateVisite,
        aptitude,
        aptitudeHC,
        aptitudeTH,
        aptitudeEC,
        statut,
        observations
      } = req.body;
      
      // Vérifier que l'employé existe
      const employe = await Employe.findById(id);
      if (!employe) {
        return res.status(404).json({ message: 'Employé non trouvé' });
      }
      
      // Récupérer l'année actuelle
      const anneeActuelle = new Date().getFullYear();
      
      // Trouver la visite pour l'année actuelle ou en créer une nouvelle
      let visiteIndex = employe.visitesMedicales.findIndex(v => v.annee === anneeActuelle);
      
      if (visiteIndex === -1) {
        // Créer une nouvelle visite pour l'année actuelle
        employe.visitesMedicales.push({
          annee: anneeActuelle,
          dateVMS: dateVisite ? new Date(dateVisite) : null,
          statut: statut || 'Non faite',
          eligibilite: 1,
          aptitude: aptitude || 'APTE',
          aptitudeHC: aptitudeHC || 'APTE',
          aptitudeTH: aptitudeTH || 'APTE',
          aptitudeEC: aptitudeEC || 'APTE',
          medecin: req.user._id,
          entite: employe.entite,
          observations: {
            aptitudeGenerale: observations?.aptitudeGenerale || '',
            aptitudeHC: observations?.aptitudeHC || '',
            aptitudeTH: observations?.aptitudeTH || '',
            aptitudeEC: observations?.aptitudeEC || ''
          }
        });
        visiteIndex = employe.visitesMedicales.length - 1;
      } else {
        // Mettre à jour la visite existante
        const visite = employe.visitesMedicales[visiteIndex];
        visite.dateVMS = dateVisite ? new Date(dateVisite) : visite.dateVMS;
        visite.statut = statut || visite.statut;
        visite.aptitude = aptitude || visite.aptitude;
        visite.aptitudeHC = aptitudeHC || visite.aptitudeHC;
        visite.aptitudeTH = aptitudeTH || visite.aptitudeTH;
        visite.aptitudeEC = aptitudeEC || visite.aptitudeEC;
        visite.medecin = req.user._id;
        
        // Mettre à jour les dates d'aptitude si une date de visite est fournie
        if (dateVisite) {
          const dateVisiteObj = new Date(dateVisite);
          visite.dateAptitudeHC = dateVisiteObj;
          visite.dateAptitudeTH = dateVisiteObj;
          visite.dateAptitudeEC = dateVisiteObj;
        }
        
        // Mettre à jour les observations
        if (observations) {
          visite.observations = {
            aptitudeGenerale: observations.aptitudeGenerale || visite.observations?.aptitudeGenerale || '',
            aptitudeHC: observations.aptitudeHC || visite.observations?.aptitudeHC || '',
            aptitudeTH: observations.aptitudeTH || visite.observations?.aptitudeTH || '',
            aptitudeEC: observations.aptitudeEC || visite.observations?.aptitudeEC || ''
          };
        }
      }
      
      // Sauvegarder les modifications
      await employe.save();
      
      // Créer des notifications pour les inaptitudes si le statut est "Faite"
      if (statut === 'Faite') {
        const visite = employe.visitesMedicales[visiteIndex];
        await createInaptitudeNotifications(
          employe,
          req.user,
          visite.dateVMS,
          {
            aptitude: visite.aptitude,
            aptitudeHC: visite.aptitudeHC,
            aptitudeTH: visite.aptitudeTH,
            aptitudeEC: visite.aptitudeEC
          },
          visite.observations
        );
      }
      
      res.json({
        message: 'Visite médicale mise à jour avec succès',
        employe
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la visite médicale:', error);
      res.status(500).json({ 
        message: 'Erreur lors de la mise à jour de la visite médicale', 
        error: error.message 
      });
    }
  },
  
  // Récupérer les statistiques des visites médicales
  getStatistiquesVisites: async function(req, res) {
    try {
      const anneeActuelle = new Date().getFullYear();
      
      // Nombre total d'employés
      const totalEmployes = await Employe.countDocuments();
      
      // Statistiques des visites pour l'année actuelle
      const statsVisites = await Employe.aggregate([
        { $unwind: '$visitesMedicales' },
        { $match: { 'visitesMedicales.annee': anneeActuelle } },
        { $group: {
            _id: '$visitesMedicales.statut',
            count: { $sum: 1 }
          }
        }
      ]);
      
      // Statistiques des aptitudes pour l'année actuelle
      const statsAptitudes = await Employe.aggregate([
        { $unwind: '$visitesMedicales' },
        { $match: { 'visitesMedicales.annee': anneeActuelle } },
        { $group: {
            _id: '$visitesMedicales.aptitude',
            count: { $sum: 1 }
          }
        }
      ]);
      
      // Statistiques des aptitudes HC pour l'année actuelle
      const statsAptitudesHC = await Employe.aggregate([
        { $unwind: '$visitesMedicales' },
        { $match: { 'visitesMedicales.annee': anneeActuelle } },
        { $group: {
            _id: '$visitesMedicales.aptitudeHC',
            count: { $sum: 1 }
          }
        }
      ]);
      
      // Statistiques des aptitudes TH pour l'année actuelle
      const statsAptitudesTH = await Employe.aggregate([
        { $unwind: '$visitesMedicales' },
        { $match: { 'visitesMedicales.annee': anneeActuelle } },
        { $group: {
            _id: '$visitesMedicales.aptitudeTH',
            count: { $sum: 1 }
          }
        }
      ]);
      
      // Statistiques des aptitudes EC pour l'année actuelle
      const statsAptitudesEC = await Employe.aggregate([
        { $unwind: '$visitesMedicales' },
        { $match: { 'visitesMedicales.annee': anneeActuelle } },
        { $group: {
            _id: '$visitesMedicales.aptitudeEC',
            count: { $sum: 1 }
          }
        }
      ]);
      
      res.json({
        totalEmployes,
        statsVisites,
        statsAptitudes,
        statsAptitudesHC,
        statsAptitudesTH,
        statsAptitudesEC
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      res.status(500).json({ 
        message: 'Erreur lors de la récupération des statistiques', 
        error: error.message 
      });
    }
  }
};

module.exports = visiteController;
