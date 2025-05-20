import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/axiosConfig';
// import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext(null);

// Hook personnalisé pour utiliser le contexte d'authentification
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // const navigate = useNavigate();

  // Ajouter cette fonction pour mettre à jour l'utilisateur
  const updateUser = (userData) => {
    setUser(userData);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      chargerProfil();
    } else {
      setLoading(false);
    }
  }, []);

  const chargerProfil = async () => {
    try {
      const response = await api.get('/auth/profil');
      setUser(response.data);
      setError(null);
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
      localStorage.removeItem('token');
      setUser(null);
      setError(error.response?.data?.message || 'Erreur de chargement du profil');
    } finally {
      setLoading(false);
    }
  };
  const login = async (email, motDePasse) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post('/auth/connexion', { email, motDePasse });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      setUser(user);
      
      // Vérifier si c'est la première connexion
      if (user.premierConnexion) {
        if (user.role === 'medecin') {
          // Utiliser la nouvelle route pour les médecins
          return { ...user, redirectTo: '/medecin-reset-password-first-login' };
        } else {
          // Route existante pour les admins
          return { ...user, redirectTo: '/reset-password-first-login' };
        }
      }
      
      // Redirection normale selon le rôle
      if (user.role === 'admin') {
        return { ...user, redirectTo: '/admin/tableau-de-bord' };
      } else if (user.role === 'medecin') {
        return { ...user, redirectTo: '/medecin/employes' };
      }
      
      return user;
    } catch (error) {
      console.error('Erreur de connexion:', error);
      setError(error.response?.data?.message || 'Identifiants incorrects');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setError(null);
    window.location.href = '/connexion';
  };

  const updateProfil = async (donneesProfil) => {
    try {
      console.log('Données reçues dans updateProfil:', donneesProfil);
      
      // S'assurer que le téléphone est envoyé correctement
      const dataToSend = {
        ...donneesProfil,
        telephone: donneesProfil.telephone || '' // Envoyer une chaîne vide si null ou undefined
      };
      
      console.log('Données à envoyer au serveur:', dataToSend);
      
      const response = await api.put('/auth/profil', dataToSend);
      console.log('Réponse du serveur:', response.data);
      
      // Mettre à jour l'utilisateur dans le contexte
      setUser(response.data.utilisateur);
      setError(null);
      
      return response.data.utilisateur;
    } catch (error) {
      console.error('Erreur détaillée:', error.response?.data || error);
      const errorMessage = error.response?.data?.message || 'Erreur de mise à jour du profil';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    updateProfil,
    chargerProfil,
    updateUser, // Ajouter cette fonction
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
