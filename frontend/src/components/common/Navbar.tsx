import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { AutoTyper } from './AutoTyper';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowProfileMenu(false);
  };

  const handleEditProfile = () => {
    // Navigate to edit profile page
    navigate('/profile');
    setShowProfileMenu(false);
  };

  const handleHelp = () => {
    // Navigate to help page  
    navigate('/help');
    setShowProfileMenu(false);
  };

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Don't show navbar on login page or landing page
  if (location.pathname === '/' || location.pathname === '/login') {
    return null;
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  const appNames = [
    'Domestic Loan Management',
    'Agricultural Finance Hub',
    'Rural Banking Solution',
    'Livestock Loan System'
  ];

  return (
    <nav className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-green-100 sticky top-0 z-50">
      <div className="max-w-10xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - App name with animation */}
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
            <div className="text-xl font-bold text-gray-900">
              <AutoTyper 
                texts={appNames}
                speed={80}
                deleteSpeed={40}
                pauseDuration={3000}
                className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600"
              />
            </div>
          </div>

          {/* Right side - User profile */}
          {user && (
            <div className="flex items-center space-x-4">
              {/* User name */}
              <span className="text-gray-700 font-medium hidden sm:block">
                Welcome, {user.name}
              </span>
              
              {/* Profile dropdown */}
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-green-50 transition-all duration-200 group"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-semibold text-sm group-hover:scale-105 transition-transform duration-200">
                    {user.profile_image ? (
                      <img 
                        src={user.profile_image} 
                        alt={user.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      getInitials(user.name)
                    )}
                  </div>
                  <svg 
                    className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${showProfileMenu ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Profile dropdown menu */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-green-100 py-2 animate-fadeInUp">
                    {/* User info header */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {user.profile_image ? (
                            <img 
                              src={user.profile_image} 
                              alt={user.name}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            getInitials(user.name)
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-600">{user.email}</div>
                          <div className="text-xs text-green-600 capitalize font-medium">{user.role}</div>
                        </div>
                      </div>
                    </div>

                    {/* Menu items */}
                    <div className="py-1">
                      <button
                        onClick={handleEditProfile}
                        className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors duration-200"
                      >
                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Edit Profile
                      </button>
                      
                      <button
                        onClick={handleHelp}
                        className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors duration-200"
                      >
                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Help & Support
                      </button>

                      <div className="border-t border-gray-100 mt-2 pt-2">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                        >
                          <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};