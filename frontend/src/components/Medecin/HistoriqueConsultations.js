import React, { useState, useEffect } from 'react';
import { Row, Col, Button, Modal, Badge } from 'react-bootstrap';
import api from '../../utils/axiosConfig';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import './HistoriqueConsultations.css';
import { FaFilter, FaCalendarAlt, FaUserMd, FaIdCard, FaClipboardCheck } from 'react-icons/fa';

const HistoriqueConsultations = () => {
  const [historique, setHistorique] = useState([]);
  const [filtreNom, setFiltreNom] = useState('');
  const [filtreDate, setFiltreDate] = useState('');
  const [filtreStatut, setFiltreStatut] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    // Charger l'historique complet au démarrage
    fetchHistoriqueComplet();
  }, []);

  // Effet pour la filtration automatique
  useEffect(() => {
    // Si tous les filtres sont vides, charger l'historique complet
    if (!filtreNom && !filtreDate && !filtreStatut) {
      fetchHistoriqueComplet();
      return;
    }

    const timeoutId = setTimeout(() => {
      appliquerFiltres();
    }, 300); // Délai de 300ms pour éviter trop d'appels API

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtreNom, filtreDate, filtreStatut]);

  // Nouvelle fonction pour récupérer explicitement l'historique complet
  const fetchHistoriqueComplet = async () => {
    try {
      setLoading(true);
      console.log('Récupération de l\'historique complet de toutes les consultations...');

      const response = await api.get('/historique', {
        params: {
          limit: 1000 // Augmenter la limite pour récupérer plus de résultats
        }
      });

      console.log('Historique complet reçu:', response.data);

      if (response.data.historique) {
        setHistorique(response.data.historique);
      } else if (Array.isArray(response.data)) {
        setHistorique(response.data);
      } else {
        console.error('Structure de données inattendue:', response.data);
        setHistorique([]);
      }

      setError(null);
    } catch (err) {
      console.error('Erreur lors de la récupération de l\'historique complet:', err);
      setError('Erreur lors de la récupération de l\'historique complet des consultations');
    } finally {
      setLoading(false);
    }
  };

  const appliquerFiltres = async () => {
    try {
      setLoading(true);

      let params = {};

      if (filtreNom) {
        params.employe = filtreNom;
      }

      if (filtreDate) {
        // Convertir la date en format ISO pour la recherche
        const dateObj = new Date(filtreDate);
        const startOfDay = new Date(dateObj.setHours(0, 0, 0, 0));
        const endOfDay = new Date(dateObj.setHours(23, 59, 59, 999));

        params.dateDebut = startOfDay.toISOString();
        params.dateFin = endOfDay.toISOString();

        console.log('Filtrage par date:', {
          filtreDate,
          dateDebut: params.dateDebut,
          dateFin: params.dateFin
        });
      }

      if (filtreStatut) {
        params.statut = filtreStatut;
      }

      console.log('Paramètres de filtrage:', params);
      const response = await api.get('/historique', { params });

      if (response.data.historique) {
        setHistorique(response.data.historique);
      } else if (Array.isArray(response.data)) {
        setHistorique(response.data);
      } else {
        console.error('Structure de données inattendue:', response.data);
        setHistorique([]);
      }

      setError(null);
    } catch (err) {
      console.error('Erreur lors de la récupération de l\'historique:', err);
      setError('Erreur lors de la récupération de l\'historique des consultations');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date non spécifiée';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy à HH:mm', { locale: fr });
    } catch (error) {
      console.error('Erreur de formatage de date:', error);
      return 'Date invalide';
    }
  };

  const handleViewDetails = (item) => {
    console.log('Affichage des détails pour:', item);
    setSelectedItem(item);
    setShowDetailsModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailsModal(false);
    setSelectedItem(null);
  };

  // Fonction pour afficher les détails d'aptitude
  const renderAptitudeDetails = (aptitudeDetails) => {
    if (!aptitudeDetails) return <Badge bg="secondary">Non spécifié</Badge>;

    return (
      <div className="aptitude-details">
        {aptitudeDetails.hc && (
          <Badge bg={aptitudeDetails.hc === 'APTE' ? 'success' : 'danger'} className="me-2">
            HC: {aptitudeDetails.hc}
          </Badge>
        )}
        {aptitudeDetails.th && (
          <Badge bg={aptitudeDetails.th === 'APTE' ? 'success' : 'danger'} className="me-2">
            TH: {aptitudeDetails.th}
          </Badge>
        )}
        {aptitudeDetails.cir && (
          <Badge bg={aptitudeDetails.cir === 'APTE' ? 'success' : 'danger'} className="me-2">
            CIR: {aptitudeDetails.cir}
          </Badge>
        )}
      </div>
    );
  };

  return (
    <div className="historique-container">
      <h2 className="historique-title">
        <FaClipboardCheck className="me-2" /> Historique des Consultations
      </h2>

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {/* Section des filtres - Design plat */}
      <div className="filters-section">
        <h5 className="filters-title">
          <FaFilter className="me-2" /> Filtres de recherche
        </h5>
        <div className="filters-row">
          <div className="filter-group">
            <label className="filter-label">Nom d'employé</label>
            <div className="input-group">
              <span className="input-group-text">
                <FaUserMd />
              </span>
              <input
                className="filter-input form-control"
                type="text"
                placeholder="Entrez un nom..."
                value={filtreNom}
                onChange={(e) => setFiltreNom(e.target.value)}
              />
            </div>
          </div>
          <div className="filter-group">
            <label className="filter-label">Date de consultation</label>
            <div className="input-group">
              <span className="input-group-text">
                <FaCalendarAlt />
              </span>
              <input
                className="filter-input form-control"
                type="date"
                placeholder="jj/mm/aaaa"
                value={filtreDate}
                onChange={(e) => setFiltreDate(e.target.value)}
              />
            </div>
          </div>
          <div className="filter-group">
            <label className="filter-label">Statut</label>
            <select
              className="filter-input form-select"
              value={filtreStatut}
              onChange={(e) => setFiltreStatut(e.target.value)}
            >
              <option value="">Tous les statuts</option>
              <option value="FAITE">Faite</option>
              <option value="NON_FAITE">Non faite</option>
            </select>
          </div>
        </div>
      </div>

      {/* Section des résultats - Design plat */}
      <div className="results-section">
        <div className="results-header">
          <div className="d-flex justify-content-between align-items-center">
            <span><FaClipboardCheck className="me-2" /> Résultats</span>
            <span className="badge bg-primary rounded-pill">
              {historique.length} consultation(s)
            </span>
          </div>
        </div>
        <div className="results-body">
          {loading ? (
            <div className="loading-container">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Chargement...</span>
              </div>
            </div>
          ) : historique.length === 0 ? (
            <div className="no-results">
              <p className="mb-0">Aucune consultation trouvée</p>
            </div>
          ) : (
            <table className="results-table">
              <thead>
                <tr>
                  <th><FaCalendarAlt className="me-2" /> Date</th>
                  <th><FaUserMd className="me-2" /> Employé</th>
                  <th><FaIdCard className="me-2" /> Matricule</th>
                  <th><FaClipboardCheck className="me-2" /> Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {historique.map((item) => (
                  <tr key={item._id}>
                    <td>{formatDate(item.dateConsultation)}</td>
                    <td>
                      {item.employe ? `${item.employe.prenom} ${item.employe.nom}` : 'N/A'}
                    </td>
                    <td>{item.employe ? item.employe.matricule : 'N/A'}</td>
                    <td>
                      <span
                        className={`status-badge ${
                          item.statut === 'FAITE' ? 'status-fait' :
                          item.statut === 'NON_FAITE' ? 'status-non-fait' : 'status-warning'
                        }`}
                      >
                        {item.statut === 'FAITE' ? 'Fait' :
                         item.statut === 'NON_FAITE' ? 'Non Fait' : 'Non présenté'}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <button
                        className="btn-action"
                        onClick={() => handleViewDetails(item)}
                        title="Voir les détails"
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal pour afficher les détails */}
      <Modal
        show={showDetailsModal}
        onHide={handleCloseModal}
        size="lg"
        className="details-modal"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <FaClipboardCheck className="me-2" /> Détails de la consultation
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedItem && (
            <div>
              <Row>
                <Col md={6}>
                  <div className="details-section">
                    <h5><FaCalendarAlt className="me-2" /> Informations générales</h5>
                    <div className="details-item">
                      <span className="details-label">Date de consultation:</span>
                      <div className="details-value">{formatDate(selectedItem.dateConsultation)}</div>
                    </div>
                    <div className="details-item">
                      <span className="details-label">Statut:</span>
                      <div className="details-value">
                        <Badge
                          bg={selectedItem.statut === 'FAITE' ? 'success' : 'danger'}
                          className="statut-badge"
                        >
                          {selectedItem.statut === 'FAITE' ? 'Faite' : 'Non faite'}
                        </Badge>
                      </div>
                    </div>

                    {/* Afficher les détails d'aptitude et classe UNIQUEMENT si le statut est FAITE */}
                    {selectedItem.statut === 'FAITE' && (
                      <>
                        {selectedItem.aptitudeDetails && (
                          <div className="details-item">
                            <span className="details-label">Détails d'aptitude:</span>
                            <div className="details-value mt-2">
                              {renderAptitudeDetails(selectedItem.aptitudeDetails)}
                            </div>
                          </div>
                        )}
                        {selectedItem.classe && (
                          <div className="details-item">
                            <span className="details-label">Classe:</span>
                            <div className="details-value">{selectedItem.classe}</div>
                          </div>
                        )}
                      </>
                    )}

                    {selectedItem.observations && (
                      <div className="details-item">
                        <span className="details-label">Observations:</span>
                        <div className="observation-box">
                          {selectedItem.observations}
                        </div>
                      </div>
                    )}
                  </div>
                </Col>
                <Col md={6}>
                  <div className="details-section">
                    <h5><FaUserMd className="me-2" /> Informations de l'employé</h5>
                    {selectedItem.employe ? (
                      <>
                        <div className="details-item">
                          <span className="details-label">Nom:</span>
                          <div className="details-value">{selectedItem.employe.nom}</div>
                        </div>
                        <div className="details-item">
                          <span className="details-label">Prénom:</span>
                          <div className="details-value">{selectedItem.employe.prenom}</div>
                        </div>
                        <div className="details-item">
                          <span className="details-label">Matricule:</span>
                          <div className="details-value">{selectedItem.employe.matricule}</div>
                        </div>
                        <div className="details-item">
                          <span className="details-label">Entité:</span>
                          <div className="details-value">{selectedItem.employe.entite || 'Non spécifiée'}</div>
                        </div>
                      </>
                    ) : (
                      <p>Informations de l'employé non disponibles</p>
                    )}
                  </div>
                </Col>
              </Row>

              {/* Affichage des métadonnées */}
              {selectedItem.metadonnees && Object.keys(selectedItem.metadonnees).length > 0 && (
                <div className="details-section">
                  <h5>Métadonnées médicales</h5>
                  <Row>
                    {Object.entries(selectedItem.metadonnees).map(([key, value]) => (
                      <Col md={4} key={key} className="mb-2">
                        <div className="details-item">
                          <span className="details-label">{key}:</span>
                          <div className="details-value">{value}</div>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </div>
              )}

              {/* Bouton pour imprimer le rapport */}
              <div className="text-center mt-4">
                <Button
                  variant="primary"
                  onClick={() => window.print()}
                >
                  <FaClipboardCheck className="me-2" /> Imprimer le rapport
                </Button>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Fermer
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default HistoriqueConsultations;
