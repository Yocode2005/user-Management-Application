import React, { useState } from "react";
import { useAuditLogs } from "../hooks/useUsers";
import Avatar from "../components/common/Avatar";
import Pagination from "../components/common/Pagination";
import { PageSpinner } from "../components/common/Spinner";
import { formatDateTime } from "../utils/helpers";

const ACTION_COLORS = {
  USER_CREATED:    "text-green-400  bg-green-900/30  border-green-800/50",
  USER_UPDATED:    "text-accent-400 bg-accent-900/30 border-accent-800/50",
  USER_DELETED:    "text-red-400    bg-red-900/30    border-red-800/50",
  USER_BANNED:     "text-amber-400  bg-amber-900/30  border-amber-800/50",
  USER_ACTIVATED:  "text-green-400  bg-green-900/30  border-green-800/50",
  USER_DEACTIVATED:"text-amber-400  bg-amber-900/30  border-amber-800/50",
  ROLE_CHANGED:    "text-violet-400 bg-violet-900/30 border-violet-800/50",
  LOGIN:           "text-teal-400   bg-teal-900/30   border-teal-800/50",
  LOGOUT:          "text-slate-400  bg-slate-800/40  border-slate-700/50",
  AVATAR_UPDATED:  "text-pink-400   bg-pink-900/30   border-pink-800/50",
  PASSWORD_RESET:  "text-orange-400 bg-orange-900/30 border-orange-800/50",
  BULK_DELETE:     "text-red-400    bg-red-900/30    border-red-800/50",
};

const AuditLogs = () => {
  const [params, setParams] = useState({ page: 1, limit: 15 });
  const [actionFilter, setActionFilter] = useState("");

  const { data, isLoading } = useAuditLogs({ ...params, action: actionFilter || undefined });

  if (isLoading) return <PageSpinner />;

  const logs = data?.logs || [];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <p className="text-xs font-display font-bold uppercase tracking-widest text-muted mb-1">Reports</p>
          <h1 className="font-display font-black text-2xl text-slate-100">Audit Logs</h1>
          <p className="text-sm text-muted mt-1">Complete history of all admin actions</p>
        </div>

        <select
          value={actionFilter}
          onChange={(e) => { setActionFilter(e.target.value); setParams((p) => ({ ...p, page: 1 })); }}
          className="input text-sm py-2 px-3 min-w-[200px] bg-base-800 cursor-pointer"
        >
          <option value="">All Actions</option>
          {Object.keys(ACTION_COLORS).map((a) => (
            <option key={a} value={a}>{a.replace(/_/g, " ")}</option>
          ))}
        </select>
      </div>

      <div className="card overflow-hidden">
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="text-4xl opacity-20">◎</div>
            <p className="text-muted font-display font-semibold">No audit logs found</p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-base-850">
              {logs.map((log) => {
                const colors = ACTION_COLORS[log.action] || "text-slate-400 bg-base-700 border-border";
                return (
                  <div key={log._id} className="flex items-start gap-4 px-5 py-4 hover:bg-base-850/50 transition-colors">
                    {/* Performer avatar */}
                    <Avatar user={log.performedBy} size="sm" className="mt-0.5 flex-shrink-0" />

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-sm font-display font-semibold text-slate-200">
                          {log.performedBy?.fullName || "Unknown"}
                        </span>
                        <span className={`badge text-[10px] border ${colors}`}>
                          {log.action.replace(/_/g, " ")}
                        </span>
                        {log.targetUser && log.targetUser._id !== log.performedBy?._id && (
                          <span className="text-xs text-muted">
                            → <span className="text-slate-400">{log.targetUser.fullName || log.targetUser.email}</span>
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
                        <span>{formatDateTime(log.createdAt)}</span>
                        {log.ipAddress && <span>IP: {log.ipAddress}</span>}
                        {log.details && Object.keys(log.details).length > 0 && (
                          <span className="text-subtle font-mono text-[10px]">
                            {JSON.stringify(log.details).substring(0, 80)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <Pagination
              page={data.page}
              pages={data.pages}
              total={data.total}
              limit={params.limit}
              onPageChange={(p) => setParams((prev) => ({ ...prev, page: p }))}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default AuditLogs;
