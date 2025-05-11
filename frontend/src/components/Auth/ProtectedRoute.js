import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

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
    // Stocker l'URL actuelle pour rediriger après la connexion
    return <Navigate to="/connexion" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Rediriger vers la page appropriée selon le rôle
    const defaultPath = user.role === 'admin' ? '/admin/tableau-de-bord' : '/medecin/employes';
    return <Navigate to={defaultPath} replace />;
  }
  return (
    <div>
      {children || <Outlet />}
    </div>
  );
};

export default ProtectedRoute;
