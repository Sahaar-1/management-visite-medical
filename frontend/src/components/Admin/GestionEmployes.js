import React, { useState, useEffect, useCallback } from 'react';
import { Container, Form, Button as BootstrapButton, Table, Alert, Modal, Spinner, Row, Col, Pagination, InputGroup, Badge } from 'react-bootstrap';
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
  const [message, setMessage] = useState({ type: '', text: '' }); // État pour les messages
  const [entiteFiltre, setEntiteFiltre] = useState('');
  const [statusFiltre, setStatusFiltre] = useState(''); // Nouveau filtre par statut
  const [searchTerm, setSearchTerm] = useState('');
  const [availableEntities, setAvailableEntities] = useState([]);
  const [consultations, setConsultations] = useState([]); // État pour les consultations
  const [formData, setFormData] = useState({
    matricule: '',
    nom: '',
    prenom: '',
    entite: '',
    telephone: '', // Ajout du champ téléphone
    dateDerniereVisiteMedicale: '', // Ajout du champ date dernière visite médicale
  });

  // Ajout des états pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [employesPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);



  // Fonction pour calculer le statut de visite d'un employé
  const getVisitStatus = useCallback((employe) => {
    // Priorité 1: Utiliser dateDerniereVisiteMedicale si elle existe
    let dateDerniereVisite = null;

    if (employe.dateDerniereVisiteMedicale) {
      dateDerniereVisite = new Date(employe.dateDerniereVisiteMedicale);
    } else {
      // Priorité 2: Chercher dans les consultations
      const consultationsEmploye = consultations.filter(consultation =>
        consultation.employe &&
        consultation.employe._id === employe._id &&
        consultation.statut === 'FAITE'
      );

      if (consultationsEmploye.length > 0) {
        // Trier par date de consultation décroissante pour avoir la plus récente
        const derniereConsultation = consultationsEmploye.sort((a, b) =>
          new Date(b.dateConsultation) - new Date(a.dateConsultation)
        )[0];
        dateDerniereVisite = new Date(derniereConsultation.dateConsultation);
      }
    }

    // Si aucune date de visite trouvée
    if (!dateDerniereVisite) {
      return {
        status: 'required',
        badge: 'Visite Requise',
        variant: 'danger'
      };
    }

    // Calculer les dates importantes
    const dateAujourdhui = new Date();
    const dateProchaineVisite = new Date(dateDerniereVisite);
    dateProchaineVisite.setFullYear(dateProchaineVisite.getFullYear() + 1); // Ajouter 1 an

    // Calculer la date d'alerte (1 mois avant la prochaine visite)
    const dateAlerte = new Date(dateProchaineVisite);
    dateAlerte.setMonth(dateAlerte.getMonth() - 1);

    if (dateAujourdhui > dateProchaineVisite) {
      // Date anniversaire dépassée
      return {
        status: 'required',
        badge: 'Visite Requise',
        variant: 'danger',
        derniereVisite: dateDerniereVisite,
        prochaineVisite: dateProchaineVisite
      };
    } else if (dateAujourdhui >= dateAlerte) {
      // Dans le mois précédant la date anniversaire
      return {
        status: 'upcoming',
        badge: 'Visite Proche',
        variant: 'warning',
        derniereVisite: dateDerniereVisite,
        prochaineVisite: dateProchaineVisite
      };
    } else {
      // À jour
      return {
        status: 'uptodate',
        badge: 'À jour',
        variant: 'success',
        derniereVisite: dateDerniereVisite,
        prochaineVisite: dateProchaineVisite
      };
    }
  }, [consultations]);


  const loadEmployes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Charger les employés et les consultations en parallèle
      const [employesResponse, consultationsResponse] = await Promise.all([
        api.get('/employes'),
        api.get('/historique?limit=1000')
      ]);

      const employeesData = Array.isArray(employesResponse.data) ? employesResponse.data : [];
      setEmployes(employeesData);

      const consultationsData = consultationsResponse.data.historique || [];
      setConsultations(consultationsData);

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
    const filteredEmployees = employes.filter((employe) => {
      // Filtre par terme de recherche
      const matchesSearch = searchTerm === '' ||
        employe.matricule.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employe.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employe.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employe.entite.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtre par entité
      const matchesEntite = !entiteFiltre || employe.entite === entiteFiltre;

      // Filtre par statut de visite
      let matchesStatus = true;
      if (statusFiltre !== '') {
        const visitStatus = getVisitStatus(employe);
        matchesStatus = visitStatus.status === statusFiltre;
      }

      return matchesSearch && matchesEntite && matchesStatus;
    });
    setTotalPages(Math.ceil(filteredEmployees.length / employesPerPage));
    setCurrentPage(1); // Réinitialiser à la première page lors du changement de filtre
  }, [entiteFiltre, statusFiltre, employes, employesPerPage, searchTerm, getVisitStatus]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      setMessage({ type: '', text: '' }); // Effacer les messages précédents
      if (selectedEmploye) {
        await api.put(`/employes/${selectedEmploye._id}`, formData);
        setMessage({ type: 'success', text: 'Employé modifié avec succès!' });
      } else {
        await api.post('/employes', formData);
        setMessage({ type: 'success', text: 'Employé ajouté avec succès!' });
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
        setMessage({ type: 'success', text: 'Employé supprimé avec succès!' });
        loadEmployes();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        setError(`Erreur lors de la suppression: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  const handleEdit = (employe) => {
    setSelectedEmploye(employe);

    // Déterminer la date de dernière visite médicale
    let dateDerniereVisite = '';

    if (employe.dateDerniereVisiteMedicale) {
      // Utiliser la date manuelle si elle existe
      dateDerniereVisite = new Date(employe.dateDerniereVisiteMedicale).toISOString().split('T')[0];
    } else {
      // Sinon, chercher la dernière consultation FAITE
      const consultationsEmploye = consultations.filter(consultation =>
        consultation.employe &&
        consultation.employe._id === employe._id &&
        consultation.statut === 'FAITE'
      );

      if (consultationsEmploye.length > 0) {
        // Trier par date de consultation décroissante pour avoir la plus récente
        const derniereConsultation = consultationsEmploye.sort((a, b) =>
          new Date(b.dateConsultation) - new Date(a.dateConsultation)
        )[0];
        dateDerniereVisite = new Date(derniereConsultation.dateConsultation).toISOString().split('T')[0];
      }
    }

    setFormData({
      matricule: employe.matricule,
      nom: employe.nom,
      prenom: employe.prenom,
      entite: employe.entite,
      telephone: employe.telephone || '',
      dateDerniereVisiteMedicale: dateDerniereVisite
    });
    setShowModal(true);
  };

  const handleView = (employe) => {
    setSelectedEmploye(employe);
    setShowViewModal(true);
  };

  const resetForm = () => {
    setSelectedEmploye(null);
    setMessage({ type: '', text: '' }); // Effacer les messages
    setFormData({
      matricule: '',
      nom: '',
      prenom: '',
      entite: '',
      telephone: '',
      dateDerniereVisiteMedicale: ''
    });
  };

  // Filtrer les employés par statut, entité et terme de recherche
  const employesFiltres = employes.filter((employe) => {
    // Filtre par terme de recherche
    const matchesSearch = searchTerm === '' ||
      employe.matricule.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employe.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employe.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employe.entite.toLowerCase().includes(searchTerm.toLowerCase());

    // Filtre par entité
    const matchesEntite = !entiteFiltre || employe.entite === entiteFiltre;

    // Filtre par statut de visite
    let matchesStatus = true;
    if (statusFiltre !== '') {
      const visitStatus = getVisitStatus(employe);
      matchesStatus = visitStatus.status === statusFiltre;
    }

    return matchesSearch && matchesEntite && matchesStatus;
  });

  // Obtenir les employés pour la page actuelle
  const indexOfLastEmploye = currentPage * employesPerPage;
  const indexOfFirstEmploye = indexOfLastEmploye - employesPerPage;
  const currentEmployes = employesFiltres.slice(indexOfFirstEmploye, indexOfLastEmploye);

  // Changer de page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);





  return (
    <Container fluid className="gestion-employes-container">
      <h2 className="gestion-employes-title">Gestion des Employés</h2>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {message.text && (
        <Alert variant={message.type} dismissible onClose={() => setMessage({ type: '', text: '' })}>
          {message.text}
        </Alert>
      )}

      {/* Ligne de contrôles horizontale */}
      <div className="controls-row mb-4">
          {/* Barre de recherche */}
          <InputGroup className="search-input">
            <InputGroup.Text>
              <FaSearch />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Rechercher par nom, prénom, matricule..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>

          {/* Filtre par statut de visite */}
          <Form.Select
            value={statusFiltre}
            onChange={(e) => setStatusFiltre(e.target.value)}
            className="filter-select"
          >
            <option value="">Tous les statuts</option>
            <option value="required">🔴 Visite Requise</option>
            <option value="upcoming">🟡 Visite Proche</option>
            <option value="uptodate">🟢 À jour</option>
          </Form.Select>

          {/* Filtre par entité */}
          <Form.Select
            value={entiteFiltre}
            onChange={(e) => setEntiteFiltre(e.target.value)}
            className="filter-select"
          >
            <option value="">Toutes les entités</option>
            {availableEntities.map((entite) => (
              <option key={entite} value={entite}>{entite}</option>
            ))}
          </Form.Select>

          {/* Bouton d'ajout */}
          <BootstrapButton className="btn-add-medecin" onClick={() => {
            resetForm();
            setShowModal(true);
          }}>
            <FaPlus />  Ajouter 
          </BootstrapButton>
        </div>

          {loading ? (
            <div className="text-center">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Chargement...</span>
              </Spinner>
            </div>
          ) : (
            <>
              <Table striped bordered hover responsive className="employes-table">
                <thead>
                  <tr>
                    <th>MAT</th>
                    <th>NOM</th>
                    <th>PRENOM</th>
                    <th>ENTITE</th>
                    <th>TELEPHONE</th>
                    <th>STATUS VISITE</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(currentEmployes) && currentEmployes.length > 0 ? (
                    currentEmployes.map((employe) => {
                      const visitStatus = getVisitStatus(employe);
                      return (
                        <tr key={employe._id || employe.matricule}>
                          <td>{employe.matricule}</td>
                          <td>
                            <i className="fas fa-user-circle text-secondary me-2"></i>
                            {employe.nom}
                          </td>
                          <td>{employe.prenom}</td>
                          <td>{employe.entite}</td>
                          <td>{employe.telephone || '-'}</td>
                          <td className="status-visite-cell">
                            <Badge bg={visitStatus.variant} className="me-2">
                              {visitStatus.badge}
                            </Badge>
                            {visitStatus.derniereVisite && (
                              <div className="text-muted small">
                                Dernière: {visitStatus.derniereVisite.toLocaleDateString('fr-FR')}
                                <br />
                                Prochaine: {visitStatus.prochaineVisite.toLocaleDateString('fr-FR')}
                              </div>
                            )}
                          </td>
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
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center">
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
                    <Form.Select
                      value={formData.entite}
                      onChange={(e) => setFormData({ ...formData, entite: e.target.value })}
                      required
                    >
                      <option value="">Sélectionnez une entité</option>
                      {availableEntities.map((entite, index) => (
                        <option key={index} value={entite}>
                          {entite}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Téléphone</Form.Label>
                    <Form.Control
                      type="tel"
                      value={formData.telephone}
                      onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                      placeholder="Ex: 0600000000"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Date Dernière Visite Médicale (optionnel)</Form.Label>
                    <Form.Control
                      type="date"
                      value={formData.dateDerniereVisiteMedicale}
                      max={new Date().toISOString().split('T')[0]} // Empêcher les dates futures
                      onChange={(e) => {
                        const selectedDate = new Date(e.target.value);
                        const today = new Date();
                        today.setHours(23, 59, 59, 999); // Fin de la journée d'aujourd'hui

                        if (selectedDate > today) {
                          setMessage({
                            type: 'warning',
                            text: 'La date de la dernière visite médicale ne peut pas être dans le futur.'
                          });
                          return;
                        }

                        setFormData({ ...formData, dateDerniereVisiteMedicale: e.target.value });
                      }}
                      placeholder="Sélectionner une date"
                    />
                    <Form.Text className="text-muted">
                      Si vous connaissez la date de la dernière visite médicale (ne peut pas être dans le futur)
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
                <p><strong>Téléphone:</strong> {selectedEmploye.telephone || 'Non renseigné'}</p>

                {/* Informations sur la visite médicale */}
                <hr />
                <h6>Statut Visite Médicale</h6>
                {(() => {
                  const visitStatus = getVisitStatus(selectedEmploye);
                  return (
                    <div>
                      <p>
                        <strong>Statut:</strong>{' '}
                        <Badge bg={visitStatus.variant} className="ms-2">
                          {visitStatus.badge}
                        </Badge>
                      </p>
                      {visitStatus.derniereVisite ? (
                        <>
                          <p><strong>Dernière visite:</strong> {visitStatus.derniereVisite.toLocaleDateString('fr-FR')}</p>
                          <p><strong>Prochaine visite:</strong> {visitStatus.prochaineVisite.toLocaleDateString('fr-FR')}</p>
                        </>
                      ) : (
                        <p><strong>Dernière visite:</strong> Aucune consultation effectuée</p>
                      )}
                    </div>
                  );
                })()}
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
