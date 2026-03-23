import React from "react";
import { getInitials, getAvatarGradient } from "../../utils/helpers";

const sizes = {
  xs: "w-7 h-7 text-xs",
  sm: "w-9 h-9 text-sm",
  md: "w-11 h-11 text-base",
  lg: "w-16 h-16 text-xl",
  xl: "w-20 h-20 text-2xl",
};

const Avatar = ({ user, size = "sm", className = "" }) => {
  const sizeClass = sizes[size] || sizes.sm;
  const initials  = getInitials(user?.fullName || user?.username || "?");
  const gradient  = getAvatarGradient(user?.username || "");

  if (user?.avatar?.url) {
    return (
      <img
        src={user.avatar.url}
        alt={user.fullName}
        className={`${sizeClass} rounded-full object-cover ring-2 ring-border flex-shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} rounded-full flex items-center justify-center
                  font-display font-bold text-white flex-shrink-0 ring-2 ring-border ${className}`}
      style={{ background: gradient }}
    >
      {initials}
    </div>
  );
};

export default Avatar;
