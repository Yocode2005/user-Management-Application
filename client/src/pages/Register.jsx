import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import Spinner from "../components/common/Spinner";

const Register = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await registerUser(data);
      setDone(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-900 flex items-center justify-center p-4
                    bg-[radial-gradient(ellipse_at_30%_60%,rgba(139,92,246,0.07)_0%,transparent_60%)]">

      <div className="w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center
                          font-display font-black text-white text-lg shadow-glow">
            U
          </div>
          <div>
            <div className="font-display font-black text-slate-100 text-lg leading-none">UserBase</div>
            <div className="text-xs text-muted tracking-widest uppercase mt-0.5">Management Platform</div>
          </div>
        </div>

        {done ? (
          <div className="card p-8 text-center">
            <div className="text-4xl mb-4">✉️</div>
            <h2 className="font-display font-black text-xl text-slate-100 mb-2">Check your email</h2>
            <p className="text-sm text-muted mb-6">
              We sent a verification link to your email. Click it to activate your account.
            </p>
            <Link to="/login" className="btn-primary inline-flex">Back to Login</Link>
          </div>
        ) : (
          <div className="card p-8">
            <h1 className="font-display font-black text-2xl text-slate-100 mb-1">Create account</h1>
            <p className="text-sm text-muted mb-7">Join the UserBase platform</p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="input-label">Full Name</label>
                  <input
                    {...register("fullName", { required: "Required" })}
                    className={`input ${errors.fullName ? "input-error" : ""}`}
                    placeholder="Rahul Sharma"
                  />
                  {errors.fullName && <p className="text-xs text-red-400 mt-1">{errors.fullName.message}</p>}
                </div>
                <div>
                  <label className="input-label">Username</label>
                  <input
                    {...register("username", {
                      required: "Required",
                      pattern: { value: /^[a-zA-Z0-9_]+$/, message: "Letters, numbers, _ only" },
                    })}
                    className={`input ${errors.username ? "input-error" : ""}`}
                    placeholder="rahul_s"
                  />
                  {errors.username && <p className="text-xs text-red-400 mt-1">{errors.username.message}</p>}
                </div>
              </div>

              <div>
                <label className="input-label">Email Address</label>
                <input
                  type="email"
                  {...register("email", { required: "Email is required" })}
                  className={`input ${errors.email ? "input-error" : ""}`}
                  placeholder="you@example.com"
                />
                {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="input-label">Occupation</label>
                  <input
                    {...register("occupation")}
                    className="input"
                    placeholder="e.g. Developer"
                  />
                </div>
                <div>
                  <label className="input-label">Date of Birth</label>
                  <input type="date" {...register("dob")} className="input" />
                </div>
              </div>

              <div>
                <label className="input-label">Password</label>
                <input
                  type="password"
                  {...register("password", {
                    required: "Password is required",
                    minLength: { value: 6, message: "Min 6 characters" },
                  })}
                  className={`input ${errors.password ? "input-error" : ""}`}
                  placeholder="Min. 6 characters"
                />
                {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>}
              </div>

              <button type="submit" className="btn-primary w-full py-3 mt-2" disabled={loading}>
                {loading ? <Spinner size="sm" /> : "Create Account"}
              </button>
            </form>

            <p className="text-center text-sm text-muted mt-6">
              Already registered?{" "}
              <Link to="/login" className="text-accent-400 hover:text-accent-300 font-display font-semibold">
                Sign in
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;
