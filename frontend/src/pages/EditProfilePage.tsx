import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { EnhancedImageUpload } from '../components/common/EnhancedImageUpload';
import { AnimatedBackground } from '../components/common/AnimatedBackground';
import { api } from '../services/api';

interface ProfileData {
  name: string;
  email: string;
  phone_number: string;
  profile_image_base64?: string;
}

interface PasswordData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export const EditProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

  const isValidBase64Image = (base64String: string) => {
    try {
      // Check if it's a valid base64 string and not empty
      if (!base64String || base64String.trim() === '') return false;
      
      // Check if it matches base64 pattern
      const base64Pattern = /^[A-Za-z0-9+/]*={0,2}$/;
      return base64Pattern.test(base64String.replace(/\s/g, ''));
    } catch {
      return false;
    }
  };

  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    email: '',
    phone_number: '',
    profile_image_base64: ''
  });

  const [passwordData, setPasswordData] = useState<PasswordData>({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name,
        email: user.email,
        phone_number: user.phone || '',
        profile_image_base64: user.profile_image_base64 || ''
      });
    }
  }, [user]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await api.put('/auth/profile', profileData);
      setSuccess('Profile updated successfully!');
      
      // Refresh user data from server
      await refreshUser();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (passwordData.new_password !== passwordData.confirm_password) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }

    if (passwordData.new_password.length < 6) {
      setError('New password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      await api.put('/auth/change-password', {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password
      });
      setSuccess('Password updated successfully!');
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (base64Image: string) => {
    setProfileData(prev => ({
      ...prev,
      profile_image_base64: base64Image
    }));
  };

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-green-50 to-white">
      <AnimatedBackground />
      
      {/* Header */}
      <div className="z-10 bg-white/80 backdrop-blur-sm border-b border-green-100 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center text-green-600 hover:text-green-700 transition-colors duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
            <div className="w-16"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-green-100 overflow-hidden">
          
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 px-8 py-12 text-white">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-lg overflow-hidden ring-4 ring-white/30 bg-white/20 flex items-center justify-center">
                  {profileData.profile_image_base64 && isValidBase64Image(profileData.profile_image_base64) ? (
                    <img
                      src={`data:image/png;base64,${profileData.profile_image_base64}`}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const container = target.parentElement;
                        if (container) {
                          container.innerHTML = `<div class="w-full h-full flex items-center justify-center text-white/70"><svg class="w-12 h-12" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" /></svg></div>`;
                        }
                      }}
                    />
                  ) : (
                    <svg className="w-12 h-12 text-white/70" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
              <div>
                <h2 className="text-3xl font-bold">{profileData.name || 'User Name'}</h2>
                <p className="text-green-100 mt-1">{user?.role?.replace('_', ' ').toUpperCase()}</p>
                <p className="text-green-100 text-sm mt-1 truncate max-w-xs">{profileData.email}</p>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 bg-gray-50">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-4 px-6 text-sm font-medium transition-colors duration-200 ${
                activeTab === 'profile'
                  ? 'text-green-600 border-b-2 border-green-500 bg-white'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              Profile Information
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`flex-1 py-4 px-6 text-sm font-medium transition-colors duration-200 ${
                activeTab === 'password'
                  ? 'text-green-600 border-b-2 border-green-500 bg-white'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              Change Password
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-green-50 border border-green-300 rounded-xl text-green-700 text-sm flex items-center">
                <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-100 border border-green-400 rounded-xl text-green-800 text-sm flex items-center">
                <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {success}
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <form onSubmit={handleProfileSubmit} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <Input
                        label="Full Name"
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                        required
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div>
                      <Input
                        label="Email Address"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                        required
                        placeholder="Enter your email address"
                      />
                    </div>

                    <div>
                      <Input
                        label="Phone Number"
                        type="tel"
                        value={profileData.phone_number}
                        onChange={(e) => setProfileData(prev => ({ ...prev, phone_number: e.target.value }))}
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>

                  <div>
                    <EnhancedImageUpload
                      label="Profile Picture"
                      onChange={handleImageUpload}
                      value={profileData.profile_image_base64}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => navigate(-1)}
                    className="px-6 py-2"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    loading={loading}
                    className="px-8 py-2"
                  >
                    Update Profile
                  </Button>
                </div>
              </form>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
              <form onSubmit={handlePasswordSubmit} className="space-y-6 max-w-md">
                <div>
                  <Input
                    label="Current Password"
                    type="password"
                    value={passwordData.current_password}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, current_password: e.target.value }))}
                    required
                    placeholder="Enter your current password"
                  />
                </div>

                <div>
                  <Input
                    label="New Password"
                    type="password"
                    value={passwordData.new_password}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, new_password: e.target.value }))}
                    required
                    placeholder="Enter your new password"
                  />
                </div>

                <div>
                  <Input
                    label="Confirm New Password"
                    type="password"
                    value={passwordData.confirm_password}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirm_password: e.target.value }))}
                    required
                    placeholder="Confirm your new password"
                  />
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setPasswordData({ current_password: '', new_password: '', confirm_password: '' })}
                    className="px-6 py-2"
                  >
                    Reset
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    loading={loading}
                    className="px-8 py-2"
                  >
                    Update Password
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};