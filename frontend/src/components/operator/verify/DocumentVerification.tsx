import React, { useState } from 'react';
import { Card } from '../../common/Card';
import { Input } from '../../common/Input';
import { Button } from '../../common/Button';

interface DocumentVerificationProps {
  application: any;
  data: any;
  onComplete: (data: any) => void;
  onPrevious?: () => void;
}

export const DocumentVerification: React.FC<DocumentVerificationProps> = ({
  application,
  data,
  onComplete,
  onPrevious
}) => {
  const [formData, setFormData] = useState({
    identity_document_verified: data.identity_document_verified || false,
    address_document_verified: data.address_document_verified || false,
    bank_document_verified: data.bank_document_verified || false,
    income_document_verified: data.income_document_verified || false,
    document_quality_check: data.document_quality_check || false,
    document_notes: data.document_notes || '',
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

    if (!formData.identity_document_verified) {
      newErrors.identity_document_verified = 'Identity document verification is required';
    }
    if (!formData.address_document_verified) {
      newErrors.address_document_verified = 'Address document verification is required';
    }
    if (!formData.bank_document_verified) {
      newErrors.bank_document_verified = 'Bank document verification is required';
    }
    if (!formData.document_quality_check) {
      newErrors.document_quality_check = 'Document quality check is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onComplete(formData);
    }
  };

  return (
    <Card>
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Document Verification</h2>
          <p className="text-gray-600">
            Verify all required documents are authentic and complete
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Document Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Information</h3>
            
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center mb-2">
                  <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                  </svg>
                  <div className="text-sm font-medium text-blue-700">Identity Documents</div>
                </div>
                <div className="text-sm text-blue-600">
                  • Aadhar Card: {application?.applicant?.aadhar_number || 'N/A'}<br/>
                  {application?.applicant?.pan_number && `• PAN Card: ${application.applicant.pan_number}`}
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center mb-2">
                  <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div className="text-sm font-medium text-green-700">Address Proof</div>
                </div>
                <div className="text-sm text-green-600">
                  Address: {application?.applicant?.address || 'N/A'}
                </div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <div className="flex items-center mb-2">
                  <svg className="w-5 h-5 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <div className="text-sm font-medium text-purple-700">Bank Details</div>
                </div>
                <div className="text-sm text-purple-600">
                  • Account: {application?.applicant?.bank_account_number || 'N/A'}<br/>
                  • Bank: {application?.applicant?.bank_name || 'N/A'}<br/>
                  • IFSC: {application?.applicant?.ifsc_code || 'N/A'}
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <div className="flex items-center mb-2">
                  <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  <div className="text-sm font-medium text-yellow-700">Income Documents</div>
                </div>
                <div className="text-sm text-yellow-600">
                  Annual Income: ₹{application.applicant.annual_income?.toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          </div>

          {/* Verification Checklist */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Verification Checklist</h3>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="identity_document_verified"
                  checked={formData.identity_document_verified}
                  onChange={(e) => handleInputChange('identity_document_verified', e.target.checked)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="identity_document_verified" className="text-sm font-medium text-gray-700">
                  Identity documents verified and authentic
                </label>
              </div>
              {errors.identity_document_verified && (
                <p className="text-red-600 text-sm ml-7">{errors.identity_document_verified}</p>
              )}

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="address_document_verified"
                  checked={formData.address_document_verified}
                  onChange={(e) => handleInputChange('address_document_verified', e.target.checked)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="address_document_verified" className="text-sm font-medium text-gray-700">
                  Address proof documents verified
                </label>
              </div>
              {errors.address_document_verified && (
                <p className="text-red-600 text-sm ml-7">{errors.address_document_verified}</p>
              )}

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="bank_document_verified"
                  checked={formData.bank_document_verified}
                  onChange={(e) => handleInputChange('bank_document_verified', e.target.checked)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="bank_document_verified" className="text-sm font-medium text-gray-700">
                  Bank account details verified
                </label>
              </div>
              {errors.bank_document_verified && (
                <p className="text-red-600 text-sm ml-7">{errors.bank_document_verified}</p>
              )}

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="income_document_verified"
                  checked={formData.income_document_verified}
                  onChange={(e) => handleInputChange('income_document_verified', e.target.checked)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="income_document_verified" className="text-sm font-medium text-gray-700">
                  Income documents verified (if applicable)
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="document_quality_check"
                  checked={formData.document_quality_check}
                  onChange={(e) => handleInputChange('document_quality_check', e.target.checked)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="document_quality_check" className="text-sm font-medium text-gray-700">
                  All documents are clear and readable
                </label>
              </div>
              {errors.document_quality_check && (
                <p className="text-red-600 text-sm ml-7">{errors.document_quality_check}</p>
              )}

              <div className="mt-6">
                <Input
                  label="Document Verification Notes"
                  placeholder="Add any notes about document verification..."
                  value={formData.document_notes}
                  onChange={(e) => handleInputChange('document_notes', e.target.value)}
                  multiline
                  rows={4}
                />
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
            Next: Financial Assessment
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        </div>
      </div>
    </Card>
  );
};