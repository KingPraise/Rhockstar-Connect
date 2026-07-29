"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { Lock, Eye, Download, TrendingUp, Heart, BarChart3, Users, Crown } from "lucide-react";
import Link from "next/link";
import PremiumLockModal from "@/components/ui/PremiumLockModal";
import { useState } from "react";

export default function InsightsPage() {
  const { profile } = useAuthStore();
  const [premiumLockOpen, setPremiumLockOpen] = useState(false);

  const isPro = profile?.subscriptionTier === 'pro' || profile?.subscriptionTier === 'elite';

  const mockStats = [
    { label: "Profile Views (30 days)", value: "1,248", change: "+12%", icon: Eye, color: "text-brand" },
    { label: "CV Downloads", value: "42", change: "+5%", icon: Download, color: "text-emerald-400" },
    { label: "App Success Rate", value: "68%", change: "+2%", icon: TrendingUp, color: "text-amber-400" },
    { label: "New Likes", value: "15", change: "+3", icon: Heart, color: "text-rose-400" }
  ];

  const recentVisitors = [
    { name: "Sarah Jenkins", role: "Technical Recruiter at Google", time: "2 hours ago" },
    { name: "David Chen", role: "Engineering Manager at Meta", time: "5 hours ago" },
    { name: "Emily Watson", role: "Startup Founder", time: "1 day ago" },
    { name: "Michael Chang", role: "Senior Developer", time: "2 days ago" }
  ];

  if (!isPro) {
    return (
      <div className="max-w-5xl mx-auto space-y-8 pb-12">
        <div className="flex items-center gap-4 bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-white/5 shadow-2xl mb-8">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-brand to-brand-purple flex items-center justify-center text-white shadow-lg">
            <BarChart3 className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white">Analytics & Insights</h1>
            <p className="text-slate-400 font-medium">Track your performance and see who's interested in you.</p>
          </div>
        </div>

        <div className="relative rounded-3xl overflow-hidden border border-white/5 bg-slate-900/40 p-8 min-h-[500px] flex items-center justify-center">
          {/* Blurred Background Mock Content */}
          <div className="absolute inset-0 filter blur-md opacity-20 pointer-events-none p-8 grid grid-cols-2 gap-8">
             <div className="bg-slate-800 rounded-2xl h-32"></div>
             <div className="bg-slate-800 rounded-2xl h-32"></div>
             <div className="bg-slate-800 rounded-2xl h-32"></div>
             <div className="bg-slate-800 rounded-2xl h-32"></div>
             <div className="col-span-2 bg-slate-800 rounded-2xl h-64"></div>
          </div>

          <div className="relative z-10 text-center max-w-md mx-auto p-8 neo-card rounded-3xl bg-slate-900/90 border border-amber-500/30 shadow-[0_0_50px_rgba(245,158,11,0.15)]">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-6">
              <Lock className="w-8 h-8 text-amber-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Premium Insights Locked</h2>
            <p className="text-slate-400 mb-8 leading-relaxed">Upgrade to Pro or Elite to see who viewed your profile, who downloaded your CV, your match analytics, and much more.</p>
            <Link href="/premium" className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 font-bold flex items-center justify-center gap-2 hover:scale-105 transition-transform shadow-[0_0_20px_rgba(245,158,11,0.3)]">
              <Crown className="w-5 h-5" /> Unlock Insights
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="flex items-center gap-4 bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-white/5 shadow-2xl">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-brand to-brand-purple flex items-center justify-center text-white shadow-lg">
          <BarChart3 className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-white">Analytics & Insights</h1>
          <p className="text-slate-400 font-medium">Track your performance and see who's interested in you.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {mockStats.map((stat, i) => (
          <div key={i} className="neo-card p-6 rounded-3xl bg-slate-900/60 border border-white/5 hover:border-white/10 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-slate-800 rounded-xl">
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <span className="text-sm font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-md">{stat.change}</span>
            </div>
            <h3 className="text-3xl font-black text-white tracking-tight mb-1">{stat.value}</h3>
            <p className="text-sm text-slate-400 font-medium">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="neo-card p-6 rounded-3xl bg-slate-900/60 border border-white/5">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2"><Users className="w-5 h-5 text-brand" /> Recent Profile Visitors</h2>
            <button className="text-sm text-brand font-bold hover:underline">View All</button>
          </div>
          <div className="space-y-4">
            {recentVisitors.map((visitor, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/50 border border-white/5 hover:bg-slate-800 transition-colors cursor-pointer">
                <div className="w-12 h-12 rounded-full bg-slate-700"></div>
                <div className="flex-1">
                  <h4 className="font-bold text-white">{visitor.name}</h4>
                  <p className="text-xs text-slate-400">{visitor.role}</p>
                </div>
                <span className="text-xs font-medium text-slate-500">{visitor.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="neo-card p-6 rounded-3xl bg-slate-900/60 border border-white/5">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2"><Heart className="w-5 h-5 text-rose-500" /> New Likes</h2>
            <button className="text-sm text-rose-500 font-bold hover:underline">View Matches</button>
          </div>
          <div className="flex items-center justify-center h-48 border-2 border-dashed border-white/10 rounded-2xl bg-slate-800/30">
            <div className="text-center">
              <div className="flex justify-center -space-x-4 mb-4">
                {[1,2,3].map(i => (
                  <div key={i} className="w-12 h-12 rounded-full border-2 border-slate-900 bg-slate-700"></div>
                ))}
              </div>
              <p className="text-slate-300 font-medium">15 people liked your profile recently!</p>
              <Link href="/dating" className="text-brand text-sm font-bold mt-2 inline-block hover:underline">Go to Dating</Link>
            </div>
          </div>
          
          <div className="mt-6 p-4 rounded-xl bg-brand-purple/10 border border-brand-purple/20">
            <h4 className="font-bold text-white text-sm mb-1">Career Growth Insight</h4>
            <p className="text-xs text-slate-400 leading-relaxed">Your application success rate is up 2% this week. Updating your portfolio increased recruiter engagement by 15%.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
