import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import './ResetPasswordFirstLogin.css';

const ResetPasswordFirstLogin = () => {
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
    // Si l'utilisateur n'est pas connecté ou n'a pas besoin de réinitialiser son mot de passe
    if (!user || !user.premierConnexion) {
      navigate('/login', { replace: true });
    } else {
      // Pré-remplir l'email avec celui de l'utilisateur
      setFormData(prev => ({ ...prev, email: user.email }));
    }
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
    if (!formData.email || !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)) {
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
      const response = await api.post('/auth/reset-password-first-login', formData);
      setMessage({ type: 'success', text: response.data.message });
      
      // Mettre à jour l'utilisateur dans le contexte
      updateUser({ ...user, premierConnexion: false, email: formData.email });
      
      // Rediriger vers le tableau de bord après 2 secondes
      setTimeout(() => {
        navigate('/admin/tableau-de-bord', { replace: true });
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

  return (
    <div className="reset-password-container">
      <div className="reset-password-card">
        <h2>Réinitialisation du mot de passe</h2>
        <p>Vous devez changer votre mot de passe avant de continuer.</p>
        
        {message && (
          <div className={`alert alert-${message.type}`}>
            {message.text}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'is-invalid' : ''}
            />
            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="nouveauMotDePasse">Nouveau mot de passe</label>
            <input
              type="password"
              id="nouveauMotDePasse"
              name="nouveauMotDePasse"
              value={formData.nouveauMotDePasse}
              onChange={handleChange}
              className={errors.nouveauMotDePasse ? 'is-invalid' : ''}
            />
            {errors.nouveauMotDePasse && <div className="invalid-feedback">{errors.nouveauMotDePasse}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmationMotDePasse">Confirmer le mot de passe</label>
            <input
              type="password"
              id="confirmationMotDePasse"
              name="confirmationMotDePasse"
              value={formData.confirmationMotDePasse}
              onChange={handleChange}
              className={errors.confirmationMotDePasse ? 'is-invalid' : ''}
            />
            {errors.confirmationMotDePasse && <div className="invalid-feedback">{errors.confirmationMotDePasse}</div>}
          </div>
          
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Chargement...' : 'Réinitialiser le mot de passe'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordFirstLogin;