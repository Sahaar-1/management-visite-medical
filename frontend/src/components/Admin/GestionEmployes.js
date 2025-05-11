import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Modal, Form, Row, Col, Card } from 'react-bootstrap';
import api from '../../utils/axiosConfig';

const GestionEmployes = () => {
  const [employes, setEmployes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedEmploye, setSelectedEmploye] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [serviceFiltre, setServiceFiltre] = useState('');
  const [anneeFiltre, setAnneeFiltre] = useState(new Date().getFullYear());
  const [formData, setFormData] = useState({
    matricule: '',
    nom: '',
    prenom: '',
    entite: '',
    service: '',
    dateVisite2024: '',
    dateVisite2025: '',
    eligibilite: '1',
    aptitude: 'APTE',
    dateHC: '',
    aptitudeHC: 'APTE',
    dateTH: '',
    aptitudeTH: 'APTE',
    dateEC: '',
    aptitudeEC: 'APTE',
    statut: 'Non faite',
    observations: {
      aptitudeGenerale: '',
      aptitudeHC: '',
      aptitudeTH: '',
      aptitudeEC: ''
    }
  });
  const loadEmployes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/employes');
      
      if (!response.data) {
        throw new Error('Aucune donnée reçue du serveur');
      }
      
      const employeesData = Array.isArray(response.data) ? response.data : [];
      console.log('Employés chargés:', employeesData); // Debug log
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
        const response = await api.put(`/employes/${selectedEmploye._id}`, formData);
        console.log('Update response:', response.data);
      } else {
        const response = await api.post('/employes', formData);
        console.log('Create response:', response.data);
      }
      await loadEmployes();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement:', error);
      const errorMessage = error.response?.data?.message || error.message;
      setError(`Erreur lors de l'enregistrement: ${errorMessage}`);
      // Log additional error details for debugging
      if (error.response) {
        console.log('Error response:', {
          data: error.response.data,
          status: error.response.status,
          headers: error.response.headers
        });
      }
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
    
    // Récupérer les observations existantes ou initialiser avec des chaînes vides
    const observations = {
      aptitudeGenerale: employe.observations?.aptitudeGenerale || '',
      aptitudeHC: employe.observations?.aptitudeHC || '',
      aptitudeTH: employe.observations?.aptitudeTH || '',
      aptitudeEC: employe.observations?.aptitudeEC || ''
    };
    
    setFormData({
      matricule: employe.matricule,
      nom: employe.nom,
      prenom: employe.prenom,
      entite: employe.entite,
      service: employe.service || '',
      dateVisite2024: employe.dateVisite2024 || '',
      dateVisite2025: employe.dateVisite2025 || '',
      eligibilite: employe.eligibilite || '1',
      aptitude: employe.aptitude || 'APTE',
      dateHC: employe.dateHC || '',
      aptitudeHC: employe.aptitudeHC || 'APTE',
      dateTH: employe.dateTH || '',
      aptitudeTH: employe.aptitudeTH || 'APTE',
      dateEC: employe.dateEC || '',
      aptitudeEC: employe.aptitudeEC || 'APTE',
      statut: employe.statut || 'Non faite',
      observations
    });
    setShowModal(true);
  };
  const resetForm = () => {
    setSelectedEmploye(null);
    setFormData({
      matricule: '',
      nom: '',
      prenom: '',
      entite: '',
      service: '',
      dateVisite2024: '',
      dateVisite2025: '',
      eligibilite: '1',
      aptitude: 'APTE',
      dateHC: '',
      aptitudeHC: 'APTE',
      dateTH: '',
      aptitudeTH: 'APTE',
      dateEC: '',
      aptitudeEC: 'APTE',
      statut: 'Non faite',
      observations: {
        aptitudeGenerale: '',
        aptitudeHC: '',
        aptitudeTH: '',
        aptitudeEC: ''
      }
    });
  };

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
              className="me-2"
              value={serviceFiltre}
              onChange={(e) => setServiceFiltre(e.target.value)}
              style={{ width: 'auto' }}
            >
              <option value="">Tous les services</option>
              <option value="OIG/B">OIG/B</option>
              <option value="OIG/B/E">OIG/B/E</option>
              <option value="OIG/B/L">OIG/B/L</option>
              <option value="OIG/B/M">OIG/B/M</option>
              <option value="OIG/B/P">OIG/B/P</option>
              <option value="OIG/B/M/C">OIG/B/M/C</option>
            </Form.Select>
            <Form.Select 
              value={anneeFiltre}
              onChange={(e) => setAnneeFiltre(e.target.value)}
              style={{ width: 'auto' }}
            >
              <option value="2024">2024</option>
              <option value="2025">2025</option>
            </Form.Select>
            <Button variant="primary" onClick={() => {
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
                  <th>DATE DE VMS 2024</th>
                  <th>DATE DE VMS 2025</th>
                  <th>ELIGIBILITE</th>
                  <th>APTITUDE</th>
                  <th>HC</th>
                  <th>APTITUDE</th>
                  <th>TH</th>
                  <th>APTITUDE</th>
                  <th>EC</th>
                  <th>APTITUDE</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(employes) && employes.length > 0 ? (
                  employes
                    .filter(employe => !serviceFiltre || employe.service === serviceFiltre)
                    .map((employe) => (
                    <tr key={employe._id || employe.matricule}>
                      <td>{employe.matricule}</td>
                      <td>{employe.nom}</td>
                      <td>{employe.prenom}</td>
                      <td>{employe.entite}</td>
                      <td>{employe.dateVisite2024}</td>
                      <td>{employe.dateVisite2025}</td>
                      <td>{employe.eligibilite === '1' ? 'Éligible' : 'Non éligible'}</td>
                      <td>{employe.aptitude}</td>
                      <td>{employe.dateHC}</td>
                      <td>{employe.aptitudeHC}</td>
                      <td>{employe.dateTH}</td>
                      <td>{employe.aptitudeTH}</td>
                      <td>{employe.dateEC}</td>
                      <td>{employe.aptitudeEC}</td>
                      <td>{employe.statut}</td>
                      <td>
                        <Button
                          variant="warning"
                          size="sm"
                          className="me-2"
                          onClick={() => handleEdit(employe)}
                        >
                          Modifier
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(employe._id)}
                        >
                          Supprimer
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="16" className="text-center">
                      Aucun employé trouvé
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedEmploye ? 'Modifier un employé' : 'Ajouter un employé'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Matricule</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.matricule}
                    onChange={(e) => setFormData({...formData, matricule: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Nom</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.nom}
                    onChange={(e) => setFormData({...formData, nom: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Prénom</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.prenom}
                    onChange={(e) => setFormData({...formData, prenom: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Service</Form.Label>
                  <Form.Select
                    value={formData.service}
                    onChange={(e) => setFormData({...formData, service: e.target.value})}
                    required
                  >
                    <option value="">Sélectionner un service</option>
                    <option value="OIG/B">OIG/B</option>
                    <option value="OIG/B/E">OIG/B/E</option>
                    <option value="OIG/B/L">OIG/B/L</option>
                    <option value="OIG/B/M">OIG/B/M</option>
                    <option value="OIG/B/P">OIG/B/P</option>
                    <option value="OIG/B/M/C">OIG/B/M/C</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Entité</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.entite}
                    onChange={(e) => setFormData({...formData, entite: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Date VMS 2024</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.dateVisite2024}
                    onChange={(e) => setFormData({...formData, dateVisite2024: e.target.value})}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Date VMS 2025</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.dateVisite2025}
                    onChange={(e) => setFormData({...formData, dateVisite2025: e.target.value})}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>HC</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.dateHC}
                    onChange={(e) => setFormData({...formData, dateHC: e.target.value})}
                  />
                  <Form.Select
                    value={formData.aptitudeHC}
                    onChange={(e) => setFormData({...formData, aptitudeHC: e.target.value})}
                    className="mb-2"
                  >
                    <option value="APTE">APTE</option>
                    <option value="INAPTE">INAPTE</option>
                  </Form.Select>
                  <Form.Control
                    as="textarea"
                    placeholder="Diagnostic / Observations pour HC"
                    value={formData.observations.aptitudeHC}
                    onChange={(e) => setFormData({
                      ...formData,
                      observations: {
                        ...formData.observations,
                        aptitudeHC: e.target.value
                      }
                    })}
                    rows={2}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>TH</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.dateTH}
                    onChange={(e) => setFormData({...formData, dateTH: e.target.value})}
                  />
                  <Form.Select
                    value={formData.aptitudeTH}
                    onChange={(e) => setFormData({...formData, aptitudeTH: e.target.value})}
                    className="mb-2"
                  >
                    <option value="APTE">APTE</option>
                    <option value="INAPTE">INAPTE</option>
                  </Form.Select>
                  <Form.Control
                    as="textarea"
                    placeholder="Diagnostic / Observations pour TH"
                    value={formData.observations.aptitudeTH}
                    onChange={(e) => setFormData({
                      ...formData,
                      observations: {
                        ...formData.observations,
                        aptitudeTH: e.target.value
                      }
                    })}
                    rows={2}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>EC</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.dateEC}
                    onChange={(e) => setFormData({...formData, dateEC: e.target.value})}
                  />
                  <Form.Select
                    value={formData.aptitudeEC}
                    onChange={(e) => setFormData({...formData, aptitudeEC: e.target.value})}
                    className="mb-2"
                  >
                    <option value="APTE">APTE</option>
                    <option value="INAPTE">INAPTE</option>
                  </Form.Select>
                  <Form.Control
                    as="textarea"
                    placeholder="Diagnostic / Observations pour EC"
                    value={formData.observations.aptitudeEC}
                    onChange={(e) => setFormData({
                      ...formData,
                      observations: {
                        ...formData.observations,
                        aptitudeEC: e.target.value
                      }
                    })}
                    rows={2}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Aptitude Générale</Form.Label>
                  <Form.Select
                    value={formData.aptitude}
                    onChange={(e) => setFormData({...formData, aptitude: e.target.value})}
                    className="mb-2"
                  >
                    <option value="APTE">APTE</option>
                    <option value="INAPTE">INAPTE</option>
                  </Form.Select>
                  <Form.Control
                    as="textarea"
                    placeholder="Diagnostic / Observations générales"
                    value={formData.observations.aptitudeGenerale}
                    onChange={(e) => setFormData({
                      ...formData,
                      observations: {
                        ...formData.observations,
                        aptitudeGenerale: e.target.value
                      }
                    })}
                    rows={2}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Éligibilité</Form.Label>
                  <Form.Select
                    value={formData.eligibilite}
                    onChange={(e) => setFormData({...formData, eligibilite: e.target.value})}
                  >
                    <option value="1">1</option>
                    <option value="0">0</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Statut</Form.Label>
                  <Form.Select
                    value={formData.statut}
                    onChange={(e) => setFormData({...formData, statut: e.target.value})}
                  >
                    <option value="Non faite">Non faite</option>
                    <option value="Faite">Faite</option>
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
    </Container>
  );
};

export default GestionEmployes;
