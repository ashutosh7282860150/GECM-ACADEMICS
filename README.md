# 🎓 SmartCampus ERP

> **A complete, modern College ERP system** — fast, mobile-responsive, and secure. Built with React.js, Node.js/Express, and PostgreSQL.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Recharts + QRCode |
| Backend | Node.js + Express.js |
| Database | PostgreSQL |
| Auth | JWT (JSON Web Tokens) |
| Styling | Vanilla CSS (dark theme design system) |

---

## 👥 User Roles & Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| 🔴 Admin | `admin@smartcampus.edu` | `password123` |
| 🟣 HOD | `hod.cse@smartcampus.edu` | `password123` |
| 🟡 Warden | `warden@smartcampus.edu` | `password123` |
| 🔵 Accounts | `accounts@smartcampus.edu` | `password123` |
| 🟢 Faculty | `faculty1@smartcampus.edu` | `password123` |
| 🟣 Student | `student1@smartcampus.edu` | `password123` |

---

## 📁 Project Structure

```
SmartCampus ERP/
├── client/                    # React frontend (Vite)
│   └── src/
│       ├── components/        # Reusable components
│       ├── pages/             # All page components
│       │   ├── student/       # Student pages
│       │   ├── faculty/       # Faculty pages
│       │   ├── admin/         # Admin pages
│       │   ├── warden/        # Warden pages
│       │   └── accounts/      # Accounts pages
│       ├── layouts/           # App layout with sidebar
│       ├── services/          # API service (axios)
│       ├── hooks/             # Custom React hooks
│       ├── context/           # Auth context
│       └── utils/             # Helper utilities
│
├── server/                    # Node.js Express API
│   ├── routes/                # All API routes
│   ├── middleware/            # Auth + audit middleware
│   ├── config/                # Database config
│   └── scripts/               # DB setup scripts
│
├── database/
│   ├── schema.sql             # Complete DB schema
│   └── seed.sql               # Demo data
│
└── docs/
    ├── API.md                 # API documentation
    └── ARCHITECTURE.md        # System architecture
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js v18+
- PostgreSQL 14+

### 1. Clone / Open the project
```bash
cd "ERP Portal"
```

### 2. Configure Environment
```bash
cd server
copy .env.example .env
# Edit .env with your PostgreSQL credentials
```

### 3. Install Dependencies
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 4. Setup Database
```bash
# Create the database in PostgreSQL first:
# psql -U postgres -c "CREATE DATABASE smartcampus_erp;"

# Then run setup (creates tables + seeds demo data):
cd server
node scripts/setupDb.js
```

### 5. Run the Application

**Terminal 1 — Backend:**
```bash
cd server
npm run dev
# API running at http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev
# App running at http://localhost:5173
```

---

## 🗄️ Database Setup (Manual)

```sql
-- In psql or pgAdmin:
CREATE DATABASE smartcampus_erp;

-- Then run:
\i database/schema.sql
\i database/seed.sql
```

---

## 🔑 Environment Variables

```env
# server/.env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=smartcampus_erp
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=7d

CLIENT_URL=http://localhost:5173
```

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login & get JWT |
| GET | `/api/auth/me` | Get current user |

### Dashboard
| Method | Endpoint | Roles |
|--------|----------|-------|
| GET | `/api/dashboard/student` | Student |
| GET | `/api/dashboard/admin` | Admin |
| GET | `/api/dashboard/warden` | Warden |
| GET | `/api/dashboard/accounts` | Accounts |
| GET | `/api/dashboard/faculty` | Faculty |

### Fees
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/fees` | Get student fees |
| POST | `/api/fees/pay` | Process mock payment |
| GET | `/api/fees/payments/history` | Payment history |

### Gate Pass
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/gatepass` | List gate passes |
| POST | `/api/gatepass` | Create request |
| PUT | `/api/gatepass/:id/approve` | Approve + generate QR |
| PUT | `/api/gatepass/:id/reject` | Reject |
| POST | `/api/gatepass/verify-qr` | Scan & verify QR |

### No-Dues
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/nodues` | List requests |
| POST | `/api/nodues` | Create request |
| PUT | `/api/nodues/:id/verify` | Department verify |
| GET | `/api/nodues/:id` | Get with workflow steps |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | List all users |
| POST | `/api/admin/users` | Create user |
| PUT | `/api/admin/users/:id/toggle-status` | Activate/Deactivate |
| GET | `/api/admin/pending-workflows` | All pending workflows |
| GET | `/api/admin/audit-logs` | System audit logs |

---

## ✨ Key Features

### 🏛️ Multi-Role Access
- **Student** — Fees, Attendance, Exams, Hostel, No-Dues, Gate Pass
- **Faculty** — Classes, Attendance marking, Marks entry
- **Warden** — Gate pass approvals, Hostel management, No-dues verify
- **Accounts** — Fee management, Payment reports, No-dues verify
- **Admin** — Full system control, User management, Analytics

### 📋 No-Dues Workflow
Student → Hostel → Library → Accounts → Admin → Certificate with QR

### 🚪 Gate Pass Workflow
Student Request → Warden Approval → QR Code Generated → Security Scan

### 💳 Fee Payment
Mock payment system with UPI / Net Banking / Card / DD options, instant receipts

### 📊 Analytics
Real-time charts for fee collection, student distribution, system activity

### 🔐 Security
- bcrypt password hashing
- JWT authentication
- Role-based route protection
- Rate limiting (100 req/15 min)
- CORS protection
- Input validation

---

## 📱 Mobile Responsive
The application is fully responsive across:
- 📱 Mobile (320px+)
- 📟 Tablet (768px+)
- 💻 Laptop (1024px+)
- 🖥️ Desktop (1280px+)

---

## 🗃️ Database Schema

20 tables with proper foreign keys and indexes:
`users`, `students`, `faculty`, `departments`, `courses`, `attendance`, `fees`, `payments`, `examinations`, `results`, `hostels`, `hostel_rooms`, `hostel_allocations`, `no_dues_requests`, `workflow_steps`, `gate_passes`, `notifications`, `documents`, `audit_logs`

---

## 📄 License

MIT License — SmartCampus ERP © 2024
