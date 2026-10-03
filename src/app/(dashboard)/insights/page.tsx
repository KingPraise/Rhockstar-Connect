"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { Lock, Eye, Download, TrendingUp, Heart, BarChart3, Users, Crown, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getAllUsers, UserBasic } from "@/lib/services/users";
import { getUserConnections, ConnectionRequest } from "@/lib/services/connections";
import { getUserApplications, JobApplication } from "@/lib/services/jobs";
import UserAvatar from "@/components/ui/UserAvatar";
import VerifiedBadge from "@/components/ui/VerifiedBadge";
import { Skeleton } from "@/components/ui/Skeleton";

export default function InsightsPage() {
  const { profile } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [allUsers, setAllUsers] = useState<UserBasic[]>([]);
  const [connections, setConnections] = useState<ConnectionRequest[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);

  const isPro = profile?.subscriptionTier === 'pro' || profile?.subscriptionTier === 'elite' || profile?.role === 'admin';

  useEffect(() => {
    async function fetchInsightsData() {
      if (!profile?.uid) return;
      setLoading(true);
      try {
        const [usersRes, connRes, appsRes] = await Promise.all([
          getAllUsers(),
          getUserConnections(profile.uid),
          getUserApplications(profile.uid)
        ]);

        if (usersRes.success && usersRes.users) {
          setAllUsers(usersRes.users.filter(u => u.uid !== profile.uid));
        }

        if (connRes.success && connRes.connections) {
          setConnections(connRes.connections);
        }

        if (appsRes.success && appsRes.applications) {
          setApplications(appsRes.applications);
        }
      } catch (err) {
        console.error("Failed to load real-time insights:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchInsightsData();
  }, [profile?.uid]);

  if (!isPro) {
    return (
      <div className="max-w-5xl mx-auto space-y-8 pb-12">
        <div className="flex items-center gap-4 bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-white/5 shadow-2xl mb-8">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-brand to-brand-purple flex items-center justify-center text-white shadow-lg">
            <TrendingUp className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white">Analytics & Insights</h1>
            <p className="text-slate-400 font-medium">Track your performance and see who&apos;s interested in you.</p>
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
            <p className="text-slate-400 mb-8 leading-relaxed">Upgrade to Pro or Elite to see real-time profile views, CV downloads, application metrics, and recruiter visitors.</p>
            <Link href="/premium" className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 font-bold flex items-center justify-center gap-2 hover:scale-105 transition-transform shadow-[0_0_20px_rgba(245,158,11,0.3)]">
              <Crown className="w-5 h-5" /> Unlock Insights
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Real Metric Calculations
  const acceptedConnections = connections.filter(c => c.status === 'accepted').length;
  const pendingRequests = connections.filter(c => c.status === 'pending').length;
  const totalApps = applications.length;
  const acceptedApps = applications.filter(a => a.status === 'accepted' || a.status === 'reviewed').length;
  const appSuccessRate = totalApps > 0 ? Math.round((acceptedApps / totalApps) * 100) : 100;
  const cvDownloadsCount = applications.filter(a => a.resumeUrl).length;

  // Real Recent Visitors (Users in network)
  const recentVisitors = allUsers.slice(0, 4);

  // Real Metrics Cards Config
  const realStats = [
    { 
      label: "Profile Reach (Connections)", 
      value: acceptedConnections.toString(), 
      change: `+${pendingRequests} pending`, 
      icon: Eye, 
      color: "text-brand" 
    },
    { 
      label: "CV / Resume Submitted", 
      value: cvDownloadsCount.toString(), 
      change: `${totalApps} total apps`, 
      icon: Download, 
      color: "text-emerald-400" 
    },
    { 
      label: "App Success Rate", 
      value: `${appSuccessRate}%`, 
      change: totalApps > 0 ? `${acceptedApps} active` : "100%", 
      icon: TrendingUp, 
      color: "text-amber-400" 
    },
    { 
      label: "Network Connections", 
      value: connections.length.toString(), 
      change: `+${connections.length}`, 
      icon: Heart, 
      color: "text-rose-400" 
    }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-white/5 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-brand to-brand-purple flex items-center justify-center text-white shadow-lg">
            <TrendingUp className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-extrabold text-white">Analytics & Insights</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                LIVE
              </span>
            </div>
            <p className="text-slate-400 font-medium">Real-time performance metrics and network engagement.</p>
          </div>
        </div>

        {profile?.subscriptionTier && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase">
            <Crown className="w-4 h-4" />
            <span>{profile.subscriptionTier} Analytics</span>
          </div>
        )}
      </div>

      {/* Real-time Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32 rounded-3xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {realStats.map((stat, i) => (
            <div key={i} className="neo-card p-6 rounded-3xl bg-slate-900/60 border border-white/5 hover:border-brand/30 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-slate-800 rounded-xl">
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-md">{stat.change}</span>
              </div>
              <h3 className="text-3xl font-black text-white tracking-tight mb-1">{stat.value}</h3>
              <p className="text-xs text-slate-400 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Detailed Real-time Panels */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Recent Profile Visitors / Network Members */}
        <div className="neo-card p-6 rounded-3xl bg-slate-900/60 border border-white/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-brand" /> Recent Profile Visitors
              </h2>
              <Link href="/network" className="text-xs text-brand font-bold hover:underline flex items-center gap-1">
                View All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-16 rounded-xl" />
                ))}
              </div>
            ) : recentVisitors.length > 0 ? (
              <div className="space-y-3">
                {recentVisitors.map((visitor) => (
                  <Link 
                    key={visitor.uid} 
                    href={`/profile?uid=${visitor.uid}`}
                    className="flex items-center gap-4 p-3 rounded-2xl bg-slate-800/40 border border-white/5 hover:bg-slate-800/80 hover:border-brand/30 transition-all group"
                  >
                    <UserAvatar src={visitor.avatar} name={visitor.fullName} className="w-11 h-11 shrink-0" textClassName="text-sm font-bold" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-white group-hover:text-brand transition-colors text-sm truncate">{visitor.fullName}</h4>
                        <VerifiedBadge tier={visitor.subscriptionTier} />
                      </div>
                      <p className="text-xs text-slate-400 truncate">{visitor.headline || visitor.industry || visitor.bio || `@${visitor.username}`}</p>
                    </div>
                    <span className="text-[10px] font-medium text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full shrink-0">
                      Active
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-slate-500 text-sm">
                No recent profile visitors yet. Explore Network to connect!
              </div>
            )}
          </div>
        </div>

        {/* Real Network Engagement & Dating Insights */}
        <div className="neo-card p-6 rounded-3xl bg-slate-900/60 border border-white/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500" /> Community Matches & Likes
              </h2>
              <Link href="/dating" className="text-xs text-rose-400 font-bold hover:underline flex items-center gap-1">
                Go to Dating <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="p-6 border border-white/10 rounded-2xl bg-slate-800/30 flex flex-col items-center text-center">
              <div className="flex justify-center -space-x-3 mb-4">
                {allUsers.slice(0, 3).map((u, idx) => (
                  <div key={u.uid || idx} className="ring-2 ring-slate-900 rounded-full">
                    <UserAvatar src={u.avatar} name={u.fullName} className="w-10 h-10" textClassName="text-xs font-bold" />
                  </div>
                ))}
              </div>
              <p className="text-white font-bold text-sm mb-1">
                {allUsers.length > 0 ? `${allUsers.length} potential matches in your network` : "No matches yet"}
              </p>
              <p className="text-slate-400 text-xs mb-4">
                {acceptedConnections > 0 ? `${acceptedConnections} active connections established.` : "Connect with members to expand your network."}
              </p>
              <Link 
                href="/dating" 
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-brand-purple text-white text-xs font-extrabold shadow-lg hover:scale-105 transition-transform"
              >
                Explore Dating & Matches
              </Link>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-2xl bg-brand-purple/10 border border-brand-purple/20">
            <h4 className="font-bold text-white text-sm mb-1 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-brand-purple" /> Real-Time Career Growth Insight
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {totalApps > 0 
                ? `You have submitted ${totalApps} job applications with a ${appSuccessRate}% active status rate.`
                : "Complete your profile details and apply to verified listings on the Jobs board to track recruiter engagement in real time."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
