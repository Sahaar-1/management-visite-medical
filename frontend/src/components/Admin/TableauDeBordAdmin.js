import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { PieChart, Pie, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import api from '../../utils/axiosConfig';

const TableauDeBordAdmin = () => {
  const [statistiques, setStatistiques] = useState([]);
  const [medecinConnexions, setMedecinConnexions] = useState([]);
  const [anneeSelectionnee] = useState(new Date().getFullYear());

  const [statsVisites, setStatsVisites] = useState({
    totalEmployes: 0,
    statsVisites: [],
    statsAptitudes: [],
    statsAptitudesHC: [],
    statsAptitudesTH: [],
    statsAptitudesEC: []
  });

  useEffect(() => {
    const chargerDonnees = async () => {
      try {
        const [statsResponse, medecinsResponse, statsVisitesResponse] = await Promise.all([
          api.get(`/services/statistiques/${anneeSelectionnee}`),
          api.get('/auth/medecins/connexions'),
          api.get('/visite/statistiques')
        ]);
        
        setStatistiques(statsResponse.data);
        setMedecinConnexions(medecinsResponse.data);
        setStatsVisites(statsVisitesResponse.data);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      }
    };

    chargerDonnees();
  }, [anneeSelectionnee]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

  const donneesPie = [
    { name: 'Aptes', value: statistiques.reduce((acc, s) => acc + (s.aptes || 0), 0) },
    { name: 'Inaptes', value: statistiques.reduce((acc, s) => acc + (s.inaptes || 0), 0) },
    { name: 'En attente', value: statistiques.reduce((acc, s) => acc + ((s.totalEmployes || 0) - (s.visitesFaites || 0)), 0) }
  ];

  return (
    <Container fluid className="mt-4">
      <h2>Tableau de Bord Administrateur</h2>
      
      <Row className="mt-4">
        <Col md={6}>
          <Card>
            <Card.Header>Statistiques des Visites Médicales</Card.Header>
            <Card.Body>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={donneesPie}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {donneesPie.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6}>
          <Card>
            <Card.Header>Services et Effectifs</Card.Header>
            <Card.Body>
              <table className="table">
                <thead>
                  <tr>
                    <th>Service</th>
                    <th>Total Employés</th>
                    <th>Visites Effectuées</th>
                    <th>En Attente</th>
                  </tr>
                </thead>
                <tbody>
                  {statistiques.map(service => (
                    <tr key={service._id}>
                      <td>{service.nom}</td>
                      <td>{service.totalEmployes || 0}</td>
                      <td>{service.visitesFaites || 0}</td>
                      <td>{(service.totalEmployes || 0) - (service.visitesFaites || 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col md={6}>
          <Card>
            <Card.Header>Statistiques des Aptitudes</Card.Header>
            <Card.Body>
              <h5>Aptitudes Générales</h5>
              <table className="table">
                <thead>
                  <tr>
                    <th>Statut</th>
                    <th>Nombre</th>
                  </tr>
                </thead>
                <tbody>
                  {statsVisites.statsAptitudes?.map((stat, index) => (
                    <tr key={index}>
                      <td>{stat._id}</td>
                      <td>{stat.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              <h5 className="mt-4">Aptitudes HC</h5>
              <table className="table">
                <thead>
                  <tr>
                    <th>Statut</th>
                    <th>Nombre</th>
                  </tr>
                </thead>
                <tbody>
                  {statsVisites.statsAptitudesHC?.map((stat, index) => (
                    <tr key={index}>
                      <td>{stat._id}</td>
                      <td>{stat.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              <h5 className="mt-4">Aptitudes TH</h5>
              <table className="table">
                <thead>
                  <tr>
                    <th>Statut</th>
                    <th>Nombre</th>
                  </tr>
                </thead>
                <tbody>
                  {statsVisites.statsAptitudesTH?.map((stat, index) => (
                    <tr key={index}>
                      <td>{stat._id}</td>
                      <td>{stat.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              <h5 className="mt-4">Aptitudes EC</h5>
              <table className="table">
                <thead>
                  <tr>
                    <th>Statut</th>
                    <th>Nombre</th>
                  </tr>
                </thead>
                <tbody>
                  {statsVisites.statsAptitudesEC?.map((stat, index) => (
                    <tr key={index}>
                      <td>{stat._id}</td>
                      <td>{stat.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6}>
          <Card>
            <Card.Header>Dernières Connexions des Médecins</Card.Header>
            <Card.Body>
              <table className="table">
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Prénom</th>
                    <th>Dernière Connexion</th>
                  </tr>
                </thead>
                <tbody>
                  {medecinConnexions.map(medecin => (
                    <tr key={medecin._id}>
                      <td>{medecin.nom}</td>
                      <td>{medecin.prenom}</td>
                      <td>{medecin.dernierConnexion ? new Date(medecin.dernierConnexion).toLocaleString() : 'Jamais connecté'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default TableauDeBordAdmin;
