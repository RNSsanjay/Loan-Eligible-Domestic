import React, { useState, useEffect } from 'react';
import { managerAPI } from '../../services/api';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Loading } from '../common/Loading';
import { ChartIcon, UsersIcon, TrendingUpIcon } from '../common/Icons';

interface DashboardStats {
  operators_count: number;
  total_applications: number;
  pending_applications: number;
  verified_applications: number;
  approved_applications: number;
  rejected_applications: number;
}

interface OperatorPerformance {
  operator_name: string;
  operator_email: string;
  total_applications: number;
  approved_applications: number;
  rejected_applications: number;
  pending_applications: number;
  approval_rate: number;
}

interface LoanReport {
  month: string;
  total_amount: number;
  applications_count: number;
  approved_amount: number;
  approved_count: number;
}

export const ManagerReports: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [operatorPerformance, setOperatorPerformance] = useState<OperatorPerformance[]>([]);
  const [loanReports, setLoanReports] = useState<LoanReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'operators' | 'loans'>('overview');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth() - 5, 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      // Load dashboard stats
      const dashboardStats = await managerAPI.getDashboardStats();
      setStats(dashboardStats);
      
      // Load operator performance report
      const operatorPerformanceData = await managerAPI.getOperatorPerformanceReport();
      setOperatorPerformance(operatorPerformanceData);
      
      // Load monthly analytics
      const monthlyData = await managerAPI.getMonthlyAnalytics(6);
      setLoanReports(monthlyData);
      
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load reports');
      // Fallback to sample data if API fails
      generateSampleData();
    } finally {
      setLoading(false);
    }
  };

  const generateSampleData = () => {
    // Sample operator performance data
    const sampleOperators: OperatorPerformance[] = [
      {
        operator_name: 'Rajesh Kumar',
        operator_email: 'rajesh@example.com',
        total_applications: 25,
        approved_applications: 18,
        rejected_applications: 4,
        pending_applications: 3,
        approval_rate: 72
      },
      {
        operator_name: 'Priya Sharma',
        operator_email: 'priya@example.com',
        total_applications: 32,
        approved_applications: 24,
        rejected_applications: 6,
        pending_applications: 2,
        approval_rate: 75
      },
      {
        operator_name: 'Amit Singh',
        operator_email: 'amit@example.com',
        total_applications: 19,
        approved_applications: 12,
        rejected_applications: 5,
        pending_applications: 2,
        approval_rate: 63
      }
    ];

    // Sample loan reports data
    const sampleLoanReports: LoanReport[] = [
      { month: 'Jan 2025', total_amount: 2500000, applications_count: 15, approved_amount: 1800000, approved_count: 11 },
      { month: 'Feb 2025', total_amount: 3200000, applications_count: 18, approved_amount: 2400000, approved_count: 14 },
      { month: 'Mar 2025', total_amount: 2800000, applications_count: 16, approved_amount: 2100000, approved_count: 12 },
      { month: 'Apr 2025', total_amount: 3500000, applications_count: 21, approved_amount: 2800000, approved_count: 17 },
      { month: 'May 2025', total_amount: 4100000, applications_count: 24, approved_amount: 3200000, approved_count: 19 },
      { month: 'Jun 2025', total_amount: 3800000, applications_count: 22, approved_amount: 2900000, approved_count: 16 }
    ];

    setOperatorPerformance(sampleOperators);
    setLoanReports(sampleLoanReports);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const calculatePercentage = (value: number, total: number) => {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  };

  if (loading) {
    return <Loading size="lg" text="Loading reports..." />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
        <div className="flex items-center space-x-4">
          <div className="flex space-x-2">
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-green-500 focus:border-green-500"
            />
            <span className="text-sm text-gray-500 self-center">to</span>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <Button
            onClick={loadReports}
            className="bg-green-600 hover:bg-green-700 text-white"
            size="sm"
          >
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-green-50 border border-green-300 text-green-700 rounded">
          {error}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: ChartIcon },
            { id: 'operators', label: 'Operator Performance', icon: UsersIcon },
            { id: 'loans', label: 'Loan Analytics', icon: TrendingUpIcon }
          ].map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <IconComponent className="w-4 h-4 inline-block mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Operators</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.operators_count}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-50 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Applications</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.total_applications}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.approved_applications}</p>
                  <p className="text-xs text-gray-500">
                    {calculatePercentage(stats.approved_applications, stats.total_applications)}% of total
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-200 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Review</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.verified_applications}</p>
                  <p className="text-xs text-gray-500">Awaiting your decision</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Application Status Distribution */}
          <Card className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Application Status Distribution</h3>
            <div className="space-y-4">
              {[
                { label: 'Approved', value: stats.approved_applications, color: 'bg-green-500' },
                { label: 'Verified (Pending Review)', value: stats.verified_applications, color: 'bg-green-500' },
                { label: 'Pending Verification', value: stats.pending_applications, color: 'bg-green-300' },
                { label: 'Rejected', value: stats.rejected_applications, color: 'bg-gray-500' }
              ].map((item) => (
                <div key={item.label} className="flex items-center">
                  <div className="flex items-center flex-1">
                    <div className={`w-4 h-4 rounded ${item.color} mr-3`}></div>
                    <span className="text-sm font-medium text-gray-700 mr-3">{item.label}</span>
                    <span className="text-sm text-gray-500">({item.value})</span>
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${item.color}`}
                        style={{
                          width: `${calculatePercentage(item.value, stats.total_applications)}%`
                        }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {calculatePercentage(item.value, stats.total_applications)}%
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Operator Performance Tab */}
      {activeTab === 'operators' && (
        <div className="space-y-6">
          <Card className="overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Operator Performance</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Operator
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Applications
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Approved
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rejected
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pending
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Success Rate
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {operatorPerformance.map((operator, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{operator.operator_name}</div>
                          <div className="text-sm text-gray-500">{operator.operator_email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {operator.total_applications}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {operator.approved_applications}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {operator.rejected_applications}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {operator.pending_applications}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-1">
                            <div className="w-full bg-gray-200 rounded-full h-2 mr-3">
                              <div
                                className="bg-green-500 h-2 rounded-full"
                                style={{ width: `${operator.approval_rate}%` }}
                              ></div>
                            </div>
                          </div>
                          <span className="text-sm font-medium text-gray-900 ml-2">
                            {operator.approval_rate}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Loan Analytics Tab */}
      {activeTab === 'loans' && (
        <div className="space-y-6">
          <Card className="overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Monthly Loan Analytics</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Month
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Applied Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applications
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Approved Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Approved Count
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Approval Rate
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loanReports.map((report, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {report.month}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(report.total_amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {report.applications_count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                        {formatCurrency(report.approved_amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {report.approved_count}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-1">
                            <div className="w-full bg-gray-200 rounded-full h-2 mr-3">
                              <div
                                className="bg-green-500 h-2 rounded-full"
                                style={{ 
                                  width: `${calculatePercentage(report.approved_count, report.applications_count)}%` 
                                }}
                              ></div>
                            </div>
                          </div>
                          <span className="text-sm font-medium text-gray-900 ml-2">
                            {calculatePercentage(report.approved_count, report.applications_count)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};