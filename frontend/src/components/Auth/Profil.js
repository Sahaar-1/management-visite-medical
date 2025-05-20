import React, { useContext, useState, useEffect } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { AuthContext } from '../../contexts/AuthContext';
import './Profil.css';

const Profil = () => {
  const { user, updateProfil } = useContext(AuthContext);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    specialite: ''
  });

  // Charger les données utilisateur
  useEffect(() => {
    if (user) {
      console.log('Données utilisateur reçues:', user);
      
      setFormData({
        nom: user.nom || '',
        prenom: user.prenom || '',
        email: user.email || '',
        telephone: user.telephone || '',
        specialite: user.specialite || ''
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Validation simplifiée
      if (formData.telephone && !/^[0-9]{10}$/.test(formData.telephone)) {
        setMessage('Le numéro de téléphone doit contenir exactement 10 chiffres');
        return;
      }
      
      console.log('Données à envoyer:', formData);
      
      const updatedUser = await updateProfil(formData);
      console.log('Profil mis à jour:', updatedUser);
      setMessage('Profil mis à jour avec succès');
    } catch (err) {
      console.error('Erreur lors de la mise à jour:', err);
      setMessage(err.message || 'Erreur lors de la mise à jour du profil');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Effacer le message d'erreur
    setMessage('');
  };

  return (
    <Container className="mt-5">
      <div className="profile-header mb-4">
        <div className="profile-icon">
          <i className="bi bi-person"></i>
        </div>
        <div>
          <h2 className="user-name">{formData.nom} {formData.prenom}</h2>
          <p className="user-role">
            <i className={`bi ${user?.role === 'medecin' ? 'bi-heart-pulse' : 'bi-person-badge'} user-role-icon`}></i>
            {user?.role === 'medecin' ? 'Médecin' : 'Administrateur'}
          </p>
        </div>
      </div>

      <Card className="profile-card">
        <Card.Header>
          <i className="bi bi-pencil-square card-header-icon"></i>
          <h3>Modifier Mon Profil</h3>
        </Card.Header>
        <Card.Body>
          {message && (
            <Alert variant={message.includes('succès') ? 'success' : 'danger'} className="alert-custom">
              {message}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>
                <i className="bi bi-person-vcard form-label-icon"></i> Nom
              </Form.Label>
              <Form.Control
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                required
                className="form-control-custom"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                <i className="bi bi-type form-label-icon"></i> Prénom
              </Form.Label>
              <Form.Control
                type="text"
                name="prenom"
                value={formData.prenom}
                onChange={handleChange}
                required
                className="form-control-custom"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                <i className="bi bi-envelope form-label-icon"></i> Email
              </Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled
                className="form-control-custom"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                <i className="bi bi-telephone form-label-icon"></i> Téléphone
              </Form.Label>
              <Form.Control
                type="tel"
                name="telephone"
                value={formData.telephone}
                onChange={handleChange}
                className="form-control-custom"
                placeholder="Entrez votre numéro de téléphone"
              />
              <Form.Text className="text-muted">
                Format: 10 chiffres sans espaces ni caractères spéciaux (ex: 0612345678)
              </Form.Text>
            </Form.Group>

            {user?.role === 'medecin' && (
              <Form.Group className="mb-3">
                <Form.Label>
                  <i className="bi bi-hospital form-label-icon"></i> Spécialité
                </Form.Label>
                <Form.Control
                  type="text"
                  name="specialite"
                  value={formData.specialite}
                  onChange={handleChange}
                  required
                  className="form-control-custom"
                />
              </Form.Group>
            )}

            <div className="user-info mt-4">
              <p>
                <i className={`bi ${user?.role === 'medecin' ? 'bi-heart-pulse' : 'bi-person-badge'} user-info-icon`}></i>
                <strong>Rôle :</strong> {user?.role === 'medecin' ? 'Médecin' : 'Administrateur'}
              </p>
              {user?.dernierConnexion && (
                <p>
                  <i className="bi bi-clock user-info-icon"></i>
                  <strong>Dernière connexion :</strong>{' '}
                  {new Date(user.dernierConnexion).toLocaleString('fr-FR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              )}
            </div>

            <div className="d-flex justify-content-end mt-4">
              <Button variant="primary" type="submit" className="btn-custom">
                <i className="bi bi-save btn-icon"></i>
                Mettre à jour
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Profil;
