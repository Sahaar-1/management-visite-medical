import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FaTachometerAlt, 
  FaUserMd, 
  FaUsers, 
  FaUserCircle, 
  FaSignOutAlt
} from 'react-icons/fa';
import './Sidebar.css';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const handleLogout = () => {
    logout();
  };

  // Check if the current path matches the link
  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };

  // Render navigation links based on user role
  const renderNavLinks = () => {
    if (!user) return null;

    switch (user.role) {
      case 'admin':
        return (
          <>
            <li className={isActive('/admin/tableau-de-bord') ? 'active' : ''}>
              <Link to="/admin/tableau-de-bord">
                <FaTachometerAlt />
                <span>Tableau de Bord</span>
              </Link>
            </li>
            <li className={isActive('/admin/medecins') ? 'active' : ''}>
              <Link to="/admin/medecins">
                <FaUserMd />
                <span>Gestion des Médecins</span>
              </Link>
            </li>
            <li className={isActive('/admin/employes') ? 'active' : ''}>
              <Link to="/admin/employes">
                <FaUsers />
                <span>Gestion des Employés</span>
              </Link>
            </li>
          </>
        );
      case 'medecin':
        return (
          <>
            <li className={isActive('/medecin/employes') ? 'active' : ''}>
              <Link to="/medecin/employes">
                <FaUsers />
                <span>Liste des Employés</span>
              </Link>
            </li>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h3>Visites Médicales</h3>
      </div>
      
      <div className="sidebar-content">
        <ul className="sidebar-menu">
          {renderNavLinks()}
        </ul>
      </div>
      
      <div className="sidebar-footer">
        <ul className="sidebar-menu">
          <li className={isActive('/profil') ? 'active' : ''}>
            <Link to="/profil">
              <FaUserCircle />
              <span>Mon Profil</span>
            </Link>
          </li>
          <li>
            <button className="sidebar-logout-btn" onClick={handleLogout}>
              <FaSignOutAlt />
              <span>Déconnexion</span>
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
