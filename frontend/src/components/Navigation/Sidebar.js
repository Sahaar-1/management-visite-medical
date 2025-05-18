import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FaUserMd, FaUsers, FaCalendarAlt, FaSignOutAlt, FaChartBar, FaUser } from 'react-icons/fa';
import './Sidebar.css';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname.includes(path) ? 'active' : '';
  };

  return (
    <div className="sidebar">
     
      <div className="sidebar-user">
        <div className="user-info">
          <span>{user?.nom} {user?.prenom}</span>
          <small>{user?.role}</small>
        </div>
      </div>
      <ul className="sidebar-menu">
        {user?.role === 'admin' && (
          <>
            <li className={isActive('/admin/tableau-de-bord')}>
              <Link to="/admin/tableau-de-bord">
                <FaChartBar />
                <span>Tableau de bord</span>
              </Link>
            </li>
            <li className={isActive('/admin/medecins')}>
              <Link to="/admin/medecins">
                <FaUserMd />
                <span>Médecins</span>
              </Link>
            </li>
            <li className={isActive('/admin/employes')}>
              <Link to="/admin/employes">
                <FaUsers />
                <span>Employés</span>
              </Link>
            </li>
            <li className={isActive('/admin/rendez-vous')}>
              <Link to="/admin/rendez-vous">
                <FaCalendarAlt />
                <span>Rendez-vous</span>
              </Link>
            </li>
          </>
        )}
        
        {user?.role === 'medecin' && (
          <li className={isActive('/medecin/employes')}>
            <Link to="/medecin/employes">
              <FaUsers />
              <span>Employés</span>
            </Link>
          </li>
        )}
        
        <li className={isActive('/profil')}>
          <Link to="/profil">
            <FaUser />
            <span>Mon profil</span>
          </Link>
        </li>
        
        <li>
          <Link to="#" onClick={logout}>
            <FaSignOutAlt />
            <span>Déconnexion</span>
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
