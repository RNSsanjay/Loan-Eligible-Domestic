import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AnimatedBackground } from '../../common/AnimatedBackground';
import { Button } from '../../common/Button';
import { Card } from '../../common/Card';
import { BasicInfoVerification } from '../verify/BasicInfoVerification';
import { DocumentVerification } from '../verify/DocumentVerification';
import { FinancialVerification } from '../verify/FinancialVerification';
import { AnimalVerification } from '../verify/AnimalVerification';
import { FinalReview } from '../verify/FinalReview';
import { operatorAPI } from '../../../services/api';

interface LoanApplication {
  id: string;
  application_number: string;
  applicant_id: string;
  animal_id: string;
  loan_amount: number;
  purpose: string;
  repayment_period: number;
  status: string;
  applicant: {
    name: string;
    phone: string;
    email?: string;
    address: string;
    aadhar_number: string;
    pan_number?: string;
    bank_account_number: string;
    bank_name: string;
    ifsc_code: string;
    annual_income: number;
    family_members: any[];
  };
  animal: {
    type: string;
    breed: string;
    age: number;
    weight: number;
    health_status: string;
    vaccination_status: string;
    market_value: number;
  };
}

interface VerificationStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  current: boolean;
}

export const VerificationStepper: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [application, setApplication] = useState<LoanApplication | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [stepData, setStepData] = useState<Record<number, any>>({});

  const steps: VerificationStep[] = [
    {
      id: 'basic-info',
      title: 'Basic Information',
      description: 'Verify applicant personal details',
      completed: completedSteps.has(0),
      current: currentStep === 0
    },
    {
      id: 'documents',
      title: 'Document Verification',
      description: 'Verify identity and address documents',
      completed: completedSteps.has(1),
      current: currentStep === 1
    },
    {
      id: 'financial',
      title: 'Financial Assessment',
      description: 'Verify income and financial capacity',
      completed: completedSteps.has(2),
      current: currentStep === 2
    },
    {
      id: 'animal',
      title: 'Animal Verification',
      description: 'Verify livestock details and health',
      completed: completedSteps.has(3),
      current: currentStep === 3
    },
    {
      id: 'review',
      title: 'Final Review',
      description: 'Review all verifications and submit',
      completed: completedSteps.has(4),
      current: currentStep === 4
    }
  ];

  useEffect(() => {
    fetchApplication();
  }, [id]);

  const fetchApplication = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await operatorAPI.getLoanApplicationById(id!);

      // Ensure the response has the expected structure
      if (!response || !response.id) {
        throw new Error('Invalid application data received');
      }

      // Handle the case where applicant or animal might be arrays or objects
      const processedApplication = {
        ...response,
        applicant: Array.isArray(response.applicant) ? response.applicant[0] : response.applicant,
        animal: Array.isArray(response.animal) ? response.animal[0] : response.animal
      };

      // Validate that we have the necessary data
      if (!processedApplication.applicant) {
        throw new Error('Application missing applicant information');
      }
      if (!processedApplication.animal) {
        throw new Error('Application missing animal information');
      }

      setApplication(processedApplication);

      // Load saved verification data
      if (processedApplication.verification_step_data) {
        const savedData = processedApplication.verification_step_data;
        if (savedData.basic_info_verification) {
          setStepData(prev => ({ ...prev, [0]: savedData.basic_info_verification }));
          // Mark basic info as completed if it has data
          const newCompletedSteps = new Set(completedSteps);
          newCompletedSteps.add(0);
          setCompletedSteps(newCompletedSteps);
        }
        // Load other steps if they exist
        // You can extend this for other verification steps
      }
    } catch (err: any) {
      console.error('Error fetching application:', err);
      setError(err.message || 'Failed to fetch application');
    } finally {
      setLoading(false);
    }
  };

  const handleStepComplete = async (stepIndex: number, data: any) => {
    try {
      // Save step data locally
      setStepData(prev => ({ ...prev, [stepIndex]: data }));

      // Save to database
      await operatorAPI.saveVerificationStep({
        application_id: id!,
        step_data: {
          step_index: stepIndex,
          step_name: steps[stepIndex].id,
          step_data: data,
          completed_at: new Date().toISOString(),
          verification_timestamp: new Date().toISOString()
        }
      });

      // Mark step as completed
      const newCompletedSteps = new Set(completedSteps);
      newCompletedSteps.add(stepIndex);
      setCompletedSteps(newCompletedSteps);

      // Send email notification for first verification completed
      if (stepIndex === 0 && !completedSteps.has(0)) {
        try {
          await operatorAPI.sendVerificationStepEmail(id!, 'first_step_completed', {
            applicant_name: application?.applicant?.name,
            step_name: steps[stepIndex].title
          });
        } catch (error) {
          console.error('Failed to send first step email:', error);
          // Continue with the process even if email fails
        }
      }

      // If not the last step, move to next
      if (stepIndex < steps.length - 1) {
        setCurrentStep(stepIndex + 1);
      } else {
        // Last step - send final email and complete verification
        try {
          await operatorAPI.sendVerificationStepEmail(id!, 'all_verifications_complete', {
            applicant_name: application?.applicant?.name,
            application_number: application?.application_number
          });
        } catch (error) {
          console.error('Failed to send completion email:', error);
          // Continue with the process even if email fails
        }

        try {
          // Mark application as verified
          await operatorAPI.completeVerification(id!, {
            verification_data: { ...stepData, [stepIndex]: data },
            all_steps_completed: true
          });

          // Navigate back to applications list
          navigate('/operator/applications');
        } catch (error) {
          console.error('Failed to complete verification:', error);
          setError('Failed to complete verification process');
        }
      }
    } catch (error) {
      console.error('Error in step completion:', error);
      setError('An error occurred while processing the verification step');
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderCurrentStep = () => {
    if (!application) return null;

    const stepProps = {
      application,
      data: stepData[currentStep] || {},
      onComplete: (data: any) => handleStepComplete(currentStep, data),
      onPrevious: currentStep > 0 ? handlePreviousStep : undefined
    };

    switch (currentStep) {
      case 0:
        return <BasicInfoVerification {...stepProps} />;
      case 1:
        return <DocumentVerification {...stepProps} />;
      case 2:
        return <FinancialVerification {...stepProps} />;
      case 3:
        return <AnimalVerification {...stepProps} />;
      case 4:
        return <FinalReview {...stepProps} allStepData={stepData} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen relative bg-gradient-to-br from-green-50 to-white">
        <AnimatedBackground />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="min-h-screen relative bg-gradient-to-br from-green-50 to-white">
        <AnimatedBackground />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <Card className="max-w-md mx-auto">
            <div className="text-center">
              <div className="text-red-600 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 19c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Application</h3>
              <p className="text-gray-600 mb-4">{error || 'Application not found'}</p>
              <Button onClick={() => navigate('/operator/applications')}>
                Back to Applications
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-green-50 to-white">
      <AnimatedBackground />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Verification Process</h1>
              <p className="text-gray-600 mt-1">
                Application #{application.application_number || 'N/A'} - {application.applicant?.name || 'Unknown Applicant'}
              </p>
            </div>
            <Button
              variant="secondary"
              onClick={() => navigate('/operator/applications')}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Applications
            </Button>
          </div>
        </div>

        {/* Progress Steps */}
        <Card className="mb-8">
          <div className="p-6">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step.completed
                          ? 'bg-green-600 text-white'
                          : step.current
                            ? 'bg-green-100 text-green-600 ring-2 ring-green-600'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                    >
                      {step.completed ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        index + 1
                      )}
                    </div>
                    <div className="ml-3">
                      <div className={`text-sm font-medium ${step.current ? 'text-green-600' : 'text-gray-900'}`}>
                        {step.title}
                      </div>
                      <div className="text-xs text-gray-500">{step.description}</div>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 ml-4 mr-4 ${step.completed ? 'bg-green-600' : 'bg-gray-200'
                        }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Current Step Content */}
        <div className="mb-8">
          {renderCurrentStep()}
        </div>
      </div>
    </div>
  );
};