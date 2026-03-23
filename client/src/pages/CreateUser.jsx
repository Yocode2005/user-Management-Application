import React from "react";
import { useNavigate } from "react-router-dom";
import { useCreateUser } from "../hooks/useUsers";
import UserForm from "../components/users/UserForm";

const CreateUser = () => {
  const navigate = useNavigate();
  const createUser = useCreateUser();

  const handleSubmit = async (data) => {
    const result = await createUser.mutateAsync(data);
    navigate(`/users/${result.data.data.user._id}`);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button onClick={() => navigate("/users")}
                className="text-xs text-muted hover:text-slate-300 font-display mb-2 flex items-center gap-1">
          ← Back to Users
        </button>
        <h1 className="font-display font-black text-2xl text-slate-100">Create New User</h1>
        <p className="text-sm text-muted mt-1">Admin-created users skip email verification</p>
      </div>

      <div className="card p-6">
        <UserForm
          defaultValues={{ role: "user", status: "active", gender: "prefer_not_to_say" }}
          onSubmit={handleSubmit}
          isLoading={createUser.isLoading}
          isAdmin
          isCreate
        />
      </div>
    </div>
  );
};

export default CreateUser;
