
import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Table, Alert } from 'react-bootstrap';
import api from '../../utils/axiosConfig';
import './GestionMedecins.css';

const GestionMedecins = () => {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    motDePasse: '',
    specialite: '',
    telephone: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [medecins, setMedecins] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const chargerMedecins = async () => {
    setLoading(true);
    try {
      const response = await api.get('/auth/medecins');
      setMedecins(response.data);
    } catch (error) {
      setMessage({ type: 'danger', text: 'Erreur lors du chargement des médecins' });
      setMedecins([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    chargerMedecins();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const errors = {};
    if (formData.nom.length < 2) {
      errors.nom = 'Le nom doit contenir au moins 2 caractères';
    }
    if (formData.prenom.length < 2) {
      errors.prenom = 'Le prénom doit contenir au moins 2 caractères';
    }
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      errors.email = 'Veuillez entrer un email valide';
    }
    if (formData.motDePasse.length < 6) {
      errors.motDePasse = 'Le mot de passe doit contenir au moins 6 caractères';
    }
    if (formData.specialite.length < 2) {
      errors.specialite = 'La spécialité doit contenir au moins 2 caractères';
    }
    if (formData.telephone && !formData.telephone.match(/^[0-9]{10}$/)) {
      errors.telephone = 'Le numéro de téléphone doit contenir 10 chiffres';
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setLoading(true);
    setFormErrors({});

    try {
      await api.post('/auth/inscription', {
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        motDePasse: formData.motDePasse,
        specialite: formData.specialite,
        telephone: formData.telephone
      });
      setMessage({ type: 'success', text: 'Compte médecin créé avec succès' });
      setFormData({
        nom: '',
        prenom: '',
        email: '',
        motDePasse: '',
        specialite: '',
        telephone: '',
      });
      chargerMedecins();
    } catch (error) {
      setMessage({
        type: 'danger',
        text: error.response?.data?.message || 'Erreur lors de la création du compte',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="gestion-medecins-container">
      <h2 className="gestion-medecins-title">Gestion des Médecins</h2>

      {message.text && (
        <Alert
          variant={message.type}
          dismissible
          onClose={() => setMessage({ type: '', text: '' })}
        >
          {message.text}
        </Alert>
      )}

      <div className="form-section">
        <h4>Créer un nouveau compte médecin</h4>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="form-group">
            <Form.Label className="form-label">Nom</Form.Label>
            <Form.Control
              type="text"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              isInvalid={!!formErrors.nom}
              required
            />
            <Form.Control.Feedback type="invalid">
              {formErrors.nom}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="form-group">
            <Form.Label className="form-label">Prénom</Form.Label>
            <Form.Control
              type="text"
              name="prenom"
              value={formData.prenom}
              onChange={handleChange}
              isInvalid={!!formErrors.prenom}
              required
            />
            <Form.Control.Feedback type="invalid">
              {formErrors.prenom}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="form-group">
            <Form.Label className="form-label">Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              isInvalid={!!formErrors.email}
              required
            />
            <Form.Control.Feedback type="invalid">
              {formErrors.email}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="form-group">
            <Form.Label className="form-label">Mot de passe</Form.Label>
            <Form.Control
              type="password"
              name="motDePasse"
              value={formData.motDePasse}
              onChange={handleChange}
              isInvalid={!!formErrors.motDePasse}
              required
            />
            <Form.Control.Feedback type="invalid">
              {formErrors.motDePasse}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="form-group">
            <Form.Label className="form-label">Spécialité</Form.Label>
            <Form.Control
              type="text"
              name="specialite"
              value={formData.specialite}
              onChange={handleChange}
              isInvalid={!!formErrors.specialite}
              required
            />
            <Form.Control.Feedback type="invalid">
              {formErrors.specialite}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="form-group">
            <Form.Label className="form-label">Téléphone</Form.Label>
            <Form.Control
              type="text"
              name="telephone"
              value={formData.telephone}
              onChange={handleChange}
              isInvalid={!!formErrors.telephone}
              placeholder="0612345678"
            />
            <Form.Control.Feedback type="invalid">
              {formErrors.telephone}
            </Form.Control.Feedback>
          </Form.Group>

          <Button
            variant="primary"
            type="submit"
            disabled={loading}
            className="submit-button"
          >
            {loading ? 'Création en cours...' : 'Créer le compte'}
          </Button>
        </Form>
      </div>

      <div className="table-section">
        <h4>Liste des médecins</h4>
        <div className="table-responsive">
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Prénom</th>
                <th>Email</th>
                <th>Spécialité</th>
                <th>Téléphone</th>
                <th>Dernière connexion</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center">
                    Chargement des médecins...
                  </td>
                </tr>
              ) : medecins.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center">
                    Aucun médecin enregistré
                  </td>
                </tr>
              ) : (
                medecins.map((medecin) => (
                  <tr key={medecin._id}>
                    <td>{medecin.nom}</td>
                    <td>{medecin.prenom}</td>
                    <td>{medecin.email}</td>
                    <td>{medecin.specialite}</td>
                    <td>{medecin.telephone || 'Non renseigné'}</td>
                    <td>
                      {medecin.dernierConnexion
                        ? new Date(medecin.dernierConnexion).toLocaleString('fr-FR', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })
                        : 'Jamais'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
      </div>
    </Container>
  );
};

export default GestionMedecins;
