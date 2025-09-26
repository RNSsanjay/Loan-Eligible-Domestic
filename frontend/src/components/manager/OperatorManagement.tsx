import React, { useState, useEffect } from 'react';
import { managerAPI } from '../../services/api';
import { Card } from '../common/Card';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { Loading } from '../common/Loading';
import { ImageUpload } from '../common/ImageUpload';

interface Operator {
  id: string;
  name: string;
  email: string;
  phone: string;
  is_active: boolean;
  first_login: boolean;
  created_at?: string;
}

interface CreateOperatorData {
  name: string;
  email: string;
  phone: string;
  profileImage?: File | null;
}

export const OperatorManagement: React.FC = () => {
  const [operators, setOperators] = useState<Operator[]>([]);
  const [loading, setLoading] = useState(true);
  const [createLoading, setCreateLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [createData, setCreateData] = useState<CreateOperatorData>({
    name: '',
    email: '',
    phone: '',
    profileImage: null
  });

  useEffect(() => {
    loadOperators();
  }, []);

  const loadOperators = async () => {
    try {
      setLoading(true);
      const data = await managerAPI.getOperators();
      setOperators(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load operators');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOperator = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    setError('');
    setSuccess('');

    try {
      await managerAPI.createOperator(createData);
      setSuccess('Operator created successfully! They will receive login instructions.');
      setCreateData({ name: '', email: '', phone: '', profileImage: null });
      setShowCreateForm(false);
      loadOperators();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create operator');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateOperatorData, value: string) => {
    setCreateData(prev => ({ ...prev, [field]: value }));
  };

  const handleProfileImageChange = (file: File | null, preview: string | null) => {
    setCreateData(prev => ({ ...prev, profileImage: file }));
  };

  const handleDeactivateOperator = async (operatorId: string) => {
    if (!confirm('Are you sure you want to deactivate this operator?')) {
      return;
    }

    try {
      await managerAPI.deleteOperator(operatorId);
      setSuccess('Operator deactivated successfully');
      loadOperators();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to deactivate operator');
    }
  };

  if (loading) {
    return <Loading size="lg" text="Loading operators..." />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Operator Management</h2>
        <Button
          onClick={() => setShowCreateForm(true)}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          Create New Operator
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}

      {/* Create Operator Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Operator</h3>
            
            <form onSubmit={handleCreateOperator}>
              <div className="space-y-4">
                <Input
                  label="Full Name"
                  type="text"
                  value={createData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                  placeholder="Enter operator's full name"
                />
                
                <Input
                  label="Email Address"
                  type="email"
                  value={createData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  placeholder="Enter operator's email"
                />
                
                <Input
                  label="Phone Number"
                  type="tel"
                  value={createData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  required
                  placeholder="Enter operator's phone number"
                />

                <ImageUpload
                  label="Profile Picture"
                  onChange={handleProfileImageChange}
                  className="mt-4"
                />
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setCreateData({ name: '', email: '', phone: '', profileImage: null });
                    setError('');
                  }}
                  variant="secondary"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={createLoading}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Create Operator
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Operators List */}
      <div className="grid gap-6">
        {operators.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Operators Found</h3>
              <p className="text-gray-600">Create your first operator to get started.</p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {operators.map((operator) => (
              <Card key={operator.id} className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{operator.name}</h3>
                    <p className="text-sm text-gray-600">{operator.email}</p>
                    <p className="text-sm text-gray-500">{operator.phone}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2 ${operator.is_active ? 'bg-green-400' : 'bg-red-400'}`}></div>
                      <span className="text-sm text-gray-600">
                        {operator.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    {operator.first_login && (
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                        First Login Pending
                      </span>
                    )}
                  </div>
                </div>

                {operator.created_at && (
                  <p className="text-xs text-gray-500 mb-4">
                    Created: {new Date(operator.created_at).toLocaleDateString()}
                  </p>
                )}

                <div className="flex space-x-2">
                  <Button
                    onClick={() => handleDeactivateOperator(operator.id)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm"
                    disabled={!operator.is_active}
                  >
                    {operator.is_active ? 'Deactivate' : 'Deactivated'}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};