import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { operatorAPI } from '../../services/api';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import type { VerificationChecklist } from '../../types';

export const VerifyLoanApplication: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [checklist, setChecklist] = useState<VerificationChecklist>({
    health_certificate: false,
    health_certificate_notes: '',
    vaccination_records: false,
    vaccination_records_notes: '',
    ownership_proof: false,
    ownership_proof_notes: '',
    identity_verified: false,
    identity_notes: '',
    bank_details: false,
    bank_details_notes: '',
    income_proof: false,
    income_proof_notes: '',
    market_value: false,
    market_value_notes: '',
    repayment_capacity: false,
    repayment_capacity_notes: ''
  });

  const handleCheckboxChange = (field: keyof VerificationChecklist, checked: boolean) => {
    setChecklist(prev => ({ ...prev, [field]: checked }));
  };

  const handleNotesChange = (field: keyof VerificationChecklist, notes: string) => {
    setChecklist(prev => ({ ...prev, [field]: notes }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    
    setError('');
    setLoading(true);

    try {
      await operatorAPI.verifyLoanApplication(id, checklist);
      navigate('/operator/applications');
    } catch (error: any) {
      setError(error.response?.data?.detail || 'Failed to verify loan application');
    } finally {
      setLoading(false);
    }
  };

  const verificationItems = [
    {
      key: 'health_certificate',
      label: 'Animal Health Certificate Verified',
      description: 'Valid veterinary health certificate provided and verified'
    },
    {
      key: 'vaccination_records',
      label: 'Vaccination Records Verified',
      description: 'Up-to-date vaccination records checked and confirmed'
    },
    {
      key: 'ownership_proof',
      label: 'Animal Ownership Proof Verified',
      description: 'Legal ownership documents verified (purchase receipt, registration, etc.)'
    },
    {
      key: 'identity_verified',
      label: 'Applicant Identity Verified',
      description: 'Government-issued ID documents verified (Aadhar, PAN, etc.)'
    },
    {
      key: 'bank_details',
      label: 'Bank Account Details Verified',
      description: 'Bank account details verified with bank statements'
    },
    {
      key: 'income_proof',
      label: 'Income Proof Verified',
      description: 'Income documents and financial capacity verified'
    },
    {
      key: 'market_value',
      label: 'Animal Market Value Assessed',
      description: 'Current market value assessed by qualified evaluator'
    },
    {
      key: 'repayment_capacity',
      label: 'Loan Repayment Capacity Verified',
      description: 'Financial capacity to repay loan assessed and confirmed'
    }
  ];

  const allVerified = verificationItems.every(item => 
    checklist[item.key as keyof VerificationChecklist] === true
  );

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Verify Loan Application</h2>
        <p className="text-gray-600">Complete the 8-point verification checklist</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-green-50 border border-green-300 rounded-md">
          <p className="text-green-700 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Card title="Verification Checklist">
          <div className="space-y-6">
            {verificationItems.map((item, index) => (
              <div key={item.key} className="border-b border-gray-200 pb-6 last:border-b-0">
                <div className="flex items-start space-x-3">
                  <div className="flex items-center h-5">
                    <input
                      type="checkbox"
                      id={item.key}
                      checked={checklist[item.key as keyof VerificationChecklist] as boolean}
                      onChange={(e) => handleCheckboxChange(item.key as keyof VerificationChecklist, e.target.checked)}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="flex-1">
                    <label htmlFor={item.key} className="text-sm font-medium text-gray-900">
                      {index + 1}. {item.label}
                    </label>
                    <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                    
                    <div className="mt-3">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Verification Notes (optional)
                      </label>
                      <textarea
                        rows={2}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                        placeholder={`Add notes for ${item.label.toLowerCase()}...`}
                        value={checklist[`${item.key}_notes` as keyof VerificationChecklist] as string || ''}
                        onChange={(e) => handleNotesChange(`${item.key}_notes` as keyof VerificationChecklist, e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Verification Status */}
        <Card title="Verification Status" className="mt-6">
          <div className="text-center">
            {allVerified ? (
              <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                All items verified - Application ready for manager approval
              </div>
            ) : (
              <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {verificationItems.filter(item => !checklist[item.key as keyof VerificationChecklist]).length} items remaining
              </div>
            )}
          </div>
        </Card>

        {/* Submit Button */}
        <div className="mt-8 flex justify-end space-x-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/operator/applications')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={loading}
            variant={allVerified ? 'success' : 'primary'}
          >
            {allVerified ? 'Complete Verification' : 'Save Progress'}
          </Button>
        </div>
      </form>
    </div>
  );
};