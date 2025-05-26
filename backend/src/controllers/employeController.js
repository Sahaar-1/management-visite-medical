const Employee = require('../models/Employe');

// Get all employees
exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find();
    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new employee
exports.createEmployee = async (req, res) => {
  const { matricule, nom, prenom, entite, telephone, dateDerniereVisiteMedicale } = req.body;

  try {
    const employee = new Employee({
      matricule,
      nom,
      prenom,
      entite,
      telephone,
      dateDerniereVisiteMedicale: dateDerniereVisiteMedicale ? new Date(dateDerniereVisiteMedicale) : null
    });
    const savedEmployee = await employee.save();
    res.status(201).json(savedEmployee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update an employee
exports.updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { matricule, nom, prenom, entite, telephone, dateDerniereVisiteMedicale } = req.body;

    const updateData = { matricule, nom, prenom, entite, telephone };
    if (dateDerniereVisiteMedicale !== undefined) {
      updateData.dateDerniereVisiteMedicale = dateDerniereVisiteMedicale ? new Date(dateDerniereVisiteMedicale) : null;
    }

    // Si aucune date manuelle n'est fournie, essayer de récupérer la dernière consultation
    if (!dateDerniereVisiteMedicale) {
      try {
        const Historique = require('../models/Historique');
        const derniereConsultation = await Historique.findOne({
          employe: id,
          statut: 'FAITE'
        }).sort({ dateConsultation: -1 });

        if (derniereConsultation) {
          updateData.dateDerniereVisiteMedicale = derniereConsultation.dateConsultation;
        }
      } catch (histError) {
        console.log('Erreur lors de la récupération de la dernière consultation:', histError);
        // Ne pas faire échouer la mise à jour si la récupération échoue
      }
    }

    const updatedEmployee = await Employee.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    if (!updatedEmployee) {
      return res.status(404).json({ message: 'Employé non trouvé' });
    }

    // Mettre à jour les informations de l'employé dans les rendez-vous
    // Vérifier si l'employé est associé à un utilisateur
    const User = require('../models/User');
    const user = await User.findOne({
      $or: [
        { _id: id },
        { employe: id }
      ]
    });

    if (user) {
      // Mettre à jour le nom et prénom de l'utilisateur
      user.nom = nom;
      user.prenom = prenom;
      await user.save();

      // Mettre à jour les rendez-vous associés à cet utilisateur
      const RendezVous = require('../models/RendezVous');
      await RendezVous.updateMany(
        { employes: user._id },
        { $set: { "employes.$[elem].nom": nom, "employes.$[elem].prenom": prenom } },
        { arrayFilters: [{ "elem._id": user._id }] }
      );
    }

    res.status(200).json(updatedEmployee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete an employee
exports.deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedEmployee = await Employee.findByIdAndDelete(id);
    if (!deletedEmployee) {
      return res.status(404).json({ message: 'Employé non trouvé' });
    }
    res.status(200).json({ message: 'Employé supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
