import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/axiosConfig';

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
  const login = async (email, motDePasse, role) => {
    try {
      if (!email || !motDePasse || !role) {
        throw new Error('Email, mot de passe et rôle sont requis');
      }

      const response = await api.post('/auth/connexion', {
        email,
        motDePasse,
        role
      });

      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setUser(user);
      setError(null);
      return user;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erreur de connexion';
      setError(errorMessage);
      throw new Error(errorMessage);
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
      const response = await api.put('/auth/profil', donneesProfil);
      setUser(response.data.utilisateur);
      setError(null);
      return response.data.utilisateur;
    } catch (error) {
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
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;