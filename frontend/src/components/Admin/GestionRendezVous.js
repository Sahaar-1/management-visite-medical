import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Table, Alert, Row, Col, ListGroup, Badge, Card, Modal } from 'react-bootstrap';
import api from '../../utils/axiosConfig';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import './GestionRendezVous.css';

const GestionRendezVous = () => {
  const [formData, setFormData] = useState({
    date: '',
    lieu: '',
    notes: '',
    employes: []
  });
  const [formErrors, setFormErrors] = useState({});
  const [rendezVous, setRendezVous] = useState([]);
  const [employes, setEmployes] = useState([]);
  const [selectedEmployes, setSelectedEmployes] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [employesAssignes, setEmployesAssignes] = useState({});
  const [selectedRendezVous, setSelectedRendezVous] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEmployes = employes.filter((employe) => {
    const fullName = `${employe.nom} ${employe.prenom}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  const chargerRendezVous = async () => {
    setLoading(true);
    try {
      const response = await api.get('/rendez-vous');
      setRendezVous(response.data);

      const assignesParAnnee = {};
      if (Array.isArray(response.data)) {
        response.data.forEach((rdv) => {
          const annee = new Date(rdv.date).getFullYear();
          if (!assignesParAnnee[annee]) {
            assignesParAnnee[annee] = new Set();
          }
          if (rdv.employes && Array.isArray(rdv.employes)) {
            rdv.employes.forEach((emp) => {
              if (emp && emp._id) {
                assignesParAnnee[annee].add(emp._id);
              }
            });
          }
        });
      }
      setEmployesAssignes(assignesParAnnee);
    } catch (error) {
      setMessage({ type: 'danger', text: 'Erreur lors du chargement des rendez-vous' });
    } finally {
      setLoading(false);
    }
  };

  const chargerEmployes = async () => {
    try {
      const response = await api.get('/rendez-vous/employes');
      setEmployes(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des employés:', error);
    }
  };

  const rafraichirEmployes = async () => {
    try {
      const response = await api.get('/rendez-vous/employes');
      setEmployes(response.data);
    } catch (error) {
      console.error('Erreur lors du rafraîchissement des employés:', error);
    }
  };

  useEffect(() => {
    chargerRendezVous();
    chargerEmployes();
    const handleFocus = () => {
      rafraichirEmployes();
    };
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const estDejaAssigne = (employeId) => {
    if (!formData.date) return false;
    const anneeSelectionnee = new Date(formData.date).getFullYear();
    if (editMode && selectedEmployes.some((emp) => emp._id === employeId)) {
      return false;
    }
    return employesAssignes[anneeSelectionnee] && employesAssignes[anneeSelectionnee].has(employeId);
  };

  const handleEmployeDoubleClick = (employe) => {
    const isAlreadySelected = selectedEmployes.some((emp) => emp._id === employe._id);
    if (isAlreadySelected) {
      const updatedSelection = selectedEmployes.filter((emp) => emp._id !== employe._id);
      setSelectedEmployes(updatedSelection);
      setFormData({
        ...formData,
        employes: updatedSelection.map((emp) => emp._id)
      });
    } else {
      if (formData.date && estDejaAssigne(employe._id)) {
        const anneeSelectionnee = new Date(formData.date).getFullYear();
        setMessage({
          type: 'warning',
          text: `${employe.nom} ${employe.prenom} a déjà un rendez-vous médical programmé pour l'année ${anneeSelectionnee}. Chaque employé ne peut avoir qu'un seul rendez-vous par an.`
        });
        return;
      }
      const updatedSelection = [...selectedEmployes, employe];
      setSelectedEmployes(updatedSelection);
      setFormData({
        ...formData,
        employes: updatedSelection.map((emp) => emp._id)
      });
    }
  };

  const handleRemoveEmploye = (employeId) => {
    const updatedSelection = selectedEmployes.filter((emp) => emp._id !== employeId);
    setSelectedEmployes(updatedSelection);
    setFormData({
      ...formData,
      employes: updatedSelection.map((emp) => emp._id)
    });
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.date) {
      errors.date = 'La date est requise';
    }
    if (!formData.lieu || formData.lieu.trim().length < 2) {
      errors.lieu = 'Le lieu doit contenir au moins 2 caractères';
    }
    if (formData.employes.length === 0) {
      errors.employes = 'Veuillez sélectionner au moins un employé';
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setLoading(true);
    setFormErrors({});
    try {
      await api.post('/rendez-vous', formData);
      setMessage({ type: 'success', text: 'Rendez-vous créé avec succès' });
      setFormData({
        date: '',
        lieu: '',
        notes: '',
        employes: []
      });
      setSelectedEmployes([]);
      chargerRendezVous();
      setShowAddModal(false);
    } catch (error) {
      setMessage({
        type: 'danger',
        text: error.response?.data?.message || 'Erreur lors de la création du rendez-vous'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (rdv) => {
    setSelectedRendezVous(rdv);
    setFormData({
      date: new Date(rdv.date).toISOString().slice(0, 16),
      lieu: rdv.lieu,
      notes: rdv.notes || '',
      employes: rdv.employes.map((emp) => emp._id)
    });
    setSelectedEmployes(rdv.employes);
    setEditMode(true);
    setShowAddModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setLoading(true);
    setFormErrors({});
    const updatedFormData = {
      ...formData,
      employes: formData.employes.map((id) => id.toString())
    };
    try {
      await api.put(`/rendez-vous/${selectedRendezVous._id}`, updatedFormData);
      setMessage({ type: 'success', text: 'Rendez-vous mis à jour avec succès' });
      setFormData({
        date: '',
        lieu: '',
        notes: '',
        employes: []
      });
      setSelectedEmployes([]);
      setEditMode(false);
      setSelectedRendezVous(null);
      chargerRendezVous();
      setShowAddModal(false);
    } catch (error) {
      setMessage({
        type: 'danger',
        text: error.response?.data?.message || 'Erreur lors de la mise à jour du rendez-vous'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setFormData({
      date: '',
      lieu: '',
      notes: '',
      employes: []
    });
    setSelectedEmployes([]);
    setEditMode(false);
    setSelectedRendezVous(null);
    setShowAddModal(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce rendez-vous ?')) {
      try {
        await api.delete(`/rendez-vous/${id}`);
        setMessage({ type: 'success', text: 'Rendez-vous supprimé avec succès' });
        chargerRendezVous();
      } catch (error) {
        setMessage({
          type: 'danger',
          text: error.response?.data?.message || 'Erreur lors de la suppression du rendez-vous'
        });
      }
    }
  };

  const handleViewDetails = async (id) => {
    try {
      const response = await api.get(`/rendez-vous/${id}`);
      setSelectedRendezVous(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des détails du rendez-vous:', error);
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'dd MMMM yyyy à HH:mm', { locale: fr });
    } catch (error) {
      return 'Date invalide';
    }
  };

  const regrouperRendezVousParAnnee = () => {
    const groupes = {};
    rendezVous.forEach((rdv) => {
      const annee = new Date(rdv.date).getFullYear();
      if (!groupes[annee]) {
        groupes[annee] = [];
      }
      groupes[annee].push(rdv);
    });
    return Object.keys(groupes)
      .sort((a, b) => b - a)
      .map((annee) => ({
        annee: parseInt(annee),
        rendezVous: groupes[annee]
      }));
  };

  return (
    <Container fluid className="rendez-vous-container">
      {message.text && (
        <Alert
          variant={message.type}
          dismissible
          onClose={() => setMessage({ type: '', text: '' })}
          className="shadow-sm mb-4"
        >
          {message.text}
        </Alert>
      )}

      <Row className="mb-4">
        <Col className="d-flex justify-content-between align-items-center">
          <h2 className="page-title">
            <i className="fas fa-calendar-alt me-2"></i>
            Gestion des Rendez-vous Médicaux
          </h2>
          <Button 
            variant="primary" 
            className="btn-add-rdv"
            onClick={() => {
              setEditMode(false);
              setFormData({
                date: '',
                lieu: '',
                notes: '',
                employes: []
              });
              setSelectedEmployes([]);
              setShowAddModal(true);
            }}
          >
            <i className="fas fa-plus-circle me-2"></i>
            Nouveau Rendez-vous
          </Button>
        </Col>
      </Row>

      {/* Liste des rendez-vous programmés */}
      <Card>
        <Card.Header>
          <h4 className="mb-0">
            <i className="fas fa-calendar-check me-2"></i>
            Rendez-vous Programmés
          </h4>
        </Card.Header>
        <Card.Body>
          {regrouperRendezVousParAnnee().map((groupe) => (
            <div key={groupe.annee} className="mb-4">
              <h5 className="section-header">Année {groupe.annee}</h5>
              <Table responsive hover className="table">
                <thead>
                  <tr>
                    <th>DATE</th>
                    <th>LIEU</th>
                    <th>EMPLOYÉS</th>
                    <th>STATUT</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {groupe.rendezVous.map((rdv) => {
                    const dateRdv = new Date(rdv.date);
                    const maintenant = new Date();
                    let statut = 'À venir';
                    let badgeClass = 'bg-warning';
                    
                    if (dateRdv < maintenant) {
                      statut = 'Terminé';
                      badgeClass = 'bg-success';
                    }
                    
                    return (
                      <tr key={rdv._id}>
                        <td>{formatDate(rdv.date)}</td>
                        <td>{rdv.lieu}</td>
                        <td>
                          {rdv.employes && rdv.employes.length > 0
                            ? rdv.employes.map((emp) => `${emp.nom} ${emp.prenom}`).join(', ')
                            : 'Aucun employé'}
                        </td>
                        <td>
                          <Badge className={badgeClass}>{statut}</Badge>
                        </td>
                        <td className="actions-cell">
                          <button
                            className="btn-action"
                            onClick={() => handleViewDetails(rdv._id)}
                            title="Voir les détails"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          <button
                            className="btn-action"
                            onClick={() => handleEdit(rdv)}
                            title="Modifier"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            className="btn-action"
                            onClick={() => handleDelete(rdv._id)}
                            title="Supprimer"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          ))}
          
          {rendezVous.length === 0 && (
            <div className="empty-state">
              <i className="fas fa-calendar-times mb-3"></i>
              <h4>Aucun rendez-vous programmé</h4>
              <p>Cliquez sur "Nouveau Rendez-vous" pour en créer un.</p>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Modal pour ajouter/modifier un rendez-vous */}
      <Modal 
        show={showAddModal} 
        onHide={handleCancelEdit} 
        size="xl" 
        centered 
        className="rdv-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {editMode ? 'Modifier le rendez-vous' : 'Nouveau rendez-vous'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col md={6}>
              <Card>
                <Card.Header>
                  <h5 className="mb-0">
                    <i className="fas fa-calendar-plus me-2"></i>
                    Informations du rendez-vous
                  </h5>
                </Card.Header>
                <Card.Body>
                  <Form onSubmit={editMode ? handleUpdate : handleSubmit}>
                    <Form.Group className="mb-3">
                      <Form.Label>Date et heure</Form.Label>
                      <Form.Control
                        type="datetime-local"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        isInvalid={!!formErrors.date}
                        required
                      />
                      <Form.Control.Feedback type="invalid">{formErrors.date}</Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Lieu</Form.Label>
                      <Form.Control
                        type="text"
                        name="lieu"
                        value={formData.lieu}
                        onChange={handleChange}
                        isInvalid={!!formErrors.lieu}
                        required
                        placeholder="Salle de consultation, Hôpital, etc."
                      />
                      <Form.Control.Feedback type="invalid">{formErrors.lieu}</Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Notes</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        placeholder="Informations complémentaires..."
                      />
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label>Employés sélectionnés</Form.Label>
                      {formErrors.employes && (
                        <div className="text-danger mb-2 small">{formErrors.employes}</div>
                      )}
                      <div className="selected-employes mb-3">
                        {selectedEmployes.length > 0 ? (
                          <div className="d-flex flex-wrap">
                            {selectedEmployes.map((emp) => (
                              <div key={emp._id} className="selected-employe-tag">
                                <span>
                                  {emp.nom} {emp.prenom}
                                </span>
                                <button
                                  type="button"
                                  className="btn-remove"
                                  onClick={() => handleRemoveEmploye(emp._id)}
                                >
                                  <i className="fas fa-times"></i>
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted fst-italic">Aucun employé sélectionné</p>
                        )}
                      </div>
                    </Form.Group>

                    <div className="d-flex gap-2">
                      <Button type="submit" variant="primary" disabled={loading} className="px-4">
                        {loading ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm me-2"
                              role="status"
                              aria-hidden="true"
                            ></span>
                            {editMode ? 'Mise à jour...' : 'Création...'}
                          </>
                        ) : (
                          <>{editMode ? 'Mettre à jour' : 'Créer le rendez-vous'}</>
                        )}
                      </Button>

                      <Button variant="outline-secondary" onClick={handleCancelEdit}>
                        Annuler
                      </Button>
                    </div>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={6}>
              <Card>
                <Card.Header>
                  <h5 className="mb-0">
                    <i className="fas fa-users me-2"></i>
                    Liste des employés disponibles
                  </h5>
                  <Form.Control
                    type="text"
                    placeholder="Rechercher un employé..."
                    className="mt-2"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </Card.Header>
                <Card.Body className="p-0">
                  <div className="employes-list">
                    <ListGroup variant="flush">
                      {filteredEmployes.map((employe) => {
                        const isAssigned = formData.date && estDejaAssigne(employe._id);
                        const isSelected = selectedEmployes.some((emp) => emp._id === employe._id);
                        return (
                          <ListGroup.Item
                            key={employe._id}
                            action
                            className={`${isSelected ? 'active' : ''} ${isAssigned && !isSelected ? 'disabled' : ''}`}
                            onDoubleClick={() => handleEmployeDoubleClick(employe)}
                            style={isAssigned && !isSelected ? { opacity: 0.6 } : {}}
                          >
                            <div className="d-flex justify-content-between align-items-center">
                              <div>
                                <span className="fw-bold">
                                  {employe.nom} {employe.prenom}
                                </span>
                                <br />
                                <small className="text-muted">Matricule: {employe.matricule}</small>
                              </div>
                              <div>
                                <small className="text-muted">{employe.entite}</small>
                                {isAssigned && !isSelected && (
                                  <Badge bg="warning" className="ms-2">
                                    Déjà programmé
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </ListGroup.Item>
                        );
                      })}
                    </ListGroup>
                  </div>
                  <div className="p-2 bg-light border-top">
                    <small className="text-muted fst-italic">
                      Double-cliquez sur un employé pour l'ajouter/le retirer
                    </small>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Modal.Body>
      </Modal>

      {/* Modal pour afficher les détails d'un rendez-vous */}
      <Modal 
        show={selectedRendezVous !== null && !editMode} 
        onHide={() => setSelectedRendezVous(null)}
        centered
        className="rdv-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Détails du rendez-vous</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRendezVous && (
            <Row>
              <Col md={6}>
                <p><strong>Date:</strong> {formatDate(selectedRendezVous.date)}</p>
                <p><strong>Lieu:</strong> {selectedRendezVous.lieu}</p>
                <p><strong>Notes:</strong> {selectedRendezVous.notes || 'Aucune note'}</p>
              </Col>
              <Col md={6}>
                <p><strong>Employés:</strong></p>
                <ListGroup>
                  {selectedRendezVous.employes.map(emp => (
                    <ListGroup.Item key={emp._id}>
                      {emp.nom} {emp.prenom} - {emp.matricule}
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="outline-secondary" 
            onClick={() => setSelectedRendezVous(null)}
          >
            Fermer
          </Button>
          {selectedRendezVous && (
            <Button 
              variant="primary" 
              onClick={() => {
                handleEdit(selectedRendezVous);
                setSelectedRendezVous(null);
              }}
            >
              Modifier
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default GestionRendezVous;