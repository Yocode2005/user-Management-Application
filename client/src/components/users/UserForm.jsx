import React from "react";
import { useForm } from "react-hook-form";
import Spinner from "../common/Spinner";

const Field = ({ label, error, children }) => (
  <div>
    <label className="input-label">{label}</label>
    {children}
    {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
  </div>
);

const UserForm = ({ defaultValues = {}, onSubmit, isLoading, isAdmin = false, isCreate = false }) => {
  const {
    register, handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

      {/* Personal Info */}
      <div>
        <h4 className="text-xs font-display font-bold uppercase tracking-widest text-muted mb-4">
          Personal Information
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Full Name" error={errors.fullName?.message}>
            <input
              {...register("fullName", { required: "Full name is required" })}
              className={`input ${errors.fullName ? "input-error" : ""}`}
              placeholder="e.g. Rahul Sharma"
            />
          </Field>

          <Field label="Username" error={errors.username?.message}>
            <input
              {...register("username", {
                required: "Username is required",
                pattern: { value: /^[a-zA-Z0-9_]+$/, message: "Letters, numbers, underscores only" },
              })}
              className={`input ${errors.username ? "input-error" : ""}`}
              placeholder="e.g. rahul_s"
            />
          </Field>

          <Field label="Email Address" error={errors.email?.message}>
            <input
              type="email"
              {...register("email", {
                required: "Email is required",
                pattern: { value: /^\S+@\S+\.\S+$/, message: "Invalid email address" },
              })}
              className={`input ${errors.email ? "input-error" : ""}`}
              placeholder="rahul@example.com"
            />
          </Field>

          <Field label="Phone Number">
            <input
              {...register("phone")}
              className="input"
              placeholder="+91 98765 43210"
            />
          </Field>

          <Field label="Date of Birth">
            <input
              type="date"
              {...register("dob")}
              className="input"
            />
          </Field>

          <Field label="Gender">
            <select {...register("gender")} className="input cursor-pointer">
              <option value="prefer_not_to_say">Prefer not to say</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </Field>
        </div>
      </div>

      {/* Professional */}
      <div>
        <h4 className="text-xs font-display font-bold uppercase tracking-widest text-muted mb-4">
          Professional Info
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Occupation">
            <input
              {...register("occupation")}
              className="input"
              placeholder="e.g. Software Engineer"
            />
          </Field>
          <Field label="Company">
            <input
              {...register("company")}
              className="input"
              placeholder="e.g. TechCorp India"
            />
          </Field>
        </div>
        <div className="mt-4">
          <Field label="Bio">
            <textarea
              {...register("bio", { maxLength: { value: 500, message: "Max 500 characters" } })}
              className="input resize-none"
              rows={3}
              placeholder="A short bio…"
            />
          </Field>
        </div>
      </div>

      {/* Address */}
      <div>
        <h4 className="text-xs font-display font-bold uppercase tracking-widest text-muted mb-4">
          Address
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="City">
            <input {...register("address.city")} className="input" placeholder="Jaipur" />
          </Field>
          <Field label="State">
            <input {...register("address.state")} className="input" placeholder="Rajasthan" />
          </Field>
          <Field label="Country">
            <input {...register("address.country")} className="input" placeholder="India" />
          </Field>
        </div>
      </div>

      {/* Social Links */}
      <div>
        <h4 className="text-xs font-display font-bold uppercase tracking-widest text-muted mb-4">
          Social Links
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="GitHub">
            <input {...register("socialLinks.github")} className="input" placeholder="https://github.com/..." />
          </Field>
          <Field label="LinkedIn">
            <input {...register("socialLinks.linkedin")} className="input" placeholder="https://linkedin.com/in/..." />
          </Field>
          <Field label="Website">
            <input {...register("socialLinks.website")} className="input" placeholder="https://..." />
          </Field>
        </div>
      </div>

      {/* Account — admin only */}
      {isAdmin && (
        <div>
          <h4 className="text-xs font-display font-bold uppercase tracking-widest text-muted mb-4">
            Account Control
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Role">
              <select {...register("role")} className="input cursor-pointer">
                <option value="user">User</option>
                <option value="moderator">Moderator</option>
                <option value="admin">Admin</option>
              </select>
            </Field>
            <Field label="Status">
              <select {...register("status")} className="input cursor-pointer">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="banned">Banned</option>
              </select>
            </Field>
          </div>
        </div>
      )}

      {/* Password — only on create */}
      {isCreate && (
        <div>
          <h4 className="text-xs font-display font-bold uppercase tracking-widest text-muted mb-4">
            Security
          </h4>
          <Field label="Password" error={errors.password?.message}>
            <input
              type="password"
              {...register("password", {
                required: "Password is required",
                minLength: { value: 6, message: "Minimum 6 characters" },
              })}
              className={`input ${errors.password ? "input-error" : ""}`}
              placeholder="Min. 6 characters"
            />
          </Field>
        </div>
      )}

      {/* Submit */}
      <div className="flex justify-end gap-3 pt-2 border-t border-border">
        <button type="submit" className="btn-primary min-w-[140px]" disabled={isLoading}>
          {isLoading ? <Spinner size="sm" /> : isCreate ? "Create User" : "Save Changes"}
        </button>
      </div>
    </form>
  );
};

export default UserForm;
