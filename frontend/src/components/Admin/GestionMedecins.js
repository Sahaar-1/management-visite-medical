
import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Table, Alert, Modal } from 'react-bootstrap';
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

  const validateForm = (isEditing = false) => {
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
    // Vérifier le mot de passe uniquement lors de la création, pas lors de la modification
    if (!isEditing && formData.motDePasse.length < 6) {
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

  const [medecinSelectionne, setMedecinSelectionne] = useState(null);
  const [modalModifier, setModalModifier] = useState(false);
  const [modalSupprimer, setModalSupprimer] = useState(false);
  const [modalResetPassword, setModalResetPassword] = useState(false);
  const [nouveauMotDePasse, setNouveauMotDePasse] = useState('');
  const [confirmationMotDePasse, setConfirmationMotDePasse] = useState('');
  const [passwordErrors, setPasswordErrors] = useState({});

  // Fonction pour ouvrir le modal de modification
  const ouvrirModalModifier = (medecin) => {
    setMedecinSelectionne(medecin);
    setFormData({
      nom: medecin.nom,
      prenom: medecin.prenom,
      email: medecin.email,
      specialite: medecin.specialite,
      telephone: medecin.telephone || '',
      motDePasse: '' // Champ vide pour la modification
    });
    setModalModifier(true);
  };

  // Fonction pour ouvrir le modal de suppression
  const ouvrirModalSupprimer = (medecin) => {
    setMedecinSelectionne(medecin);
    setModalSupprimer(true);
  };

  // Fonction pour ouvrir le modal de réinitialisation de mot de passe
  const ouvrirModalResetPassword = (medecin) => {
    setMedecinSelectionne(medecin);
    setNouveauMotDePasse('');
    setConfirmationMotDePasse('');
    setPasswordErrors({});
    setModalResetPassword(true);
  };

  // Fonction pour modifier un médecin
  const modifierMedecin = async () => {
    const errors = validateForm(true); // Passer true pour indiquer qu'il s'agit d'une modification
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setLoading(true);
    try {
      await api.put(`/auth/medecins/${medecinSelectionne._id}`, {
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        specialite: formData.specialite,
        telephone: formData.telephone
      });
      
      setMessage({ type: 'success', text: 'Médecin modifié avec succès' });
      setModalModifier(false);
      chargerMedecins();
    } catch (error) {
      setMessage({
        type: 'danger',
        text: error.response?.data?.message || 'Erreur lors de la modification du médecin',
      });
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour supprimer un médecin
  const supprimerMedecin = async () => {
    setLoading(true);
    try {
      await api.delete(`/auth/medecins/${medecinSelectionne._id}`);
      setMessage({ type: 'success', text: 'Médecin supprimé avec succès' });
      setModalSupprimer(false);
      chargerMedecins();
    } catch (error) {
      setMessage({
        type: 'danger',
        text: error.response?.data?.message || 'Erreur lors de la suppression du médecin',
      });
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour valider le formulaire de réinitialisation de mot de passe
  const validatePasswordForm = () => {
    const errors = {};
    if (nouveauMotDePasse.length < 6) {
      errors.nouveauMotDePasse = 'Le mot de passe doit contenir au moins 6 caractères';
    }
    if (nouveauMotDePasse !== confirmationMotDePasse) {
      errors.confirmationMotDePasse = 'Les mots de passe ne correspondent pas';
    }
    return errors;
  };

  // Fonction pour réinitialiser le mot de passe d'un médecin
  const reinitialiserMotDePasse = async () => {
    const errors = validatePasswordForm();
    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    setLoading(true);
    try {
      await api.post(`/auth/medecins/${medecinSelectionne._id}/reset-password`, {
        nouveauMotDePasse,
        confirmationMotDePasse
      });
      
      setMessage({ type: 'success', text: 'Mot de passe réinitialisé avec succès' });
      setModalResetPassword(false);
    } catch (error) {
      setMessage({
        type: 'danger',
        text: error.response?.data?.message || 'Erreur lors de la réinitialisation du mot de passe',
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

      {/* Formulaire de création de médecin */}
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

      {/* Liste des médecins */}
      <div className="medecins-list-section">
        <h4>Liste des médecins</h4>
        {loading ? (
          <div className="text-center">
            <span>Chargement...</span>
          </div>
        ) : (
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Prénom</th>
                <th>Email</th>
                <th>Spécialité</th>
                <th>Téléphone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {medecins.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center">
                    Aucun médecin trouvé
                  </td>
                </tr>
              ) : (
                medecins.map((medecin) => (
                  <tr key={medecin._id}>
                    <td>{medecin.nom}</td>
                    <td>{medecin.prenom}</td>
                    <td>{medecin.email}</td>
                    <td>{medecin.specialite}</td>
                    <td>{medecin.telephone || '-'}</td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => ouvrirModalModifier(medecin)}
                      >
                        <i className="fas fa-edit"></i> Modifier
                      </Button>
                      <Button
                        variant="outline-warning"
                        size="sm"
                        className="me-2"
                        onClick={() => ouvrirModalResetPassword(medecin)}
                      >
                        <i className="fas fa-key"></i> Réinitialiser MDP
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => ouvrirModalSupprimer(medecin)}
                      >
                        <i className="fas fa-trash"></i> Supprimer
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        )}
      </div>

      {/* Modal de modification */}
      <Modal show={modalModifier} onHide={() => setModalModifier(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Modifier le médecin</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nom</Form.Label>
              <Form.Control
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                isInvalid={!!formErrors.nom}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.nom}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Prénom</Form.Label>
              <Form.Control
                type="text"
                name="prenom"
                value={formData.prenom}
                onChange={handleChange}
                isInvalid={!!formErrors.prenom}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.prenom}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                isInvalid={!!formErrors.email}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.email}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Spécialité</Form.Label>
              <Form.Control
                type="text"
                name="specialite"
                value={formData.specialite}
                onChange={handleChange}
                isInvalid={!!formErrors.specialite}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.specialite}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Téléphone</Form.Label>
              <Form.Control
                type="text"
                name="telephone"
                value={formData.telephone}
                onChange={handleChange}
                isInvalid={!!formErrors.telephone}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.telephone}
              </Form.Control.Feedback>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setModalModifier(false)}>
            Annuler
          </Button>
          <Button variant="primary" onClick={modifierMedecin} disabled={loading}>
            {loading ? 'Chargement...' : 'Enregistrer'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de suppression */}
      <Modal show={modalSupprimer} onHide={() => setModalSupprimer(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmer la suppression</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Êtes-vous sûr de vouloir supprimer le médecin {medecinSelectionne?.prenom} {medecinSelectionne?.nom} ?
          Cette action est irréversible.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setModalSupprimer(false)}>
            Annuler
          </Button>
          <Button variant="danger" onClick={supprimerMedecin} disabled={loading}>
            {loading ? 'Chargement...' : 'Supprimer'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de réinitialisation de mot de passe */}
      <Modal show={modalResetPassword} onHide={() => setModalResetPassword(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Réinitialiser le mot de passe</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Vous êtes sur le point de réinitialiser le mot de passe du médecin {medecinSelectionne?.prenom} {medecinSelectionne?.nom}.
          </p>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nouveau mot de passe</Form.Label>
              <Form.Control
                type="password"
                value={nouveauMotDePasse}
                onChange={(e) => setNouveauMotDePasse(e.target.value)}
                isInvalid={!!passwordErrors.nouveauMotDePasse}
              />
              <Form.Control.Feedback type="invalid">
                {passwordErrors.nouveauMotDePasse}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Confirmer le mot de passe</Form.Label>
              <Form.Control
                type="password"
                value={confirmationMotDePasse}
                onChange={(e) => setConfirmationMotDePasse(e.target.value)}
                isInvalid={!!passwordErrors.confirmationMotDePasse}
              />
              <Form.Control.Feedback type="invalid">
                {passwordErrors.confirmationMotDePasse}
              </Form.Control.Feedback>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setModalResetPassword(false)}>
            Annuler
          </Button>
          <Button variant="warning" onClick={reinitialiserMotDePasse} disabled={loading}>
            {loading ? 'Chargement...' : 'Réinitialiser'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default GestionMedecins;
