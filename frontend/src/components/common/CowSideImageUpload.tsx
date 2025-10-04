import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, RotateCcw, Zap, AlertCircle, CheckCircle, Scale, Ruler } from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';
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

interface ProcessedData {
  success: boolean;
  measurements: any;
  weight_predictions: any;
  processing_details: any;
  left_side_results?: any;
  right_side_results?: any;
  visualization_left?: string;
  visualization_right?: string;
  error?: string;
  mode?: string;
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
  const [leftImage, setLeftImage] = useState<string | null>(currentLeftImage || null);
  const [rightImage, setRightImage] = useState<string | null>(currentRightImage || null);
  const [processing, setProcessing] = useState(false);
  const [processedData, setProcessedData] = useState<ProcessedData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState({ left: 0, right: 0 });
  const [selectedMode, setSelectedMode] = useState<'manual' | 'ai' | 'both'>(predictionMode);
  const [manualInputs, setManualInputs] = useState({
    heartGirth: '',
    bodyLength: '',
    referenceLength: ''
  });
  const [inputErrors, setInputErrors] = useState<Record<string, string>>({});

  const leftFileInputRef = useRef<HTMLInputElement>(null);
  const rightFileInputRef = useRef<HTMLInputElement>(null);

  const validateManualInputs = useCallback(() => {
    const errors: Record<string, string> = {};
    
    if (selectedMode === 'manual' || selectedMode === 'both') {
      if (!manualInputs.heartGirth || parseFloat(manualInputs.heartGirth) <= 0) {
        errors.heartGirth = 'Heart girth is required and must be positive';
      } else if (parseFloat(manualInputs.heartGirth) < 100 || parseFloat(manualInputs.heartGirth) > 300) {
        errors.heartGirth = 'Heart girth should be between 100-300 cm';
      }
      
      if (!manualInputs.bodyLength || parseFloat(manualInputs.bodyLength) <= 0) {
        errors.bodyLength = 'Body length is required and must be positive';
      } else if (parseFloat(manualInputs.bodyLength) < 80 || parseFloat(manualInputs.bodyLength) > 250) {
        errors.bodyLength = 'Body length should be between 80-250 cm';
      }
    }
    
    setInputErrors(errors);
    return Object.keys(errors).length === 0;
  }, [selectedMode, manualInputs]);

  const processImages = useCallback(async (leftImg: string, rightImg: string) => {
    if (!applicationId) {
      setError('Application ID is required for processing');
      return;
    }

    // Validate manual inputs if required
    if (!validateManualInputs()) {
      setError('Please correct the input errors before processing');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // Prepare request data based on mode
      const requestData: any = {
        application_id: applicationId,
        left_side_image: leftImg,
        right_side_image: rightImg,
        breed: breed,
        age_years: age,
        prediction_mode: selectedMode
      };

      // Add manual measurements if in manual or both mode
      if (selectedMode === 'manual' || selectedMode === 'both') {
        requestData.manual_heart_girth = parseFloat(manualInputs.heartGirth);
        requestData.manual_body_length = parseFloat(manualInputs.bodyLength);
        if (manualInputs.referenceLength) {
          requestData.reference_length_cm = parseFloat(manualInputs.referenceLength);
        }
      }

      // Use the API service instead of direct fetch
      const data = await operatorAPI.predictCowWeight(requestData);
      
      if (data.success) {
        setProcessedData(data);
        onImagesProcessed(data);
      } else {
        setError(data.error || 'Weight prediction failed');
      }
    } catch (error) {
      console.error('Error processing images:', error);
      setError('Failed to process images for weight prediction');
    } finally {
      setProcessing(false);
    }
  }, [applicationId, breed, age, selectedMode, manualInputs, onImagesProcessed, validateManualInputs]);

  // Auto-process when both images are available and in AI mode
  useEffect(() => {
    if (leftImage && rightImage && selectedMode === 'ai' && !processing) {
      processImages(leftImage, rightImage);
    }
  }, [leftImage, rightImage, selectedMode, processing, processImages]);

