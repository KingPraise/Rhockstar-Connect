"use client";

import { Heart, ShieldCheck, Sparkles, MessageCircle, PlayCircle, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function DatingHubPage() {
  const categories = [
    {
      title: "Dating Tips",
      icon: Heart,
      color: "text-rose-400",
      bg: "bg-rose-400/10",
      resources: [
        "Building an Attractive Profile",
        "How to Take Great Photos",
        "Best First Date Ideas in 2024"
      ]
    },
    {
      title: "Conversation",
      icon: MessageCircle,
      color: "text-purple-400",
      bg: "bg-purple-400/10",
      resources: [
        "Icebreakers That Actually Work",
        "Moving from App to Text",
        "Signs They Are Interested"
      ]
    },
    {
      title: "Safety & Trust",
      icon: ShieldCheck,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
      resources: [
        "How to Spot Catfish",
        "Online Dating Safety 101",
        "Setting Boundaries Early"
      ]
    }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="neo-card p-8 rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500/20 to-purple-500/20 flex items-center justify-center border border-white/5">
              <Sparkles className="w-8 h-8 text-rose-500" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">Dating Hub</h1>
              <p className="text-slate-400 font-medium">Tips, advice, and guides for meaningful connections.</p>
            </div>
          </div>
          <Link href="/dating" className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold transition-colors">
            Start Matching
          </Link>
        </div>
      </div>

      {/* Featured Video */}
      <div className="neo-card p-6 bg-slate-900/40 rounded-3xl border border-white/5 group cursor-pointer hover:border-rose-500/30 transition-all">
        <div className="aspect-video w-full bg-slate-800 rounded-2xl relative overflow-hidden flex items-center justify-center border border-white/5 shadow-inner mb-4">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent z-0" />
          <PlayCircle className="w-16 h-16 text-white/50 group-hover:text-rose-500 group-hover:scale-110 transition-all z-10 relative" />
          <div className="absolute bottom-4 left-4 z-10">
            <div className="px-3 py-1 bg-rose-500 text-white text-xs font-bold rounded-lg mb-2 inline-block">Featured Series</div>
            <h3 className="text-xl font-bold text-white">The Psychology of a Perfect First Date</h3>
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
                  <ExternalLink className="w-4 h-4 text-slate-500 mt-1 group-hover:text-rose-400 transition-colors shrink-0" />
                  <span className="text-sm text-slate-300 group-hover:text-white transition-colors leading-snug">{resource}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Pro Upsell */}
      <div className="mt-12 bg-gradient-to-r from-rose-500/10 to-purple-500/10 border border-rose-500/20 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-xl font-bold text-white mb-2">Want to boost your dating profile?</h3>
          <p className="text-slate-400">Upgrade to Premium for AI Match Recommendations and Profile Optimization.</p>
        </div>
        <Link href="/premium" className="shrink-0 px-8 py-3 bg-rose-500 text-white font-bold rounded-xl hover:scale-105 transition-transform shadow-[0_0_20px_rgba(244,63,94,0.3)]">
          Upgrade to Premium
        </Link>
      </div>
    </div>
  );
}
