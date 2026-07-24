"use client";

import { useEffect, useState } from "react";
import { 
  Gift, 
  Users, 
  Trophy, 
  Award, 
  Zap, 
  Search, 
  Plus, 
  Loader2, 
  CheckCircle2, 
  Sparkles,
  Calendar
} from "lucide-react";
import { 
  getAdminReferralOverview, 
  grantUserBonusReferrals, 
  AdminReferralLog,
  getAllUsersAdmin,
  AdminUser
} from "@/lib/services/admin";
import { format } from "date-fns";

export default function AdminReferralsPage() {
  const [loading, setLoading] = useState(true);
  const [totalReferrals, setTotalReferrals] = useState(0);
  const [leaderboard, setLeaderboard] = useState<{ id: string; name: string; count: number; code: string }[]>([]);
  const [logs, setLogs] = useState<AdminReferralLog[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");
  
  // Bonus Grant Modal
  const [grantModalOpen, setGrantModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [daysToGrant, setDaysToGrant] = useState(7);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadData = async () => {
    setLoading(true);
    const overviewRes = await getAdminReferralOverview();
    if (overviewRes.success) {
      setTotalReferrals(overviewRes.totalReferrals);
      setLeaderboard(overviewRes.leaderboard);
      setLogs(overviewRes.logs);
    }
    const usersRes = await getAllUsersAdmin();
    if (usersRes.success) {
      setUsers(usersRes.users);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleGrantBonus = async (userId: string, days: number = 7) => {
    setIsSubmitting(true);
    setFeedbackMsg(null);
    const res = await grantUserBonusReferrals(userId, days);
    setIsSubmitting(false);

    if (res.success) {
      setFeedbackMsg({ type: 'success', text: `Successfully granted ${days} days of free Pro to user!` });
      setGrantModalOpen(false);
      loadData();
    } else {
      setFeedbackMsg({ type: 'error', text: res.error || "Failed to grant bonus." });
    }
  };

  const filteredLogs = logs.filter(log => 
    log.referrerName?.toLowerCase().includes(search.toLowerCase()) ||
    log.referredName?.toLowerCase().includes(search.toLowerCase()) ||
    log.codeUsed?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-rose-500" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Gift className="w-8 h-8 text-rose-500" />
            Referrals & Rewards Tracking
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Monitor growth loops, top user promoters, invite activity, and grant bonus rewards.
          </p>
        </div>

        <button
          onClick={() => setGrantModalOpen(true)}
          className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 text-white font-bold text-sm flex items-center gap-2 shadow-lg hover:scale-105 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Grant User Bonus</span>
        </button>
      </div>

      {feedbackMsg && (
        <div className={`p-4 rounded-2xl border flex items-center gap-3 text-sm font-medium ${
          feedbackMsg.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
        }`}>
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* KPI METRICS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="neo-card p-6 bg-slate-900/40 backdrop-blur-md border border-white/5 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Referrals</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Gift className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-white mt-4">{totalReferrals}</p>
          <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1 font-medium">
            <Zap className="w-3.5 h-3.5" /> Successful user invitations
          </p>
        </div>

        <div className="neo-card p-6 bg-slate-900/40 backdrop-blur-md border border-white/5 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Top Promoters</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Trophy className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-white mt-4">{leaderboard.length}</p>
          <p className="text-xs text-amber-400 mt-2 font-medium">Active referral creators</p>
        </div>

        <div className="neo-card p-6 bg-slate-900/40 backdrop-blur-md border border-white/5 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Granted Free Days</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-white mt-4">{totalReferrals * 7} Days</p>
          <p className="text-xs text-purple-400 mt-2 font-medium">Distributed across users</p>
        </div>

        <div className="neo-card p-6 bg-slate-900/40 backdrop-blur-md border border-white/5 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Top Influencer</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xl font-bold text-white mt-4 truncate">
            {leaderboard.length > 0 ? leaderboard[0].name : "None Yet"}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {leaderboard.length > 0 ? `${leaderboard[0].count} invites completed` : "No invites recorded"}
          </p>
        </div>
      </div>

      {/* TOP REFERRERS LEADERBOARD */}
      <div className="neo-card p-6 bg-slate-900/40 backdrop-blur-md border border-white/5 shadow-2xl">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          Top Referrers Leaderboard
        </h2>

        {leaderboard.length === 0 ? (
          <p className="text-slate-400 text-sm py-4 text-center">No referral invitations recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Rank</th>
                  <th className="py-3 px-4">Promoter</th>
                  <th className="py-3 px-4">Code Used</th>
                  <th className="py-3 px-4">Invites</th>
                  <th className="py-3 px-4">Free Days Earned</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm text-slate-300 font-medium">
                {leaderboard.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 px-4 font-bold text-white">
                      {idx === 0 ? "🥇 1st" : idx === 1 ? "🥈 2nd" : idx === 2 ? "🥉 3rd" : `#${idx + 1}`}
                    </td>
                    <td className="py-4 px-4 font-bold text-white">{item.name}</td>
                    <td className="py-4 px-4">
                      <span className="bg-slate-800 border border-white/10 text-amber-300 font-mono text-xs py-1 px-2.5 rounded-lg">
                        {item.code}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-bold text-emerald-400">{item.count} users</td>
                    <td className="py-4 px-4 text-purple-300">{item.count * 7} Days Pro</td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => handleGrantBonus(item.id, 7)}
                        disabled={isSubmitting}
                        className="py-1.5 px-3 rounded-lg bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 text-xs font-bold transition-all border border-rose-500/30"
                      >
                        + Grant +7 Days Bonus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* RECENT REFERRAL LOGS */}
      <div className="neo-card p-6 bg-slate-900/40 backdrop-blur-md border border-white/5 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-rose-400" />
            Recent Referral Event Log
          </h2>

          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search referral logs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-800/50 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-rose-500/50"
            />
          </div>
        </div>

        {filteredLogs.length === 0 ? (
          <p className="text-slate-400 text-sm py-4 text-center">No recent referral log matching search.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Invited User</th>
                  <th className="py-3 px-4">Referrer</th>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm text-slate-300 font-medium">
                {filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white">{log.referredName || "New User"}</td>
                    <td className="py-3.5 px-4 text-slate-300">{log.referrerName || "Promoter"}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-xs text-amber-300 bg-slate-800 px-2 py-0.5 rounded border border-white/10">
                        {log.codeUsed}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-400">
                      {log.createdAt?.seconds 
                        ? format(new Date(log.createdAt.seconds * 1000), 'MMM d, yyyy - HH:mm')
                        : 'Just now'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MANUAL GRANT BONUS MODAL */}
      {grantModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setGrantModalOpen(false)} />
          <div className="neo-card p-8 bg-slate-900 border border-rose-500/30 rounded-3xl max-w-md w-full relative z-10 shadow-2xl space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Gift className="w-5 h-5 text-rose-400" />
                Grant Free Referral Bonus
              </h3>
              <button 
                onClick={() => setGrantModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Select Target User</label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full mt-1.5 bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-rose-500/50"
                >
                  <option value="">Select a user...</option>
                  {users.map(u => (
                    <option key={u.uid} value={u.uid}>
                      {u.fullName} (@{u.username})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Free Days To Grant</label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={daysToGrant}
                  onChange={(e) => setDaysToGrant(parseInt(e.target.value, 10) || 7)}
                  className="w-full mt-1.5 bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-rose-500/50"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setGrantModalOpen(false)}
                className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                disabled={!selectedUserId || isSubmitting}
                onClick={() => handleGrantBonus(selectedUserId, daysToGrant)}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 text-white font-bold hover:scale-105 transition-all text-sm disabled:opacity-50 flex items-center justify-center"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Grant Reward"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
