import React, { useState } from 'react';
import { Card } from '../../common/Card';
import { Input } from '../../common/Input';
import { Button } from '../../common/Button';

interface BasicInfoVerificationProps {
  application: any;
  data: any;
  onComplete: (data: any) => void;
  onPrevious?: () => void;
}

export const BasicInfoVerification: React.FC<BasicInfoVerificationProps> = ({
  application,
  data,
  onComplete,
  onPrevious
}) => {
  const [formData, setFormData] = useState({
    name_verified: data.name_verified || false,
    phone_verified: data.phone_verified || false,
    address_verified: data.address_verified || false,
    aadhar_verified: data.aadhar_verified || false,
    verification_notes: data.verification_notes || '',
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

    if (!formData.name_verified) {
      newErrors.name_verified = 'Name verification is required';
    }
    if (!formData.phone_verified) {
      newErrors.phone_verified = 'Phone verification is required';
    }
    if (!formData.address_verified) {
      newErrors.address_verified = 'Address verification is required';
    }
    if (!formData.aadhar_verified) {
      newErrors.aadhar_verified = 'Aadhar verification is required';
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Basic Information Verification</h2>
          <p className="text-gray-600">
            Verify the applicant's personal details and documents
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Applicant Details */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Applicant Details</h3>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-700">Full Name</div>
                <div className="text-lg text-gray-900">{application?.applicant?.name || 'N/A'}</div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-700">Phone Number</div>
                <div className="text-lg text-gray-900">{application?.applicant?.phone || 'N/A'}</div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-700">Email</div>
                <div className="text-lg text-gray-900">
                  {application?.applicant?.email || 'Not provided'}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-700">Address</div>
                <div className="text-lg text-gray-900">{application?.applicant?.address || 'N/A'}</div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-700">Aadhar Number</div>
                <div className="text-lg text-gray-900">{application?.applicant?.aadhar_number || 'N/A'}</div>
              </div>

              {application?.applicant?.pan_number && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-gray-700">PAN Number</div>
                  <div className="text-lg text-gray-900">{application.applicant.pan_number}</div>
                </div>
              )}
            </div>
          </div>

          {/* Verification Form */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Verification Checklist</h3>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="name_verified"
                  checked={formData.name_verified}
                  onChange={(e) => handleInputChange('name_verified', e.target.checked)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="name_verified" className="text-sm font-medium text-gray-700">
                  Name matches identity documents
                </label>
              </div>
              {errors.name_verified && (
                <p className="text-red-600 text-sm ml-7">{errors.name_verified}</p>
              )}

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="phone_verified"
                  checked={formData.phone_verified}
                  onChange={(e) => handleInputChange('phone_verified', e.target.checked)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="phone_verified" className="text-sm font-medium text-gray-700">
                  Phone number verified via call/SMS
                </label>
              </div>
              {errors.phone_verified && (
                <p className="text-red-600 text-sm ml-7">{errors.phone_verified}</p>
              )}

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="address_verified"
                  checked={formData.address_verified}
                  onChange={(e) => handleInputChange('address_verified', e.target.checked)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="address_verified" className="text-sm font-medium text-gray-700">
                  Address matches documents/records
                </label>
              </div>
              {errors.address_verified && (
                <p className="text-red-600 text-sm ml-7">{errors.address_verified}</p>
              )}

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="aadhar_verified"
                  checked={formData.aadhar_verified}
                  onChange={(e) => handleInputChange('aadhar_verified', e.target.checked)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="aadhar_verified" className="text-sm font-medium text-gray-700">
                  Aadhar number verified and valid
                </label>
              </div>
              {errors.aadhar_verified && (
                <p className="text-red-600 text-sm ml-7">{errors.aadhar_verified}</p>
              )}

              <div className="mt-6">
                <Input
                  label="Verification Notes"
                  placeholder="Add any additional notes or observations..."
                  value={formData.verification_notes}
                  onChange={(e) => handleInputChange('verification_notes', e.target.value)}
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
            disabled={!onPrevious}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </Button>

          <Button onClick={handleNext}>
            Next: Document Verification
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        </div>
      </div>
    </Card>
  );
};