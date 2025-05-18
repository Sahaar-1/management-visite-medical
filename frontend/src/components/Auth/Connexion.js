import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Connexion.css';

const Connexion = () => {
  const navigate = useNavigate();
  const { login, error } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    motDePasse: '',
    role: ''
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
      const user = await login(formData.email, formData.motDePasse, formData.role);
      switch (user.role) {
        case 'admin':
          navigate('/admin/tableau-de-bord');
          break;
        case 'medecin':
          navigate('/medecin/employes');
          break;
        default:
          navigate('/');
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
          <div className="connexion-left d-flex flex-column align-items-center justify-content-center text-white p-4">
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
            <h3 className="text-white">Espace Professionnel</h3>
            <p>Gérez vos rendez-vous médicaux avec efficacité et simplicité.</p>
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
            <h4 className="login-title">Login</h4>
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

              <Form.Group className="mb-4 form-group-custom">
                <Form.Select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                >
                  <option value="">Sélectionnez un rôle</option>
                  <option value="admin">Administrateur</option>
                  <option value="medecin">Médecin</option>
                </Form.Select>
                <Form.Label>Rôle</Form.Label>
              </Form.Group>

              <div className="d-grid">
                <Button variant="success" type="submit">
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