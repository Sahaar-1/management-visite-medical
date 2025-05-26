const RendezVous = require('../models/RendezVous');
const User = require('../models/User');

// Récupérer tous les rendez-vous
exports.getAllRendezVous = async (req, res) => {
  try {
    const rendezVous = await RendezVous.find()
      .populate('employes', 'nom prenom matricule entite')
      .sort({ date: -1 });

    res.status(200).json(rendezVous);
  } catch (error) {
    console.error('Erreur lors de la récupération des rendez-vous:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Récupérer un rendez-vous par son ID
exports.getRendezVousById = async (req, res) => {
  try {
    const rendezVous = await RendezVous.findById(req.params.id)
      .populate('employes', 'nom prenom matricule entite');

    if (!rendezVous) {
      return res.status(404).json({ message: 'Rendez-vous non trouvé' });
    }

    res.status(200).json(rendezVous);
  } catch (error) {
    console.error('Erreur lors de la récupération du rendez-vous:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Créer un nouveau rendez-vous
exports.createRendezVous = async (req, res) => {
  try {
    const { date, lieu, notes, employes } = req.body;

    // Vérifier que les employés existent
    if (employes && employes.length > 0) {
      const Employe = require('../models/Employe');
      const employesExist = await Employe.countDocuments({ _id: { $in: employes } });

      if (employesExist !== employes.length) {
        return res.status(400).json({ message: 'Un ou plusieurs employés n\'existent pas' });
      }

      // Vérifier si les employés sont déjà assignés pour l'année en cours
      const annee = new Date(date).getFullYear();
      const debutAnnee = new Date(annee, 0, 1);
      const finAnnee = new Date(annee, 11, 31, 23, 59, 59);

      // Rechercher les rendez-vous pour cette année
      const rendezVousExistants = await RendezVous.find({
        date: { $gte: debutAnnee, $lte: finAnnee }
      });

      // Vérifier si des employés sont déjà assignés
      const employesDejaAssignes = new Set();
      rendezVousExistants.forEach(rdv => {
        rdv.employes.forEach(empId => {
          employesDejaAssignes.add(empId.toString());
        });
      });

      // Vérifier si des employés dans la requête sont déjà assignés
      const employesEnConflit = employes.filter(empId =>
        employesDejaAssignes.has(empId.toString())
      );

      if (employesEnConflit.length > 0) {
        return res.status(400).json({
          message: `${employesEnConflit.length} employé(s) ont déjà un rendez-vous programmé pour l'année ${annee}`
        });
      }
    }

    const rendezVous = new RendezVous({
      date,
      lieu,
      notes,
      employes: employes || []
    });

    await rendezVous.save();
    res.status(201).json(rendezVous);
  } catch (error) {
    console.error('Erreur lors de la création du rendez-vous:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Mettre à jour un rendez-vous
exports.updateRendezVous = async (req, res) => {
  try {
    const { date, lieu, notes, employes } = req.body;

    // Vérifier que les employés existent
    if (employes && employes.length > 0) {
      const Employe = require('../models/Employe');
      const employesExist = await Employe.countDocuments({ _id: { $in: employes } });

      if (employesExist !== employes.length) {
        return res.status(400).json({ message: 'Un ou plusieurs employés n\'existent pas' });
      }

      // Vérifier si les employés sont déjà assignés pour l'année en cours
      const annee = new Date(date).getFullYear();
      const debutAnnee = new Date(annee, 0, 1);
      const finAnnee = new Date(annee, 11, 31, 23, 59, 59);

      // Rechercher les rendez-vous pour cette année (en excluant le rendez-vous actuel)
      const rendezVousExistants = await RendezVous.find({
        date: { $gte: debutAnnee, $lte: finAnnee },
        _id: { $ne: req.params.id }
      });

      // Vérifier si des employés sont déjà assignés
      const employesDejaAssignes = new Set();
      rendezVousExistants.forEach(rdv => {
        rdv.employes.forEach(empId => {
          employesDejaAssignes.add(empId.toString());
        });
      });

      // Vérifier si des employés dans la requête sont déjà assignés
      const employesEnConflit = employes.filter(empId =>
        employesDejaAssignes.has(empId.toString())
      );

      if (employesEnConflit.length > 0) {
        return res.status(400).json({
          message: `${employesEnConflit.length} employé(s) ont déjà un rendez-vous programmé pour l'année ${annee}`
        });
      }
    }

    const updatedRendezVous = await RendezVous.findByIdAndUpdate(
      req.params.id,
      { date, lieu, notes, employes },
      { new: true, runValidators: true }
    ).populate('employes', 'nom prenom matricule entite');

    if (!updatedRendezVous) {
      return res.status(404).json({ message: 'Rendez-vous non trouvé' });
    }

    res.status(200).json(updatedRendezVous);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du rendez-vous:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Supprimer un rendez-vous
exports.deleteRendezVous = async (req, res) => {
  try {
    const rendezVous = await RendezVous.findByIdAndDelete(req.params.id);

    if (!rendezVous) {
      return res.status(404).json({ message: 'Rendez-vous non trouvé' });
    }

    res.status(200).json({ message: 'Rendez-vous supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du rendez-vous:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Récupérer tous les employés pour le formulaire
exports.getAllEmployes = async (req, res) => {
  try {
    // Utiliser le modèle Employe au lieu de User
    const Employe = require('../models/Employe');
    const employes = await Employe.find()
      .sort({ nom: 1, prenom: 1 });

    res.status(200).json(employes);
  } catch (error) {
    console.error('Erreur lors de la récupération des employés:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Récupérer tous les employés pour le formulaire avec statut médical calculé
exports.getAllEmployes = async (req, res) => {
  try {
    // Utiliser le modèle Employe au lieu de User
    const Employe = require('../models/Employe');
    const employes = await Employe.find()
      .sort({ nom: 1, prenom: 1 });

    // Calculer le statut médical et les informations de rendez-vous pour chaque employé
    const employesAvecStatut = await Promise.all(employes.map(async (employe) => {
      const employeObj = employe.toObject();

      // Calculer le statut médical (utiliser le bon nom de champ)
      const { statutMedical, prochaineDateVisite } = calculerStatutMedical(employe.dateDerniereVisiteMedicale);
      employeObj.statutMedical = statutMedical;
      employeObj.prochaineDateVisite = prochaineDateVisite;

      // Vérifier s'il a déjà un rendez-vous programmé cette année
      const anneeActuelle = new Date().getFullYear();
      const debutAnnee = new Date(anneeActuelle, 0, 1);
      const finAnnee = new Date(anneeActuelle, 11, 31, 23, 59, 59);

      const rendezVousExistant = await RendezVous.findOne({
        employes: employe._id,
        date: {
          $gte: debutAnnee,
          $lte: finAnnee
        }
      });

      employeObj.dejaRendezVousProgramme = !!rendezVousExistant;

      return employeObj;
    }));

    res.status(200).json(employesAvecStatut);
  } catch (error) {
    console.error('Erreur lors de la récupération des employés:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Fonction utilitaire pour calculer le statut médical
function calculerStatutMedical(dateDerniereVisiteMedicale) {
  const maintenant = new Date();

  if (!dateDerniereVisiteMedicale) {
    return {
      statutMedical: 'Visite Requise',
      prochaineDateVisite: null
    };
  }

  const derniereVisite = new Date(dateDerniereVisiteMedicale);

  // IMPORTANT: Si la dernière visite est dans le futur, c'est une erreur de données
  // On considère que l'employé n'a pas encore fait de visite
  if (derniereVisite > maintenant) {
    console.warn(`Date de dernière visite dans le futur détectée: ${dateDerniereVisiteMedicale}`);
    return {
      statutMedical: 'Visite Requise',
      prochaineDateVisite: null
    };
  }

  const prochaineDateVisite = new Date(derniereVisite);
  prochaineDateVisite.setFullYear(derniereVisite.getFullYear() + 1);

  // Calculer la différence en millisecondes
  const diffMs = prochaineDateVisite.getTime() - maintenant.getTime();
  const diffJours = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  let statutMedical;
  if (diffJours < 0) {
    // Date dépassée
    statutMedical = 'Visite Requise';
  } else if (diffJours <= 30) {
    // Dans les 30 jours
    statutMedical = 'Visite Proche';
  } else {
    // Plus de 30 jours
    statutMedical = 'À jour';
  }

  return {
    statutMedical,
    prochaineDateVisite
  };
}

// Récupérer les employés avec rendez-vous du jour
exports.getRendezVousJour = async (req, res) => {
  try {
    // Obtenir la date d'aujourd'hui (début et fin de journée)
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    // Rechercher les rendez-vous d'aujourd'hui
    const rendezVousAujourdhui = await RendezVous.find({
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    }).populate('employes', 'nom prenom matricule entite service');

    // Transformer les données pour le frontend
    const employesAvecRendezVous = [];

    rendezVousAujourdhui.forEach(rdv => {
      rdv.employes.forEach(employe => {
        employesAvecRendezVous.push({
          _id: employe._id,
          nom: employe.nom,
          prenom: employe.prenom,
          matricule: employe.matricule,
          entite: employe.entite || employe.service,
          service: employe.service,
          rendezVousId: rdv._id,
          dateRendezVous: rdv.date,
          lieuRendezVous: rdv.lieu,
          notesRendezVous: rdv.notes
        });
      });
    });

    res.status(200).json(employesAvecRendezVous);
  } catch (error) {
    console.error('Erreur lors de la récupération des rendez-vous du jour:', error);
    res.status(500).json({
      message: 'Erreur lors de la récupération des rendez-vous du jour',
      error: error.message
    });
  }
};

// Récupérer les statistiques des rendez-vous
exports.getRendezVousStats = async (req, res) => {
  try {
    const dateActuelle = new Date();
    const annee = req.query.annee ? parseInt(req.query.annee) : dateActuelle.getFullYear();

    // Créer les dates de début et de fin pour l'année sélectionnée
    const debutAnnee = new Date(annee, 0, 1); // 1er janvier de l'année sélectionnée
    const finAnnee = new Date(annee, 11, 31, 23, 59, 59); // 31 décembre de l'année sélectionnée

    // Compter les rendez-vous à venir (date supérieure à aujourd'hui et dans l'année sélectionnée)
    const aVenir = await RendezVous.countDocuments({
      date: {
        $gt: dateActuelle,
        $gte: debutAnnee,
        $lte: finAnnee
      }
    });

    // Compter les rendez-vous terminés (date inférieure à aujourd'hui et dans l'année sélectionnée)
    const termines = await RendezVous.countDocuments({
      date: {
        $lt: dateActuelle,
        $gte: debutAnnee,
        $lte: finAnnee
      }
    });

    res.status(200).json({ aVenir, termines, annee });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques de rendez-vous:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Récupérer les rendez-vous d'un médecin par date
exports.getRendezVousMedecinParDate = async (req, res) => {
  try {
    const { medecinId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: 'La date est requise' });
    }

    // Créer les dates de début et de fin pour le jour spécifié
    const dateDebut = new Date(date);
    dateDebut.setHours(0, 0, 0, 0);

    const dateFin = new Date(date);
    dateFin.setHours(23, 59, 59, 999);

    // Récupérer les rendez-vous du médecin pour la date spécifiée
    const rendezVous = await RendezVous.findOne({
      medecin: medecinId,
      date: {
        $gte: dateDebut,
        $lte: dateFin
      }
    }).populate('employes', 'nom prenom matricule entite poste service')
      .populate('medecin', 'nom prenom');

    if (!rendezVous) {
      return res.status(200).json(null);
    }

    res.status(200).json(rendezVous);
  } catch (error) {
    console.error('Erreur lors de la récupération des rendez-vous du médecin:', error);
    res.status(500).json({
      message: 'Erreur lors de la récupération des rendez-vous',
      error: error.message
    });
  }
};
