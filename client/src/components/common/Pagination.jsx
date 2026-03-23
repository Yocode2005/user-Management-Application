import React from "react";

const Pagination = ({ page, pages, total, limit, onPageChange }) => {
  if (pages <= 1) return null;

  const getPages = () => {
    const arr = [];
    const delta = 1;
    const left  = Math.max(1, page - delta);
    const right = Math.min(pages, page + delta);
    if (left > 1)     { arr.push(1); if (left > 2) arr.push("…"); }
    for (let i = left; i <= right; i++) arr.push(i);
    if (right < pages){ if (right < pages - 1) arr.push("…"); arr.push(pages); }
    return arr;
  };

  const from = (page - 1) * limit + 1;
  const to   = Math.min(page * limit, total);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-border">
      <p className="text-xs text-muted">
        Showing <span className="text-slate-300">{from}–{to}</span> of{" "}
        <span className="text-slate-300">{total}</span> users
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="btn-icon w-8 h-8 text-sm disabled:opacity-30"
        >
          ‹
        </button>
        {getPages().map((p, i) =>
          p === "…" ? (
            <span key={`ellipsis-${i}`} className="px-1 text-muted text-sm">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`w-8 h-8 rounded-lg text-sm font-display font-semibold transition-all
                ${p === page
                  ? "bg-accent-600 text-white border border-accent-500"
                  : "btn-icon"
                }`}
            >
              {p}
            </button>
          )
        )}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === pages}
          className="btn-icon w-8 h-8 text-sm disabled:opacity-30"
        >
          ›
        </button>
      </div>
    </div>
  );
};

export default Pagination;
