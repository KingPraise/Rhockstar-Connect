"use client";

import { Users, CreditCard, Shield, TrendingUp, AlertTriangle, CheckCircle, Activity, Star } from "lucide-react";

export default function AdminDashboardPage() {
  const stats = [
    { label: "Total Users", value: "24,500", change: "+12%", icon: Users, color: "text-rose-500" },
    { label: "Active Subscriptions", value: "1,240", change: "+5%", icon: Star, color: "text-brand-purple" },
    { label: "Revenue (Monthly)", value: "₦2.4M", change: "+18%", icon: CreditCard, color: "text-emerald-500" },
    { label: "Reports Pending", value: "15", change: "-2", icon: AlertTriangle, color: "text-amber-500" },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-rose-500/20 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-rose-500/5 to-transparent z-0"></div>
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center text-white shadow-[0_0_15px_rgba(244,63,94,0.3)]">
            <Shield className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white">Command Center</h1>
            <p className="text-rose-400 font-medium">Platform Overview & Management</p>
          </div>
        </div>
        <div className="bg-emerald-500/10 text-emerald-500 px-4 py-2 rounded-full font-bold border border-emerald-500/20 flex items-center gap-2 relative z-10 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
          <Activity className="w-4 h-4 animate-pulse" />
          System Normal
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="p-6 bg-slate-900/60 backdrop-blur-md border border-rose-500/10 rounded-2xl shadow-xl hover:border-rose-500/30 transition-all hover:shadow-rose-500/10 group cursor-default">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl bg-slate-800/80 border border-white/5 ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className={`text-sm font-bold ${stat.change.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>
                {stat.change}
              </span>
            </div>
            <div>
              <p className="text-slate-400 text-sm font-bold mb-1">{stat.label}</p>
              <h3 className="text-3xl font-extrabold text-white">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="p-6 bg-slate-900/60 backdrop-blur-md border border-rose-500/10 rounded-2xl shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-rose-500" />
            Recent Premium Upgrades
          </h2>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center text-white font-bold text-sm shadow-md">
                    U{i}
                  </div>
                  <div>
                    <p className="text-white font-bold">User {i}</p>
                    <p className="text-slate-400 text-xs">Upgraded to Premium (₦5,000/mo)</p>
                  </div>
                </div>
                <div className="text-emerald-500 flex items-center gap-1 text-sm font-bold">
                  <CheckCircle className="w-4 h-4" />
                  Success
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-6 bg-slate-900/60 backdrop-blur-md border border-rose-500/10 rounded-2xl shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 rounded-xl bg-slate-800/80 border border-white/5 hover:border-rose-500 hover:bg-rose-500/10 transition-all text-left group shadow-lg hover:shadow-rose-500/20">
              <Users className="w-6 h-6 text-rose-500 mb-2 group-hover:scale-110 transition-transform" />
              <h3 className="text-white font-bold mb-1">Manage Users</h3>
              <p className="text-slate-400 text-xs">Ban, verify, or edit users</p>
            </button>
            <button className="p-4 rounded-xl bg-slate-800/80 border border-white/5 hover:border-brand-purple hover:bg-brand-purple/10 transition-all text-left group shadow-lg hover:shadow-brand-purple/20">
              <Star className="w-6 h-6 text-brand-purple mb-2 group-hover:scale-110 transition-transform" />
              <h3 className="text-white font-bold mb-1">Subscriptions</h3>
              <p className="text-slate-400 text-xs">View premium members</p>
            </button>
            <button className="p-4 rounded-xl bg-slate-800/80 border border-white/5 hover:border-amber-500 hover:bg-amber-500/10 transition-all text-left group shadow-lg hover:shadow-amber-500/20">
              <AlertTriangle className="w-6 h-6 text-amber-500 mb-2 group-hover:scale-110 transition-transform" />
              <h3 className="text-white font-bold mb-1">Reports</h3>
              <p className="text-slate-400 text-xs">Handle reported content</p>
            </button>
            <button className="p-4 rounded-xl bg-slate-800/80 border border-white/5 hover:border-emerald-500 hover:bg-emerald-500/10 transition-all text-left group shadow-lg hover:shadow-emerald-500/20">
              <CreditCard className="w-6 h-6 text-emerald-500 mb-2 group-hover:scale-110 transition-transform" />
              <h3 className="text-white font-bold mb-1">Revenue</h3>
              <p className="text-slate-400 text-xs">View financial stats</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
