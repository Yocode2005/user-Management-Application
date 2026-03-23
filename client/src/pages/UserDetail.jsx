import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser, useUpdateStatus, useUpdateRole, useDeleteUser, useUploadAvatar } from "../hooks/useUsers";
import Avatar from "../components/common/Avatar";
import { StatusBadge, RoleBadge } from "../components/common/Badge";
import ConfirmDialog from "../components/common/ConfirmDialog";
import { PageSpinner } from "../components/common/Spinner";
import { formatDate, formatDateTime, timeAgo } from "../utils/helpers";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const InfoRow = ({ label, value }) => (
  <div className="flex justify-between items-center py-2.5 border-b border-base-850 last:border-0">
    <span className="text-xs font-display font-semibold uppercase tracking-wider text-muted">{label}</span>
    <span className="text-sm text-slate-300 text-right max-w-[60%] break-words">{value || "—"}</span>
  </div>
);

const SectionCard = ({ title, children }) => (
  <div className="card p-5">
    <h3 className="text-xs font-display font-bold uppercase tracking-widest text-muted mb-4">{title}</h3>
    {children}
  </div>
);

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, user: me } = useAuth();

  const { data: user, isLoading } = useUser(id);
  const statusMutation = useUpdateStatus();
  const roleMutation   = useUpdateRole();
  const deleteMutation = useDeleteUser();
  const avatarMutation = useUploadAvatar();

  const [confirm, setConfirm] = useState(null); // { type, label, action }

  if (isLoading) return <PageSpinner />;
  if (!user) return (
    <div className="text-center py-20">
      <p className="text-muted font-display">User not found.</p>
      <button className="btn-secondary mt-4" onClick={() => navigate("/users")}>← Back</button>
    </div>
  );

  const isSelf = me?._id === user._id;

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) avatarMutation.mutate({ id: user._id, file });
  };

  const STATUS_ACTIONS = ["active","inactive","banned"]
    .filter((s) => s !== user.status)
    .map((s) => ({
      label: `Set ${s.charAt(0).toUpperCase() + s.slice(1)}`,
      action: () => statusMutation.mutateAsync({ id: user._id, status: s }),
      danger: s === "banned",
    }));

  const ROLE_OPTIONS = ["user","moderator","admin"].filter((r) => r !== user.role);

  return (
    <div className="max-w-5xl mx-auto">
      {/* Breadcrumb + actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <button onClick={() => navigate("/users")}
                  className="text-xs text-muted hover:text-slate-300 font-display mb-2 flex items-center gap-1">
            ← All Users
          </button>
          <h1 className="font-display font-black text-2xl text-slate-100">User Profile</h1>
        </div>

        {isAdmin && !isSelf && (
          <div className="flex items-center gap-2">
            <button className="btn-secondary" onClick={() => navigate(`/users/${id}/edit`)}>
              ✎ Edit
            </button>
            {STATUS_ACTIONS.map((a) => (
              <button
                key={a.label}
                className={a.danger ? "btn-danger" : "btn-secondary"}
                onClick={() => setConfirm({ title: a.label, message: `Set this user as ${a.label.split(" ")[1].toLowerCase()}?`, action: a.action })}
              >
                {a.label}
              </button>
            ))}
            <button
              className="btn-danger"
              onClick={() => setConfirm({
                title: "Delete User",
                message: `Delete "${user.fullName}"? This is a soft delete.`,
                action: async () => { await deleteMutation.mutateAsync(user._id); navigate("/users"); },
              })}
            >
              ✕ Delete
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left column */}
        <div className="space-y-4">
          {/* Profile card */}
          <div className="card p-6 text-center">
            <div className="relative inline-block mb-4">
              <Avatar user={user} size="xl" />
              {isAdmin && (
                <label className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full
                                  bg-accent-600 border-2 border-base-800 flex items-center
                                  justify-center cursor-pointer hover:bg-accent-500 transition-colors">
                  <span className="text-white text-xs">✎</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </label>
              )}
            </div>
            <h2 className="font-display font-black text-lg text-slate-100">{user.fullName}</h2>
            <p className="text-sm text-muted mb-3">@{user.username}</p>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <StatusBadge status={user.status} />
              <RoleBadge role={user.role} />
              {user.isEmailVerified && (
                <span className="badge bg-teal-900/40 text-teal-400 border border-teal-800/50">✓ Verified</span>
              )}
            </div>

            {user.bio && (
              <p className="text-sm text-slate-400 mt-4 text-left border-t border-base-850 pt-4">
                {user.bio}
              </p>
            )}
          </div>

          {/* Role change */}
          {isAdmin && !isSelf && (
            <SectionCard title="Change Role">
              <div className="flex flex-wrap gap-2">
                {ROLE_OPTIONS.map((r) => (
                  <button
                    key={r}
                    className="btn-secondary text-xs capitalize"
                    onClick={() => setConfirm({
                      title: `Set role to ${r}`,
                      message: `Change ${user.fullName}'s role to ${r}?`,
                      action: () => roleMutation.mutateAsync({ id: user._id, role: r }),
                    })}
                  >
                    → {r}
                  </button>
                ))}
              </div>
            </SectionCard>
          )}

          {/* Activity stats */}
          <SectionCard title="Activity">
            <InfoRow label="Member since" value={formatDate(user.createdAt)} />
            <InfoRow label="Last login"   value={timeAgo(user.lastLogin)} />
            <InfoRow label="Total logins" value={user.loginCount?.toLocaleString()} />
            <InfoRow label="Last updated" value={timeAgo(user.updatedAt)} />
          </SectionCard>
        </div>

        {/* Right columns */}
        <div className="lg:col-span-2 space-y-4">
          <SectionCard title="Personal Information">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
              <InfoRow label="Full Name"  value={user.fullName} />
              <InfoRow label="Username"   value={`@${user.username}`} />
              <InfoRow label="Email"      value={user.email} />
              <InfoRow label="Phone"      value={user.phone} />
              <InfoRow label="Date of Birth" value={formatDate(user.dob)} />
              <InfoRow label="Age"        value={user.age ? `${user.age} years` : null} />
              <InfoRow label="Gender"     value={user.gender?.replace(/_/g, " ")} />
            </div>
          </SectionCard>

          <SectionCard title="Professional Info">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
              <InfoRow label="Occupation" value={user.occupation} />
              <InfoRow label="Company"    value={user.company} />
              <InfoRow label="City"       value={user.address?.city} />
              <InfoRow label="State"      value={user.address?.state} />
              <InfoRow label="Country"    value={user.address?.country} />
            </div>
          </SectionCard>

          {(user.socialLinks?.github || user.socialLinks?.linkedin || user.socialLinks?.website) && (
            <SectionCard title="Social Links">
              {user.socialLinks?.github   && <InfoRow label="GitHub"   value={user.socialLinks.github} />}
              {user.socialLinks?.linkedin && <InfoRow label="LinkedIn" value={user.socialLinks.linkedin} />}
              {user.socialLinks?.website  && <InfoRow label="Website"  value={user.socialLinks.website} />}
            </SectionCard>
          )}

          <SectionCard title="Account Details">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
              <InfoRow label="Role"          value={user.role} />
              <InfoRow label="Status"        value={user.status} />
              <InfoRow label="Email Verified" value={user.isEmailVerified ? "Yes" : "No"} />
              <InfoRow label="Account ID"    value={user._id} />
              <InfoRow label="Created"       value={formatDateTime(user.createdAt)} />
              <InfoRow label="Updated"       value={formatDateTime(user.updatedAt)} />
            </div>
          </SectionCard>
        </div>
      </div>

      {/* Confirm dialog */}
      <ConfirmDialog
        isOpen={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={async () => { await confirm.action(); setConfirm(null); }}
        title={confirm?.title}
        message={confirm?.message}
        confirmLabel="Confirm"
        danger
      />
    </div>
  );
};

export default UserDetail;
