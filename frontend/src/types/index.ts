export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: 'admin' | 'manager' | 'operator';
  is_active: boolean;
  profile_image?: string;
  created_at: string;
  updated_at: string;
  first_login: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SetPasswordData {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface Applicant {
  id?: string;
  name: string;
  phone: string;
  email?: string;
  address: string;
  aadhar_number: string;
  pan_number?: string;
  bank_account_number: string;
  bank_name: string;
  ifsc_code: string;
  annual_income: number;
  family_members: FamilyMember[];
}

export interface FamilyMember {
  name: string;
  relationship: string;
  age: number;
  occupation: string;
}

export interface Animal {
  id?: string;
  type: 'cow' | 'goat' | 'hen';
  breed: string;
  age: number;
  weight: number;
  health_status: string;
  vaccination_status: string;
  market_value: number;
}

export interface LoanApplication {
  id?: string;
  applicant_id: string;
  animal_id: string;
  loan_amount: number;
  purpose: string;
  repayment_period: number;
  application_number?: string;
  status: 'pending' | 'verified' | 'approved' | 'rejected';
  operator_id: string;
  manager_id?: string;
  created_at?: string;
  updated_at?: string;
  applicant?: Applicant;
  animal?: Animal;
  operator?: User;
}

export interface VerificationItem {
  item: string;
  status: boolean;
  notes?: string;
}

export interface VerificationChecklist {
  health_certificate: boolean;
  health_certificate_notes?: string;
  vaccination_records: boolean;
  vaccination_records_notes?: string;
  ownership_proof: boolean;
  ownership_proof_notes?: string;
  identity_verified: boolean;
  identity_notes?: string;
  bank_details: boolean;
  bank_details_notes?: string;
  income_proof: boolean;
  income_proof_notes?: string;
  market_value: boolean;
  market_value_notes?: string;
  repayment_capacity: boolean;
  repayment_capacity_notes?: string;
}

export interface DashboardStats {
  operators_count?: number;
  managers_count?: number;
  total_operators?: number;
  total_applications: number;
  pending_applications: number;
  verified_applications: number;
  approved_applications: number;
  rejected_applications: number;
  total_loan_amount?: number;
}