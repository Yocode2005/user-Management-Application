import React, { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import { profileService } from "../services/userService";
import Avatar from "../components/common/Avatar";
import { StatusBadge, RoleBadge } from "../components/common/Badge";
import Spinner from "../components/common/Spinner";
import { formatDate, timeAgo } from "../utils/helpers";
import toast from "react-hot-toast";

const SectionCard = ({ title, children }) => (
  <div className="card p-6">
    <h3 className="text-xs font-display font-bold uppercase tracking-widest text-muted mb-5">{title}</h3>
    {children}
  </div>
);

const Field = ({ label, error, children }) => (
  <div>
    <label className="input-label">{label}</label>
    {children}
    {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
  </div>
);

const Profile = () => {
  const { user, updateUser } = useAuth();
  const fileRef = useRef();

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const profileForm = useForm({
    defaultValues: {
      fullName:   user?.fullName   || "",
      phone:      user?.phone      || "",
      dob:        user?.dob?.substring(0, 10) || "",
      gender:     user?.gender     || "prefer_not_to_say",
      bio:        user?.bio        || "",
      occupation: user?.occupation || "",
      company:    user?.company    || "",
      "address.city":    user?.address?.city    || "",
      "address.state":   user?.address?.state   || "",
      "address.country": user?.address?.country || "",
      "socialLinks.github":   user?.socialLinks?.github   || "",
      "socialLinks.linkedin": user?.socialLinks?.linkedin || "",
      "socialLinks.website":  user?.socialLinks?.website  || "",
    },
  });

  const pwForm = useForm();

  const handleProfileSave = async (data) => {
    setSavingProfile(true);
    try {
      // Re-nest address and socialLinks
      const payload = { ...data };
      payload.address     = { city: data["address.city"], state: data["address.state"], country: data["address.country"] };
      payload.socialLinks = { github: data["socialLinks.github"], linkedin: data["socialLinks.linkedin"], website: data["socialLinks.website"] };
      ["address.city","address.state","address.country",
       "socialLinks.github","socialLinks.linkedin","socialLinks.website"].forEach((k) => delete payload[k]);

      const res = await profileService.updateMe(payload);
      updateUser(res.data.data.user);
      toast.success("Profile updated!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async (data) => {
    setSavingPassword(true);
    try {
      await profileService.changePassword(data);
      pwForm.reset();
      toast.success("Password changed successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Password change failed");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const res = await profileService.uploadAvatar(file);
      updateUser({ avatar: res.data.data.avatar });
      toast.success("Avatar updated!");
    } catch { toast.error("Avatar upload failed"); }
    finally { setUploadingAvatar(false); }
  };

  const { register: rp, handleSubmit: hsp, formState: { errors: ep } } = profileForm;
  const { register: rw, handleSubmit: hsw, formState: { errors: ew }, watch: ww } = pwForm;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <p className="text-xs font-display font-bold uppercase tracking-widest text-muted mb-1">Account</p>
        <h1 className="font-display font-black text-2xl text-slate-100">My Profile</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: avatar card */}
        <div className="space-y-4">
          <SectionCard title="Profile Picture">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Avatar user={user} size="xl" />
                {uploadingAvatar && (
                  <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                    <Spinner size="sm" />
                  </div>
                )}
              </div>
              <button
                className="btn-secondary text-xs"
                onClick={() => fileRef.current?.click()}
                disabled={uploadingAvatar}
              >
                {uploadingAvatar ? "Uploading…" : "Change Photo"}
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              <p className="text-xs text-subtle text-center">JPG, PNG or WebP · Max 5MB</p>
            </div>
          </SectionCard>

          <SectionCard title="Account Info">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted font-display uppercase tracking-wider">Status</span>
                <StatusBadge status={user?.status} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted font-display uppercase tracking-wider">Role</span>
                <RoleBadge role={user?.role} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted font-display uppercase tracking-wider">Member since</span>
                <span className="text-xs text-slate-300">{formatDate(user?.createdAt)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted font-display uppercase tracking-wider">Last login</span>
                <span className="text-xs text-slate-300">{timeAgo(user?.lastLogin)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted font-display uppercase tracking-wider">Logins</span>
                <span className="text-xs text-slate-300">{user?.loginCount || 0}</span>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Right: edit forms */}
        <div className="lg:col-span-2 space-y-5">
          {/* Profile form */}
          <SectionCard title="Personal Information">
            <form onSubmit={hsp(handleProfileSave)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Full Name" error={ep.fullName?.message}>
                  <input {...rp("fullName", { required: "Required" })} className="input" />
                </Field>
                <Field label="Phone">
                  <input {...rp("phone")} className="input" placeholder="+91 98765 43210" />
                </Field>
                <Field label="Date of Birth">
                  <input type="date" {...rp("dob")} className="input" />
                </Field>
                <Field label="Gender">
                  <select {...rp("gender")} className="input cursor-pointer">
                    <option value="prefer_not_to_say">Prefer not to say</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </Field>
                <Field label="Occupation">
                  <input {...rp("occupation")} className="input" placeholder="e.g. Software Engineer" />
                </Field>
                <Field label="Company">
                  <input {...rp("company")} className="input" placeholder="e.g. TechCorp" />
                </Field>
              </div>
              <Field label="Bio">
                <textarea {...rp("bio", { maxLength: { value: 500, message: "Max 500 chars" } })}
                          className="input resize-none" rows={3} placeholder="Tell us about yourself…" />
              </Field>
              <div className="grid grid-cols-3 gap-3">
                <Field label="City">
                  <input {...rp("address.city")} className="input" placeholder="Jaipur" />
                </Field>
                <Field label="State">
                  <input {...rp("address.state")} className="input" placeholder="Rajasthan" />
                </Field>
                <Field label="Country">
                  <input {...rp("address.country")} className="input" placeholder="India" />
                </Field>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Field label="GitHub">
                  <input {...rp("socialLinks.github")} className="input" placeholder="github.com/..." />
                </Field>
                <Field label="LinkedIn">
                  <input {...rp("socialLinks.linkedin")} className="input" placeholder="linkedin.com/in/..." />
                </Field>
                <Field label="Website">
                  <input {...rp("socialLinks.website")} className="input" placeholder="yoursite.com" />
                </Field>
              </div>
              <div className="flex justify-end pt-2 border-t border-border">
                <button type="submit" className="btn-primary min-w-[130px]" disabled={savingProfile}>
                  {savingProfile ? <Spinner size="sm" /> : "Save Profile"}
                </button>
              </div>
            </form>
          </SectionCard>

          {/* Password change */}
          <SectionCard title="Change Password">
            <form onSubmit={hsw(handlePasswordChange)} className="space-y-4">
              <Field label="Current Password" error={ew.currentPassword?.message}>
                <input type="password"
                       {...rw("currentPassword", { required: "Required" })}
                       className="input" placeholder="Your current password" />
              </Field>
              <Field label="New Password" error={ew.newPassword?.message}>
                <input type="password"
                       {...rw("newPassword", {
                         required: "Required",
                         minLength: { value: 6, message: "Min 6 characters" },
                         validate: (v) => v !== ww("currentPassword") || "Must differ from current",
                       })}
                       className="input" placeholder="New password (min 6 chars)" />
              </Field>
              <Field label="Confirm New Password" error={ew.confirmPassword?.message}>
                <input type="password"
                       {...rw("confirmPassword", {
                         required: "Required",
                         validate: (v) => v === ww("newPassword") || "Passwords do not match",
                       })}
                       className="input" placeholder="Repeat new password" />
              </Field>
              <div className="flex justify-end pt-2 border-t border-border">
                <button type="submit" className="btn-primary min-w-[160px]" disabled={savingPassword}>
                  {savingPassword ? <Spinner size="sm" /> : "Change Password"}
                </button>
              </div>
            </form>
          </SectionCard>
        </div>
      </div>
    </div>
  );
};

export default Profile;
