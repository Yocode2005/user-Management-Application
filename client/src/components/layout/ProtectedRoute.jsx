import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { PageSpinner } from "../common/Spinner";

// Requires login
export const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <PageSpinner />;
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

// Requires admin or moderator role
export const AdminRoute = () => {
  const { isAuthenticated, isAdminOrMod, loading } = useAuth();
  if (loading) return <PageSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdminOrMod) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
};

// Requires admin role only
export const SuperAdminRoute = () => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) return <PageSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
};

// Redirect to dashboard if already logged in (for login/register pages)
export const GuestRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <PageSpinner />;
  return !isAuthenticated ? <Outlet /> : <Navigate to="/dashboard" replace />;
};
