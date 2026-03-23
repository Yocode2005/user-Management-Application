import React from "react";
import { useNavigate } from "react-router-dom";
import { useStats } from "../hooks/useUsers";
import { useAuth } from "../context/AuthContext";
import StatsCards from "../components/dashboard/StatsCards";
import SignupChart from "../components/dashboard/SignupChart";
import StatusDonut from "../components/dashboard/StatusDonut";
import { PageSpinner } from "../components/common/Spinner";

const Dashboard = () => {
  const { user, isAdminOrMod } = useAuth();
  const { data: stats, isLoading } = useStats();
  const navigate = useNavigate();

  if (isLoading) return <PageSpinner />;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-7">
        <div>
          <p className="text-xs font-display font-bold uppercase tracking-widest text-muted mb-1">
            Overview
          </p>
          <h1 className="font-display font-black text-2xl text-slate-100">
            Good {getGreeting()},{" "}
            <span className="text-gradient">{user?.fullName?.split(" ")[0]}</span>
          </h1>
          <p className="text-sm text-muted mt-1">
            {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        {isAdminOrMod && (
          <button className="btn-primary" onClick={() => navigate("/users/create")}>
            ⊕ Add User
          </button>
        )}
      </div>

      {/* Stat cards */}
      {isAdminOrMod && <StatsCards stats={stats} />}

      {/* Charts */}
      {isAdminOrMod && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="lg:col-span-2">
            <SignupChart monthlySignups={stats?.monthlySignups || []} />
          </div>
          <div>
            <StatusDonut overview={stats?.overview || {}} />
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isAdminOrMod && (
          <QuickCard
            icon="⊞"
            title="Manage Users"
            desc="View, search, and manage all registered users"
            onClick={() => navigate("/users")}
            color="text-accent-400"
          />
        )}
        <QuickCard
          icon="◉"
          title="My Profile"
          desc="Update your personal info and profile picture"
          onClick={() => navigate("/profile")}
          color="text-violet-400"
        />
        {isAdminOrMod && (
          <QuickCard
            icon="◎"
            title="Audit Logs"
            desc="See a full history of admin actions"
            onClick={() => navigate("/audit")}
            color="text-teal-400"
          />
        )}
      </div>
    </div>
  );
};

const QuickCard = ({ icon, title, desc, onClick, color }) => (
  <button
    onClick={onClick}
    className="card-hover p-5 text-left group transition-all hover:-translate-y-0.5"
  >
    <span className={`text-2xl ${color} block mb-3 group-hover:scale-110 transition-transform`}>
      {icon}
    </span>
    <h3 className="font-display font-bold text-sm text-slate-200 mb-1 group-hover:text-white transition-colors">
      {title}
    </h3>
    <p className="text-xs text-muted">{desc}</p>
  </button>
);

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
};

export default Dashboard;
