import React, { useState, useEffect } from 'react';
import { Button, Row, Col, Alert, Badge } from 'react-bootstrap';
import { FaEnvelope, FaEnvelopeOpen, FaTrash } from 'react-icons/fa';
import api from '../../utils/axiosConfig';
import './AdminNotifications.css';

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [alertInfo, setAlertInfo] = useState({ show: false, message: '', variant: 'info' });


  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      console.log('Chargement des notifications...');

      const response = await api.get('/notifications', {
        params: { destinataire: 'admin' }
      });

      console.log('Notifications reçues:', response.data);
      setNotifications(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Erreur lors du chargement des notifications:', err);
      setError('Impossible de charger les notifications. Veuillez réessayer plus tard.');
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });
  };

  const handleSelectNotification = (notification) => {
    setSelectedNotification(notification);

    // Réorganiser la liste : notification sélectionnée en haut, puis les autres
    const otherNotifications = notifications.filter(n => n._id !== notification._id);
    const reorderedNotifications = [notification, ...otherNotifications];
    setNotifications(reorderedNotifications);
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(notifications.filter((notif) => notif._id !== id));
      if (selectedNotification && selectedNotification._id === id) {
        setSelectedNotification(null);
      }
      showAlert('Notification supprimée avec succès.', 'success');
    } catch (err) {
      console.error('Erreur lors de la suppression de la notification:', err);
      showAlert('Impossible de supprimer la notification.', 'danger');
    }
  };

  const showAlert = (message, variant = 'info') => {
    setAlertInfo({ show: true, message, variant });
    setTimeout(() => setAlertInfo({ show: false, message: '', variant: 'info' }), 5000);
  };



  return (
    <div className="notifications-container">
      <div className="page-header">
        <h1 className="page-title">Notifications</h1>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {alertInfo.show && (
        <Alert variant={alertInfo.variant} dismissible onClose={() => setAlertInfo({ ...alertInfo, show: false })}>
          {alertInfo.message}
        </Alert>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <span>Chargement des notifications...</span>
        </div>
      ) : (
        <Row className="notification-row">
          <Col md={6}>
            <div className="notifications-list-card">
              <div className="card-header">
                <h4>Liste des notifications</h4>
              </div>
              <div className="card-body">
                {notifications.length === 0 ? (
                  <div className="empty-state">
                    <FaEnvelope size={50} />
                    <p>Aucune notification disponible</p>
                  </div>
                ) : (
                  <div className="notification-items">
                    {notifications.map((notification, index) => (
                      <div
                        key={notification._id}
                        onClick={() => handleSelectNotification(notification)}
                        className={`notification-item ${
                          selectedNotification && selectedNotification._id === notification._id ? 'selected' : ''
                        } ${index === 0 && selectedNotification && selectedNotification._id === notification._id ? 'highlighted' : ''}`}
                      >
                        <div className="notification-icon">
                          {notification.lu ? <FaEnvelopeOpen /> : <FaEnvelope />}
                        </div>
                        <div className="notification-content">
                          <div className="notification-title">
                            Consultation médicale
                          </div>
                          <div className="notification-date">{formatDate(notification.dateCreation)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Col>

          <Col md={6}>
            {selectedNotification ? (
              <div className="notification-detail-card">
                <div className="card-header">
                  <h4>Consultation médicale</h4>
                  <Button
                    variant="outline-danger"
                    onClick={() => deleteNotification(selectedNotification._id)}
                    className="delete-btn"
                  >
                    <FaTrash /> Supprimer
                  </Button>
                </div>
                <div className="card-body">


                  <div className="notification-message mt-2">
                    <h5>Message:</h5>
                    <p>{selectedNotification.message}</p>
                  </div>



                  {selectedNotification.details && (
                    <div className="notification-details mt-2">
                      <h5>Détails des consultations:</h5>

                      {/* Informations du médecin */}
                      {selectedNotification.details.medecin && (
                        <div className="details-card mb-3">
                          <div className="card-body">
                            <h6>Médecin responsable:</h6>
                            <div className="details-grid">
                              <div><strong>Nom:</strong> {selectedNotification.details.medecin.nom}</div>
                              <div><strong>Prénom:</strong> {selectedNotification.details.medecin.prenom}</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Statistiques générales */}
                      {selectedNotification.details.statistiques && (
                        <div className="details-card mb-3">
                          <div className="card-body">
                            <h6>Résumé des consultations:</h6>
                            <div className="stats-grid">
                              <div className="stat-item">
                                <Badge bg="primary" className="stat-badge">{selectedNotification.details.statistiques.total}</Badge>
                                <span>Total</span>
                              </div>
                              <div className="stat-item">
                                <Badge bg="success" className="stat-badge">{selectedNotification.details.statistiques.faites}</Badge>
                                <span>Faites</span>
                              </div>
                              <div className="stat-item">
                                <Badge bg="danger" className="stat-badge">{selectedNotification.details.statistiques.nonFaites}</Badge>
                                <span>Non faites</span>
                              </div>

                            </div>
                          </div>
                        </div>
                      )}

                      {/* Liste détaillée des consultations */}
                      {selectedNotification.details.consultations && selectedNotification.details.consultations.length > 0 && (
                        <div className="consultations-list">
                          <h6>Détails par employé:</h6>
                          {selectedNotification.details.consultations.map((consultation, index) => (
                            <div key={consultation.id || index} className="consultation-card mb-3">
                              <div className="card-body">
                                {/* Informations de l'employé */}
                                <div className="employee-header">
                                  <h6 className="employee-name">
                                    {consultation.employe.prenom} {consultation.employe.nom}
                                  </h6>
                                  <Badge
                                    bg={consultation.statut === 'FAITE' ? 'success' : 'danger'}
                                    className="status-badge"
                                  >
                                    {consultation.statut === 'FAITE' ? 'Faite' : 'Non faite'}
                                  </Badge>
                                </div>

                                {/* Informations complètes de l'employé - TOUJOURS AFFICHÉES */}
                                <div className="employee-info-section mb-3">
                                  <h6>Informations de l'employé:</h6>
                                  <div className="details-grid mb-2">
                                    <div><strong>Nom complet:</strong> {consultation.employe.prenom} {consultation.employe.nom}</div>
                                    <div><strong>Matricule:</strong> {consultation.employe.matricule}</div>
                                    <div><strong>Entité:</strong> {consultation.employe.entite || 'Non spécifiée'}</div>
                                    <div><strong>Date consultation:</strong> {formatDate(consultation.dateConsultation)}</div>
                                  </div>
                                </div>

                                {/* Résultats médicaux - SEULEMENT si FAITE */}
                                {consultation.statut === 'FAITE' && (
                                  <div className="medical-results">
                                    <h6>Résultats médicaux:</h6>
                                    <div className="details-grid mb-2">
                                      <div>
                                        <strong>Aptitude générale:</strong>{' '}
                                        <Badge bg={consultation.aptitudeGenerale === 'APTE' ? 'success' : 'danger'}>
                                          {consultation.aptitudeGenerale}
                                        </Badge>
                                      </div>
                                      <div><strong>Classe:</strong> {consultation.classe}/10</div>
                                    </div>

                                    <div className="aptitude-details">
                                      <strong>Aptitudes détaillées:</strong>
                                      <div className="aptitude-grid">
                                        <div>
                                          <span>HC:</span>
                                          <Badge bg={consultation.aptitudeDetails.hc === 'APTE' ? 'success' : 'danger'} size="sm">
                                            {consultation.aptitudeDetails.hc}
                                          </Badge>
                                        </div>
                                        <div>
                                          <span>TH:</span>
                                          <Badge bg={consultation.aptitudeDetails.th === 'APTE' ? 'success' : 'danger'} size="sm">
                                            {consultation.aptitudeDetails.th}
                                          </Badge>
                                        </div>
                                        <div>
                                          <span>CIR:</span>
                                          <Badge bg={consultation.aptitudeDetails.cir === 'APTE' ? 'success' : 'danger'} size="sm">
                                            {consultation.aptitudeDetails.cir}
                                          </Badge>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Observations - TOUJOURS AFFICHÉES */}
                                <div className="mt-3">
                                  <h6>Observations du médecin:</h6>
                                  <p className="observation-text">
                                    {consultation.observationMedecin || 'Aucune observation'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="notification-detail-card empty-detail">
                <div className="card-body">
                  <div className="empty-state">
                    <FaEnvelope size={50} />
                    <h4>Sélectionnez une notification pour voir les détails</h4>
                  </div>
                </div>
              </div>
            )}
          </Col>
        </Row>
      )}
    </div>
  );
};

export default AdminNotifications;