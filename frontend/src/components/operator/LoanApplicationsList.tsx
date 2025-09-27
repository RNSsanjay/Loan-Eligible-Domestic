import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { operatorAPI } from '../../services/api';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Loading } from '../common/Loading';
import type { LoanApplication } from '../../types';

export const LoanApplicationsList: React.FC = () => {
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const data = await operatorAPI.getLoanApplications();
        setApplications(data);
      } catch (error: any) {
        setError('Failed to load loan applications');
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      pending: 'bg-green-100 text-green-800',
      verified: 'bg-green-200 text-green-900',
      approved: 'bg-green-300 text-green-900',
      rejected: 'bg-gray-100 text-gray-800'
    };

    // Handle undefined or null status
    const safeStatus = status || 'pending';
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses[safeStatus as keyof typeof statusClasses] || 'bg-gray-100 text-gray-800'}`}>
        {safeStatus.charAt(0).toUpperCase() + safeStatus.slice(1)}
      </span>
    );
  };

  if (loading) {
    return <Loading size="lg" text="Loading loan applications..." />;
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Loan Applications</h2>
          <p className="text-gray-600">Manage and track your loan applications</p>
        </div>
        <Link to="/operator/create-loan">
          <Button>Create New Application</Button>
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-green-50 border border-green-300 rounded-md">
          <p className="text-green-700 text-sm">{error}</p>
        </div>
      )}

      {applications.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
            <p className="text-gray-600 mb-4">Get started by creating your first loan application</p>
            <Link to="/operator/create-loan">
              <Button>Create Application</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <Card key={app.id || app.application_number} className="hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Application #{app.application_number || 'N/A'}
                    </h3>
                    {getStatusBadge(app.status)}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Applicant:</span><br />
                      {(app.applicant as any)?.[0]?.name || 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium">Animal:</span><br />
                      {(app.animal as any)?.[0]?.type || 'N/A'} - {(app.animal as any)?.[0]?.breed || 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium">Loan Amount:</span><br />
                      ₹{(app.loan_amount || 0).toLocaleString()}
                    </div>
                    <div>
                      <span className="font-medium">Created:</span><br />
                      {app.created_at ? new Date(app.created_at).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                  
                  <div className="mt-3 text-sm text-gray-600">
                    <span className="font-medium">Purpose:</span> {app.purpose || 'N/A'}
                  </div>
                </div>
                
                <div className="ml-6 flex flex-col space-y-2">
                  {(app.status === 'pending' || !app.status) && app.id && (
                    <Link to={`/operator/verify/${app.id}`}>
                      <Button size="sm">Verify Application</Button>
                    </Link>
                  )}
                  {app.status === 'verified' && (
                    <span className="text-sm text-green-600 font-medium">
                      Awaiting Manager Approval
                    </span>
                  )}
                  {app.status === 'approved' && (
                    <span className="text-sm text-green-600 font-medium">
                      ✓ Loan Approved
                    </span>
                  )}
                  {app.status === 'rejected' && (
                    <span className="text-sm text-gray-600 font-medium">
                      ✗ Application Rejected
                    </span>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};