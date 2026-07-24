"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { REFERRAL_TIERS, claimReferralReward, ReferralTier } from "@/lib/services/referrals";
import { 
  Gift, 
  Copy, 
  Check, 
  Share2, 
  Sparkles, 
  Zap, 
  Award, 
  Crown, 
  Users, 
  CheckCircle2, 
  Loader2,
  Lock
} from "lucide-react";
import AuthRequiredModal from "@/components/auth/AuthRequiredModal";

export default function ReferralsPage() {
  const { profile, setProfile } = useAuthStore();
  const [copied, setCopied] = useState(false);
  const [claimingTierId, setClaimingTierId] = useState<string | null>(null);
  const [claimSuccessMsg, setClaimSuccessMsg] = useState<string | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const referralCode = profile?.username || profile?.uid || "";
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : "https://rhockstarconnect.netlify.app";
  const referralUrl = `${baseUrl}/register?ref=${encodeURIComponent(referralCode)}`;

  const referralCount = profile?.referralCount || 0;
  const claimedRewards: string[] = profile?.claimedRewards || [];
  const referredFriends: Array<{ uid: string; name: string; joinedAt: string }> = profile?.referredFriends || [];

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareSocial = (platform: 'whatsapp' | 'twitter' | 'facebook' | 'native') => {
    const text = `Join me on Rhockstar Connect, the premier professional networking & dating platform! Sign up here: ${referralUrl}`;
    
    if (platform === 'whatsapp') {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
    } else if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
    } else if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralUrl)}`, '_blank');
    } else if (platform === 'native') {
      if (navigator.share) {
        navigator.share({
          title: "Join Rhockstar Connect",
          text,
          url: referralUrl
        }).catch(console.error);
      } else {
        handleCopyLink();
      }
    }
  };

  const handleClaim = async (tier: ReferralTier) => {
    if (!profile) {
      setAuthModalOpen(true);
      return;
    }

    setClaimingTierId(tier.id);
    setClaimSuccessMsg(null);

    const res = await claimReferralReward(profile.uid, tier.id);
    setClaimingTierId(null);

    if (res.success) {
      // Update local profile store
      const updatedClaimed = [...claimedRewards, tier.id];
      const updatedProfile = { ...profile, claimedRewards: updatedClaimed };
      setProfile(updatedProfile);

      setClaimSuccessMsg(`🎉 Success! You unlocked: ${tier.title}`);
      setTimeout(() => setClaimSuccessMsg(null), 4000);
    } else {
      alert(res.error || "Failed to claim reward.");
    }
  };

  const getTierIcon = (rewardType: string) => {
    switch (rewardType) {
      case 'premium':
        return <Sparkles className="w-6 h-6 text-amber-400" />;
      case 'boost':
        return <Zap className="w-6 h-6 text-rose-400" />;
      case 'badge_and_jobs':
        return <Award className="w-6 h-6 text-emerald-400" />;
      case 'vip':
        return <Crown className="w-6 h-6 text-yellow-400" />;
      default:
        return <Gift className="w-6 h-6 text-brand" />;
    }
  };

  // Max progress calculation (up to 10 referrals)
  const maxReferrals = 10;
  const progressPercent = Math.min(100, Math.round((referralCount / maxReferrals) * 100));

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-8 pb-12">
      {/* Hero Banner */}
      <div className="neo-card p-8 md:p-10 relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-950/40 to-slate-900 border-white/10 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand/10 border border-brand/30 text-brand text-xs font-bold uppercase tracking-wider mb-4">
              <Gift className="w-4 h-4" />
              Invite & Earn Rewards
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Invite Friends, Unlock <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-purple">God Mode</span> Perks
            </h1>
            <p className="text-slate-300 text-base md:text-lg mt-3 leading-relaxed">
              Share your link with colleagues, friends, or network contacts. Load your progress bar and claim free Premium days, Profile Boosts, and Badges!
            </p>
          </div>

          {/* Quick Counter Card */}
          <div className="neo-card p-6 bg-slate-800/80 border-white/10 min-w-[220px] text-center shadow-xl">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Total Referrals</div>
            <div className="text-5xl font-extrabold text-white flex items-center justify-center gap-2">
              {referralCount}
              <Users className="w-8 h-8 text-brand" />
            </div>
            <p className="text-xs text-slate-400 mt-2">Active Invited Friends</p>
          </div>
        </div>
      </div>

      {/* Claim Success Alert */}
      {claimSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-center animate-in fade-in slide-in-from-top-2 shadow-lg">
          {claimSuccessMsg}
        </div>
      )}

      {/* Share & Referral Link Section */}
      <div className="neo-card p-6 md:p-8 bg-slate-900/60 backdrop-blur-md border-white/10">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
          <Share2 className="w-5 h-5 text-brand" />
          Your Unique Referral Link
        </h2>

        <div className="flex flex-col md:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              readOnly
              value={referralUrl}
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-slate-200 focus:outline-none pr-28 font-mono shadow-inner"
            />
            <span className="absolute right-3 top-3 px-2 py-0.5 rounded-md bg-brand/20 text-brand text-xs font-bold border border-brand/30">
              Code: {referralCode || 'YOUR_CODE'}
            </span>
          </div>

          <button
            onClick={handleCopyLink}
            className="w-full md:w-auto py-3.5 px-6 rounded-xl bg-gradient-to-r from-brand to-brand-purple text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg hover:scale-105 transition-all shrink-0"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy Link
              </>
            )}
          </button>
        </div>

        {/* Social Share Buttons */}
        <div className="mt-6 pt-6 border-t border-white/5 flex flex-wrap items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-2">Share directly:</span>
          <button
            onClick={() => handleShareSocial('whatsapp')}
            className="py-2 px-4 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-600/30 text-xs font-bold flex items-center gap-2 transition-all"
          >
            WhatsApp
          </button>
          <button
            onClick={() => handleShareSocial('twitter')}
            className="py-2 px-4 rounded-xl bg-sky-600/20 border border-sky-500/30 text-sky-400 hover:bg-sky-600/30 text-xs font-bold flex items-center gap-2 transition-all"
          >
            X (Twitter)
          </button>
          <button
            onClick={() => handleShareSocial('facebook')}
            className="py-2 px-4 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 hover:bg-blue-600/30 text-xs font-bold flex items-center gap-2 transition-all"
          >
            Facebook
          </button>
          <button
            onClick={() => handleShareSocial('native')}
            className="py-2 px-4 rounded-xl bg-slate-800 border border-white/10 text-slate-300 hover:bg-slate-700 text-xs font-bold flex items-center gap-2 transition-all"
          >
            <Share2 className="w-3.5 h-3.5" />
            More Options
          </button>
        </div>
      </div>

      {/* Progress Bar & Milestone Section */}
      <div className="neo-card p-6 md:p-8 bg-slate-900/60 backdrop-blur-md border-white/10">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              Referral Milestone Progress
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Invite friends to load your bar and unlock rewards.
            </p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-white">{referralCount}</span>
            <span className="text-sm font-bold text-slate-400"> / {maxReferrals} Referrals</span>
          </div>
        </div>

        {/* Outer Bar Container */}
        <div className="relative w-full bg-slate-950 rounded-full h-6 p-1 border border-white/10 shadow-inner overflow-hidden mb-6">
          {/* Inner Fill */}
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand via-brand-purple to-amber-400 transition-all duration-700 shadow-[0_0_15px_rgba(168,85,247,0.5)]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Milestone Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          {REFERRAL_TIERS.map((tier) => {
            const isUnlocked = referralCount >= tier.requiredInvites;
            const isClaimed = claimedRewards.includes(tier.id);
            const isClaiming = claimingTierId === tier.id;

            return (
              <div
                key={tier.id}
                className={`neo-card p-6 flex flex-col justify-between relative overflow-hidden transition-all duration-300 ${
                  isClaimed 
                    ? 'border-emerald-500/40 bg-emerald-950/20' 
                    : isUnlocked 
                    ? 'border-brand/50 bg-slate-900 shadow-[0_0_20px_rgba(168,85,247,0.15)] hover:scale-[1.02]' 
                    : 'border-white/5 bg-slate-950/40 opacity-80'
                }`}
              >
                {/* Status Badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-2xl bg-slate-900 border border-white/10 shadow-inner">
                    {getTierIcon(tier.rewardType)}
                  </div>

                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                    isClaimed 
                      ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' 
                      : isUnlocked 
                      ? 'bg-amber-500/20 border-amber-500/30 text-amber-400 animate-pulse' 
                      : 'bg-slate-800 border-white/5 text-slate-500'
                  }`}>
                    {isClaimed ? 'Claimed ✓' : isUnlocked ? 'Unlocked! 🎉' : `${referralCount}/${tier.requiredInvites} Invites`}
                  </span>
                </div>

                <div>
                  <h3 className="font-extrabold text-white text-lg mb-1">{tier.title}</h3>
                  <p className="text-slate-400 text-xs leading-relaxed mb-6">{tier.description}</p>
                </div>

                {/* Claim Button */}
                <div>
                  {isClaimed ? (
                    <div className="w-full py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold text-center flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      Active / Claimed
                    </div>
                  ) : isUnlocked ? (
                    <button
                      onClick={() => handleClaim(tier)}
                      disabled={isClaiming}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-brand to-brand-purple hover:from-brand-purple hover:to-brand text-white font-extrabold text-xs tracking-wide shadow-lg hover:shadow-brand/40 transition-all flex items-center justify-center gap-2"
                    >
                      {isClaiming ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Claim Reward
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full py-2.5 rounded-xl bg-slate-900 border border-white/5 text-slate-600 text-xs font-bold flex items-center justify-center gap-2 cursor-not-allowed"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      Needs {tier.requiredInvites - referralCount} More {tier.requiredInvites - referralCount === 1 ? 'Invite' : 'Invites'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Joined Friends List */}
      <div className="neo-card p-6 md:p-8 bg-slate-900/60 backdrop-blur-md border-white/10">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
          <Users className="w-5 h-5 text-brand" />
          Invited Friends ({referredFriends.length})
        </h2>

        {referredFriends.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {referredFriends.map((friend, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-800/40 border border-white/5 hover:border-white/10 transition-all">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand to-brand-purple text-white font-extrabold text-sm flex items-center justify-center shadow-md">
                  {friend.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">{friend.name}</h4>
                  <p className="text-xs text-slate-400">Joined {new Date(friend.joinedAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500 text-sm">
            No friends have joined using your link yet. Share your link above to get started!
          </div>
        )}
      </div>

      <AuthRequiredModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        actionName="claim referral rewards"
      />
    </div>
  );
}
