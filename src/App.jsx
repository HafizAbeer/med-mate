import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './layouts/Layout';
import { LanguageProvider } from './context/LanguageContext';
import { VoiceProvider } from './context/VoiceContext';
import { AuthProvider, useAuth } from './context/AuthContext';

import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import CaretakerDashboard from './pages/CaretakerDashboard';
import History from './pages/History';
import AddMedicine from './pages/AddMedicine';
import AISuggestions from './pages/AISuggestions';
import Profile from './pages/Profile';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AdminDashboard from './pages/AdminDashboard';
import VoiceFloatingAuth from './components/VoiceFloatingAuth';
import VoiceCommandToast from './components/VoiceCommandToast';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const RoleRoute = ({ children, allowedRoles }) => {
  const { role } = useAuth();
  if (!allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }
  return children;
};

const RoleBasedDashboard = () => {
  const { role } = useAuth();
  if (role === 'admin') return <AdminDashboard />;
  if (role === 'caretaker') return <CaretakerDashboard />;
  return <Dashboard />;
};

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <VoiceProvider>
          <BrowserRouter>
            <VoiceFloatingAuth />
            <VoiceCommandToast />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route index element={<RoleBasedDashboard />} />
                <Route
                  path="add"
                  element={
                    <RoleRoute allowedRoles={['patient', 'caretaker']}>
                      <AddMedicine />
                    </RoleRoute>
                  }
                />
                <Route
                  path="history"
                  element={
                    <RoleRoute allowedRoles={['patient', 'caretaker']}>
                      <History />
                    </RoleRoute>
                  }
                />
                <Route
                  path="suggestions"
                  element={
                    <RoleRoute allowedRoles={['patient', 'caretaker']}>
                      <AISuggestions />
                    </RoleRoute>
                  }
                />
                <Route path="profile" element={<Profile />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </VoiceProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;
