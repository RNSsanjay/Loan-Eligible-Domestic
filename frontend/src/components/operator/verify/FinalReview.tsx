import React, { useState } from 'react';
import { Card } from '../../common/Card';
import { Input } from '../../common/Input';
import { Button } from '../../common/Button';

interface FinalReviewProps {
  application: any;
  data: any;
  allStepData: Record<number, any>;
  onComplete: (data: any) => void;
  onPrevious?: () => void;
}

export const FinalReview: React.FC<FinalReviewProps> = ({
  application,
  data,
  allStepData,
  onComplete,
  onPrevious
}) => {
  const [formData, setFormData] = useState({
    final_recommendation: data.final_recommendation || 'pending',
    overall_risk_assessment: data.overall_risk_assessment || 'medium',
    recommended_loan_amount: data.recommended_loan_amount || allStepData[2]?.recommended_loan_amount || application.loan_amount,
    recommended_tenure: data.recommended_tenure || application.repayment_period,
    final_notes: data.final_notes || '',
    terms_conditions_explained: data.terms_conditions_explained || false,
    applicant_consent_obtained: data.applicant_consent_obtained || false,
    ...data
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.final_recommendation || formData.final_recommendation === 'pending') {
      newErrors.final_recommendation = 'Final recommendation is required';
    }
    if (!formData.terms_conditions_explained) {
      newErrors.terms_conditions_explained = 'Terms and conditions must be explained';
    }
    if (formData.final_recommendation === 'approved' && !formData.applicant_consent_obtained) {
      newErrors.applicant_consent_obtained = 'Applicant consent is required for approval';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        await onComplete(formData);
      } catch (error) {
        console.error('Error submitting verification:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Calculate verification score
  const calculateScore = () => {
    let score = 0;
    let maxScore = 0;

    // Basic info verification (20%)
    const basicInfo = allStepData[0] || {};
    maxScore += 20;
    if (basicInfo.name_verified) score += 5;
    if (basicInfo.phone_verified) score += 5;
    if (basicInfo.address_verified) score += 5;
    if (basicInfo.aadhar_verified) score += 5;

    // Document verification (25%)
    const documents = allStepData[1] || {};
    maxScore += 25;
    if (documents.identity_document_verified) score += 7;
    if (documents.address_document_verified) score += 6;
    if (documents.bank_document_verified) score += 6;
    if (documents.document_quality_check) score += 6;

    // Financial verification (30%)
    const financial = allStepData[2] || {};
    maxScore += 30;
    if (financial.income_verified) score += 8;
    if (financial.loan_amount_appropriate) score += 8;
    if (financial.repayment_capacity_verified) score += 8;
    if (financial.credit_assessment_completed) score += 6;

    // Animal verification (25%)
    const animal = allStepData[3] || {};
    maxScore += 25;
    if (animal.animal_physically_verified) score += 7;
    if (animal.health_status_verified) score += 6;
    if (animal.market_value_assessed) score += 6;
    if (animal.ownership_verified) score += 6;

    return Math.round((score / maxScore) * 100);
  };

  const verificationScore = calculateScore();
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <Card>
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Final Review & Decision</h2>
          <p className="text-gray-600">
            Review all verifications and make final recommendation
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Verification Summary */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Verification Summary</h3>
            
            <div className="space-y-4">
              {/* Overall Score */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-blue-700">Verification Score</div>
                  <div className={`px-3 py-1 rounded-full text-lg font-bold ${getScoreColor(verificationScore)}`}>
                    {verificationScore}%
                  </div>
                </div>
              </div>

              {/* Step-wise Summary */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      allStepData[0] ? 'bg-green-500' : 'bg-gray-300'
                    }`}></div>
                    <span className="text-sm font-medium">Basic Information</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {Object.values(allStepData[0] || {}).filter(v => v === true).length} items verified
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      allStepData[1] ? 'bg-green-500' : 'bg-gray-300'
                    }`}></div>
                    <span className="text-sm font-medium">Document Verification</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {Object.values(allStepData[1] || {}).filter(v => v === true).length} items verified
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      allStepData[2] ? 'bg-green-500' : 'bg-gray-300'
                    }`}></div>
                    <span className="text-sm font-medium">Financial Assessment</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    Recommended: ₹{allStepData[2]?.recommended_loan_amount?.toLocaleString('en-IN') || 'N/A'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      allStepData[3] ? 'bg-green-500' : 'bg-gray-300'
                    }`}></div>
                    <span className="text-sm font-medium">Animal Verification</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    Value: ₹{allStepData[3]?.assessed_market_value?.toLocaleString('en-IN') || 'N/A'}
                  </span>
                </div>
              </div>

              {/* Application Summary */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Application Summary</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Applicant: {application.applicant.name}</div>
                  <div>Requested Amount: ₹{application.loan_amount?.toLocaleString('en-IN')}</div>
                  <div>Purpose: {application.purpose}</div>
                  <div>Tenure: {application.repayment_period} months</div>
                </div>
              </div>
            </div>
          </div>

          {/* Decision Form */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Final Decision</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Final Recommendation *
                </label>
                <select
                  value={formData.final_recommendation}
                  onChange={(e) => handleInputChange('final_recommendation', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="pending">Select Recommendation</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="needs_review">Needs Further Review</option>
                </select>
                {errors.final_recommendation && (
                  <p className="text-red-600 text-sm mt-1">{errors.final_recommendation}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Overall Risk Assessment
                </label>
                <select
                  value={formData.overall_risk_assessment}
                  onChange={(e) => handleInputChange('overall_risk_assessment', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="low">Low Risk</option>
                  <option value="medium">Medium Risk</option>
                  <option value="high">High Risk</option>
                </select>
                <div className={`mt-1 px-2 py-1 rounded text-xs inline-block ${getRiskColor(formData.overall_risk_assessment)}`}>
                  {formData.overall_risk_assessment.charAt(0).toUpperCase() + formData.overall_risk_assessment.slice(1)} Risk
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="number"
                  label="Final Loan Amount (₹)"
                  value={formData.recommended_loan_amount}
                  onChange={(e) => handleInputChange('recommended_loan_amount', Number(e.target.value))}
                />
                <Input
                  type="number"
                  label="Recommended Tenure (months)"
                  value={formData.recommended_tenure}
                  onChange={(e) => handleInputChange('recommended_tenure', Number(e.target.value))}
                />
              </div>

              <div>
                <Input
                  label="Final Notes & Comments"
                  placeholder="Add final notes, conditions, or recommendations..."
                  value={formData.final_notes}
                  onChange={(e) => handleInputChange('final_notes', e.target.value)}
                  multiline
                  rows={4}
                />
              </div>

              {/* Final Checklist */}
              <div className="space-y-3 pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="terms_conditions_explained"
                    checked={formData.terms_conditions_explained}
                    onChange={(e) => handleInputChange('terms_conditions_explained', e.target.checked)}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label htmlFor="terms_conditions_explained" className="text-sm font-medium text-gray-700">
                    Terms and conditions explained to applicant
                  </label>
                </div>
                {errors.terms_conditions_explained && (
                  <p className="text-red-600 text-sm ml-7">{errors.terms_conditions_explained}</p>
                )}

                {formData.final_recommendation === 'approved' && (
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="applicant_consent_obtained"
                      checked={formData.applicant_consent_obtained}
                      onChange={(e) => handleInputChange('applicant_consent_obtained', e.target.checked)}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label htmlFor="applicant_consent_obtained" className="text-sm font-medium text-gray-700">
                      Applicant consent obtained for loan terms
                    </label>
                  </div>
                )}
                {errors.applicant_consent_obtained && (
                  <p className="text-red-600 text-sm ml-7">{errors.applicant_consent_obtained}</p>
                )}
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

          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={formData.final_recommendation === 'approved' ? 'bg-green-600 hover:bg-green-700' : 
                      formData.final_recommendation === 'rejected' ? 'bg-red-600 hover:bg-red-700' : ''}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Submitting...
              </>
            ) : (
              <>
                Complete Verification
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
};