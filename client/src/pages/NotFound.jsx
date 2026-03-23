import React from "react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-base-900 flex items-center justify-center p-4">
      <div className="text-center animate-slide-up">
        <p className="font-display font-black text-8xl text-gradient mb-4">404</p>
        <h1 className="font-display font-black text-2xl text-slate-100 mb-2">Page not found</h1>
        <p className="text-sm text-muted mb-8">The page you're looking for doesn't exist.</p>
        <button className="btn-primary" onClick={() => navigate("/dashboard")}>
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default NotFound;
