import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { AutoTyper } from './AutoTyper';
import { UserIcon, QuestionMarkCircleIcon, LogoutIcon } from './Icons';

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
    navigate('/edit-profile');
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
        <div className="flex justify-between items-center h-14">
          {/* Left side - App name with animation */}
          <div className="flex items-center ">
            <div className="flex-shrink-0">

            </div>
            <div className="text-2xl font-bold text-gray-900 mb-2">
              <AutoTyper 
                texts={appNames}
                speed={360}
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
              <span className="text-gray-700 font-medium hidden sm:block truncate max-w-[200px]" title={`Welcome, ${user.name}`}>
                Welcome, {user.name}
              </span>
              
              {/* Profile dropdown */}
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-green-50 transition-all duration-200 group"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm group-hover:scale-105 transition-transform duration-200 overflow-hidden border-2 border-white shadow-md relative">
                    {user.profile_image_base64 && isValidBase64Image(user.profile_image_base64) ? (
                      <>
                        <img 
                          src={`data:image/png;base64,${user.profile_image_base64}`} 
                          alt={user.name}
                          className="w-full h-full object-cover absolute inset-0"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            const container = target.parentElement;
                            if (container) {
                              target.style.display = 'none';
                              const fallbackSpan = container.querySelector('.fallback-initials') as HTMLSpanElement;
                              if (fallbackSpan) {
                                fallbackSpan.style.display = 'flex';
                              }
                            }
                          }}
                        />
                        <span className="fallback-initials absolute inset-0 flex items-center justify-center text-sm font-bold" style={{display: 'none'}}>{getInitials(user.name)}</span>
                      </>
                    ) : (
                      <span className="text-sm font-bold">{getInitials(user.name)}</span>
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
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center text-white font-semibold overflow-hidden border-2 border-white shadow-sm relative">
                          {user.profile_image_base64 && isValidBase64Image(user.profile_image_base64) ? (
                            <>
                              <img 
                                src={`data:image/png;base64,${user.profile_image_base64}`} 
                                alt={user.name}
                                className="w-full h-full object-cover absolute inset-0"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  const container = target.parentElement;
                                  if (container) {
                                    target.style.display = 'none';
                                    const fallbackSpan = container.querySelector('.fallback-initials') as HTMLSpanElement;
                                    if (fallbackSpan) {
                                      fallbackSpan.style.display = 'flex';
                                    }
                                  }
                                }}
                              />
                              <span className="fallback-initials absolute inset-0 flex items-center justify-center text-sm font-bold" style={{display: 'none'}}>{getInitials(user.name)}</span>
                            </>
                          ) : (
                            <span className="text-sm font-bold">{getInitials(user.name)}</span>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 truncate max-w-[160px]" title={user.name}>{user.name}</div>
                          <div className="text-sm text-gray-600 truncate max-w-[160px]" title={user.email}>{user.email}</div>
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
                        <UserIcon className="w-4 h-4 mr-3" />
                        Edit Profile
                      </button>
                      
                      <button
                        onClick={handleHelp}
                        className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors duration-200"
                      >
                        <QuestionMarkCircleIcon className="w-4 h-4 mr-3" />
                        Help & Support
                      </button>

                      <div className="border-t border-gray-100 mt-2 pt-2">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center px-4 py-2 text-sm text-green-600 hover:bg-green-50 transition-colors duration-200"
                        >
                          <LogoutIcon className="w-4 h-4 mr-3" />
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