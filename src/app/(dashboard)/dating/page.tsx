"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { getAllUsers, UserBasic } from "@/lib/services/users";
import { 
  getDatingProspects, 
  recordDatingAction, 
  getInterestedUsers, 
  getDatingMatches,
  reactivateExpiredMatch,
  getSharedCommunities,
  MatchDetail
} from "@/lib/services/dating";
import { calculateStardom } from "@/lib/services/gamification";
import { 
  Heart, X, Sparkles, Loader2, MessageCircleHeart, Lock, Crown, 
  Settings, LayoutGrid, Layers, MapPin, MoreHorizontal, Flag, 
  Volume2, ExternalLink, ChevronRight, ChevronLeft, User, MessageSquare, 
  Flame, CheckCircle2, Clock, RotateCcw, Users, Shield
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
  const [matchDetails, setMatchDetails] = useState<MatchDetail[]>([]);
  const [matchesLoading, setMatchesLoading] = useState(false);
  const [expiredDrawerOpen, setExpiredDrawerOpen] = useState(false);

  // Modals & Shared Circles
  const [matchModal, setMatchModal] = useState<UserBasic | null>(null);
  const [inspectingProspect, setInspectingProspect] = useState<UserBasic | null>(null);
  const [inspectingPhotoIndex, setInspectingPhotoIndex] = useState(0);
  const [sharedCircles, setSharedCircles] = useState<Array<{ id: string; name: string; category: string }>>([]);
  const [premiumLockOpen, setPremiumLockOpen] = useState(false);
  const [lockDetails, setLockDetails] = useState<{ title: string; desc: string }>({
    title: "Unlock Unlimited Dating Swipes",
    desc: "You've reached your daily free limit of swipes. Upgrade to Premium or level up your Stardom XP for more daily swipes!"
  });
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const isPremium = profile?.subscriptionTier === 'pro' || profile?.subscriptionTier === 'elite' || profile?.role === 'admin';
  const stardomProgress = calculateStardom(profile?.stardomXP || 0);
  const stardomLevel = stardomProgress.currentTier.level;

  // Tiered Stardom XP Swipe Allowance: Explorer (5), Insider/Connector (10), Buzzmaker/Trendsetter (20), Influencer+ (Unlimited)
  const dailySwipeLimit = (isPremium || stardomLevel >= 6)
    ? Infinity
    : stardomLevel >= 4
      ? 20
      : stardomLevel >= 2
        ? 10
        : 5;

  // Load swipes from local storage
  useEffect(() => {
    const dateKey = new Date().toISOString().split('T')[0];
    const saved = localStorage.getItem(`dating_swipes_${dateKey}`);
    if (saved) setSwipesToday(parseInt(saved, 10));
  }, []);

  // Fetch Shared Community Circles when inspecting a prospect
  useEffect(() => {
    if (!profile?.uid || !inspectingProspect?.uid) {
      setSharedCircles([]);
      return;
    }
    let active = true;
    getSharedCommunities(profile.uid, inspectingProspect.uid).then(res => {
      if (active && res.success) {
        setSharedCircles(res.shared);
      }
    });
    return () => { active = false; };
  }, [profile?.uid, inspectingProspect?.uid]);

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
      if (res.matchDetails) setMatchDetails(res.matchDetails);
    }
    setMatchesLoading(false);
  };

  const handleReactivateMatch = async (matchId: string, partnerName: string) => {
    const res = await reactivateExpiredMatch(matchId);
    if (res.success) {
      toast.success(`48-hour timer extended with ${partnerName}! Say hello now! ⚡`);
      fetchMatches();
    } else {
      toast.error("Could not reactivate match.");
    }
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

  const handleAction = async (action: 'like' | 'pass', specificProspectId?: string) => {
    if (!profile?.uid || isProcessing) return;
    
    // Check Stardom XP tiered swipe limits
    if (!specificProspectId && swipesToday >= dailySwipeLimit) {
      openLock(
        "Unlock Unlimited Dating Swipes",
        `You've used all ${dailySwipeLimit} of your daily ${stardomProgress.currentTier.title} swipes! Upgrade to Pro/Elite or reach Influencer rank for unlimited daily swipes.`
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
          setMatchDetails(prev => [
            {
              matchId: [profile.uid, currentProspect.uid].sort().join('_'),
              partner: currentProspect,
              createdAt: new Date(),
              hasMessaged: false,
              isExtended: false
            },
            ...prev.filter(m => m.partner.uid !== currentProspect.uid)
          ]);
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
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Rhockstar Dating</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-brand/20 text-brand border border-brand/30 uppercase">
                Verified
              </span>
              {profile.datingIncognito && isPremium && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase flex items-center gap-1">
                  <Shield className="w-3 h-3" /> Incognito Active
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-400 font-medium">Connect authentically with verified professionals.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
          {/* Stardom XP Swipe Allowance Indicator */}
          <div
            className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/10 flex items-center gap-1.5 text-xs font-bold text-slate-200 shadow-sm"
            title={`Stardom Rank: ${stardomProgress.currentTier.title}`}
          >
            <span>{stardomProgress.currentTier.badge}</span>
            <span className="text-brand">{stardomProgress.currentTier.title}:</span>
            <span>
              {dailySwipeLimit === Infinity ? 'Unlimited Swipes' : `${Math.max(0, dailySwipeLimit - swipesToday)}/${dailySwipeLimit} Swipes Left`}
            </span>
          </div>

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

      {/* ================= TAB 3: MUTUAL MATCHES (WITH 48H COUNTDOWN & EXPIRED DRAWER) ================= */}
      {activeTab === 'matches' && (() => {
        const nowMs = Date.now();
        const FORTY_EIGHT_HOURS_MS = 48 * 60 * 60 * 1000;

        // Enrich matches with countdown calculation
        const enrichedMatches = matches.map(m => {
          const detail = matchDetails.find(d => d.partner.uid === m.uid);
          const rawStart = detail?.lastExtendedAt || detail?.createdAt;
          const startMs = rawStart?.toDate ? rawStart.toDate().getTime() : rawStart ? new Date(rawStart).getTime() : nowMs;
          const elapsedMs = Math.max(0, nowMs - startMs);
          const remainingMs = Math.max(0, FORTY_EIGHT_HOURS_MS - elapsedMs);
          const hoursLeft = Math.ceil(remainingMs / (60 * 60 * 1000));
          const hasMessaged = Boolean(detail?.hasMessaged);
          const isExpired = !hasMessaged && remainingMs === 0;

          return {
            match: m,
            matchId: detail?.matchId || [profile.uid, m.uid].sort().join('_'),
            hasMessaged,
            hoursLeft,
            isExpired,
            isExtended: Boolean(detail?.isExtended)
          };
        });

        const activeMatchesList = enrichedMatches.filter(item => !item.isExpired);
        const expiredMatchesList = enrichedMatches.filter(item => item.isExpired);

        return (
          <div className="space-y-6">
            <div className="p-5 rounded-3xl bg-slate-900/60 border border-white/10 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                  <span>Mutual Matches</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-brand text-slate-950">
                    {activeMatchesList.length}
                  </span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  New matches have a 48-hour anti-ghosting timer—send a quick message to lock in your connection!
                </p>
              </div>
            </div>

            {matchesLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <Skeleton key={i} className="aspect-[4/5] rounded-3xl" />
                ))}
              </div>
            ) : activeMatchesList.length === 0 && expiredMatchesList.length === 0 ? (
              <EmptyState
                icon={MessageCircleHeart}
                title="No mutual matches yet"
                description="Keep discovering profiles or check who is interested in you to create your first match!"
              />
            ) : (
              <>
                {activeMatchesList.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
                    {activeMatchesList.map(({ match, hasMessaged, hoursLeft }) => (
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
                          
                          {/* 48-Hour Countdown / Bonded Status Badge */}
                          {hasMessaged ? (
                            <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md">
                              <CheckCircle2 className="w-3 h-3" /> Active Chat
                            </div>
                          ) : (
                            <div className={`absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md ${
                              hoursLeft > 24
                                ? 'bg-brand text-slate-950'
                                : hoursLeft > 12
                                  ? 'bg-amber-500 text-slate-950'
                                  : 'bg-rose-500 text-white animate-pulse'
                            }`}>
                              <Clock className="w-3 h-3" /> {hoursLeft}h left to say hi
                            </div>
                          )}

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

                {/* EXPIRED MATCHES DRAWER (1-Click Reactivate) */}
                {expiredMatchesList.length > 0 && (
                  <div className="mt-8 rounded-3xl bg-slate-900/50 border border-white/10 overflow-hidden">
                    <button
                      onClick={() => setExpiredDrawerOpen(!expiredDrawerOpen)}
                      className="w-full p-4 sm:p-5 flex items-center justify-between hover:bg-white/5 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                          <Clock className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                            <span>Expired Matches Drawer</span>
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/30">
                              {expiredMatchesList.length}
                            </span>
                          </h3>
                          <p className="text-xs text-slate-400">
                            48 hours passed without a message. Reactivate once to reopen the conversation window!
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-brand">
                        {expiredDrawerOpen ? 'Hide Drawer' : 'Open Drawer'}
                      </span>
                    </button>

                    {expiredDrawerOpen && (
                      <div className="p-4 sm:p-5 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {expiredMatchesList.map(({ match, matchId }) => (
                          <div
                            key={match.uid}
                            className="p-3.5 rounded-2xl bg-slate-950/70 border border-white/10 flex items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <UserAvatar src={match.avatar} name={match.fullName} className="w-12 h-12 rounded-xl shrink-0 opacity-75" />
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-white truncate">{match.fullName}</p>
                                <p className="text-xs text-slate-400 truncate">@{match.username}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleReactivateMatch(matchId, match.fullName)}
                              className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shrink-0 transition-all shadow-md"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Reactivate</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        );
      })()}

      {/* ================= DATING PROFILE DETAIL MODAL (Responsive Desktop & Mobile Inspector) ================= */}
      {inspectingProspect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg md:max-w-4xl lg:max-w-5xl bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[94vh] md:h-[88vh] max-h-[860px] relative animate-in zoom-in-95 duration-200">
            
            {/* Modal Top Header Bar */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-white/5 bg-slate-900/95 sticky top-0 z-20 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <h3 className="text-base sm:text-lg font-bold text-white truncate">{inspectingProspect.fullName}</h3>
                <VerifiedBadge tier={inspectingProspect.subscriptionTier} />
                <span className="text-xs font-semibold text-brand hidden sm:inline">@{inspectingProspect.username}</span>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/profile?uid=${inspectingProspect.uid}`}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors border border-white/5"
                >
                  <span>Social Profile</span>
                  <ExternalLink className="w-3.5 h-3.5 text-brand" />
                </Link>
                <button 
                  onClick={() => setInspectingProspect(null)} 
                  className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: Split 2-Column on Tablet/Desktop (md:grid-cols-12), Stacked on Mobile */}
            <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-0">
              
              {/* Left Column: Photos & Quick Actions (md:col-span-5 lg:col-span-5) */}
              <div className="md:col-span-5 lg:col-span-5 bg-slate-950/70 p-4 sm:p-5 flex flex-col justify-between border-b md:border-b-0 md:border-r border-white/5 overflow-y-auto no-scrollbar">
                <div className="space-y-3">
                  {/* Photo Viewer with Arrows */}
                  <div className="relative w-full aspect-[4/5] sm:aspect-[3/4] md:aspect-[4/5] rounded-3xl overflow-hidden bg-slate-800 shadow-2xl group">
                    {inspectingProspect.datingPhotos && inspectingProspect.datingPhotos.length > 0 ? (
                      <img 
                        src={inspectingProspect.datingPhotos[inspectingPhotoIndex] || inspectingProspect.datingPhotos[0]} 
                        alt={inspectingProspect.fullName}
                        className="w-full h-full object-cover transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-500">
                        <UserAvatar src={inspectingProspect.avatar} name={inspectingProspect.fullName} className="w-24 h-24" />
                      </div>
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

                    {/* Multi-photo Story Indicators */}
                    {inspectingProspect.datingPhotos && inspectingProspect.datingPhotos.length > 1 && (
                      <div className="absolute top-3 inset-x-0 flex justify-center gap-1.5 z-10 px-4">
                        {inspectingProspect.datingPhotos.map((_, idx) => (
                          <div 
                            key={idx}
                            onClick={() => setInspectingPhotoIndex(idx)}
                            className={`h-1.5 rounded-full flex-1 transition-all cursor-pointer ${
                              inspectingPhotoIndex === idx ? 'bg-white shadow-md' : 'bg-white/40 hover:bg-white/70'
                            }`}
                          />
                        ))}
                      </div>
                    )}

                    {/* Photo Navigation Arrows */}
                    {inspectingProspect.datingPhotos && inspectingProspect.datingPhotos.length > 1 && (
                      <>
                        {inspectingPhotoIndex > 0 && (
                          <button
                            onClick={(e) => { e.stopPropagation(); setInspectingPhotoIndex(prev => Math.max(0, prev - 1)); }}
                            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all backdrop-blur-sm border border-white/10 shadow-lg"
                            aria-label="Previous photo"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                        )}
                        {inspectingPhotoIndex < inspectingProspect.datingPhotos.length - 1 && (
                          <button
                            onClick={(e) => { e.stopPropagation(); setInspectingPhotoIndex(prev => Math.min(inspectingProspect.datingPhotos!.length - 1, prev + 1)); }}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all backdrop-blur-sm border border-white/10 shadow-lg"
                            aria-label="Next photo"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        )}
                      </>
                    )}

                    {/* Photo Index Counter Badge */}
                    {inspectingProspect.datingPhotos && inspectingProspect.datingPhotos.length > 1 && (
                      <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-bold bg-black/70 backdrop-blur text-white border border-white/10">
                        {inspectingPhotoIndex + 1} / {inspectingProspect.datingPhotos.length}
                      </span>
                    )}
                  </div>

                  {/* Thumbnail Row */}
                  {inspectingProspect.datingPhotos && inspectingProspect.datingPhotos.length > 1 && (
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                      {inspectingProspect.datingPhotos.map((photoUrl, idx) => (
                        <div 
                          key={idx}
                          onClick={() => setInspectingPhotoIndex(idx)}
                          className={`w-14 h-14 rounded-2xl overflow-hidden shrink-0 border-2 cursor-pointer transition-all ${
                            inspectingPhotoIndex === idx ? 'border-brand scale-105 shadow-md shadow-brand/20' : 'border-transparent opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img src={photoUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Left Desktop Action Bar */}
                <div className="hidden md:flex items-center gap-3 pt-4 border-t border-white/5">
                  <button 
                    onClick={() => handleAction('pass', inspectingProspect.uid)}
                    disabled={isProcessing}
                    className="flex-1 py-3 rounded-2xl bg-slate-800 hover:bg-rose-600/30 text-slate-300 hover:text-rose-300 font-extrabold text-xs transition-all flex items-center justify-center gap-2 border border-white/10"
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

              {/* Right Column: Profile Information Panel (md:col-span-7 lg:col-span-7) */}
              <div className="md:col-span-7 lg:col-span-7 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-5 custom-scrollbar bg-slate-900/40">
                {/* Identity & Badges Card */}
                <div className="p-5 rounded-3xl bg-slate-800/40 border border-white/5 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">{inspectingProspect.fullName}</h2>
                        <VerifiedBadge tier={inspectingProspect.subscriptionTier} />
                      </div>
                      <p className="text-sm font-semibold text-brand">@{inspectingProspect.username}</p>
                    </div>

                    {inspectingProspect.datingGoals && (
                      <span className="px-3.5 py-1.5 rounded-full text-xs font-black bg-brand/20 text-brand border border-brand/30 shrink-0 self-start">
                        🎯 {inspectingProspect.datingGoals}
                      </span>
                    )}
                  </div>

                  {inspectingProspect.headline && (
                    <p className="text-xs sm:text-sm font-semibold text-slate-200">
                      {inspectingProspect.headline}
                    </p>
                  )}

                  {inspectingProspect.location && (
                    <p className="text-xs text-slate-300 flex items-center gap-1.5 pt-1">
                      <MapPin className="w-4 h-4 text-brand shrink-0" />
                      <span>
                        {typeof inspectingProspect.location === 'object' 
                          ? [inspectingProspect.location.city, inspectingProspect.location.state, inspectingProspect.location.country].filter(Boolean).join(", ") 
                          : inspectingProspect.location}
                      </span>
                    </p>
                  )}
                </div>

                {/* Shared Community Circles ("Who's Connected") */}
                {sharedCircles.length > 0 && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-brand/10 border border-emerald-500/30 space-y-2.5">
                    <h4 className="text-xs font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Users className="w-4 h-4" />
                      <span>⚡ {sharedCircles.length} Shared Community {sharedCircles.length === 1 ? 'Circle' : 'Circles'}</span>
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {sharedCircles.map(circle => (
                        <span
                          key={circle.id}
                          className="px-3 py-1 rounded-xl bg-emerald-500/15 text-emerald-200 border border-emerald-500/30 text-xs font-bold"
                        >
                          {circle.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* About Me / Bio */}
                {inspectingProspect.bio && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-brand" />
                      <span>About Me</span>
                    </h4>
                    <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap bg-slate-800/30 p-4 sm:p-5 rounded-2xl border border-white/5">
                      {inspectingProspect.bio}
                    </p>
                  </div>
                )}

                {/* "Vibe Check" 15s Audio Icebreaker */}
                {(inspectingProspect.datingIcebreaker?.audioUrl || inspectingProspect.datingVoiceIntro) && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-brand/10 border border-brand/20 space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-black text-brand uppercase tracking-wider flex items-center gap-2">
                        <Volume2 className="w-4 h-4" />
                        <span>🎙️ Vibe Check Audio Icebreaker</span>
                      </h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand/20 text-brand">
                        Voice Note
                      </span>
                    </div>
                    {inspectingProspect.datingIcebreaker?.prompt && (
                      <p className="text-xs sm:text-sm font-bold text-white italic">
                        &ldquo;{inspectingProspect.datingIcebreaker.prompt}&rdquo;
                      </p>
                    )}
                    <audio
                      controls
                      src={inspectingProspect.datingIcebreaker?.audioUrl || inspectingProspect.datingVoiceIntro}
                      className="w-full h-10"
                    />
                  </div>
                )}

                {/* Conversation Starters / Prompts & Answers */}
                {inspectingProspect.datingPrompts && inspectingProspect.datingPrompts.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Conversation Starters</h4>
                    <div className="space-y-3">
                      {inspectingProspect.datingPrompts.map((p, idx) => (
                        <div key={idx} className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-800/70 to-slate-900 border border-white/10 space-y-1.5 shadow-sm">
                          <p className="text-xs font-bold text-brand">{p.prompt}</p>
                          <p className="text-sm sm:text-base font-semibold text-white leading-relaxed">{p.answer}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Interests & Passions */}
                {inspectingProspect.datingInterests && inspectingProspect.datingInterests.length > 0 && (
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Interests & Passions</h4>
                    <div className="flex flex-wrap gap-2">
                      {inspectingProspect.datingInterests.map((interest, idx) => (
                        <span key={idx} className="px-3.5 py-1.5 rounded-xl bg-slate-800/90 text-slate-200 text-xs font-medium border border-white/5 hover:border-brand/40 transition-colors">
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Full Social Profile CTA Banner */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-800/70 to-slate-900 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-white">Want to know them better?</p>
                    <p className="text-xs text-slate-400">View their career experience, education, portfolio, and published posts.</p>
                  </div>
                  <Link
                    href={`/profile?uid=${inspectingProspect.uid}`}
                    className="px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs transition-colors shrink-0 flex items-center justify-center gap-1.5"
                  >
                    <span>View Full Profile</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Mobile Bottom Action Bar (hidden on md/desktop) */}
            <div className="md:hidden p-3.5 bg-slate-950 border-t border-white/5 flex items-center justify-center gap-4 shrink-0">
              <button 
                onClick={() => handleAction('pass', inspectingProspect.uid)}
                disabled={isProcessing}
                className="flex-1 py-3 rounded-2xl bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white font-extrabold text-xs transition-all flex items-center justify-center gap-2 border border-white/10"
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
