import React from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { CreateApplicant } from '../operator/CreateApplicant';
import { CreateAnimal } from '../operator/CreateAnimal';
import { CreateLoanApplication } from '../operator/CreateLoanApplication';
import { LoanApplicationsList } from '../operator/LoanApplicationsList';
import { VerifyLoanApplication } from '../operator/VerifyLoanApplication';

export const OperatorDashboard: React.FC = () => {
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
                Loan Management
              </h2>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/operator"
                    className="block px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-green-50 hover:text-green-700"
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    to="/operator/create-applicant"
                    className="block px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-green-50 hover:text-green-700"
                  >
                    Create Applicant
                  </Link>
                </li>
                <li>
                  <Link
                    to="/operator/create-animal"
                    className="block px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-green-50 hover:text-green-700"
                  >
                    Add Animal Details
                  </Link>
                </li>
                <li>
                  <Link
                    to="/operator/create-loan"
                    className="block px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-green-50 hover:text-green-700"
                  >
                    Create Loan Application
                  </Link>
                </li>
                <li>
                  <Link
                    to="/operator/applications"
                    className="block px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-green-50 hover:text-green-700"
                  >
                    View Applications
                  </Link>
                </li>
              </ul>
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <Routes>
            <Route path="/" element={<OperatorHome />} />
            <Route path="/create-applicant" element={<CreateApplicant />} />
            <Route path="/create-animal" element={<CreateAnimal />} />
            <Route path="/create-loan" element={<CreateLoanApplication />} />
            <Route path="/applications" element={<LoanApplicationsList />} />
            <Route path="/verify/:id" element={<VerifyLoanApplication />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

const OperatorHome: React.FC = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Operator Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Applicants</h3>
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
              <h3 className="text-sm font-medium text-gray-500">Applications</h3>
              <p className="text-2xl font-semibold text-gray-900">-</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Pending</h3>
              <p className="text-2xl font-semibold text-gray-900">-</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Verified</h3>
              <p className="text-2xl font-semibold text-gray-900">-</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/operator/create-applicant"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
          >
            <div className="text-center">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <h4 className="font-medium text-gray-900">Create New Applicant</h4>
              <p className="text-sm text-gray-500 mt-1">Add applicant details</p>
            </div>
          </Link>

          <Link
            to="/operator/create-animal"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
          >
            <div className="text-center">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <h4 className="font-medium text-gray-900">Add Animal Details</h4>
              <p className="text-sm text-gray-500 mt-1">Record animal information</p>
            </div>
          </Link>

          <Link
            to="/operator/create-loan"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
          >
            <div className="text-center">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <h4 className="font-medium text-gray-900">Create Application</h4>
              <p className="text-sm text-gray-500 mt-1">Submit loan application</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};