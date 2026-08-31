"use client";

import { Check, Crown, Star, Shield, Zap, Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';

import CurrencySelector from "@/components/ui/CurrencySelector";
import { useCurrencyStore, CURRENCIES } from "@/store/useCurrencyStore";


const PaymentButton = ({ tier, profile, currency, formatPrice, onSuccess, disabled, className, children }: any) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const baseUSD = tier === 'pro' ? 2 : 5;
  const curr = (CURRENCIES as any)[currency] || { rateFromUSD: 1 };
  const amount = baseUSD * curr.rateFromUSD;

  const config = {
    public_key: process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY || 'FLWPUBK_TEST-78ba9038855272bdb48441ac8989d5aa-X',
    tx_ref: `rhockstar_${tier}_${Date.now()}`,
    amount: amount,
    currency: currency,
    payment_options: 'card,mobilemoney,ussd',
    customer: {
      email: profile?.email || 'user@rhockstar.com',
      phone_number: profile?.phone || '',
      name: profile?.fullName || profile?.username || 'Rhockstar User',
    },
    customizations: {
      title: `Rhockstar Connect ${tier.toUpperCase()}`,
      description: `Payment for ${tier.toUpperCase()} membership`,
      logo: typeof window !== 'undefined' ? `${window.location.origin}/icon.png` : '',
    },
  };

  const handleFlutterPayment = useFlutterwave(config);

  const handleClick = () => {
    setIsProcessing(true);
    handleFlutterPayment({
      callback: (response) => {
        if (response.status === 'successful' || response.status === 'completed') {
          onSuccess(tier);
        } else {
          setIsProcessing(false);
          toast.error("Payment was not successful.");
        }
        closePaymentModal();
      },
      onClose: () => {
        setIsProcessing(false);
      },
    });
  };

  return (
    <button onClick={handleClick} disabled={disabled || isProcessing} className={className}>
      {isProcessing && <Loader2 className="w-5 h-5 animate-spin" />}
      {children}
    </button>
  );
};

export default function PremiumPage() {
  const { profile, setProfile } = useAuthStore();
  const { formatPrice } = useCurrencyStore();
  const [processingTier, setProcessingTier] = useState<'pro' | 'elite' | null>(null);

  const handleSubscribe = async (tier: 'pro' | 'elite') => {
    if (!profile?.uid) return;
    setProcessingTier(tier);
    try {
      const { updateUserProfile } = await import('@/lib/services/users');
      const res = await updateUserProfile(profile.uid, {
        subscriptionTier: tier,
        subscriptionStatus: 'active'
      });
      if (res.success) {
        setProfile({ ...profile, subscriptionTier: tier, subscriptionStatus: 'active' } as any);
        toast.success(`Successfully upgraded to ${tier.toUpperCase()} plan!`);
      } else {
        toast.error("Failed to upgrade plan.");
      }
    } catch (error) {
      toast.error("An error occurred during upgrade.");
    }
    setProcessingTier(null);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 py-8 px-4">
      
      {/* HEADER */}
      <div className="text-center space-y-4 max-w-2xl mx-auto relative">
        <div className="flex justify-center mb-2">
          <CurrencySelector />
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-bold shadow-[0_0_15px_rgba(245,158,11,0.2)]">
          <Crown className="w-4 h-4" />
          Rhockstar Connect Membership
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
            <span className="text-4xl font-extrabold text-white">{formatPrice(2)}</span>
            <span className="text-slate-500 font-medium"> / month</span>
          </div>
          
          <div className="space-y-4 mb-10 flex-1">
            {[
              "Verified Badge on your profile",
              "Advanced Search Filters & Global Smart Search",
              "See who viewed your profile",
              "Enhanced Media Lightbox Viewer",
              "Message Editing & Deletion",
              "Chat Media Uploads",
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
          
          <PaymentButton 
            tier="pro"
            profile={profile}
            currency={currency}
            formatPrice={formatPrice}
            onSuccess={handleSubscribe}
            disabled={processingTier !== null || profile?.subscriptionTier === 'pro'}
            className="w-full neo-button-secondary py-4 text-white font-bold hover:bg-white/10 transition-colors mt-auto flex items-center justify-center gap-2"
          >
            {profile?.subscriptionTier === 'pro' ? 'Current Plan' : 'Choose Pro'}
          </PaymentButton>
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
            <span className="text-4xl font-extrabold text-white">{formatPrice(5)}</span>
            <span className="text-slate-400 font-medium"> / month</span>
          </div>
          
          <div className="space-y-4 mb-10 flex-1">
            {[
              "Everything in Pro",
              "Featured Posts & Job Listings",
              "Maximum visibility in feed & matching",
              "Access to exclusive communities",
              "Advanced profile customization",
              "Incognito browsing mode",
              "Hide Online Status & Read Receipts"
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
            <PaymentButton 
              tier="elite"
              profile={profile}
              currency={currency}
              formatPrice={formatPrice}
              onSuccess={handleSubscribe}
              disabled={processingTier !== null || profile?.subscriptionTier === 'elite'}
              className="relative z-10 w-full flex items-center justify-center gap-2 bg-slate-900 px-6 py-4 rounded-xl group-hover:bg-opacity-0 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <span className="font-bold text-white tracking-wide">
                {profile?.subscriptionTier === 'elite' ? 'Current Plan' : 'Upgrade to Elite'}
              </span>
            </PaymentButton>
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
