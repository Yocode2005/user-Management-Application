import { format, formatDistanceToNow, parseISO } from "date-fns";

// ── Date helpers ──────────────────────────────────────
export const formatDate = (date) => {
  if (!date) return "—";
  try { return format(parseISO(date), "MMM dd, yyyy"); } catch { return "—"; }
};

export const formatDateTime = (date) => {
  if (!date) return "—";
  try { return format(parseISO(date), "MMM dd, yyyy · HH:mm"); } catch { return "—"; }
};

export const timeAgo = (date) => {
  if (!date) return "Never";
  try { return formatDistanceToNow(parseISO(date), { addSuffix: true }); } catch { return "—"; }
};

// ── Avatar initials ───────────────────────────────────
export const getInitials = (name = "") => {
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// ── Avatar gradient colors based on username ─────────
const GRADIENTS = [
  ["#6366f1","#8b5cf6"],
  ["#3b82f6","#0ea5e9"],
  ["#f59e0b","#ef4444"],
  ["#22c55e","#16a34a"],
  ["#ec4899","#f43f5e"],
  ["#0ea5e9","#06b6d4"],
  ["#a855f7","#d946ef"],
  ["#f97316","#fbbf24"],
];

export const getAvatarGradient = (username = "") => {
  const idx = username.charCodeAt(0) % GRADIENTS.length;
  const [from, to] = GRADIENTS[idx];
  return `linear-gradient(135deg, ${from}, ${to})`;
};

// ── CSV download trigger ──────────────────────────────
export const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a   = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// ── Truncate text ─────────────────────────────────────
export const truncate = (str, max = 30) =>
  str?.length > max ? str.substring(0, max) + "…" : str || "";

// ── Debounce ──────────────────────────────────────────
export const debounce = (fn, delay = 400) => {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
};

// ── Capitalise first letter ───────────────────────────
export const capitalize = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
