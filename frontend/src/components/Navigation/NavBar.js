import React from 'react';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const NavBar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/connexion');
  };

  // Rendu des liens de navigation selon le rôle
  const renderNavLinks = () => {
    if (!user) return null;

    switch (user.role) {
      case 'admin':
        return (
          <>
            <Nav.Link as={Link} to="/admin/tableau-de-bord">Tableau de Bord</Nav.Link>
            <Nav.Link as={Link} to="/admin/medecins">Gestion des Médecins</Nav.Link>
          </>
        );
      case 'medecin':
        return (
          <>
            {/* Liens vides pour les médecins comme demandé */}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Navbar bg="primary" variant="dark" expand="lg" className="mb-3">
      <Container>
        <Navbar.Brand as={Link} to="/">Gestion des Visites Médicales</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {renderNavLinks()}
          </Nav>
          {user && (
            <Nav>
              <NavDropdown 
                title={`${user.prenom} ${user.nom}`} 
                id="basic-nav-dropdown"
                align="end"
              >
                <NavDropdown.Item as={Link} to="/profil">
                  Mon Profil
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>
                  Déconnexion
                </NavDropdown.Item>
              </NavDropdown>
            </Nav>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavBar;
