"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { getAllUsers, UserBasic } from "@/lib/services/users";
import { getDatingProspects, recordDatingAction } from "@/lib/services/dating";
import { Heart, X, Sparkles, Loader2, MessageCircleHeart, Lock, Crown, Eye } from "lucide-react";
import { getOrCreateChat } from "@/lib/services/messages";
import { useRouter } from "next/navigation";
import PremiumLockModal from "@/components/ui/PremiumLockModal";

export default function DatingPage() {
  const { profile } = useAuthStore();
  const router = useRouter();
  const [prospects, setProspects] = useState<UserBasic[]>([]);
  const [loading, setLoading] = useState(true);
  const [matchModal, setMatchModal] = useState<UserBasic | null>(null);
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

  const handleAction = async (action: 'like' | 'pass') => {
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
    setAnimatingCard(action);
    
    // Update swipe count
    const newSwipes = swipesToday + 1;
    setSwipesToday(newSwipes);
    const dateKey = new Date().toISOString().split('T')[0];
    localStorage.setItem(`dating_swipes_${dateKey}`, newSwipes.toString());

    const currentProspect = prospects[0];
    
    // Animate out for 300ms before removing
    setTimeout(async () => {
      setProspects(prev => prev.slice(1));
      setAnimatingCard(null);
      setIsProcessing(false);
      
      const res = await recordDatingAction(profile.uid, currentProspect.uid, action);
      
      if (res.isMatch) {
        // Automatically create a chat for them
        await getOrCreateChat(profile.uid, currentProspect.uid);
        setMatchModal(currentProspect);
      }
    }, 300);
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

      {/* SWIPE STACK */}
      <div className="relative w-full max-w-md mx-auto h-[600px] flex items-center justify-center">
        {prospects.length === 0 ? (
          <div className="neo-card w-full h-full p-10 flex flex-col items-center justify-center text-center bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-[3rem]">
            <Sparkles className="w-16 h-16 text-brand-purple mb-6 opacity-50" />
            <h2 className="text-2xl font-bold text-white mb-2">You&apos;re all caught up!</h2>
            <p className="text-slate-400">Check back later for new potential matches in your professional network.</p>
          </div>
        ) : (
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
                className={`absolute inset-0 neo-card bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-[3rem] overflow-hidden flex flex-col transition-all duration-300 shadow-2xl z-10 ${
                  animatingCard === 'like' ? 'translate-x-full opacity-0 rotate-12' : 
                  animatingCard === 'pass' ? '-translate-x-full opacity-0 -rotate-12' : 
                  'translate-x-0 opacity-100 rotate-0'
                }`}
              >
                {/* Image Placeholder (Using avatar initial) */}
                <div className="flex-1 w-full bg-gradient-to-b from-slate-800 to-slate-900 flex flex-col items-center justify-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-screen pointer-events-none" />
                  <div className="w-64 h-64 rounded-full bg-gradient-to-br from-brand-purple to-brand flex items-center justify-center shadow-[0_0_50px_rgba(168,85,247,0.3)] mb-8 ring-8 ring-slate-900 group-hover:scale-105 transition-transform duration-500">
                    <span className="text-8xl font-extrabold text-white drop-shadow-lg">{currentProspect.avatar}</span>
                  </div>
                </div>

                {/* Info */}
                <div className="h-48 p-8 bg-slate-900/90 relative z-10 border-t border-white/5">
                  <div className="flex justify-between items-end mb-6">
                    <div>
                      <h2 className="text-3xl font-extrabold text-white mb-1 tracking-tight">{currentProspect.fullName}</h2>
                      <p className="text-brand-purple font-medium text-lg">@{currentProspect.username}</p>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center justify-center gap-6 mt-4">
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
        )}
      </div>

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
