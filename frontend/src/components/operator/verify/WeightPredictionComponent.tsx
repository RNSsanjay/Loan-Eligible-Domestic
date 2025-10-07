import React, { useState } from 'react';
import { Card } from '../../common/Card';
import { Input } from '../../common/Input';
import { Button } from '../../common/Button';
import { EnhancedImageUpload } from '../../common/EnhancedImageUpload';
import { operatorAPI } from '../../../services/api';
import { Scale, Zap, Eye } from 'lucide-react';

interface WeightPredictionComponentProps {
    application: any;
    onWeightPredicted: (weightData: any) => void;
}

export const WeightPredictionComponent: React.FC<WeightPredictionComponentProps> = ({
    application,
    onWeightPredicted
}) => {
    const [formData, setFormData] = useState({
        left_side_image: '',
        right_side_image: '',
        breed: application.animal?.breed || 'crossbred',
        age_years: application.animal?.age || 3,
        prediction_mode: 'manual' as 'manual' | 'ai' | 'visual',
        manual_heart_girth: '',
        manual_body_length: ''
    });

    const [predictionResult, setPredictionResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setError('');
    };

    const validateForm = () => {
        if (!formData.left_side_image) {
            setError('Left side image is required');
            return false;
        }
        if (!formData.right_side_image) {
            setError('Right side image is required');
            return false;
        }
        if (formData.prediction_mode === 'manual') {
            if (!formData.manual_heart_girth || !formData.manual_body_length) {
                setError('Manual measurements are required for manual prediction mode');
                return false;
            }
        }
        return true;
    };

    const handlePredict = async () => {
        if (!validateForm()) return;

        setLoading(true);
        setError('');

        try {
            const requestData = {
                application_id: application.id,
                left_side_image: formData.left_side_image,
                right_side_image: formData.right_side_image,
                breed: formData.breed,
                age_years: formData.age_years,
                prediction_mode: formData.prediction_mode,
                manual_heart_girth: formData.manual_heart_girth ? parseFloat(formData.manual_heart_girth) : undefined,
                manual_body_length: formData.manual_body_length ? parseFloat(formData.manual_body_length) : undefined
            };

            const result = await operatorAPI.predictCowWeight(requestData);

            if (result.success) {
                setPredictionResult(result);
                onWeightPredicted(result);
            } else {
                setError(result.message || 'Weight prediction failed');
            }
        } catch (err: any) {
            setError(err.response?.data?.detail || err.message || 'Failed to predict weight');
        } finally {
            setLoading(false);
        }
    };

    const getPredictionModeIcon = (mode: string) => {
        switch (mode) {
            case 'manual': return <Scale className="w-5 h-5" />;
            case 'ai': return <Zap className="w-5 h-5" />;
            case 'visual': return <Eye className="w-5 h-5" />;
            default: return <Scale className="w-5 h-5" />;
        }
    };

    const getPredictionModeDescription = (mode: string) => {
        switch (mode) {
            case 'manual': return 'Uses manual measurements with proven formula';
            case 'ai': return 'AI-powered analysis using Gemini models';
            case 'visual': return 'Computer vision measurement extraction';
            default: return '';
        }
    };

    return (
        <Card>
            <div className="p-6">
                <div className="mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center">
                        <Scale className="w-6 h-6 mr-2 text-green-600" />
                        Weight Prediction
                    </h3>
                    <p className="text-gray-600">
                        Upload side view images and predict cow weight using advanced algorithms
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Image Upload Section */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900">Side View Images</h4>

                        <div>
                            <EnhancedImageUpload
                                label="Left Side Image"
                                value={formData.left_side_image}
                                onChange={(base64) => handleInputChange('left_side_image', base64)}
                                maxSize={2}
                                required
                            />
                        </div>

                        <div>
                            <EnhancedImageUpload
                                label="Right Side Image"
                                value={formData.right_side_image}
                                onChange={(base64) => handleInputChange('right_side_image', base64)}
                                maxSize={2}
                                required
                            />
                        </div>

                        {/* Animal Info */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h5 className="font-medium text-gray-700 mb-3">Animal Information</h5>
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="Breed"
                                    value={formData.breed}
                                    onChange={(e) => handleInputChange('breed', e.target.value)}
                                />
                                <Input
                                    label="Age (years)"
                                    type="number"
                                    value={formData.age_years}
                                    onChange={(e) => handleInputChange('age_years', parseInt(e.target.value) || 0)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Prediction Settings */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900">Prediction Method</h4>

                        {/* Prediction Mode Selection */}
                        <div className="space-y-3">
                            {(['manual', 'ai', 'visual'] as const).map((mode) => (
                                <label key={mode} className="flex items-start space-x-3 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="prediction_mode"
                                        value={mode}
                                        checked={formData.prediction_mode === mode}
                                        onChange={(e) => handleInputChange('prediction_mode', e.target.value)}
                                        className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2">
                                            {getPredictionModeIcon(mode)}
                                            <span className="font-medium text-gray-700 capitalize">{mode} Prediction</span>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {getPredictionModeDescription(mode)}
                                        </p>
                                    </div>
                                </label>
                            ))}
                        </div>

                        {/* Manual Measurements (only for manual mode) */}
                        {formData.prediction_mode === 'manual' && (
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                <h5 className="font-medium text-blue-700 mb-3">Manual Measurements</h5>
                                <div className="space-y-3">
                                    <Input
                                        label="Heart Girth (cm)"
                                        type="number"
                                        value={formData.manual_heart_girth}
                                        onChange={(e) => handleInputChange('manual_heart_girth', e.target.value)}
                                        placeholder="e.g., 180"
                                        required
                                    />
                                    <Input
                                        label="Body Length (cm)"
                                        type="number"
                                        value={formData.manual_body_length}
                                        onChange={(e) => handleInputChange('manual_body_length', e.target.value)}
                                        placeholder="e.g., 150"
                                        required
                                    />
                                </div>
                                <div className="mt-3 text-sm text-blue-600">
                                    Formula: Weight = (Heart Girth² × Body Length) ÷ 30000
                                </div>
                            </div>
                        )}

                        {/* Predict Button */}
                        <Button
                            onClick={handlePredict}
                            disabled={loading}
                            className="w-full"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center space-x-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span>Predicting Weight...</span>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center space-x-2">
                                    <Scale className="w-4 h-4" />
                                    <span>Predict Weight</span>
                                </div>
                            )}
                        </Button>

                        {/* Error Display */}
                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-red-700 text-sm">{error}</p>
                            </div>
                        )}

                        {/* Prediction Result */}
                        {predictionResult && predictionResult.prediction_result && (
                            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                <h5 className="font-medium text-green-700 mb-3">Prediction Result</h5>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-green-600">Predicted Weight:</span>
                                        <span className="font-bold text-green-800">
                                            {predictionResult.prediction_result.predicted_weight?.toFixed(1)} kg
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-green-600">Confidence:</span>
                                        <span className="font-medium text-green-700">
                                            {(predictionResult.prediction_result.confidence * 100)?.toFixed(1)}%
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-green-600">Method:</span>
                                        <span className="font-medium text-green-700 capitalize">
                                            {predictionResult.prediction_result.method?.replace('_', ' ')}
                                        </span>
                                    </div>

                                    {predictionResult.prediction_result.processing_notes && (
                                        <div className="mt-3 pt-3 border-t border-green-200">
                                            <p className="text-sm text-green-600">
                                                <strong>Notes:</strong> {predictionResult.prediction_result.processing_notes.join(', ')}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
};