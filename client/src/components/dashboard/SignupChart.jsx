import React from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-base-800 border border-border rounded-xl px-4 py-3 shadow-card">
      <p className="text-xs text-muted font-display uppercase tracking-wide mb-1">{label}</p>
      <p className="text-lg font-display font-bold text-accent-400">
        {payload[0].value} <span className="text-sm text-muted font-normal">signups</span>
      </p>
    </div>
  );
};

const SignupChart = ({ monthlySignups = [] }) => {
  const data = monthlySignups.map((m) => ({
    name: MONTHS[(m._id.month - 1) % 12],
    signups: m.count,
  }));

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-display font-bold text-slate-100 text-sm">User Signups</h3>
          <p className="text-xs text-muted mt-0.5">Monthly registration trend</p>
        </div>
        <span className="badge badge-active">Live</span>
      </div>

      {data.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-sm text-muted">
          No signup data yet
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="signupGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}   />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e2d40" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: "#475569", fontFamily: "Syne, sans-serif" }}
              axisLine={false} tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#475569", fontFamily: "Syne, sans-serif" }}
              axisLine={false} tickLine={false} allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone" dataKey="signups"
              stroke="#3b82f6" strokeWidth={2}
              fill="url(#signupGrad)" dot={{ fill: "#3b82f6", r: 3 }}
              activeDot={{ r: 5, fill: "#60a5fa" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default SignupChart;
