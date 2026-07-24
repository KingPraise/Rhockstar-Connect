"use client";

import { useEffect, useState } from "react";
import { 
  Star, 
  Crown, 
  TrendingUp, 
  Users, 
  Loader2, 
  CheckCircle2, 
  Gift, 
  X,
  CreditCard
} from "lucide-react";
import Image from "next/image";
import { getAllUsersAdmin, grantUserSubscription, AdminUser } from "@/lib/services/admin";

export default function AdminSubscriptionsPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTier, setFilterTier] = useState<"all" | "pro" | "elite">("all");
  const [grantModalUser, setGrantModalUser] = useState<AdminUser | null>(null);
  const [grantDays, setGrantDays] = useState(30);
  const [grantTier, setGrantTier] = useState<"pro" | "elite" | "free">("pro");
  const [toastMsg, setToastMsg] = useState("");

  const loadData = async () => {
    setLoading(true);
    const res = await getAllUsersAdmin();
    if (res.success) {
      setUsers(res.users);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  const proCount = users.filter(u => u.subscriptionTier === "pro" && u.subscriptionStatus === "active").length;
  const eliteCount = users.filter(u => u.subscriptionTier === "elite" && u.subscriptionStatus === "active").length;
  const totalPaid = proCount + eliteCount;
  // Estimated revenue calculation ($9.99/mo Pro, $19.99/mo Elite)
  const estRevenue = (proCount * 9.99) + (eliteCount * 19.99);

  const subscribers = users.filter(u => {
    if (filterTier === "pro") return u.subscriptionTier === "pro";
    if (filterTier === "elite") return u.subscriptionTier === "elite";
    return u.subscriptionTier === "pro" || u.subscriptionTier === "elite";
  });

  const handleGrant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grantModalUser) return;
    const res = await grantUserSubscription(grantModalUser.uid, grantTier, grantDays);
    if (res.success) {
      showToast(`Updated subscription for ${grantModalUser.fullName}`);
      setGrantModalUser(null);
      loadData();
    }
  };

  return (
    <div className="space-y-6 pt-12 lg:pt-0 animate-fade-in">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-lg">
            <Star className="w-6 h-6 fill-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white">Subscription Manager</h1>
            <p className="text-sm text-slate-400">Track active subscribers, revenue metrics, and grant manual perks</p>
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

      {/* METRICS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-amber-500/20 backdrop-blur-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Revenue (Est.)</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-black text-white">${estRevenue.toFixed(2)}<span className="text-xs font-semibold text-slate-400">/mo</span></p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-brand-purple/20 backdrop-blur-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Paid Subscribers</span>
            <Users className="w-4 h-4 text-brand-purple" />
          </div>
          <p className="text-3xl font-black text-white">{totalPaid}</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-blue-500/20 backdrop-blur-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pro Members</span>
            <Star className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-3xl font-black text-blue-400">{proCount}</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-rose-500/20 backdrop-blur-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Elite VIP Members</span>
            <Crown className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-3xl font-black text-rose-400">{eliteCount}</p>
        </div>
      </div>

      {/* TIER FILTER TABS */}
      <div className="flex items-center gap-2">
        {[
          { id: "all", label: "All Paid Subscribers" },
          { id: "pro", label: "Pro ($9.99/mo)" },
          { id: "elite", label: "Elite ($19.99/mo)" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setFilterTier(t.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filterTier === t.id
                ? "bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20"
                : "bg-slate-900/80 text-slate-400 hover:text-white border border-white/5"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* SUBSCRIBERS TABLE */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px]">
          <Loader2 className="w-8 h-8 animate-spin text-amber-400 mb-2" />
          <p className="text-sm text-slate-400">Loading subscription records...</p>
        </div>
      ) : subscribers.length === 0 ? (
        <div className="p-8 bg-slate-900/60 border border-white/5 rounded-2xl text-center">
          <CreditCard className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">No active subscribers in this view</h3>
          <p className="text-sm text-slate-400">Use User Management to grant manual subscription perks.</p>
        </div>
      ) : (
        <div className="bg-slate-900/60 border border-amber-500/10 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/80 border-b border-white/10 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-4 px-4">Subscriber</th>
                  <th className="py-4 px-4">Tier</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-4">Expiry Date</th>
                  <th className="py-4 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {subscribers.map((sub) => (
                  <tr key={sub.uid} className="hover:bg-amber-500/5 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-amber-500/20 relative border border-amber-500/30 flex-shrink-0">
                          {sub.avatar ? (
                            <Image src={sub.avatar} alt={sub.fullName} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-bold text-amber-400 text-sm">
                              {sub.fullName.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-white">{sub.fullName}</p>
                          <p className="text-xs text-slate-400">{sub.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                        sub.subscriptionTier === "elite"
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                          : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                      }`}>
                        {sub.subscriptionTier === "elite" ? <Crown className="w-3.5 h-3.5" /> : <Star className="w-3.5 h-3.5" />}
                        {sub.subscriptionTier?.toUpperCase()}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-400">
                        Active
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-xs text-slate-400">
                      {sub.premiumUntil ? new Date(sub.premiumUntil).toLocaleDateString() : "Lifetime"}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setGrantModalUser(sub)}
                        className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 text-xs font-bold hover:bg-amber-500/30 transition-colors"
                      >
                        Adjust Perks
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* GRANT MODAL */}
      {grantModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-slate-900 border border-amber-500/30 p-6 rounded-2xl shadow-2xl relative">
            <button onClick={() => setGrantModalUser(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-6">
              <Gift className="w-6 h-6 text-amber-400" />
              <h3 className="text-lg font-bold text-white">Adjust Subscription</h3>
            </div>
            <form onSubmit={handleGrant} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400">Select Tier</label>
                <select
                  value={grantTier}
                  onChange={(e) => setGrantTier(e.target.value as any)}
                  className="w-full mt-1 bg-slate-950 border border-white/10 rounded-xl p-3 text-sm text-white"
                >
                  <option value="pro">Pro Membership</option>
                  <option value="elite">Elite Membership</option>
                  <option value="free">Revoke Perks (Free Tier)</option>
                </select>
              </div>
              {grantTier !== "free" && (
                <div>
                  <label className="text-xs font-bold text-slate-400">Duration (Days)</label>
                  <input
                    type="number"
                    min={1}
                    value={grantDays}
                    onChange={(e) => setGrantDays(Number(e.target.value))}
                    className="w-full mt-1 bg-slate-950 border border-white/10 rounded-xl p-3 text-sm text-white"
                  />
                </div>
              )}
              <button type="submit" className="w-full py-3 rounded-xl bg-amber-500 text-slate-950 font-extrabold text-sm">
                Save Subscription Changes
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
