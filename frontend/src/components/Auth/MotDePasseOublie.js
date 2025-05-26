import React, { useState } from 'react';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../../utils/axiosConfig';
import './MotDePasseOublie.css';

const MotDePasseOublie = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [emailEnvoye, setEmailEnvoye] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setMessage({ type: 'danger', text: 'Veuillez entrer votre adresse email' });
      return;
    }
    
    setLoading(true);
    setMessage(null);
    
    try {
      // Vérifier d'abord si l'email existe et s'il appartient à un admin
      const verificationResponse = await api.post('/auth/verifier-email', { email });
      
      if (!verificationResponse.data.existe) {
        setMessage({ type: 'danger', text: 'Aucun compte trouvé avec cette adresse email' });
        setLoading(false);
        return;
      }
      
      if (!verificationResponse.data.isAdmin) {
        setMessage({ type: 'danger', text: 'Seuls les administrateurs peuvent réinitialiser leur mot de passe' });
        setLoading(false);
        return;
      }
      
      // Si c'est un admin, envoyer l'email de réinitialisation
      const response = await api.post('/auth/mot-de-passe-oublie', { email });
      setMessage({ type: 'success', text: response.data.message });
      setEmailEnvoye(true);
    } catch (error) {
      setMessage({ 
        type: 'danger', 
        text: error.response?.data?.message || 'Une erreur est survenue lors de l\'envoi de l\'email de réinitialisation' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="mot-de-passe-oublie-container d-flex align-items-center justify-content-center">
      <Card className="mot-de-passe-oublie-card shadow-lg">
        <Card.Body className="p-5">
          <div className="text-center mb-4">
            <img 
              src="/ocp-logo.png" 
              alt="OCP Logo" 
              className="ocp-logo"
            />
          </div>
          
          <h4 className="text-center mb-4">Réinitialisation du mot de passe</h4>
          
          {message && (
            <Alert variant={message.type} className="mb-4">
              {message.text}
            </Alert>
          )}
          
          {!emailEnvoye ? (
            <>
              <p className="text-center mb-4">
                Veuillez entrer votre adresse email. Vous recevrez un lien pour créer un nouveau mot de passe.
              </p>
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-4 form-group-custom">
                  <Form.Control
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder=" "
                  />
                  <Form.Label>Email</Form.Label>
                </Form.Group>
                
                <div className="d-grid mt-4">
                  <Button 
                    variant="success" 
                    type="submit" 
                    className="btn-success"
                    disabled={loading}
                  >
                    {loading ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation'}
                  </Button>
                </div>
              </Form>
            </>
          ) : (
            <div className="text-center">
              <p>Un email de réinitialisation a été envoyé à votre adresse email.</p>
              <p>Veuillez vérifier votre boîte de réception et suivre les instructions.</p>
            </div>
          )}
          
          <div className="text-center mt-4">
            <Link to="/connexion" className="back-to-login">
              Retour à la page de connexion
            </Link>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default MotDePasseOublie;