const Historique = require('../models/Historique');
const Employe = require('../models/Employe');
const User = require('../models/User');

// Récupérer l'historique des consultations
exports.getHistorique = async (req, res) => {
  try {
    const { employe, dateDebut, dateFin, statut, page = 1, limit = 10 } = req.query;
    
    // Construire les filtres
    const filter = {};
    
    if (employe) {
      // Rechercher l'employé par nom, prénom ou matricule
      const employeRegex = new RegExp(employe, 'i');
      const employes = await Employe.find({
        $or: [
          { nom: employeRegex },
          { prenom: employeRegex },
          { matricule: employeRegex }
        ]
      });
      
      if (employes.length > 0) {
        filter.employe = { $in: employes.map(e => e._id) };
      }
    }
    
    if (dateDebut) {
      filter.dateConsultation = { $gte: new Date(dateDebut) };
    }
    
    if (dateFin) {
      if (!filter.dateConsultation) filter.dateConsultation = {};
      filter.dateConsultation.$lte = new Date(dateFin);
    }
    
    if (statut) {
      filter.statut = statut;
    }
    
    // Récupérer l'historique avec pagination
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { dateConsultation: -1 },
      populate: [
        { path: 'employe', select: 'nom prenom matricule service entite' },
        { path: 'medecin', select: 'nom prenom' },
        { path: 'consultation' }
      ]
    };
    
    const historique = await Historique.paginate(filter, options);
    
    // Renvoyer les résultats dans un format cohérent
    res.status(200).json({
      historique: historique.docs,
      totalPages: historique.totalPages,
      currentPage: historique.page,
      totalItems: historique.totalDocs
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique:', error.stack);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Récupérer l'historique d'un employé spécifique
exports.getHistoriqueEmploye = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Récupération de l'historique pour l'employé ${id}`);
    
    // Définir les options de pagination
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      sort: { dateConsultation: -1 },
      populate: [
        { path: 'employe', select: 'nom prenom matricule' },
        { path: 'medecin', select: 'nom prenom specialite' }
      ]
    };
    
    // Construire la requête
    let query = { employe: id };
    
    // Si l'utilisateur est un médecin, filtrer par son ID également
    if (req.user.role === 'medecin') {
      query.medecin = req.user._id;
    }
    
    // Récupérer l'historique avec pagination
    const result = await Historique.paginate(query, options);
    
    // Transformer le résultat pour qu'il soit toujours un tableau
    const historique = result.docs || [];
    
    console.log(`${historique.length} entrées d'historique trouvées pour l'employé ${id}`);
    
    // Renvoyer un tableau, même vide
    res.json(historique);
  } catch (error) {
    console.error(`Erreur lors de la récupération de l'historique de l'employé ${req.params.id}:`, error);
    res.status(500).json({ 
      message: `Erreur lors de la récupération de l'historique de l'employé`,
      error: error.message 
    });
  }
};

// Ajout de fonctions vides pour les routes qui ne sont pas encore implémentées
exports.getStatistiques = async (req, res) => {
  res.status(501).json({ message: "La fonctionnalité de statistiques n'est pas encore implémentée" });
};

exports.exportHistorique = async (req, res) => {
  res.status(501).json({ message: "La fonctionnalité d'exportation n'est pas encore implémentée" });
};

module.exports = exports;