import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatedBackground } from '../components/common/AnimatedBackground';
import { AutoTyper } from '../components/common/AutoTyper';
import { Button } from '../components/common/Button';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const heroTexts = [
    'Domestic Loan Management',
    'Agricultural Finance Hub',
    'Rural Banking Solution',
    'Livestock Loan System'
  ];

  const features = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
      title: 'Digital Loan Processing',
      description: 'Streamlined digital application process for livestock and agricultural loans with quick approvals.'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Automated Verification',
      description: 'AI-powered document verification and risk assessment for faster loan processing.'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: 'Analytics & Reports',
      description: 'Comprehensive analytics and reporting tools for better financial insights and management.'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: 'Multi-Role Access',
      description: 'Role-based access control for administrators, managers, and operators with secure authentication.'
    }
  ];

  const stats = [
    { number: '10K+', label: 'Loans Processed' },
    { number: '₹50Cr+', label: 'Total Disbursement' },
    { number: '95%', label: 'Approval Rate' },
    { number: '24/7', label: 'Support Available' }
  ];

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />
      
      {/* Navigation */}
      <nav className="relative z-10 bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-10xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">      
              <span className="text-xl font-bold text-gray-900">DLM</span>
            </div>
            <Button 
              onClick={() => navigate('/login')}
              variant="primary"
              className="animate-glow"
            >
              Sign In
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 max-w-10xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
        <div className="text-center">
          <div className="animate-slideInLeft">
            <h1 className="text-6xl md:text-8xl font-bold text-gray-900 mb-6">
              <AutoTyper 
                texts={heroTexts}
                speed={100}
                deleteSpeed={50}
                pauseDuration={3000}
                className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-emerald-600 to-green-700"
              />
            </h1>
          </div>
          
          <div className="animate-slideInRight">
            <p className="text-xl md:text-2xl text-gray-700 mb-12 max-w-4xl mx-auto leading-relaxed">
              Empowering rural communities with streamlined digital loan processing for livestock and agricultural needs. 
              Fast, secure, and transparent financial solutions for domestic growth.
            </p>
          </div>

          <div className="animate-fadeInUp space-x-6">
            <Button 
              onClick={() => navigate('/login')}
              size="lg"
              className="animate-glow px-12 py-4 text-lg"
            >
              Get Started
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Button>
            
            <Button 
              variant="secondary"
              size="lg"
              className="px-12 py-4 text-lg glass"
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Learn More
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-32 animate-fadeInUp">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="text-center glass-green rounded-xl p-6 hover:scale-105 transition-transform duration-300"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-700 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="relative z-10 py-32 bg-white/5 backdrop-blur-sm">
        <div className="max-w-10xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Why Choose Our Platform?
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Built specifically for domestic loan management with cutting-edge technology and user-friendly design.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="glass rounded-xl p-8 hover:scale-105 transition-all duration-300 hover:shadow-2xl animate-fadeInUp"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center text-white mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative z-10 py-32">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="glass-green rounded-2xl p-12 animate-fadeInUp">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Ready to Transform Your Loan Management?
            </h2>
            <p className="text-xl text-gray-700 mb-10">
              Join thousands of users who trust our platform for their domestic loan needs. 
              Start your journey towards efficient financial management today.
            </p>
            <Button 
              onClick={() => navigate('/login')}
              size="lg"
              className="animate-glow px-12 py-4 text-lg"
            >
              Start Your Journey
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 bg-gray-900/10 backdrop-blur-lg border-t border-white/20">
        <div className="max-w-10xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <span className="text-lg font-bold text-gray-900">Domestic Loan Management</span>
            </div>
            <p className="text-gray-700">
              © 2025 DLM. All rights reserved. Empowering rural communities through technology.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};