"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, CreditCard, Shield, TrendingUp, AlertTriangle, CheckCircle, Activity, Star, Settings, UserCheck, Gift } from "lucide-react";
import { getAllUsersAdmin, getSystemReports, AdminUser, AdminReport } from "@/lib/services/admin";

export default function AdminDashboardPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      const [uRes, rRes] = await Promise.all([
        getAllUsersAdmin(),
        getSystemReports()
      ]);
      if (uRes.success) setUsers(uRes.users);
      if (rRes.success) setReports(rRes.reports);
      setLoading(false);
    }
    loadStats();
  }, []);

  const totalUsers = users.length;
  const proCount = users.filter(u => u.subscriptionTier === "pro").length;
  const eliteCount = users.filter(u => u.subscriptionTier === "elite").length;
  const paidUsers = proCount + eliteCount;
  const pendingReports = reports.filter(r => r.status === "pending").length;
  const estRevenue = (proCount * 9.99) + (eliteCount * 19.99);

  const stats = [
    { label: "Total Registered Users", value: totalUsers.toString(), change: "+Live", icon: Users, color: "text-rose-500" },
    { label: "Active Subscriptions", value: paidUsers.toString(), change: `${proCount} Pro / ${eliteCount} Elite`, icon: Star, color: "text-brand-purple" },
    { label: "Est. Monthly Revenue", value: `$${estRevenue.toFixed(2)}`, change: "+Live", icon: CreditCard, color: "text-emerald-500" },
    { label: "Pending Reports", value: pendingReports.toString(), change: pendingReports > 0 ? "Action Req." : "Clear", icon: AlertTriangle, color: "text-amber-500" },
  ];

  return (
    <div className="space-y-8 pt-12 lg:pt-0 animate-fade-in">
      {/* COMMAND CENTER HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-rose-500/20 shadow-2xl relative overflow-hidden gap-4">
        <div className="absolute inset-0 bg-gradient-to-r from-rose-500/5 to-transparent z-0"></div>
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center text-white shadow-[0_0_15px_rgba(244,63,94,0.3)] shrink-0">
            <Shield className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Super Admin Command Center</h1>
            <p className="text-rose-400 text-sm font-medium">Rhockstar Connect Global Operations</p>
          </div>
        </div>
        <div className="bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-full font-bold border border-emerald-500/20 flex items-center gap-2 relative z-10 self-start sm:self-auto text-xs sm:text-sm">
          <Activity className="w-4 h-4 animate-pulse text-emerald-400" />
          System Operational
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="p-6 bg-slate-900/60 backdrop-blur-md border border-rose-500/10 rounded-2xl shadow-xl hover:border-rose-500/30 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl bg-slate-800/80 border border-white/5 ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-slate-400 bg-slate-800 px-2 py-1 rounded-lg">
                {stat.change}
              </span>
            </div>
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{stat.label}</p>
              <h3 className="text-3xl font-extrabold text-white">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* QUICK ACTIONS GRID */}
      <div className="p-6 bg-slate-900/60 backdrop-blur-md border border-rose-500/10 rounded-2xl shadow-2xl space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-rose-500" />
          Super Admin Modules
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href="/admin/users" className="p-5 rounded-2xl bg-slate-800/60 border border-white/5 hover:border-rose-500 hover:bg-rose-500/10 transition-all group">
            <Users className="w-7 h-7 text-rose-500 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="text-white font-extrabold text-base mb-1">User Management</h3>
            <p className="text-slate-400 text-xs">Search accounts, manage roles, grant perks, ban/unban users</p>
          </Link>

          <Link href="/admin/subscriptions" className="p-5 rounded-2xl bg-slate-800/60 border border-white/5 hover:border-amber-500 hover:bg-amber-500/10 transition-all group">
            <Star className="w-7 h-7 text-amber-400 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="text-white font-extrabold text-base mb-1">Subscriptions</h3>
            <p className="text-slate-400 text-xs">View Pro/Elite subscribers, revenue metrics, grant subscription days</p>
          </Link>

          <Link href="/admin/reports" className="p-5 rounded-2xl bg-slate-800/60 border border-white/5 hover:border-amber-500 hover:bg-amber-500/10 transition-all group">
            <AlertTriangle className="w-7 h-7 text-amber-500 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="text-white font-extrabold text-base mb-1">Content Moderation</h3>
            <p className="text-slate-400 text-xs">Review pending flags, delete offending content, ban violators</p>
          </Link>

          <Link href="/admin/settings" className="p-5 rounded-2xl bg-slate-800/60 border border-white/5 hover:border-brand-purple hover:bg-brand-purple/10 transition-all group">
            <Settings className="w-7 h-7 text-brand-purple mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="text-white font-extrabold text-base mb-1">Global Settings</h3>
            <p className="text-slate-400 text-xs">Configure site maintenance mode, banners, and referral policy</p>
          </Link>

          <Link href="/admin/referrals" className="p-5 rounded-2xl bg-slate-800/60 border border-white/5 hover:border-purple-400 hover:bg-purple-500/10 transition-all group">
            <Gift className="w-7 h-7 text-purple-400 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="text-white font-extrabold text-base mb-1">Referrals & Rewards</h3>
            <p className="text-slate-400 text-xs">Track viral invites, view leaderboards, and grant bonus rewards</p>
          </Link>

          <Link href="/admin/profile" className="p-5 rounded-2xl bg-slate-800/60 border border-white/5 hover:border-rose-400 hover:bg-rose-500/10 transition-all group">
            <UserCheck className="w-7 h-7 text-rose-400 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="text-white font-extrabold text-base mb-1">Admin Profile</h3>
            <p className="text-slate-400 text-xs">Update Super Admin avatar, credentials, and password settings</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
