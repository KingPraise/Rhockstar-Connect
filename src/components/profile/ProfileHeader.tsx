"use client";

import { MapPin, Briefcase, Link as LinkIcon, Calendar, CheckCircle2, Pencil, Camera, TrendingUp, Users, Activity, Eye, Lock, Settings, Check, Loader2, UserPlus, MessageSquare } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { format } from "date-fns";
import Link from "next/link";

interface ProfileHeaderProps {
  onEditClick: () => void;
  customProfile?: any;
  isOwnProfile?: boolean;
  onConnectClick?: () => void;
  connectionStatus?: 'pending' | 'accepted' | 'rejected' | 'none';
  actionLoading?: boolean;
}

import { useState } from "react";
import { Crown } from "lucide-react";
import PremiumLockModal from "@/components/ui/PremiumLockModal";
import { useLightboxStore } from "@/store/useLightboxStore";
import toast from "react-hot-toast";

export default function ProfileHeader({ onEditClick, customProfile, isOwnProfile = true, onConnectClick, connectionStatus, actionLoading }: ProfileHeaderProps) {
  const { profile: loggedInProfile } = useAuthStore();
  const profile = customProfile || loggedInProfile;
  const [premiumLockOpen, setPremiumLockOpen] = useState(false);
  const { openLightbox } = useLightboxStore();

  if (!profile) return null; // Or a skeleton loader

  const isFree = !profile.subscriptionTier || profile.subscriptionTier === 'free';
  const isPremium = profile.subscriptionTier === 'pro' || profile.subscriptionTier === 'elite';
  const isLoggedInUserPremium = loggedInProfile?.subscriptionTier === 'pro' || loggedInProfile?.subscriptionTier === 'elite' || loggedInProfile?.role === 'admin';
  const locationString = typeof profile.location === 'string' ? profile.location : (profile.location?.city ? `${profile.location.city}, ${profile.location.country}` : "Earth");

  const handleBoostClick = () => {
    if (isLoggedInUserPremium) {
      toast.success("Profile boost activated! You are now prioritized in search.", { icon: "🚀", style: { background: '#334155', color: '#fff' } });
    } else {
      setPremiumLockOpen(true);
    }
  };

  const getThemeClasses = (theme?: string) => {
    switch (theme) {
      case 'ocean':
        return {
          cover: 'from-blue-600 via-sky-500 to-blue-600',
          avatar: 'from-blue-600 to-sky-500',
          button: 'from-sky-500 to-blue-600'
        };
      case 'emerald':
        return {
          cover: 'from-emerald-600 via-teal-500 to-emerald-600',
          avatar: 'from-emerald-600 to-teal-500',
          button: 'from-teal-500 to-emerald-600'
        };
      case 'rose':
        return {
          cover: 'from-rose-600 via-pink-500 to-rose-600',
          avatar: 'from-rose-600 to-pink-500',
          button: 'from-pink-500 to-rose-600'
        };
      case 'amber':
        return {
          cover: 'from-amber-600 via-yellow-500 to-amber-600',
          avatar: 'from-amber-600 to-yellow-500',
          button: 'from-yellow-500 to-amber-600'
        };
      default:
        return {
          cover: 'from-brand-purple via-brand to-brand-purple',
          avatar: 'from-brand-purple to-brand',
          button: 'from-brand to-brand-purple'
        };
    }
  };

  const themeClasses = getThemeClasses((profile as any).profileTheme);

  return (
    <div className="neo-card p-0 overflow-hidden flex flex-col mb-6 bg-slate-900/40 backdrop-blur-md border-white/5 shadow-2xl group">
      {/* Cover Photo */}
      <div className={`h-64 w-full bg-gradient-to-r ${themeClasses.cover} bg-[length:200%_200%] animate-gradient-x relative`}>
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]"></div>
        {isOwnProfile && (
          <button onClick={onEditClick} className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 backdrop-blur-md text-white text-sm py-2 px-4 rounded-xl flex items-center gap-2 transition-all border border-white/10 shadow-lg">
            <Camera className="w-4 h-4" />
            Update Cover
          </button>
        )}
      </div>

      <div className="px-8 pb-8 relative">
        {/* Avatar */}
        <div className="absolute -top-16 md:-top-24 left-4 md:left-8 rounded-full p-1.5 md:p-2 bg-slate-900 shadow-2xl z-10 transition-transform duration-300 hover:scale-[1.02]">
          <div 
            onClick={() => {
              if (profile.avatar) {
                openLightbox([profile.avatar]);
              }
            }}
            className={`w-28 h-28 md:w-40 md:h-40 rounded-full bg-gradient-to-br ${themeClasses.avatar} flex items-center justify-center text-white text-5xl md:text-6xl font-extrabold relative overflow-hidden shadow-inner ring-4 ring-slate-800 ${profile.avatar ? 'cursor-pointer' : ''}`}
          >
            {profile.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              profile.fullName?.substring(0, 2).toUpperCase() || 'U'
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          {isOwnProfile && (
            <button 
              onClick={(e) => { e.stopPropagation(); onEditClick(); }}
              className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-slate-800 shadow-lg flex items-center justify-center text-white hover:text-brand-purple transition-all hover:scale-110 border border-white/10"
            >
              <Camera className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end pt-4 pb-2">
          {isOwnProfile ? (
            <>
              <button 
                onClick={handleBoostClick}
                className="py-2 px-5 rounded-xl bg-gradient-to-r from-brand/10 to-brand-purple/10 hover:from-brand/20 hover:to-brand-purple/20 text-white font-medium text-sm flex items-center gap-2 transition-all border border-brand/20 shadow-[0_0_15px_rgba(56,189,248,0.1)] hover:shadow-[0_0_20px_rgba(56,189,248,0.2)]"
              >
                {isFree ? <Lock className="w-4 h-4 text-amber-400" /> : <Crown className="w-4 h-4 text-amber-400" />}
                <span>Boost Profile</span>
              </button>

              <button 
                onClick={onEditClick}
                className="py-2 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm flex items-center gap-2 transition-all border border-white/5 shadow-lg hover:border-white/10"
              >
                <Pencil className="w-4 h-4" />
                Edit Profile
              </button>
              
              <Link 
                href="/settings"
                className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-all border border-white/5 shadow-lg flex items-center justify-center hover:border-white/10 md:hidden"
                title="Settings"
              >
                <Settings className="w-4 h-4" />
              </Link>
            </>
          ) : (
            <>
              {connectionStatus === 'accepted' ? (
                <div className="flex items-center gap-3">
                  <Link 
                    href={`/messages?user=${profile.uid}`}
                    className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-brand to-brand-purple text-white font-bold text-sm flex items-center gap-2 transition-all shadow-lg hover:scale-105"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Message
                  </Link>
                  <button 
                    disabled
                    className="py-2.5 px-6 rounded-xl bg-slate-800 text-brand font-bold text-sm flex items-center gap-2 border border-brand/20 shadow-[inset_0_0_15px_rgba(56,189,248,0.1)]"
                  >
                    <Users className="w-4 h-4" />
                    Connected
                  </button>
                </div>
              ) : connectionStatus === 'pending' ? (
                <button 
                  disabled
                  className="py-2.5 px-6 rounded-xl bg-slate-800 text-slate-400 font-bold text-sm flex items-center gap-2 border border-white/10"
                >
                  <Check className="w-4 h-4" />
                  Pending
                </button>
              ) : (
                <button 
                  onClick={onConnectClick}
                  disabled={actionLoading}
                  className={`py-2.5 px-6 rounded-xl bg-gradient-to-r ${themeClasses.button} text-white font-bold text-sm flex items-center gap-2 transition-all shadow-lg hover:scale-105 disabled:opacity-50 disabled:hover:scale-100`}
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                  Connect
                </button>
              )}
            </>
          )}
        </div>

        <div className="mt-4 max-w-2xl">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h1 className="text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
              {profile.fullName}
              {(profile.subscriptionTier === 'pro' || profile.subscriptionTier === 'elite' || profile.role === 'admin') && (
                <CheckCircle2 className="w-6 h-6 text-brand" />
              )}
            </h1>
            
            {/* Premium Badges */}
            {(profile.subscriptionTier === 'pro' || profile.subscriptionTier === 'elite') && (
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full text-xs font-bold flex items-center gap-1 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                  <Crown className="w-3 h-3" /> Premium Verified
                </span>
                {profile.accountType !== 'employer' && (
                  <span className="px-3 py-1 bg-brand-purple/10 text-brand-purple border border-brand-purple/20 rounded-full text-xs font-bold shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                    Open to Work
                  </span>
                )}
              </div>
            )}
          </div>
          
          <p className="text-slate-400 font-medium text-lg mt-1 mb-4">@{profile.username}</p>
          
          <p className="text-white text-xl font-medium leading-relaxed mb-6">
            {profile.headline || "Add a professional headline"}
          </p>

          <div className="flex flex-wrap items-center gap-y-3 gap-x-6 text-sm text-slate-300 mb-8">
            <div className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer bg-slate-800/50 py-1.5 px-4 rounded-full border border-white/5">
              <MapPin className="w-4 h-4 text-slate-400" />
              {locationString}
            </div>
            <div className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer bg-slate-800/50 py-1.5 px-4 rounded-full border border-white/5">
              <Briefcase className="w-4 h-4 text-slate-400" />
              {profile.relationship || "Single"}
            </div>
            {profile.website && (
              <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-brand hover:text-brand-purple transition-colors bg-brand/10 py-1.5 px-4 rounded-full border border-brand/20">
                <LinkIcon className="w-4 h-4" />
                {profile.website.replace(/^https?:\/\//, '')}
              </a>
            )}
            <div className="flex items-center gap-2 text-slate-400 py-1.5 px-4 rounded-full border border-transparent">
              <Calendar className="w-4 h-4" />
              Joined {format(new Date(), "MMMM yyyy")} {/* Replace with actual joined date when added to auth store */}
            </div>
          </div>
        </div>
      </div>
      
      {/* Stats Divider */}
      <div className="grid grid-cols-4 divide-x divide-white/5 border-t border-white/5 bg-slate-900/50">
        <div className="py-6 flex flex-col items-center justify-center hover:bg-white/5 transition-colors cursor-pointer group/stat">
          <div className="flex items-center gap-2 text-2xl font-bold text-white group-hover/stat:text-brand transition-colors">
            <Users className="w-5 h-5 text-brand" />
            {profile.stats?.followers || 0}
          </div>
          <span className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">Followers</span>
        </div>
        <div className="py-6 flex flex-col items-center justify-center hover:bg-white/5 transition-colors cursor-pointer group/stat">
          <div className="flex items-center gap-2 text-2xl font-bold text-white group-hover/stat:text-brand-purple transition-colors">
            <Activity className="w-5 h-5 text-brand-purple" />
            {profile.stats?.connections || 0}
          </div>
          <span className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">Connections</span>
        </div>
        <div className="py-6 flex flex-col items-center justify-center hover:bg-white/5 transition-colors cursor-pointer group/stat">
          <div className="flex items-center gap-2 text-2xl font-bold text-white group-hover/stat:text-brand transition-colors">
            <TrendingUp className="w-5 h-5 text-brand" />
            {profile.stats?.posts || 0}
          </div>
          <span className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">Posts</span>
        </div>
        <div className="py-6 flex flex-col items-center justify-center hover:bg-white/5 transition-colors cursor-pointer group/stat relative">
          {isLoggedInUserPremium ? (
            <>
              <div className="flex items-center gap-2 text-2xl font-bold text-white group-hover/stat:text-brand-purple transition-colors">
                <Eye className="w-5 h-5 text-brand-purple" />
                24 {/* Views placeholder */}
              </div>
              <span className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">Views</span>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 text-2xl font-bold text-slate-600 blur-[2px]">
                <Eye className="w-5 h-5" />
                24
              </div>
              <span className="text-xs font-bold text-slate-600 mt-1 uppercase tracking-wider blur-[1px]">Views</span>
              <div 
                onClick={() => setPremiumLockOpen(true)}
                className="absolute inset-0 flex items-center justify-center bg-slate-900/40 backdrop-blur-[1px] cursor-pointer"
              >
                <div className="bg-slate-800/80 p-2 rounded-full border border-white/5 hover:border-amber-500/50 transition-colors">
                  <Lock className="w-4 h-4 text-amber-400" />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <PremiumLockModal
        isOpen={premiumLockOpen}
        onClose={() => setPremiumLockOpen(false)}
        title="Unlock Profile Views & Boost"
        description="See who viewed your profile, boost your ranking in search results, and get a Gold Verified Badge."
      />
    </div>
  );
}
