# UserBase — Backend API

MERN Stack User Management Application — Express.js + Node.js + MongoDB

---

## Prerequisites

Before you start, make sure the following are installed on your machine:

| Tool | Version | Download |
|------|---------|----------|
| Node.js | v18+ | https://nodejs.org |
| npm | v9+ | Comes with Node.js |
| MongoDB | v6+ | https://www.mongodb.com/try/download/community |

> **Tip:** Use MongoDB Atlas (free cloud DB) instead of local MongoDB.
> Get a free cluster at https://cloud.mongodb.com

---

## Project Setup

### 1. Clone / navigate to the server folder

```bash
cd server
```

### 2. Install all dependencies

```bash
npm install
```

This installs all packages listed in `package.json`:

**Core:** `express`, `mongoose`, `dotenv`, `cors`, `morgan`, `express-async-errors`

**Auth & Security:** `jsonwebtoken`, `bcryptjs`, `helmet`, `express-rate-limit`, `express-validator`

**Features:** `multer`, `cloudinary`, `nodemailer`, `uuid`, `cookie-parser`

**Dev:** `nodemon`, `jest`, `supertest`

### 3. Set up environment variables

```bash
cp .env.example .env
```

Then open `.env` and fill in your values:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/user_management_db

JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_REFRESH_EXPIRES_IN=7d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
EMAIL_FROM=UserBase <your_email@gmail.com>

CLIENT_URL=http://localhost:3000
```

> **Gmail App Password:** Go to Google Account → Security → 2-Step Verification → App Passwords → generate one for "Mail".

### 4. Start the development server

```bash
npm run dev
```

Server starts at: `http://localhost:5000`

---

## Folder Structure

```
server/
├── config/
│   ├── db.js                  # MongoDB connection
│   └── cloudinary.js          # Cloudinary config + upload helpers
├── controllers/
│   ├── authController.js      # Register, login, logout, password reset
│   ├── userController.js      # Full user CRUD, stats, export, avatar
│   └── profileController.js   # Self-profile update, avatar, password change
├── middlewares/
│   ├── authMiddleware.js      # JWT protect + role restriction
│   ├── errorHandler.js        # Global error handler
│   ├── uploadMiddleware.js    # Multer memory storage
│   └── validate.js            # express-validator result checker
├── models/
│   ├── User.js                # Full user schema with virtuals + hooks
│   └── AuditLog.js            # Admin action audit trail
├── routes/
│   ├── authRoutes.js          # /api/auth/*
│   ├── userRoutes.js          # /api/users/*
│   ├── profileRoutes.js       # /api/profile/*
│   └── auditRoutes.js         # /api/audit/*
├── services/
│   ├── emailService.js        # Nodemailer templates
│   └── auditService.js        # Audit log creation + retrieval
├── utils/
│   ├── ApiError.js            # Custom error + response classes
│   └── generateTokens.js      # JWT + crypto token helpers
├── .env.example
├── .gitignore
├── package.json
└── server.js                  # App entry point
```

---

## API Reference

### Auth  `/api/auth`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/register` | Register new user | Public |
| GET | `/verify-email?token=` | Verify email address | Public |
| POST | `/login` | Login, returns JWT | Public |
| POST | `/refresh-token` | Refresh access token | Cookie |
| POST | `/logout` | Logout, clears cookie | Private |
| POST | `/forgot-password` | Send reset link | Public |
| POST | `/reset-password?token=` | Reset password | Public |
| GET | `/me` | Get current user | Private |

### Users  `/api/users`  (Admin / Moderator)

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/` | List all users (paginate/filter/sort) | Admin, Mod |
| POST | `/` | Admin creates a user | Admin |
| GET | `/stats/overview` | Dashboard stats | Admin, Mod |
| GET | `/export` | Download CSV | Admin |
| GET | `/:id` | Get single user | Admin, Mod |
| PUT | `/:id` | Update user fields | Admin, Mod |
| PATCH | `/:id/status` | Change status | Admin |
| PATCH | `/:id/role` | Change role | Admin |
| DELETE | `/:id` | Soft-delete user | Admin |
| DELETE | `/bulk` | Bulk soft-delete | Admin |
| POST | `/:id/avatar` | Upload user avatar | Admin |

### Profile  `/api/profile`  (Authenticated users)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/me` | Get own profile |
| PUT | `/me` | Update own profile |
| POST | `/me/avatar` | Upload own avatar |
| PUT | `/me/change-password` | Change own password |

### Audit  `/api/audit`  (Admin only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get audit logs (paginated + filtered) |

---

## Query Parameters for GET /api/users

```
?page=1           Page number (default: 1)
?limit=10         Results per page (default: 10, max: 100)
?sortBy=createdAt Sort field
?sortOrder=desc   Sort direction: asc or desc
?status=active    Filter by status: active | inactive | banned
?role=user        Filter by role: user | admin | moderator
?search=john      Full-text search across name, email, occupation
?startDate=       Filter by join date range
?endDate=
```

---

## Running Tests

```bash
npm test
```

---

## Scripts

```bash
npm run dev     # Start with nodemon (auto-restart)
npm start       # Start production server
npm test        # Run Jest tests
```
