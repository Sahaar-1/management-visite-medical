const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const authController = {
  // Obtenir la liste des médecins
  getMedecins: async (req, res) => {
    try {
      // Vérifier que l'utilisateur est un administrateur
      if (req.user.role !== 'admin') {
        return res.status(403).json({ 
          message: 'Accès refusé. Seuls les administrateurs peuvent voir la liste des médecins.' 
        });
      }

      const medecins = await User.find({ role: 'medecin' })
        .select('-motDePasse')
        .sort({ nom: 1, prenom: 1 });

      res.json(medecins);
    } catch (error) {
      console.error('Erreur lors de la récupération des médecins:', error);
      res.status(500).json({ 
        message: 'Erreur lors de la récupération des médecins',
        error: error.message 
      });
    }
  },

  // Mise à jour de la dernière connexion
  updateDernierConnexion: async (userId) => {
    try {
      await User.findByIdAndUpdate(userId, {
        dernierConnexion: new Date()
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la dernière connexion:', error);
    }
  },
  // Inscription - Réservée aux administrateurs pour créer des comptes médecins uniquement
  inscrire: async (req, res) => {
    try {
      const { nom, prenom, email, motDePasse, specialite, telephone } = req.body;
      
      // Log pour debug
      console.log('Tentative de création de compte médecin avec:', { 
        email, 
        specialite 
      });

      // Forcer le rôle à 'medecin' car seuls les comptes médecins peuvent être créés
      const role = 'medecin';

      // Validation pour les médecins
      if (!specialite) {
        return res.status(400).json({ 
          message: 'La spécialité est requise pour les médecins' 
        });
      }

      // Vérifier si l'utilisateur existe déjà
      const utilisateurExistant = await User.findOne({ email });
      if (utilisateurExistant) {
        return res.status(400).json({ 
          message: 'Un utilisateur avec cet email existe déjà' 
        });
      }
      
      // Créer un nouvel utilisateur médecin
      const nouvelUtilisateur = new User({
        nom,
        prenom,
        email,
        motDePasse, // Le mot de passe sera haché par le middleware pre-save
        role,
        specialite,
        telephone
      });

      // Sauvegarder l'utilisateur
      await nouvelUtilisateur.save();

      res.status(201).json({
        message: 'Compte médecin créé avec succès',
        utilisateur: {
          id: nouvelUtilisateur._id,
          nom: nouvelUtilisateur.nom,
          prenom: nouvelUtilisateur.prenom,
          email: nouvelUtilisateur.email,
          role: nouvelUtilisateur.role,
          specialite: nouvelUtilisateur.specialite
        }
      });
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      res.status(500).json({ 
        message: 'Erreur lors de la création du compte', 
        error: error.message 
      });
    }
  },
  // Connexion avec sélection de rôle
  connecter: async (req, res) => {
    try {
      const { email, motDePasse, role } = req.body;
      console.log('Tentative de connexion avec:', { email, role });
      
      if (!email || !motDePasse || !role) {
        console.log('Email, mot de passe ou rôle manquant');
        return res.status(400).json({ 
          message: 'Veuillez fournir un email, un mot de passe et sélectionner un rôle' 
        });
      }

      // Vérifier que le rôle est autorisé (admin ou medecin uniquement)
      if (role !== 'admin' && role !== 'medecin') {
        console.log('Tentative de connexion avec un rôle non autorisé:', role);
        return res.status(403).json({ 
          message: 'Accès non autorisé. Seuls les administrateurs et les médecins peuvent se connecter.' 
        });
      }

      // Vérifier si l'utilisateur existe avec l'email et le rôle spécifié
      const utilisateur = await User.findOne({ email, role }).select('+motDePasse');
      console.log('Utilisateur trouvé:', utilisateur ? 'Oui' : 'Non');

      if (!utilisateur) {
        return res.status(401).json({ 
          message: 'Email, mot de passe ou rôle incorrect' 
        });
      }      // Vérifier le mot de passe avec la méthode comparePassword
      console.log('Tentative de vérification du mot de passe pour:', email);
      const estValide = await utilisateur.comparePassword(motDePasse);
      console.log('Résultat de la vérification:', estValide ? 'Succès' : 'Échec');

      if (!estValide) {
        return res.status(401).json({ 
          message: 'Email, mot de passe ou rôle incorrect' 
        });
      }

      // Mettre à jour la dernière connexion
      utilisateur.dernierConnexion = new Date();
      await utilisateur.save();

      // Générer le token avec le middleware
      const token = authMiddleware.genererToken(utilisateur);

      // Retourner les informations sans le mot de passe
      const userResponse = {
        _id: utilisateur._id,
        nom: utilisateur.nom,
        prenom: utilisateur.prenom,
        email: utilisateur.email,
        role: utilisateur.role,
        dernierConnexion: utilisateur.dernierConnexion,
        service: utilisateur.service
      };

      res.json({
        user: userResponse,
        token
      });
    } catch (error) {
      console.error('Erreur de connexion:', error);
      res.status(500).json({ 
        message: 'Erreur lors de la connexion',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Liste des médecins - Pour l'admin
  getMedecins: async (req, res) => {
    try {
      // Vérifier que l'utilisateur est un administrateur
      if (req.user.role !== 'admin') {
        return res.status(403).json({ 
          message: 'Accès refusé. Seuls les administrateurs peuvent voir la liste des médecins.' 
        });
      }

      const medecins = await User.find({ role: 'medecin' })
        .select('-motDePasse')
        .sort({ nom: 1, prenom: 1 });

      res.json(medecins);
    } catch (error) {
      console.error('Erreur lors de la récupération des médecins:', error);
      res.status(500).json({ 
        message: 'Erreur lors de la récupération des médecins',
        error: error.message 
      });
    }
  },

  // Mise à jour de la dernière connexion
  updateDernierConnexion: async (userId) => {
    try {
      await User.findByIdAndUpdate(userId, {
        dernierConnexion: new Date()
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la dernière connexion:', error);
    }
  },

  // Récupérer le profil
  getProfil: async (req, res) => {
    try {
      // req.user est déjà défini par le middleware verifierToken
      console.log('Récupération du profil pour:', req.user.email);
      
      const utilisateur = await User.findById(req.user._id)
        .select('-motDePasse')
        .populate('service', 'nom');
        
      if (!utilisateur) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }

      res.json({
        _id: utilisateur._id,
        nom: utilisateur.nom,
        prenom: utilisateur.prenom,
        email: utilisateur.email,
        role: utilisateur.role,
        service: utilisateur.service,
        telephone: utilisateur.telephone,  // Ajout du téléphone
        specialite: utilisateur.specialite, // Ajout de la spécialité
        dernierConnexion: utilisateur.dernierConnexion
      });
    } catch (error) {
      console.error('Erreur de récupération du profil:', error);
      res.status(500).json({ 
        message: 'Erreur lors de la récupération du profil',
        error: error.message
      });
    }
  },

  // Mettre à jour le profil
  mettreAJourProfil: async (req, res) => {
    try {
      const { nom, prenom, telephone, adresse, specialite } = req.body;
      console.log('Mise à jour du profil pour:', req.user.email, req.body);

      // Validation du numéro de téléphone
      if (telephone && !/^[0-9]{10}$/.test(telephone)) {
        return res.status(400).json({ 
          message: 'Le numéro de téléphone doit contenir exactement 10 chiffres' 
        });
      }

      // Récupérer l'utilisateur avec tous les champs
      const utilisateur = await User.findById(req.user._id);
      
      if (!utilisateur) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }

      // Validation spécifique pour les médecins
      if (utilisateur.role === 'medecin') {
        if (specialite) {
          utilisateur.specialite = specialite;
        }
      }
      
      // Mise à jour des champs communs
      if (nom) utilisateur.nom = nom;
      if (prenom) utilisateur.prenom = prenom;
      if (telephone) utilisateur.telephone = telephone;
      if (adresse) utilisateur.adresse = adresse;

      // Sauvegarder les modifications
      await utilisateur.save();
      console.log('Profil mis à jour avec succès');

      // Retourner la réponse avec tous les champs pertinents
      res.json({
        message: 'Profil mis à jour avec succès',
        utilisateur: {
          _id: utilisateur._id,
          nom: utilisateur.nom,
          prenom: utilisateur.prenom,
          email: utilisateur.email,
          role: utilisateur.role,
          telephone: utilisateur.telephone,
          adresse: utilisateur.adresse,
          specialite: utilisateur.specialite,
          service: utilisateur.service
        }
      });
    } catch (error) {
      console.error('Erreur de mise à jour du profil:', error);
      res.status(500).json({ 
        message: 'Erreur lors de la mise à jour du profil', 
        error: error.message 
      });
    }
  },
  
  // Déconnexion
  deconnecter: async (req, res) => {
    try {
      // Dans une implémentation JWT standard, il n'y a pas besoin de faire
      // d'actions côté serveur pour la déconnexion, car c'est le client qui gère le token
      // Mais on peut implémenter une blacklist de tokens si nécessaire plus tard
      console.log('Déconnexion réussie pour:', req.user.email);
      
      res.json({ message: 'Déconnexion réussie' });
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      res.status(500).json({ 
        message: 'Erreur lors de la déconnexion', 
        error: error.message 
      });
    }
  },

  // Récupérer les statistiques de connexion pour l'admin
  getStatistiquesConnexion: async (req, res) => {
    try {
      // Vérifier que l'utilisateur est un administrateur
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Accès refusé' });
      }

      // Récupérer les 10 dernières connexions
      const dernieresConnexions = await User.find({ dernierConnexion: { $ne: null } })
        .select('nom prenom email role dernierConnexion')
        .sort({ dernierConnexion: -1 })
        .limit(10);

      // Nombre total de médecins
      const nombreMedecins = await User.countDocuments({ role: 'medecin' });
      
      // Nombre total d'employés
      const nombreEmployes = await User.countDocuments({ role: 'employe' });

      res.json({
        dernieresConnexions,
        statistiques: {
          nombreMedecins,
          nombreEmployes
        }
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      res.status(500).json({ 
        message: 'Erreur lors de la récupération des statistiques', 
        error: error.message 
      });
    }
  },

  // Obtenir la liste des dernières connexions des médecins
  getMedecinConnexions: async (req, res) => {
    try {
      const medecins = await User.find({ role: 'medecin' })
        .select('nom prenom dernierConnexion')
        .sort({ dernierConnexion: -1 });

      res.json(medecins);
    } catch (error) {
      console.error('Erreur lors de la récupération des connexions médecins:', error);
      res.status(500).json({
        message: 'Erreur lors de la récupération des connexions médecins',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Mettre à jour un médecin
  mettreAJourMedecin: async (req, res) => {
    try {
      // Vérifier que l'utilisateur est un administrateur
      if (req.user.role !== 'admin') {
        return res.status(403).json({ 
          message: 'Accès refusé. Seuls les administrateurs peuvent modifier les médecins.' 
        });
      }

      const { id } = req.params;
      const { nom, prenom, email, specialite, telephone } = req.body;

      // Vérifier si le médecin existe
      const medecin = await User.findOne({ _id: id, role: 'medecin' });
      if (!medecin) {
        return res.status(404).json({ message: 'Médecin non trouvé' });
      }

      // Vérifier si l'email est déjà utilisé par un AUTRE utilisateur
      if (email && email !== medecin.email) {
        const emailExiste = await User.findOne({ email, _id: { $ne: id } });
        if (emailExiste) {
          return res.status(400).json({ message: 'Cet email est déjà utilisé par un autre utilisateur' });
        }
      }

      // Mettre à jour les champs
      if (nom) medecin.nom = nom;
      if (prenom) medecin.prenom = prenom;
      if (email) medecin.email = email;
      if (specialite) medecin.specialite = specialite;
      if (telephone) medecin.telephone = telephone;

      // Sauvegarder les modifications
      await medecin.save();

      res.json({
        message: 'Médecin mis à jour avec succès',
        medecin: {
          _id: medecin._id,
          nom: medecin.nom,
          prenom: medecin.prenom,
          email: medecin.email,
          specialite: medecin.specialite,
          telephone: medecin.telephone
        }
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du médecin:', error);
      res.status(500).json({ 
        message: 'Erreur lors de la mise à jour du médecin', 
        error: error.message 
      });
    }
  },

  // Suppression d'un médecin
  supprimerMedecin: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Vérifier que l'utilisateur est un administrateur
      if (req.user.role !== 'admin') {
        return res.status(403).json({ 
          message: 'Accès refusé. Seuls les administrateurs peuvent supprimer les médecins.' 
        });
      }
      
      // Vérifier que le médecin existe
      const medecin = await User.findOne({ _id: id, role: 'medecin' });
      if (!medecin) {
        return res.status(404).json({ message: 'Médecin non trouvé' });
      }
      
      // Supprimer le médecin
      await User.findByIdAndDelete(id);
      
      res.json({ message: 'Médecin supprimé avec succès' });
    } catch (error) {
      console.error('Erreur lors de la suppression du médecin:', error);
      res.status(500).json({ 
        message: 'Erreur lors de la suppression du médecin', 
        error: error.message 
      });
    }
  },

  // Réinitialisation du mot de passe d'un médecin
  reinitialiserMotDePasse: async (req, res) => {
    try {
      const { id } = req.params;
      const { nouveauMotDePasse, confirmationMotDePasse } = req.body;
      
      // Vérifier que l'utilisateur est un administrateur
      if (req.user.role !== 'admin') {
        return res.status(403).json({ 
          message: 'Accès refusé. Seuls les administrateurs peuvent réinitialiser les mots de passe.' 
        });
      }
      
      // Vérifier que le médecin existe
      const medecin = await User.findOne({ _id: id, role: 'medecin' });
      if (!medecin) {
        return res.status(404).json({ message: 'Médecin non trouvé' });
      }
      
      // Vérifier que les mots de passe correspondent
      if (nouveauMotDePasse !== confirmationMotDePasse) {
        return res.status(400).json({ message: 'Les mots de passe ne correspondent pas' });
      }
      
      // Vérifier que le mot de passe est assez long
      if (nouveauMotDePasse.length < 6) {
        return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 6 caractères' });
      }
      
      // Hacher le nouveau mot de passe
      const salt = await bcrypt.genSalt(10);
      const motDePasseHache = await bcrypt.hash(nouveauMotDePasse, salt);
      
      // Mettre à jour le mot de passe du médecin
      await User.findByIdAndUpdate(id, { motDePasse: motDePasseHache });
      
      res.json({ message: 'Mot de passe réinitialisé avec succès' });
    } catch (error) {
      console.error('Erreur lors de la réinitialisation du mot de passe:', error);
      res.status(500).json({ 
        message: 'Erreur lors de la réinitialisation du mot de passe', 
        error: error.message 
      });
    }
  },
};

module.exports = authController;
