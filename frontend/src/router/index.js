import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from '../App';
import Connexion from '../components/Auth/Connexion';
import Profil from '../components/Auth/Profil';
import ResetPasswordFirstLogin from '../components/Auth/ResetPasswordFirstLogin';
import MedecinResetPasswordFirstLogin from '../components/Medecin/MedecinResetPasswordFirstLogin';
import GestionMedecins from '../components/Admin/GestionMedecins';
import GestionEmployes from '../components/Admin/GestionEmployes';
import GestionRendezVous from '../components/Admin/GestionRendezVous';
import TableauDeBordAdmin from '../components/Admin/TableauDeBordAdmin';
import AdminNotifications from '../components/Admin/Notifications';
import ListeEmployes from '../components/Medecin/ListeEmployes';
import HistoriqueConsultations from '../components/Medecin/HistoriqueConsultations';
import TableauDeBordMedecin from '../components/Medecin/TableauDeBordMedecin';
import ProtectedRoute from '../components/Auth/ProtectedRoute';

const routes = [
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '/',
        element: <Navigate to="/connexion" replace />,
        index: true
      },
      {
        path: 'connexion',
        element: <Connexion />
      },
      {
        path: 'reset-password-first-login',
        element: <ResetPasswordFirstLogin />
      },
      {
        path: 'medecin-reset-password-first-login',
        element: <ProtectedRoute allowedRoles={['medecin']}><MedecinResetPasswordFirstLogin /></ProtectedRoute>
      },
      {
        path: 'profil',
        element: <ProtectedRoute><Profil /></ProtectedRoute>
      },
      {
        path: 'admin',
        element: <ProtectedRoute allowedRoles={['admin']} />,
        children: [
          {
            path: 'tableau-de-bord',
            element: <TableauDeBordAdmin />
          },
          {
            path: 'medecins',
            element: <GestionMedecins />
          },
          {
            path: 'employes',
            element: <GestionEmployes />
          },
          {
            path: 'rendez-vous',
            element: <GestionRendezVous />
          },
          {
            path: 'notifications',
            element: <AdminNotifications />
          }
        ]
      },
      {
        path: 'medecin',
        element: <ProtectedRoute allowedRoles={['medecin']} />,
        children: [
          {
            path: 'dashboard',
            element: <TableauDeBordMedecin />
          },
          {
            path: 'employes',
            element: <ListeEmployes />
          },

          {
            path: 'historique',
            element: <HistoriqueConsultations />
          }
        ]
      }
    ]
  }
];

export const router = createBrowserRouter(routes, {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
});
