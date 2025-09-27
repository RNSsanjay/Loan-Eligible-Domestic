import React from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { OperatorManagement } from './OperatorManagement';
import { ApplicationReview } from './ApplicationReview';
import { ManagerReports } from './ManagerReports';

export const ManagerDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="flex relative z-10">
        {/* Sidebar */}
        <div className="w-64 bg-white/80 backdrop-blur-lg shadow-sm h-screen">
          <nav className="mt-8">
            <div className="px-4">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
                Management
              </h2>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/manager"
                    className="block px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-green-50 hover:text-green-700"
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    to="/manager/operators"
                    className="block px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-green-50 hover:text-green-700"
                  >
                    Manage Operators
                  </Link>
                </li>
                <li>
                  <Link
                    to="/manager/applications"
                    className="block px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-green-50 hover:text-green-700"
                  >
                    Review Applications
                  </Link>
                </li>
                <li>
                  <Link
                    to="/manager/reports"
                    className="block px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-green-50 hover:text-green-700"
                  >
                    Reports
                  </Link>
                </li>
              </ul>
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <Routes>
            <Route path="/" element={<ManagerHome />} />
            <Route path="/operators" element={<OperatorManagement />} />
            <Route path="/applications" element={<ApplicationReview />} />
            <Route path="/reports" element={<ManagerReports />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

const ManagerHome: React.FC = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Manager Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Operators</h3>
              <p className="text-2xl font-semibold text-gray-900">-</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Pending Review</h3>
              <p className="text-2xl font-semibold text-gray-900">-</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Approved This Month</h3>
              <p className="text-2xl font-semibold text-gray-900">-</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Loan Amount</h3>
              <p className="text-2xl font-semibold text-gray-900">₹-</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Manager Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/manager/operators"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
          >
            <div className="text-center">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h4 className="font-medium text-gray-900">Manage Operators</h4>
              <p className="text-sm text-gray-500 mt-1">Create and manage operators</p>
            </div>
          </Link>

          <Link
            to="/manager/applications"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
          >
            <div className="text-center">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h4 className="font-medium text-gray-900">Review Applications</h4>
              <p className="text-sm text-gray-500 mt-1">Approve loan applications</p>
            </div>
          </Link>

          <Link
            to="/manager/reports"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
          >
            <div className="text-center">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2-2z" />
              </svg>
              <h4 className="font-medium text-gray-900">View Reports</h4>
              <p className="text-sm text-gray-500 mt-1">Analytics and reports</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};