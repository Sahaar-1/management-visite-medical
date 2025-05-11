const Employe = require('../models/Employe');
const User = require('../models/User');
const mongoose = require('mongoose');

const employeController = {
  // Ajouter un employé
  ajouterEmploye: async (req, res) => {
    try {
      const { 
        matricule, 
        nom, 
        prenom, 
        entite, 
        visitesMedicales 
      } = req.body;

      // Vérifier si l'employé existe déjà
      const employeExistant = await Employe.findOne({ matricule });
      if (employeExistant) {
        return res.status(400).json({ 
          message: 'Un employé avec ce matricule existe déjà' 
        });
      }

      // Créer un utilisateur associé
      const utilisateur = new User({
        nom,
        prenom,
        email: `${prenom.toLowerCase()}.${nom.toLowerCase()}@entreprise.com`,
        motDePasse: matricule, // Mot de passe temporaire
        role: 'employe'
      });

      // Sauvegarder l'utilisateur
      await utilisateur.save();

      // Créer l'employé
      const nouvelEmploye = new Employe({
        matricule,
        nom,
        prenom,
        entite,
        visitesMedicales: visitesMedicales || [],
        utilisateur: utilisateur._id
      });

      // Sauvegarder l'employé
      await nouvelEmploye.save();

      res.status(201).json({
        message: 'Employé ajouté avec succès',
        employe: nouvelEmploye,
        utilisateur: utilisateur
      });
    } catch (error) {
      res.status(500).json({ 
        message: 'Erreur lors de l\'ajout de l\'employé', 
        error: error.message 
      });
    }
  },

  // Importer des employés en masse
  importerEmployes: async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const employesAImporter = req.body.employes;
      const employesImportes = [];
      const erreurs = [];

      for (const employeData of employesAImporter) {
        try {
          // Vérifier si l'employé existe déjà
          const employeExistant = await Employe.findOne({ 
            matricule: employeData.matricule 
          }).session(session);

          if (employeExistant) {
            erreurs.push({
              matricule: employeData.matricule,
              message: 'Employé existe déjà'
            });
            continue;
          }

          // Créer un utilisateur
          const utilisateur = new User({
            nom: employeData.nom,
            prenom: employeData.prenom,
            email: `${employeData.prenom.toLowerCase()}.${employeData.nom.toLowerCase()}@entreprise.com`,
            motDePasse: employeData.matricule, // Mot de passe temporaire
            role: 'employe'
          });

          await utilisateur.save({ session });

          // Préparer les visites médicales
          const visitesMedicales = [];
          const annees = [2024, 2025];
          
          annees.forEach(annee => {
            const visiteAnnee = {
              annee,
              dateVMS: employeData[`dateVMS${annee}`] ? new Date(employeData[`dateVMS${annee}`]) : null,
              eligibilite: employeData.eligibilite || 1,
              aptitudeHC: employeData[`aptitudeHC${annee}`] || '',
              dateAptitudeHC: employeData[`dateVMS${annee}`] ? new Date(employeData[`dateVMS${annee}`]) : null,
              aptitudeTH: employeData[`aptitudeTH${annee}`] || '',
              dateAptitudeTH: employeData[`dateVMS${annee}`] ? new Date(employeData[`dateVMS${annee}`]) : null,
              aptitudeEC: employeData[`aptitudeEC${annee}`] || '',
              dateAptitudeEC: employeData[`dateVMS${annee}`] ? new Date(employeData[`dateVMS${annee}`]) : null,
              statut: employeData.statut || 'En attente'
            };
            
            visitesMedicales.push(visiteAnnee);
          });

          // Créer l'employé
          const nouvelEmploye = new Employe({
            matricule: employeData.matricule,
            nom: employeData.nom,
            prenom: employeData.prenom,
            entite: employeData.entite,
            visitesMedicales,
            utilisateur: utilisateur._id
          });

          await nouvelEmploye.save({ session });
          employesImportes.push(nouvelEmploye);
        } catch (erreurEmploye) {
          erreurs.push({
            matricule: employeData.matricule,
            message: erreurEmploye.message
          });
        }
      }

      // Valider la transaction
      await session.commitTransaction();
      session.endSession();

      res.status(200).json({
        message: 'Importation terminée',
        employesImportes,
        erreurs
      });
    } catch (error) {
      // Annuler la transaction en cas d'erreur
      await session.abortTransaction();
      session.endSession();

      res.status(500).json({ 
        message: 'Erreur lors de l\'importation des employés', 
        error: error.message 
      });
    }
  },

  // Récupérer tous les employés
  listerEmployes: async (req, res) => {
    try {
      const { 
        page = 1, 
        limite = 10, 
        recherche = '',
        entite,
        statutVisite
      } = req.query;

      // Construire les filtres de recherche
      const filtres = {};
      if (recherche) {
        filtres.$or = [
          { nom: { $regex: recherche, $options: 'i' } },
          { prenom: { $regex: recherche, $options: 'i' } },
          { matricule: { $regex: recherche, $options: 'i' } }
        ];
      }
      if (entite) {
        filtres.entite = entite;
      }
      if (statutVisite) {
        filtres['visitesMedicales.statut'] = statutVisite;
      }

      // Pagination
      const options = {
        page: parseInt(page),
        limit: parseInt(limite),
        populate: 'utilisateur'
      };

      // Récupérer les employés
      const resultat = await Employe.paginate(filtres, options);

      res.json({
        employes: resultat.docs,
        totalEmployes: resultat.totalDocs,
        page: resultat.page,
        totalPages: resultat.totalPages
      });
    } catch (error) {
      res.status(500).json({ 
        message: 'Erreur lors de la récupération des employés', 
        error: error.message 
      });
    }
  },

  // Statistiques pour le tableau de bord admin
  statistiques: async (req, res) => {
    try {
      // Total des employés
      const totalEmployes = await Employe.countDocuments();

      // Employés par entité
      const employesParEntite = await Employe.aggregate([
        { $group: { 
          _id: '$entite', 
          nombreEmployes: { $sum: 1 } 
        }}
      ]);

      // Statut des visites médicales
      const statutVisites = await Employe.aggregate([
        { $unwind: '$visitesMedicales' },
        { $group: { 
          _id: '$visitesMedicales.statut', 
          nombre: { $sum: 1 } 
        }}
      ]);

      // Aptitudes par type
      const aptitudesHC = await Employe.aggregate([
        { $unwind: '$visitesMedicales' },
        { $group: { 
          _id: '$visitesMedicales.aptitudeHC', 
          nombre: { $sum: 1 } 
        }}
      ]);

      res.json({
        totalEmployes,
        employesParEntite,
        statutVisites,
        aptitudesHC
      });
    } catch (error) {
      res.status(500).json({ 
        message: 'Erreur lors de la récupération des statistiques', 
        error: error.message 
      });
    }
  },

  // Méthode pour mettre à jour le statut de visite médicale
  mettreAJourStatutVisite: async (req, res) => {
    try {
      const { id } = req.params;
      const { statut } = req.body;

      // Récupérer l'employé
      const employe = await Employe.findById(id);
      if (!employe) {
        return res.status(404).json({ message: 'Employé non trouvé' });
      }

      // Année courante
      const anneeActuelle = new Date().getFullYear();

      // Trouver ou créer la visite médicale pour l'année courante
      let visiteExistante = employe.visitesMedicales.find(v => v.annee === anneeActuelle);
      
      if (!visiteExistante) {
        // Créer une nouvelle visite si elle n'existe pas
        visiteExistante = {
          annee: anneeActuelle,
          dateVMS: new Date(),
          statut: statut,
          eligibilite: 1,
          aptitudeHC: '',
          aptitudeTH: '',
          aptitudeEC: ''
        };
        employe.visitesMedicales.push(visiteExistante);
      } else {
        // Mettre à jour le statut de la visite existante
        visiteExistante.statut = statut;
        visiteExistante.dateVMS = new Date();
      }

      // Sauvegarder les modifications
      await employe.save();

      res.json({
        message: 'Statut de visite médicale mis à jour',
        employe: employe
      });
    } catch (error) {
      res.status(500).json({ 
        message: 'Erreur lors de la mise à jour du statut de visite', 
        error: error.message 
      });
    }
  },
};

module.exports = employeController;
