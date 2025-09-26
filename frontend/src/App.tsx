import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './components/common/Login';
import { Loading } from './components/common/Loading';
import { OperatorDashboard } from '../src/components/operator/OperatorDashboard';
import { ManagerDashboard } from '../src/components/manager/ManagerDashboard';
import { AdminDashboard } from '../src/components/admin/AdminDashboard';

const AppRoutes: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loading size="lg" text="Loading application..." />;
  }

  if (!user) {
    return <Login onLoginSuccess={() => window.location.reload()} />;
  }

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          user.role === 'admin' ? <Navigate to="/admin" replace /> :
          user.role === 'manager' ? <Navigate to="/manager" replace /> :
          user.role === 'operator' ? <Navigate to="/operator" replace /> :
          <Navigate to="/login" replace />
        } 
      />
      
      <Route 
        path="/operator/*" 
        element={user.role === 'operator' ? <OperatorDashboard /> : <Navigate to="/" replace />} 
      />
      
      <Route 
        path="/manager/*" 
        element={user.role === 'manager' ? <ManagerDashboard /> : <Navigate to="/" replace />} 
      />
      
      <Route 
        path="/admin/*" 
        element={user.role === 'admin' ? <AdminDashboard /> : <Navigate to="/" replace />} 
      />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
