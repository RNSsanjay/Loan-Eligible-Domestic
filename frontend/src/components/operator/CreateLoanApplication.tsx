import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { operatorAPI } from '../../services/api';
import { Card } from '../common/Card';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { Loading } from '../common/Loading';
import type { Applicant, Animal, LoanApplication } from '../../types';

export const CreateLoanApplication: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [animals, setAnimals] = useState<Animal[]>([]);
  
  const [loanApplication, setLoanApplication] = useState<Omit<LoanApplication, 'id'>>({
    applicant_id: '',
    animal_id: '',
    loan_amount: 0,
    purpose: '',
    repayment_period: 12,
    status: 'pending',
    operator_id: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [applicantsData, animalsData] = await Promise.all([
          operatorAPI.getApplicants(),
          operatorAPI.getAnimals()
        ]);
        setApplicants(applicantsData);
        setAnimals(animalsData);
      } catch (error: any) {
        setError('Failed to load applicants and animals data');
      } finally {
        setDataLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (field: keyof LoanApplication, value: string | number) => {
    setLoanApplication(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await operatorAPI.createLoanApplication(loanApplication);
      navigate('/operator/applications');
    } catch (error: any) {
      setError(error.response?.data?.detail || 'Failed to create loan application');
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading) {
    return <Loading size="lg" text="Loading applicants and animals data..." />;
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Create Loan Application</h2>
        <p className="text-gray-600">Submit a new loan application for livestock financing</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {applicants.length === 0 && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-yellow-800 text-sm">
            No applicants found. Please{' '}
            <button
              onClick={() => navigate('/operator/create-applicant')}
              className="underline hover:text-yellow-900"
            >
              create an applicant
            </button>{' '}
            first.
          </p>
        </div>
      )}

      {animals.length === 0 && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-yellow-800 text-sm">
            No animal records found. Please{' '}
            <button
              onClick={() => navigate('/operator/create-animal')}
              className="underline hover:text-yellow-900"
            >
              add animal details
            </button>{' '}
            first.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Applicant & Animal Selection */}
          <Card title="Applicant & Animal Selection">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Applicant *
                </label>
                <select
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  value={loanApplication.applicant_id}
                  onChange={(e) => handleInputChange('applicant_id', e.target.value)}
                  required
                >
                  <option value="">Choose an applicant</option>
                  {applicants.map((applicant) => (
                    <option key={applicant.id} value={applicant.id}>
                      {applicant.name} - {applicant.phone}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Animal *
                </label>
                <select
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  value={loanApplication.animal_id}
                  onChange={(e) => handleInputChange('animal_id', e.target.value)}
                  required
                >
                  <option value="">Choose an animal</option>
                  {animals.map((animal) => (
                    <option key={animal.id} value={animal.id}>
                      {animal.type} - {animal.breed} (₹{animal.market_value.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              {/* Display selected applicant details */}
              {loanApplication.applicant_id && (
                <div className="mt-4 p-3 bg-gray-50 rounded-md">
                  {(() => {
                    const selectedApplicant = applicants.find(a => a.id === loanApplication.applicant_id);
                    return selectedApplicant ? (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Selected Applicant:</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {selectedApplicant.name}<br/>
                          Income: ₹{selectedApplicant.annual_income.toLocaleString()}/year<br/>
                          Bank: {selectedApplicant.bank_name}
                        </p>
                      </div>
                    ) : null;
                  })()}
                </div>
              )}

              {/* Display selected animal details */}
              {loanApplication.animal_id && (
                <div className="mt-4 p-3 bg-gray-50 rounded-md">
                  {(() => {
                    const selectedAnimal = animals.find(a => a.id === loanApplication.animal_id);
                    return selectedAnimal ? (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Selected Animal:</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {selectedAnimal.type} - {selectedAnimal.breed}<br/>
                          Age: {selectedAnimal.age} years, Weight: {selectedAnimal.weight}kg<br/>
                          Market Value: ₹{selectedAnimal.market_value.toLocaleString()}
                        </p>
                      </div>
                    ) : null;
                  })()}
                </div>
              )}
            </div>
          </Card>

          {/* Loan Details */}
          <Card title="Loan Details">
            <div className="space-y-4">
              <Input
                label="Loan Amount (₹) *"
                type="number"
                value={loanApplication.loan_amount}
                onChange={(e) => handleInputChange('loan_amount', parseFloat(e.target.value) || 0)}
                required
                fullWidth
                min="10000"
                step="1000"
                helperText="Minimum loan amount: ₹10,000"
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Repayment Period *
                </label>
                <select
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  value={loanApplication.repayment_period}
                  onChange={(e) => handleInputChange('repayment_period', parseInt(e.target.value))}
                  required
                >
                  <option value={12}>12 months</option>
                  <option value={18}>18 months</option>
                  <option value={24}>24 months</option>
                  <option value={36}>36 months</option>
                  <option value={48}>48 months</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Purpose of Loan *
                </label>
                <textarea
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  rows={4}
                  value={loanApplication.purpose}
                  onChange={(e) => handleInputChange('purpose', e.target.value)}
                  required
                  placeholder="Describe the purpose of the loan (e.g., purchasing cattle, feed, veterinary care, etc.)"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Loan Calculation Summary */}
        {loanApplication.loan_amount > 0 && (
          <Card title="Loan Summary" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="text-sm font-medium text-green-700">Loan Amount</h4>
                <p className="text-2xl font-bold text-green-900">
                  ₹{loanApplication.loan_amount.toLocaleString()}
                </p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-medium text-blue-700">Repayment Period</h4>
                <p className="text-2xl font-bold text-blue-900">
                  {loanApplication.repayment_period} months
                </p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <h4 className="text-sm font-medium text-yellow-700">Estimated EMI</h4>
                <p className="text-2xl font-bold text-yellow-900">
                  ₹{Math.ceil(loanApplication.loan_amount / loanApplication.repayment_period).toLocaleString()}
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="text-sm font-medium text-purple-700">Status</h4>
                <p className="text-lg font-semibold text-purple-900">Pending Verification</p>
              </div>
            </div>
          </Card>
        )}

        {/* Submit Button */}
        <div className="mt-8 flex justify-end space-x-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/operator')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={loading}
            disabled={applicants.length === 0 || animals.length === 0}
          >
            Submit Application
          </Button>
        </div>
      </form>
    </div>
  );
};