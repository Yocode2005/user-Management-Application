import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useUsers, useBulkDelete } from "../hooks/useUsers";
import { userService } from "../services/userService";
import UserTable from "../components/users/UserTable";
import UserFilters from "../components/users/UserFilters";
import ConfirmDialog from "../components/common/ConfirmDialog";
import { PageSpinner } from "../components/common/Spinner";
import Spinner from "../components/common/Spinner";
import { downloadBlob } from "../utils/helpers";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const DEFAULT_FILTERS = { page: 1, limit: 10, search: "", status: "", role: "", sortBy: "createdAt", sortOrder: "desc" };

const Users = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [filters, setFilters]       = useState(DEFAULT_FILTERS);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);
  const [exporting, setExporting]   = useState(false);

  const { data, isLoading, isFetching } = useUsers(filters);
  const bulkDelete = useBulkDelete();

  const handleFiltersChange = useCallback((f) => {
    setFilters(f);
    setSelectedIds([]);
  }, []);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await userService.exportCSV(filters);
      downloadBlob(res.data, `users_${Date.now()}.csv`);
      toast.success("CSV exported!");
    } catch { toast.error("Export failed."); }
    finally { setExporting(false); }
  };

  const handleBulkDelete = async () => {
    await bulkDelete.mutateAsync(selectedIds);
    setSelectedIds([]);
    setShowBulkConfirm(false);
  };

  if (isLoading) return <PageSpinner />;

  const pagination = data?.pagination;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <p className="text-xs font-display font-bold uppercase tracking-widest text-muted mb-1">Management</p>
          <h1 className="font-display font-black text-2xl text-slate-100">
            All Users
            {isFetching && <Spinner size="sm" className="inline ml-3" />}
          </h1>
          {pagination && (
            <p className="text-sm text-muted mt-1">{pagination.total.toLocaleString()} registered users</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Bulk delete bar */}
          {isAdmin && selectedIds.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-red-900/20 border border-red-800/40
                            rounded-lg animate-slide-right">
              <span className="text-xs text-red-400 font-display font-semibold">
                {selectedIds.length} selected
              </span>
              <button className="btn-danger text-xs py-1.5 px-3" onClick={() => setShowBulkConfirm(true)}>
                Delete Selected
              </button>
              <button className="btn-ghost text-xs py-1.5" onClick={() => setSelectedIds([])}>
                Clear
              </button>
            </div>
          )}

          {isAdmin && (
            <button className="btn-secondary gap-2" onClick={handleExport} disabled={exporting}>
              {exporting ? <Spinner size="sm" /> : "⬇"}
              Export CSV
            </button>
          )}
          {isAdmin && (
            <button className="btn-primary" onClick={() => navigate("/users/create")}>
              ⊕ Add User
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4">
        <UserFilters filters={filters} onChange={handleFiltersChange} />
      </div>

      {/* Table */}
      <UserTable
        data={data}
        pagination={pagination}
        onPageChange={(p) => setFilters((f) => ({ ...f, page: p }))}
        selectedIds={selectedIds}
        onSelectChange={setSelectedIds}
      />

      {/* Bulk delete confirm */}
      <ConfirmDialog
        isOpen={showBulkConfirm}
        onClose={() => setShowBulkConfirm(false)}
        onConfirm={handleBulkDelete}
        title="Bulk Delete Users"
        message={`Delete ${selectedIds.length} selected users? They will be soft-deleted and can be restored later.`}
        confirmLabel={`Delete ${selectedIds.length} Users`}
        danger
        loading={bulkDelete.isLoading}
      />
    </div>
  );
};

export default Users;
