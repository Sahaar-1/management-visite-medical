import React, { useState, useEffect, useCallback } from 'react';
import { Container, Form, Button as BootstrapButton, Table, Alert, Modal, Spinner, Row, Col, Pagination, InputGroup } from 'react-bootstrap';
import { FaPlus, FaSearch } from 'react-icons/fa';
import api from '../../utils/axiosConfig';
import './GestionEmployes.css';

const GestionEmployes = () => {
  const [employes, setEmployes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedEmploye, setSelectedEmploye] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [entiteFiltre, setEntiteFiltre] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [availableEntities, setAvailableEntities] = useState([]); // Added missing state variable
  const [formData, setFormData] = useState({
    matricule: '',
    nom: '',
    prenom: '',
    entite: '',
  });
  
  // Ajout des états pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [employesPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);


  const loadEmployes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/employes');
      const employeesData = Array.isArray(response.data) ? response.data : [];
      setEmployes(employeesData);
      
      // Extraire toutes les entités uniques des données
      const uniqueEntities = [...new Set(employeesData.map(emp => emp.entite))].filter(Boolean).sort();
      setAvailableEntities(uniqueEntities);
      
      // Calculer le nombre total de pages
      const filteredEmployees = employeesData.filter((employe) =>
        (!entiteFiltre || employe.entite === entiteFiltre) &&
        (searchTerm === '' || 
         employe.matricule.toLowerCase().includes(searchTerm.toLowerCase()) ||
         employe.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
         employe.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
         employe.entite.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setTotalPages(Math.ceil(filteredEmployees.length / employesPerPage));
    } catch (error) {
      console.error('Erreur lors du chargement des employés:', error);
      setError(error.response?.data?.message || error.message || 'Erreur lors du chargement des employés');
      setEmployes([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [entiteFiltre, employesPerPage, searchTerm]);

  useEffect(() => {
    loadEmployes();
  }, [loadEmployes]);
  
  // Recalculer le nombre total de pages lorsque le filtre change
  useEffect(() => {
    const filteredEmployees = employes.filter((employe) =>
      (!entiteFiltre || employe.entite === entiteFiltre) &&
      (searchTerm === '' || 
       employe.matricule.toLowerCase().includes(searchTerm.toLowerCase()) ||
       employe.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
       employe.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
       employe.entite.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setTotalPages(Math.ceil(filteredEmployees.length / employesPerPage));
    setCurrentPage(1); // Réinitialiser à la première page lors du changement de filtre
  }, [entiteFiltre, employes, employesPerPage, searchTerm]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      if (selectedEmploye) {
        await api.put(`/employes/${selectedEmploye._id}`, formData);
      } else {
        await api.post('/employes', formData);
      }
      await loadEmployes();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement:', error);
      setError(`Erreur lors de l'enregistrement: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet employé ?')) {
      try {
        await api.delete(`/employes/${id}`);
        loadEmployes();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const handleEdit = (employe) => {
    setSelectedEmploye(employe);
    setFormData({
      matricule: employe.matricule,
      nom: employe.nom,
      prenom: employe.prenom,
      entite: employe.entite,
    });
    setShowModal(true);
  };

  const handleView = (employe) => {
    setSelectedEmploye(employe);
    setShowViewModal(true);
  };

  const resetForm = () => {
    setSelectedEmploye(null);
    setFormData({
      matricule: '',
      nom: '',
      prenom: '',
      entite: '',
    });
  };

  // Filtrer les employés par entité et terme de recherche
  const employesFiltres = employes.filter((employe) =>
    (!entiteFiltre || employe.entite === entiteFiltre) &&
    (searchTerm === '' || 
     employe.matricule.toLowerCase().includes(searchTerm.toLowerCase()) ||
     employe.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
     employe.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
     employe.entite.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  // Obtenir les employés pour la page actuelle
  const indexOfLastEmploye = currentPage * employesPerPage;
  const indexOfFirstEmploye = indexOfLastEmploye - employesPerPage;
  const currentEmployes = employesFiltres.slice(indexOfFirstEmploye, indexOfLastEmploye);
  
  // Changer de page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Gérer la recherche
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <Container className="gestion-employes-container">
      <h2 className="gestion-employes-title">Gestion des Employés</h2>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <div className="medecins-list-section">
        {/* Barre de recherche et filtres */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
          <div className="search-filter-container mb-2 mb-md-0">
            <InputGroup className="search-bar">
              <InputGroup.Text>
                <FaSearch />
              </InputGroup.Text>
              <Form.Control
                placeholder="Rechercher un employé..."
                value={searchTerm}
                onChange={handleSearch}
              />
            </InputGroup>
          </div>
          
          <div className="d-flex align-items-center">
            <Form.Select
              value={entiteFiltre}
              onChange={(e) => setEntiteFiltre(e.target.value)}
              style={{ width: 'auto', marginRight: '10px' }}
            >
              <option value="">Toutes les entités</option>
              {availableEntities.map((entite) => (
                <option key={entite} value={entite}>{entite}</option>
              ))}
            </Form.Select>
            <BootstrapButton className="btn-add-employe" onClick={() => {
              resetForm();
              setShowModal(true);
            }}>
              <FaPlus /> Ajouter un employé
            </BootstrapButton>
          </div>
        </div>
        
        {loading ? (
          <div className="text-center">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Chargement...</span>
            </Spinner>
          </div>
        ) : (
          <>
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>MAT</th>
                  <th>NOM</th>
                  <th>PRENOM</th>
                  <th>ENTITE</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(currentEmployes) && currentEmployes.length > 0 ? (
                  currentEmployes.map((employe) => (
                    <tr key={employe._id || employe.matricule}>
                      <td>{employe.matricule}</td>
                      <td>
                        <i className="fas fa-user-circle text-secondary me-2"></i>
                        {employe.nom}
                      </td>
                      <td>{employe.prenom}</td>
                      <td>{employe.entite}</td>
                      <td className="actions-cell">
                        <button
                          className="btn-action"
                          onClick={() => handleView(employe)}
                          title="Voir les détails"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button
                          className="btn-action"
                          onClick={() => handleEdit(employe)}
                          title="Modifier"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          className="btn-action"
                          onClick={() => handleDelete(employe._id)}
                          title="Supprimer"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center">
                      Aucun employé trouvé
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="d-flex justify-content-center mt-4">
                <Pagination>
                  <Pagination.First 
                    onClick={() => setCurrentPage(1)} 
                    disabled={currentPage === 1}
                  />
                  <Pagination.Prev 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                    disabled={currentPage === 1}
                  />
                  
                  {[...Array(totalPages).keys()].map(number => {
                    // Afficher seulement 5 pages autour de la page actuelle
                    if (
                      number + 1 === 1 || 
                      number + 1 === totalPages || 
                      (number + 1 >= currentPage - 2 && number + 1 <= currentPage + 2)
                    ) {
                      return (
                        <Pagination.Item
                          key={number + 1}
                          active={number + 1 === currentPage}
                          onClick={() => paginate(number + 1)}
                        >
                          {number + 1}
                        </Pagination.Item>
                      );
                    } else if (
                      (number + 1 === currentPage - 3 && currentPage > 4) || 
                      (number + 1 === currentPage + 3 && currentPage < totalPages - 3)
                    ) {
                      return <Pagination.Ellipsis key={`ellipsis-${number}`} />;
                    }
                    return null;
                  })}
                  
                  <Pagination.Next 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                    disabled={currentPage === totalPages}
                  />
                  <Pagination.Last 
                    onClick={() => setCurrentPage(totalPages)} 
                    disabled={currentPage === totalPages}
                  />
                </Pagination>
              </div>
            )}
            
            <div className="mt-2 text-center text-muted">
              Affichage de {employesFiltres.length > 0 ? indexOfFirstEmploye + 1 : 0} à {Math.min(indexOfLastEmploye, employesFiltres.length)} sur {employesFiltres.length} employés
            </div>
          </>
        )}
      </div>

      {/* Modal for Adding/Editing Employee */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedEmploye ? 'Modifier un employé' : 'Ajouter un employé'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Matricule</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.matricule}
                    onChange={(e) => setFormData({ ...formData, matricule: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nom</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Prénom</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.prenom}
                    onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Entité</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.entite}
                    onChange={(e) => setFormData({ ...formData, entite: e.target.value })}
                    placeholder="Ex: OIG/B/E/I"
                    required
                  />
                  <Form.Text className="text-muted">
                    Saisissez l'entité directement (ex: OIG/B/E/I, OIG/B/M, etc.)
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>
            <div className="d-flex justify-content-end mt-3">
              <BootstrapButton variant="secondary" onClick={() => setShowModal(false)} className="me-2">
                Annuler
              </BootstrapButton>
              <BootstrapButton variant="primary" type="submit" disabled={loading}>
                {loading ? 'Chargement...' : (selectedEmploye ? 'Modifier' : 'Ajouter')}
              </BootstrapButton>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Modal for Viewing Employee */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Détails de l'Employé</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedEmploye && (
            <div>
              <p><strong>Matricule:</strong> {selectedEmploye.matricule}</p>
              <p><strong>Nom:</strong> {selectedEmploye.nom}</p>
              <p><strong>Prénom:</strong> {selectedEmploye.prenom}</p>
              <p><strong>Entité:</strong> {selectedEmploye.entite}</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <BootstrapButton variant="secondary" onClick={() => setShowViewModal(false)}>
            Fermer
          </BootstrapButton>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default GestionEmployes;