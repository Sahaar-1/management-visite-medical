import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/axiosConfig';
import './MedecinResetPasswordFirstLogin.css';

const MedecinResetPasswordFirstLogin = () => {
  const [formData, setFormData] = useState({
    nouveauMotDePasse: '',
    confirmationMotDePasse: '',
    email: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Si l'utilisateur n'est pas connecté ou n'est pas un médecin ou n'a pas besoin de réinitialiser son mot de passe
    if (!user) {
      navigate('/connexion', { replace: true });
      return;
    }
    
    if (user.role !== 'medecin') {
      // Rediriger selon le rôle
      if (user.role === 'admin') {
        navigate('/admin/tableau-de-bord', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
      return;
    }
    
    if (!user.premierConnexion) {
      navigate('/medecin/employes', { replace: true });
      return;
    }
    
    // Pré-remplir l'email avec celui de l'utilisateur
    setFormData(prev => ({ ...prev, email: user.email }));
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (formData.nouveauMotDePasse.length < 6) {
      newErrors.nouveauMotDePasse = 'Le mot de passe doit contenir au moins 6 caractères';
    }
    if (formData.nouveauMotDePasse !== formData.confirmationMotDePasse) {
      newErrors.confirmationMotDePasse = 'Les mots de passe ne correspondent pas';
    }
    // Vérifier l'email seulement s'il est fourni et différent de l'email actuel
    if (formData.email && formData.email !== user.email && 
        !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)) {
      newErrors.email = 'Veuillez entrer un email valide';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    
    setLoading(true);
    setErrors({});
    
    try {
      // Ajouter l'ID de l'utilisateur à la requête
      const requestData = {
        ...formData,
        userId: user._id
      };
      
      const response = await api.post('/auth/reset-password-first-login', requestData);
      setMessage({ type: 'success', text: response.data.message });
      
      // Mettre à jour l'utilisateur dans le contexte
      updateUser({ ...user, premierConnexion: false, email: formData.email });
      
      // Rediriger vers le tableau de bord après 2 secondes
      setTimeout(() => {
        navigate('/medecin/employes', { replace: true });
      }, 2000);
    } catch (error) {
      setMessage({ 
        type: 'danger', 
        text: error.response?.data?.message || 'Erreur lors de la réinitialisation du mot de passe' 
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null; // Ne rien afficher pendant la redirection
  }

  return (
    <div className="medecin-reset-password-container">
      <div className="medecin-reset-password-card">
        <h2 className="medecin-reset-password-title">Bienvenue, Dr. {user.nom} {user.prenom}</h2>
        <p className="medecin-reset-password-description">
          Pour des raisons de sécurité, vous devez changer votre mot de passe avant de continuer.
          Vous pouvez également modifier votre email si nécessaire.
        </p>
        
        {message && (
          <div className={`medecin-reset-password-alert medecin-reset-password-alert-${message.type}`}>
            {message.text}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="medecin-reset-password-form">
          <div className="medecin-reset-password-form-group">
            <label htmlFor="email" className="medecin-reset-password-label">Email (optionnel)</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'medecin-reset-password-input medecin-reset-password-input-invalid' : 'medecin-reset-password-input'}
            />
            {errors.email && <div className="medecin-reset-password-feedback-invalid">{errors.email}</div>}
            <small className="medecin-reset-password-text-muted">Vous pouvez modifier votre email ou conserver celui par défaut.</small>
          </div>
          
          <div className="medecin-reset-password-form-group">
            <label htmlFor="nouveauMotDePasse" className="medecin-reset-password-label">Nouveau mot de passe</label>
            <input
              type="password"
              id="nouveauMotDePasse"
              name="nouveauMotDePasse"
              value={formData.nouveauMotDePasse}
              onChange={handleChange}
              className={errors.nouveauMotDePasse ? 'medecin-reset-password-input medecin-reset-password-input-invalid' : 'medecin-reset-password-input'}
            />
            {errors.nouveauMotDePasse && <div className="medecin-reset-password-feedback-invalid">{errors.nouveauMotDePasse}</div>}
          </div>
          
          <div className="medecin-reset-password-form-group">
            <label htmlFor="confirmationMotDePasse" className="medecin-reset-password-label">Confirmer le mot de passe</label>
            <input
              type="password"
              id="confirmationMotDePasse"
              name="confirmationMotDePasse"
              value={formData.confirmationMotDePasse}
              onChange={handleChange}
              className={errors.confirmationMotDePasse ? 'medecin-reset-password-input medecin-reset-password-input-invalid' : 'medecin-reset-password-input'}
            />
            {errors.confirmationMotDePasse && <div className="medecin-reset-password-feedback-invalid">{errors.confirmationMotDePasse}</div>}
          </div>
          
          <button type="submit" className="medecin-reset-password-button" disabled={loading}>
            {loading ? 'Chargement...' : 'Confirmer et continuer'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MedecinResetPasswordFirstLogin;
