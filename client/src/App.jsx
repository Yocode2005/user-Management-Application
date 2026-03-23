import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { Toaster } from "react-hot-toast";

import { AuthProvider } from "./context/AuthContext";
import AppLayout from "./components/layout/AppLayout";
import {
  ProtectedRoute,
  AdminRoute,
  SuperAdminRoute,
  GuestRoute,
} from "./components/layout/ProtectedRoute";

// Pages
import Login          from "./pages/Login";
import Register       from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard      from "./pages/Dashboard";
import Users          from "./pages/Users";
import UserDetail     from "./pages/UserDetail";
import UserEdit       from "./pages/UserEdit";
import CreateUser     from "./pages/CreateUser";
import Profile        from "./pages/Profile";
import AuditLogs      from "./pages/AuditLogs";
import NotFound       from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ── Public / Guest routes ── */}
          <Route element={<GuestRoute />}>
            <Route path="/login"           element={<Login />} />
            <Route path="/register"        element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
          </Route>

          {/* ── Protected (any logged-in user) ── */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile"   element={<Profile />} />

              {/* Admin + Moderator */}
              <Route element={<AdminRoute />}>
                <Route path="/users"            element={<Users />} />
                <Route path="/users/:id"        element={<UserDetail />} />
                <Route path="/users/:id/edit"   element={<UserEdit />} />
                <Route path="/audit"            element={<AuditLogs />} />
              </Route>

              {/* Admin only */}
              <Route element={<SuperAdminRoute />}>
                <Route path="/users/create" element={<CreateUser />} />
              </Route>
            </Route>
          </Route>

          {/* ── Redirects ── */}
          <Route path="/"   element={<Navigate to="/dashboard" replace />} />
          <Route path="*"   element={<NotFound />} />
        </Routes>
      </BrowserRouter>

      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#111623",
            color: "#e2e8f0",
            border: "1px solid #1e2d40",
            borderRadius: "10px",
            fontSize: "13px",
            fontFamily: "DM Sans, sans-serif",
          },
          success: { iconTheme: { primary: "#22c55e", secondary: "#111623" } },
          error:   { iconTheme: { primary: "#ef4444", secondary: "#111623" } },
          duration: 3500,
        }}
      />
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
