import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Loading } from '../common/Loading';

interface LoanApplicationReport {
  id: string;
  application_date: string;
  applicant_name: string;
  applicant_phone: string;
  applicant_email: string;
  animal_type: string;
  animal_breed: string;
  animal_age: string | number;
  loan_amount: number;
  loan_duration: number;
  status: string;
  operator_name: string;
  verification_status: string;
  approved_date?: string;
  rejected_date?: string;
  rejection_reason?: string;
}

interface ManagerPerformance {
  manager_id: string;
  manager_name: string;
  manager_email: string;
  operators_count: number;
  total_applications: number;
  approved_applications: number;
  rejected_applications: number;
  pending_applications: number;
  verified_applications: number;
  total_approved_amount: number;
  approval_rate: number;
  created_date: string;
  last_active: string;
}

interface FinancialSummary {
  total_loan_requests: number;
  total_approved_loans: number;
  total_requested_amount: number;
  total_approved_amount: number;
  approval_rate: number;
  average_loan_amount: number;
  animal_wise_summary: {
    [key: string]: {
      count: number;
      total_amount: number;
      average_amount: number;
    };
  };
  monthly_breakdown: Array<{
    month: string;
    applications: number;
    approved: number;
    amount: number;
  }>;
  generated_at: string;
  period: {
    start_date?: string;
    end_date?: string;
  };
}

