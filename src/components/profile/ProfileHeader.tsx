"use client";

import { MapPin, Briefcase, Link as LinkIcon, Calendar, CheckCircle2, Pencil, Camera, TrendingUp, Users, Activity, Eye, Lock } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { format } from "date-fns";

interface ProfileHeaderProps {
  onEditClick: () => void;
  customProfile?: any;
  isOwnProfile?: boolean;
  onConnectClick?: () => void;
}

import { useState } from "react";
import { Crown } from "lucide-react";
import PremiumLockModal from "@/components/ui/PremiumLockModal";

export default function ProfileHeader({ onEditClick, customProfile, isOwnProfile = true, onConnectClick }: ProfileHeaderProps) {
  const { profile: loggedInProfile } = useAuthStore();
  const profile = customProfile || loggedInProfile;
  const [premiumLockOpen, setPremiumLockOpen] = useState(false);

  if (!profile) return null; // Or a skeleton loader

  const isFree = !profile.subscriptionTier || profile.subscriptionTier === 'free';
  const locationString = typeof profile.location === 'string' ? profile.location : (profile.location?.city ? `${profile.location.city}, ${profile.location.country}` : "Earth");

  return (
    <div className="neo-card p-0 overflow-hidden flex flex-col mb-6 bg-slate-900/40 backdrop-blur-md border-white/5 shadow-2xl group">
      {/* Cover Photo */}
      <div className="h-64 w-full bg-gradient-to-r from-brand-purple via-brand to-brand-purple bg-[length:200%_200%] animate-gradient-x relative">
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
        <div className="absolute -top-24 left-8 rounded-full p-2 bg-slate-900 shadow-2xl z-10 transition-transform duration-300 hover:scale-[1.02]">
          <div className="w-40 h-40 rounded-full bg-gradient-to-br from-brand-purple to-brand flex items-center justify-center text-white text-6xl font-extrabold relative overflow-hidden shadow-inner ring-4 ring-slate-800">
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
              onClick={onEditClick}
              className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-slate-800 shadow-lg flex items-center justify-center text-white hover:text-brand-purple transition-all hover:scale-110 border border-white/10"
            >
              <Camera className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end pt-4 pb-2 gap-2">
          {isOwnProfile ? (
            <>
              <button 
                onClick={() => setPremiumLockOpen(true)}
                className="py-2 px-4 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/20 text-amber-300 border border-amber-500/30 hover:border-amber-400 font-bold text-sm flex items-center gap-1.5 transition-all shadow-md"
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
            </>
          ) : (
            <button 
              onClick={onConnectClick}
              className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-brand to-brand-purple text-white font-bold text-sm flex items-center gap-2 transition-all shadow-lg hover:scale-105"
            >
              <Users className="w-4 h-4" />
              Connect
            </button>
          )}
        </div>

        <div className="mt-4 max-w-2xl">
          <h1 className="text-4xl font-extrabold text-white flex items-center gap-3 tracking-tight">
            {profile.fullName}
            {(profile.subscriptionTier === 'pro' || profile.subscriptionTier === 'elite' || profile.role === 'admin') && (
              <CheckCircle2 className="w-6 h-6 text-brand" />
            )}
          </h1>
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
          {(profile.subscriptionTier === 'pro' || profile.subscriptionTier === 'elite' || profile.role === 'admin') ? (
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
