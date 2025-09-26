# Livestock Loan Eligibility System

A comprehensive web application for managing domestic animal loan applications with role-based access control for Admins, Managers, and Operators.

## Features

### 🎯 Multi-Role System
- **Admin**: Create and manage managers, view system-wide analytics and reports
- **Manager**: Create and manage operators, approve/reject loan applications, view team statistics
- **Operator**: Create loan applications, manage applicants, verify loan eligibility with 8-point checklist

### 🐄 Livestock Focus
- Support for cattle (cows), goats, and hens
- Detailed animal health and vaccination tracking
- Market value assessment
- Loan collateral management

### 📋 Comprehensive Verification
- 8-point verification checklist for operators
- Health certificate verification
- Vaccination record validation
- Identity and financial document verification
- Loan repayment capacity assessment

### 💰 Loan Management
- Complete loan application workflow
- Applicant personal and family details
- Bank account and financial information
- Loan amount calculation and EMI estimation
- Status tracking (Pending → Verified → Approved/Rejected)

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API communication

### Backend
- **FastAPI** with Python
- **MongoDB** with Motor (async driver)
- **JWT** authentication
- **Pydantic** for data validation
- **Password hashing** with bcrypt
- **CORS** enabled for frontend communication

### Database
- **MongoDB Atlas** for data storage
- User management with role-based access
- Loan applications and applicant data
- Animal records and verification logs

## Project Structure

```
Loan-Eligible-Domestic/
├── frontend/                 # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/       # Admin-specific components
│   │   │   ├── manager/     # Manager-specific components
│   │   │   ├── operator/    # Operator-specific components
│   │   │   └── common/      # Shared components
│   │   ├── contexts/        # React Context (Auth)
│   │   ├── services/        # API services
│   │   └── types/          # TypeScript type definitions
│   └── package.json
├── backend/                  # FastAPI Python backend
│   ├── app/
│   │   ├── admin/          # Admin routes and logic
│   │   ├── manager/        # Manager routes and logic
│   │   ├── operator/       # Operator routes and logic
│   │   └── common/         # Shared models, auth, database
│   ├── main.py            # FastAPI application entry point
│   ├── requirements.txt   # Python dependencies
│   └── .env              # Environment configuration
└── README.md
```

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- MongoDB Atlas account (or local MongoDB)

### 1. Clone and Setup

```bash
git clone <repository-url>
cd Loan-Eligible-Domestic
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\\Scripts\\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Start the backend server
python main.py
```

The backend will run on `http://localhost:8000`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will run on `http://localhost:5173`

### 4. Create Initial Admin

Make a POST request to create the first admin user:

```bash
curl -X POST "http://localhost:8000/api/admin/create-initial-admin" \\
     -H "Content-Type: application/json" \\
     -d '{
       "email": "admin@livestock.com",
       "name": "System Administrator",
       "phone": "1234567890",
       "password": "admin123"
     }'
```

## Environment Configuration

The `.env` file in the backend directory contains:

```env
# MongoDB Configuration
MONGODB_URL=mongodb+srv://ihub:ihub@harlee.6sokd.mongodb.net/
DB_NAME=Daily

# Gemini AI Configuration (for future AI features)
GEMINI_API_KEY=AIzaSyBOMRPeR6y0M_QA0JY4-4E-q6Tejn_1vio

# FastAPI Configuration
HOST=0.0.0.0
PORT=8000
DEBUG=True

# JWT Configuration
SECRET_KEY=your-secret-key-here-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

## User Workflow

### Admin Workflow
1. Login with admin credentials
2. Create managers from the admin dashboard
3. View system-wide statistics and reports
4. Manage manager accounts (edit, deactivate, delete)

### Manager Workflow
1. Login (set password on first login)
2. Create operator accounts
3. Review verified loan applications
4. Approve or reject applications
5. View team statistics and operator performance

### Operator Workflow
1. Login (set password on first login)
2. Create applicant profiles with personal and family details
3. Add animal information (type, breed, health status, etc.)
4. Submit loan applications
5. Verify applications using 8-point checklist:
   - Animal health certificate
   - Vaccination records
   - Ownership proof
   - Identity verification
   - Bank details validation
   - Income proof
   - Market value assessment
   - Repayment capacity analysis

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/set-password` - Set password for first login
- `GET /api/auth/me` - Get current user profile

### Admin Routes
- `POST /api/admin/managers` - Create manager
- `GET /api/admin/managers` - List managers
- `GET /api/admin/dashboard/overview` - System statistics

### Manager Routes
- `POST /api/manager/operators` - Create operator
- `GET /api/manager/operators` - List operators
- `GET /api/manager/loan-applications` - Review applications
- `PUT /api/manager/loan-applications/{id}/approve` - Approve application

### Operator Routes
- `POST /api/operator/applicants` - Create applicant
- `POST /api/operator/animals` - Add animal details
- `POST /api/operator/loan-applications` - Submit application
- `PUT /api/operator/loan-applications/{id}/verify` - Verify application

## Design System

The application uses a professional green and white color palette:
- **Primary Green**: `#16a34a` (green-600)
- **Success Green**: `#22c55e` (green-500)
- **Background**: `#f9fafb` (gray-50)
- **Cards**: White with subtle shadows
- **Text**: Gray scale for hierarchy

## Future Enhancements

- [ ] Integration with Gemini AI for loan risk assessment
- [ ] SMS/Email notifications for application status updates
- [ ] Document upload and verification
- [ ] Advanced analytics and reporting
- [ ] Mobile-responsive design improvements
- [ ] Audit logs and compliance tracking
- [ ] Integration with banking APIs
- [ ] Multi-language support

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is developed for livestock loan management and is intended for agricultural financial institutions.

---

**Contact**: For questions or support, please contact the development team.