import React, { useState } from 'react';
import { Card } from '../../common/Card';
import { Input } from '../../common/Input';
import { Button } from '../../common/Button';

interface AnimalVerificationProps {
  application: any;
  data: any;
  onComplete: (data: any) => void;
  onPrevious?: () => void;
}

export const AnimalVerification: React.FC<AnimalVerificationProps> = ({
  application,
  data,
  onComplete,
  onPrevious
}) => {
  const [formData, setFormData] = useState({
    animal_physically_verified: data.animal_physically_verified || false,
    health_status_verified: data.health_status_verified || false,
    vaccination_records_verified: data.vaccination_records_verified || false,
    market_value_assessed: data.market_value_assessed || false,
    ownership_verified: data.ownership_verified || false,
    animal_condition_satisfactory: data.animal_condition_satisfactory || false,
    animal_notes: data.animal_notes || '',
    assessed_market_value: data.assessed_market_value || application.animal?.market_value || 0,
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

    if (!formData.animal_physically_verified) {
      newErrors.animal_physically_verified = 'Physical verification of animal is required';
    }
    if (!formData.health_status_verified) {
      newErrors.health_status_verified = 'Health status verification is required';
    }
    if (!formData.market_value_assessed) {
      newErrors.market_value_assessed = 'Market value assessment is required';
    }
    if (!formData.ownership_verified) {
      newErrors.ownership_verified = 'Ownership verification is required';
    }
    if (!formData.animal_condition_satisfactory) {
      newErrors.animal_condition_satisfactory = 'Animal condition assessment is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onComplete(formData);
    }
  };

  const animal = application.animal;

  return (
    <Card>
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Animal Verification</h2>
          <p className="text-gray-600">
            Verify livestock details, health status, and market value
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Animal Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Animal Details</h3>
            
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center mb-2">
                  <svg className="w-6 h-6 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <div className="text-lg font-medium text-green-700">
                    {animal?.type || 'N/A'}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-green-600">Breed:</span>
                    <div className="font-medium">{animal?.breed || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="text-green-600">Age:</span>
                    <div className="font-medium">{animal?.age || 'N/A'} years</div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center mb-2">
                  <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <div className="text-sm font-medium text-blue-700">Physical Attributes</div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-600">Weight:</span>
                    <span className="font-medium">{animal?.weight || 'N/A'} kg</span>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <div className="flex items-center mb-2">
                  <svg className="w-5 h-5 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.636 4.636a9 9 0 1212.728 0M12 3v9l4 4" />
                  </svg>
                  <div className="text-sm font-medium text-purple-700">Health Status</div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-purple-600">Health:</span>
                    <span className={`font-medium px-2 py-1 rounded text-xs ${
                      animal?.health_status?.toLowerCase() === 'healthy' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {animal?.health_status || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-600">Vaccination:</span>
                    <span className={`font-medium px-2 py-1 rounded text-xs ${
                      animal?.vaccination_status?.toLowerCase() === 'complete' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {animal?.vaccination_status || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <div className="flex items-center mb-2">
                  <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  <div className="text-sm font-medium text-yellow-700">Market Value</div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-yellow-600">Declared Value:</span>
                    <span className="font-medium text-lg">₹{animal?.market_value?.toLocaleString('en-IN') || '0'}</span>
                  </div>
                </div>
              </div>

              {/* Assessed Market Value */}
              <div className="mt-4">
                <Input
                  type="number"
                  label="Assessed Market Value (₹)"
                  value={formData.assessed_market_value}
                  onChange={(e) => handleInputChange('assessed_market_value', Number(e.target.value))}
                  placeholder="Enter assessed market value"
                />
              </div>
            </div>
          </div>

          {/* Verification Checklist */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Animal Verification Checklist</h3>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="animal_physically_verified"
                  checked={formData.animal_physically_verified}
                  onChange={(e) => handleInputChange('animal_physically_verified', e.target.checked)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="animal_physically_verified" className="text-sm font-medium text-gray-700">
                  Animal physically inspected and verified
                </label>
              </div>
              {errors.animal_physically_verified && (
                <p className="text-red-600 text-sm ml-7">{errors.animal_physically_verified}</p>
              )}

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="health_status_verified"
                  checked={formData.health_status_verified}
                  onChange={(e) => handleInputChange('health_status_verified', e.target.checked)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="health_status_verified" className="text-sm font-medium text-gray-700">
                  Health status verified by examination
                </label>
              </div>
              {errors.health_status_verified && (
                <p className="text-red-600 text-sm ml-7">{errors.health_status_verified}</p>
              )}

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="vaccination_records_verified"
                  checked={formData.vaccination_records_verified}
                  onChange={(e) => handleInputChange('vaccination_records_verified', e.target.checked)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="vaccination_records_verified" className="text-sm font-medium text-gray-700">
                  Vaccination records verified
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="market_value_assessed"
                  checked={formData.market_value_assessed}
                  onChange={(e) => handleInputChange('market_value_assessed', e.target.checked)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="market_value_assessed" className="text-sm font-medium text-gray-700">
                  Market value properly assessed
                </label>
              </div>
              {errors.market_value_assessed && (
                <p className="text-red-600 text-sm ml-7">{errors.market_value_assessed}</p>
              )}

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="ownership_verified"
                  checked={formData.ownership_verified}
                  onChange={(e) => handleInputChange('ownership_verified', e.target.checked)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="ownership_verified" className="text-sm font-medium text-gray-700">
                  Ownership documents verified
                </label>
              </div>
              {errors.ownership_verified && (
                <p className="text-red-600 text-sm ml-7">{errors.ownership_verified}</p>
              )}

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="animal_condition_satisfactory"
                  checked={formData.animal_condition_satisfactory}
                  onChange={(e) => handleInputChange('animal_condition_satisfactory', e.target.checked)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="animal_condition_satisfactory" className="text-sm font-medium text-gray-700">
                  Overall animal condition is satisfactory
                </label>
              </div>
              {errors.animal_condition_satisfactory && (
                <p className="text-red-600 text-sm ml-7">{errors.animal_condition_satisfactory}</p>
              )}

              <div className="mt-6">
                <Input
                  label="Animal Verification Notes"
                  placeholder="Add notes about animal verification, condition observations, etc..."
                  value={formData.animal_notes}
                  onChange={(e) => handleInputChange('animal_notes', e.target.value)}
                  multiline
                  rows={4}
                />
              </div>

              {/* Value Assessment Summary */}
              {formData.assessed_market_value && animal?.market_value && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-700 mb-2">Value Assessment</div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Declared Value:</span>
                      <span className="font-medium">₹{animal.market_value.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Assessed Value:</span>
                      <span className="font-medium">₹{formData.assessed_market_value.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between border-t pt-1">
                      <span>Difference:</span>
                      <span className={`font-medium ${
                        formData.assessed_market_value > animal.market_value ? 'text-green-600' : 
                        formData.assessed_market_value < animal.market_value ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {formData.assessed_market_value > animal.market_value ? '+' : ''}
                        ₹{(formData.assessed_market_value - animal.market_value).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              )}
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
            Next: Final Review
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        </div>
      </div>
    </Card>
  );
};