import React from "react";

const Spinner = ({ size = "md", className = "" }) => {
  const s = { sm: "w-4 h-4", md: "w-6 h-6", lg: "w-10 h-10" }[size];
  return (
    <div className={`${s} border-2 border-border border-t-accent-500 rounded-full animate-spin ${className}`} />
  );
};

export const PageSpinner = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="flex flex-col items-center gap-3">
      <Spinner size="lg" />
      <p className="text-sm text-muted font-display">Loading…</p>
    </div>
  </div>
);

export default Spinner;
