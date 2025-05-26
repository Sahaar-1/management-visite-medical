const Consultation = require('../models/Consultation');
const Historique = require('../models/Historique');
const Notification = require('../models/Notification');
const mongoose = require('mongoose');
const { startOfDay, endOfDay } = require('date-fns');

// Récupérer une consultation par son ID
exports.getConsultationById = async (req, res) => {
  try {
    const consultation = await Consultation.findById(req.params.id)
      .populate('employeId', 'nom prenom matricule service entite')
      .populate('medecinId', 'nom prenom')
      .populate('rendezVousId', 'date lieu');

    if (!consultation) {
      return res.status(404).json({ message: 'Consultation non trouvée' });
    }

    res.status(200).json(consultation);
  } catch (error) {
    console.error('Erreur lors de la récupération de la consultation:', error.stack);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Créer une nouvelle consultation
exports.createConsultation = async (req, res) => {
  try {
    console.log("Données reçues pour la création de consultation:", req.body);

    // Validation des données requises
    if (!req.body.employeId || !req.body.rendezVousId) {
      return res.status(400).json({
        message: 'Données manquantes',
        required: ['employeId', 'rendezVousId'],
        received: req.body
      });
    }

    // Validation spécifique selon le statut
    const statut = req.body.statut || 'FAITE';
    if (statut === 'FAITE' && !req.body.aptitudeGenerale) {
      return res.status(400).json({
        message: 'L\'aptitude générale est requise pour une consultation faite',
        received: req.body
      });
    }

    const { employeId, rendezVousId } = req.body;

    // Vérifier si une consultation existe déjà pour cet employé aujourd'hui
    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));
    const endOfToday = new Date(today.setHours(23, 59, 59, 999));

    const existingConsultation = await Consultation.findOne({
      employeId,
      dateConsultation: {
        $gte: startOfToday,
        $lte: endOfToday
      }
    });

    if (existingConsultation) {
      return res.status(409).json({
        message: 'Une consultation existe déjà pour cet employé aujourd\'hui',
        existingConsultation
      });
    }

    // Création de la consultation avec les nouvelles données
    const consultation = new Consultation({
      rendezVousId,
      employeId,
      medecinId: req.user._id, // Utiliser l'ID du médecin connecté
      statut,
      aptitudeGenerale: req.body.aptitudeGenerale,
      aptitudeDetails: req.body.aptitudeDetails || {
        hc: 'APTE',
        th: 'APTE',
        cir: 'APTE'
      },
      classe: parseInt(req.body.classe) || 1,
      observationMedecin: req.body.observationMedecin || '',
      dateConsultation: req.body.dateConsultation || new Date(),
      envoyeAdmin: false
    });

    console.log("Objet consultation créé:", consultation);

    const savedConsultation = await consultation.save();
    console.log("Consultation sauvegardée avec succès:", savedConsultation);

    // Créer automatiquement une entrée dans l'historique
    try {
      const historique = await createHistoriqueFromConsultation(savedConsultation);
      console.log("Historique créé automatiquement:", historique._id);
    } catch (histError) {
      console.error("Erreur lors de la création de l'historique:", histError);
      // Ne pas faire échouer la création de consultation si l'historique échoue
    }

    // Mettre à jour dateDerniereVisiteMedicale de l'employé si la consultation est FAITE
    if (savedConsultation.statut === 'FAITE') {
      try {
        const Employe = require('../models/Employe');
        await Employe.findByIdAndUpdate(
          savedConsultation.employeId,
          { dateDerniereVisiteMedicale: savedConsultation.dateConsultation },
          { new: true }
        );
        console.log("Date dernière visite médicale mise à jour pour l'employé:", savedConsultation.employeId);
      } catch (updateError) {
        console.error("Erreur lors de la mise à jour de la date de dernière visite:", updateError);
        // Ne pas faire échouer la création de consultation si la mise à jour échoue
      }
    }

    // Populer les données pour la réponse
    const populatedConsultation = await Consultation.findById(savedConsultation._id)
      .populate('employeId', 'nom prenom matricule service entite')
      .populate('medecinId', 'nom prenom')
      .populate('rendezVousId', 'date lieu');

    res.status(201).json(populatedConsultation);
  } catch (error) {
    console.error('Erreur lors de la création de la consultation:', error);

    // Vérifier si l'erreur est une erreur de validation Mongoose
    if (error.name === 'ValidationError') {
      const validationErrors = {};

      // Extraire les messages d'erreur pour chaque champ
      for (const field in error.errors) {
        validationErrors[field] = error.errors[field].message;
      }

      return res.status(400).json({
        message: 'Erreur de validation',
        errors: validationErrors
      });
    }

    // Vérifier si l'erreur est une erreur de duplication (code 11000)
    if (error.code === 11000) {
      return res.status(409).json({
        message: 'Une consultation existe déjà avec ces informations',
        error: error.message
      });
    }

    res.status(500).json({
      message: 'Erreur serveur lors de la création de la consultation',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Récupérer les consultations par statut et date
exports.getConsultationsByStatusAndDate = async (req, res) => {
  try {
    // Extraire les paramètres de la requête
    const { statut, date } = req.query;

    // Construire la requête de base
    let query = {};

    // Filtrer par statut si spécifié
    if (statut) {
      query.statut = statut;
    }

    // Filtrer par date si spécifiée
    if (date) {
      const startDate = startOfDay(new Date(date));
      const endDate = endOfDay(new Date(date));

      query.dateConsultation = {
        $gte: startDate,
        $lte: endDate
      };
    }

    // Si l'utilisateur est un médecin, filtrer par son ID
    if (req.user.role === 'medecin') {
      query.medecinId = req.user._id;
    }

    // Exécuter la requête avec les filtres
    const consultations = await Consultation.find(query)
      .populate('employeId', 'nom prenom matricule service entite')
      .populate('medecinId', 'nom prenom')
      .populate('rendezVousId', 'date lieu')
      .sort({ dateConsultation: -1 });

    res.status(200).json(consultations);
  } catch (error) {
    console.error('Erreur lors de la récupération des consultations:', error.stack);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Marquer les consultations comme envoyées à l'admin
exports.marquerConsultationsEnvoyees = async (req, res) => {
  try {
    // Vérifier que des IDs de consultations ont été fournis
    if (!req.body.consultationIds || !Array.isArray(req.body.consultationIds) || req.body.consultationIds.length === 0) {
      return res.status(400).json({ message: 'Aucune consultation spécifiée' });
    }

    // Récupérer les consultations à marquer comme envoyées
    const consultations = await Consultation.find({
      _id: { $in: req.body.consultationIds },
      medecinId: req.user._id // S'assurer que le médecin ne peut mettre à jour que ses propres consultations
    }).populate('employeId').populate('medecinId');

    if (consultations.length === 0) {
      return res.status(404).json({ message: 'Aucune consultation trouvée' });
    }

    // Créer des entrées dans l'historique pour chaque consultation
    const Historique = require('../models/Historique');
    const historiqueEntries = [];

    for (const consultation of consultations) {
      // Vérifier si une entrée d'historique existe déjà pour cette consultation
      const historiqueExistant = await Historique.findOne({ consultation: consultation._id });

      if (!historiqueExistant) {
        // Créer l'enregistrement d'historique
        const historique = new Historique({
          consultation: consultation._id,
          employe: consultation.employeId._id,
          medecin: consultation.medecinId._id,
          dateConsultation: consultation.dateConsultation,
          statut: consultation.statut,
          observations: consultation.observationMedecin,
          rendezVousId: consultation.rendezVousId
        });

        // Ajouter les détails d'aptitude et classe UNIQUEMENT si le statut est FAITE
        if (consultation.statut === 'FAITE') {
          historique.aptitudeDetails = {
            hc: consultation.aptitudeDetails?.hc || 'APTE',
            th: consultation.aptitudeDetails?.th || 'APTE',
            cir: consultation.aptitudeDetails?.cir || 'APTE'
          };
          historique.classe = consultation.classe.toString();
        }

        await historique.save();
        historiqueEntries.push(historique);
      }
    }

    // Mettre à jour le statut des consultations
    const result = await Consultation.updateMany(
      { _id: { $in: req.body.consultationIds }, medecinId: req.user._id },
      { $set: { envoyeAdmin: true, dateEnvoi: new Date() } }
    );

    res.status(200).json({
      message: `${result.modifiedCount} consultation(s) marquée(s) comme envoyée(s) et archivée(s)`,
      updatedCount: result.modifiedCount,
      historiqueCount: historiqueEntries.length
    });
  } catch (error) {
    console.error('Erreur lors du marquage des consultations:', error.stack);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Créer un historique à partir d'une consultation
const createHistoriqueFromConsultation = async (consultation) => {
  try {
    // Vérifier si une entrée d'historique existe déjà pour cette consultation
    const historiqueExistant = await Historique.findOne({ consultation: consultation._id });

    if (!historiqueExistant) {
      // Créer l'enregistrement d'historique
      const historique = new Historique({
        consultation: consultation._id,
        employe: consultation.employeId,
        medecin: consultation.medecinId,
        dateConsultation: consultation.dateConsultation,
        statut: consultation.statut,
        observations: consultation.observationMedecin,
        rendezVousId: consultation.rendezVousId
      });

      // Ajouter les détails d'aptitude et classe UNIQUEMENT si le statut est FAITE
      if (consultation.statut === 'FAITE') {
        historique.aptitudeDetails = {
          hc: consultation.aptitudeDetails?.hc || 'APTE',
          th: consultation.aptitudeDetails?.th || 'APTE',
          cir: consultation.aptitudeDetails?.cir || 'APTE'
        };
        historique.classe = consultation.classe.toString();
      }

      // Ajouter des métadonnées si disponibles
      if (consultation.metadonnees) {
        historique.metadonnees = consultation.metadonnees;
      }

      await historique.save();

      // Mettre à jour dateDerniereVisiteMedicale de l'employé si la consultation est FAITE
      if (consultation.statut === 'FAITE') {
        try {
          const Employe = require('../models/Employe');
          await Employe.findByIdAndUpdate(
            consultation.employeId,
            { dateDerniereVisiteMedicale: consultation.dateConsultation },
            { new: true }
          );
          console.log("Date dernière visite médicale mise à jour pour l'employé:", consultation.employeId);
        } catch (updateError) {
          console.error("Erreur lors de la mise à jour de la date de dernière visite:", updateError);
        }
      }

      return historique;
    }

    return historiqueExistant;
  } catch (error) {
    console.error('Erreur lors de la création de l\'historique:', error);
    throw error;
  }
};

// Récupérer les consultations à envoyer à l'admin
exports.getConsultationsAEnvoyer = async (req, res) => {
  try {
    // Récupérer toutes les consultations du médecin connecté qui n'ont pas encore été envoyées
    const consultations = await Consultation.find({
      medecinId: req.user._id,
      envoyeAdmin: false
    })
    .populate('employeId', 'nom prenom matricule service entite')
    .populate('rendezVousId', 'date lieu')
    .sort({ dateConsultation: -1 });

    res.status(200).json(consultations);
  } catch (error) {
    console.error('Erreur lors de la récupération des consultations à envoyer:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Envoyer les consultations à l'administrateur
exports.envoyerConsultationsAdmin = async (req, res) => {
  try {
    const { consultations } = req.body;

    if (!consultations || !Array.isArray(consultations) || consultations.length === 0) {
      return res.status(400).json({ message: 'Aucune consultation à envoyer' });
    }

    // Récupérer les consultations complètes
    const consultationsDetails = await Consultation.find({
      _id: { $in: consultations }
    }).populate('employeId', 'nom prenom matricule entite service');

    // Créer des entrées d'historique pour chaque consultation
    const historiqueEntries = [];

    for (const consultation of consultationsDetails) {
      const historique = await createHistoriqueFromConsultation(consultation);
      historiqueEntries.push(historique);
    }

    // Calculer les statistiques
    const statsConsultations = {
      total: consultationsDetails.length,
      faites: consultationsDetails.filter(c => c.statut === 'FAITE').length,
      nonFaites: consultationsDetails.filter(c => c.statut === 'NON_FAITE').length
    };

    // Préparer les détails complets de chaque consultation
    const consultationsDetaillees = consultationsDetails.map(consultation => {
      const detailsConsultation = {
        id: consultation._id,
        employe: {
          id: consultation.employeId._id,
          nom: consultation.employeId.nom,
          prenom: consultation.employeId.prenom,
          matricule: consultation.employeId.matricule,
          entite: consultation.employeId.entite || consultation.employeId.service
        },
        statut: consultation.statut,
        dateConsultation: consultation.dateConsultation,
        observationMedecin: consultation.observationMedecin || 'Aucune observation'
      };

      // Ajouter les détails médicaux SEULEMENT si le statut est FAITE
      if (consultation.statut === 'FAITE') {
        detailsConsultation.aptitudeGenerale = consultation.aptitudeGenerale;
        detailsConsultation.aptitudeDetails = {
          hc: consultation.aptitudeDetails?.hc || 'APTE',
          th: consultation.aptitudeDetails?.th || 'APTE',
          cir: consultation.aptitudeDetails?.cir || 'APTE'
        };
        detailsConsultation.classe = consultation.classe;
      }

      return detailsConsultation;
    });

    // Créer une notification pour l'administrateur
    const notification = new Notification({
      titre: "Nouvelles consultations médicales",
      message: `${statsConsultations.total} consultations médicales ont été effectuées et sont prêtes à être examinées (${statsConsultations.faites} faites, ${statsConsultations.nonFaites} non faites).`,
      type: "CONSULTATION",
      destinataire: "admin",
      details: {
        consultationIds: consultations,
        date: new Date().toISOString(),
        statistiques: statsConsultations,
        consultations: consultationsDetaillees,
        medecin: {
          id: req.user._id,
          nom: req.user.nom,
          prenom: req.user.prenom
        }
      }
    });

    await notification.save();

    // Marquer les consultations comme envoyées
    await Consultation.updateMany(
      { _id: { $in: consultations } },
      { $set: { envoyeAdmin: true } }
    );

    res.status(200).json({
      message: 'Consultations envoyées à l\'administrateur avec succès',
      consultations: consultationsDetails,
      historique: historiqueEntries
    });
  } catch (error) {
    console.error('Erreur lors de l\'envoi des consultations:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Récupérer l'historique des consultations d'un médecin
exports.getHistoriqueConsultationsMedecin = async (req, res) => {
  try {
    const { medecinId } = req.params;

    // Récupérer toutes les consultations du médecin
    const consultations = await Consultation.find({ medecin: medecinId })
      .populate('employe', 'nom prenom matricule entite poste')
      .populate('medecin', 'nom prenom')
      .sort({ dateConsultation: -1 }); // Trier par date décroissante

    res.status(200).json(consultations);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};