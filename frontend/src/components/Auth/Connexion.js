import React, { useState, useEffect } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
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
    <div className="connexion-hero">
      <div className="connexion-card">
        {/* Logo Section */}
        <div className="logo-section">
          <div className="ocp-logo">
            <img
              src="/ocp.png"
              alt="OCP Logo"
            />
          </div>
        </div>

        {/* Welcome Text */}
        <div className="welcome-text">
          <h2>Gérez vos rendez-vous médicaux avec</h2>
          <p>efficacité et simplicité.</p>
        </div>

        {/* Login Form */}
        <div className="login-form">
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="form-group-custom">
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

            <Form.Group className="form-group-custom">
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

            <Button variant="success" type="submit" className="btn-success">
              Se connecter
            </Button>

          </Form>
        </div>
      </div>
    </div>
  );
};

export default Connexion;
