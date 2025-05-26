import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  FaHeartbeat, FaChartBar, FaUserMd, FaUsers,
  FaCalendarAlt, FaUser, FaSignOutAlt, FaBars,
  FaStethoscope, FaBell, FaHistory
} from 'react-icons/fa';
import './Sidebar.css';
import '../Admin/ModernDashboard.css';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isActive = (path) => {
    return location.pathname.includes(path) ? 'active' : '';
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // Get first letter of first and last name for avatar
  const getInitials = () => {
    if (!user?.nom || !user?.prenom) return 'U';
    return `${user.prenom.charAt(0)}${user.nom.charAt(0)}`.toUpperCase();
  };

  return (
    <>
      {isMobile && (
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          <FaBars />
        </button>
      )}

      <div className={`sidebar ${isMobile && isOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon health-icon">
            <FaHeartbeat />
          </div>
          <h2>MedVisit</h2>
        </div>

        <div className="sidebar-user">
          <div className="user-avatar">
            {getInitials()}
          </div>
          <div className="user-info">
            <span>{user?.nom} {user?.prenom}</span>
            <small>{user?.role}</small>
          </div>
        </div>

        <ul className="sidebar-menu">
          {user?.role === 'admin' && (
            <>
              <li className={isActive('/admin/tableau-de-bord')}>
                <Link to="/admin/tableau-de-bord" data-title="Tableau de bord">
                  <FaChartBar />
                  <span>Tableau de bord</span>
                </Link>
              </li>
              <li className={isActive('/admin/medecins')}>
                <Link to="/admin/medecins" data-title="Médecins">
                  <FaUserMd />
                  <span>Médecins</span>
                </Link>
              </li>
              <li className={isActive('/admin/employes')}>
                <Link to="/admin/employes" data-title="Employés">
                  <FaUsers />
                  <span>Employés</span>
                </Link>
              </li>
              <li className={isActive('/admin/rendez-vous')}>
                <Link to="/admin/rendez-vous" data-title="Rendez-vous">
                  <FaCalendarAlt />
                  <span>Rendez-vous</span>
                </Link>
              </li>
              <li className={isActive('/admin/notifications')}>
                <Link to="/admin/notifications" data-title="Notifications">
                  <FaBell />
                  <span>Notifications</span>
                </Link>
              </li>
            </>
          )}

          {user?.role === 'medecin' && (
            <>
              <li className={isActive('/medecin/dashboard')}>
                <Link to="/medecin/dashboard" data-title="Tableau de bord">
                  <FaChartBar />
                  <span>Tableau de bord</span>
                </Link>
              </li>
              <li className={isActive('/medecin/employes')}>
                <Link to="/medecin/employes" data-title="Employés">
                  <FaStethoscope />
                  <span>Employés</span>
                </Link>
              </li>

              <li className={isActive('/medecin/historique')}>
                <Link to="/medecin/historique" data-title="Historique">
                  <FaHistory />
                  <span>Historique</span>
                </Link>
              </li>
            </>
          )}

          <li className={isActive('/profil')}>
            <Link to="/profil" data-title="Mon profil">
              <FaUser />
              <span>Mon profil</span>
            </Link>
          </li>

          <li>
            <Link to="#" onClick={logout} data-title="Déconnexion">
              <FaSignOutAlt />
              <span>Déconnexion</span>
            </Link>
          </li>
        </ul>
      </div>
    </>
  );
};

export default Sidebar;
