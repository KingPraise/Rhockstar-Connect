"use client";

import { Check, Crown, Star, Shield, Zap, Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function PremiumPage() {
  const { profile, setProfile } = useAuthStore();
  const router = useRouter();
  const [processingTier, setProcessingTier] = useState<string | null>(null);

  const handleSubscribe = async (tier: 'pro' | 'elite') => {
    if (!profile) return;
    setProcessingTier(tier);

    try {
      // Mock payment delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const userRef = doc(db, "users", profile.uid);
      await updateDoc(userRef, {
        subscriptionTier: tier,
        subscriptionStatus: "active"
      });

      setProfile({
        ...profile,
        subscriptionTier: tier,
        subscriptionStatus: "active"
      });

      alert(`Successfully upgraded to ${tier.toUpperCase()}!`);
      router.push("/profile");
    } catch (error) {
      console.error("Subscription error:", error);
      alert("Failed to process subscription.");
    } finally {
      setProcessingTier(null);
    }
  };
  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20">
      
      {/* HEADER */}
      <div className="text-center max-w-2xl mx-auto space-y-4 pt-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-br from-amber-400/20 to-amber-600/20 border border-amber-500/20 shadow-[0_0_30px_rgba(245,158,11,0.3)] mb-4">
          <Crown className="w-8 h-8 text-amber-500" />
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">Upgrade to <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">Premium</span></h1>
        <p className="text-lg text-slate-400">Unlock the full power of Rhockstar Connect. Get verified, increase your visibility, and build meaningful relationships faster.</p>
      </div>

      {/* PRICING CARDS */}
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-12">
        
        {/* ESSENTIAL PLAN */}
        <div className="neo-card p-8 bg-slate-900/60 backdrop-blur-md relative overflow-hidden flex flex-col h-full hover:-translate-y-2 transition-transform">
          <div className="absolute top-0 right-0 p-4">
            <Star className="w-6 h-6 text-slate-500 opacity-20" />
          </div>
          <h3 className="text-2xl font-bold mb-2 text-white">Pro</h3>
          <p className="text-slate-400 text-sm mb-6 h-10">Essential tools to stand out and connect.</p>
          
          <div className="mb-8">
            <span className="text-4xl font-extrabold text-white">₦2,000</span>
            <span className="text-slate-500 font-medium"> / month</span>
          </div>
          
          <div className="space-y-4 mb-10 flex-1">
            {[
              "Verified Badge on your profile",
              "Advanced search filters",
              "See who viewed your profile",
              "Unlimited messaging",
              "Priority support"
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-brand/20 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-brand" />
                </div>
                <span className="text-slate-300 text-sm">{feature}</span>
              </div>
            ))}
          </div>
          
          <button 
            onClick={() => handleSubscribe('pro')}
            disabled={processingTier !== null || profile?.subscriptionTier === 'pro'}
            className="w-full neo-button-secondary py-4 text-white font-bold hover:bg-white/10 transition-colors mt-auto flex items-center justify-center gap-2"
          >
            {processingTier === 'pro' ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
            {profile?.subscriptionTier === 'pro' ? 'Current Plan' : 'Choose Pro'}
          </button>
        </div>

        {/* ELITE PLAN (HIGHLIGHTED) */}
        <div className="neo-card p-8 bg-gradient-to-br from-brand-purple/10 to-brand/10 border-brand-purple/40 backdrop-blur-md relative overflow-hidden flex flex-col h-full shadow-[0_0_40px_rgba(168,85,247,0.15)] hover:-translate-y-2 transition-transform scale-105 z-10">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-brand to-brand-purple" />
          <div className="absolute top-4 right-4">
            <div className="px-3 py-1 text-xs font-bold bg-brand-purple text-white rounded-full shadow-lg">RECOMMENDED</div>
          </div>
          
          <h3 className="text-2xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-purple flex items-center gap-2">
            Elite <Zap className="w-5 h-5 text-brand" />
          </h3>
          <p className="text-brand-purple/80 text-sm mb-6 h-10">Ultimate visibility for serious networking & dating.</p>
          
          <div className="mb-8">
            <span className="text-4xl font-extrabold text-white">₦5,000</span>
            <span className="text-slate-400 font-medium"> / month</span>
          </div>
          
          <div className="space-y-4 mb-10 flex-1">
            {[
              "Everything in Pro",
              "Featured Posts & Job Listings",
              "Maximum visibility in feed & matching",
              "Access to exclusive communities",
              "Advanced profile customization",
              "Incognito browsing mode"
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-brand-purple/20 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-brand-purple" />
                </div>
                <span className="text-white font-medium text-sm">{feature}</span>
              </div>
            ))}
          </div>
          
          <div className="w-full relative group overflow-hidden rounded-xl bg-gradient-to-r from-brand to-brand-purple p-[1px] transition-all hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] mt-auto cursor-pointer">
            <div className="absolute inset-0 bg-white/20 group-hover:bg-transparent transition-colors z-0" />
            <button 
              onClick={() => handleSubscribe('elite')}
              disabled={processingTier !== null || profile?.subscriptionTier === 'elite'}
              className="relative z-10 w-full flex items-center justify-center gap-2 bg-slate-900 px-6 py-4 rounded-xl group-hover:bg-opacity-0 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {processingTier === 'elite' ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              <span className="font-bold text-white tracking-wide">
                {profile?.subscriptionTier === 'elite' ? 'Current Plan' : 'Upgrade to Elite'}
              </span>
            </button>
          </div>
        </div>

      </div>

      {/* WHY UPGRADE */}
      <div className="mt-24 max-w-4xl mx-auto text-center border-t border-white/5 pt-20">
        <h2 className="text-3xl font-bold mb-12">Why go Premium?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="neo-card p-6 bg-slate-900/40">
            <div className="w-12 h-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center mx-auto mb-4 text-xl">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="font-bold mb-2">Build Trust</h3>
            <p className="text-sm text-slate-400">The verified badge shows others you are a real, serious professional or connection.</p>
          </div>
          <div className="neo-card p-6 bg-slate-900/40">
            <div className="w-12 h-12 rounded-2xl bg-brand-purple/10 text-brand-purple flex items-center justify-center mx-auto mb-4 text-xl">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-bold mb-2">More Visibility</h3>
            <p className="text-sm text-slate-400">Your profile and posts will be boosted in the algorithm, getting you more views and matches.</p>
          </div>
          <div className="neo-card p-6 bg-slate-900/40">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-4 text-xl">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-bold mb-2">Unlimited Access</h3>
            <p className="text-sm text-slate-400">Remove limits on messaging, swiping, and job applications to maximize your opportunities.</p>
          </div>
        </div>
      </div>
      
    </div>
  );
}
