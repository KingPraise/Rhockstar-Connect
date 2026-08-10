"use client";

import { BookOpen, GraduationCap, FileText, Target, PlayCircle, ExternalLink, Sparkles, Crown } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";

export default function CareerHubPage() {
  const { profile } = useAuthStore();
  const isPro = profile?.subscriptionTier === 'pro' || profile?.subscriptionTier === 'elite' || profile?.role === 'admin';
  const categories = [
    {
      title: "CV Writing",
      icon: FileText,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
      resources: [
        "How to Write a ATS-Friendly Resume",
        "Action Verbs That Get You Hired",
        "Tailoring Your CV for Tech Roles"
      ]
    },
    {
      title: "Interview Prep",
      icon: Target,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
      resources: [
        "Answering 'Tell Me About Yourself'",
        "The STAR Method Explained",
        "Questions to Ask Your Interviewer"
      ]
    },
    {
      title: "Career Growth",
      icon: GraduationCap,
      color: "text-brand-purple",
      bg: "bg-brand-purple/10",
      resources: [
        "Negotiating Your First Salary",
        "Building a Personal Brand on Rhockstar",
        "Transitioning into a New Industry"
      ]
    }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="neo-card p-8 rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand/20 to-brand-purple/20 flex items-center justify-center border border-white/5">
              <BookOpen className="w-8 h-8 text-brand" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">Career Hub</h1>
              <p className="text-slate-400 font-medium">Free resources to accelerate your professional journey.</p>
            </div>
          </div>
          <Link href="/jobs" className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold transition-colors">
            Browse Jobs
          </Link>
        </div>
      </div>

      {/* Featured Video */}
      <div className="neo-card p-6 bg-slate-900/40 rounded-3xl border border-white/5 group cursor-pointer hover:border-brand/30 transition-all">
        <div className="aspect-video w-full bg-slate-800 rounded-2xl relative overflow-hidden flex items-center justify-center border border-white/5 shadow-inner mb-4">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent z-0" />
          <PlayCircle className="w-16 h-16 text-white/50 group-hover:text-brand group-hover:scale-110 transition-all z-10 relative" />
          <div className="absolute bottom-4 left-4 z-10">
            <div className="px-3 py-1 bg-brand text-white text-xs font-bold rounded-lg mb-2 inline-block">Masterclass</div>
            <h3 className="text-xl font-bold text-white">How to Land Your Dream Job in 2024</h3>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {categories.map((category, idx) => (
          <div key={idx} className="neo-card p-6 rounded-3xl bg-slate-900/40 border border-white/5 hover:-translate-y-1 transition-transform">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${category.bg} ${category.color}`}>
              <category.icon className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-4">{category.title}</h3>
            <ul className="space-y-3">
              {category.resources.map((resource, i) => (
                <li key={i} className="flex items-start gap-2 group cursor-pointer">
                  <ExternalLink className="w-4 h-4 text-slate-500 mt-1 group-hover:text-brand transition-colors shrink-0" />
                  <span className="text-sm text-slate-300 group-hover:text-white transition-colors leading-snug">{resource}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Pro / AI Assistant Banner */}
      <div className={`mt-12 p-8 rounded-3xl border flex flex-col md:flex-row items-center justify-between gap-6 ${
        isPro 
          ? 'bg-gradient-to-r from-emerald-500/10 via-brand/10 to-brand-purple/10 border-emerald-500/30' 
          : 'bg-gradient-to-r from-brand/10 to-brand-purple/10 border-brand/20'
      }`}>
        <div>
          <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
            <span>{isPro ? "AI Resume & Interview Assistant Unlocked" : "Want personalized career advice?"}</span>
            {isPro ? <Crown className="w-5 h-5 text-emerald-400" /> : <Sparkles className="w-5 h-5 text-brand" />}
          </h3>
          <p className="text-slate-400 text-sm">
            {isPro 
              ? "As a Premium member, ask our AI Assistant anytime for personalized CV reviews, interview simulation, and salary tips." 
              : "Upgrade to Pro to unlock AI Resume Reviews and Interview Prep tailored just for you."}
          </p>
        </div>
        {isPro ? (
          <div className="shrink-0 px-6 py-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-extrabold rounded-xl flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            <Sparkles className="w-4 h-4" /> AI Active
          </div>
        ) : (
          <Link href="/premium" className="shrink-0 px-8 py-3 bg-brand text-white font-bold rounded-xl hover:scale-105 transition-transform shadow-[0_0_20px_rgba(56,189,248,0.3)]">
            Upgrade to Pro
          </Link>
        )}
      </div>
    </div>
  );
}
