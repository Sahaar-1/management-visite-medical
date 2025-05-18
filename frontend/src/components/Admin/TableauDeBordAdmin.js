import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge } from 'react-bootstrap';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import api from '../../utils/axiosConfig';
import './TableauDeBordAdmin.css';

const TableauDeBordAdmin = () => {
  const [medecinConnexions, setMedecinConnexions] = useState([]);
  const [rendezVousStats, setRendezVousStats] = useState({ aVenir: 0, termines: 0 });
  const [employesParEntite, setEmployesParEntite] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const chargerDonnees = async () => {
      try {
        setLoading(true);
        
        // Récupérer les dernières connexions des médecins
        const medecinsResponse = await api.get('/auth/medecins/connexions');
        setMedecinConnexions(medecinsResponse.data);
        
        // Récupérer les statistiques des rendez-vous
        const rdvResponse = await api.get('/rendez-vous/statistiques');
        setRendezVousStats(rdvResponse.data);
        
        // Récupérer les statistiques des employés par entité
        const employesResponse = await api.get('/employes/par-entite');
        setEmployesParEntite(employesResponse.data);
        
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        setLoading(false);
      }
    };

    chargerDonnees();
  }, []);

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

  // Données pour le graphique des rendez-vous
  const rdvData = [
    { name: 'À venir', value: rendezVousStats.aVenir, color: '#2ecc71' },
    { name: 'Terminés', value: rendezVousStats.termines, color: '#3498db' }
  ];

  // Couleurs pour les graphiques
  const COLORS = ['#2ecc71', '#3498db', '#f39c12', '#e74c3c', '#9b59b6', '#1abc9c', '#34495e', '#d35400'];

  return (
    <Container fluid className="tableau-bord-container">
      <div className="dashboard-header">
        <h2>Tableau de Bord Administratif</h2>
        <div className="dashboard-date">
          {new Date().toLocaleDateString('fr-FR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>
      
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
                  <p>Total des rendez-vous</p>
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
                  <p>Rendez-vous à venir</p>
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
                  <p>Rendez-vous terminés</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          <Row className="mt-4">
            <Col md={6}>
              <Card className="dashboard-card">
                <Card.Header className="dashboard-card-header">
                  <i className="fas fa-calendar-day me-2"></i>
                  Statut des Rendez-vous
                </Card.Header>
                <Card.Body>
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={rdvData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {rdvData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} rendez-vous`, '']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="chart-legend">
                    {rdvData.map((entry, index) => (
                      <div key={index} className="legend-item">
                        <div className="legend-color" style={{ backgroundColor: entry.color }}></div>
                        <div className="legend-text">{entry.name}: {entry.value} rendez-vous</div>
                      </div>
                    ))}
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
                      <BarChart
                        data={employesParEntite}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="entite" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="nombre" fill="#2ecc71" name="Nombre d'employés">
                          {employesParEntite.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
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
                          <div className="medecin-status">
                            {medecin.dernierConnexion ? (
                              isRecentConnection(medecin.dernierConnexion) ? (
                                <Badge bg="success">Connecté récemment</Badge>
                              ) : (
                                <Badge bg="warning">Inactif</Badge>
                              )
                            ) : (
                              <Badge bg="danger">Jamais connecté</Badge>
                            )}
                          </div>
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