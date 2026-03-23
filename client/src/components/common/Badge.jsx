import React from "react";

const statusMap = {
  active:   "badge-active",
  inactive: "badge-inactive",
  banned:   "badge-banned",
};
const roleMap = {
  admin:     "badge-admin",
  moderator: "badge-moderator",
  user:      "badge-user",
};

const statusDots = {
  active:   "bg-green-400",
  inactive: "bg-amber-400",
  banned:   "bg-red-400",
};

export const StatusBadge = ({ status }) => (
  <span className={statusMap[status] || "badge"}>
    <span className={`w-1.5 h-1.5 rounded-full ${statusDots[status] || "bg-slate-400"}`} />
    {status}
  </span>
);

export const RoleBadge = ({ role }) => (
  <span className={roleMap[role] || "badge"}>
    {role}
  </span>
);
