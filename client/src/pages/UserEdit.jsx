import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser, useUpdateUser } from "../hooks/useUsers";
import UserForm from "../components/users/UserForm";
import { PageSpinner } from "../components/common/Spinner";
import { useAuth } from "../context/AuthContext";

const UserEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { data: user, isLoading } = useUser(id);
  const updateUser = useUpdateUser();

  if (isLoading) return <PageSpinner />;
  if (!user) return <div className="text-center py-20 text-muted">User not found.</div>;

  const handleSubmit = async (formData) => {
    await updateUser.mutateAsync({ id, data: formData });
    navigate(`/users/${id}`);
  };

  // Flatten nested fields for react-hook-form defaultValues
  const defaults = {
    ...user,
    dob: user.dob ? user.dob.substring(0, 10) : "",
    "address.city":    user.address?.city    || "",
    "address.state":   user.address?.state   || "",
    "address.country": user.address?.country || "",
    "socialLinks.github":   user.socialLinks?.github   || "",
    "socialLinks.linkedin": user.socialLinks?.linkedin || "",
    "socialLinks.website":  user.socialLinks?.website  || "",
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button onClick={() => navigate(`/users/${id}`)}
                className="text-xs text-muted hover:text-slate-300 font-display mb-2 flex items-center gap-1">
          ← Back to Profile
        </button>
        <h1 className="font-display font-black text-2xl text-slate-100">Edit User</h1>
        <p className="text-sm text-muted mt-1">Editing: {user.fullName}</p>
      </div>

      <div className="card p-6">
        <UserForm
          defaultValues={defaults}
          onSubmit={handleSubmit}
          isLoading={updateUser.isLoading}
          isAdmin={isAdmin}
          isCreate={false}
        />
      </div>
    </div>
  );
};

export default UserEdit;
