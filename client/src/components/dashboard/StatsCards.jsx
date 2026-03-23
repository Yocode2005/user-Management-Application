import React from "react";

const cards = [
  {
    key:   "total",
    label: "Total Users",
    icon:  "⊞",
    color: "from-accent-500/20 to-accent-600/5",
    border:"border-accent-600/30",
    text:  "text-accent-400",
  },
  {
    key:   "active",
    label: "Active Users",
    icon:  "◉",
    color: "from-green-500/20 to-green-600/5",
    border:"border-green-600/30",
    text:  "text-green-400",
  },
  {
    key:   "newThisMonth",
    label: "New This Month",
    icon:  "⊕",
    color: "from-violet-500/20 to-violet-600/5",
    border:"border-violet-600/30",
    text:  "text-violet-400",
  },
  {
    key:   "banned",
    label: "Banned",
    icon:  "⊘",
    color: "from-red-500/20 to-red-600/5",
    border:"border-red-600/30",
    text:  "text-red-400",
  },
];

const StatCard = ({ label, value, icon, color, border, text, index }) => (
  <div
    className={`stat-card bg-gradient-to-br ${color} border ${border} animate-slide-up`}
    style={{ animationDelay: `${index * 80}ms`, animationFillMode: "both" }}
  >
    {/* Decorative circle */}
    <div className={`absolute -top-4 -right-4 w-20 h-20 rounded-full ${text} opacity-5`}
         style={{ background: "currentColor" }} />

    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-display font-bold uppercase tracking-widest text-muted mb-3">
          {label}
        </p>
        <p className={`font-display font-black text-3xl ${text}`}>
          {value?.toLocaleString() ?? "—"}
        </p>
      </div>
      <span className={`text-2xl ${text} opacity-60`}>{icon}</span>
    </div>
  </div>
);

const StatsCards = ({ stats }) => {
  const overview = stats?.overview || {};
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((c, i) => (
        <StatCard key={c.key} {...c} value={overview[c.key]} index={i} />
      ))}
    </div>
  );
};

export default StatsCards;
