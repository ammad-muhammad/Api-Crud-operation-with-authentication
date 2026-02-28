# 🏥 MediCare AI – Clinic Management SaaS

> **Production-ready MERN Stack SaaS** with AI-assisted diagnosis, role-based access, subscription gating, PDF prescriptions, and analytics dashboards.

---

## 🚀 Quick Start

### Prerequisites
- Node.js ≥ 18.0.0
- MongoDB Atlas account (already connected)
- Google AI Studio API key (for AI features)

### Backend Setup

```bash
# From project root
npm install
# Fill in .env values (see Environment Variables section)
npm run dev
# → Server runs at http://localhost:5000
```

### Frontend Setup

```bash
cd clinic-frontend
npm install
npm run dev
# → App runs at http://localhost:5173
```

---

## 🔐 Environment Variables (`.env`)

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# JWT (use a strong secret, min 32 chars)
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d

# Cloudinary (for file uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Google Gemini AI (get free key at aistudio.google.com)
GEMINI_API_KEY=your_gemini_api_key

# Clinic branding (used in PDF prescriptions)
CLINIC_NAME=MediCare AI Clinic
CLINIC_ADDRESS=123 Health Street, Medical City
CLINIC_PHONE=+1 (555) 000-1234
CLINIC_EMAIL=contact@medicareai.com
```

---

## 👥 Role Credentials (Demo)

Register accounts via `POST /api/auth/register` or the UI:

| Role         | Email                    | Password   | Plan |
|--------------|--------------------------|------------|------|
| Admin        | admin@clinic.com         | Admin@123  | Pro  |
| Doctor       | doctor@clinic.com        | Doc@123    | Pro  |
| Receptionist | reception@clinic.com     | Rec@123    | Free |
| Patient      | patient@clinic.com       | Pat@123    | Free |

> Use Admin account to upgrade other users to Pro plan via Manage Staff page.

---

## 📁 Project Structure

```
assignment APi's/
├── src/
│   ├── config/
│   │   └── database.js          ← Preserved MongoDB connection
│   ├── models/
│   │   ├── User.js
│   │   ├── Patient.js
│   │   ├── Appointment.js
│   │   ├── Prescription.js
│   │   └── DiagnosisLog.js
│   ├── middlewares/
│   │   ├── auth.js              ← JWT verification
│   │   ├── role.js              ← RBAC
│   │   ├── subscription.js      ← Pro plan gating
│   │   ├── errorHandler.js
│   │   └── validate.js
│   ├── services/
│   │   ├── aiService.js         ← Gemini AI with fallback
│   │   ├── pdfService.js        ← PDFKit prescriptions
│   │   └── cloudinaryService.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── patientController.js
│   │   ├── appointmentController.js
│   │   ├── prescriptionController.js
│   │   ├── diagnosisController.js
│   │   └── analyticsController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── patientRoutes.js
│   │   ├── appointmentRoutes.js
│   │   ├── prescriptionRoutes.js
│   │   ├── diagnosisRoutes.js
│   │   └── analyticsRoutes.js
│   ├── app.js
│   └── server.js
├── clinic-frontend/
│   └── src/
│       ├── context/AuthContext.jsx
│       ├── services/api.js
│       ├── routes/ProtectedRoute.jsx
│       ├── layouts/MainLayout.jsx
│       ├── components/
│       │   ├── Sidebar.jsx
│       │   └── StatCard.jsx
│       ├── pages/
│       │   ├── auth/       (Login, Register)
│       │   ├── admin/      (AdminDashboard, ManageUsers)
│       │   ├── doctor/     (DoctorDashboard, AISymptomChecker)
│       │   ├── receptionist/ (ReceptionistDashboard)
│       │   ├── patient/    (PatientDashboard)
│       │   └── shared/     (Patients, Appointments, Prescriptions)
│       └── App.jsx
├── .env
└── package.json
```

---

## 🛣 API Documentation

### Auth
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register user |
| POST | `/api/auth/login` | Public | Login |
| GET | `/api/auth/me` | Auth | Get current user |
| PUT | `/api/auth/change-password` | Auth | Change password |

### Users (Admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List staff |
| POST | `/api/users` | Create doctor/receptionist |
| PUT | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Deactivate |
| PUT | `/api/users/:id/subscription` | Change plan |
| GET | `/api/users/doctors` | List doctors (for booking) |

### Patients
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/patients` | Register patient |
| GET | `/api/patients` | List (role-filtered) |
| GET | `/api/patients/:id` | Patient detail |
| PUT | `/api/patients/:id` | Update |

### Appointments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/appointments` | Book appointment |
| GET | `/api/appointments` | List (role-filtered) |
| GET | `/api/appointments/today` | Today's schedule |
| PUT | `/api/appointments/:id` | Update status |
| DELETE | `/api/appointments/:id` | Cancel |

### Prescriptions
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/prescriptions` | Create (Doctor) |
| GET | `/api/prescriptions/my` | Doctor's prescriptions |
| GET | `/api/prescriptions/patient/:id` | Patient history |
| GET | `/api/prescriptions/:id/pdf` | Download PDF |
| PUT | `/api/prescriptions/:id/ai-explain` | Regenerate AI (Pro) |

### Diagnosis (Pro Plan)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/diagnosis/symptoms` | AI symptom check |
| POST | `/api/diagnosis/risk-patterns/:patientId` | Risk detection |
| GET | `/api/diagnosis/logs` | Diagnosis history |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/admin` | Full system analytics |
| GET | `/api/analytics/doctor` | Doctor personal stats |
| GET | `/api/analytics/predictive` | AI forecasts (Pro) |

---

## 💳 Subscription Plans

| Feature | Free | Pro |
|---------|------|-----|
| Patient management | ✅ Limited | ✅ Unlimited |
| Appointments | ✅ | ✅ |
| Prescriptions | ✅ | ✅ |
| PDF Download | ✅ | ✅ |
| AI Symptom Checker | ❌ | ✅ |
| AI Prescription Explanation | ❌ | ✅ |
| Risk Pattern Detection | ❌ | ✅ |
| Predictive Analytics | ❌ | ✅ |

---

## 🚀 Deployment

### Backend → Render

1. Push to GitHub
2. Create a new **Web Service** on [render.com](https://render.com)
3. Set **Build Command**: `npm install`
4. Set **Start Command**: `npm start`
5. Add all `.env` variables in Render's Environment panel
6. Deploy!

### Frontend → Vercel

1. Push `clinic-frontend/` to GitHub (or as subfolder)
2. Import project on [vercel.com](https://vercel.com)
3. Set **Root Directory**: `clinic-frontend`
4. Add env variable: `VITE_API_URL=https://your-render-url.onrender.com`
5. In `src/services/api.js`, update `baseURL` to use `import.meta.env.VITE_API_URL`
6. Deploy!

---

## 🧠 AI Features (Gemini)

All AI features gracefully degrade if the API key is missing or the service fails:
- Returns: `"AI service temporarily unavailable. Core system remains functional."`
- All other features continue working normally

Get a **free** Gemini API key at: [aistudio.google.com](https://aistudio.google.com)

---

## 🔒 Security

- JWT authentication with 7-day expiry
- bcrypt password hashing (12 salt rounds)
- Helmet.js HTTP security headers
- CORS configuration
- Role-based middleware on every protected route
- Subscription-based middleware for Pro features
- Input validation via express-validator
- Soft-delete for users and patients

---

*Built for hackathon submission – MediCare AI Clinic SaaS 🏥*
