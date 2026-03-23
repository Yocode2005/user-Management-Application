import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { authService } from "../services/authService";
import toast from "react-hot-toast";
import Spinner from "../components/common/Spinner";

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async ({ email }) => {
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSent(true);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm animate-slide-up">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center
                          font-display font-black text-white text-lg shadow-glow">U</div>
          <div className="font-display font-black text-slate-100 text-lg">UserBase</div>
        </div>

        <div className="card p-8">
          {sent ? (
            <div className="text-center">
              <div className="text-4xl mb-4">✉️</div>
              <h2 className="font-display font-black text-xl text-slate-100 mb-2">Check your inbox</h2>
              <p className="text-sm text-muted mb-6">
                If an account with that email exists, we've sent a password reset link.
              </p>
              <Link to="/login" className="btn-primary inline-flex">Back to Login</Link>
            </div>
          ) : (
            <>
              <h1 className="font-display font-black text-2xl text-slate-100 mb-1">Forgot password?</h1>
              <p className="text-sm text-muted mb-7">Enter your email and we'll send a reset link.</p>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
                  {loading ? <Spinner size="sm" /> : "Send Reset Link"}
                </button>
              </form>
              <p className="text-center text-sm text-muted mt-6">
                <Link to="/login" className="text-accent-400 hover:text-accent-300 font-display font-semibold">
                  ← Back to Login
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
