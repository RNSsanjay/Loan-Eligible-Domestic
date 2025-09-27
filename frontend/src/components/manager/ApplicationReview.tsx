import React, { useState, useEffect } from 'react';
import { managerAPI } from '../../services/api';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Loading } from '../common/Loading';

interface ApplicationWithDetails {
  id?: string;
  applicant_id: string;
  animal_id: string;
  loan_amount: number;
  purpose: string;
  repayment_period: number;
  application_number?: string;
  status: 'pending' | 'verified' | 'approved' | 'rejected';
  operator_id: string;
  manager_id?: string;
  created_at?: string;
  updated_at?: string;
  applicant?: Array<{
    name: string;
    email?: string;
    phone: string;
    address: string;
    aadhar_number: string;
    annual_income: number;
    bank_name: string;
  }>;
  animal?: Array<{
    type: string;
    breed: string;
    age: number;
    weight: number;
    health_status: string;
    market_value: number;
  }>;
  operator?: Array<{
    name: string;
    email: string;
  }>;
  verification_checklist?: {
    items: Array<{
      item: string;
      status: boolean;
      notes?: string;
    }>;
    overall_status: boolean;
  };
}

export const ApplicationReview: React.FC = () => {
  const [applications, setApplications] = useState<ApplicationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string>('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified' | 'approved' | 'rejected'>('all');
  const [selectedApp, setSelectedApp] = useState<ApplicationWithDetails | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const data = await managerAPI.getLoanApplications();
      setApplications(data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (appId: string) => {
    if (!confirm('Are you sure you want to approve this loan application?')) {
      return;
    }

    try {
      setActionLoading(appId);
      await managerAPI.approveLoanApplication(appId);
      setSuccess('Application approved successfully');
      loadApplications();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to approve application');
    } finally {
      setActionLoading('');
    }
  };

  const handleReject = async () => {
    if (!selectedApp || !rejectReason.trim()) {
      setError('Please provide a rejection reason');
      return;
    }

    try {
      setActionLoading(selectedApp.id || '');
      await managerAPI.rejectLoanApplication(selectedApp.id!, rejectReason);
      setSuccess('Application rejected successfully');
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedApp(null);
      loadApplications();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to reject application');
    } finally {
      setActionLoading('');
    }
  };

  const openRejectModal = (app: ApplicationWithDetails) => {
    setSelectedApp(app);
    setShowRejectModal(true);
    setRejectReason('');
  };

  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true;
    return app.status === filter;
  });

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: 'bg-green-100 text-green-800',
      verified: 'bg-green-200 text-green-900',
      approved: 'bg-green-300 text-green-900',
      rejected: 'bg-gray-100 text-gray-800'
    };
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  if (loading) {
    return <Loading size="lg" text="Loading applications..." />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Loan Application Review</h2>
        <div className="flex space-x-2">
          {['all', 'pending', 'verified', 'approved', 'rejected'].map((status) => (
            <Button
              key={status}
              onClick={() => setFilter(status as any)}
              variant={filter === status ? 'primary' : 'secondary'}
              size="sm"
              className={`capitalize ${
                filter === status
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {status} ({applications.filter(app => status === 'all' || app.status === status).length})
            </Button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-green-50 border border-green-300 text-green-700 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}

      {filteredApplications.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="text-gray-500">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Found</h3>
            <p className="text-gray-500">No loan applications match the selected filter.</p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-6">
          {filteredApplications.map((application) => (
            <Card key={application.id} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {application.application_number}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadge(application.status)}`}>
                      {application.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Applied on: {new Date(application.created_at!).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-900">
                    {formatCurrency(application.loan_amount)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {application.repayment_period} months
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {/* Applicant Info */}
                <div className="bg-gray-50 p-3 rounded">
                  <h4 className="font-medium text-gray-900 mb-2">Applicant</h4>
                  {application.applicant && application.applicant[0] ? (
                    <div className="text-sm text-gray-600">
                      <p className="font-medium truncate max-w-[200px]" title={application.applicant[0].name}>{application.applicant[0].name}</p>
                      <p>{application.applicant[0].phone}</p>
                      <p>{formatCurrency(application.applicant[0].annual_income)} /year</p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No applicant details</p>
                  )}
                </div>

                {/* Animal Info */}
                <div className="bg-gray-50 p-3 rounded">
                  <h4 className="font-medium text-gray-900 mb-2">Animal</h4>
                  {application.animal && application.animal[0] ? (
                    <div className="text-sm text-gray-600">
                      <p className="font-medium capitalize">{application.animal[0].type} - {application.animal[0].breed}</p>
                      <p>{application.animal[0].age} years, {application.animal[0].weight}kg</p>
                      <p>Value: {formatCurrency(application.animal[0].market_value)}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No animal details</p>
                  )}
                </div>

                {/* Operator Info */}
                <div className="bg-gray-50 p-3 rounded">
                  <h4 className="font-medium text-gray-900 mb-2">Operator</h4>
                  {application.operator && application.operator[0] ? (
                    <div className="text-sm text-gray-600">
                      <p className="font-medium truncate max-w-[180px]" title={application.operator[0].name}>{application.operator[0].name}</p>
                      <p className="text-sm text-gray-600 truncate max-w-[180px]" title={application.operator[0].email}>{application.operator[0].email}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No operator details</p>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Purpose</h4>
                <p className="text-sm text-gray-600">{application.purpose}</p>
              </div>

              {/* Verification Status */}
              {application.verification_checklist && (
                <div className="mb-4 bg-green-50 p-3 rounded">
                  <h4 className="font-medium text-gray-900 mb-2">Verification Status</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    {application.verification_checklist.items?.map((item, index) => (
                      <div key={index} className="flex items-center space-x-1">
                        {item.status ? (
                          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        )}
                        <span className={item.status ? 'text-green-700' : 'text-gray-700'}>
                          {item.item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
                <Button
                  onClick={() => {
                    setSelectedApp(application);
                    setShowDetails(true);
                  }}
                  variant="secondary"
                  size="sm"
                >
                  View Details
                </Button>
                
                {application.status === 'verified' && (
                  <>
                    <Button
                      onClick={() => openRejectModal(application)}
                      variant="danger"
                      size="sm"
                      loading={actionLoading === application.id}
                    >
                      Reject
                    </Button>
                    <Button
                      onClick={() => handleApprove(application.id!)}
                      className="bg-green-600 hover:bg-green-700 text-white"
                      size="sm"
                      loading={actionLoading === application.id}
                    >
                      Approve
                    </Button>
                  </>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedApp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Reject Application
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Application: {selectedApp.application_number}
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rejection Reason *
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                placeholder="Please provide a detailed reason for rejection..."
                required
              />
            </div>
            <div className="flex justify-end space-x-3">
              <Button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                  setSelectedApp(null);
                }}
                variant="secondary"
              >
                Cancel
              </Button>
              <Button
                onClick={handleReject}
                variant="danger"
                loading={actionLoading === selectedApp.id}
              >
                Reject Application
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetails && selectedApp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Application Details - {selectedApp.application_number}
              </h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Detailed view content would go here */}
            <div className="space-y-6">
              {/* Application Info */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-3">Loan Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Loan Amount</p>
                    <p className="font-semibold">{formatCurrency(selectedApp.loan_amount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Repayment Period</p>
                    <p className="font-semibold">{selectedApp.repayment_period} months</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Purpose</p>
                    <p className="font-semibold">{selectedApp.purpose}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadge(selectedApp.status)}`}>
                      {selectedApp.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Close button */}
              <div className="flex justify-end">
                <Button
                  onClick={() => setShowDetails(false)}
                  variant="secondary"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};