import React from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { adminAPI } from '../../services/api';
import { Loading } from '../common/Loading';
import { ManagerManagement } from './ManagerManagement';
import { SystemAnalytics } from './SystemAnalytics';
import { SystemReports } from './SystemReports';
import { FarmStoryAnimation } from '../common/FarmStoryAnimation';

export const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex relative z-10">
        {/* Fixed Sidebar */}
        <div className="fixed left-0 top-8 w-64 bg-white/90 backdrop-blur-lg shadow-lg h-screen overflow-y-auto z-50">
          <div className="p-4 border-b border-gray-200">
            {/* <h1 className="text-xl font-bold text-gray-900">Admin Portal</h1>
            <p className="text-sm text-gray-600">Loan Management System</p> */}
          </div>
          
          <nav className="mt-6">
            <div className="px-4">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
                Administration
              </h2>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/admin"
                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-700 transition-colors"
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/managers"
                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-700 transition-colors"
                  >
                     Managers
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/analytics"
                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-700 transition-colors"
                  >
                    Analytics
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/reports"
                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-700 transition-colors"
                  >
                     Reports
                  </Link>
                </li>
              </ul>
            </div>
            
            <div className="px-4 mt-8 border-t border-gray-200 pt-6">
              <div className="flex items-center px-3 py-2 text-sm text-gray-600">
                <span className="flex-1">Welcome, {user?.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="w-full mt-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 rounded-md transition-colors"
              >
                 Logout
              </button>
            </div>

            {/* Farm Story Animation in Sidebar */}
            <div className="px-4 mt-6">
              <FarmStoryAnimation />
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 ml-64">
          <div className="p-6">
            <Routes>
              <Route index element={<AdminHome />} />
              <Route path="managers" element={<ManagerManagement />} />
              <Route path="analytics" element={<SystemAnalytics />} />
              <Route path="reports" element={<SystemReports />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
}
const AdminHome: React.FC = () => {
  const [stats, setStats] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await adminAPI.getSystemStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to load stats:', error);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading) return <Loading />;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">System overview and management</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              👥
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Managers</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.managers || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              🏢
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Operators</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.operators || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              📄
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Applications</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.applications || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100 text-orange-600">
              ✅
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Verified Apps</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.verified || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">System Activity</h3>
        </div>
        <div className="p-6">
          <p className="text-gray-600">System running smoothly. All services operational.</p>
          <div className="mt-4 space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <span className="w-3 h-3 bg-green-400 rounded-full mr-3"></span>
              Database connection: Active
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <span className="w-3 h-3 bg-green-400 rounded-full mr-3"></span>
              API services: Running
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <span className="w-3 h-3 bg-green-400 rounded-full mr-3"></span>
              File upload system: Operational
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
