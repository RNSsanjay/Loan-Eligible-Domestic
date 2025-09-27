import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../common/Card';
import { Button } from '../common/Button';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="min-h-screen p-8 relative">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile Settings</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Information */}
          <Card title="Profile Information">
            <div className="space-y-4">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {user.name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2)}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 truncate max-w-[250px]" title={user.name}>{user.name}</h3>
                  <p className="text-gray-600 truncate max-w-[250px]" title={user.email}>{user.email}</p>
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 capitalize">
                    {user.role}
                  </span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input 
                    type="text" 
                    value={user.name} 
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50" 
                    disabled 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input 
                    type="email" 
                    value={user.email} 
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50" 
                    disabled 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input 
                    type="tel" 
                    value={user.phone} 
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50" 
                    disabled 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <input 
                    type="text" 
                    value={user.role} 
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 capitalize" 
                    disabled 
                  />
                </div>
              </div>
              
              <Button className="w-full">
                Edit Profile (Coming Soon)
              </Button>
            </div>
          </Card>

          {/* Account Settings */}
          <Card title="Account Settings">
            <div className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Security</h4>
                <Button variant="secondary" className="w-full">
                  Change Password
                </Button>
                <Button variant="secondary" className="w-full">
                  Two-Factor Authentication
                </Button>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Preferences</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-green-600" />
                    <span className="ml-2 text-sm text-gray-700">Email notifications</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-green-600" />
                    <span className="ml-2 text-sm text-gray-700">SMS alerts</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-green-600" />
                    <span className="ml-2 text-sm text-gray-700">Weekly reports</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-2">Account Status</h4>
                <div className="text-sm text-gray-600">
                  <p>Member since: {new Date(user.created_at).toLocaleDateString()}</p>
                  <p>Last updated: {new Date(user.updated_at).toLocaleDateString()}</p>
                  <p>Status: <span className="text-green-600 font-medium">Active</span></p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};