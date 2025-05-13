const express = require('express');
const router = express.Router();
const employeController = require('../controllers/employeController');

router.get('/employes', employeController.getAllEmployees);
router.post('/employes', employeController.createEmployee);
router.put('/employes/:id', employeController.updateEmployee);
router.delete('/employes/:id', employeController.deleteEmployee);

module.exports = router;