
"use client";

import { Trophy, Star, Shield, Zap, TrendingUp, HelpCircle, X, CheckCircle2, AlertCircle } from "lucide-react";
import { STARDOM_TIERS } from "@/lib/services/gamification";

interface StardomInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function StardomInfoModal({ isOpen, onClose }: StardomInfoModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-slate-900 border border-brand/30 p-6 md:p-8 rounded-3xl shadow-[0_0_50px_rgba(245,158,11,0.15)] relative overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
            <Trophy className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-white">Stardom & XP Rules</h2>
            <p className="text-slate-400 text-sm">Learn how to level up your Rhockstar Connect profile.</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-8 pb-4">
          
          {/* HOW IT WORKS */}
          <section className="space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/10 pb-2">
              <Zap className="w-5 h-5 text-amber-400" /> How to Earn XP
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold text-white text-sm">Daily Check-in</span>
                  <span className="text-amber-400 font-extrabold text-sm">+25 XP</span>
                </div>
                <p className="text-xs text-slate-400">Log in every day to claim this reward (Max 1/day).</p>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold text-white text-sm">Send Messages</span>
                  <span className="text-amber-400 font-extrabold text-sm">+2 XP</span>
                </div>
                <p className="text-xs text-slate-400">Chat with connections (Max 10 per hour).</p>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold text-white text-sm">Community Comment</span>
                  <span className="text-amber-400 font-extrabold text-sm">+10 XP</span>
                </div>
                <p className="text-xs text-slate-400">Engage in public communities (Max 10/day).</p>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold text-white text-sm">Join Community</span>
                  <span className="text-amber-400 font-extrabold text-sm">+15 XP</span>
                </div>
                <p className="text-xs text-slate-400">Expand your network (Max 2/day).</p>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold text-white text-sm">Create Post</span>
                  <span className="text-amber-400 font-extrabold text-sm">+20 XP</span>
                </div>
                <p className="text-xs text-slate-400">Share your thoughts on the Feed (Max 3/day).</p>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold text-white text-sm">Get Reactions</span>
                  <span className="text-amber-400 font-extrabold text-sm">+5 XP</span>
                </div>
                <p className="text-xs text-slate-400">When others like your content (Max 20/day).</p>
              </div>
            </div>
          </section>

          {/* STREAK MULTIPLIERS */}
          <section className="space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/10 pb-2">
              <TrendingUp className="w-5 h-5 text-orange-400" /> Streak Multipliers
            </h3>
            <p className="text-sm text-slate-300">Maintain a daily login streak to multiply all the XP you earn automatically!</p>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 bg-slate-800/80 px-4 py-2 rounded-lg border border-orange-500/30">
                <span className="text-orange-400 font-bold">🔥 3+ Days</span>
                <span className="text-white text-sm">= 1.1x XP</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-800/80 px-4 py-2 rounded-lg border border-orange-500/50">
                <span className="text-orange-500 font-bold">🔥 7+ Days</span>
                <span className="text-white text-sm">= 1.25x XP</span>
              </div>
              <div className="flex items-center gap-2 bg-gradient-to-r from-orange-500/20 to-red-500/20 px-4 py-2 rounded-lg border border-orange-500/70">
                <span className="text-orange-500 font-bold">🔥 30+ Days</span>
                <span className="text-white text-sm font-bold">= 1.5x XP</span>
              </div>
            </div>
          </section>

          {/* ANTI SPAM RULES */}
          <section className="space-y-4 bg-rose-500/5 border border-rose-500/20 p-5 rounded-2xl">
            <h3 className="text-lg font-bold text-rose-400 flex items-center gap-2">
              <Shield className="w-5 h-5" /> Rules & Anti-Spam
            </h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-sm text-slate-300">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span><strong className="text-white">XP Limits:</strong> To prevent spamming, earning XP from messages and comments is strictly capped per hour and per day. Once you hit the cap, you can still chat, but you won't earn additional XP until the cooldown expires.</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-slate-300">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span><strong className="text-white">Quality Content:</strong> Meaningless spam messages (e.g. sending "hi" 100 times) will trigger automated spam filters, permanently freezing your XP progression or leading to an account shadowban.</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-slate-300">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span><strong className="text-white">Reactions:</strong> You only earn XP when <em>other</em> users react to your content, not when you react to your own.</span>
              </li>
            </ul>
          </section>

          {/* ALL RANKS OVERVIEW */}
          <section className="space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/10 pb-2">
              <Star className="w-5 h-5 text-brand" /> Rank Progression
            </h3>
            <div className="grid sm:grid-cols-2 gap-2">
              {STARDOM_TIERS.map((tier) => (
                <div key={tier.rank} className={`flex items-center gap-3 p-3 rounded-xl border bg-slate-800/40 ${tier.borderColor}`}>
                  <span className="text-2xl">{tier.badge}</span>
                  <div>
                    <h4 className={`font-bold text-sm ${tier.textColor}`}>{tier.title}</h4>
                    <span className="text-xs text-slate-400">{tier.minXP.toLocaleString()}+ XP</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>
        
        <div className="pt-4 border-t border-white/10 mt-2">
          <button 
            onClick={onClose}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}
