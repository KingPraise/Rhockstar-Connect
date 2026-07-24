"use client";

import { useEffect, useState } from "react";
import { 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  UserX, 
  Loader2, 
  ShieldAlert, 
  Filter 
} from "lucide-react";
import { getSystemReports, resolveReport, AdminReport } from "@/lib/services/admin";

export default function AdminReportsPage() {
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<"pending" | "resolved" | "dismissed">("pending");
  const [toastMsg, setToastMsg] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadReports = async () => {
    setLoading(true);
    const res = await getSystemReports();
    if (res.success) {
      setReports(res.reports);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadReports();
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  const handleResolve = async (
    reportId: string, 
    action: 'dismiss' | 'delete_content' | 'ban_user',
    targetId?: string,
    targetType?: string
  ) => {
    setActionLoading(reportId);
    const res = await resolveReport(reportId, action, targetId, targetType);
    setActionLoading(null);
    if (res.success) {
      showToast(`Report ${action.replace('_', ' ').toUpperCase()} executed.`);
      loadReports();
    }
  };

  const filteredReports = reports.filter(r => r.status === filterStatus);

  return (
    <div className="space-y-6 pt-12 lg:pt-0 animate-fade-in">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-lg">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white">Content Moderation Queue</h1>
            <p className="text-sm text-slate-400">Review reported posts, messages, and accounts to uphold safety standards</p>
          </div>
        </div>
      </div>

      {/* TOAST FEEDBACK */}
      {toastMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-sm font-bold flex items-center gap-2 animate-in slide-in-from-top duration-300">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* FILTER TABS */}
      <div className="flex items-center gap-2 bg-slate-900/60 p-2 rounded-2xl border border-rose-500/10">
        {[
          { id: "pending", label: "Pending Queue" },
          { id: "resolved", label: "Resolved" },
          { id: "dismissed", label: "Dismissed" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterStatus(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filterStatus === tab.id
                ? "bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* REPORT QUEUE LIST */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px]">
          <Loader2 className="w-8 h-8 animate-spin text-amber-400 mb-2" />
          <p className="text-sm text-slate-400">Loading moderation reports...</p>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="p-12 bg-slate-900/60 border border-white/5 rounded-2xl text-center">
          <ShieldAlert className="w-16 h-16 text-slate-700 mx-auto mb-3" />
          <h3 className="text-xl font-bold text-white mb-1">Queue is Clear!</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            No {filterStatus} reports currently require attention. Community guidelines are being upheld.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReports.map((report) => (
            <div 
              key={report.id}
              className="p-5 rounded-2xl bg-slate-900/60 border border-amber-500/20 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                    {report.targetType}
                  </span>
                  <span className="text-xs text-slate-400">
                    Reported by <strong className="text-white">{report.reporterName}</strong>
                  </span>
                </div>
                <h4 className="font-bold text-white text-base">Reason: {report.reason}</h4>
                {report.details && (
                  <p className="text-sm text-slate-300 bg-slate-950 p-3 rounded-xl border border-white/5 font-mono text-xs">
                    "{report.details}"
                  </p>
                )}
                {report.contentSnippet && (
                  <p className="text-xs text-slate-400">Snippet: {report.contentSnippet}</p>
                )}
              </div>

              {/* ACTION BUTTONS */}
              {report.status === "pending" && (
                <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
                  <button
                    onClick={() => handleResolve(report.id, 'dismiss')}
                    disabled={actionLoading === report.id}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 transition-colors flex items-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4" /> Dismiss
                  </button>

                  <button
                    onClick={() => handleResolve(report.id, 'delete_content', report.targetId, report.targetType)}
                    disabled={actionLoading === report.id}
                    className="px-3.5 py-2 rounded-xl bg-red-500/20 text-red-300 text-xs font-bold hover:bg-red-500/30 border border-red-500/30 transition-colors flex items-center gap-1.5"
                  >
                    <Trash2 className="w-4 h-4" /> Remove Content
                  </button>

                  <button
                    onClick={() => handleResolve(report.id, 'ban_user', report.targetId)}
                    disabled={actionLoading === report.id}
                    className="px-3.5 py-2 rounded-xl bg-rose-600 text-white text-xs font-extrabold hover:bg-rose-700 shadow-md transition-all flex items-center gap-1.5"
                  >
                    <UserX className="w-4 h-4" /> Ban Account
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
