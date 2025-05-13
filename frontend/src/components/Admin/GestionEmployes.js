import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Modal, Form, Row, Col, Card } from 'react-bootstrap';
import api from '../../utils/axiosConfig';
import './GestionEmployes.css'; // Importez le fichier de styles CSS
const GestionEmployes = () => {
  const [employes, setEmployes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedEmploye, setSelectedEmploye] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [entiteFiltre, setEntiteFiltre] = useState(''); // Filter for entities
  const [formData, setFormData] = useState({
    matricule: '',
    nom: '',
    prenom: '',
    entite: '',
  });

  const entities = ['OIG/B', 'OIG/B/E', 'OIG/B/L', 'OIG/B/M', 'OIG/B/P', 'OIG/B/M/C'];

  const loadEmployes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/employes');
      const employeesData = Array.isArray(response.data) ? response.data : [];
      setEmployes(employeesData);
    } catch (error) {
      console.error('Erreur lors du chargement des employés:', error);
      setError(error.response?.data?.message || error.message || 'Erreur lors du chargement des employés');
      setEmployes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployes();
  }, []);

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

  // Filter employees by selected entity
  const employesFiltres = employes.filter((employe) =>
    !entiteFiltre || employe.entite === entiteFiltre
  );

  return (
    <Container fluid className="mt-4">
      <Card className={loading ? "opacity-50 position-relative" : "position-relative"}>
        {loading && (
          <div className="position-absolute w-100 h-100 d-flex justify-content-center align-items-center" style={{ zIndex: 1000 }}>
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Chargement...</span>
            </div>
          </div>
        )}
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h3>Gestion des Employés</h3>
          {error && (
            <div className="text-danger">{error}</div>
          )}
          <div className="d-flex gap-2">
            <Form.Select
              value={entiteFiltre}
              onChange={(e) => setEntiteFiltre(e.target.value)}
              style={{ width: 'auto' }}
            >
              <option value="">Toutes les entités</option>
              {entities.map((entite) => (
                <option key={entite} value={entite}>{entite}</option>
              ))}
            </Form.Select>
            <Button className="btn-ajouter" onClick={() => {
              resetForm();
              setShowModal(true);
            }}>
              + Ajouter un employé
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          <div className="table-responsive">
            <Table striped bordered hover>
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
                {Array.isArray(employesFiltres) && employesFiltres.length > 0 ? (
                  employesFiltres.map((employe) => (
                    <tr key={employe._id || employe.matricule}>
                      <td>{employe.matricule}</td>
                      <td>{employe.nom}</td>
                      <td>{employe.prenom}</td>
                      <td>{employe.entite}</td>
                      <td>
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
          </div>
        </Card.Body>
      </Card>

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
              <Col md={3}>
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
              <Col md={3}>
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
              <Col md={3}>
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
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Entité</Form.Label>
                  <Form.Select
                    value={formData.entite}
                    onChange={(e) => setFormData({ ...formData, entite: e.target.value })}
                    required
                  >
                    <option value="">Sélectionner une entité</option>
                    {entities.map((entite) => (
                      <option key={entite} value={entite}>{entite}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Annuler
              </Button>
              <Button variant="primary" type="submit">
                {selectedEmploye ? 'Modifier' : 'Ajouter'}
              </Button>
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
          <Button variant="secondary" onClick={() => setShowViewModal(false)}>
            Fermer
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default GestionEmployes;