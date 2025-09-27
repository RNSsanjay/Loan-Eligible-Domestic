import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { operatorAPI } from '../../services/api';
import { Card } from '../common/Card';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import type { Applicant, FamilyMember } from '../../types';

export const CreateApplicant: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [applicant, setApplicant] = useState<Omit<Applicant, 'id'>>({
    name: '',
    phone: '',
    email: '',
    address: '',
    aadhar_number: '',
    pan_number: '',
    bank_account_number: '',
    bank_name: '',
    ifsc_code: '',
    annual_income: 0,
    family_members: []
  });

  const [familyMember, setFamilyMember] = useState<FamilyMember>({
    name: '',
    relationship: '',
    age: 0,
    occupation: ''
  });

  const handleInputChange = (field: keyof Applicant, value: string | number) => {
    setApplicant(prev => ({ ...prev, [field]: value }));
  };

  const handleFamilyMemberChange = (field: keyof FamilyMember, value: string | number) => {
    setFamilyMember(prev => ({ ...prev, [field]: value }));
  };

  const addFamilyMember = () => {
    if (familyMember.name && familyMember.relationship && familyMember.age) {
      setApplicant(prev => ({
        ...prev,
        family_members: [...prev.family_members, familyMember]
      }));
      setFamilyMember({ name: '', relationship: '', age: 0, occupation: '' });
    }
  };

  const removeFamilyMember = (index: number) => {
    setApplicant(prev => ({
      ...prev,
      family_members: prev.family_members.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await operatorAPI.createApplicant(applicant);
      navigate('/operator/applications');
    } catch (error: any) {
      setError(error.response?.data?.detail || 'Failed to create applicant');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Create New Applicant</h2>
        <p className="text-gray-600">Enter the applicant's personal and financial details</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-green-50 border border-green-300 rounded-md">
          <p className="text-green-700 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <Card title="Personal Information">
            <div className="space-y-4">
              <Input
                label="Full Name *"
                value={applicant.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
                fullWidth
              />
              
              <Input
                label="Phone Number *"
                type="tel"
                value={applicant.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                required
                fullWidth
              />
              
              <Input
                label="Email Address"
                type="email"
                value={applicant.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                fullWidth
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address *
                </label>
                <textarea
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  rows={3}
                  value={applicant.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  required
                />
              </div>
            </div>
          </Card>

          {/* Identity & Financial Information */}
          <Card title="Identity & Financial Information">
            <div className="space-y-4">
              <Input
                label="Aadhar Number *"
                value={applicant.aadhar_number}
                onChange={(e) => handleInputChange('aadhar_number', e.target.value)}
                required
                fullWidth
                placeholder="XXXX-XXXX-XXXX"
              />
              
              <Input
                label="PAN Number"
                value={applicant.pan_number}
                onChange={(e) => handleInputChange('pan_number', e.target.value)}
                fullWidth
                placeholder="ABCDE1234F"
              />
              
              <Input
                label="Annual Income (₹) *"
                type="number"
                value={applicant.annual_income}
                onChange={(e) => handleInputChange('annual_income', parseFloat(e.target.value) || 0)}
                required
                fullWidth
              />
            </div>
          </Card>
        </div>

        {/* Bank Details */}
        <Card title="Bank Details" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Bank Account Number *"
              value={applicant.bank_account_number}
              onChange={(e) => handleInputChange('bank_account_number', e.target.value)}
              required
              fullWidth
            />
            
            <Input
              label="Bank Name *"
              value={applicant.bank_name}
              onChange={(e) => handleInputChange('bank_name', e.target.value)}
              required
              fullWidth
            />
            
            <Input
              label="IFSC Code *"
              value={applicant.ifsc_code}
              onChange={(e) => handleInputChange('ifsc_code', e.target.value)}
              required
              fullWidth
            />
          </div>
        </Card>

        {/* Family Members */}
        <Card title="Family Members" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <Input
              label="Name"
              value={familyMember.name}
              onChange={(e) => handleFamilyMemberChange('name', e.target.value)}
              fullWidth
            />
            
            <Input
              label="Relationship"
              value={familyMember.relationship}
              onChange={(e) => handleFamilyMemberChange('relationship', e.target.value)}
              fullWidth
            />
            
            <Input
              label="Age"
              type="number"
              value={familyMember.age}
              onChange={(e) => handleFamilyMemberChange('age', parseInt(e.target.value) || 0)}
              fullWidth
            />
            
            <Input
              label="Occupation"
              value={familyMember.occupation}
              onChange={(e) => handleFamilyMemberChange('occupation', e.target.value)}
              fullWidth
            />
          </div>
          
          <Button type="button" onClick={addFamilyMember} variant="secondary" size="sm">
            Add Family Member
          </Button>

          {applicant.family_members.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Added Family Members:</h4>
              <div className="space-y-2">
                {applicant.family_members.map((member, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <span className="text-sm">
                      <div className="truncate max-w-[300px]" title={`${member.name} (${member.relationship}, Age: ${member.age}, ${member.occupation})`}>
                        {member.name} ({member.relationship}, Age: {member.age}, {member.occupation})
                      </div>
                    </span>
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      onClick={() => removeFamilyMember(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Submit Button */}
        <div className="mt-8 flex justify-end space-x-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/operator')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={loading}
          >
            Create Applicant
          </Button>
        </div>
      </form>
    </div>
  );
};