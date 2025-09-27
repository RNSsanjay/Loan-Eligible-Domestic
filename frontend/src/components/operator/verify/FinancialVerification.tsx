import React, { useState } from 'react';
import { Card } from '../../common/Card';
import { Input } from '../../common/Input';
import { Button } from '../../common/Button';

interface FinancialVerificationProps {
  application: any;
  data: any;
  onComplete: (data: any) => void;
  onPrevious?: () => void;
}

export const FinancialVerification: React.FC<FinancialVerificationProps> = ({
  application,
  data,
  onComplete,
  onPrevious
}) => {
  const [formData, setFormData] = useState({
    income_verified: data.income_verified || false,
    loan_amount_appropriate: data.loan_amount_appropriate || false,
    repayment_capacity_verified: data.repayment_capacity_verified || false,
    existing_obligations_checked: data.existing_obligations_checked || false,
    credit_assessment_completed: data.credit_assessment_completed || false,
    financial_notes: data.financial_notes || '',
    recommended_loan_amount: data.recommended_loan_amount || application.loan_amount,
    ...data
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.income_verified) {
      newErrors.income_verified = 'Income verification is required';
    }
    if (!formData.loan_amount_appropriate) {
      newErrors.loan_amount_appropriate = 'Loan amount assessment is required';
    }
    if (!formData.repayment_capacity_verified) {
      newErrors.repayment_capacity_verified = 'Repayment capacity verification is required';
    }
    if (!formData.credit_assessment_completed) {
      newErrors.credit_assessment_completed = 'Credit assessment is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onComplete(formData);
    }
  };

  // Calculate monthly EMI
  const calculateEMI = (principal: number, rate: number, tenure: number) => {
    const monthlyRate = rate / (12 * 100);
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / 
                (Math.pow(1 + monthlyRate, tenure) - 1);
    return emi;
  };

  const loanAmount = formData.recommended_loan_amount;
  const tenure = application?.repayment_period || 12;
  const estimatedRate = 12; // 12% annual interest
  const emi = calculateEMI(loanAmount, estimatedRate, tenure);
  const monthlyIncome = (application?.applicant?.annual_income || 0) / 12;
  const emiToIncomeRatio = monthlyIncome > 0 ? (emi / monthlyIncome) * 100 : 0;

  return (
    <Card>
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Financial Assessment</h2>
          <p className="text-gray-600">
            Verify financial capacity and assess loan affordability
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Financial Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Details</h3>
            
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="text-sm font-medium text-green-700 mb-1">Annual Income</div>
                <div className="text-2xl font-bold text-green-800">
                  ₹{application?.applicant?.annual_income?.toLocaleString('en-IN') || '0'}
                </div>
                <div className="text-sm text-green-600">
                  Monthly: ₹{monthlyIncome?.toLocaleString('en-IN') || '0'}
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="text-sm font-medium text-blue-700 mb-1">Loan Details</div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-blue-600">Requested Amount:</span>
                    <span className="font-medium">₹{application?.loan_amount?.toLocaleString('en-IN') || '0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-600">Tenure:</span>
                    <span className="font-medium">{application?.repayment_period || 0} months</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-600">Purpose:</span>
                    <span className="font-medium">{application?.purpose || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <div className="text-sm font-medium text-purple-700 mb-1">EMI Calculation</div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-purple-600">Estimated EMI:</span>
                    <span className="font-medium text-lg">₹{emi?.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-600">EMI/Income Ratio:</span>
                    <span className={`font-medium ${emiToIncomeRatio > 40 ? 'text-red-600' : 'text-green-600'}`}>
                      {emiToIncomeRatio.toFixed(1)}%
                    </span>
                  </div>
                  <div className="text-xs text-purple-500 mt-2">
                    *Based on 12% annual interest rate
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <div className="text-sm font-medium text-yellow-700 mb-1">Family Information</div>
                <div className="text-yellow-600">
                  Family Members: {application?.applicant?.family_members?.length || 0}
                </div>
              </div>
            </div>

            {/* Recommended Loan Amount */}
            <div className="mt-6">
              <Input
                type="number"
                label="Recommended Loan Amount (₹)"
                value={formData.recommended_loan_amount}
                onChange={(e) => handleInputChange('recommended_loan_amount', Number(e.target.value))}
                placeholder="Enter recommended amount"
              />
            </div>
          </div>

          {/* Verification Checklist */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Verification</h3>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="income_verified"
                  checked={formData.income_verified}
                  onChange={(e) => handleInputChange('income_verified', e.target.checked)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="income_verified" className="text-sm font-medium text-gray-700">
                  Income sources verified and stable
                </label>
              </div>
              {errors.income_verified && (
                <p className="text-red-600 text-sm ml-7">{errors.income_verified}</p>
              )}

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="loan_amount_appropriate"
                  checked={formData.loan_amount_appropriate}
                  onChange={(e) => handleInputChange('loan_amount_appropriate', e.target.checked)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="loan_amount_appropriate" className="text-sm font-medium text-gray-700">
                  Loan amount is appropriate for purpose
                </label>
              </div>
              {errors.loan_amount_appropriate && (
                <p className="text-red-600 text-sm ml-7">{errors.loan_amount_appropriate}</p>
              )}

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="repayment_capacity_verified"
                  checked={formData.repayment_capacity_verified}
                  onChange={(e) => handleInputChange('repayment_capacity_verified', e.target.checked)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="repayment_capacity_verified" className="text-sm font-medium text-gray-700">
                  Repayment capacity is adequate
                </label>
              </div>
              {errors.repayment_capacity_verified && (
                <p className="text-red-600 text-sm ml-7">{errors.repayment_capacity_verified}</p>
              )}

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="existing_obligations_checked"
                  checked={formData.existing_obligations_checked}
                  onChange={(e) => handleInputChange('existing_obligations_checked', e.target.checked)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="existing_obligations_checked" className="text-sm font-medium text-gray-700">
                  Existing financial obligations reviewed
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="credit_assessment_completed"
                  checked={formData.credit_assessment_completed}
                  onChange={(e) => handleInputChange('credit_assessment_completed', e.target.checked)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="credit_assessment_completed" className="text-sm font-medium text-gray-700">
                  Credit risk assessment completed
                </label>
              </div>
              {errors.credit_assessment_completed && (
                <p className="text-red-600 text-sm ml-7">{errors.credit_assessment_completed}</p>
              )}

              <div className="mt-6">
                <Input
                  label="Financial Assessment Notes"
                  placeholder="Add notes about financial assessment..."
                  value={formData.financial_notes}
                  onChange={(e) => handleInputChange('financial_notes', e.target.value)}
                  multiline
                  rows={4}
                />
              </div>

              {/* Risk Assessment */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-700 mb-2">Risk Assessment Summary</div>
                <div className="space-y-1 text-sm">
                  <div className={`flex justify-between ${emiToIncomeRatio <= 30 ? 'text-green-600' : emiToIncomeRatio <= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                    <span>EMI Burden:</span>
                    <span className="font-medium">
                      {emiToIncomeRatio <= 30 ? 'Low Risk' : emiToIncomeRatio <= 40 ? 'Medium Risk' : 'High Risk'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    • EMI &lt; 30% of income: Low Risk<br/>
                    • EMI 30-40% of income: Medium Risk<br/>
                    • EMI &gt; 40% of income: High Risk
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
          <Button
            variant="secondary"
            onClick={onPrevious}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </Button>

          <Button onClick={handleNext}>
            Next: Animal Verification
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        </div>
      </div>
    </Card>
  );
};