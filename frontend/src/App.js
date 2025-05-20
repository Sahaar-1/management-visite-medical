import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { useSecureNavigation } from './hooks/useSecureNavigation';
import Sidebar from './components/Navigation/Sidebar';
import './styles/App.css';

function App() {
  const { user } = useAuth();
  const location = useLocation();
  useSecureNavigation(); // Ajout du hook

  // Ne pas afficher la Sidebar sur les pages de connexion et d'inscription
  const showSidebar = !['connexion', 'inscription'].includes(
    location.pathname.split('/')[1]
  );

  return (
    <div className="App">
      {showSidebar && user && <Sidebar />}
      <div className={showSidebar && user ? 'main-content' : ''}>
        <Outlet />
      </div>
    </div>
  );
}

export default App;
