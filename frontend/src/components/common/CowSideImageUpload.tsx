import React, { useState, useCallback } from 'react';
import { Zap, Scale, Ruler, AlertCircle, CheckCircle } from 'lucide-react';
import { EnhancedImageUpload } from './EnhancedImageUpload';
import { operatorAPI } from '../../services/api';

interface CowSideImageUploadProps {
  label: string;
  description: string;
  onImagesProcessed: (data: any) => void;
  currentLeftImage?: string;
  currentRightImage?: string;
  applicationId?: string;
  breed?: string;
  age?: number;
  required?: boolean;
  predictionMode?: 'manual' | 'ai' | 'both';
}

interface WeightPredictionResult {
  success: boolean;
  manual_prediction?: number;
  ai_prediction?: number;
  visual_prediction?: number;
  average_prediction?: number;
  confidence_score?: number;
  measurements?: {
    heart_girth?: number;
    body_length?: number;
    reference_length?: number;
  };
  processing_details?: any;
  error?: string;
}

export const CowSideImageUpload: React.FC<CowSideImageUploadProps> = ({
  label,
  description,
  onImagesProcessed,
  currentLeftImage,
  currentRightImage,
  applicationId,
  breed = 'crossbred',
  age = 3,
  required = false,
  predictionMode = 'both'
}) => {
  const [leftImage, setLeftImage] = useState<string | undefined>(currentLeftImage);
  const [rightImage, setRightImage] = useState<string | undefined>(currentRightImage);
  const [predictionResult, setPredictionResult] = useState<WeightPredictionResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);

  // Manual input fields
  const [manualInputs, setManualInputs] = useState({
    heartGirth: '',
    bodyLength: '',
    referenceLength: ''
  });

  const handleLeftImageChange = useCallback((base64String: string) => {
    setLeftImage(base64String);
    setError(null);
    // Auto-process if both images are available and mode includes AI
    if (rightImage && (predictionMode === 'ai' || predictionMode === 'both')) {
      processWeightPrediction(base64String, rightImage);
    }
  }, [rightImage, predictionMode]);

  const handleRightImageChange = useCallback((base64String: string) => {
    setRightImage(base64String);
    setError(null);
    // Auto-process if both images are available and mode includes AI
    if (leftImage && (predictionMode === 'ai' || predictionMode === 'both')) {
      processWeightPrediction(leftImage, base64String);
    }
  }, [leftImage, predictionMode]);

  const processWeightPrediction = async (leftImg: string, rightImg: string) => {
    if (!applicationId) {
      setError('Application ID is required for weight prediction');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const requestData: any = {
        application_id: applicationId,
        left_side_image: leftImg,
        right_side_image: rightImg,
        breed: breed,
        age_years: age,
        prediction_mode: predictionMode
      };

      // Add manual measurements if in manual or both mode
      if (predictionMode === 'manual' || predictionMode === 'both') {
        if (manualInputs.heartGirth) {
          requestData.manual_heart_girth = parseFloat(manualInputs.heartGirth);
        }
        if (manualInputs.bodyLength) {
          requestData.manual_body_length = parseFloat(manualInputs.bodyLength);
        }
        if (manualInputs.referenceLength) {
          requestData.reference_length_cm = parseFloat(manualInputs.referenceLength);
        }
      }

      const response = await operatorAPI.predictCowWeight(requestData);

      if (response.success) {
        setPredictionResult(response);
        setShowResults(true);
        onImagesProcessed(response);
      } else {
        setError(response.error || 'Weight prediction failed');
      }
    } catch (err: any) {
      console.error('Weight prediction error:', err);
      setError(err.response?.data?.detail || 'Failed to process weight prediction');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualInputChange = (field: string, value: string) => {
    setManualInputs(prev => ({ ...prev, [field]: value }));
  };

  const handleManualPrediction = () => {
    if (!manualInputs.heartGirth || !manualInputs.bodyLength) {
      setError('Heart girth and body length are required for manual prediction');
      return;
    }

    // Simple manual calculation: Weight = (Heart Girth  Body Length)  30000
    const heartGirth = parseFloat(manualInputs.heartGirth);
    const bodyLength = parseFloat(manualInputs.bodyLength);
    const manualWeight = (heartGirth * heartGirth * bodyLength) / 30000;

    const result: WeightPredictionResult = {
      success: true,
      manual_prediction: manualWeight,
      measurements: {
        heart_girth: heartGirth,
        body_length: bodyLength,
        reference_length: manualInputs.referenceLength ? parseFloat(manualInputs.referenceLength) : undefined
      }
    };

    setPredictionResult(result);
    setShowResults(true);
    onImagesProcessed(result);
  };

  const clearImages = () => {
    setLeftImage(undefined);
    setRightImage(undefined);
    setPredictionResult(null);
    setError(null);
    setShowResults(false);
  };

  const validateManualInputs = () => {
    const errors: string[] = [];
    if ((predictionMode === 'manual' || predictionMode === 'both') && !manualInputs.heartGirth) {
      errors.push('Heart girth is required');
    }
    if ((predictionMode === 'manual' || predictionMode === 'both') && !manualInputs.bodyLength) {
      errors.push('Body length is required');
    }
    return errors;
  };

  const inputErrors = validateManualInputs();

  return (
    <div className="space-y-6">
      <div className="border border-gray-200 rounded-lg p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Scale className="w-5 h-5 mr-2 text-blue-600" />
            {label}
          </h3>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
          {required && <span className="text-red-500 ml-1">*</span>}
        </div>

        {/* Image Upload Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <EnhancedImageUpload
              label="Left Side Image"
              value={leftImage}
              onChange={handleLeftImageChange}
              accept="image/*"
              maxSize={10}
              preview={true}
              showCameraButton={true}
              compressionQuality={0.8}
              maxWidth={1024}
              maxHeight={1024}
              required={required}
            />
          </div>

          <div>
            <EnhancedImageUpload
              label="Right Side Image"
              value={rightImage}
              onChange={handleRightImageChange}
              accept="image/*"
              maxSize={10}
              preview={true}
              showCameraButton={true}
              compressionQuality={0.8}
              maxWidth={1024}
              maxHeight={1024}
              required={required}
            />
          </div>
        </div>

        {/* Manual Input Section */}
        {(predictionMode === 'manual' || predictionMode === 'both') && (
          <div className="border-t border-gray-200 pt-6">
            <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
              <Ruler className="w-4 h-4 mr-2 text-green-600" />
              Manual Measurements (Optional for AI enhancement)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Heart Girth (cm)
                </label>
                <input
                  type="number"
                  value={manualInputs.heartGirth}
                  onChange={(e) => handleManualInputChange('heartGirth', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 180"
                  min="50"
                  max="300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Body Length (cm)
                </label>
                <input
                  type="number"
                  value={manualInputs.bodyLength}
                  onChange={(e) => handleManualInputChange('bodyLength', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 150"
                  min="50"
                  max="250"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reference Length (cm) - Optional
                </label>
                <input
                  type="number"
                  value={manualInputs.referenceLength}
                  onChange={(e) => handleManualInputChange('referenceLength', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 100"
                  min="10"
                  max="200"
                />
              </div>
            </div>

            {inputErrors.length > 0 && (
              <div className="mb-4">
                {inputErrors.map((error, index) => (
                  <p key={index} className="text-sm text-red-600">{error}</p>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mt-6">
          {(predictionMode === 'ai' || predictionMode === 'both') && leftImage && rightImage && (
            <button
              onClick={() => processWeightPrediction(leftImage, rightImage)}
              disabled={isProcessing}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <Zap className="w-4 h-4 mr-2" />
              {isProcessing ? 'Processing...' : 'Predict Weight (AI)'}
            </button>
          )}

          {(predictionMode === 'manual' || predictionMode === 'both') && (
            <button
              onClick={handleManualPrediction}
              disabled={inputErrors.length > 0}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              <Scale className="w-4 h-4 mr-2" />
              Calculate Manually
            </button>
          )}

          {(leftImage || rightImage) && (
            <button
              onClick={clearImages}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Clear Images
            </button>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex">
              <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Results Display */}
      {showResults && predictionResult && (
        <div className="border border-gray-200 rounded-lg p-6 bg-green-50">
          <div className="flex items-center mb-4">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            <h4 className="text-lg font-semibold text-gray-900">Weight Prediction Results</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {predictionResult.manual_prediction && (
              <div className="bg-white p-4 rounded-lg border">
                <div className="text-sm text-gray-600">Manual Calculation</div>
                <div className="text-2xl font-bold text-green-600">
                  {predictionResult.manual_prediction.toFixed(1)} kg
                </div>
              </div>
            )}

            {predictionResult.ai_prediction && (
              <div className="bg-white p-4 rounded-lg border">
                <div className="text-sm text-gray-600">AI Prediction</div>
                <div className="text-2xl font-bold text-blue-600">
                  {predictionResult.ai_prediction.toFixed(1)} kg
                </div>
              </div>
            )}

            {predictionResult.visual_prediction && (
              <div className="bg-white p-4 rounded-lg border">
                <div className="text-sm text-gray-600">Visual Estimation</div>
                <div className="text-2xl font-bold text-purple-600">
                  {predictionResult.visual_prediction.toFixed(1)} kg
                </div>
              </div>
            )}

            {predictionResult.average_prediction && (
              <div className="bg-white p-4 rounded-lg border bg-gradient-to-r from-green-100 to-blue-100">
                <div className="text-sm text-gray-600">Average Prediction</div>
                <div className="text-2xl font-bold text-indigo-600">
                  {predictionResult.average_prediction.toFixed(1)} kg
                </div>
              </div>
            )}
          </div>

          {predictionResult.measurements && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h5 className="text-sm font-medium text-gray-700 mb-2">Measurements Used:</h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                {predictionResult.measurements.heart_girth && (
                  <div>Heart Girth: {predictionResult.measurements.heart_girth} cm</div>
                )}
                {predictionResult.measurements.body_length && (
                  <div>Body Length: {predictionResult.measurements.body_length} cm</div>
                )}
                {predictionResult.measurements.reference_length && (
                  <div>Reference Length: {predictionResult.measurements.reference_length} cm</div>
                )}
              </div>
            </div>
          )}

          {predictionResult.confidence_score && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center">
                <div className="text-sm text-gray-600 mr-2">Confidence Score:</div>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${predictionResult.confidence_score * 100}%` }}
                  ></div>
                </div>
                <div className="text-sm font-medium ml-2">
                  {Math.round(predictionResult.confidence_score * 100)}%
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
