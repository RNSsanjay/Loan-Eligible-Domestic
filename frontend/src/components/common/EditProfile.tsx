import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Input } from './Input';
import { Button } from './Button';
import { EnhancedImageUpload } from './EnhancedImageUpload';
import { UserIcon, XIcon } from './Icons';
import { authAPI } from '../../services/api';

interface EditProfileProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EditProfile: React.FC<EditProfileProps> = ({ isOpen, onClose }) => {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    profile_image_base64: user?.profile_image_base64 || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const updateData = {
        name: formData.name,
        phone: formData.phone,
        ...(formData.profile_image_base64 && { profile_image_base64: formData.profile_image_base64 })
      };
      
      await authAPI.updateProfile(updateData);
      await refreshUser();
      setSuccess('Profile updated successfully!');
      
      setTimeout(() => {
        onClose();
      }, 2000);
      
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await authAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      setSuccess('Password updated successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setTimeout(() => {
        onClose();
      }, 2000);
      
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (base64: string) => {
    setFormData(prev => ({ ...prev, profile_image_base64: base64 }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex items-center space-x-3">
            <UserIcon className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-bold text-gray-900">Edit Profile</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-50 rounded-lg transition-colors duration-200"
          >
            <XIcon className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 bg-gray-50">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors duration-200 ${
              activeTab === 'profile'
                ? 'text-green-600 border-b-2 border-green-600 bg-white'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            📝 Profile Info
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors duration-200 ${
              activeTab === 'password'
                ? 'text-green-600 border-b-2 border-green-600 bg-white'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            🔒 Password
          </button>
        </div>

        {/* Content */}
        <div className="p-6 bg-gray-50 min-h-[400px]">
          {error && (
            <div className="mb-6 p-4 bg-green-50 border border-green-300 rounded-xl text-green-700 text-sm flex items-center">
              <span className="mr-2">⚠️</span>
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm flex items-center">
              <span className="mr-2">✅</span>
              {success}
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                {/* Profile Image */}
                <div className="flex flex-col items-center mb-8">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Profile Picture</h3>
                    <p className="text-sm text-gray-500">Upload a profile picture to personalize your account</p>
                  </div>
                  <EnhancedImageUpload
                    label=""
                    onChange={handleImageChange}
                    value={formData.profile_image_base64}
                    className="w-full"
                  />
                </div>

                <div className="space-y-5">
                  <Input
                    label="Full Name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                    placeholder="Enter your full name"
                    className="w-full"
                  />

                  <Input
                    label="Phone Number"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    required
                    placeholder="Enter your phone number"
                    className="w-full"
                  />

                  <div className="pt-4">
                    <Button
                      type="submit"
                      loading={loading}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-medium"
                    >
                      {loading ? 'Updating...' : 'Update Profile'}
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* Password Tab */}
          {activeTab === 'password' && (
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Change Password</h3>
                  <p className="text-sm text-gray-500">Update your password to keep your account secure</p>
                </div>

                <div className="space-y-5">
                  <Input
                    label="Current Password"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    required
                    placeholder="Enter your current password"
                    className="w-full"
                  />

                  <Input
                    label="New Password"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    required
                    placeholder="Enter your new password"
                    minLength={6}
                    className="w-full"
                  />

                  <Input
                    label="Confirm New Password"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    required
                    placeholder="Confirm your new password"
                    minLength={6}
                    className="w-full"
                  />

                  <div className="pt-4">
                    <Button
                      type="submit"
                      loading={loading}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-medium"
                    >
                      {loading ? 'Updating...' : 'Update Password'}
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};