  const handleManualInputChange = (field: string, value: string) => {
    setManualInputs(prev => ({ ...prev, [field]: value }));
    if (inputErrors[field]) {
      setInputErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFileSelect = useCallback(async (file: File, side: 'left' | 'right') => {
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Image size should be less than 10MB');
      return;
    }

    setError(null);
    setUploadProgress(prev => ({ ...prev, [side]: 0 }));

    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        
        if (side === 'left') {
          setLeftImage(base64);
        } else {
          setRightImage(base64);
        }
        
        setUploadProgress(prev => ({ ...prev, [side]: 100 }));
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error reading file:', error);
      setError('Error reading the selected file');
      setUploadProgress(prev => ({ ...prev, [side]: 0 }));
    }
  }, []); // Remove dependencies that cause infinite re-renders

  const retryProcessing = () => {
    if (leftImage && rightImage) {
      processImages(leftImage, rightImage);
    }
  };

  const clearAll = () => {
    setLeftImage(null);
    setRightImage(null);
    setProcessedData(null);
    setError(null);
    setUploadProgress({ left: 0, right: 0 });
    setManualInputs({ heartGirth: '', bodyLength: '', referenceLength: '' });
    setInputErrors({});
    onImagesProcessed(null);
  };

  const renderImagePreview = (image: string | null, side: 'left' | 'right') => {
    const sideLabel = side === 'left' ? 'Left Side' : 'Right Side';
    const fileInputRef = side === 'left' ? leftFileInputRef : rightFileInputRef;
    const progress = uploadProgress[side];

    return (
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-gray-400 transition-colors">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              handleFileSelect(file, side);
            }
          }}
          className="hidden"
        />
        
        {image ? (
          <div className="space-y-3">
            <img
              src={image}
              alt={`${sideLabel} view`}
              className="w-full h-48 object-cover rounded-lg"
            />
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">{sideLabel}</span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Replace
              </Button>
            </div>
          </div>
        ) : (
          <div
            className="flex flex-col items-center justify-center py-8 cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <Camera className="w-12 h-12 text-gray-400 mb-2" />
            <p className="text-sm font-medium text-gray-700">{sideLabel}</p>
            <p className="text-xs text-gray-500 text-center mt-1">
              Click to upload or drag and drop
            </p>
            {progress > 0 && progress < 100 && (
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderManualInputs = () => {
    if (selectedMode === 'ai') return null;

    return (
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <div className="flex items-center space-x-2 mb-3">
          <Ruler className="w-4 h-4 text-blue-600" />
          <h4 className="text-sm font-semibold text-gray-900">Manual Measurements</h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Heart Girth (cm) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              placeholder="180"
              value={manualInputs.heartGirth}
              onChange={(e) => handleManualInputChange('heartGirth', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md text-sm ${
                inputErrors.heartGirth ? 'border-red-300' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {inputErrors.heartGirth && (
              <p className="text-xs text-red-600 mt-1">{inputErrors.heartGirth}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">Chest circumference around heart</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Body Length (cm) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              placeholder="150"
              value={manualInputs.bodyLength}
              onChange={(e) => handleManualInputChange('bodyLength', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md text-sm ${
                inputErrors.bodyLength ? 'border-red-300' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {inputErrors.bodyLength && (
              <p className="text-xs text-red-600 mt-1">{inputErrors.bodyLength}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">From shoulder to hip bone</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Reference Length (cm)
            </label>
            <input
              type="number"
              placeholder="Optional"
              value={manualInputs.referenceLength}
              onChange={(e) => handleManualInputChange('referenceLength', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Known measurement for calibration</p>
          </div>
        </div>

        <div className="mt-3 p-3 bg-white rounded-lg border border-blue-200">
          <p className="text-xs font-medium text-blue-800 mb-1">Formula Preview:</p>
          <p className="text-xs text-blue-700">
            Weight = (Heart Girth² × Body Length) ÷ 30,000
            {manualInputs.heartGirth && manualInputs.bodyLength && (
              <span className="ml-2 font-mono">
                = ({manualInputs.heartGirth}² × {manualInputs.bodyLength}) ÷ 30,000 = {' '}
                {((parseFloat(manualInputs.heartGirth) ** 2 * parseFloat(manualInputs.bodyLength)) / 30000).toFixed(1)} kg
              </span>
            )}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <p className="text-sm text-gray-600">{description}</p>
      </div>

      {/* Mode Selection */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Weight Prediction Mode</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <label className="relative flex items-center">
            <input
              type="radio"
              name="predictionMode"
              value="manual"
              checked={selectedMode === 'manual'}
              onChange={(e) => setSelectedMode(e.target.value as 'manual' | 'ai' | 'both')}
              className="sr-only"
            />
            <div className={`flex-1 p-3 border-2 rounded-lg cursor-pointer transition-all ${
              selectedMode === 'manual' 
                ? 'border-blue-500 bg-blue-50 text-blue-700' 
                : 'border-gray-300 bg-white hover:border-gray-400'
            }`}>
              <div className="text-sm font-medium">Manual Formula</div>
              <div className="text-xs text-gray-600 mt-1">
                Heart Girth² × Body Length ÷ 30,000
              </div>
            </div>
          </label>

          <label className="relative flex items-center">
            <input
              type="radio"
              name="predictionMode"
              value="ai"
              checked={selectedMode === 'ai'}
              onChange={(e) => setSelectedMode(e.target.value as 'manual' | 'ai' | 'both')}
              className="sr-only"
            />
            <div className={`flex-1 p-3 border-2 rounded-lg cursor-pointer transition-all ${
              selectedMode === 'ai' 
                ? 'border-green-500 bg-green-50 text-green-700' 
                : 'border-gray-300 bg-white hover:border-gray-400'
            }`}>
              <div className="text-sm font-medium">AI Prediction</div>
              <div className="text-xs text-gray-600 mt-1">
                Gemini AI Analysis
              </div>
            </div>
          </label>

          <label className="relative flex items-center">
            <input
              type="radio"
              name="predictionMode"
              value="both"
              checked={selectedMode === 'both'}
              onChange={(e) => setSelectedMode(e.target.value as 'manual' | 'ai' | 'both')}
              className="sr-only"
            />
            <div className={`flex-1 p-3 border-2 rounded-lg cursor-pointer transition-all ${
              selectedMode === 'both' 
                ? 'border-purple-500 bg-purple-50 text-purple-700' 
                : 'border-gray-300 bg-white hover:border-gray-400'
            }`}>
              <div className="text-sm font-medium">Combined</div>
              <div className="text-xs text-gray-600 mt-1">
                Manual + AI Weighted
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Manual Input Section */}
      {renderManualInputs()}

      {/* Image Upload Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderImagePreview(leftImage, 'left')}
        {renderImagePreview(rightImage, 'right')}
      </div>

      {/* Processing Status */}
      {processing && (
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <div>
              <p className="text-sm font-medium text-gray-900">Processing Images...</p>
              <p className="text-xs text-gray-600">
                Analyzing cow measurements and predicting weight using {selectedMode} mode
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Card className="p-4 bg-red-50 border-red-200">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">Processing Error</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              {leftImage && rightImage && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={retryProcessing}
                  className="mt-2"
                >
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Retry
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Success and Results */}
      {processedData?.success && (
        <Card className="p-4 bg-green-50 border-green-200">
          <div className="space-y-4">
            {/* Success Header */}
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-800">Weight Prediction Complete</p>
                <p className="text-xs text-green-700 mt-1">
                  Analysis method: {processedData.processing_details?.method?.replace('_', ' ')} 
                  ({processedData.processing_details?.confidence} confidence)
                </p>
              </div>
            </div>

            {/* Weight Predictions */}
            {processedData.weight_predictions && (
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <div className="flex items-center space-x-2 mb-3">
                  <Scale className="w-4 h-4 text-green-600" />
                  <h4 className="text-sm font-semibold text-gray-900">Weight Predictions</h4>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                    Mode: {processedData.mode || selectedMode}
                  </span>
                </div>
                
                <div className="space-y-4">
                  {/* Manual Prediction */}
                  {processedData.weight_predictions.manual_weight_kg && (
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium text-blue-800">Manual Formula</p>
                          <p className="text-lg font-bold text-blue-900">
                            {Math.round(processedData.weight_predictions.manual_weight_kg)} kg
                          </p>
                          <p className="text-xs text-blue-600 mt-1">
                            {processedData.weight_predictions.formula_used}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-blue-600">Heart Girth</p>
                          <p className="text-sm font-medium">{processedData.weight_predictions.heart_girth_cm?.toFixed(1)} cm</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* AI Prediction */}
                  {processedData.weight_predictions.ai_weight_kg && (
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-green-800">AI Prediction</p>
                          <p className="text-lg font-bold text-green-900">
                            {Math.round(processedData.weight_predictions.ai_weight_kg)} kg
                          </p>
                          {processedData.weight_predictions.ai_confidence && (
                            <p className="text-xs text-green-600 mt-1">
                              Confidence: {Math.round(processedData.weight_predictions.ai_confidence * 100)}%
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-green-600">Model</p>
                          <p className="text-xs font-medium">{processedData.weight_predictions.ai_model}</p>
                        </div>
                      </div>
                      {processedData.weight_predictions.ai_reasoning && (
                        <div className="mt-2 p-2 bg-white rounded text-xs text-gray-700">
                          <strong>AI Analysis:</strong> {processedData.weight_predictions.ai_reasoning}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Combined Prediction */}
                  {processedData.weight_predictions.combined_weight_kg && (
                    <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium text-purple-800">Combined Prediction</p>
                          <p className="text-xl font-bold text-purple-900">
                            {Math.round(processedData.weight_predictions.combined_weight_kg)} kg
                          </p>
                          <p className="text-xs text-purple-600 mt-1">
                            {processedData.weight_predictions.combined_method}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-purple-600">Agreement</p>
                          <p className="text-sm font-medium">
                            {(processedData.weight_predictions.agreement_score * 100).toFixed(0)}%
                          </p>
                        </div>
                      </div>
                      {processedData.weight_predictions.weight_difference && (
                        <p className="text-xs text-purple-600 mt-2">
                          Manual vs AI difference: {processedData.weight_predictions.weight_difference.toFixed(1)} kg
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Body Measurements */}
            {processedData.measurements && (
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Body Measurements</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                  {Object.entries(processedData.measurements)
                    .filter(([key, value]) => key.includes('_cm') && value)
                    .map(([measurement, value]) => (
                      <div key={measurement} className="flex justify-between">
                        <span className="text-gray-600 capitalize">
                          {measurement.replace('_cm', '').replace('_', ' ')}:
                        </span>
                        <span className="font-medium">
                          {typeof value === 'number' ? `${value.toFixed(1)} cm` : String(value)}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button variant="secondary" onClick={clearAll}>
          <RotateCcw className="w-4 h-4 mr-1" />
          Clear All
        </Button>
        
        {leftImage && rightImage && !processing && !processedData?.success && (
          <Button 
            onClick={() => processImages(leftImage, rightImage)}
            disabled={(selectedMode !== 'ai' && !validateManualInputs())}
          >
            <Zap className="w-4 h-4 mr-1" />
            Predict Weight ({selectedMode})
          </Button>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <div className="text-sm text-blue-800">
          <p className="font-medium mb-2">Weight Prediction Instructions:</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li><strong>Manual Mode:</strong> Enter heart girth and body length measurements, upload side images for reference</li>
            <li><strong>AI Mode:</strong> Only upload clear side-view images, AI analyzes all measurements automatically</li>
            <li><strong>Combined Mode:</strong> Enter manual measurements AND upload images for best accuracy</li>
            <li>Ensure the cow is standing normally and fully visible in both side images</li>
            <li>Good lighting and minimal background clutter improve accuracy</li>
          </ul>
        </div>
      </div>
    </div>
  );
};