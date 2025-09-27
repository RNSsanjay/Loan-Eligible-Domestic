import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LandingPage } from './pages/LandingPage';
import { Login } from './components/common/Login';
import { Loading } from './components/common/Loading';
import { Navbar } from './components/common/Navbar';
import { AnimatedBackground } from './components/common/AnimatedBackground';
import { ProfilePage } from './components/common/ProfilePage';
import { HelpPage } from './components/common/HelpPage';
import { OperatorDashboard } from '../src/components/operator/OperatorDashboard';
import { ManagerDashboard } from '../src/components/manager/ManagerDashboard';
import { AdminDashboard } from '../src/components/admin/AdminDashboard';

const AppRoutes: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen relative">
        <AnimatedBackground />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <Loading size="lg" text="Loading application..." />
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={!user ? <LandingPage /> : (
        user.role === 'admin' ? <Navigate to="/admin" replace /> :
        user.role === 'manager' ? <Navigate to="/manager" replace /> :
        user.role === 'operator' ? <Navigate to="/operator" replace /> :
        <Navigate to="/login" replace />
      )} />
      
      <Route path="/login" element={!user ? <Login onLoginSuccess={() => {}} /> : <Navigate to="/" replace />} />
      
      <Route path="/profile" element={user ? <ProfilePage /> : <Navigate to="/login" replace />} />
      <Route path="/help" element={user ? <HelpPage /> : <Navigate to="/login" replace />} />
      
      <Route 
        path="/operator/*" 
        element={user?.role === 'operator' ? <OperatorDashboard /> : <Navigate to="/" replace />} 
      />
      
      <Route 
        path="/manager/*" 
        element={user?.role === 'manager' ? <ManagerDashboard /> : <Navigate to="/" replace />} 
      />
      
      <Route 
        path="/admin/*" 
        element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/" replace />} 
      />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen relative">
          <AnimatedBackground />
          <div className="relative z-10">
            <Navbar />
            <AppRoutes />
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
