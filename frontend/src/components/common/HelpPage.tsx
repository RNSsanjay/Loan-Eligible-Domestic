import React from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';

export const HelpPage: React.FC = () => {
  const faqItems = [
    {
      question: "How do I apply for a livestock loan?",
      answer: "Navigate to the 'Create Loan Application' section, fill in the required details including applicant information, animal details, and loan amount. Submit the application for verification."
    },
    {
      question: "What documents are required for loan application?",
      answer: "You need Aadhar card, PAN card, bank account details, animal health certificates, and vaccination records."
    },
    {
      question: "How long does the approval process take?",
      answer: "Typically, loans are processed within 3-5 business days after successful verification and manager approval."
    },
    {
      question: "What is the maximum loan amount available?",
      answer: "Loan amounts vary based on animal type and value. Contact your manager for specific limits."
    },
    {
      question: "How can I track my application status?",
      answer: "Go to 'View Applications' to see the current status of all your submitted applications."
    }
  ];

  const contacts = [
    {
      title: "Technical Support",
      email: "support@domesticloan.com",
      phone: "+91 98765 43210",
      hours: "24/7 Available"
    },
    {
      title: "Loan Advisory",
      email: "advisory@domesticloan.com", 
      phone: "+91 98765 43211",
      hours: "Mon-Fri, 9 AM - 6 PM"
    },
    {
      title: "Emergency Contact",
      email: "emergency@domesticloan.com",
      phone: "+91 98765 43212", 
      hours: "24/7 Available"
    }
  ];

  return (
    <div className="min-h-screen p-8 relative">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Help & Support</h1>
          <p className="text-xl text-gray-600">Find answers to common questions and get support</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Quick Actions */}
          <Card title="Quick Actions" className="lg:col-span-1">
            <div className="space-y-3">
              <Button className="w-full justify-start">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-4.906-1.436L3 21l1.436-5.094A8.955 8.955 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
                </svg>
                Start Live Chat
              </Button>
              <Button variant="secondary" className="w-full justify-start">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Request Callback
              </Button>
              <Button variant="secondary" className="w-full justify-start">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                User Manual
              </Button>
              <Button variant="secondary" className="w-full justify-start">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Video Tutorials
              </Button>
            </div>
          </Card>

          {/* Contact Information */}
          <Card title="Contact Information" className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {contacts.map((contact, index) => (
                <div key={index} className="text-center p-4 bg-green-50/50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">{contact.title}</h3>
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>Email:</strong> {contact.email}
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>Phone:</strong> {contact.phone}
                  </p>
                  <p className="text-xs text-green-600 font-medium">{contact.hours}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* FAQ Section */}
        <Card title="Frequently Asked Questions">
          <div className="space-y-6">
            {faqItems.map((item, index) => (
              <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                <h3 className="font-semibold text-gray-900 mb-2">{item.question}</h3>
                <p className="text-gray-700 leading-relaxed">{item.answer}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* System Information */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card title="System Status">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">API Service</span>
                <span className="flex items-center text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  Online
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Database</span>
                <span className="flex items-center text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  Online
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Authentication</span>
                <span className="flex items-center text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  Online
                </span>
              </div>
            </div>
          </Card>

          <Card title="Version Information">
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex justify-between">
                <span>Application Version:</span>
                <span className="font-medium">v2.1.0</span>
              </div>
              <div className="flex justify-between">
                <span>Last Updated:</span>
                <span className="font-medium">Sept 27, 2025</span>
              </div>
              <div className="flex justify-between">
                <span>Build:</span>
                <span className="font-medium">#2345</span>
              </div>
              <div className="flex justify-between">
                <span>Environment:</span>
                <span className="font-medium text-green-600">Production</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};