import api from "./api";

export const userService = {
  // List + search
  getAll:   (params) => api.get("/users", { params }),
  getById:  (id)     => api.get(`/users/${id}`),
  getStats: ()       => api.get("/users/stats/overview"),

  // CRUD
  create: (data)     => api.post("/users", data),
  update: (id, data) => api.put(`/users/${id}`, data),

  // Status + role
  updateStatus: (id, status) => api.patch(`/users/${id}/status`, { status }),
  updateRole:   (id, role)   => api.patch(`/users/${id}/role`, { role }),

  // Delete
  delete:      (id)   => api.delete(`/users/${id}`),
  bulkDelete:  (ids)  => api.delete("/users/bulk", { data: { ids } }),

  // Avatar
  uploadAvatar: (id, file) => {
    const form = new FormData();
    form.append("avatar", file);
    return api.post(`/users/${id}/avatar`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // Export
  exportCSV: (params) =>
    api.get("/users/export", { params, responseType: "blob" }),

  // Audit logs
  getAuditLogs: (params) => api.get("/audit", { params }),
};

export const profileService = {
  getMe:           ()     => api.get("/profile/me"),
  updateMe:        (data) => api.put("/profile/me", data),
  changePassword:  (data) => api.put("/profile/me/change-password", data),
  uploadAvatar:    (file) => {
    const form = new FormData();
    form.append("avatar", file);
    return api.post("/profile/me/avatar", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};
