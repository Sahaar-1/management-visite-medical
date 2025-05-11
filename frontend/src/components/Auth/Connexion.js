import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FaUser } from 'react-icons/fa'; // Changed to FaUser for a user iconimport './Connexion.css';
const Connexion = () => {
  const navigate = useNavigate();
  const { login, error } = useAuth();  const [formData, setFormData] = useState({
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
    e.preventDefault();    try {
      const user = await login(formData.email, formData.motDePasse, formData.role);
      
      // Redirection basée sur le rôle
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
      // L'erreur est déjà gérée par le contexte
      console.error('Erreur de connexion:', err);
    }
  };

  return (
    <Container className="connexion-container">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <Card>
            <Card.Header>
              <div className="icon-container">
                <FaUser size={50} color="#1e3a8a" /> {/* Changed to FaUser */}
              </div>
            </Card.Header>
            <Card.Body>
              {error && (
                <Alert variant="danger">
                  {error}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Entrez votre email"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Mot de passe</Form.Label>                  <Form.Control
                    type="password"
                    name="motDePasse"
                    value={formData.motDePasse}
                    onChange={handleChange}
                    required
                    placeholder="Entrez votre mot de passe"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Rôle</Form.Label>                  <Form.Select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Sélectionnez un rôle</option>
                    <option value="admin">Administrateur</option>
                    <option value="medecin">Médecin</option>
                  </Form.Select>
                </Form.Group>

                <div className="btn-container">
                  <Button variant="btn" type="submit">
                    Se connecter
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </div>
      </div>
    </Container>
  );
};

export default Connexion;
