import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authService } from "../services/authService";
import toast from "react-hot-toast";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // Boot: check if token exists and fetch current user
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      authService.getMe()
        .then(({ data }) => setUser(data.data.user))
        .catch(() => localStorage.removeItem("accessToken"))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await authService.login({ email, password });
    localStorage.setItem("accessToken", data.data.accessToken);
    setUser(data.data.user);
    return data.data.user;
  }, []);

  const logout = useCallback(async () => {
    try { await authService.logout(); } catch {}
    localStorage.removeItem("accessToken");
    setUser(null);
    toast.success("Logged out successfully");
  }, []);

  const register = useCallback(async (formData) => {
    const { data } = await authService.register(formData);
    return data;
  }, []);

  const updateUser = useCallback((updates) => {
    setUser((prev) => ({ ...prev, ...updates }));
  }, []);

  const isAdmin     = user?.role === "admin";
  const isModerator = user?.role === "moderator";
  const isAdminOrMod = isAdmin || isModerator;

  return (
    <AuthContext.Provider value={{
      user, loading,
      login, logout, register, updateUser,
      isAdmin, isModerator, isAdminOrMod,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
