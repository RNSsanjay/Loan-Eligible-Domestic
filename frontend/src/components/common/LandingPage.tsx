import React, { useState } from 'react';
import { Login } from './Login';

export const LandingPage: React.FC = () => {
  const [showLogin, setShowLogin] = useState(false);

  if (showLogin) {
    return <Login onLoginSuccess={() => window.location.reload()} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b border-green-100">
        <div className="max-w-10xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h1 className="text-xl font-bold text-gray-900">
                  Domestic Loan Management
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowLogin(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-10xl mx-auto">
          <div className="relative z-10 pb-8 bg-gradient-to-br from-green-50 to-white sm:pb-16 md:pb-20 lg:pb-28">
            <main className="mt-10 mx-auto max-w-10xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <div className="lg:grid lg:grid-cols-12 lg:gap-8">
                  <div className="sm:mx-auto sm:w-full sm:max-w-md lg:col-span-6">
                    <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                      <span className="block">Livestock</span>
                      <span className="block text-green-600">Loan Management</span>
                    </h1>
                    <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                      Streamline your domestic animal loan applications with our comprehensive management system. 
                      From application to approval, we've got you covered.
                    </p>
                    <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                      <div className="rounded-md shadow">
                        <button
                          onClick={() => setShowLogin(true)}
                          className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 md:py-4 md:text-lg md:px-10 transition-colors duration-200"
                        >
                          Get Started
                          <svg className="ml-2 -mr-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                      <div className="mt-3 sm:mt-0 sm:ml-3">
                        <a
                          href="#features"
                          className="w-full flex items-center justify-center px-8 py-3 border border-green-300 text-base font-medium rounded-md text-green-700 bg-white hover:bg-green-50 md:py-4 md:text-lg md:px-10 transition-colors duration-200"
                        >
                          Learn More
                        </a>
                      </div>
                    </div>
                  </div>
                  
                  {/* Hero Image/Illustration */}
                  <div className="mt-12 relative lg:mt-0 lg:col-span-6">
                    <div className="relative mx-auto w-full lg:max-w-md">
                      <div className="bg-white rounded-xl shadow-2xl p-8">
                        <div className="text-center">
                          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">Digital Application Process</h3>
                          <p className="text-gray-600 text-sm">Complete your livestock loan application online with our easy-to-use digital platform.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-16 bg-white">
        <div className="max-w-10xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base text-green-600 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to manage livestock loans
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Our comprehensive platform provides all the tools needed for efficient loan management from application to approval.
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {/* Feature 1 - Multi-Role System */}
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <div className="ml-16">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Multi-Role Access</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Role-based system for Admins, Managers, and Operators with specific permissions and workflows.
                  </p>
                </div>
              </div>

              {/* Feature 2 - Livestock Management */}
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <div className="ml-16">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Animal Health Tracking</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Comprehensive tracking of livestock health, vaccination status, and market value assessment.
                  </p>
                </div>
              </div>

              {/* Feature 3 - Verification System */}
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-16">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">8-Point Verification</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Comprehensive verification checklist ensuring all requirements are met before loan approval.
                  </p>
                </div>
              </div>

              {/* Feature 4 - Digital Workflow */}
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="ml-16">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Fast Processing</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Streamlined digital workflow from application submission to final approval decisions.
                  </p>
                </div>
              </div>

              {/* Feature 5 - Financial Management */}
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="ml-16">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">EMI Calculation</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Automatic loan amount calculation and EMI estimation based on repayment capacity.
                  </p>
                </div>
              </div>

              {/* Feature 6 - Analytics & Reporting */}
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="ml-16">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Reports & Analytics</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Comprehensive reporting and analytics for better decision-making and system insights.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How it Works Section */}
      <div className="py-16 bg-green-50">
        <div className="max-w-10xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base text-green-600 font-semibold tracking-wide uppercase">Process</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              How it works
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Simple steps to get your livestock loan approved
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-green-600 text-white text-xl font-bold mx-auto mb-4">
                  1
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Apply Online</h3>
                <p className="text-gray-600">
                  Fill out the digital application form with your personal details, livestock information, and loan requirements.
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-green-600 text-white text-xl font-bold mx-auto mb-4">
                  2
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Verification Process</h3>
                <p className="text-gray-600">
                  Our operators verify your documents and livestock details using our comprehensive 8-point checklist.
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-green-600 text-white text-xl font-bold mx-auto mb-4">
                  3
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Get Approved</h3>
                <p className="text-gray-600">
                  Manager reviews your verified application and makes the final approval decision. Get funding fast!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-green-600">
        <div className="max-w-10xl mx-auto text-center py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to get started?</span>
            <span className="block">Apply for your livestock loan today.</span>
          </h2>
          <div className="mt-8 flex justify-center">
            <div className="inline-flex rounded-md shadow">
              <button
                onClick={() => setShowLogin(true)}
                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-green-600 bg-white hover:bg-gray-50 transition-colors duration-200"
              >
                Get Started Now
                <svg className="ml-2 -mr-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white">
        <div className="max-w-10xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900">Domestic Loan Management</h3>
            </div>
            <p className="text-gray-600 text-sm">
              © 2025 Domestic Loan Management System. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};