import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const RedirectBasedOnRole = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      // Rediriger en fonction du rôle
      switch (user.role) {
        case 'admin':
          navigate('/admin/tableau-de-bord', { replace: true });
          break;
        case 'medecin':
          navigate('/medecin/employes', { replace: true });
          break;
        default:
          navigate('/connexion', { replace: true });
      }
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/connexion" replace />;
  }

  // Ce retour ne sera jamais affiché car la redirection se fait dans useEffect
  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Redirection...</span>
      </div>
    </div>
  );
};

export default RedirectBasedOnRole;