# UserBase — Frontend (React)

MERN Stack User Management App — React 18 + Tailwind CSS + React Query

---

## Prerequisites

| Tool     | Version | Notes                          |
|----------|---------|--------------------------------|
| Node.js  | v18+    | https://nodejs.org             |
| npm      | v9+     | Comes with Node.js             |
| Backend  | Running | Start the server first on :5000 |

---

## Project Setup

### 1. Navigate to the client folder

```bash
cd client
```

### 2. Install all dependencies

```bash
npm install
```

This installs:

**Core:** `react`, `react-dom`, `react-router-dom`, `react-scripts`

**Data:** `axios`, `react-query`, `react-hook-form`

**UI:** `recharts`, `react-hot-toast`, `date-fns`

**Styling:** `tailwindcss`, `autoprefixer`, `postcss`

### 3. (Optional) Set up environment variables

```bash
cp .env.example .env
```

For local development the `"proxy": "http://localhost:5000"` in `package.json`
already forwards all `/api/*` calls to the backend — no `.env` changes needed.

For **production**, set:
```env
REACT_APP_API_URL=https://your-deployed-backend.com/api
```

### 4. Make sure your backend is running

```bash
# In a separate terminal:
cd server && npm run dev
# → http://localhost:5000
```

### 5. Start the React dev server

```bash
npm start
```

App opens at: **http://localhost:3000**

---

## Folder Structure

```
client/
├── public/
│   └── index.html               # HTML shell with favicon + meta
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Avatar.jsx       # User avatar with gradient fallback
│   │   │   ├── Badge.jsx        # StatusBadge + RoleBadge
│   │   │   ├── ConfirmDialog.jsx # Generic confirmation modal
│   │   │   ├── Modal.jsx        # Base modal wrapper
│   │   │   ├── Pagination.jsx   # Page controls with ellipsis
│   │   │   └── Spinner.jsx      # Loading spinner + PageSpinner
│   │   ├── dashboard/
│   │   │   ├── SignupChart.jsx  # Recharts area chart
│   │   │   ├── StatsCards.jsx   # 4-card stats grid
│   │   │   └── StatusDonut.jsx  # Recharts pie/donut chart
│   │   ├── layout/
│   │   │   ├── AppLayout.jsx    # Shell with sidebar + Outlet
│   │   │   ├── ProtectedRoute.jsx # Auth + role guards
│   │   │   └── Sidebar.jsx      # Fixed left nav
│   │   └── users/
│   │       ├── UserFilters.jsx  # Search + filter + sort controls
│   │       ├── UserForm.jsx     # Create / edit form (react-hook-form)
│   │       └── UserTable.jsx    # Full data table with actions
│   ├── context/
│   │   └── AuthContext.jsx      # Auth state + login/logout
│   ├── hooks/
│   │   └── useUsers.js          # All React Query hooks
│   ├── pages/
│   │   ├── AuditLogs.jsx        # Admin audit trail
│   │   ├── CreateUser.jsx       # Admin create user
│   │   ├── Dashboard.jsx        # Overview + charts
│   │   ├── ForgotPassword.jsx
│   │   ├── Login.jsx
│   │   ├── NotFound.jsx
│   │   ├── Profile.jsx          # Self-profile edit + avatar + password
│   │   ├── Register.jsx
│   │   ├── UserDetail.jsx       # Admin: full profile view
│   │   ├── UserEdit.jsx         # Admin: edit any user
│   │   └── Users.jsx            # Admin: user list + bulk actions
│   ├── services/
│   │   ├── api.js               # Axios instance + token interceptors
│   │   ├── authService.js       # Auth API calls
│   │   └── userService.js       # User + profile API calls
│   ├── utils/
│   │   └── helpers.js           # Dates, initials, gradients, CSV
│   ├── App.jsx                  # Root component + router
│   ├── index.css                # Tailwind + global styles + design system
│   └── index.js                 # React DOM root
├── .env.example
├── .gitignore
├── package.json
├── postcss.config.js
└── tailwind.config.js
```

---

## Page Routes

| Path                | Component        | Access              |
|---------------------|------------------|---------------------|
| `/login`            | Login            | Guest only          |
| `/register`         | Register         | Guest only          |
| `/forgot-password`  | ForgotPassword   | Guest only          |
| `/dashboard`        | Dashboard        | All logged-in users |
| `/profile`          | Profile          | All logged-in users |
| `/users`            | Users            | Admin + Moderator   |
| `/users/:id`        | UserDetail       | Admin + Moderator   |
| `/users/:id/edit`   | UserEdit         | Admin + Moderator   |
| `/users/create`     | CreateUser       | Admin only          |
| `/audit`            | AuditLogs        | Admin only          |

---

## Key Features

- **Auto token refresh** — Axios interceptor silently refreshes the JWT access token when it expires (using httpOnly refresh token cookie)
- **React Query caching** — all API calls are cached and stale-time managed; mutations auto-invalidate relevant queries
- **Role-based routing** — `ProtectedRoute`, `AdminRoute`, `SuperAdminRoute`, `GuestRoute` wrappers
- **Tailwind design system** — custom dark theme with CSS class utilities (`card`, `btn-primary`, `badge-active`, etc.) defined in `index.css`
- **Bulk actions** — select multiple users → bulk delete with confirmation dialog
- **CSV export** — triggers a browser download of filtered user data
- **Recharts** — area chart for monthly signups, donut chart for status breakdown
- **Avatar upload** — direct upload to Cloudinary via the profile and user detail pages
- **Toast notifications** — `react-hot-toast` with dark theme matching the UI

---

## Production Build

```bash
npm run build
```

Output goes to `build/`. Deploy it to Netlify, Vercel, or serve it with Express:

```js
// In server.js (add after all API routes):
app.use(express.static(path.join(__dirname, '../client/build')));
app.get('*', (req, res) =>
  res.sendFile(path.join(__dirname, '../client/build/index.html'))
);
```

---

## Running Both Together (Dev)

Open two terminals:

```bash
# Terminal 1 — backend
cd server && npm run dev

# Terminal 2 — frontend
cd client && npm start
```

Or install `concurrently` at the root level:

```bash
npm install -g concurrently
concurrently "cd server && npm run dev" "cd client && npm start"
```
