import React, { useState } from 'react';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { operatorAPI } from '../../services/api';

export const WeightPredictionTest: React.FC = () => {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testManualCalculation = async () => {
    setLoading(true);
    setError(null);

    try {
      // Test data with dummy images (base64 encoded 1x1 pixel images)
      const dummyImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

      const testData = {
        application_id: 'test-app-id',
        left_side_image: dummyImage,
        right_side_image: dummyImage,
        breed: 'holstein',
        age_years: 3,
        prediction_mode: 'manual' as const,
        manual_heart_girth: 180,
        manual_body_length: 150
      };

      const response = await operatorAPI.predictCowWeight(testData);
      setResult(response);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Test failed');
    } finally {
      setLoading(false);
    }
  };

  const testAICalculation = async () => {
    setLoading(true);
    setError(null);

    try {
      const dummyImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

      const testData = {
        application_id: 'test-app-id',
        left_side_image: dummyImage,
        right_side_image: dummyImage,
        breed: 'holstein',
        age_years: 3,
        prediction_mode: 'ai' as const
      };

      const response = await operatorAPI.predictCowWeight(testData);
      setResult(response);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Test failed');
    } finally {
      setLoading(false);
    }
  };

  const testVisualCalculation = async () => {
    setLoading(true);
    setError(null);

    try {
      const dummyImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

      const testData = {
        application_id: 'test-app-id',
        left_side_image: dummyImage,
        right_side_image: dummyImage,
        breed: 'crossbred',
        age_years: 4,
        prediction_mode: 'visual' as const
      };

      const response = await operatorAPI.predictCowWeight(testData);
      setResult(response);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Test failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Weight Prediction API Test</h2>

      <div className="space-y-4">
        <div className="flex space-x-4 flex-wrap">
          <Button onClick={testManualCalculation} disabled={loading}>
            Test Manual Calculation
          </Button>
          <Button onClick={testAICalculation} disabled={loading}>
            Test AI Calculation
          </Button>
          <Button onClick={testVisualCalculation} disabled={loading}>
            Test Visual Estimation
          </Button>
        </div>

        {loading && (
          <div className="text-blue-600 flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span>Testing API connectivity...</span>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded">
            <p className="text-red-800 font-medium">Error:</p>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {result && (
          <div className="p-4 bg-green-50 border border-green-200 rounded">
            <h3 className="font-semibold mb-2 text-green-800">API Response:</h3>
            <div className="bg-white p-3 rounded border overflow-auto max-h-96">
              <pre className="text-sm">{JSON.stringify(result, null, 2)}</pre>
            </div>

            {result.prediction_result && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-3 rounded border">
                  <h4 className="font-medium text-gray-800 mb-2">Prediction Summary</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Weight:</span> {result.prediction_result.predicted_weight?.toFixed(1)} kg</p>
                    <p><span className="font-medium">Age:</span> {result.prediction_result.predicted_age?.toFixed(1)} years</p>
                    <p><span className="font-medium">Confidence:</span> {(result.prediction_result.confidence * 100)?.toFixed(1)}%</p>
                    <p><span className="font-medium">Method:</span> {result.prediction_result.method}</p>
                    <p><span className="font-medium">Breed:</span> {result.prediction_result.breed}</p>
                  </div>
                </div>

                {result.image_info && (
                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-medium text-gray-800 mb-2">Image Processing</h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">Left Image:</span> {result.image_info.left_side.width}x{result.image_info.left_side.height}, {result.image_info.left_side.size_kb} KB</p>
                      <p><span className="font-medium">Right Image:</span> {result.image_info.right_side.width}x{result.image_info.right_side.height}, {result.image_info.right_side.size_kb} KB</p>
                      <p><span className="font-medium">Compression:</span> Applied</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="p-4 bg-blue-50 border border-blue-200 rounded">
          <h3 className="font-semibold mb-2 text-blue-800">Test Information:</h3>
          <ul className="text-sm space-y-1 text-blue-700">
            <li>• <strong>Manual mode:</strong> Uses Heart Girth² × Body Length ÷ 30000 formula with manual measurements</li>
            <li>• <strong>AI mode:</strong> Uses Gemini AI for intelligent weight prediction analysis</li>
            <li>• <strong>Visual mode:</strong> Attempts to extract measurements from images using computer vision</li>
            <li>• Expected manual result: ~162 kg (with 180cm girth, 150cm length)</li>
            <li>• All tests use dummy 1x1 pixel images for API connectivity testing</li>
            <li>• Images are automatically compressed and stored in base64 format</li>
          </ul>
        </div>
      </div>
    </Card>
  );
};