import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#3b82f6","#22c55e","#f59e0b","#ef4444"];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-base-800 border border-border rounded-xl px-4 py-3 shadow-card">
      <p className="text-sm font-display font-bold capitalize" style={{ color: payload[0].payload.fill }}>
        {payload[0].name}
      </p>
      <p className="text-xs text-muted">{payload[0].value} users</p>
    </div>
  );
};

const StatusDonut = ({ overview = {} }) => {
  const data = [
    { name: "Active",   value: overview.active   || 0 },
    { name: "Verified", value: overview.verifiedCount || 0 },
    { name: "Inactive", value: overview.inactive  || 0 },
    { name: "Banned",   value: overview.banned    || 0 },
  ].filter((d) => d.value > 0);

  return (
    <div className="card p-5">
      <div className="mb-5">
        <h3 className="font-display font-bold text-slate-100 text-sm">User Status</h3>
        <p className="text-xs text-muted mt-0.5">Distribution breakdown</p>
      </div>

      {data.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-sm text-muted">No data</div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie
                data={data} cx="50%" cy="50%"
                innerRadius={42} outerRadius={62}
                paddingAngle={3} dataKey="value"
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          <div className="space-y-2 mt-3">
            {data.map((item, i) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i] }} />
                  <span className="text-xs text-slate-400 font-display">{item.name}</span>
                </div>
                <span className="text-xs font-display font-bold text-slate-300">{item.value}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default StatusDonut;
