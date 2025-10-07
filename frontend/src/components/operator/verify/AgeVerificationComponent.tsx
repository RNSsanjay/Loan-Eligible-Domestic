import React, { useState } from 'react';
import { Card } from '../../common/Card';
import { Input } from '../../common/Input';
import { Button } from '../../common/Button';
import { EnhancedImageUpload } from '../../common/EnhancedImageUpload';
import { operatorAPI } from '../../../services/api';
import { Clock, Zap, Eye } from 'lucide-react';

interface AgeVerificationComponentProps {
    application: any;
    onAgeVerified: (ageData: any) => void;
}

export const AgeVerificationComponent: React.FC<AgeVerificationComponentProps> = ({
    application,
    onAgeVerified
}) => {
    const [formData, setFormData] = useState({
        left_side_image: '',
        right_side_image: '',
        breed: application.animal?.breed || 'crossbred',
        age_years: application.animal?.age || 3,
        verification_mode: 'manual' as 'manual' | 'ai' | 'visual',
        manual_heart_girth: '',
        manual_body_length: ''
    });

    const [verificationResult, setVerificationResult] = useState<any>(null);
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
        if (formData.verification_mode === 'manual') {
            if (!formData.manual_heart_girth || !formData.manual_body_length) {
                setError('Manual measurements are required for manual verification mode');
                return false;
            }
        }
        return true;
    };

    const handleVerify = async () => {
        if (!validateForm()) return;

        setLoading(true);
        setError('');

        try {
            // For now, we'll use the same weight prediction endpoint but focus on age
            // In a real implementation, you might want a separate age verification endpoint
            const requestData = {
                application_id: application.id,
                left_side_image: formData.left_side_image,
                right_side_image: formData.right_side_image,
                breed: formData.breed,
                age_years: formData.age_years,
                prediction_mode: formData.verification_mode,
                manual_heart_girth: formData.manual_heart_girth ? parseFloat(formData.manual_heart_girth) : undefined,
                manual_body_length: formData.manual_body_length ? parseFloat(formData.manual_body_length) : undefined
            };

            const result = await operatorAPI.predictCowWeight(requestData);

            if (result.success) {
                setVerificationResult(result);
                onAgeVerified(result);
            } else {
                setError(result.message || 'Age verification failed');
            }
        } catch (err: any) {
            setError(err.response?.data?.detail || err.message || 'Failed to verify age');
        } finally {
            setLoading(false);
        }
    };

    const getVerificationModeIcon = (mode: string) => {
        switch (mode) {
            case 'manual': return <Clock className="w-5 h-5" />;
            case 'ai': return <Zap className="w-5 h-5" />;
            case 'visual': return <Eye className="w-5 h-5" />;
            default: return <Clock className="w-5 h-5" />;
        }
    };

    const getVerificationModeDescription = (mode: string) => {
        switch (mode) {
            case 'manual': return 'Uses provided age and physical characteristics';
            case 'ai': return 'AI-powered age estimation using advanced algorithms';
            case 'visual': return 'Estimates age from physical appearance and body condition';
            default: return 'Select a verification method';
        }
    };

    return (
        <Card className="p-6">
            <div className="flex items-center mb-6">
                <Clock className="w-6 h-6 text-blue-600 mr-3" />
                <h3 className="text-xl font-semibold text-gray-800">Age Verification</h3>
            </div>

            <div className="space-y-6">
                {/* Verification Mode Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        Verification Method
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {['manual', 'ai', 'visual'].map((mode) => (
                            <button
                                key={mode}
                                type="button"
                                onClick={() => handleInputChange('verification_mode', mode)}
                                className={`p-4 border rounded-lg text-left transition-all ${formData.verification_mode === mode
                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                        : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <div className="flex items-center mb-2">
                                    {getVerificationModeIcon(mode)}
                                    <span className="ml-2 font-medium capitalize">{mode}</span>
                                </div>
                                <p className="text-sm text-gray-600">
                                    {getVerificationModeDescription(mode)}
                                </p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Image Uploads */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Left Side Image
                        </label>
                        <EnhancedImageUpload
                            value={formData.left_side_image}
                            onChange={(value) => handleInputChange('left_side_image', value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Right Side Image
                        </label>
                        <EnhancedImageUpload
                            value={formData.right_side_image}
                            onChange={(value) => handleInputChange('right_side_image', value)}
                        />
                    </div>
                </div>

                {/* Manual Measurements (only for manual mode) */}
                {formData.verification_mode === 'manual' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Heart Girth (cm)"
                            type="number"
                            value={formData.manual_heart_girth}
                            onChange={(value) => handleInputChange('manual_heart_girth', value)}
                            placeholder="Enter heart girth measurement"
                        />
                        <Input
                            label="Body Length (cm)"
                            type="number"
                            value={formData.manual_body_length}
                            onChange={(value) => handleInputChange('manual_body_length', value)}
                            placeholder="Enter body length measurement"
                        />
                    </div>
                )}

                {/* Breed and Current Age */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Breed
                        </label>
                        <select
                            value={formData.breed}
                            onChange={(e) => handleInputChange('breed', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="crossbred">Crossbred</option>
                            <option value="holstein">Holstein</option>
                            <option value="jersey">Jersey</option>
                            <option value="gir">Gir</option>
                            <option value="sahiwal">Sahiwal</option>
                            <option value="red_sindhi">Red Sindhi</option>
                        </select>
                    </div>
                    <Input
                        label="Current Age (years)"
                        type="number"
                        value={formData.age_years}
                        onChange={(value) => handleInputChange('age_years', value)}
                        placeholder="Enter current age"
                    />
                </div>

                {/* Verify Button */}
                <div className="flex justify-center">
                    <Button
                        onClick={handleVerify}
                        disabled={loading}
                        className="px-8 py-2"
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Verifying Age...
                            </>
                        ) : (
                            <>
                                <Clock className="w-4 h-4 mr-2" />
                                Verify Age
                            </>
                        )}
                    </Button>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-700 text-sm">{error}</p>
                    </div>
                )}

                {/* Verification Result */}
                {verificationResult && verificationResult.prediction_result && (
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <h5 className="font-medium text-green-700 mb-3">Age Verification Result</h5>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-green-600">Verified Age:</span>
                                <span className="font-bold text-green-800">
                                    {verificationResult.prediction_result.predicted_age?.toFixed(1)} years
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-green-600">Confidence:</span>
                                <span className="font-medium text-green-700">
                                    {(verificationResult.prediction_result.confidence * 100)?.toFixed(1)}%
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-green-600">Method:</span>
                                <span className="font-medium text-green-700 capitalize">
                                    {verificationResult.prediction_result.method?.replace('_', ' ')}
                                </span>
                            </div>

                            {verificationResult.prediction_result.processing_notes && (
                                <div className="mt-3 pt-3 border-t border-green-200">
                                    <p className="text-sm text-green-600">
                                        <strong>Notes:</strong> {verificationResult.prediction_result.processing_notes.join(', ')}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
};