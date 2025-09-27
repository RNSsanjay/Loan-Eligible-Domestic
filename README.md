# Domestic Loan Management System

A comprehensive web application for managing livestock loan applications with an intuitive landing page, role-based access control, and streamlined workflows for Admins, Managers, and Operators.

## 🌟 Key Features

### Professional Landing Page
- **Modern Design**: Clean, professional interface with green and white color scheme
- **Comprehensive Information**: Detailed feature overview and process explanation
- **Call-to-Action**: Easy access to login and application process
- **Mobile Responsive**: Optimized for all device sizes

### Multi-Role System
- **Admin**: Create and manage managers, view system-wide analytics and reports
- **Manager**: Create and manage operators, approve/reject loan applications, view team statistics  
- **Operator**: Create loan applications, manage applicants, verify loan eligibility with 8-point checklist

### Livestock Management
- **Animal Types**: Support for cattle (cows), goats, and hens
- **Health Tracking**: Detailed animal health and vaccination status monitoring
- **Market Assessment**: Real-time market value evaluation
- **Collateral Management**: Comprehensive loan collateral tracking

### Advanced Verification System
- **8-Point Checklist**: Comprehensive verification process for operators
- **Document Verification**: Health certificates, vaccination records, and identity documents
- **Financial Assessment**: Income verification and loan repayment capacity analysis
- **Status Tracking**: Real-time application status updates

### Complete Loan Workflow
- **Digital Applications**: Online application submission with instant feedback
- **Applicant Management**: Personal, family, and financial details tracking
- **EMI Calculation**: Automatic loan amount and EMI estimation
- **Status Pipeline**: Pending → Verified → Approved/Rejected workflow

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
- **Aggregation Pipelines** for complex analytics
- **Document Relationships** for linked data integrity

## 🎨 Design System

### Color Palette
- **Primary Green**: #059669 (green-600)
- **Light Green**: #D1FAE5 (green-100) 
- **White**: #FFFFFF for clean backgrounds
- **Gray Scale**: Various gray tones for text hierarchy

### Typography
- **Headings**: Font-bold with appropriate sizing
- **Body Text**: Clean, readable fonts with proper contrast
- **UI Elements**: Consistent spacing and padding

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v16 or higher)
- **Python** (3.8 or higher)
- **MongoDB Atlas** account or local MongoDB installation

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/RNSsanjay/Loan-Eligible-Domestic.git
   cd Loan-Eligible-Domestic
   ```

2. **Backend Setup**
   ```bash
   cd backend
   pip install -r requirements.txt
   python create_admin.py  # Create initial admin user
   uvicorn main:app --reload
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Access the Application**
   - Open http://localhost:5173 for the landing page
   - Backend API: http://localhost:8000

## 📱 User Journey

### 1. Landing Page Experience
- Professional welcome interface
- Feature overview and benefits
- Clear call-to-action buttons
- Mobile-responsive design

### 2. Authentication Flow  
- Secure login system
- First-time password setup
- Role-based dashboard routing
- Session management

### 3. Application Process
- **Step 1**: Applicant registration with personal details
- **Step 2**: Animal information and health records
- **Step 3**: Loan application with amount and purpose
- **Step 4**: 8-point verification by operator
- **Step 5**: Manager review and approval

### 4. Management Dashboard
- Real-time application tracking
- Analytics and reporting tools
- User management capabilities
- System-wide oversight

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt encryption for user passwords
- **Role-based Access**: Granular permissions system
- **Input Validation**: Comprehensive data validation with Pydantic
- **CORS Protection**: Cross-origin request security

## 📊 Analytics & Reporting

- **Application Metrics**: Track success rates and processing times
- **Operator Performance**: Monitor individual operator statistics
- **Monthly Analytics**: Trend analysis and forecasting
- **System Health**: Real-time system performance monitoring

### Project Structure

```
Loan-Eligible-Domestic/
├── backend/                    # FastAPI Backend
│   ├── app/
│   │   ├── admin/             # Admin routes and logic
│   │   ├── manager/           # Manager routes and logic
│   │   ├── operator/          # Operator routes and logic
│   │   └── common/            # Shared utilities and models
│   ├── main.py               # FastAPI application entry
│   └── requirements.txt      # Python dependencies
└── frontend/                  # React Frontend
    ├── src/
    │   ├── components/        # React components
    │   │   ├── admin/        # Admin dashboard components
    │   │   ├── manager/      # Manager dashboard components
    │   │   ├── operator/     # Operator dashboard components
    │   │   └── common/       # Shared UI components
    │   ├── contexts/         # React contexts
    │   ├── services/         # API services
    │   └── types/           # TypeScript definitions
    └── package.json         # Node.js dependencies
```

## 🧪 Testing

### Backend Testing
```bash
cd backend
python -m pytest tests/
```

### Frontend Testing
```bash
cd frontend
npm test
```

## � Configuration

### Environment Variables
Create `.env` files in both backend and frontend directories:

**Backend (.env)**
```
MONGODB_URL=your_mongodb_connection_string
SECRET_KEY=your_jwt_secret_key
```

**Frontend (.env)**
```
VITE_API_URL=http://localhost:8000
```

## 📝 API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support, email support@domesticloanmanagement.com or join our Slack channel.

## 🙏 Acknowledgments

- FastAPI for the excellent backend framework
- React team for the frontend library
- MongoDB for the flexible database solution
- Tailwind CSS for the beautiful styling system

---

**Made with ❤️ for the agricultural community**
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