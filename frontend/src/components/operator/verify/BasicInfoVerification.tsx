import React, { useState, useCallback } from 'react';
import { Card } from '../../common/Card';
import { Input } from '../../common/Input';
import { Button } from '../../common/Button';
import { CowFaceUpload } from '../../common/CowFaceUpload';
import { CowSideImageUpload } from '../../common/CowSideImageUpload';

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
    // Applicant verification
    name_verified: data.name_verified || false,
    phone_verified: data.phone_verified || false,
    address_verified: data.address_verified || false,
    aadhar_verified: data.aadhar_verified || false,

    // Animal verification
    animal_physical_verified: data.animal_physical_verified || false,
    animal_ownership_verified: data.animal_ownership_verified || false,
    animal_health_verified: data.animal_health_verified || false,

    // Images and pattern data
    cow_face_image: data.cow_face_image || '',
    cow_face_processed_data: data.cow_face_processed_data || null,

    // Weight prediction data
    side_images_left: data.side_images_left || '',
    side_images_right: data.side_images_right || '',
    weight_prediction_data: data.weight_prediction_data || null,

    // Additional animal details
    animal_tag_number: data.animal_tag_number || '',
    animal_unique_marks: data.animal_unique_marks || '',
    animal_location: data.animal_location || '',

    verification_notes: data.verification_notes || '',
    ...data
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = useCallback((field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  const handleImagesProcessed = useCallback((weightData: any) => {
    if (weightData) {
      handleInputChange('side_images_left', weightData.left_side_results?.processed_image || '');
      handleInputChange('side_images_right', weightData.right_side_results?.processed_image || '');
      handleInputChange('weight_prediction_data', weightData);
    } else {
      handleInputChange('side_images_left', '');
      handleInputChange('side_images_right', '');
      handleInputChange('weight_prediction_data', null);
    }
  }, [handleInputChange]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Applicant validations
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

    // Animal validations (only for cows)
    if (application?.animal?.type === 'cow') {
      if (!formData.animal_physical_verified) {
        newErrors.animal_physical_verified = 'Animal physical verification is required';
      }
      if (!formData.animal_ownership_verified) {
        newErrors.animal_ownership_verified = 'Animal ownership verification is required';
      }
      if (!formData.animal_health_verified) {
        newErrors.animal_health_verified = 'Animal health verification is required';
      }
      if (!formData.cow_face_image) {
        newErrors.cow_face_image = 'Cow face image is required';
      }
      if (formData.cow_face_processed_data?.is_duplicate) {
        newErrors.cow_face_image = 'This cow already has a loan application (duplicate nose pattern detected)';
      }
      if (!formData.weight_prediction_data?.success) {
        newErrors.weight_prediction = 'Weight prediction from side images is required';
      }
      if (!formData.animal_tag_number) {
        newErrors.animal_tag_number = 'Animal tag number is required';
      }
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Information Verification</h2>
          <p className="text-gray-600">
            Verify all applicant details and animal information with required documentation
          </p>
        </div>

        <div className="space-y-8">
          {/* Applicant Information Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Applicant Details */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-2">1</span>
                Applicant Details
              </h3>

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

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-gray-700">Annual Income</div>
                  <div className="text-lg text-gray-900">₹{application?.applicant?.annual_income?.toLocaleString() || 'N/A'}</div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-gray-700">Bank Details</div>
                  <div className="text-sm text-gray-900">
                    <div>Account: {application?.applicant?.bank_account_number || 'N/A'}</div>
                    <div>Bank: {application?.applicant?.bank_name || 'N/A'}</div>
                    <div>IFSC: {application?.applicant?.ifsc_code || 'N/A'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Applicant Verification Checklist */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Applicant Verification</h3>

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
              </div>
            </div>
          </div>

          {/* Animal Information Section - Only for Cows */}
          {application?.animal?.type === 'cow' && (
            <>
              <div className="border-t border-gray-200 pt-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Animal Details */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-bold mr-2">2</span>
                      Animal Details
                    </h3>

                    <div className="space-y-4">
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="text-sm font-medium text-gray-700">Animal Type</div>
                        <div className="text-lg text-gray-900 capitalize">{application?.animal?.type || 'N/A'}</div>
                      </div>

                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="text-sm font-medium text-gray-700">Breed</div>
                        <div className="text-lg text-gray-900">{application?.animal?.breed || 'N/A'}</div>
                      </div>

                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="text-sm font-medium text-gray-700">Age</div>
                        <div className="text-lg text-gray-900">{application?.animal?.age || 'N/A'} years</div>
                      </div>

                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="text-sm font-medium text-gray-700">Weight</div>
                        <div className="text-lg text-gray-900">{application?.animal?.weight || 'N/A'} kg</div>
                      </div>

                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="text-sm font-medium text-gray-700">Health Status</div>
                        <div className="text-lg text-gray-900">{application?.animal?.health_status || 'N/A'}</div>
                      </div>

                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="text-sm font-medium text-gray-700">Vaccination Status</div>
                        <div className="text-lg text-gray-900">{application?.animal?.vaccination_status || 'N/A'}</div>
                      </div>

                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="text-sm font-medium text-gray-700">Market Value</div>
                        <div className="text-lg text-gray-900">₹{application?.animal?.market_value?.toLocaleString() || 'N/A'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Animal Verification */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Animal Verification</h3>

                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="animal_physical_verified"
                          checked={formData.animal_physical_verified}
                          onChange={(e) => handleInputChange('animal_physical_verified', e.target.checked)}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <label htmlFor="animal_physical_verified" className="text-sm font-medium text-gray-700">
                          Animal physically present and matches description
                        </label>
                      </div>
                      {errors.animal_physical_verified && (
                        <p className="text-red-600 text-sm ml-7">{errors.animal_physical_verified}</p>
                      )}

                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="animal_ownership_verified"
                          checked={formData.animal_ownership_verified}
                          onChange={(e) => handleInputChange('animal_ownership_verified', e.target.checked)}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <label htmlFor="animal_ownership_verified" className="text-sm font-medium text-gray-700">
                          Ownership documents verified
                        </label>
                      </div>
                      {errors.animal_ownership_verified && (
                        <p className="text-red-600 text-sm ml-7">{errors.animal_ownership_verified}</p>
                      )}

                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="animal_health_verified"
                          checked={formData.animal_health_verified}
                          onChange={(e) => handleInputChange('animal_health_verified', e.target.checked)}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <label htmlFor="animal_health_verified" className="text-sm font-medium text-gray-700">
                          Health and vaccination records verified
                        </label>
                      </div>
                      {errors.animal_health_verified && (
                        <p className="text-red-600 text-sm ml-7">{errors.animal_health_verified}</p>
                      )}

                      {/* Additional Animal Details */}
                      <div className="mt-6 space-y-4">
                        <Input
                          label="Animal Tag Number"
                          placeholder="Enter unique tag/identification number"
                          value={formData.animal_tag_number}
                          onChange={(e) => handleInputChange('animal_tag_number', e.target.value)}
                          required
                        />
                        {errors.animal_tag_number && (
                          <p className="text-red-600 text-sm">{errors.animal_tag_number}</p>
                        )}

                        <Input
                          label="Unique Identifying Marks"
                          placeholder="Describe any unique marks, scars, or features"
                          value={formData.animal_unique_marks}
                          onChange={(e) => handleInputChange('animal_unique_marks', e.target.value)}
                          multiline
                          rows={2}
                        />

                        <Input
                          label="Animal Location"
                          placeholder="Current location where animal is kept"
                          value={formData.animal_location}
                          onChange={(e) => handleInputChange('animal_location', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cow Face Image Upload with Pattern Recognition */}
              <div className="border-t border-gray-200 pt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold mr-2">3</span>
                  Cow Face Image & Nose Pattern Analysis
                </h3>

                <div className="max-w-2xl">
                  <CowFaceUpload
                    label="Cow Face Image"
                    description="Upload a clear front-facing image of the cow's face. You will manually select the nose area for pattern analysis."
                    onImageProcessed={(processedData) => {
                      if (processedData) {
                        handleInputChange('cow_face_image', processedData.processed_data?.original_face_base64 || '');
                        handleInputChange('cow_face_processed_data', processedData);
                      } else {
                        handleInputChange('cow_face_image', '');
                        handleInputChange('cow_face_processed_data', null);
                      }
                    }}
                    currentImage={formData.cow_face_image}
                    applicationId={application?.id}
                    required
                  />
                  {errors.cow_face_image && (
                    <p className="text-red-600 text-sm mt-2">{errors.cow_face_image}</p>
                  )}

                  {formData.cow_face_processed_data?.is_duplicate && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <svg className="w-5 h-5 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.312 15.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <div className="text-sm text-red-800">
                          <p className="font-medium">Duplicate Pattern Detected!</p>
                          <p className="mt-1">
                            This cow's nose pattern matches an existing application.
                            {formData.cow_face_processed_data.duplicate_applicant_name && (
                              <span className="block">
                                Existing applicant: <strong>{formData.cow_face_processed_data.duplicate_applicant_name}</strong>
                              </span>
                            )}
                          </p>
                          <p className="mt-2 text-xs">
                            Each cow can only have one loan application. Please verify this is not a duplicate submission.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">Advanced Nose Pattern Recognition:</p>
                    <ul className="mt-1 list-disc list-inside space-y-1">
                      <li>Upload clear cow face image (minimum 1920x1080 recommended)</li>
                      <li>Manual nose area selection with zoom interface</li>
                      <li>AI-powered pattern extraction and quality enhancement</li>
                      <li>Unique pattern verification against existing records</li>
                      <li>One cow per loan enforcement through biometric identification</li>
                      <li>Secure pattern storage with duplicate prevention</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Cow Weight Prediction Section */}
              <div className="border-t border-gray-200 pt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <span className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-bold mr-2">4</span>
                  Weight Prediction from Side Images
                </h3>

                <div className="max-w-4xl">
                  <CowSideImageUpload
                    label="Cow Side View Images"
                    description="Upload clear side-view images from both left and right sides for accurate weight prediction."
                    onImagesProcessed={handleImagesProcessed}
                    currentLeftImage={formData.side_images_left}
                    currentRightImage={formData.side_images_right}
                    applicationId={application?.id}
                    breed={application?.animal?.breed}
                    age={application?.animal?.age}
                    required
                  />
                  {errors.weight_prediction && (
                    <p className="text-red-600 text-sm mt-2">{errors.weight_prediction}</p>
                  )}
                </div>
              </div>
            </>
          )}

          {/* General Notes Section */}
          <div className="border-t border-gray-200 pt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Verification Notes</h3>
            <Input
              label="Additional Notes and Observations"
              placeholder="Add any additional notes, observations, or important remarks about the verification process..."
              value={formData.verification_notes}
              onChange={(e) => handleInputChange('verification_notes', e.target.value)}
              multiline
              rows={4}
            />
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