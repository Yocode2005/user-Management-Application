import { useQuery, useMutation, useQueryClient } from "react-query";
import { userService } from "../services/userService";
import toast from "react-hot-toast";

// ── Fetch all users ───────────────────────────────────
export const useUsers = (params) =>
  useQuery(["users", params], () => userService.getAll(params).then((r) => r.data.data), {
    keepPreviousData: true,
    staleTime: 30_000,
  });

// ── Fetch single user ─────────────────────────────────
export const useUser = (id) =>
  useQuery(["user", id], () => userService.getById(id).then((r) => r.data.data.user), {
    enabled: !!id,
    staleTime: 30_000,
  });

// ── Dashboard stats ───────────────────────────────────
export const useStats = () =>
  useQuery("stats", () => userService.getStats().then((r) => r.data.data), {
    staleTime: 60_000,
  });

// ── Audit logs ────────────────────────────────────────
export const useAuditLogs = (params) =>
  useQuery(["audit", params], () => userService.getAuditLogs(params).then((r) => r.data.data), {
    staleTime: 30_000,
  });

// ── Create user ───────────────────────────────────────
export const useCreateUser = () => {
  const qc = useQueryClient();
  return useMutation((data) => userService.create(data), {
    onSuccess: () => {
      toast.success("User created successfully!");
      qc.invalidateQueries("users");
      qc.invalidateQueries("stats");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to create user"),
  });
};

// ── Update user ───────────────────────────────────────
export const useUpdateUser = () => {
  const qc = useQueryClient();
  return useMutation(({ id, data }) => userService.update(id, data), {
    onSuccess: (_, { id }) => {
      toast.success("User updated successfully!");
      qc.invalidateQueries(["user", id]);
      qc.invalidateQueries("users");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Update failed"),
  });
};

// ── Update status ─────────────────────────────────────
export const useUpdateStatus = () => {
  const qc = useQueryClient();
  return useMutation(({ id, status }) => userService.updateStatus(id, status), {
    onSuccess: (_, { id }) => {
      toast.success("Status updated!");
      qc.invalidateQueries(["user", id]);
      qc.invalidateQueries("users");
      qc.invalidateQueries("stats");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Status update failed"),
  });
};

// ── Update role ───────────────────────────────────────
export const useUpdateRole = () => {
  const qc = useQueryClient();
  return useMutation(({ id, role }) => userService.updateRole(id, role), {
    onSuccess: (_, { id }) => {
      toast.success("Role updated!");
      qc.invalidateQueries(["user", id]);
      qc.invalidateQueries("users");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Role update failed"),
  });
};

// ── Delete user ───────────────────────────────────────
export const useDeleteUser = () => {
  const qc = useQueryClient();
  return useMutation((id) => userService.delete(id), {
    onSuccess: () => {
      toast.success("User deleted.");
      qc.invalidateQueries("users");
      qc.invalidateQueries("stats");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Delete failed"),
  });
};

// ── Bulk delete ───────────────────────────────────────
export const useBulkDelete = () => {
  const qc = useQueryClient();
  return useMutation((ids) => userService.bulkDelete(ids), {
    onSuccess: (res) => {
      toast.success(`${res.data.data.deleted} users deleted.`);
      qc.invalidateQueries("users");
      qc.invalidateQueries("stats");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Bulk delete failed"),
  });
};

// ── Upload avatar ─────────────────────────────────────
export const useUploadAvatar = () => {
  const qc = useQueryClient();
  return useMutation(({ id, file }) => userService.uploadAvatar(id, file), {
    onSuccess: (_, { id }) => {
      toast.success("Avatar updated!");
      qc.invalidateQueries(["user", id]);
      qc.invalidateQueries("users");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Avatar upload failed"),
  });
};
