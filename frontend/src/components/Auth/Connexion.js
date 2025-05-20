import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Connexion.css';

const Connexion = () => {
  const navigate = useNavigate();
  const { login, error, user } = useAuth();

  useEffect(() => {
    // Rediriger si l'utilisateur est déjà connecté
    if (user) {
      switch (user.role) {
        case 'admin':
          navigate('/admin/tableau-de-bord', { replace: true });
          break;
        case 'medecin':
          navigate('/medecin/employes', { replace: true });
          break;
        default:
          navigate('/', { replace: true });
      }
    }
  }, [user, navigate]);

  const [formData, setFormData] = useState({
    email: '',
    motDePasse: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(formData.email, formData.motDePasse);
      
      // Vérifier si c'est la première connexion
      if (user.premierConnexion) {
        if (user.role === 'medecin') {
          navigate('/medecin-reset-password-first-login', { replace: true });
        } else {
          navigate('/reset-password-first-login', { replace: true });
        }
        return;
      }
      
      // Sinon, rediriger selon le rôle
      switch (user.role) {
        case 'admin':
          navigate('/admin/tableau-de-bord', { replace: true });
          break;
        case 'medecin':
          navigate('/medecin/employes', { replace: true });
          break;
        default:
          navigate('/', { replace: true });
      }
    } catch (err) {
      console.error('Erreur de connexion:', err);
    }
  };

  return (
    <Container fluid className="connexion-hero d-flex align-items-center justify-content-center">
      <Card className="connexion-card shadow-lg">
        <div className="connexion-content d-flex">
          {/* Partie gauche */}
          <div className="connexion-left d-flex flex-column align-items-start justify-content-center text-white p-4">
            <div className="custom-logo mb-4 d-flex align-items-center justify-content-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="40"
                height="40"
                fill="#FFFFFF"
                viewBox="0 0 24 24"
                className="me-2"
              >
                <path d="M12 2a2 2 0 0 1 2 2v4h4a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-4v4a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-4H6a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2h4V4a2 2 0 0 1 2-2h0z"/>
              </svg>
              <h2 className="m-0 text-white">MediConnect</h2>
            </div>
            <h3 className="text-white mb-3">Espace Professionnel</h3>
            <p className="mb-4">Gérez vos rendez-vous médicaux avec efficacité et simplicité.</p>
            <div className="mt-4">
              <div className="d-flex align-items-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-check-circle-fill me-2" viewBox="0 0 16 16">
                  <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                </svg>
                <span>Gestion des rendez-vous</span>
              </div>
              <div className="d-flex align-items-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-check-circle-fill me-2" viewBox="0 0 16 16">
                  <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                </svg>
                <span>Suivi des patients</span>
              </div>
              <div className="d-flex align-items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-check-circle-fill me-2" viewBox="0 0 16 16">
                  <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                </svg>
                <span>Tableau de bord intuitif</span>
              </div>
            </div>
          </div>

          {/* Partie droite */}
          <div className="connexion-right p-5">
            <div className="text-center mb-4">
              <img 
                src="/ocp-logo.png" 
                alt="OCP Logo" 
                className="ocp-logo"
              />
            </div>
            <h4 className="login-title">Connexion</h4>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-4 form-group-custom">
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder=" "
                />
                <Form.Label>Email</Form.Label>
              </Form.Group>

              <Form.Group className="mb-4 form-group-custom">
                <Form.Control
                  type="password"
                  name="motDePasse"
                  value={formData.motDePasse}
                  onChange={handleChange}
                  required
                  placeholder=" "
                />
                <Form.Label>Mot de passe</Form.Label>
              </Form.Group>

              <div className="d-grid mt-4">
                <Button variant="success" type="submit" className="btn-success">
                  Se connecter
                </Button>
              </div>
            </Form>
          </div>
        </div>
      </Card>
    </Container>
  );
};

export default Connexion;
