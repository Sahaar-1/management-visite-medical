const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = {
  // Middleware pour vérifier le token JWT
  verifierToken: async (req, res, next) => {
    try {
      // Récupérer le token depuis l'en-tête Authorization
      const authHeader = req.header('Authorization');
      
      // Vérifier si l'en-tête Authorization existe
      if (!authHeader) {
        console.log('Aucun en-tête Authorization trouvé');
        return res.status(401).json({ 
          message: 'Aucun token fourni, autorisation refusée' 
        });
      }
      
      // Extraire le token (supporte les formats "Bearer token" et "token")
      let token = authHeader;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
      
      if (!token) {
        console.log('Token vide après extraction');
        return res.status(401).json({ 
          message: 'Token invalide, autorisation refusée' 
        });
      }

      console.log('Token reçu:', token.substring(0, 10) + '...');
      
      // Vérifier et décoder le token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token décodé:', decoded);
      
      // Trouver l'utilisateur
      const user = await User.findById(decoded.id);

      if (!user) {
        console.log('Utilisateur non trouvé avec ID:', decoded.id);
        return res.status(401).json({ 
          message: 'Utilisateur non trouvé' 
        });
      }

      console.log('Utilisateur authentifié:', user.email);
      
      // Ajouter l'utilisateur et le token à l'objet de requête
      req.user = user;
      req.token = token;
      next();
    } catch (error) {
      console.error('Erreur d\'authentification:', error.message);
      res.status(401).json({ 
        message: 'Token invalide ou expiré', 
        error: error.message 
      });
    }
  },

  // Middleware pour vérifier le rôle
  autoriserRoles: (...rolesAutorises) => {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({ 
          message: 'Non authentifié' 
        });
      }

      if (!rolesAutorises.includes(req.user.role)) {
        return res.status(403).json({ 
          message: 'Accès refusé' 
        });
      }

      next();
    };
  },

  // Middleware pour vérifier le rôle de l'utilisateur
  verifierRole: (roles) => {
    return (req, res, next) => {
      if (!req.user) {
        console.log('Utilisateur non authentifié');
        return res.status(401).json({
          message: 'Authentification requise'
        });
      }

      if (!roles.includes(req.user.role)) {
        console.log(`Accès refusé pour le rôle ${req.user.role}. Rôles autorisés:`, roles);
        return res.status(403).json({
          message: 'Accès refusé. Vous n\'avez pas les permissions nécessaires.'
        });
      }

      console.log(`Accès autorisé pour le rôle ${req.user.role}`);
      next();
    };
  },

  // Générer un token JWT
  genererToken: (user) => {
    return jwt.sign(
      { 
        id: user._id, 
        email: user.email, 
        role: user.role 
      }, 
      process.env.JWT_SECRET, 
      { 
        expiresIn: process.env.JWT_EXPIRE || '24h' 
      }
    );
  }
};

module.exports = authMiddleware;
