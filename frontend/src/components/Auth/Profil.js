import React, { useContext, useState, useEffect } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { AuthContext } from '../../contexts/AuthContext';
import './Profil.css';

const Profil = () => {
  const { user, updateProfil, updateToken } = useContext(AuthContext);
  const [message, setMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    specialite: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Charger les données utilisateur
  useEffect(() => {
    if (user) {
      setFormData({
        nom: user.nom || '',
        prenom: user.prenom || '',
        email: user.email || '',
        telephone: user.telephone || '',
        specialite: user.specialite || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Validation du téléphone
      if (formData.telephone && !/^[0-9]{10}$/.test(formData.telephone)) {
        setMessage('Le numéro de téléphone doit contenir exactement 10 chiffres');
        return;
      }

      // Validation du mot de passe si modification demandée
      if (formData.newPassword || formData.email !== user.email) {
        if (!formData.currentPassword) {
          setMessage('Le mot de passe actuel est requis pour modifier l\'email ou le mot de passe');
          return;
        }

        if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
          setMessage('Les nouveaux mots de passe ne correspondent pas');
          return;
        }

        if (formData.newPassword && formData.newPassword.length < 6) {
          setMessage('Le nouveau mot de passe doit contenir au moins 6 caractères');
          return;
        }
      }

      const dataToUpdate = {
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        telephone: formData.telephone,
        specialite: formData.specialite,
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      };

      const response = await updateProfil(dataToUpdate);
      setMessage('Profil mis à jour avec succès');

      // Réinitialiser les champs de mot de passe
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));

      // Si un nouveau token est reçu (changement d'email), mettre à jour le contexte
      if (response.token) {
        // Mettre à jour le token dans le localStorage et le contexte
        localStorage.setItem('token', response.token);
        // Vous devrez implémenter cette fonction dans votre AuthContext
        updateToken(response.token);
      }
    } catch (err) {
      setMessage(err.response?.data?.message || 'Erreur lors de la mise à jour du profil');
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

  const toggleEdit = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      // Réinitialiser les champs de mot de passe lors du passage en mode édition
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    }
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
        <Card.Header className="d-flex justify-content-between align-items-center">
          <div>
            <i className="bi bi-pencil-square card-header-icon"></i>
            <h3 className="d-inline">Mon Profil</h3>
          </div>
          <Button
            variant="outline-secondary"
            onClick={toggleEdit}
            className="btn-icon-only"
          >
            {isEditing ? (
              <i className="bi bi-x-circle"></i>
            ) : (
              <i className="bi bi-pencil"></i>
            )}
          </Button>
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
              {isEditing ? (
                <Form.Control
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  required
                  className="form-control-custom"
                />
              ) : (
                <p className="form-control-static">{formData.nom}</p>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                <i className="bi bi-type form-label-icon"></i> Prénom
              </Form.Label>
              {isEditing ? (
                <Form.Control
                  type="text"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleChange}
                  required
                  className="form-control-custom"
                />
              ) : (
                <p className="form-control-static">{formData.prenom}</p>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                <i className="bi bi-envelope form-label-icon"></i> Email
              </Form.Label>
              {isEditing ? (
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="form-control-custom"
                />
              ) : (
                <p className="form-control-static">{formData.email}</p>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                <i className="bi bi-telephone form-label-icon"></i> Téléphone
              </Form.Label>
              {isEditing ? (
                <>
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
                </>
              ) : (
                <p className="form-control-static">{formData.telephone || 'Non renseigné'}</p>
              )}
            </Form.Group>

            {user?.role === 'medecin' && (
              <Form.Group className="mb-3">
                <Form.Label>
                  <i className="bi bi-heart-pulse form-label-icon"></i> Spécialité
                </Form.Label>
                {isEditing ? (
                  <Form.Control
                    type="text"
                    name="specialite"
                    value={formData.specialite}
                    onChange={handleChange}
                    className="form-control-custom"
                  />
                ) : (
                  <p className="form-control-static">{formData.specialite || 'Non renseigné'}</p>
                )}
              </Form.Group>
            )}

            {isEditing && (
              <>
                <hr />
                <h5>Modification du mot de passe</h5>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <i className="bi bi-key form-label-icon"></i> Mot de passe actuel
                  </Form.Label>
                  <Form.Control
                    type="password"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    className="form-control-custom"
                    placeholder="Requis pour modifier l'email ou le mot de passe"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>
                    <i className="bi bi-key-fill form-label-icon"></i> Nouveau mot de passe
                  </Form.Label>
                  <Form.Control
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className="form-control-custom"
                    placeholder="Laissez vide pour ne pas modifier"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>
                    <i className="bi bi-key-fill form-label-icon"></i> Confirmer le nouveau mot de passe
                  </Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="form-control-custom"
                    placeholder="Confirmez le nouveau mot de passe"
                  />
                </Form.Group>
              </>
            )}

            {isEditing && (
              <Button type="submit" variant="outline-secondary" className="w-100 btn-save-gray">
                <i className="bi bi-check-circle me-2"></i>
                Enregistrer les modifications
              </Button>
            )}
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Profil;
