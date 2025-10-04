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
      setError(err.message || 'Test failed');
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
      setError(err.message || 'Test failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Weight Prediction API Test</h2>
      
      <div className="space-y-4">
        <div className="flex space-x-4">
          <Button onClick={testManualCalculation} disabled={loading}>
            Test Manual Calculation
          </Button>
          <Button onClick={testAICalculation} disabled={loading}>
            Test AI Calculation
          </Button>
        </div>
        
        {loading && (
          <div className="text-blue-600">
            Testing API connectivity...
          </div>
        )}
        
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded">
            <p className="text-red-800">Error: {error}</p>
          </div>
        )}
        
        {result && (
          <div className="p-4 bg-green-50 border border-green-200 rounded">
            <h3 className="font-semibold mb-2">API Response:</h3>
            <pre className="text-sm bg-white p-3 rounded border overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
        
        <div className="p-4 bg-blue-50 border border-blue-200 rounded">
          <h3 className="font-semibold mb-2">Test Information:</h3>
          <ul className="text-sm space-y-1">
            <li>• Manual mode: Uses Heart Girth² × Body Length ÷ 30000 formula</li>
            <li>• AI mode: Uses Gemini AI for intelligent weight prediction</li>
            <li>• Expected manual result: ~162 kg (with 180cm girth, 150cm length)</li>
            <li>• Both tests use dummy 1x1 pixel images for API testing</li>
          </ul>
        </div>
      </div>
    </Card>
  );
};