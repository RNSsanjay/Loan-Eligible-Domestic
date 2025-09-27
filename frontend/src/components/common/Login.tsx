import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI } from '../../services/api';
import { Button } from './Button';
import { Input } from './Input';
import { Card } from './Card';

interface LoginProps {
  onLoginSuccess: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showSetPassword, setShowSetPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      onLoginSuccess();
    } catch (error: any) {
      if (error.response?.status === 202) {
        // First login - need to set password
        setShowSetPassword(true);
      } else {
        setError(error.response?.data?.detail || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await authAPI.setPassword({ email, password: newPassword });
      // Now try to login with the new password
      await login(email, newPassword);
      onLoginSuccess();
    } catch (error: any) {
      setError(error.response?.data?.detail || 'Failed to set password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative">
      <Card className="w-full max-w-md animate-fadeInUp">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center animate-glow">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Domestic Loan Management</h1>
          <p className="text-gray-600">
            {showSetPassword ? 'Set your password' : 'Sign in to your account'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {!showSetPassword ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="email"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
              placeholder="Enter your email"
            />
            
            <Input
              type="password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
              placeholder="Enter your password"
            />

            <Button
              type="submit"
              fullWidth
              loading={loading}
              className="mt-6"
            >
              Sign In
            </Button>
          </form>
        ) : (
          <form onSubmit={handleSetPassword} className="space-y-4">
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-blue-800 text-sm">
                This is your first login. Please set a secure password.
              </p>
            </div>
            
            <Input
              type="email"
              label="Email"
              value={email}
              disabled
              fullWidth
            />
            
            <Input
              type="password"
              label="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              fullWidth
              placeholder="Enter new password (min 6 characters)"
            />
            
            <Input
              type="password"
              label="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              fullWidth
              placeholder="Confirm your new password"
            />

            <Button
              type="submit"
              fullWidth
              loading={loading}
              className="mt-6"
            >
              Set Password & Sign In
            </Button>
            
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => setShowSetPassword(false)}
              className="mt-2"
            >
              Back to Login
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
};