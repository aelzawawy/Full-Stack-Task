# Production-Ready Authentication Module (React + NestJS + MongoDB)

A full-stack user authentication system built with **React (TypeScript, Vite)** on the frontend and **NestJS (TypeScript, MongoDB/Mongoose)** on the backend.

Designed around a **minimal-dependency architecture**, this repository avoids heavy third-party form/state libraries on the client in favor of native React features and Web APIs, while delivering enterprise-grade modularity, validation, and security on the server.

---

## Key Features

### Frontend (React + TypeScript + Vite + Tailwind CSS)
- **Zero-Library Form & State Management**: Built using native React primitives (`useState`, `useContext`, `useEffect`) and a custom generic `useAuthForm<T>` hook. No Redux, Zustand, Formik, or React Hook Form required.
- **Native HTTP Client (`apiClient`)**: A lightweight ~40-line typed wrapper around native browser `fetch` that automatically manages JWT Bearer token headers and handles normalized server error responses.
- **Strict Validation Rules**:
  - **Email**: Standard email format validation with trimming.
  - **Name**: Minimum of 3 characters.
  - **Password**: Minimum 8 characters, at least 1 letter, 1 number, and 1 special character (`@$!%*#?&`).
- **Protected Routes & Session Persistence**: Instant session hydration on app load with `<ProtectedRoute>` and session termination on logout.
- **Live Endpoint Verification**: The protected dashboard includes an interactive tool to test `GET /auth/profile` with the active JWT session.

### Backend (NestJS + MongoDB + JWT)
- **Modular NestJS Architecture**: Clear separation of concerns with `AuthModule` and `UsersModule`.
- **Stateless JWT Authentication**: Cryptographically signed tokens with Passport.js strategy and `@UseGuards(JwtAuthGuard)`.
- **Robust Security**:
  - `bcryptjs` password hashing with 10 salt rounds.
  - User schema configured with `select: false` on password hash to prevent accidental leakage in queries.
  - MongoDB unique index on `email`.
- **Global Exception Filter**: Standardized JSON error response envelope across all HTTP exceptions with automatic translation of MongoDB duplicate key collisions (`E11000`) into `409 Conflict: Email already registered`.
- **Interactive Swagger Documentation**: Full OpenAPI schema available at `/api/docs`.
- **Automated Tests**: Unit test suite for `AuthService` covering signup, signin, duplicate emails, and invalid credentials.

---

## Architecture & Directory Structure

```text
Full-Stack-Task/
├── .github/
│   └── workflows/
│       └── ci.yml               # Automated CI pipeline for linting & tests
├── backend/                     # NestJS backend API
│   ├── src/
│   │   ├── auth/                # Auth module (controller, service, DTOs, guards, strategy)
│   │   ├── users/               # Users module (service, Mongoose schema)
│   │   ├── common/              # Global exception filter, decorators
│   │   ├── app.module.ts
│   │   └── main.ts              # App bootstrap with CORS, Swagger, ValidationPipe
│   ├── test/
│   ├── .env.example
│   └── package.json
├── frontend/                    # Vite + React 19 + TypeScript frontend
│   ├── src/
│   │   ├── components/          # Reusable UI inputs, buttons, banners, protected route
│   │   ├── context/             # AuthContext & AuthProvider
│   │   ├── hooks/               # useAuth, useAuthForm
│   │   ├── pages/               # SignupPage, SigninPage, DashboardPage
│   │   ├── services/            # Native fetch apiClient
│   │   ├── types/               # TypeScript interfaces
│   │   ├── App.tsx
│   │   └── index.css            # Tailwind CSS v4 styling
│   ├── .env.example
│   └── package.json
├── docker-compose.yml           # Local MongoDB container setup
├── AI.md                        # AI usage, prompt log, and engineering overrides
└── README.md
```

---

## Quick Start Guide

### Prerequisites
- **Node.js**: v18+ (tested on Node v22)
- **Package Manager**: `pnpm` (or `npm`)
- **MongoDB**: Local MongoDB instance or Docker

---

### 🚀 One-Command Start (All Services + Database)

Run the unified development script from the project root:

```bash
pnpm dev
# or
./dev.sh
```

This single command automatically:
1. Validates and copies `.env` files if missing.
2. Checks and boots the MongoDB Docker container if not already running on port 27017.
3. Installs missing dependencies if needed.
4. Concurrently starts the **NestJS Backend** (`http://localhost:3000`) and **React Frontend** (`http://localhost:5173`) with color-coded streaming logs.
5. Gracefully handles `Ctrl+C` to terminate all background processes cleanly.

---

### Manual Setup (Step-by-Step)

### Step 1: Start MongoDB (Choose Any Option)

- **Option A: Using Docker (Recommended for instant setup)**:
  ```bash
  docker compose up -d
  ```
  *(Includes `GLIBC_TUNABLES=glibc.pthread.rseq=1` for full compatibility with modern Linux kernels 6.19+ / 7.x).*

- **Option B: Using Local MongoDB Service (No Docker required)**:
  If you have MongoDB installed locally, ensure the service is running:
  ```bash
  # Linux (systemd)
  sudo systemctl start mongod

  # macOS (Homebrew)
  brew services start mongodb-community
  ```

- **Option C: Using MongoDB Atlas (Cloud Database)**:
  Set your cloud connection string in `backend/.env`:
  ```env
  MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/auth-db?retryWrites=true&w=majority
  ```

---

### Step 2: Start the Backend
```bash
cd backend

# Install dependencies
pnpm install

# Setup environment
cp .env.example .env

# Run in development mode
pnpm run start:dev
```
The backend will be running at **`http://localhost:3000`**.  
Interactive Swagger API documentation: **`http://localhost:3000/api/docs`**.

---

### Step 3: Start the Frontend
In a new terminal window:
```bash
cd frontend

# Install dependencies
pnpm install

# Setup environment
cp .env.example .env

# Run development server
pnpm run dev
```
The frontend will be available at **`http://localhost:5173`**.

---

## Environment Variables

### Backend (`backend/.env`)
| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `PORT` | `3000` | HTTP port for the NestJS server |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/auth-db` | Connection string for MongoDB |
| `JWT_SECRET` | `super-secret-jwt-key-...` | Secret key used to sign JWTs |
| `JWT_EXPIRES_IN` | `7d` | Token validity duration |

### Frontend (`frontend/.env`)
| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `VITE_API_URL` | `http://localhost:3000` | Backend API base URL |

---

## API Endpoints Reference

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/signup` | Register a new user (`name`, `email`, `password`) | No |
| `POST` | `/auth/signin` | Authenticate user and receive JWT access token | No |
| `GET` | `/auth/profile` | Retrieve authenticated user profile | **Yes (Bearer Token)** |
| `GET` | `/api/docs` | Interactive Swagger OpenAPI UI | No |

---

## Running Tests

### Backend Unit Tests
```bash
cd backend
pnpm run test
```

### Production Builds
```bash
# Build Backend
cd backend && pnpm run build

# Build Frontend
cd frontend && pnpm run build
```

---

## AI Usage Disclosure
For an in-depth breakdown of how AI was used as a force multiplier, including prompt logs, rejected suggestions, and engineering overrides, please review **[AI.md](./AI.md)**.
