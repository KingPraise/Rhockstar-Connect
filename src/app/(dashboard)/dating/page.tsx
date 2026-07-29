"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { getAllUsers, UserBasic } from "@/lib/services/users";
import { getDatingProspects, recordDatingAction } from "@/lib/services/dating";
import { Heart, X, Sparkles, Loader2, MessageCircleHeart, Lock, Crown, Eye, Settings, LayoutGrid, Layers, MapPin } from "lucide-react";
import { getOrCreateChat } from "@/lib/services/messages";
import { useRouter } from "next/navigation";
import PremiumLockModal from "@/components/ui/PremiumLockModal";

export default function DatingPage() {
  const { profile } = useAuthStore();
  const router = useRouter();
  const [prospects, setProspects] = useState<UserBasic[]>([]);
  const [loading, setLoading] = useState(true);
  const [matchModal, setMatchModal] = useState<UserBasic | null>(null);
  const [viewMode, setViewMode] = useState<'swipe' | 'grid'>('swipe');
  const [animatingCard, setAnimatingCard] = useState<'like' | 'pass' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [swipesToday, setSwipesToday] = useState(0);
  const [premiumLockOpen, setPremiumLockOpen] = useState(false);
  const [lockDetails, setLockDetails] = useState<{ title: string; desc: string }>({
    title: "Unlock Unlimited Dating Swipes",
    desc: "You've reached your daily free limit of 5 swipes. Upgrade to Premium for unlimited matches & swipes!"
  });

  useEffect(() => {
    // Load swipes from local storage for today
    const dateKey = new Date().toISOString().split('T')[0];
    const saved = localStorage.getItem(`dating_swipes_${dateKey}`);
    if (saved) setSwipesToday(parseInt(saved, 10));

    const fetchProspects = async () => {
      if (!profile?.uid) return;
      
      const usersRes = await getAllUsers();
      if (usersRes.success && usersRes.users) {
        const prospectsRes = await getDatingProspects(profile.uid, usersRes.users);
        if (prospectsRes.success && prospectsRes.prospects) {
          setProspects(prospectsRes.prospects);
        }
      }
      setLoading(false);
    };
    
    fetchProspects();
  }, [profile?.uid]);

  const openLock = (title: string, desc: string) => {
    setLockDetails({ title, desc });
    setPremiumLockOpen(true);
  };

  const handleAction = async (action: 'like' | 'pass', specificProspectId?: string) => {
    if (!profile?.uid || prospects.length === 0 || isProcessing) return;
    
    // Check premium limits
    if ((profile.subscriptionTier === 'free' || !profile.subscriptionTier) && swipesToday >= 5) {
      openLock(
        "Unlock Unlimited Dating Swipes",
        "You've reached your daily free limit of 5 swipes. Upgrade to Premium for unlimited matches & swipes!"
      );
      return;
    }
    
    setIsProcessing(true);
    
    // If specificProspectId is provided (from Grid view), don't animate the main swipe card
    if (!specificProspectId) {
      setAnimatingCard(action);
    }
    
    // Update swipe count
    const newSwipes = swipesToday + 1;
    setSwipesToday(newSwipes);
    const dateKey = new Date().toISOString().split('T')[0];
    localStorage.setItem(`dating_swipes_${dateKey}`, newSwipes.toString());

    const prospectTargetId = specificProspectId || prospects[0].uid;
    const currentProspect = prospects.find(p => p.uid === prospectTargetId);
    
    // Function to execute the action
    const executeAction = async () => {
      setProspects(prev => prev.filter(p => p.uid !== prospectTargetId));
      setAnimatingCard(null);
      setIsProcessing(false);
      
      if (currentProspect) {
        const res = await recordDatingAction(profile.uid, currentProspect.uid, action);
        
        if (res.isMatch) {
          // Automatically create a chat for them
          await getOrCreateChat(profile.uid, currentProspect.uid);
          setMatchModal(currentProspect);
        }
      }
    };

    if (!specificProspectId) {
      // Animate out for 300ms before removing in Swipe view
      setTimeout(executeAction, 300);
    } else {
      // Execute immediately in Grid view
      await executeAction();
    }
  };

  const currentProspect = prospects.length > 0 ? prospects[0] : null;

  if (loading || !profile) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-100px)]">
        <Loader2 className="w-10 h-10 animate-spin text-brand-purple" />
      </div>
    );
  }

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto p-4 lg:p-8 relative">
      
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-purple/20 to-brand/20 flex items-center justify-center border border-white/5">
            <Heart className="w-7 h-7 text-brand-purple fill-brand-purple" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Rhockstar Dating</h1>
            <p className="text-slate-400 font-medium">Connect with professionals on a deeper level.</p>
          </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* View Mode Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-white/5">
            <button 
              onClick={() => setViewMode('swipe')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'swipe' ? 'bg-brand-purple text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
              title="Swipe View"
            >
              <Layers className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-brand-purple text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
              title="Grid View"
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
          </div>

          <button 
            onClick={() => router.push('/dating/profile')}
            className="neo-button flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Dating Profile</span>
          </button>
        </div>
      </div>

      {/* WHO LIKED YOU - PREMIUM LOCKED BANNER */}
      <div 
        onClick={() => openLock("See Who Liked Your Profile", "Upgrade to Premium or Elite to see who already liked your profile and match with them instantly!")}
        className="mb-8 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-brand-purple/10 border border-amber-500/30 backdrop-blur-md flex items-center justify-between cursor-pointer hover:border-amber-500/60 transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className="relative flex -space-x-3">
            <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-amber-500/50 flex items-center justify-center font-extrabold text-amber-400 text-xs blur-[2px]">
              ?
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-rose-500/50 flex items-center justify-center font-extrabold text-rose-400 text-xs blur-[2px]">
              ?
            </div>
            <div className="w-10 h-10 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-amber-400 font-bold">
              <Lock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="font-extrabold text-white text-sm flex items-center gap-1.5">
              <span>See Who Liked You</span>
              <Crown className="w-3.5 h-3.5 text-amber-400" />
            </h3>
            <p className="text-xs text-slate-400">2 people already liked your dating profile today</p>
          </div>
        </div>

        <button className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs group-hover:scale-105 transition-transform flex items-center gap-1">
          <Eye className="w-3.5 h-3.5" /> Unlock Now
        </button>
      </div>

      {/* CONTENT AREA */}
      {prospects.length === 0 ? (
        <div className="neo-card w-full max-w-md mx-auto min-h-[400px] p-10 flex flex-col items-center justify-center text-center bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-[3rem]">
          <Sparkles className="w-16 h-16 text-brand-purple mb-6 opacity-50" />
          <h2 className="text-2xl font-bold text-white mb-2">You&apos;re all caught up!</h2>
          <p className="text-slate-400">Check back later for new potential matches in your professional network.</p>
        </div>
      ) : viewMode === 'swipe' ? (
        /* SWIPE STACK */
        <div className="relative w-full max-w-md mx-auto h-[650px] flex items-center justify-center">
          <div className="relative w-full h-full">
            {/* NEXT CARD (Background) */}
            {prospects.length > 1 && (
              <div className="absolute inset-0 bg-slate-900 border border-white/5 rounded-[3rem] shadow-2xl scale-95 opacity-50 translate-y-4 pointer-events-none transition-all duration-300">
                 <div className="w-full h-full flex items-center justify-center">
                   <div className="w-32 h-32 rounded-full bg-gradient-to-br from-brand to-brand-purple opacity-20 blur-xl" />
                 </div>
              </div>
            )}
            
            {/* CURRENT CARD */}
            {currentProspect && (
              <div 
                className={`absolute inset-0 neo-card bg-slate-900 border border-white/10 rounded-[3rem] flex flex-col transition-all duration-300 shadow-2xl z-10 overflow-hidden ${
                  animatingCard === 'like' ? 'translate-x-full opacity-0 rotate-12' : 
                  animatingCard === 'pass' ? '-translate-x-full opacity-0 -rotate-12' : 
                  'translate-x-0 opacity-100 rotate-0'
                }`}
              >
                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto pb-32 hide-scrollbar">
                  {/* Main Photo / Avatar Area */}
                  <div className="w-full aspect-[3/4] bg-slate-800 relative">
                    {currentProspect.datingPhotos && currentProspect.datingPhotos.length > 0 ? (
                      <img src={currentProspect.datingPhotos[0]} alt="Dating Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                         <div className="w-32 h-32 rounded-full bg-gradient-to-br from-brand-purple to-brand flex items-center justify-center shadow-[0_0_50px_rgba(168,85,247,0.3)]">
                          <span className="text-5xl font-extrabold text-white">{currentProspect.avatar}</span>
                         </div>
                      </div>
                    )}
                    
                    {/* Gradient Overlay for Text */}
                    <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent flex flex-col justify-end p-6">
                      <h2 className="text-3xl font-extrabold text-white mb-1 tracking-tight flex items-center gap-2">
                        {currentProspect.fullName}
                      </h2>
                      <p className="text-brand-purple font-medium text-lg">@{currentProspect.username}</p>
                      
                      {currentProspect.datingGoals && (
                        <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-white/10 backdrop-blur text-white text-xs font-bold border border-white/10 self-start">
                          🎯 {currentProspect.datingGoals}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Extended Info */}
                  <div className="p-6 flex flex-col gap-6 bg-slate-900">
                    
                    {currentProspect.bio && (
                      <div>
                        <h3 className="text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider">About Me</h3>
                        <p className="text-white text-lg font-medium leading-relaxed">{currentProspect.bio}</p>
                      </div>
                    )}

                    {currentProspect.datingVoiceIntro && (
                      <div className="p-4 rounded-2xl bg-brand-purple/10 border border-brand-purple/20">
                        <h3 className="text-sm font-bold text-brand-purple mb-2 flex items-center gap-2">
                           Voice Intro
                        </h3>
                        <audio controls src={currentProspect.datingVoiceIntro} className="w-full h-10" />
                      </div>
                    )}

                    {currentProspect.datingInterests && currentProspect.datingInterests.length > 0 && (
                      <div>
                        <h3 className="text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider">Interests</h3>
                        <div className="flex flex-wrap gap-2">
                          {currentProspect.datingInterests.map((interest: string, i: number) => (
                            <span key={i} className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-sm border border-white/5">
                              {interest}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {currentProspect.datingPrompts && currentProspect.datingPrompts.length > 0 && (
                      <div className="flex flex-col gap-4">
                        {currentProspect.datingPrompts.map((p, i) => (
                          <div key={i} className="p-4 rounded-2xl bg-slate-800/50 border border-white/5">
                            <p className="text-sm font-bold text-brand-purple mb-1">{p.prompt}</p>
                            <p className="text-white text-lg font-medium">{p.answer}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Additional Photos */}
                    {currentProspect.datingPhotos && currentProspect.datingPhotos.length > 1 && (
                      <div className="flex flex-col gap-4">
                         {currentProspect.datingPhotos.slice(1).map((photoUrl, i) => (
                           <div key={i} className="w-full aspect-square rounded-3xl overflow-hidden border border-white/5">
                             <img src={photoUrl} alt={`Dating Photo ${i+2}`} className="w-full h-full object-cover" />
                           </div>
                         ))}
                      </div>
                    )}
                    
                  </div>
                </div>

                {/* Fixed Action Buttons (Overlay at bottom) */}
                <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-slate-900 via-slate-900/90 to-transparent pointer-events-none flex items-end justify-center pb-8 z-20">
                  <div className="flex items-center justify-center gap-6 pointer-events-auto">
                    <button 
                      onClick={() => handleAction('pass')}
                      disabled={isProcessing}
                      className="w-16 h-16 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-lg hover:scale-110 disabled:opacity-50"
                    >
                      <X className="w-8 h-8" />
                    </button>
                    <button 
                      onClick={() => handleAction('like')}
                      disabled={isProcessing}
                      className="w-16 h-16 rounded-full bg-brand-purple text-white flex items-center justify-center hover:bg-brand transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:scale-110 disabled:opacity-50"
                    >
                      <Heart className="w-8 h-8 fill-white" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in zoom-in-95 duration-300">
          {prospects.map((prospect) => (
            <div key={prospect.uid} className="neo-card bg-slate-900/60 border border-white/5 rounded-3xl overflow-hidden flex flex-col group hover:border-brand-purple/30 transition-all duration-300">
              <div className="w-full aspect-[4/5] bg-slate-800 relative overflow-hidden">
                {prospect.datingPhotos && prospect.datingPhotos.length > 0 ? (
                  <img src={prospect.datingPhotos[0]} alt={prospect.fullName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                    <span className="text-4xl font-extrabold text-white opacity-50">{prospect.avatar}</span>
                  </div>
                )}
                
                {/* Gradient Overlay for Text */}
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-900 to-transparent flex flex-col justify-end p-4">
                  <h3 className="text-xl font-extrabold text-white leading-tight">{prospect.fullName}</h3>
                  <p className="text-sm font-medium text-brand-purple">@{prospect.username}</p>
                </div>
              </div>

              <div className="p-4 flex flex-col gap-4 flex-1 bg-slate-900">
                <div className="flex flex-wrap gap-2">
                  {prospect.location && typeof prospect.location === 'object' && prospect.location.city && (
                    <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 bg-slate-800 rounded-lg text-slate-300 border border-white/5">
                      <MapPin className="w-3 h-3" /> {prospect.location.city}
                    </span>
                  )}
                  {prospect.datingGoals && (
                    <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 bg-brand-purple/10 text-brand-purple rounded-lg border border-brand-purple/20">
                      🎯 {prospect.datingGoals}
                    </span>
                  )}
                </div>

                <div className="mt-auto pt-4 flex gap-3 border-t border-white/5">
                  <button 
                    onClick={() => handleAction('pass', prospect.uid)}
                    disabled={isProcessing}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-400 font-bold hover:bg-red-500 hover:text-white transition-all disabled:opacity-50 flex items-center justify-center"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => handleAction('like', prospect.uid)}
                    disabled={isProcessing}
                    className="flex-1 py-2.5 rounded-xl bg-brand-purple/10 text-brand-purple font-bold hover:bg-brand-purple hover:text-white transition-all border border-brand-purple/20 hover:border-transparent disabled:opacity-50 flex items-center justify-center"
                  >
                    <Heart className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MATCH MODAL */}
      {matchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <div className="neo-card p-10 bg-slate-900/90 border border-brand-purple/50 rounded-3xl max-w-sm w-full relative z-10 text-center shadow-[0_0_50px_rgba(168,85,247,0.3)] animate-in zoom-in duration-300">
            <MessageCircleHeart className="w-20 h-20 text-brand-purple mx-auto mb-6 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
            
            <h2 className="text-4xl font-extrabold text-white mb-2 font-outfit">It&apos;s a Match!</h2>
            <p className="text-slate-300 mb-8 font-medium">You and {matchModal.fullName} have liked each other.</p>
            
            <div className="flex gap-4">
              <button 
                onClick={() => setMatchModal(null)}
                className="flex-1 py-3 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-700 transition-colors"
              >
                Keep Swiping
              </button>
              <button 
                onClick={() => router.push('/messages')}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-brand to-brand-purple text-white font-bold shadow-lg hover:scale-105 transition-all"
              >
                Say Hello
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
