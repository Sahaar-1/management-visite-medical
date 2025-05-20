import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ResetPasswordFirstLogin from './components/Auth/ResetPasswordFirstLogin';
// Autres imports...

const AppRoutes = () => {
  return (
    <Routes>
      {/* Autres routes */}
      <Route path="/reset-password-first-login" element={<ResetPasswordFirstLogin />} />
    </Routes>
  );
};

export default AppRoutes;