import React, { useState, useEffect } from 'react';
import { Container, Table, Card, Form, Button, Modal } from 'react-bootstrap';
import api from '../../utils/axiosConfig';

const ListeEmployes = () => {
  const [employes, setEmployes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedEmploye, setSelectedEmploye] = useState(null);
  const [formData, setFormData] = useState({
    aptitude: '',
    aptitudeHC: '',
    aptitudeTH: '',
    aptitudeEC: '',
    statut: '',
    dateVisite: ''
  });

  const recupererEmployes = async () => {
    try {
      const response = await api.get('/visite/employes');
      setEmployes(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des employés:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setShowModal(false);
    setSelectedEmploye(null);
    setFormData({
      aptitude: '',
      aptitudeHC: '',
      aptitudeTH: '',
      aptitudeEC: '',
      statut: '',
      dateVisite: ''
    });
  };

  const handleShow = (employe) => {
    setSelectedEmploye(employe);
    const currentYear = new Date().getFullYear();
    const dateVisite = employe[`dateVisite${currentYear}`] || '';
    
    setFormData({
      aptitude: employe.aptitude || 'APTE',
      aptitudeHC: employe.aptitudeHC || 'APTE',
      aptitudeTH: employe.aptitudeTH || 'APTE',
      aptitudeEC: employe.aptitudeEC || 'APTE',
      statut: employe.statut || 'EN_ATTENTE',
      dateVisite
    });
    setShowModal(true);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const currentYear = new Date().getFullYear();
      const updateData = {
        ...formData,
        [`dateVisite${currentYear}`]: formData.dateVisite
      };
      
      await api.put(`/visite/employes/${selectedEmploye._id}`, updateData);
      await recupererEmployes();
      handleClose();
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
  };

  useEffect(() => {
    recupererEmployes();
  }, []);
  const [serviceFiltre, setServiceFiltre] = useState('');

  const employesFiltres = employes.filter(employe => {
    const matchesSearch = `${employe.matricule} ${employe.nom} ${employe.prenom} ${employe.entite}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesService = !serviceFiltre || employe.service === serviceFiltre;
    return matchesSearch && matchesService;
  }
  );

  if (loading) {
    return (
      <Container className="mt-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="mt-4">
      <Card>        <Card.Header>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h3>Liste des Employés</h3>
            <div className="d-flex gap-2">
              <Form.Select
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
            </div>
          </div>
          <div className="d-flex justify-content-end">
            <Form.Group style={{ width: '300px' }}>
              <Form.Control
                type="text"
                placeholder="Rechercher un employé..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Form.Group>
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
                </tr>
              </thead>
              <tbody>
                {employesFiltres.map((employe) => (                  <tr key={employe.matricule}>
                    <td>{employe.matricule}</td>
                    <td>{employe.nom}</td>
                    <td>{employe.prenom}</td>
                    <td>{employe.entite}</td>
                    <td>{employe.dateVisite2024}</td>
                    <td>{employe.dateVisite2025}</td>
                    <td>{employe.eligibilite === '1' ? 'Éligible' : 'Non éligible'}</td>
                    <td className={employe.aptitude === 'APTE' ? 'text-success' : 'text-danger'}>
                      {employe.aptitude}
                    </td>
                    <td>{employe.dateHC}</td>
                    <td className={employe.aptitudeHC === 'APTE' ? 'text-success' : 'text-danger'}>
                      {employe.aptitudeHC}
                    </td>
                    <td>{employe.dateTH}</td>
                    <td className={employe.aptitudeTH === 'APTE' ? 'text-success' : 'text-danger'}>
                      {employe.aptitudeTH}
                    </td>
                    <td>{employe.dateEC}</td>
                    <td className={employe.aptitudeEC === 'APTE' ? 'text-success' : 'text-danger'}>
                      {employe.aptitudeEC}
                    </td>
                    <td>
                      <Button
                        variant={employe.statut === 'FAITE' ? 'success' : 'warning'}
                        size="sm"
                        onClick={() => handleShow(employe)}
                      >
                        {employe.statut || 'EN_ATTENTE'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
          {employesFiltres.length === 0 && (
            <div className="text-center mt-3">
              <p>Aucun employé trouvé</p>
            </div>
          )}
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Mettre à jour le statut médical</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {selectedEmploye && (
              <>
                <h5 className="mb-3">
                  {selectedEmploye.nom} {selectedEmploye.prenom} - {selectedEmploye.matricule}
                </h5>
                
                <Form.Group className="mb-3">
                  <Form.Label>Date de visite</Form.Label>
                  <Form.Control
                    type="date"
                    name="dateVisite"
                    value={formData.dateVisite}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Aptitude Générale</Form.Label>
                  <Form.Select
                    name="aptitude"
                    value={formData.aptitude}
                    onChange={handleChange}
                    required
                  >
                    <option value="APTE">APTE</option>
                    <option value="INAPTE">INAPTE</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Aptitude HC</Form.Label>
                  <Form.Select
                    name="aptitudeHC"
                    value={formData.aptitudeHC}
                    onChange={handleChange}
                  >
                    <option value="APTE">APTE</option>
                    <option value="INAPTE">INAPTE</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Aptitude TH</Form.Label>
                  <Form.Select
                    name="aptitudeTH"
                    value={formData.aptitudeTH}
                    onChange={handleChange}
                  >
                    <option value="APTE">APTE</option>
                    <option value="INAPTE">INAPTE</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Aptitude EC</Form.Label>
                  <Form.Select
                    name="aptitudeEC"
                    value={formData.aptitudeEC}
                    onChange={handleChange}
                  >
                    <option value="APTE">APTE</option>
                    <option value="INAPTE">INAPTE</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Statut de la visite</Form.Label>
                  <Form.Select
                    name="statut"
                    value={formData.statut}
                    onChange={handleChange}
                    required
                  >
                    <option value="EN_ATTENTE">En attente</option>
                    <option value="FAITE">Faite</option>
                  </Form.Select>
                </Form.Group>
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Annuler
            </Button>
            <Button variant="primary" type="submit">
              Enregistrer
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default ListeEmployes;
