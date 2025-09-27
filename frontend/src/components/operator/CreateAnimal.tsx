import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { operatorAPI } from '../../services/api';
import { Card } from '../common/Card';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import type { Animal } from '../../types';

export const CreateAnimal: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [animal, setAnimal] = useState<Omit<Animal, 'id'>>({
    type: 'cow',
    breed: '',
    age: 0,
    weight: 0,
    health_status: '',
    vaccination_status: '',
    market_value: 0
  });

  const handleInputChange = (field: keyof Animal, value: string | number) => {
    setAnimal(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await operatorAPI.createAnimal(animal);
      navigate('/operator/create-loan');
    } catch (error: any) {
      setError(error.response?.data?.detail || 'Failed to create animal record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Add Animal Details</h2>
        <p className="text-gray-600">Record the livestock information for loan collateral</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-green-50 border border-green-300 rounded-md">
          <p className="text-green-700 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card title="Basic Animal Information">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Animal Type *
                </label>
                <select
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  value={animal.type}
                  onChange={(e) => handleInputChange('type', e.target.value as 'cow' | 'goat' | 'hen')}
                  required
                >
                  <option value="cow">Cow</option>
                  <option value="goat">Goat</option>
                  <option value="hen">Hen</option>
                </select>
              </div>
              
              <Input
                label="Breed *"
                value={animal.breed}
                onChange={(e) => handleInputChange('breed', e.target.value)}
                required
                fullWidth
                placeholder="e.g., Holstein, Jersey, Indigenous"
              />
              
              <Input
                label="Age (years) *"
                type="number"
                value={animal.age}
                onChange={(e) => handleInputChange('age', parseInt(e.target.value) || 0)}
                required
                fullWidth
                min="1"
                step="1"
              />
              
              <Input
                label="Weight (kg) *"
                type="number"
                value={animal.weight}
                onChange={(e) => handleInputChange('weight', parseFloat(e.target.value) || 0)}
                required
                fullWidth
                min="1"
                step="0.1"
              />
            </div>
          </Card>

          {/* Health & Financial Information */}
          <Card title="Health & Financial Information">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Health Status *
                </label>
                <select
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  value={animal.health_status}
                  onChange={(e) => handleInputChange('health_status', e.target.value)}
                  required
                >
                  <option value="">Select health status</option>
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="poor">Poor</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vaccination Status *
                </label>
                <select
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  value={animal.vaccination_status}
                  onChange={(e) => handleInputChange('vaccination_status', e.target.value)}
                  required
                >
                  <option value="">Select vaccination status</option>
                  <option value="up-to-date">Up to date</option>
                  <option value="partial">Partial</option>
                  <option value="overdue">Overdue</option>
                  <option value="none">None</option>
                </select>
              </div>
              
              <Input
                label="Market Value (₹) *"
                type="number"
                value={animal.market_value}
                onChange={(e) => handleInputChange('market_value', parseFloat(e.target.value) || 0)}
                required
                fullWidth
                min="1000"
                step="100"
                helperText="Current market value of the animal"
              />
            </div>
          </Card>
        </div>

        {/* Additional Information */}
        {animal.type === 'cow' && (
          <Card title="Cow-Specific Information" className="mt-6">
            <div className="bg-green-50 border border-green-300 rounded-md p-4">
              <h4 className="text-sm font-medium text-green-800 mb-2">Important Notes for Cow Loans:</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Minimum age: 2 years for dairy cows</li>
                <li>• Health certificate from veterinarian required</li>
                <li>• Vaccination records must be up to date</li>
                <li>• Insurance coverage recommended</li>
              </ul>
            </div>
          </Card>
        )}

        {/* Submit Button */}
        <div className="mt-8 flex justify-end space-x-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/operator')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={loading}
          >
            Save Animal Details
          </Button>
        </div>
      </form>
    </div>
  );
};