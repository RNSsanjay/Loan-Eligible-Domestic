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
  const [submittedApplication, setSubmittedApplication] = useState<any>(null);
  
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
        // Ensure IDs are strings
        const processedApplicants = (applicantsData as any[]).map((applicant: any) => ({
          ...applicant,
          id: String(applicant.id || applicant._id || '')
        }));
        const processedAnimals = (animalsData as any[]).map((animal: any) => ({
          ...animal,
          id: String(animal.id || animal._id || '')
        }));
        setApplicants(processedApplicants);
        setAnimals(processedAnimals);
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
      // Only send the required fields for loan application creation
      const loanData = {
        applicant_id: loanApplication.applicant_id,
        animal_id: loanApplication.animal_id,
        loan_amount: loanApplication.loan_amount,
        purpose: loanApplication.purpose,
        repayment_period: loanApplication.repayment_period
      };
      
      const response = await operatorAPI.createLoanApplication(loanData);
      setSubmittedApplication({
        ...response,
        ...loanData,
        applicant: applicants.find(a => a.id === loanApplication.applicant_id),
        animal: animals.find(a => a.id === loanApplication.animal_id)
      });
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

      {!submittedApplication && (
        <>
          {error && (
            <div className="mb-6 p-4 bg-green-50 border border-green-300 rounded-md">
              <p className="text-green-700 text-sm">{error}</p>
            </div>
          )}

          {applicants.length === 0 && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-700 text-sm">
                No applicants found. Please{' '}
                <button
                  onClick={() => navigate('/operator/create-applicant')}
                  className="underline hover:text-green-800"
                >
                  create an applicant
                </button>{' '}
                first.
              </p>
            </div>
          )}

          {animals.length === 0 && (
            <div className="mb-6 p-4 bg-green-100 border border-green-300 rounded-md">
              <p className="text-green-800 text-sm">
                No animal records found. Please{' '}
                <button
                  onClick={() => navigate('/operator/create-animal')}
                  className="underline hover:text-green-900"
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
                        <option key={applicant.id || applicant.name} value={applicant.id || ''}>
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
                        <option key={animal.id || animal.type} value={animal.id || ''}>
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
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="text-sm font-medium text-green-700">Repayment Period</h4>
                    <p className="text-2xl font-bold text-green-900">
                      {loanApplication.repayment_period} months
                    </p>
                  </div>
                  <div className="p-4 bg-green-100 rounded-lg">
                    <h4 className="text-sm font-medium text-green-800">Estimated EMI</h4>
                    <p className="text-2xl font-bold text-green-900">
                      ₹{Math.ceil(loanApplication.loan_amount / loanApplication.repayment_period).toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 bg-green-200 rounded-lg">
                    <h4 className="text-sm font-medium text-green-800">Status</h4>
                    <p className="text-lg font-semibold text-green-900">Pending Verification</p>
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
        </>
      )}

      {/* Success State */}
      {submittedApplication && (
        <div className="mt-8">
          <Card>
            <div className="text-center py-8">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Application Submitted Successfully!</h3>
              <p className="text-sm text-gray-600 mb-6">
                Your loan application has been submitted and is now pending verification.
              </p>
              
              {/* Application Details */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
                <h4 className="text-md font-medium text-gray-900 mb-4">Application Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Application Number</p>
                    <p className="font-medium">{submittedApplication.application_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Submitted
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Loan Amount</p>
                    <p className="font-medium">₹{submittedApplication.loan_amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Repayment Period</p>
                    <p className="font-medium">{submittedApplication.repayment_period} months</p>
                  </div>
                </div>
                
                {submittedApplication.applicant && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600">Applicant</p>
                    <p className="font-medium">{submittedApplication.applicant.name} - {submittedApplication.applicant.phone}</p>
                  </div>
                )}
                
                {submittedApplication.animal && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">Animal</p>
                    <p className="font-medium">{submittedApplication.animal.type} - {submittedApplication.animal.breed}</p>
                  </div>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="flex justify-center space-x-4">
                <Button
                  onClick={() => navigate('/operator/applications')}
                  variant="primary"
                >
                  View All Applications
                </Button>
                <Button
                  onClick={() => {
                    setSubmittedApplication(null);
                    setLoanApplication({
                      applicant_id: '',
                      animal_id: '',
                      loan_amount: 0,
                      purpose: '',
                      repayment_period: 12,
                      status: 'pending',
                      operator_id: ''
                    });
                  }}
                  variant="secondary"
                >
                  Create Another Application
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};