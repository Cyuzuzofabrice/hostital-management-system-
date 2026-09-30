# Hospital Management System

A full-stack hospital management system designed to help healthcare facilities manage patients, medical staff, appointments, medical records, laboratory services, pharmacy, admissions, billing, and other daily hospital operations from a centralized platform.

> **Status:** 🚧 In active development — approximately 70% complete.

## Overview

The Hospital Management System provides a centralized platform for managing hospital operations and patient-related information.

The project is being developed with a modern web architecture, separating the frontend application from the backend API and database layer.

### Main Goals

- Manage patient information
- Manage doctors and nurses
- Manage departments
- Schedule and manage appointments
- Maintain medical records
- Manage medicines and prescriptions
- Manage laboratory tests and results
- Manage patient admissions
- Manage invoices and payments
- Provide authentication and role-based access
- Provide notifications and operational data

---

## Technology Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Modern responsive UI

### Backend

- Node.js
- Express.js
- TypeScript
- Prisma ORM
- REST API
- JWT authentication

### Database

- PostgreSQL
- Prisma ORM
- Prisma migrations

### Development Tools

- Git
- GitHub
- VS Code
- npm
- Prisma CLI

---

## System Architecture

```text
hospital-management-system/
│
├── frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│   ├── layouts/
│   └── ...
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── middleware/
│   │   ├── validators/
│   │   ├── utils/
│   │   └── server.ts
│   │
│   ├── prisma/
│   │   └── schema.prisma
│   │
│   └── ...
│
└── README.md
```

The frontend communicates with the backend through REST API endpoints.

The backend handles business logic, authentication, validation, and database operations through Prisma.

```text
React Frontend
      │
      │ REST API
      ▼
Express + TypeScript Backend
      │
      │ Prisma ORM
      ▼
PostgreSQL Database
```

---

## Core Modules

### Authentication

- User registration
- User login
- Password hashing
- JWT authentication
- Role-based access
- Active/inactive user management

### Patients

- Patient registration
- Patient information
- Patient medical information
- Patient records
- Patient history

### Doctors

- Doctor profiles
- Department assignment
- Doctor-patient relationships
- Appointment management

### Nurses

- Nurse profiles
- Department assignment
- Patient-related operations

### Departments

- Hospital departments
- Department management
- Staff assignment

### Appointments

- Appointment creation
- Doctor scheduling
- Patient appointments
- Appointment status management

### Medical Records

- Patient medical records
- Diagnosis information
- Treatment information
- Medical history

### Pharmacy

- Medicine management
- Prescriptions
- Prescription items
- Medicine availability

### Laboratory

- Laboratory tests
- Laboratory orders
- Laboratory results

### Admissions

- Patient admissions
- Admission information
- Discharge-related information

### Billing

- Invoices
- Payments
- Payment records
- Patient billing information

### Notifications

- User notifications
- Notification status management

---

## Database

The system uses PostgreSQL with Prisma ORM.

The database contains relationships between major hospital entities including:

```text
User
 ├── Doctor
 ├── Nurse
 └── Patient

Department
 ├── Doctors
 └── Nurses

Patient
 ├── Appointments
 ├── Medical Records
 ├── Prescriptions
 ├── Lab Orders
 ├── Admissions
 └── Invoices

Prescription
 └── Prescription Items
       └── Medicine

Lab Order
 └── Lab Result

Invoice
 └── Payments
```

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Cyuzuzofabrice/hostital-management-system-.git
```

```bash
cd hostital-management-system-
```

### 2. Install dependencies

Install dependencies for the frontend and backend separately.

```bash
cd backend
npm install
```

Then:

```bash
cd ../frontend
npm install
```

### 3. Configure environment variables

Create a `.env` file inside the backend directory.

Example:

```env
DATABASE_URL="your_postgresql_connection_string"

JWT_SECRET="your_jwt_secret"

PORT=5000

FRONTEND_URL="http://localhost:5173"
```

> Never commit your real `.env` file or database credentials to GitHub.

### 4. Start the database

If using Prisma's local development PostgreSQL server:

```bash
npx prisma dev
```

Keep this process running.

### 5. Generate Prisma Client

From the backend directory:

```bash
npx prisma generate
```

### 6. Run database migrations

```bash
npx prisma migrate dev
```

### 7. Start the backend

```bash
npm run dev
```

The API will run on:

```text
http://localhost:5000
```

Health check:

```text
http://localhost:5000/api/health
```

### 8. Start the frontend

Open another terminal:

```bash
cd frontend
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173
```

---

## API Structure

The backend follows a modular API structure.

Example:

```text
/api/auth
/api/departments
/api/patients
/api/doctors
/api/nurses
/api/appointments
/api/medical-records
/api/medicines
/api/prescriptions
/api/laboratory
/api/admissions
/api/invoices
/api/payments
/api/notifications
```

The exact available endpoints may continue to change while development is ongoing.

---

## Security

Security is an important part of the system.

Current architecture includes:

- Password hashing
- JWT-based authentication
- Role-based authorization
- Request validation
- Environment variables for secrets
- CORS configuration
- Database-level constraints

Sensitive information such as passwords and database credentials should never be committed to the repository.

---

## Development Status

### Completed / In Progress

- [x] Project structure
- [x] Frontend setup
- [x] Backend setup
- [x] PostgreSQL database
- [x] Prisma schema
- [x] Authentication foundation
- [x] User management foundation
- [x] Hospital entity relationships
- [x] API structure
- [x] Patient management foundation
- [x] Department management foundation
- [x] Doctor and nurse management foundation
- [ ] Complete all frontend modules
- [ ] Complete all API endpoints
- [ ] Complete dashboard functionality
- [ ] Complete reporting
- [ ] Comprehensive testing
- [ ] Production deployment

---

## Roadmap

### Phase 1 — Core System

- Complete authentication
- Complete user roles
- Complete patient management
- Complete staff management
- Complete department management

### Phase 2 — Hospital Operations

- Complete appointments
- Complete medical records
- Complete admissions
- Complete laboratory
- Complete pharmacy

### Phase 3 — Finance & Reporting

- Complete billing
- Complete payments
- Hospital reports
- Operational dashboards
- Data visualization

### Phase 4 — Production

- Security review
- Automated testing
- Performance optimization
- Production database
- Deployment
- Monitoring
- Documentation

---

## Project Structure

```text
Frontend
   ↓
User Interface
   ↓
REST API
   ↓
Express Backend
   ↓
Services / Controllers
   ↓
Prisma ORM
   ↓
PostgreSQL
```

---

## Contributing

This project is currently under active development.

If you would like to contribute:

1. Fork the repository.
2. Create a feature branch.

```bash
git checkout -b feature/your-feature
```

3. Make your changes.
4. Commit your changes.

```bash
git commit -m "feat: add your feature"
```

5. Push your branch.

```bash
git push origin feature/your-feature
```

6. Open a Pull Request.

---

## License

This project is currently being developed as a software project and does not yet specify a production license.

---

## Author

**Cyuzuzo Fabrice**

Frontend / Full-Stack Developer

- GitHub: [Cyuzuzofabrice](https://github.com/Cyuzuzofabrice)

---

## Project Status

🚧 **Active Development**

This system is being continuously developed and improved. Features, APIs, database models, and user interfaces may change as development progresses.