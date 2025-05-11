import React, { useContext, useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { AuthContext } from '../../contexts/AuthContext';

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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfil(formData);
      setMessage('Profil mis à jour avec succès');
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <Container className="mt-4">
      <Card>
        <Card.Header>
          <h3>Mon Profil</h3>
        </Card.Header>
        <Card.Body>
          {message && (
            <Alert variant={error ? 'danger' : 'success'}>
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
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Téléphone</Form.Label>
              <Form.Control
                type="tel"
                name="telephone"
                value={formData.telephone}
                onChange={handleChange}
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
                />
              </Form.Group>
            )}

            <div className="d-flex justify-content-between">
              <div>
                <p><strong>Rôle:</strong> {user?.role}</p>
                {user?.dernierConnexion && (
                  <p>
                    <strong>Dernière connexion:</strong>{' '}
                    {new Date(user.dernierConnexion).toLocaleString()}
                  </p>
                )}
              </div>
              <Button variant="primary" type="submit">
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
