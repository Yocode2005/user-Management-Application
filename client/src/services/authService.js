import api from "./api";

export const authService = {
  register: (data)           => api.post("/auth/register", data),
  login:    (data)           => api.post("/auth/login", data),
  logout:   ()               => api.post("/auth/logout"),
  getMe:    ()               => api.get("/auth/me"),
  forgotPassword: (email)    => api.post("/auth/forgot-password", { email }),
  resetPassword:  (token, password) => api.post(`/auth/reset-password?token=${token}`, { password }),
  verifyEmail:    (token)    => api.get(`/auth/verify-email?token=${token}`),
  refreshToken:   ()         => api.post("/auth/refresh-token"),
};
