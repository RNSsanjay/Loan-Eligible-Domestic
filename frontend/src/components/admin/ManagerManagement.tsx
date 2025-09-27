import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { Card } from '../common/Card';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { Loading } from '../common/Loading';
import { EnhancedImageUpload } from '../common/EnhancedImageUpload';

interface Manager {
  id: string;
  name: string;
  email: string;
  phone: string;
  is_active: boolean;
  first_login: boolean;
  created_at?: string;
}

interface CreateManagerData {
  name: string;
  email: string;
  phone: string;
  password: string;
  profile_image_base64?: string;
}

export const ManagerManagement: React.FC = () => {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(true);
  const [createLoading, setCreateLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [createData, setCreateData] = useState<CreateManagerData>({
    name: '',
    email: '',
    phone: '',
    password: '',
    profile_image_base64: undefined
  });

  useEffect(() => {
    loadManagers();
  }, []);

  const loadManagers = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getManagers();
      setManagers(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load managers');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateManager = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    setError('');
    setSuccess('');

    try {
      await adminAPI.createManager(createData);
      setSuccess('Manager created successfully with password set!');
      setCreateData({ name: '', email: '', phone: '', password: '', profile_image_base64: undefined });
      setShowCreateForm(false);
      loadManagers();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create manager');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateManagerData, value: string) => {
    setCreateData(prev => ({ ...prev, [field]: value }));
  };

  const handleProfileImageChange = (base64: string) => {
    setCreateData(prev => ({ ...prev, profile_image_base64: base64 }));
  };

  const handleDeactivateManager = async (managerId: string) => {
    if (!confirm('Are you sure you want to deactivate this manager?')) {
      return;
    }

    try {
      await adminAPI.updateManager(managerId, { is_active: false });
      setSuccess('Manager deactivated successfully');
      loadManagers();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to deactivate manager');
    }
  };

  const handleActivateManager = async (managerId: string) => {
    try {
      await adminAPI.updateManager(managerId, { is_active: true });
      setSuccess('Manager activated successfully');
      loadManagers();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to activate manager');
    }
  };

  const handleDeleteManager = async (managerId: string) => {
    if (!confirm('Are you sure you want to permanently delete this manager? This action cannot be undone.')) {
      return;
    }

    try {
      await adminAPI.deleteManager(managerId);
      setSuccess('Manager deleted successfully');
      loadManagers();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete manager');
    }
  };

  if (loading) {
    return <Loading size="lg" text="Loading managers..." />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Manager Management</h2>
        <Button
          onClick={() => setShowCreateForm(true)}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          Create New Manager
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-green-50 border border-green-300 text-green-700 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}

      {/* Create Manager Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 mt-10">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Manager</h3>
            
            <form onSubmit={handleCreateManager}>
              <div className="space-y-4">
                <Input
                  label="Full Name"
                  type="text"
                  value={createData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                  placeholder="Enter manager's full name"
                />
                
                <Input
                  label="Email Address"
                  type="email"
                  value={createData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  placeholder="Enter manager's email"
                />
                
                <Input
                  label="Phone Number"
                  type="tel"
                  value={createData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  required
                  placeholder="Enter manager's phone number"
                />
                
                <Input
                  label="Password"
                  type="password"
                  value={createData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  required
                  placeholder="Enter a secure password"
                  minLength={6}
                />

                <EnhancedImageUpload
                  label="Profile Picture"
                  onChange={handleProfileImageChange}
                  value={createData.profile_image_base64}
                  className="mt-4"
                />
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setCreateData({ name: '', email: '', phone: '', password: '', profile_image_base64: undefined });
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
                  Create Manager
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Managers List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {managers.map((manager) => (
          <Card key={manager.id} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 truncate flex-1 min-w-0 mr-2" title={manager.name}>
                {manager.name}
              </h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                manager.is_active 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {manager.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="truncate" title={manager.email}>{manager.email}</span>
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="truncate" title={manager.phone}>{manager.phone}</span>
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6m-6 0L9 8m3-1h3l-1 1M3 7h18l-2 2H5L3 7z" />
                </svg>
                {manager.first_login ? 'Password not set' : 'Password set'}
              </div>
            </div>
            
            <div className="flex space-x-2">
              {manager.is_active ? (
                <Button
                  onClick={() => handleDeactivateManager(manager.id)}
                  variant="danger"
                  size="sm"
                  className=" border-green-600 hover:bg-green-50"
                >
                  Deactivate
                </Button>
              ) : (
                <Button
                  onClick={() => handleActivateManager(manager.id)}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Activate
                </Button>
              )}
              
              <Button
                onClick={() => handleDeleteManager(manager.id)}
                variant="danger"
                size="sm"
                className="bg-gray-600 hover:bg-gray-700 text-white"
              >
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {managers.length === 0 && (
        <Card className="p-8 text-center">
          <div className="text-gray-500">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Managers Found</h3>
            <p className="text-gray-500 mb-4">
              You haven't created any managers yet. Create your first manager to get started.
            </p>
            <Button
              onClick={() => setShowCreateForm(true)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Create First Manager
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};