export const SystemReports: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'applications' | 'managers' | 'financial'>('applications');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Report data
  const [loanApplications, setLoanApplications] = useState<LoanApplicationReport[]>([]);
  const [managersPerformance, setManagersPerformance] = useState<ManagerPerformance[]>([]);
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null);
  
  // Filters
  const [filters, setFilters] = useState({
    start_date: '',
    end_date: '',
    status: '',
    animal_type: ''
  });

  useEffect(() => {
    loadReports();
  }, [activeTab]);

  const loadReports = async () => {
    setLoading(true);
    setError('');
    
    try {
      switch (activeTab) {
        case 'applications':
          const appsData = await adminAPI.getLoanApplicationsReport(filters);
          setLoanApplications(appsData);
          break;
        case 'managers':
          const managersData = await adminAPI.getManagersPerformanceReport();
          setManagersPerformance(managersData);
          break;
        case 'financial':
          const financialData = await adminAPI.getFinancialSummaryReport(filters);
          setFinancialSummary(financialData);
          break;
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const applyFilters = () => {
    loadReports();
  };

  const exportToCSV = (data: any[], filename: string) => {
    if (!data.length) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        const value = row[header];
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
      }).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'verified':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">System Reports</h2>
        <div className="flex space-x-2">
          {activeTab === 'applications' && (
            <Button
              onClick={() => exportToCSV(loanApplications, 'loan-applications-report')}
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={!loanApplications.length}
            >
              Export Applications
            </Button>
          )}
          {activeTab === 'managers' && (
            <Button
              onClick={() => exportToCSV(managersPerformance, 'managers-performance-report')}
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={!managersPerformance.length}
            >
              Export Performance
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'applications', name: 'Loan Applications', icon: '' },
            { id: 'managers', name: 'Manager Performance', icon: '' },
            { id: 'financial', name: 'Financial Summary', icon: '' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Filters */}
      {(activeTab === 'applications' || activeTab === 'financial') && (
        <Card className="p-4 mb-6">
          <h3 className="text-lg font-semibold mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={filters.start_date}
              onChange={(e) => handleFilterChange('start_date', e.target.value)}
            />
            <Input
              label="End Date"
              type="date"
              value={filters.end_date}
              onChange={(e) => handleFilterChange('end_date', e.target.value)}
            />
            {activeTab === 'applications' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">All Statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="VERIFIED">Verified</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Animal Type</label>
                  <select
                    value={filters.animal_type}
                    onChange={(e) => handleFilterChange('animal_type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">All Animals</option>
                    <option value="cow">Cow</option>
                    <option value="goat">Goat</option>
                    <option value="hen">Hen</option>
                  </select>
                </div>
              </>
            )}
          </div>
          <div className="mt-4">
            <Button onClick={applyFilters} className="bg-green-600 hover:bg-green-700 text-white">
              Apply Filters
            </Button>
          </div>
        </Card>
      )}

      {loading && <Loading size="lg" text="Loading reports..." />}

      {/* Report Content */}
      {!loading && (
        <>
          {/* Loan Applications Report */}
          {activeTab === 'applications' && (
            <Card className="overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b">
                <h3 className="text-lg font-semibold">Loan Applications Report</h3>
                <p className="text-sm text-gray-600">{loanApplications.length} applications found</p>
              </div>
              
              {loanApplications.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Application</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Animal</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loan Details</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Operator</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {loanApplications.map((app) => (
                        <tr key={app.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">#{app.id.slice(-6)}</div>
                            <div className="text-sm text-gray-500">
                              {new Date(app.application_date).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{app.applicant_name}</div>
                            <div className="text-sm text-gray-500">{app.applicant_phone}</div>
                            <div className="text-sm text-gray-500">{app.applicant_email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{app.animal_type}</div>
                            <div className="text-sm text-gray-500">{app.animal_breed}</div>
                            <div className="text-sm text-gray-500">Age: {app.animal_age}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">₹{app.loan_amount.toLocaleString()}</div>
                            <div className="text-sm text-gray-500">{app.loan_duration} months</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(app.status)}`}>
                              {app.status}
                            </span>
                            <div className="text-xs text-gray-500 mt-1">{app.verification_status}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {app.operator_name}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="px-6 py-12 text-center">
                  <div className="text-gray-500">No loan applications found for the selected criteria</div>
                </div>
              )}
            </Card>
          )}

          {/* Managers Performance Report */}
          {activeTab === 'managers' && (
            <div className="space-y-6">
              {managersPerformance.map((manager) => (
                <Card key={manager.manager_id} className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{manager.manager_name}</h3>
                      <p className="text-sm text-gray-600">{manager.manager_email}</p>
                      <p className="text-xs text-gray-500">
                        Created: {manager.created_date ? new Date(manager.created_date).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">{manager.approval_rate}%</div>
                      <div className="text-xs text-gray-500">Approval Rate</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-xl font-semibold text-gray-900">{manager.operators_count}</div>
                      <div className="text-xs text-gray-500">Operators</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-semibold text-gray-900">{manager.total_applications}</div>
                      <div className="text-xs text-gray-500">Total Applications</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-semibold text-green-600">{manager.approved_applications}</div>
                      <div className="text-xs text-gray-500">Approved</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-semibold text-gray-900">₹{manager.total_approved_amount.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">Total Amount</div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-sm font-medium text-yellow-600">{manager.pending_applications}</div>
                      <div className="text-xs text-gray-500">Pending</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-blue-600">{manager.verified_applications}</div>
                      <div className="text-xs text-gray-500">Verified</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-red-600">{manager.rejected_applications}</div>
                      <div className="text-xs text-gray-500">Rejected</div>
                    </div>
                  </div>
                </Card>
              ))}
              
              {managersPerformance.length === 0 && (
                <Card className="p-12 text-center">
                  <div className="text-gray-500">No managers found</div>
                </Card>
              )}
            </div>
          )}

          {/* Financial Summary Report */}
          {activeTab === 'financial' && financialSummary && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-gray-500">Total Requests</h3>
                      <p className="text-2xl font-semibold text-gray-900">{financialSummary.total_loan_requests}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-green-100 text-green-600">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-gray-500">Approved Loans</h3>
                      <p className="text-2xl font-semibold text-gray-900">{financialSummary.total_approved_loans}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-gray-500">Total Disbursed</h3>
                      <p className="text-2xl font-semibold text-gray-900">₹{financialSummary.total_approved_amount.toLocaleString()}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2-2z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-gray-500">Approval Rate</h3>
                      <p className="text-2xl font-semibold text-gray-900">{financialSummary.approval_rate.toFixed(1)}%</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Animal-wise Summary */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Animal-wise Loan Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {Object.entries(financialSummary.animal_wise_summary).map(([animal, data]) => (
                    <div key={animal} className="text-center">
                      <div className="w-16 h-16 mx-auto mb-2 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-lg font-semibold text-green-600 capitalize">
                          {animal.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <h4 className="text-lg font-semibold capitalize">{animal}</h4>
                      <div className="mt-2 space-y-1">
                        <div className="text-sm text-gray-600">Loans: {data.count}</div>
                        <div className="text-sm text-gray-600">Total: ₹{data.total_amount.toLocaleString()}</div>
                        <div className="text-sm text-gray-600">Average: ₹{data.average_amount.toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Monthly Breakdown */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Breakdown (Last 12 Months)</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applications</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Approved</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount Disbursed</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Success Rate</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {financialSummary.monthly_breakdown.map((month, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {month.month}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {month.applications}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                            {month.approved}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ₹{month.amount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {month.applications > 0 ? ((month.approved / month.applications) * 100).toFixed(1) : 0}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
};