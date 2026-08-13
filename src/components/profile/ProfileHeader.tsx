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
      <div className={`h-36 sm:h-48 md:h-60 w-full bg-gradient-to-r ${themeClasses.cover} bg-[length:200%_200%] animate-gradient-x relative`}>
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]"></div>
        {isOwnProfile && (
          <button onClick={onEditClick} className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-black/40 hover:bg-black/60 backdrop-blur-md text-white text-xs sm:text-sm py-1.5 px-3 sm:py-2 sm:px-4 rounded-xl flex items-center gap-1.5 sm:gap-2 transition-all border border-white/10 shadow-lg">
            <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Update Cover</span>
            <span className="sm:hidden">Cover</span>
          </button>
        )}
      </div>

      <div className="px-4 sm:px-6 md:px-8 pb-6 md:pb-8 relative">
        {/* Avatar */}
        <div className="absolute -top-12 sm:-top-16 md:-top-20 left-4 sm:left-6 md:left-8 rounded-full p-1 sm:p-1.5 md:p-2 bg-slate-900 shadow-2xl z-10 transition-transform duration-300 hover:scale-[1.02]">
          <div 
            onClick={() => {
              if (profile.avatar) {
                openLightbox([profile.avatar]);
              }
            }}
            className={`w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 rounded-full bg-gradient-to-br ${themeClasses.avatar} flex items-center justify-center text-white text-2xl sm:text-4xl md:text-5xl font-extrabold relative overflow-hidden shadow-inner ring-4 ring-slate-800 ${profile.avatar ? 'cursor-pointer' : ''}`}
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
              className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-slate-800 shadow-lg flex items-center justify-center text-white hover:text-brand-purple transition-all hover:scale-110 border border-white/10"
            >
              <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 md:gap-3 justify-end pt-12 sm:pt-16 md:pt-4 pb-2">
          {isOwnProfile ? (
            <>
              <button 
                onClick={handleBoostClick}
                className="py-1.5 px-3 sm:py-2 sm:px-5 rounded-xl bg-gradient-to-r from-brand/10 to-brand-purple/10 hover:from-brand/20 hover:to-brand-purple/20 text-white font-medium text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 transition-all border border-brand/20 shadow-[0_0_15px_rgba(56,189,248,0.1)] hover:shadow-[0_0_20px_rgba(56,189,248,0.2)]"
              >
                {isFree ? <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" /> : <Crown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />}
                <span>Boost</span>
              </button>

              <button 
                onClick={onEditClick}
                className="py-1.5 px-3 sm:py-2 sm:px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 transition-all border border-white/5 shadow-lg hover:border-white/10"
              >
                <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Edit Profile
              </button>
              
              <Link 
                href="/settings"
                className="py-1.5 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-all border border-white/5 shadow-lg flex items-center justify-center hover:border-white/10 md:hidden"
                title="Settings"
              >
                <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3">
              <Link 
                href={`/messages?user=${profile.uid}`}
                className="py-2 px-4 sm:py-2.5 sm:px-6 rounded-xl bg-gradient-to-r from-brand to-brand-purple text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 transition-all shadow-lg hover:scale-105"
              >
                <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Message
              </Link>

              {connectionStatus === 'accepted' ? (
                <button 
                  disabled
                  className="py-2 px-4 sm:py-2.5 sm:px-6 rounded-xl bg-slate-800 text-brand font-bold text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 border border-brand/20 shadow-[inset_0_0_15px_rgba(56,189,248,0.1)]"
                >
                  <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Connected
                </button>
              ) : connectionStatus === 'pending' ? (
                <button 
                  disabled
                  className="py-2 px-4 sm:py-2.5 sm:px-6 rounded-xl bg-slate-800 text-slate-400 font-bold text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 border border-white/10"
                >
                  <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Pending
                </button>
              ) : (
                <button 
                  onClick={onConnectClick}
                  disabled={actionLoading}
                  className={`py-2 px-4 sm:py-2.5 sm:px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 transition-all border border-white/10 shadow-lg hover:scale-105 disabled:opacity-50 disabled:hover:scale-100`}
                >
                  {actionLoading ? <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" /> : <UserPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                  Connect
                </button>
              )}
            </div>
          )}
        </div>

        <div className="mt-2 sm:mt-4 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1">
            <h1 className="text-xl sm:text-2xl md:text-4xl font-extrabold text-white tracking-tight flex items-center gap-2 leading-tight">
              {profile.fullName}
              {(profile.subscriptionTier === 'pro' || profile.subscriptionTier === 'elite' || profile.role === 'admin') && (
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-brand shrink-0" />
              )}
            </h1>
            
            {/* Premium Badges */}
            {(profile.subscriptionTier === 'pro' || profile.subscriptionTier === 'elite') && (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full text-[10px] sm:text-xs font-bold flex items-center gap-1 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                  <Crown className="w-3 h-3" /> Premium Verified
                </span>
                {profile.accountType !== 'employer' && (
                  <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 bg-brand-purple/10 text-brand-purple border border-brand-purple/20 rounded-full text-[10px] sm:text-xs font-bold shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                    Open to Work
                  </span>
                )}
              </div>
            )}
          </div>
          
          <p className="text-slate-400 font-medium text-xs sm:text-sm md:text-base mt-0.5 mb-2">@{profile.username}</p>
          
          <p className="text-slate-200 text-sm sm:text-base md:text-xl font-medium leading-relaxed mb-4 sm:mb-6">
            {profile.headline || "Add a professional headline"}
          </p>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-6 text-xs sm:text-sm text-slate-300 mb-4 sm:mb-6">
            <div className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer bg-slate-800/50 py-1 px-3 md:py-1.5 md:px-4 rounded-full border border-white/5">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{locationString}</span>
            </div>
            <div className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer bg-slate-800/50 py-1 px-3 md:py-1.5 md:px-4 rounded-full border border-white/5">
              <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{profile.relationship || "Single"}</span>
            </div>
            {profile.website && (
              <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-brand hover:text-brand-purple transition-colors bg-brand/10 py-1 px-3 md:py-1.5 md:px-4 rounded-full border border-brand/20">
                <LinkIcon className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate max-w-[150px] sm:max-w-none">{profile.website.replace(/^https?:\/\//, '')}</span>
              </a>
            )}
            <div className="flex items-center gap-1.5 text-slate-400 py-1 px-2 md:py-1.5 md:px-4 rounded-full">
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              <span>Joined {format(new Date(), "MMMM yyyy")}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Stats Divider */}
      <div className="grid grid-cols-4 divide-x divide-white/5 border-t border-white/5 bg-slate-900/50">
        <div className="py-3 sm:py-5 md:py-6 px-1 flex flex-col items-center justify-center hover:bg-white/5 transition-colors cursor-pointer group/stat">
          <div className="flex items-center gap-1 sm:gap-2 text-base sm:text-xl md:text-2xl font-bold text-white group-hover/stat:text-brand transition-colors">
            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-brand shrink-0" />
            <span>{profile.stats?.followers || 0}</span>
          </div>
          <span className="text-[9px] sm:text-[10px] md:text-xs font-bold text-slate-500 mt-0.5 sm:mt-1 uppercase tracking-tight sm:tracking-wider truncate max-w-full text-center">Followers</span>
        </div>
        <div className="py-3 sm:py-5 md:py-6 px-1 flex flex-col items-center justify-center hover:bg-white/5 transition-colors cursor-pointer group/stat">
          <div className="flex items-center gap-1 sm:gap-2 text-base sm:text-xl md:text-2xl font-bold text-white group-hover/stat:text-brand-purple transition-colors">
            <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-brand-purple shrink-0" />
            <span>{profile.stats?.connections || 0}</span>
          </div>
          <span className="text-[9px] sm:text-[10px] md:text-xs font-bold text-slate-500 mt-0.5 sm:mt-1 uppercase tracking-tight sm:tracking-wider truncate max-w-full text-center">Connections</span>
        </div>
        <div className="py-3 sm:py-5 md:py-6 px-1 flex flex-col items-center justify-center hover:bg-white/5 transition-colors cursor-pointer group/stat">
          <div className="flex items-center gap-1 sm:gap-2 text-base sm:text-xl md:text-2xl font-bold text-white group-hover/stat:text-brand transition-colors">
            <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-brand shrink-0" />
            <span>{profile.stats?.posts || 0}</span>
          </div>
          <span className="text-[9px] sm:text-[10px] md:text-xs font-bold text-slate-500 mt-0.5 sm:mt-1 uppercase tracking-tight sm:tracking-wider truncate max-w-full text-center">Posts</span>
        </div>
        <div className="py-3 sm:py-5 md:py-6 px-1 flex flex-col items-center justify-center hover:bg-white/5 transition-colors cursor-pointer group/stat relative">
          {isLoggedInUserPremium ? (
            <>
              <div className="flex items-center gap-1 sm:gap-2 text-base sm:text-xl md:text-2xl font-bold text-white group-hover/stat:text-brand-purple transition-colors">
                <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-brand-purple shrink-0" />
                <span>24</span>
              </div>
              <span className="text-[9px] sm:text-[10px] md:text-xs font-bold text-slate-500 mt-0.5 sm:mt-1 uppercase tracking-tight sm:tracking-wider truncate max-w-full text-center">Views</span>
            </>
          ) : (
            <>
              <div className="flex items-center gap-1 sm:gap-2 text-base sm:text-xl md:text-2xl font-bold text-slate-600 blur-[2px]">
                <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 shrink-0" />
                <span>24</span>
              </div>
              <span className="text-[9px] sm:text-[10px] md:text-xs font-bold text-slate-600 mt-0.5 sm:mt-1 uppercase tracking-tight sm:tracking-wider blur-[1px] truncate max-w-full text-center">Views</span>
              <div 
                onClick={() => setPremiumLockOpen(true)}
                className="absolute inset-0 flex items-center justify-center bg-slate-900/40 backdrop-blur-[1px] cursor-pointer"
              >
                <div className="bg-slate-800/80 p-1.5 rounded-full border border-white/5 hover:border-amber-500/50 transition-colors">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
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
