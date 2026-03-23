import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Avatar from "../common/Avatar";

const NavItem = ({ to, icon, label, badge }) => (
  <NavLink to={to}>
    {({ isActive }) => (
      <div className={isActive ? "nav-item-active" : "nav-item"}>
        <span className="text-base w-5 text-center">{icon}</span>
        <span className="flex-1 font-display text-sm">{label}</span>
        {badge && (
          <span className="text-xs bg-accent-600/30 text-accent-400 border border-accent-600/40
                           px-2 py-0.5 rounded-full font-display font-semibold">
            {badge}
          </span>
        )}
      </div>
    )}
  </NavLink>
);

const Sidebar = ({ userCount }) => {
  const { user, logout, isAdmin, isAdminOrMod } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    navigate("/login");
  };

  return (
    <aside className="w-56 min-h-screen bg-base-850 border-r border-border
                      flex flex-col fixed left-0 top-0 bottom-0 z-30">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center
                          justify-center font-display font-black text-white text-sm shadow-glow-sm">
            U
          </div>
          <div>
            <div className="font-display font-black text-slate-100 text-sm leading-none">UserBase</div>
            <div className="text-xs text-muted mt-0.5 tracking-wider uppercase">Admin Panel</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto scrollbar-hide">
        <p className="text-xs font-display font-bold text-subtle uppercase tracking-widest
                      px-3 py-1.5 mb-1">
          Main
        </p>
        <NavItem to="/dashboard" icon="◈" label="Dashboard" />
        {isAdminOrMod && (
          <NavItem to="/users" icon="⊞" label="All Users" badge={userCount} />
        )}
        <NavItem to="/profile" icon="◉" label="My Profile" />

        {isAdminOrMod && (
          <>
            <p className="text-xs font-display font-bold text-subtle uppercase tracking-widest
                          px-3 py-1.5 mt-4 mb-1">
              Reports
            </p>
            <NavItem to="/audit" icon="◎" label="Audit Logs" />
          </>
        )}

        {isAdmin && (
          <>
            <p className="text-xs font-display font-bold text-subtle uppercase tracking-widest
                          px-3 py-1.5 mt-4 mb-1">
              Admin
            </p>
            <NavItem to="/users/create" icon="⊕" label="Add User" />
          </>
        )}
      </nav>

      {/* User footer */}
      <div className="px-3 py-4 border-t border-border">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg
                        hover:bg-base-700 transition-colors cursor-pointer group"
             onClick={() => navigate("/profile")}>
          <Avatar user={user} size="xs" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-display font-semibold text-slate-200 truncate leading-none">
              {user?.fullName}
            </p>
            <p className="text-xs text-muted mt-0.5 capitalize">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full mt-2 nav-item text-red-400 hover:bg-red-900/20 hover:text-red-300"
        >
          <span className="text-base w-5 text-center">⏻</span>
          <span className="font-display text-sm">{loggingOut ? "Logging out…" : "Logout"}</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
