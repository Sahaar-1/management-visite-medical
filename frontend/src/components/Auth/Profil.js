import React, { useContext, useState, useEffect } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { AuthContext } from '../../contexts/AuthContext';
import './Profil.css';

const Profil = () => {
  const { user, updateProfil, error } = useContext(AuthContext);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    nom: user?.nom || '',
    prenom: user?.prenom || '',
    email: user?.email || '',
    telephone: user?.telephone || '',
    specialite: user?.specialite || ''
  });

  useEffect(() => {
    if (user) {
      console.log('Données utilisateur reçues:', user);
      console.log('Numéro de téléphone:', user.telephone);
      setFormData(prevData => ({
        ...prevData,
        nom: user.nom || '',
        prenom: user.prenom || '',
        email: user.email || '',
        telephone: user.telephone || '',
        specialite: user.specialite || ''
      }));
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Données envoyées:', formData);
      await updateProfil(formData);
      setMessage('Profil mis à jour avec succès');
    } catch (err) {
      console.error('Erreur lors de la mise à jour:', err);
      setMessage(err.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'telephone' && value !== '') {
      if (!/^[0-9]{10}$/.test(value)) {
        setMessage('Le numéro de téléphone doit contenir exactement 10 chiffres');
        return;
      }
    }
    setFormData({
      ...formData,
      [name]: value
    });
    setMessage('');
  };

  return (
    <Container className="mt-5">
      <div className="profile-header mb-4">
        <i className="fas fa-user-circle fa-3x me-3 text-primary"></i>
        <div>
          <h2 className="user-name">{formData.nom} {formData.prenom}</h2>
          <p className="user-role">{user?.role === 'medecin' ? 'Médecin' : 'Administrateur'}</p>
        </div>
      </div>

      <Card className="profile-card">
        <Card.Header>
          <h3>Modifier Mon Profil</h3>
        </Card.Header>
        <Card.Body>
          {message && (
            <Alert variant={error ? 'danger' : 'success'} className="alert-custom">
              {message}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Nom</Form.Label>
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
              <Form.Label>Prénom</Form.Label>
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
              <Form.Label>Email</Form.Label>
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
              <Form.Label>Téléphone</Form.Label>
              <Form.Control
                type="tel"
                name="telephone"
                value={formData.telephone}
                onChange={handleChange}
                pattern="[0-9]{10}"
                title="Le numéro de téléphone doit contenir exactement 10 chiffres"
                className="form-control-custom"
                placeholder="Entrez votre numéro de téléphone"
              />
            </Form.Group>

            {user?.role === 'medecin' && (
              <Form.Group className="mb-3">
                <Form.Label>Spécialité</Form.Label>
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

            <div className="d-flex justify-content-between align-items-center mt-4">
              <div className="user-info">
                <p><strong>Rôle :</strong> {user?.role === 'medecin' ? 'Médecin' : 'Administrateur'}</p>
                {user?.dernierConnexion && (
                  <p>
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
              <Button variant="primary" type="submit" className="btn-custom">
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