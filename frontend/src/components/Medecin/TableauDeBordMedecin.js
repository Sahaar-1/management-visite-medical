import { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/axiosConfig';
import './TableauDeBordMedecin.css';

const TableauDeBordMedecin = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [statsConsultations, setStatsConsultations] = useState({
    total: 0,
    faites: 0,
    nonFaites: 0,
    derniereMiseAJour: null
  });
  // Suppression de l'état employesDuJour
  const [statsAptitudes, setStatsAptitudes] = useState({
    aptes: 0,
    inaptes: 0
  });
  const [consultationsParEntite, setConsultationsParEntite] = useState([]);
  const [derniereActivite, setDerniereActivite] = useState(null);

  // Charger les données du médecin
  const chargerDonneesMedecin = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Objet user complet:', user);
      console.log('Chargement des données pour le médecin:', user.id);
      console.log('User._id:', user._id);

      // Utiliser user._id si user.id n'existe pas
      const medecinId = user.id || user._id;
      console.log('ID médecin utilisé:', medecinId);

      if (!medecinId) {
        console.error('Aucun ID médecin trouvé dans l\'objet user');
        setLoading(false);
        return;
      }

      // Suppression de la récupération des employés du jour

      // Récupérer l'historique des consultations du médecin
      try {
        // Essayer d'abord l'API spécifique au médecin
        let consultations = [];
        let historiqueResponse;

        try {
          // Essayer l'API spécifique au médecin d'abord
          historiqueResponse = await api.get(`/consultations/medecin/${medecinId}/historique`);
          consultations = historiqueResponse.data || [];
          console.log('Consultations récupérées via API spécifique:', consultations.length);

          // Si l'API spécifique retourne 0, essayer le fallback aussi pour comparaison
          if (consultations.length === 0) {
            console.log('API spécifique retourne 0, essai du fallback pour comparaison...');
            throw new Error('Forcer le fallback pour debug');
          }
        } catch (specificError) {
          console.log('API spécifique non disponible ou vide, utilisation de l\'historique général');

          // Fallback vers l'API d'historique générale
          historiqueResponse = await api.get('/historique?limit=1000');
          const responseData = historiqueResponse.data;
          console.log('Réponse API historique:', responseData);

          // L'API retourne un objet avec la propriété 'historique'
          const toutesConsultations = responseData.historique || [];
          console.log('Toutes consultations récupérées:', toutesConsultations.length);

          // Debug: Afficher l'ID du médecin connecté et les IDs des consultations
          console.log('ID du médecin connecté:', medecinId);
          console.log('Première consultation pour debug:', toutesConsultations[0]);

          // Afficher tous les IDs de médecins dans les consultations
          toutesConsultations.forEach((consultation, index) => {
            console.log(`Consultation ${index}:`, {
              medecinId: consultation.medecin?._id || consultation.medecin,
              medecinObjet: consultation.medecin,
              statut: consultation.statut
            });
          });

          // Filtrer seulement les consultations du médecin connecté
          consultations = toutesConsultations.filter(consultation => {
            const consultationMedecinId = consultation.medecin?._id || consultation.medecin;
            const match = consultationMedecinId === medecinId;
            if (!match) {
              console.log('Pas de correspondance:', {
                consultationMedecinId,
                medecinId,
                type: typeof consultationMedecinId,
                medecinType: typeof medecinId
              });
            }
            return match;
          });
          console.log('Consultations du médecin filtrées:', consultations.length);
        }

        // Calculer les statistiques
        let totalConsultations = 0;
        let consultationsFaites = 0;
        let consultationsNonFaites = 0;
        let aptesCount = 0;
        let inaptesCount = 0;
        let derniereMiseAJour = null;
        let derniereActiviteDate = null;

        // Structure pour consultations par entité
        const consultationsParEntiteMap = new Map();

        consultations.forEach(consultation => {
          totalConsultations++;

          if (consultation.statut === 'FAITE') {
            consultationsFaites++;

            // Compter les aptitudes - utiliser aptitudeDetails du modèle Historique
            // Considérer comme APTE si toutes les aptitudes (hc, th, cir) sont APTE
            const aptitudeDetails = consultation.aptitudeDetails || {};
            const isApte = aptitudeDetails.hc === 'APTE' &&
                          aptitudeDetails.th === 'APTE' &&
                          aptitudeDetails.cir === 'APTE';

            if (isApte) {
              aptesCount++;
            } else {
              inaptesCount++;
            }
          } else if (consultation.statut === 'NON_FAITE') {
            consultationsNonFaites++;
          }

          // Statistiques par entité
          const entite = consultation.employe?.entite || consultation.employe?.service || 'Non spécifiée';
          if (!consultationsParEntiteMap.has(entite)) {
            consultationsParEntiteMap.set(entite, { faites: 0, nonFaites: 0 });
          }

          if (consultation.statut === 'FAITE') {
            consultationsParEntiteMap.get(entite).faites++;
          } else if (consultation.statut === 'NON_FAITE') {
            consultationsParEntiteMap.get(entite).nonFaites++;
          }

          // Dernière mise à jour
          const dateConsultation = new Date(consultation.dateConsultation);
          if (!derniereMiseAJour || dateConsultation > derniereMiseAJour) {
            derniereMiseAJour = dateConsultation;
          }

          // Dernière activité (consultation faite)
          if (consultation.statut === 'FAITE') {
            if (!derniereActiviteDate || dateConsultation > derniereActiviteDate) {
              derniereActiviteDate = dateConsultation;
            }
          }
        });

        // Convertir la Map en array
        const consultationsArray = Array.from(consultationsParEntiteMap.entries()).map(([entite, stats]) => ({
          entite,
          faites: stats.faites,
          nonFaites: stats.nonFaites,
          total: stats.faites + stats.nonFaites
        }));

        setStatsConsultations({
          total: totalConsultations,
          faites: consultationsFaites,
          nonFaites: consultationsNonFaites,
          derniereMiseAJour: derniereMiseAJour
        });

        setStatsAptitudes({
          aptes: aptesCount,
          inaptes: inaptesCount
        });

        setConsultationsParEntite(consultationsArray);
        setDerniereActivite(derniereActiviteDate);

        console.log('Statistiques calculées:', {
          total: totalConsultations,
          faites: consultationsFaites,
          nonFaites: consultationsNonFaites,
          aptes: aptesCount,
          inaptes: inaptesCount
        });

      } catch (consultationError) {
        console.error('Erreur lors de la récupération des consultations:', consultationError);
        // Initialiser avec des valeurs par défaut
        setStatsConsultations({
          total: 0,
          faites: 0,
          nonFaites: 0,
          derniereMiseAJour: null
        });
        setStatsAptitudes({
          aptes: 0,
          inaptes: 0
        });
        setConsultationsParEntite([]);
        setDerniereActivite(null);
      }

      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    chargerDonneesMedecin();
  }, [chargerDonneesMedecin]);

  // Actualiser les données toutes les 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      chargerDonneesMedecin();
    }, 300000); // 5 minutes

    return () => clearInterval(interval);
  }, [chargerDonneesMedecin]);

  // Formatage des dates
  const formatDateCourte = (dateString) => {
    if (!dateString) return 'Aucune activité';
    const date = new Date(dateString);
    const aujourdhui = new Date();

    if (date.toDateString() === aujourdhui.toDateString()) {
      return `Aujourd'hui à ${date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      })}`;
    } else {
      return date.toLocaleDateString('fr-FR');
    }
  };

  // Données pour les graphiques
  const consultationsData = [
    { name: 'Faites', value: statsConsultations.faites, color: '#4ba262' },
    { name: 'Non faites', value: statsConsultations.nonFaites, color: '#6b7280' }
  ];

  const aptitudesData = [
    { name: 'APTE', value: statsAptitudes.aptes, color: '#7eae94' },
    { name: 'INAPTE', value: statsAptitudes.inaptes, color: '#9ca3af' }
  ];

  return (
    <Container fluid className="tableau-bord-medecin-container">
      <div className="dashboard-header">
        <div className="header-left">
          <h2>Tableau de Bord Médecin</h2>
          <div className="dashboard-date">
            {new Date().toLocaleDateString('fr-FR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </div>
        <div className="header-right">
          <div className="last-activity-indicator">
            <i className="fas fa-user-md me-2"></i>
            <span className="activity-time">Dernière activité: {formatDateCourte(derniereActivite)}</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Chargement des données...</p>
        </div>
      ) : (
        <>
          {/* Cartes de statistiques */}
          <Row className="dashboard-stats">
            <Col md={4}>
              <Card className="stat-card">
                <Card.Body>
                  <div className="stat-icon">
                    <i className="fas fa-stethoscope"></i>
                  </div>
                  <h3>{statsConsultations.total}</h3>
                  <p>Total consultations</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="stat-card">
                <Card.Body>
                  <div className="stat-icon">
                    <i className="fas fa-check-circle"></i>
                  </div>
                  <h3>{statsConsultations.faites}</h3>
                  <p>Consultations faites</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="stat-card">
                <Card.Body>
                  <div className="stat-icon">
                    <i className="fas fa-times-circle"></i>
                  </div>
                  <h3>{statsConsultations.nonFaites}</h3>
                  <p>Consultations non faites</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Graphiques */}
          <Row className="mt-4">
            <Col md={4}>
              <Card className="dashboard-card">
                <Card.Header className="dashboard-card-header">
                  <i className="fas fa-chart-pie me-2"></i>
                  Statut des Consultations
                </Card.Header>
                <Card.Body>
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={consultationsData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {consultationsData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} consultations`, '']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4}>
              <Card className="dashboard-card">
                <Card.Header className="dashboard-card-header">
                  <i className="fas fa-heartbeat me-2"></i>
                  Aptitudes Générales
                </Card.Header>
                <Card.Body>
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={aptitudesData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {aptitudesData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} employés`, '']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4}>
              <Card className="dashboard-card">
                <Card.Header className="dashboard-card-header">
                  <i className="fas fa-building me-2"></i>
                  Consultations par Entité
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
          </Row>

          {/* Suppression complète de la section employés du jour */}
        </>
      )}
    </Container>
  );
};

export default TableauDeBordMedecin;




