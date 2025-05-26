import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Form } from 'react-bootstrap';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/axiosConfig';
import './TableauDeBordAdmin.css';

const TableauDeBordAdmin = () => {
  const navigate = useNavigate();
  const [medecinConnexions, setMedecinConnexions] = useState([]);
  const [rendezVousStats, setRendezVousStats] = useState({ aVenir: 0, termines: 0 });
  const [employesParEntite, setEmployesParEntite] = useState([]);
  const [loading, setLoading] = useState(true);
  const [anneeSelectionnee, setAnneeSelectionnee] = useState(new Date().getFullYear());
  const [anneesDisponibles, setAnneesDisponibles] = useState([]);
  const [nouvellesNotifications, setNouvellesNotifications] = useState(0);

  const [consultationsParEntite, setConsultationsParEntite] = useState([]);
  const [derniereConsultationDuJour, setDerniereConsultationDuJour] = useState(null);

  // Définir les fonctions avec useCallback d'abord
  const chargerNotifications = useCallback(async (anneeFiltre = null) => {
    try {
      const response = await api.get('/notifications', {
        params: { destinataire: 'admin' }
      });

      // Compter les notifications non lues (lu: false) - toujours toutes les notifications
      const notificationsNonLues = response.data.filter(notif => !notif.lu).length;
      setNouvellesNotifications(notificationsNonLues);

      // Calculer les statistiques des consultations depuis les notifications
      let derniereMiseAJour = null;
      let derniereConsultationAujourdhui = null;

      // Structure pour les consultations par entité
      const consultationsParEntiteMap = new Map();

      const aujourdhui = new Date();
      aujourdhui.setHours(0, 0, 0, 0);

      response.data.forEach(notification => {
        if (notification.type === 'CONSULTATION' && notification.details && notification.details.consultations) {
          notification.details.consultations.forEach(consultation => {
            // Filtrer par année si spécifiée
            if (anneeFiltre) {
              const anneeConsultation = new Date(consultation.dateConsultation).getFullYear();
              if (anneeConsultation !== anneeFiltre) {
                return; // Ignorer cette consultation si elle n'est pas de l'année filtrée
              }
            }

            const entite = consultation.employe.entite || 'Non spécifiée';

            if (consultation.statut === 'FAITE') {
              // Statistiques par entité pour consultations
              if (!consultationsParEntiteMap.has(entite)) {
                consultationsParEntiteMap.set(entite, { faites: 0, nonFaites: 0 });
              }
              consultationsParEntiteMap.get(entite).faites++;

              // Vérifier si c'est une consultation d'aujourd'hui (seulement si pas de filtre d'année ou année actuelle)
              if (!anneeFiltre || anneeFiltre === new Date().getFullYear()) {
                const dateConsultation = new Date(consultation.dateConsultation);
                dateConsultation.setHours(0, 0, 0, 0);
                if (dateConsultation.getTime() === aujourdhui.getTime()) {
                  if (!derniereConsultationAujourdhui || new Date(consultation.dateConsultation) > new Date(derniereConsultationAujourdhui)) {
                    derniereConsultationAujourdhui = consultation.dateConsultation;
                  }
                }
              }

            } else if (consultation.statut === 'NON_FAITE') {
              // Statistiques par entité pour consultations
              if (!consultationsParEntiteMap.has(entite)) {
                consultationsParEntiteMap.set(entite, { faites: 0, nonFaites: 0 });
              }
              consultationsParEntiteMap.get(entite).nonFaites++;
            }
          });

          // Garder la date de la notification la plus récente (toujours toutes les notifications)
          if (!anneeFiltre) {
            const dateNotification = new Date(notification.dateCreation);
            if (!derniereMiseAJour || dateNotification > derniereMiseAJour) {
              derniereMiseAJour = dateNotification;
            }
          }
        }
      });

      // Convertir la Map en array pour le graphique
      const consultationsArray = Array.from(consultationsParEntiteMap.entries()).map(([entite, stats]) => ({
        entite,
        faites: stats.faites,
        nonFaites: stats.nonFaites,
        total: stats.faites + stats.nonFaites
      }));



      setConsultationsParEntite(consultationsArray);

      // Mettre à jour la dernière consultation du jour seulement si pas de filtre ou année actuelle
      if (!anneeFiltre || anneeFiltre === new Date().getFullYear()) {
        setDerniereConsultationDuJour(derniereConsultationAujourdhui);
      }

    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
      setNouvellesNotifications(0);
      setConsultationsParEntite([]);
      setDerniereConsultationDuJour(null);
    }
  }, []);

  const chargerAnneesDisponibles = useCallback(async () => {
    try {
      // Récupérer tous les rendez-vous pour extraire les années
      const rdvResponse = await api.get('/rendez-vous');
      const rendezVous = rdvResponse.data;

      // Extraire les années uniques des dates de rendez-vous
      const anneesSet = new Set();
      rendezVous.forEach(rdv => {
        const annee = new Date(rdv.date).getFullYear();
        anneesSet.add(annee);
      });

      // Convertir en array et trier par ordre décroissant
      const anneesArray = Array.from(anneesSet).sort((a, b) => b - a);
      setAnneesDisponibles(anneesArray);

      // Si aucune année disponible, utiliser l'année actuelle
      if (anneesArray.length === 0) {
        const anneeActuelle = new Date().getFullYear();
        setAnneesDisponibles([anneeActuelle]);
        return anneeActuelle;
      }

      return anneesArray[0]; // Retourner l'année la plus récente
    } catch (error) {
      console.error('Erreur lors du chargement des années:', error);
      const anneeActuelle = new Date().getFullYear();
      setAnneesDisponibles([anneeActuelle]);
      return anneeActuelle;
    }
  }, []);

  const chargerDonnees = useCallback(async (annee) => {
    try {
      setLoading(true);

      // Récupérer les dernières connexions des médecins
      const medecinsResponse = await api.get('/auth/medecins/connexions');
      setMedecinConnexions(medecinsResponse.data);

      // Récupérer les statistiques des rendez-vous pour l'année sélectionnée
      const rdvResponse = await api.get(`/rendez-vous/statistiques?annee=${annee}`);
      setRendezVousStats(rdvResponse.data);

      // Récupérer les statistiques des employés par entité
      const employesResponse = await api.get('/employes/par-entite');
      setEmployesParEntite(employesResponse.data);

      // Récupérer le nombre de nouvelles notifications et filtrer par année
      await chargerNotifications(annee);

      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      setLoading(false);
    }
  }, [chargerNotifications]);

  // Ensuite les useEffect qui utilisent ces fonctions
  useEffect(() => {
    const initialiserDashboard = async () => {
      // Charger les années disponibles basées sur les rendez-vous réels
      const anneeLaPlusRecente = await chargerAnneesDisponibles();

      // Définir l'année sélectionnée (la plus récente ou l'année actuelle)
      const anneeAUtiliser = anneeLaPlusRecente || new Date().getFullYear();
      setAnneeSelectionnee(anneeAUtiliser);

      // Charger les données pour cette année
      chargerDonnees(anneeAUtiliser);
    };

    initialiserDashboard();
  }, [chargerAnneesDisponibles, chargerDonnees]);

  // Actualiser les notifications toutes les 30 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      chargerNotifications();
    }, 30000); // 30 secondes

    return () => clearInterval(interval);
  }, [chargerNotifications]);



  const naviguerVersNotifications = () => {
    navigate('/admin/notifications');
  };

  // Gérer le changement d'année
  const handleChangeAnnee = (e) => {
    const nouvelleAnnee = parseInt(e.target.value);
    setAnneeSelectionnee(nouvelleAnnee);
    chargerDonnees(nouvelleAnnee);
  };

  // Formatage de la date pour l'affichage
  const formatDate = (dateString) => {
    if (!dateString) return 'Jamais connecté';

    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Déterminer si la connexion est récente (moins de 24h)
  const isRecentConnection = (dateString) => {
    if (!dateString) return false;

    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffHours = diffTime / (1000 * 60 * 60);

    return diffHours < 24;
  };





  // Formatage de la dernière consultation du jour
  const formatDerniereConsultationDuJour = () => {
    if (!derniereConsultationDuJour) {
      return 'Aucune consultation aujourd\'hui';
    }
    const date = new Date(derniereConsultationDuJour);
    const aujourdhui = new Date();

    // Vérifier si c'est vraiment aujourd'hui
    if (date.toDateString() === aujourdhui.toDateString()) {
      return `Dernière consultation: ${date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      })}`;
    } else {
      return `Dernière consultation: ${date.toLocaleDateString('fr-FR')} à ${date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      })}`;
    }
  };



  return (
    <Container fluid className="tableau-bord-container">
      {/* Top Navigation Bar */}
      <div className="top-nav-bar">
        <div className="nav-left">
          <h3>tableau de bord administratif</h3>
          <span className="nav-subtitle">Welcome back, here's what's happening this year</span>
        </div>
        <div className="nav-right">
        <Form.Group>
          <Form.Label className="year-selector-label">Filtrer par année :</Form.Label>
          <Form.Select
            value={anneeSelectionnee}
            onChange={handleChangeAnnee}
            className="year-selector"
          >
            {anneesDisponibles.map(annee => (
              <option key={annee} value={annee}>{annee}</option>
            ))}
          </Form.Select>
        </Form.Group>
      </div>
        <div className="nav-right">
          <div className="last-consultation-indicator">
            <i className="fas fa-clock me-2"></i>
            <span className="consultation-time">{formatDerniereConsultationDuJour()}</span>
          </div>
          <div className="notification-bell-simple" onClick={naviguerVersNotifications}>
            <i className="fas fa-bell"></i>
            {nouvellesNotifications > 0 && (
              <span className="notification-number">
                {nouvellesNotifications}
              </span>
            )}
          </div>
        </div>
      </div>



      {/* Sélecteur d'année */}


      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Chargement des données...</p>
        </div>
      ) : (
        <>
          <Row className="dashboard-stats">
            <Col md={4}>
              <Card className="stat-card">
                <Card.Body>
                  <div className="stat-icon">
                    <i className="fas fa-calendar-check"></i>
                  </div>
                  <h3>{rendezVousStats.aVenir + rendezVousStats.termines}</h3>
                  <p>Total des rendez-vous {anneeSelectionnee}</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="stat-card">
                <Card.Body>
                  <div className="stat-icon">
                    <i className="fas fa-calendar-alt"></i>
                  </div>
                  <h3>{rendezVousStats.aVenir}</h3>
                  <p>Rendez-vous à venir {anneeSelectionnee}</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="stat-card">
                <Card.Body>
                  <div className="stat-icon">
                    <i className="fas fa-check-circle"></i>
                  </div>
                  <h3>{rendezVousStats.termines}</h3>
                  <p>Rendez-vous terminés {anneeSelectionnee}</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>



          {/* Section consultations par entité */}
          <Row className="mt-4">
            <Col md={6}>
              <Card className="dashboard-card">
                <Card.Header className="dashboard-card-header">
                  <i className="fas fa-building me-2"></i>
                  Consultations par Entité {anneeSelectionnee}
                </Card.Header>
                <Card.Body>
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={consultationsParEntite}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis
                          dataKey="entite"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: '#6b7280' }}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: '#6b7280' }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                          }}
                        />
                        <Bar
                          dataKey="faites"
                          name="Faites"
                          radius={[4, 4, 0, 0]}
                        >
                          {consultationsParEntite.map((entry, index) => (
                            <Cell
                              key={`cell-faites-${index}`}
                              fill={entry.faites > entry.nonFaites ? '#4ba262' : '#e2e8f0'}
                            />
                          ))}
                        </Bar>
                        <Bar
                          dataKey="nonFaites"
                          name="Non faites"
                          radius={[4, 4, 0, 0]}
                        >
                          {consultationsParEntite.map((entry, index) => (
                            <Cell
                              key={`cell-non-faites-${index}`}
                              fill={entry.nonFaites > entry.faites ? '#6b7280' : '#f1f5f9'}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6}>
              <Card className="dashboard-card">
                <Card.Header className="dashboard-card-header">
                  <i className="fas fa-users me-2"></i>
                  Répartition des Employés par Entité
                </Card.Header>
                <Card.Body>
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart
                        data={employesParEntite}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <defs>
                          <linearGradient id="colorEmployes" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#9ca3af" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#9ca3af" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis
                          dataKey="entite"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: '#6b7280' }}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: '#6b7280' }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="nombre"
                          stroke="#6b7280"
                          strokeWidth={3}
                          fillOpacity={1}
                          fill="url(#colorEmployes)"
                          name="Nombre d'employés"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row className="mt-4">
            <Col>
              <Card className="dashboard-card">
                <Card.Header className="dashboard-card-header">
                  <i className="fas fa-user-md me-2"></i>
                  Dernières Connexions des Médecins
                </Card.Header>
                <Card.Body>
                  <div className="medecins-container">
                    {medecinConnexions.map((medecin, index) => (
                      <div
                        key={index}
                        className={`medecin-card ${isRecentConnection(medecin.dernierConnexion) ? 'recent-connection' : ''}`}
                      >
                        <div className="medecin-avatar">
                          <i className="fas fa-user-md"></i>
                        </div>
                        <div className="medecin-info">
                          <h4>{medecin.nom} {medecin.prenom}</h4>
                          <p className="medecin-specialite">{medecin.specialite}</p>
                          <p className="medecin-connexion">
                            <i className="fas fa-clock me-2"></i>
                            {formatDate(medecin.dernierConnexion)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
};

export default TableauDeBordAdmin;
