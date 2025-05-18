import React, { useState, useEffect } from 'react';
import { Container, Form, Button as BootstrapButton, Table, Alert, Modal } from 'react-bootstrap';
import { FaUserMd, FaPlus, FaEdit, FaTrash, FaKey  } from 'react-icons/fa';
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
  const [showAddModal, setShowAddModal] = useState(false);

  const resetForm = () => {
    setFormData({
      nom: '',
      prenom: '',
      email: '',
      motDePasse: '',
      specialite: '',
      telephone: '',
    });
    setFormErrors({});
  };

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
    if (formData.nom.length < 2) errors.nom = 'Le nom doit contenir au moins 2 caractères';
    if (formData.prenom.length < 2) errors.prenom = 'Le prénom doit contenir au moins 2 caractères';
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errors.email = 'Veuillez entrer un email valide';
    if (!isEditing && formData.motDePasse.length < 6) errors.motDePasse = 'Le mot de passe doit contenir au moins 6 caractères';
    if (formData.specialite.length < 2) errors.specialite = 'La spécialité doit contenir au moins 2 caractères';
    if (formData.telephone && !formData.telephone.match(/^[0-9]{10}$/)) errors.telephone = 'Le numéro de téléphone doit contenir 10 chiffres';
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
      await api.post('/auth/inscription', formData);
      setMessage({ type: 'success', text: 'Compte médecin créé avec succès' });
      setFormData({ nom: '', prenom: '', email: '', motDePasse: '', specialite: '', telephone: '' });
      setShowAddModal(false);
      chargerMedecins();
    } catch (error) {
      setMessage({ type: 'danger', text: error.response?.data?.message || 'Erreur lors de la création du compte' });
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

  const ouvrirModalModifier = (medecin) => {
    setMedecinSelectionne(medecin);
    setFormData({ nom: medecin.nom, prenom: medecin.prenom, email: medecin.email, specialite: medecin.specialite, telephone: medecin.telephone || '', motDePasse: '' });
    setModalModifier(true);
  };

  const ouvrirModalSupprimer = (medecin) => {
    setMedecinSelectionne(medecin);
    setModalSupprimer(true);
  };

  const ouvrirModalResetPassword = (medecin) => {
    setMedecinSelectionne(medecin);
    setNouveauMotDePasse('');
    setConfirmationMotDePasse('');
    setPasswordErrors({});
    setModalResetPassword(true);
  };

  const modifierMedecin = async () => {
    const errors = validateForm(true);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setLoading(true);
    try {
      await api.put(`/auth/medecins/${medecinSelectionne._id}`, { nom: formData.nom, prenom: formData.prenom, email: formData.email, specialite: formData.specialite, telephone: formData.telephone });
      setMessage({ type: 'success', text: 'Médecin modifié avec succès' });
      setModalModifier(false);
      chargerMedecins();
    } catch (error) {
      setMessage({ type: 'danger', text: error.response?.data?.message || 'Erreur lors de la modification du médecin' });
    } finally {
      setLoading(false);
    }
  };

  const supprimerMedecin = async () => {
    setLoading(true);
    try {
      await api.delete(`/auth/medecins/${medecinSelectionne._id}`);
      setMessage({ type: 'success', text: 'Médecin supprimé avec succès' });
      setModalSupprimer(false);
      chargerMedecins();
    } catch (error) {
      setMessage({ type: 'danger', text: error.response?.data?.message || 'Erreur lors de la suppression du médecin' });
    } finally {
      setLoading(false);
    }
  };

  const validatePasswordForm = () => {
    const errors = {};
    if (nouveauMotDePasse.length < 6) errors.nouveauMotDePasse = 'Le mot de passe doit contenir au moins 6 caractères';
    if (nouveauMotDePasse !== confirmationMotDePasse) errors.confirmationMotDePasse = 'Les mots de passe ne correspondent pas';
    return errors;
  };

  const reinitialiserMotDePasse = async () => {
    const errors = validatePasswordForm();
    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }
    setLoading(true);
    try {
      await api.post(`/auth/medecins/${medecinSelectionne._id}/reset-password`, { nouveauMotDePasse, confirmationMotDePasse });
      setMessage({ type: 'success', text: 'Mot de passe réinitialisé avec succès' });
      setModalResetPassword(false);
    } catch (error) {
      setMessage({ type: 'danger', text: error.response?.data?.message || 'Erreur lors de la réinitialisation du mot de passe' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="gestion-medecins-container">
      <h2 className="gestion-medecins-title">Gestion des Médecins</h2>

      {message.text && (
        <Alert variant={message.type} dismissible onClose={() => setMessage({ type: '', text: '' })}>
          {message.text}
        </Alert>
      )}

      <div className="medecins-list-section">
        <div className="d-flex justify-content-end align-items-center mb-4">
          <BootstrapButton className="btn-add-medecin" onClick={() => { resetForm(); setShowAddModal(true); }}>
            <FaPlus /> Ajouter un médecin
          </BootstrapButton>
        </div>
        
        {loading ? (
          <div className="text-center">
            <span>Chargement...</span>
          </div>
        ) : (
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Médecin</th>
                <th>Email</th>
                <th>Spécialité</th>
                <th>Téléphone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {medecins.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center">
                    Aucun médecin trouvé
                  </td>
                </tr>
              ) : (
                medecins.map((medecin) => (
                  <tr key={medecin._id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="doctor-icon">
                          <FaUserMd />
                        </div>
                        
                        <div className="ms-2">
                          {medecin.nom} {medecin.prenom}
                        </div>
                      </div>
                    </td>
                    <td>{medecin.email}</td>
                    <td>{medecin.specialite}</td>
                    <td>{medecin.telephone || '-'}</td>
                    <td>
                      <button className="btn-action" onClick={() => ouvrirModalModifier(medecin)}>
                        <FaEdit />
                      </button>
                      <button className="btn-action" onClick={() => ouvrirModalResetPassword(medecin)}>
                        <FaKey />
                      </button>
                      <button className="btn-action" onClick={() => ouvrirModalSupprimer(medecin)}>
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        )}
      </div>

      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} backdrop="static" className="add-doctor-modal" size="lg">
          <Modal.Title>Créer un nouveau compte médecin</Modal.Title>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6">
                <Form.Group className="form-group">
                  <Form.Label className="form-label">Nom</Form.Label>
                  <Form.Control type="text" name="nom" value={formData.nom} onChange={handleChange} isInvalid={!!formErrors.nom} required />
                  <Form.Control.Feedback type="invalid">{formErrors.nom}</Form.Control.Feedback>
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="form-group">
                  <Form.Label className="form-label">Prénom</Form.Label>
                  <Form.Control type="text" name="prenom" value={formData.prenom} onChange={handleChange} isInvalid={!!formErrors.prenom} required />
                  <Form.Control.Feedback type="invalid">{formErrors.prenom}</Form.Control.Feedback>
                </Form.Group>
              </div>
            </div>
            <div className="row">
              <div className="col-md-6">
                <Form.Group className="form-group">
                  <Form.Label className="form-label">Email</Form.Label>
                  <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} isInvalid={!!formErrors.email} required />
                  <Form.Control.Feedback type="invalid">{formErrors.email}</Form.Control.Feedback>
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="form-group">
                  <Form.Label className="form-label">Mot de passe</Form.Label>
                  <Form.Control type="password" name="motDePasse" value={formData.motDePasse} onChange={handleChange} isInvalid={!!formErrors.motDePasse} required />
                  <Form.Control.Feedback type="invalid">{formErrors.motDePasse}</Form.Control.Feedback>
                </Form.Group>
              </div>
            </div>
            <div className="row">
              <div className="col-md-6">
                <Form.Group className="form-group">
                  <Form.Label className="form-label">Spécialité</Form.Label>
                  <Form.Control type="text" name="specialite" value={formData.specialite} onChange={handleChange} isInvalid={!!formErrors.specialite} required />
                  <Form.Control.Feedback type="invalid">{formErrors.specialite}</Form.Control.Feedback>
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="form-group">
                  <Form.Label className="form-label">Téléphone</Form.Label>
                  <Form.Control type="text" name="telephone" value={formData.telephone} onChange={handleChange} isInvalid={!!formErrors.telephone} placeholder="0612345678" />
                  <Form.Control.Feedback type="invalid">{formErrors.telephone}</Form.Control.Feedback>
                </Form.Group>
              </div>
            </div>
            <div className="d-flex justify-content-end mt-3">
              <BootstrapButton variant="secondary" onClick={() => setShowAddModal(false)} className="me-2">
                Annuler
              </BootstrapButton>
              <BootstrapButton variant="primary" type="submit" disabled={loading}>
                {loading ? 'Création en cours...' : 'Créer le compte'}
              </BootstrapButton>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      <Modal show={modalModifier} onHide={() => setModalModifier(false)}>
            <Modal.Title>Modifier le médecin</Modal.Title>
          <Modal.Body>
            <Form>
              <div className="row">
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label>Nom</Form.Label>
                    <Form.Control type="text" name="nom" value={formData.nom} onChange={handleChange} isInvalid={!!formErrors.nom} />
                    <Form.Control.Feedback type="invalid">{formErrors.nom}</Form.Control.Feedback>
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label>Prénom</Form.Label>
                    <Form.Control type="text" name="prenom" value={formData.prenom} onChange={handleChange} isInvalid={!!formErrors.prenom} />
                    <Form.Control.Feedback type="invalid">{formErrors.prenom}</Form.Control.Feedback>
                  </Form.Group>
                </div>
              </div>
              <div className="row">
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} isInvalid={!!formErrors.email} />
                    <Form.Control.Feedback type="invalid">{formErrors.email}</Form.Control.Feedback>
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label>Spécialité</Form.Label>
                    <Form.Control type="text" name="specialite" value={formData.specialite} onChange={handleChange} isInvalid={!!formErrors.specialite} />
                    <Form.Control.Feedback type="invalid">{formErrors.specialite}</Form.Control.Feedback>
                  </Form.Group>
                </div>
              </div>
              <div className="row">
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label>Téléphone</Form.Label>
                    <Form.Control type="text" name="telephone" value={formData.telephone} onChange={handleChange} isInvalid={!!formErrors.telephone} />
                    <Form.Control.Feedback type="invalid">{formErrors.telephone}</Form.Control.Feedback>
                  </Form.Group>
                </div>
              </div>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <BootstrapButton variant="secondary" onClick={() => setModalModifier(false)}>
              Annuler
            </BootstrapButton>
            <BootstrapButton variant="primary" onClick={modifierMedecin} disabled={loading}>
              {loading ? 'Chargement...' : 'Enregistrer'}
            </BootstrapButton>
          </Modal.Footer>
        </Modal>

      <Modal show={modalSupprimer} onHide={() => setModalSupprimer(false)}>
            <Modal.Title>Confirmer la suppression</Modal.Title>
          <Modal.Body>
            Êtes-vous sûr de vouloir supprimer le médecin {medecinSelectionne?.prenom} {medecinSelectionne?.nom} ? Cette action est irréversible.
          </Modal.Body>
          <Modal.Footer>
            <BootstrapButton variant="secondary" onClick={() => setModalSupprimer(false)}>
              Annuler
            </BootstrapButton>
            <BootstrapButton variant="primary" onClick={supprimerMedecin} disabled={loading}>
              {loading ? 'Chargement...' : 'Supprimer'}
            </BootstrapButton>
          </Modal.Footer>
        </Modal>

      <Modal show={modalResetPassword} onHide={() => setModalResetPassword(false)}>
            <Modal.Title>Réinitialiser le mot de passe</Modal.Title>
          <Modal.Body>
            <p>Vous êtes sur le point de réinitialiser le mot de passe du médecin {medecinSelectionne?.prenom} {medecinSelectionne?.nom}.</p>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Nouveau mot de passe</Form.Label>
                <Form.Control type="password" value={nouveauMotDePasse} onChange={(e) => setNouveauMotDePasse(e.target.value)} isInvalid={!!passwordErrors.nouveauMotDePasse} />
                <Form.Control.Feedback type="invalid">{passwordErrors.nouveauMotDePasse}</Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Confirmer le mot de passe</Form.Label>
                <Form.Control type="password" value={confirmationMotDePasse} onChange={(e) => setConfirmationMotDePasse(e.target.value)} isInvalid={!!passwordErrors.confirmationMotDePasse} />
                <Form.Control.Feedback type="invalid">{passwordErrors.confirmationMotDePasse}</Form.Control.Feedback>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <BootstrapButton variant="secondary" onClick={() => setModalResetPassword(false)}>
              Annuler
            </BootstrapButton>
            <BootstrapButton variant="primary" onClick={reinitialiserMotDePasse} disabled={loading}>
              {loading ? 'Chargement...' : 'Réinitialiser'}
            </BootstrapButton>
          </Modal.Footer>
        </Modal>
    </Container>
  );
};

export default GestionMedecins;