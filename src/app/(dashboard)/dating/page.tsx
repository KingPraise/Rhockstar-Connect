"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { getAllUsers, UserBasic } from "@/lib/services/users";
import { 
  getDatingProspects, 
  recordDatingAction, 
  getInterestedUsers, 
  getDatingMatches 
} from "@/lib/services/dating";
import { 
  Heart, X, Sparkles, Loader2, MessageCircleHeart, Lock, Crown, 
  Settings, LayoutGrid, Layers, MapPin, MoreHorizontal, Flag, 
  Volume2, ExternalLink, ChevronRight, User, MessageSquare, 
  Flame, CheckCircle2 
} from "lucide-react";
import { getOrCreateChat } from "@/lib/services/messages";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import PremiumLockModal from "@/components/ui/PremiumLockModal";
import { useLightboxStore } from "@/store/useLightboxStore";
import { Skeleton } from "@/components/ui/Skeleton";
import UserAvatar from "@/components/ui/UserAvatar";
import VerifiedBadge from "@/components/ui/VerifiedBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import toast from "react-hot-toast";

export default function DatingPage() {
  const { profile } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "interested" ? "interested" : searchParams.get("tab") === "matches" ? "matches" : "discover";

  const { openLightbox } = useLightboxStore();
  
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'discover' | 'interested' | 'matches'>(initialTab);
  
  // Discover Prospects State
  const [prospects, setProspects] = useState<UserBasic[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'swipe'>('grid');
  const [animatingCard, setAnimatingCard] = useState<'like' | 'pass' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [swipesToday, setSwipesToday] = useState(0);

  // Admirers / Interested in You State
  const [admirers, setAdmirers] = useState<UserBasic[]>([]);
  const [admirersLoading, setAdmirersLoading] = useState(false);

  // Mutual Matches State
  const [matches, setMatches] = useState<UserBasic[]>([]);
  const [matchesLoading, setMatchesLoading] = useState(false);

  // Modals
  const [matchModal, setMatchModal] = useState<UserBasic | null>(null);
  const [inspectingProspect, setInspectingProspect] = useState<UserBasic | null>(null);
  const [inspectingPhotoIndex, setInspectingPhotoIndex] = useState(0);
  const [premiumLockOpen, setPremiumLockOpen] = useState(false);
  const [lockDetails, setLockDetails] = useState<{ title: string; desc: string }>({
    title: "Unlock Unlimited Dating Swipes",
    desc: "You've reached your daily free limit of 5 swipes. Upgrade to Premium for unlimited matches & swipes!"
  });
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  // Load swipes from local storage
  useEffect(() => {
    const dateKey = new Date().toISOString().split('T')[0];
    const saved = localStorage.getItem(`dating_swipes_${dateKey}`);
    if (saved) setSwipesToday(parseInt(saved, 10));
  }, []);

  // Fetch Discover Prospects
  const fetchProspects = async () => {
    if (!profile?.uid) return;
    setLoading(true);
    const usersRes = await getAllUsers();
    if (usersRes.success && usersRes.users) {
      const prospectsRes = await getDatingProspects(profile.uid, usersRes.users);
      if (prospectsRes.success && prospectsRes.prospects) {
        setProspects(prospectsRes.prospects);
      }
    }
    setLoading(false);
  };

  // Fetch Admirers (Interested in You)
  const fetchAdmirers = async () => {
    if (!profile?.uid) return;
    setAdmirersLoading(true);
    const res = await getInterestedUsers(profile.uid);
    if (res.success && res.admirers) {
      setAdmirers(res.admirers);
    }
    setAdmirersLoading(false);
  };

  // Fetch Mutual Matches
  const fetchMatches = async () => {
    if (!profile?.uid) return;
    setMatchesLoading(true);
    const res = await getDatingMatches(profile.uid);
    if (res.success && res.matches) {
      setMatches(res.matches);
    }
    setMatchesLoading(false);
  };

  useEffect(() => {
    if (profile?.uid) {
      fetchProspects();
      fetchAdmirers();
      fetchMatches();
    }
  }, [profile?.uid]);

  const openLock = (title: string, desc: string) => {
    setLockDetails({ title, desc });
    setPremiumLockOpen(true);
  };

  const isPremium = profile?.subscriptionTier === 'pro' || profile?.subscriptionTier === 'elite' || profile?.role === 'admin';

  const handleAction = async (action: 'like' | 'pass', specificProspectId?: string) => {
    if (!profile?.uid || isProcessing) return;
    
    // Check swipe limits (for discover swipe)
    if (!specificProspectId && (profile.subscriptionTier === 'free' || !profile.subscriptionTier) && swipesToday >= 5) {
      openLock(
        "Unlock Unlimited Dating Swipes",
        "You've reached your daily free limit of 5 swipes. Upgrade to Premium for unlimited matches & swipes!"
      );
      return;
    }
    
    setIsProcessing(true);
    
    if (!specificProspectId && prospects.length > 0) {
      setAnimatingCard(action);
    }
    
    // Update swipe count
    const newSwipes = swipesToday + 1;
    setSwipesToday(newSwipes);
    const dateKey = new Date().toISOString().split('T')[0];
    localStorage.setItem(`dating_swipes_${dateKey}`, newSwipes.toString());

    const targetUid = specificProspectId || (prospects.length > 0 ? prospects[0].uid : null);
    if (!targetUid) {
      setIsProcessing(false);
      return;
    }

    const currentProspect = prospects.find(p => p.uid === targetUid) || admirers.find(a => a.uid === targetUid);
    
    const executeAction = async () => {
      // Remove from prospects list
      setProspects(prev => prev.filter(p => p.uid !== targetUid));
      // Remove from admirers list if matched
      setAdmirers(prev => prev.filter(a => a.uid !== targetUid));

      setAnimatingCard(null);
      setIsProcessing(false);
      if (inspectingProspect?.uid === targetUid) {
        setInspectingProspect(null);
      }
      
      if (currentProspect) {
        const res = await recordDatingAction(profile.uid, currentProspect.uid, action);
        
        if (res.isMatch) {
          // Add to matches in memory
          setMatches(prev => [currentProspect, ...prev.filter(m => m.uid !== currentProspect.uid)]);
          setMatchModal(currentProspect);
          toast.success(`It's a Match with ${currentProspect.fullName}! 💖`, { icon: '🎉' });
        } else if (action === 'like') {
          toast.success(`Liked ${currentProspect.fullName}!`, { icon: '💖' });
        }
      }
    };

    if (!specificProspectId && viewMode === 'swipe') {
      setTimeout(executeAction, 300);
    } else {
      await executeAction();
    }
  };

  const currentProspect = prospects.length > 0 ? prospects[0] : null;

  if (loading || !profile) {
    return (
      <div className="flex-1 w-full max-w-5xl mx-auto p-4 lg:p-8 relative">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Skeleton className="w-14 h-14 rounded-2xl shrink-0" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-5 w-48" />
            </div>
          </div>
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
        <Skeleton className="h-16 w-full rounded-2xl mb-8" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="aspect-[4/5] rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto p-3 sm:p-4 lg:p-8 relative">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-brand-purple/20 to-brand/20 flex items-center justify-center border border-brand/30 shadow-lg shadow-brand/10 shrink-0">
            <Heart className="w-6 h-6 sm:w-7 sm:h-7 text-brand fill-brand" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Rhockstar Dating</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-brand/20 text-brand border border-brand/30 uppercase">
                Verified
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 font-medium">Connect authentically with verified professionals.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {activeTab === 'discover' && (
            <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-white/10">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-gradient-to-r from-brand to-brand-purple text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button 
                onClick={() => setViewMode('swipe')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'swipe' ? 'bg-gradient-to-r from-brand to-brand-purple text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                title="Swipe View"
              >
                <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          )}

          <button 
            onClick={() => router.push('/dating/profile')}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-white/10 flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Settings className="w-4 h-4 text-brand" />
            <span>My Dating Profile</span>
          </button>
        </div>
      </div>

      {/* TOP NAVIGATION TABS (Tinder / Hinge style) */}
      <div className="flex items-center gap-2 border-b border-white/10 mb-6 pb-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('discover')}
          className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
            activeTab === 'discover'
              ? 'bg-gradient-to-r from-brand to-brand-purple text-white shadow-lg shadow-brand/20'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Flame className="w-4 h-4" />
          <span>Discover</span>
          {prospects.length > 0 && (
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
              activeTab === 'discover' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300'
            }`}>
              {prospects.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('interested')}
          className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
            activeTab === 'interested'
              ? 'bg-gradient-to-r from-brand to-brand-purple text-white shadow-lg shadow-brand/20'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Interested in You</span>
          {admirers.length > 0 ? (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-rose-500 text-white animate-pulse">
              {admirers.length}
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-slate-800 text-slate-400">
              0
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('matches')}
          className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
            activeTab === 'matches'
              ? 'bg-gradient-to-r from-brand to-brand-purple text-white shadow-lg shadow-brand/20'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <MessageCircleHeart className="w-4 h-4" />
          <span>Matches</span>
          {matches.length > 0 && (
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
              activeTab === 'matches' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300'
            }`}>
              {matches.length}
            </span>
          )}
        </button>
      </div>

      {/* ================= TAB 1: DISCOVER ================= */}
      {activeTab === 'discover' && (
        <>
          {/* Quick Admirer Teaser Banner if there are pending admirers */}
          {admirers.length > 0 && (
            <div 
              onClick={() => setActiveTab('interested')}
              className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-rose-500/20 via-brand/20 to-purple-600/20 border border-brand/40 backdrop-blur-md flex items-center justify-between cursor-pointer transition-all hover:border-brand shadow-lg group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-500/20 border border-rose-500 flex items-center justify-center text-rose-400 shrink-0">
                  <Heart className="w-5 h-5 fill-rose-500 text-rose-500 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-sm flex items-center gap-1.5">
                    <span>{admirers.length} {admirers.length === 1 ? 'person is' : 'people are'} interested in you!</span>
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  </h3>
                  <p className="text-xs text-slate-300">Tap to see their profiles and match with them instantly.</p>
                </div>
              </div>
              <button className="px-3.5 py-1.5 rounded-xl bg-white text-slate-950 font-extrabold text-xs group-hover:scale-105 transition-transform shrink-0">
                View Likes
              </button>
            </div>
          )}

          {/* VIEW: SWIPE CAROUSEL */}
          {viewMode === 'swipe' ? (
            <div className="w-full flex justify-center py-2">
              <div className="relative w-full max-w-md h-[640px]">
                {prospects.length === 0 ? (
                  <div className="w-full h-full flex flex-col items-center justify-center neo-card bg-slate-900/60 border border-white/10 rounded-[3rem] p-8 text-center shadow-2xl">
                    <div className="w-20 h-20 rounded-full bg-brand/10 border border-brand/30 flex items-center justify-center mb-6">
                      <Heart className="w-10 h-10 text-brand" />
                    </div>
                    <h2 className="text-2xl font-black text-white mb-2">No more profiles today!</h2>
                    <p className="text-slate-400 text-sm max-w-xs mb-8">
                      You've reviewed everyone in your area. Check back soon or view who liked you!
                    </p>
                    <button 
                      onClick={() => setActiveTab('interested')}
                      className="px-6 py-3 rounded-2xl bg-gradient-to-r from-brand to-brand-purple text-white font-extrabold text-xs shadow-lg hover:opacity-90 transition-opacity"
                    >
                      See Who Liked You
                    </button>
                  </div>
                ) : (
                  currentProspect && (
                    <div 
                      className={`w-full h-full rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl relative flex flex-col bg-slate-900 transition-all duration-300 ${
                        animatingCard === 'like' ? 'translate-x-full rotate-12 opacity-0' :
                        animatingCard === 'pass' ? '-translate-x-full -rotate-12 opacity-0' : ''
                      }`}
                    >
                      {/* Photo Section */}
                      <div 
                        onClick={() => { setInspectingProspect(currentProspect); setInspectingPhotoIndex(0); }}
                        className="relative w-full h-[380px] bg-slate-800 cursor-pointer group"
                      >
                        {currentProspect.datingPhotos && currentProspect.datingPhotos.length > 0 ? (
                          <img 
                            src={currentProspect.datingPhotos[0]} 
                            alt={currentProspect.fullName}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                            <UserAvatar src={currentProspect.avatar} name={currentProspect.fullName} className="w-28 h-28 opacity-80" textClassName="text-5xl font-extrabold" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-black/30" />
                        
                        {/* Name & Headline overlay */}
                        <div className="absolute bottom-4 left-4 right-4 z-10">
                          <div className="flex items-center gap-2">
                            <h2 className="text-2xl font-black text-white leading-tight">{currentProspect.fullName}</h2>
                            <VerifiedBadge tier={currentProspect.subscriptionTier} />
                          </div>
                          <p className="text-sm font-semibold text-brand">@{currentProspect.username}</p>
                          {currentProspect.datingGoals && (
                            <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold bg-brand/20 text-brand border border-brand/30">
                              🎯 {currentProspect.datingGoals}
                            </span>
                          )}
                        </div>

                        <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-[11px] font-bold bg-black/60 backdrop-blur text-white border border-white/10">
                          Tap to view full profile
                        </span>
                      </div>

                      {/* Bio & Voice Note */}
                      <div className="p-5 flex-1 overflow-y-auto space-y-3 custom-scrollbar bg-slate-900">
                        {currentProspect.bio && (
                          <p className="text-sm text-slate-300 leading-relaxed line-clamp-3">
                            {currentProspect.bio}
                          </p>
                        )}

                        {currentProspect.datingVoiceIntro && (
                          <div className="p-3 rounded-xl bg-brand/10 border border-brand/20 flex items-center gap-3">
                            <Volume2 className="w-4 h-4 text-brand shrink-0" />
                            <audio controls src={currentProspect.datingVoiceIntro} className="w-full h-8" />
                          </div>
                        )}

                        <div className="pt-2 flex items-center justify-between text-xs">
                          <Link 
                            href={`/profile?uid=${currentProspect.uid}`}
                            className="text-brand hover:underline font-bold flex items-center gap-1"
                          >
                            <span>Open Social Profile & Posts</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => { setInspectingProspect(currentProspect); setInspectingPhotoIndex(0); }}
                            className="text-slate-400 hover:text-white font-semibold"
                          >
                            Read Full Dating Bio →
                          </button>
                        </div>
                      </div>

                      {/* Swipe Action Buttons */}
                      <div className="p-4 bg-slate-950/80 border-t border-white/5 flex items-center justify-center gap-6">
                        <button 
                          onClick={() => handleAction('pass')}
                          disabled={isProcessing}
                          className="w-14 h-14 rounded-full bg-slate-850 hover:bg-rose-600 text-slate-400 hover:text-white flex items-center justify-center transition-all shadow-lg hover:scale-110 active:scale-95 disabled:opacity-50 border border-white/10"
                          title="Pass"
                        >
                          <X className="w-7 h-7" />
                        </button>
                        <button 
                          onClick={() => handleAction('like')}
                          disabled={isProcessing}
                          className="w-14 h-14 rounded-full bg-gradient-to-r from-brand to-brand-purple text-white flex items-center justify-center transition-all shadow-[0_0_25px_rgba(236,72,153,0.4)] hover:scale-110 active:scale-95 disabled:opacity-50"
                          title="Like"
                        >
                          <Heart className="w-7 h-7 fill-white" />
                        </button>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          ) : (
            /* VIEW: GRID VIEW (Clickable Cards with direct profile inspection) */
            <div>
              {prospects.length === 0 ? (
                <EmptyState
                  icon={Heart}
                  title="No more dating profiles to explore!"
                  description="Check back soon as new members activate their dating profiles, or check the 'Interested in You' tab!"
                />
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
                  {prospects.map((prospect) => (
                    <div 
                      key={prospect.uid} 
                      className="neo-card bg-slate-900/60 border border-white/5 rounded-3xl overflow-hidden flex flex-col group hover:border-brand/40 transition-all duration-300 shadow-xl relative"
                    >
                      {/* Photo Container - Tapping opens dating profile details */}
                      <div 
                        onClick={() => { setInspectingProspect(prospect); setInspectingPhotoIndex(0); }}
                        className="w-full aspect-[4/5] bg-slate-800 relative overflow-hidden cursor-pointer"
                        title="Click to view profile & details"
                      >
                        {prospect.datingPhotos && prospect.datingPhotos.length > 0 ? (
                          <img 
                            src={prospect.datingPhotos[0]} 
                            alt={prospect.fullName} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                            <UserAvatar src={prospect.avatar} name={prospect.fullName} className="w-20 h-20 opacity-80" textClassName="text-3xl font-extrabold" />
                          </div>
                        )}
                        
                        {/* Gradient Overlay for Text */}
                        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent flex flex-col justify-end p-3.5">
                          <Link 
                            href={`/profile?uid=${prospect.uid}`}
                            onClick={(e) => e.stopPropagation()}
                            className="hover:underline flex items-center gap-1"
                          >
                            <h3 className="text-base sm:text-lg font-extrabold text-white leading-tight truncate">{prospect.fullName}</h3>
                            <VerifiedBadge tier={prospect.subscriptionTier} />
                          </Link>
                          <p className="text-xs font-semibold text-brand truncate">@{prospect.username}</p>
                        </div>
                        
                        {/* Context Menu Button */}
                        <div className="absolute top-2.5 right-2.5 z-30" onClick={(e) => e.stopPropagation()}>
                          <button 
                            onClick={(e) => { e.preventDefault(); setActiveMenu(activeMenu === prospect.uid ? null : prospect.uid); }}
                            className="w-8 h-8 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-white hover:bg-black/70 transition-colors border border-white/10"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                          
                          {activeMenu === prospect.uid && (
                            <div className="absolute right-0 mt-2 w-44 rounded-xl bg-slate-900 border border-white/10 shadow-2xl overflow-hidden z-40">
                              <Link 
                                href={`/profile?uid=${prospect.uid}`}
                                className="w-full px-3.5 py-2.5 text-left text-xs font-medium text-slate-200 hover:bg-slate-800 flex items-center gap-2"
                              >
                                <User className="w-3.5 h-3.5" /> Full Profile
                              </Link>
                              <button 
                                onClick={() => { setActiveMenu(null); toast.success("User reported."); }} 
                                className="w-full px-3.5 py-2.5 text-left text-xs text-slate-300 hover:bg-slate-800 flex items-center gap-2 border-t border-white/5"
                              >
                                <Flag className="w-3.5 h-3.5" /> Report User
                              </button>
                              <button 
                                onClick={() => { setActiveMenu(null); toast.success("User passed."); handleAction('pass', prospect.uid); }} 
                                className="w-full px-3.5 py-2.5 text-left text-xs text-rose-400 hover:bg-slate-800 flex items-center gap-2 border-t border-white/5"
                              >
                                <X className="w-3.5 h-3.5" /> Pass User
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Card Details & Actions */}
                      <div className="p-3 flex flex-col gap-2.5 flex-1 bg-slate-900">
                        {prospect.datingGoals && (
                          <div 
                            onClick={() => { setInspectingProspect(prospect); setInspectingPhotoIndex(0); }}
                            className="cursor-pointer"
                          >
                            <span className="inline-block text-[11px] font-bold px-2 py-0.5 bg-brand/10 text-brand rounded-lg border border-brand/20 truncate max-w-full">
                              🎯 {prospect.datingGoals}
                            </span>
                          </div>
                        )}

                        <div className="mt-auto pt-2 flex gap-2 border-t border-white/5">
                          <button 
                            onClick={() => handleAction('pass', prospect.uid)}
                            disabled={isProcessing}
                            className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-400 font-bold hover:bg-rose-600 hover:text-white transition-all disabled:opacity-50 flex items-center justify-center"
                            title="Pass"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleAction('like', prospect.uid)}
                            disabled={isProcessing}
                            className="flex-1 py-2 rounded-xl bg-gradient-to-r from-brand to-brand-purple text-white font-bold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center shadow-md shadow-brand/20"
                            title="Like"
                          >
                            <Heart className="w-4 h-4 fill-white" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ================= TAB 2: INTERESTED IN YOU (WHO LIKED ME) ================= */}
      {activeTab === 'interested' && (
        <div className="space-y-6">
          <div className="p-5 rounded-3xl bg-gradient-to-r from-rose-500/15 via-brand/15 to-purple-600/15 border border-brand/30 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                <span>Who Liked Your Profile</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-500 text-white">
                  {admirers.length}
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                These members tapped Like on your profile. Like them back to match and start chatting instantly!
              </p>
            </div>
            <button
              onClick={() => setActiveTab('discover')}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-white/10 self-start sm:self-auto transition-colors"
            >
              Browse Discover
            </button>
          </div>

          {admirersLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="aspect-[4/5] rounded-3xl" />
              ))}
            </div>
          ) : admirers.length === 0 ? (
            <div className="neo-card p-12 text-center flex flex-col items-center justify-center bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-3xl shadow-xl">
              <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mb-4 border border-rose-500/20">
                <Heart className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No new admirers yet!</h3>
              <p className="text-slate-400 text-sm max-w-md leading-relaxed mb-6">
                Keep your dating profile active with updated photos, voice notes, and fun prompts to stand out to more members.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => router.push('/dating/profile')}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 text-white font-bold text-xs border border-white/10 hover:bg-slate-700 transition-colors"
                >
                  Enhance My Dating Profile
                </button>
                <button
                  onClick={() => setActiveTab('discover')}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand to-brand-purple text-white font-bold text-xs shadow-lg hover:opacity-90 transition-opacity"
                >
                  Explore Profiles
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
              {admirers.map((admirer) => (
                <div 
                  key={admirer.uid}
                  className="neo-card bg-slate-900/60 border border-brand/30 rounded-3xl overflow-hidden flex flex-col shadow-xl hover:border-brand transition-all group"
                >
                  <div 
                    onClick={() => { setInspectingProspect(admirer); setInspectingPhotoIndex(0); }}
                    className="w-full aspect-[4/5] bg-slate-800 relative overflow-hidden cursor-pointer"
                  >
                    {admirer.datingPhotos && admirer.datingPhotos.length > 0 ? (
                      <img 
                        src={admirer.datingPhotos[0]} 
                        alt={admirer.fullName} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                        <UserAvatar src={admirer.avatar} name={admirer.fullName} className="w-20 h-20 opacity-80" textClassName="text-3xl font-extrabold" />
                      </div>
                    )}
                    
                    <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-rose-500 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md">
                      <Heart className="w-3 h-3 fill-white" /> Liked You
                    </div>

                    <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent flex flex-col justify-end p-3.5">
                      <h3 className="text-base sm:text-lg font-extrabold text-white leading-tight truncate">{admirer.fullName}</h3>
                      <p className="text-xs font-semibold text-brand truncate">@{admirer.username}</p>
                    </div>
                  </div>

                  <div className="p-3 flex flex-col gap-2.5 flex-1 bg-slate-900">
                    {admirer.datingGoals && (
                      <span className="text-[11px] font-bold px-2 py-0.5 bg-brand/10 text-brand rounded-lg border border-brand/20 truncate">
                        🎯 {admirer.datingGoals}
                      </span>
                    )}

                    <div className="mt-auto pt-2 flex gap-2">
                      <button 
                        onClick={() => handleAction('pass', admirer.uid)}
                        disabled={isProcessing}
                        className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:bg-slate-700 transition-colors"
                        title="Pass"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleAction('like', admirer.uid)}
                        disabled={isProcessing}
                        className="flex-1 py-2 rounded-xl bg-gradient-to-r from-brand to-brand-purple text-white font-extrabold text-xs shadow-md shadow-brand/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-1.5"
                      >
                        <Heart className="w-3.5 h-3.5 fill-white" />
                        <span>Match Back</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 3: MUTUAL MATCHES ================= */}
      {activeTab === 'matches' && (
        <div className="space-y-6">
          <div className="p-5 rounded-3xl bg-slate-900/60 border border-white/10 shadow-xl flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                <span>Mutual Matches</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-brand text-slate-950">
                  {matches.length}
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                You both liked each other! Start a conversation and get to know each other.
              </p>
            </div>
          </div>

          {matchesLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="aspect-[4/5] rounded-3xl" />
              ))}
            </div>
          ) : matches.length === 0 ? (
            <EmptyState
              icon={MessageCircleHeart}
              title="No mutual matches yet"
              description="Keep discovering profiles or check who is interested in you to create your first match!"
            />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
              {matches.map((match) => (
                <div 
                  key={match.uid}
                  className="neo-card bg-slate-900/60 border border-white/5 rounded-3xl overflow-hidden flex flex-col shadow-xl hover:border-brand/40 transition-all group"
                >
                  <div 
                    onClick={() => { setInspectingProspect(match); setInspectingPhotoIndex(0); }}
                    className="w-full aspect-[4/5] bg-slate-800 relative overflow-hidden cursor-pointer"
                  >
                    {match.datingPhotos && match.datingPhotos.length > 0 ? (
                      <img 
                        src={match.datingPhotos[0]} 
                        alt={match.fullName} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                        <UserAvatar src={match.avatar} name={match.fullName} className="w-20 h-20 opacity-80" textClassName="text-3xl font-extrabold" />
                      </div>
                    )}
                    
                    <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-brand text-slate-950 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md">
                      <Sparkles className="w-3 h-3" /> Matched
                    </div>

                    <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent flex flex-col justify-end p-3.5">
                      <h3 className="text-base sm:text-lg font-extrabold text-white leading-tight truncate">{match.fullName}</h3>
                      <p className="text-xs font-semibold text-brand truncate">@{match.username}</p>
                    </div>
                  </div>

                  <div className="p-3 flex flex-col gap-2.5 bg-slate-900">
                    <button 
                      onClick={() => router.push(`/messages?user=${match.uid}`)}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-brand to-brand-purple text-white font-extrabold text-xs shadow-md shadow-brand/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-1.5"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Chat Now</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= DATING PROFILE DETAIL MODAL (Tinder / Hinge Style Inspector) ================= */}
      {inspectingProspect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] relative animate-in zoom-in-95 duration-200">
            
            {/* Modal Header Bar */}
            <div className="flex items-center justify-between p-4 border-b border-white/5 bg-slate-900/90 sticky top-0 z-20">
              <div className="flex items-center gap-2 min-w-0">
                <h3 className="text-base font-bold text-white truncate">{inspectingProspect.fullName}</h3>
                <VerifiedBadge tier={inspectingProspect.subscriptionTier} />
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/profile?uid=${inspectingProspect.uid}`}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors border border-white/5"
                >
                  <span>Social Profile</span>
                  <ExternalLink className="w-3.5 h-3.5 text-brand" />
                </Link>
                <button 
                  onClick={() => setInspectingProspect(null)} 
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Profile Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar">
              
              {/* Photo Carousel */}
              {inspectingProspect.datingPhotos && inspectingProspect.datingPhotos.length > 0 ? (
                <div className="space-y-2">
                  <div className="w-full aspect-[4/5] rounded-3xl overflow-hidden bg-slate-800 relative shadow-xl">
                    <img 
                      src={inspectingProspect.datingPhotos[inspectingPhotoIndex] || inspectingProspect.datingPhotos[0]} 
                      alt={inspectingProspect.fullName}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Multi-photo indicator dots */}
                    {inspectingProspect.datingPhotos.length > 1 && (
                      <div className="absolute top-3 inset-x-0 flex justify-center gap-1.5 z-10 px-4">
                        {inspectingProspect.datingPhotos.map((_, idx) => (
                          <div 
                            key={idx}
                            onClick={() => setInspectingPhotoIndex(idx)}
                            className={`h-1.5 rounded-full flex-1 transition-all cursor-pointer ${
                              inspectingPhotoIndex === idx ? 'bg-white shadow-md' : 'bg-white/40'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Thumbnail Selector */}
                  {inspectingProspect.datingPhotos.length > 1 && (
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                      {inspectingProspect.datingPhotos.map((photoUrl, idx) => (
                        <div 
                          key={idx}
                          onClick={() => setInspectingPhotoIndex(idx)}
                          className={`w-14 h-14 rounded-xl overflow-hidden shrink-0 border-2 cursor-pointer transition-all ${
                            inspectingPhotoIndex === idx ? 'border-brand scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img src={photoUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : null}

              {/* Identity & Badges */}
              <div className="p-4 rounded-2xl bg-slate-800/40 border border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-white leading-tight">{inspectingProspect.fullName}</h2>
                    <p className="text-sm font-semibold text-brand">@{inspectingProspect.username}</p>
                  </div>
                  {inspectingProspect.datingGoals && (
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-brand/20 text-brand border border-brand/30">
                      🎯 {inspectingProspect.datingGoals}
                    </span>
                  )}
                </div>
                
                {inspectingProspect.location && (
                  <p className="text-xs text-slate-300 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {typeof inspectingProspect.location === 'object' 
                        ? [inspectingProspect.location.city, inspectingProspect.location.country].filter(Boolean).join(", ") 
                        : inspectingProspect.location}
                    </span>
                  </p>
                )}
              </div>

              {/* Bio */}
              {inspectingProspect.bio && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">About Me</h4>
                  <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap bg-slate-800/30 p-4 rounded-2xl border border-white/5">
                    {inspectingProspect.bio}
                  </p>
                </div>
              )}

              {/* Voice Intro Note */}
              {inspectingProspect.datingVoiceIntro && (
                <div className="p-4 rounded-2xl bg-brand/10 border border-brand/20 space-y-2">
                  <h4 className="text-xs font-bold text-brand uppercase tracking-wider flex items-center gap-2">
                    <Volume2 className="w-4 h-4" />
                    <span>Voice Intro</span>
                  </h4>
                  <audio controls src={inspectingProspect.datingVoiceIntro} className="w-full h-9" />
                </div>
              )}

              {/* Prompts & Answers (Hinge Style) */}
              {inspectingProspect.datingPrompts && inspectingProspect.datingPrompts.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Conversation Starters</h4>
                  {inspectingProspect.datingPrompts.map((p, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-gradient-to-br from-slate-800/60 to-slate-900 border border-white/10 space-y-1">
                      <p className="text-xs font-bold text-brand">{p.prompt}</p>
                      <p className="text-sm font-semibold text-white leading-relaxed">{p.answer}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Dating Interests Tags */}
              {inspectingProspect.datingInterests && inspectingProspect.datingInterests.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Interests & Passions</h4>
                  <div className="flex flex-wrap gap-2">
                    {inspectingProspect.datingInterests.map((interest, idx) => (
                      <span key={idx} className="px-3 py-1 rounded-xl bg-slate-800 text-slate-200 text-xs font-medium border border-white/5">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Full Social Profile CTA */}
              <div className="p-4 rounded-2xl bg-slate-800/50 border border-white/5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white">Want to see more?</p>
                  <p className="text-[11px] text-slate-400">View education, career background, and recent posts.</p>
                </div>
                <Link
                  href={`/profile?uid=${inspectingProspect.uid}`}
                  className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs transition-colors shrink-0"
                >
                  View Profile & Posts
                </Link>
              </div>
            </div>

            {/* Modal Bottom Action Bar */}
            <div className="p-4 bg-slate-950 border-t border-white/5 flex items-center justify-center gap-6 shrink-0">
              <button 
                onClick={() => handleAction('pass', inspectingProspect.uid)}
                disabled={isProcessing}
                className="flex-1 py-3 rounded-2xl bg-slate-850 hover:bg-rose-600 text-slate-300 hover:text-white font-extrabold text-xs transition-all flex items-center justify-center gap-2 border border-white/10"
              >
                <X className="w-4 h-4" />
                <span>Pass</span>
              </button>
              <button 
                onClick={() => handleAction('like', inspectingProspect.uid)}
                disabled={isProcessing}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-brand to-brand-purple text-white font-extrabold text-xs shadow-lg shadow-brand/30 hover:opacity-95 transition-all flex items-center justify-center gap-2"
              >
                <Heart className="w-4 h-4 fill-white" />
                <span>Like Profile</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MATCH CELEBRATION MODAL ================= */}
      {matchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="neo-card p-8 sm:p-10 bg-slate-900 border border-brand/50 rounded-3xl max-w-sm w-full text-center shadow-[0_0_50px_rgba(236,72,153,0.4)] relative animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 rounded-full bg-brand/20 border-2 border-brand flex items-center justify-center mx-auto mb-6 shadow-lg shadow-brand/30">
              <Heart className="w-10 h-10 text-brand fill-brand animate-pulse" />
            </div>
            
            <h2 className="text-3xl font-black text-white mb-2 font-outfit">It&apos;s a Match! 💖</h2>
            <p className="text-slate-300 text-sm mb-6 leading-relaxed">
              You and <strong className="text-white">{matchModal.fullName}</strong> are both interested in each other!
            </p>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => router.push(`/messages?user=${matchModal.uid}`)}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand to-brand-purple text-white font-extrabold text-sm shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Say Hello in Messages</span>
              </button>
              <button 
                onClick={() => setMatchModal(null)}
                className="w-full py-3 rounded-2xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700 transition-colors"
              >
                Keep Exploring
              </button>
            </div>
          </div>
        </div>
      )}

      <PremiumLockModal
        isOpen={premiumLockOpen}
        onClose={() => setPremiumLockOpen(false)}
        title={lockDetails.title}
        description={lockDetails.desc}
      />
    </div>
  );
}
