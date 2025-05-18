const express = require('express');
const router = express.Router();
const employeController = require('../controllers/employeController');
const { verifierToken, verifierRole } = require('../middleware/authMiddleware');
const Employe = require('../models/Employe'); // Assurez-vous d'importer le modèle Employe

// Modifier ces routes pour enlever le préfixe '/employes'
router.get('/', employeController.getAllEmployees);
router.post('/', employeController.createEmployee);
router.put('/:id', employeController.updateEmployee);
router.delete('/:id', employeController.deleteEmployee);

// Route pour obtenir les statistiques des employés par entité
router.get('/par-entite', verifierToken, verifierRole(['admin']), async (req, res) => {
  try {
    const stats = await Employe.aggregate([
      {
        $group: {
          _id: "$entite",
          nombre: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          entite: "$_id",
          nombre: 1
        }
      },
      {
        $sort: { nombre: -1 }
      }
    ]);
    
    res.json(stats);
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques des employés:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;