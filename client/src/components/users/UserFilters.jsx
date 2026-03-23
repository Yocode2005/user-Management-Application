import React from "react";

const STATUS_OPTIONS = ["all","active","inactive","banned"];
const ROLE_OPTIONS   = ["all","user","admin","moderator"];

const UserFilters = ({ filters, onChange }) => {
  const set = (key, val) => onChange({ ...filters, [key]: val, page: 1 });

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="flex items-center gap-2 bg-base-800 border border-border rounded-lg
                      px-3 py-2 focus-within:border-accent-500 transition-colors min-w-[220px]">
        <span className="text-muted text-sm">⌕</span>
        <input
          value={filters.search || ""}
          onChange={(e) => set("search", e.target.value)}
          placeholder="Search name, email, occupation…"
          className="bg-transparent text-sm text-slate-200 placeholder-subtle outline-none w-full font-body"
        />
        {filters.search && (
          <button onClick={() => set("search", "")} className="text-muted hover:text-slate-300 text-xs">✕</button>
        )}
      </div>

      {/* Status filter chips */}
      <div className="flex items-center gap-1.5 bg-base-850 border border-border rounded-lg p-1">
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            onClick={() => set("status", s === "all" ? "" : s)}
            className={`px-3 py-1 rounded-md text-xs font-display font-semibold capitalize transition-all
              ${(filters.status || "all") === s
                ? "bg-accent-600 text-white shadow-glow-sm"
                : "text-muted hover:text-slate-300"
              }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Role filter */}
      <select
        value={filters.role || ""}
        onChange={(e) => set("role", e.target.value)}
        className="input text-sm py-2 px-3 min-w-[120px] bg-base-800 cursor-pointer"
      >
        {ROLE_OPTIONS.map((r) => (
          <option key={r} value={r === "all" ? "" : r}>
            {r === "all" ? "All Roles" : r.charAt(0).toUpperCase() + r.slice(1)}
          </option>
        ))}
      </select>

      {/* Sort */}
      <select
        value={`${filters.sortBy || "createdAt"}:${filters.sortOrder || "desc"}`}
        onChange={(e) => {
          const [sortBy, sortOrder] = e.target.value.split(":");
          onChange({ ...filters, sortBy, sortOrder, page: 1 });
        }}
        className="input text-sm py-2 px-3 min-w-[150px] bg-base-800 cursor-pointer"
      >
        <option value="createdAt:desc">Newest First</option>
        <option value="createdAt:asc">Oldest First</option>
        <option value="fullName:asc">Name A–Z</option>
        <option value="fullName:desc">Name Z–A</option>
        <option value="lastLogin:desc">Last Login</option>
        <option value="loginCount:desc">Most Logins</option>
      </select>
    </div>
  );
};

export default UserFilters;
