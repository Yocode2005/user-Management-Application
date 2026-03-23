import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import Spinner from "../components/common/Spinner";

const Login = () => {
  const { login } = useAuth();
  const navigate   = useNavigate();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await login(data.email, data.password);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-900 flex items-center justify-center p-4
                    bg-[radial-gradient(ellipse_at_20%_50%,rgba(59,130,246,0.07)_0%,transparent_60%),
                        radial-gradient(ellipse_at_80%_20%,rgba(139,92,246,0.05)_0%,transparent_50%)]">

      <div className="w-full max-w-sm animate-slide-up">
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

        <div className="card p-8">
          <h1 className="font-display font-black text-2xl text-slate-100 mb-1">Welcome back</h1>
          <p className="text-sm text-muted mb-7">Sign in to your account</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="input-label">Email Address</label>
              <input
                type="email"
                {...register("email", { required: "Email is required" })}
                className={`input ${errors.email ? "input-error" : ""}`}
                placeholder="you@example.com"
                autoComplete="email"
              />
              {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="input-label mb-0">Password</label>
                <Link to="/forgot-password" className="text-xs text-accent-400 hover:text-accent-300 font-display">
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                {...register("password", { required: "Password is required" })}
                className={`input ${errors.password ? "input-error" : ""}`}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>}
            </div>

            <button type="submit" className="btn-primary w-full py-3 mt-2" disabled={loading}>
              {loading ? <Spinner size="sm" /> : "Sign In"}
            </button>
          </form>

          <p className="text-center text-sm text-muted mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="text-accent-400 hover:text-accent-300 font-display font-semibold">
              Create one
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-subtle mt-5">
          © {new Date().getFullYear()} UserBase. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;
