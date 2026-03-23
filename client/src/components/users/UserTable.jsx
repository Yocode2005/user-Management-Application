import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Avatar from "../common/Avatar";
import { StatusBadge, RoleBadge } from "../common/Badge";
import ConfirmDialog from "../common/ConfirmDialog";
import Pagination from "../common/Pagination";
import { useDeleteUser, useUpdateStatus } from "../../hooks/useUsers";
import { formatDate, timeAgo } from "../../utils/helpers";
import { useAuth } from "../../context/AuthContext";

const UserTable = ({ data, pagination, onPageChange, selectedIds, onSelectChange }) => {
  const navigate = useNavigate();
  const { isAdmin, user: me } = useAuth();
  const deleteMutation = useDeleteUser();
  const statusMutation = useUpdateStatus();

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [banTarget,    setBanTarget]    = useState(null);

  const users = data?.users || [];
  const allSelected = users.length > 0 && users.every((u) => selectedIds.includes(u._id));

  const toggleAll = () => {
    if (allSelected) onSelectChange([]);
    else onSelectChange(users.map((u) => u._id));
  };
  const toggleOne = (id) => {
    onSelectChange(
      selectedIds.includes(id) ? selectedIds.filter((x) => x !== id) : [...selectedIds, id]
    );
  };

  const confirmDelete = async () => {
    await deleteMutation.mutateAsync(deleteTarget._id);
    setDeleteTarget(null);
  };
  const confirmBan = async () => {
    await statusMutation.mutateAsync({ id: banTarget._id, status: "banned" });
    setBanTarget(null);
  };

  if (users.length === 0) {
    return (
      <div className="card flex flex-col items-center justify-center py-20 gap-3">
        <div className="text-4xl opacity-20">⊞</div>
        <p className="text-muted font-display font-semibold">No users found</p>
        <p className="text-xs text-subtle">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-base-850">
                {isAdmin && (
                  <th className="table-head-cell w-10">
                    <input
                      type="checkbox" checked={allSelected} onChange={toggleAll}
                      className="accent-accent-500 w-3.5 h-3.5 cursor-pointer"
                    />
                  </th>
                )}
                <th className="table-head-cell">User</th>
                <th className="table-head-cell hidden md:table-cell">Occupation</th>
                <th className="table-head-cell">Role</th>
                <th className="table-head-cell">Status</th>
                <th className="table-head-cell hidden lg:table-cell">Joined</th>
                <th className="table-head-cell hidden xl:table-cell">Last Login</th>
                <th className="table-head-cell text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="table-row group">
                  {isAdmin && (
                    <td className="table-cell w-10">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(u._id)}
                        onChange={() => toggleOne(u._id)}
                        className="accent-accent-500 w-3.5 h-3.5 cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                  )}

                  {/* User cell */}
                  <td className="table-cell">
                    <div className="flex items-center gap-3 cursor-pointer"
                         onClick={() => navigate(`/users/${u._id}`)}>
                      <Avatar user={u} size="sm" />
                      <div className="min-w-0">
                        <p className="text-sm font-display font-semibold text-slate-200
                                      group-hover:text-accent-400 transition-colors truncate">
                          {u.fullName}
                        </p>
                        <p className="text-xs text-muted truncate">{u.email}</p>
                      </div>
                    </div>
                  </td>

                  <td className="table-cell hidden md:table-cell">
                    <span className="text-sm text-slate-400">{u.occupation || "—"}</span>
                  </td>

                  <td className="table-cell"><RoleBadge role={u.role} /></td>
                  <td className="table-cell"><StatusBadge status={u.status} /></td>

                  <td className="table-cell hidden lg:table-cell">
                    <span className="text-xs text-slate-400">{formatDate(u.createdAt)}</span>
                  </td>
                  <td className="table-cell hidden xl:table-cell">
                    <span className="text-xs text-slate-400">{timeAgo(u.lastLogin)}</span>
                  </td>

                  {/* Actions */}
                  <td className="table-cell">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => navigate(`/users/${u._id}`)}
                        className="btn-icon w-7 h-7 text-xs"
                        title="View profile"
                      >
                        ◉
                      </button>
                      <button
                        onClick={() => navigate(`/users/${u._id}/edit`)}
                        className="btn-icon w-7 h-7 text-xs"
                        title="Edit user"
                      >
                        ✎
                      </button>
                      {isAdmin && u._id !== me?._id && (
                        <>
                          {u.status !== "banned" && (
                            <button
                              onClick={() => setBanTarget(u)}
                              className="btn-icon w-7 h-7 text-xs text-amber-500 border-amber-800/40
                                         hover:bg-amber-900/30"
                              title="Ban user"
                            >
                              ⊘
                            </button>
                          )}
                          <button
                            onClick={() => setDeleteTarget(u)}
                            className="btn-icon w-7 h-7 text-xs text-red-500 border-red-800/40
                                       hover:bg-red-900/30"
                            title="Delete user"
                          >
                            ✕
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pagination && (
          <Pagination
            page={pagination.page}
            pages={pagination.pages}
            total={pagination.total}
            limit={pagination.limit}
            onPageChange={(p) => onPageChange(p)}
          />
        )}
      </div>

      {/* Delete confirm */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete User"
        message={`Are you sure you want to delete "${deleteTarget?.fullName}"? This action can be reversed by an admin.`}
        confirmLabel="Delete"
        danger
        loading={deleteMutation.isLoading}
      />

      {/* Ban confirm */}
      <ConfirmDialog
        isOpen={!!banTarget}
        onClose={() => setBanTarget(null)}
        onConfirm={confirmBan}
        title="Ban User"
        message={`Ban "${banTarget?.fullName}"? They will be locked out of their account immediately.`}
        confirmLabel="Ban User"
        danger
        loading={statusMutation.isLoading}
      />
    </>
  );
};

export default UserTable;
