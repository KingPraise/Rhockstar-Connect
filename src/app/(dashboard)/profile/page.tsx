"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ProfileHeader from "@/components/profile/ProfileHeader";
import EditProfileModal from "@/components/profile/EditProfileModal";
import AuthRequiredModal from "@/components/auth/AuthRequiredModal";
import { Plus, Building2, GraduationCap, Code2, Globe, Heart, ChevronRight, Zap, UserPlus, Target, CheckCircle2 } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { getUserById, getUserByUsername, trackProfileView, listenToUserProfile } from "@/lib/services/users";
import { sendConnectionRequest } from "@/lib/services/connections";
import { followUser, unfollowUser, listenToFollowState } from "@/lib/services/follows";
import { calculateProfileProgress } from "@/lib/utils/profileProgress";
import Link from "next/link";
import toast from "react-hot-toast";
import StardomBadge from "@/components/gamification/StardomBadge";
import StreakBadge from "@/components/gamification/StreakBadge";

import { getThemeClasses } from "@/lib/constants/themes";

export default function ProfilePage() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { profile: loggedInProfile } = useAuthStore();
  
  const searchParams = useSearchParams();
  const queryUser = searchParams.get("user") || searchParams.get("username");
  const queryUid = searchParams.get("uid");

  const [targetUser, setTargetUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'none' | 'pending' | 'accepted' | 'rejected'>('none');
  const [actionLoading, setActionLoading] = useState(false);
  
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    let unsubscribeUser: (() => void) | undefined;
    let unsubscribeFollow: (() => void) | undefined;

    const fetchTargetUser = async () => {
      let fetchedUser = null;
      if (queryUser) {
        setLoading(true);
        const res = await getUserByUsername(queryUser);
        if (res.success && res.user) {
          fetchedUser = res.user;
          setTargetUser(fetchedUser);
        }
        setLoading(false);
      } else if (queryUid) {
        setLoading(true);
        const res = await getUserById(queryUid);
        if (res.success && res.user) {
          fetchedUser = res.user;
          setTargetUser(fetchedUser);
        }
        setLoading(false);
      } else {
        setTargetUser(null);
      }

      const activeUid = fetchedUser?.uid || loggedInProfile?.uid;
      if (activeUid) {
        // Listen to live user profile changes (for connections, followers, views)
        unsubscribeUser = listenToUserProfile(activeUid, (updatedUser) => {
            setTargetUser(updatedUser);
            if (loggedInProfile && updatedUser.uid === loggedInProfile.uid) {
              useAuthStore.getState().setProfile(updatedUser);
            }
          });
      }

      // If viewing another user's profile
      if (fetchedUser && loggedInProfile && fetchedUser.uid !== loggedInProfile.uid) {
        // 1. Track profile view
        trackProfileView(fetchedUser.uid, loggedInProfile.uid);

        // 2. Fetch connection status
        const { getUserConnections } = await import("@/lib/services/connections");
        const connRes = await getUserConnections(loggedInProfile.uid);
        if (connRes.success && connRes.connections) {
          const conn = connRes.connections.find((c: any) => 
            (c.fromUserId === loggedInProfile.uid && c.toUserId === fetchedUser.uid) ||
            (c.toUserId === loggedInProfile.uid && c.fromUserId === fetchedUser.uid)
          );
          if (conn) {
            setConnectionStatus(conn.status);
          }
        }

        // 3. Listen to follow state
        unsubscribeFollow = listenToFollowState(loggedInProfile.uid, fetchedUser.uid, (following) => {
          setIsFollowing(following);
        });
      }
    };

    fetchTargetUser();

    return () => {
      if (unsubscribeUser) unsubscribeUser();
      if (unsubscribeFollow) unsubscribeFollow();
    };
  }, [queryUser, queryUid, loggedInProfile]);

  const activeProfile = targetUser || loggedInProfile;
  const isOwnProfile = Boolean(!targetUser || (loggedInProfile && targetUser?.uid === loggedInProfile.uid));
  const progress = calculateProfileProgress(activeProfile);
  const themeClasses = getThemeClasses((activeProfile as any)?.profileTheme);

  const handleConnect = async () => {
    if (!loggedInProfile) {
      setAuthModalOpen(true);
      return;
    }
    if (activeProfile?.uid) {
      setActionLoading(true);
      const res = await sendConnectionRequest(loggedInProfile.uid, activeProfile.uid);
      if (res.success) {
        setConnectionStatus('pending');
        toast.success("Connection request sent!");
      } else {
        toast.error(res.error || "Failed to send request");
      }
      setActionLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!loggedInProfile) {
      setAuthModalOpen(true);
      return;
    }
    if (!activeProfile?.uid) return;

    setFollowLoading(true);
    if (isFollowing) {
      const res = await unfollowUser(loggedInProfile.uid, activeProfile.uid);
      if (res.success) {
        setIsFollowing(false);
        toast.success(`Unfollowed @${activeProfile.username || 'user'}`);
      } else {
        toast.error(res.error || "Failed to unfollow");
      }
    } else {
      const res = await followUser(loggedInProfile.uid, activeProfile.uid);
      if (res.success) {
        setIsFollowing(true);
        toast.success(`Following @${activeProfile.username || 'user'}!`);
      } else {
        toast.error(res.error || "Failed to follow");
      }
    }
    setFollowLoading(false);
  };

  if (loading) {
    return (
      <div className="w-full max-w-5xl mx-auto flex flex-col gap-8 animate-pulse p-4 md:p-0 mt-8">
        <div className="h-64 bg-slate-800 rounded-3xl w-full"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 flex flex-col gap-8">
            <div className="h-40 bg-slate-800 rounded-3xl"></div>
            <div className="h-40 bg-slate-800 rounded-3xl"></div>
          </div>
          <div className="flex flex-col gap-8">
            <div className="h-80 bg-slate-800 rounded-3xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!activeProfile) {
    return (
      <div className="w-full max-w-3xl mx-auto neo-card p-10 text-center flex flex-col items-center gap-6 my-12 bg-slate-900/80">
        <div className="w-16 h-16 rounded-2xl bg-brand/10 text-brand flex items-center justify-center">
          <UserPlus className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-white">Profile Not Found or Guest Mode</h2>
        <p className="text-slate-400">Log in to view your profile or explore professionals on Rhockstar Connect.</p>
        <div className="flex gap-4">
          <Link href="/login" className="py-3 px-6 rounded-xl bg-gradient-to-r from-brand to-brand-purple text-white font-bold">
            Log In
          </Link>
          <Link href="/register" className="py-3 px-6 rounded-xl bg-slate-800 text-white font-bold border border-white/10">
            Sign Up
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full max-w-5xl mx-auto flex flex-col gap-8 relative p-2 sm:p-4 rounded-3xl transition-all duration-500 bg-gradient-to-b ${themeClasses.glow}`}>
      <ProfileHeader 
        onEditClick={() => setIsEditModalOpen(true)} 
        customProfile={activeProfile}
        isOwnProfile={isOwnProfile}
        onConnectClick={handleConnect}
        connectionStatus={connectionStatus}
        actionLoading={actionLoading}
        isFollowing={isFollowing}
        onFollowClick={isOwnProfile ? undefined : handleFollowToggle}
        followLoading={followLoading}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
        {/* Left Column (Main Content) */}
        <div className="lg:col-span-2 flex flex-col gap-4 sm:gap-6 md:gap-8">
          {/* About Section */}
          <div className="neo-card p-4 sm:p-6 md:p-8 flex flex-col gap-3 sm:gap-4 relative overflow-hidden group bg-slate-900/40 backdrop-blur-md border-white/5 shadow-2xl">
            <div className="absolute top-0 left-0 w-1 h-full bg-brand"></div>
            <div className="flex justify-between items-center z-10">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold flex items-center gap-2 sm:gap-3 text-white">
                <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-brand" />
                {activeProfile?.accountType === 'employer' ? 'About Company' : 'About Me'}
              </h2>
              {isOwnProfile && (
                <button onClick={() => setIsEditModalOpen(true)} className="text-slate-400 hover:text-white hover:bg-white/10 p-1.5 rounded-full transition-all group-hover:scale-110">
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              )}
            </div>
            <p className="text-slate-300 text-sm sm:text-base md:text-lg leading-relaxed pt-1 sm:pt-2 whitespace-pre-wrap z-10">
              {activeProfile?.bio || (activeProfile?.accountType === 'employer' ? "No company description added yet." : "No bio added yet. Click edit to tell the world about yourself!")}
            </p>
          </div>

          {activeProfile?.accountType !== 'employer' && (
            <>
              {/* Experience Section */}
              <div className="neo-card p-4 sm:p-6 md:p-8 flex flex-col gap-4 sm:gap-6 relative overflow-hidden group bg-slate-900/40 backdrop-blur-md border-white/5 shadow-2xl">
                <div className="absolute top-0 left-0 w-1 h-full bg-brand-purple"></div>
                <div className="flex justify-between items-center z-10">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold flex items-center gap-2 sm:gap-3 text-white">
                    <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-brand-purple" />
                    Experience
                  </h2>
                  <button className="text-slate-400 hover:text-white hover:bg-white/10 p-1.5 rounded-full transition-all group-hover:scale-110">
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
                
                <div className="flex flex-col gap-6 relative before:absolute before:inset-0 before:ml-7 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent z-10">
                  <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group/item is-active mt-2 sm:mt-4">
                    <div className="flex items-center justify-center w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-slate-900 border-2 sm:border-4 border-slate-900 shadow-[0_0_15px_rgba(168,85,247,0.4)] text-white z-10 shrink-0 md:order-1 md:group-odd/item:-translate-x-1/2 md:group-even/item:translate-x-1/2">
                      <Building2 className="w-4 h-4 sm:w-6 sm:h-6" />
                    </div>
                    <div className="w-[calc(100%-3rem)] sm:w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] neo-card p-4 sm:p-6 bg-slate-800/50 hover:bg-slate-800 border border-white/5 group-hover/item:border-brand-purple/50 transition-all shadow-lg hover:shadow-brand-purple/10">
                      <div className="flex flex-col">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-bold text-base sm:text-xl text-white">Software Developer</h3>
                        </div>
                        <p className="text-brand-purple font-semibold text-sm sm:text-lg">Acme Corp</p>
                        <p className="text-slate-300 text-xs sm:text-sm mt-2 font-medium bg-white/5 w-fit px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full border border-white/10">Jan 2024 - Present</p>
                        <p className="text-slate-400 text-xs sm:text-sm mt-3 leading-relaxed">Add dynamic experience entries here.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Education Section */}
              <div className="neo-card p-4 sm:p-6 md:p-8 flex flex-col gap-4 sm:gap-6 relative overflow-hidden group bg-slate-900/40 backdrop-blur-md border-white/5 shadow-2xl">
                <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                <div className="flex justify-between items-center z-10">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold flex items-center gap-2 sm:gap-3 text-white">
                    <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500" />
                    Education
                  </h2>
                  <button onClick={() => setIsEditModalOpen(true)} className="text-slate-400 hover:text-white hover:bg-white/10 p-1.5 rounded-full transition-all group-hover:scale-110">
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
                
                <div className="z-10 mt-1 sm:mt-2">
                  {activeProfile?.education ? (
                    <div className="flex gap-3 sm:gap-5 group/edu p-3 sm:p-4 -mx-2 sm:-mx-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-transparent hover:border-white/5 transition-colors cursor-pointer">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-800 shadow-lg border border-white/10 rounded-xl flex items-center justify-center text-white shrink-0 group-hover/edu:scale-105 group-hover/edu:border-emerald-500/50 group-hover/edu:shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all">
                        <GraduationCap className="w-6 h-6 sm:w-8 sm:h-8" />
                      </div>
                      <div className="flex flex-col justify-center flex-grow">
                        <div className="flex justify-between items-center">
                          <h3 className="font-bold text-base sm:text-xl text-white group-hover/edu:text-emerald-400 transition-colors">{activeProfile.education}</h3>
                          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500 opacity-0 group-hover/edu:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-400 text-sm mt-1">No education added yet.</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right Column (Sidebar Content) */}
        <div className="flex flex-col gap-6">
          {/* Stardom Status Card */}
          <StardomBadge xp={activeProfile?.stardomXP || 0} variant="full-card" />

          {isOwnProfile && (
            <div className="neo-card p-6 relative overflow-hidden group bg-slate-900/40 backdrop-blur-md border-white/5 shadow-2xl">
              <div className="absolute top-0 left-0 w-1 h-full bg-brand"></div>
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-brand" />
                Profile Strength
              </h2>
              
              <div className="flex items-center gap-6">
                <div className="relative w-20 h-20 shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-800" />
                    <circle 
                      cx="50" cy="50" r="40" 
                      stroke="currentColor" strokeWidth="8" fill="transparent" 
                      strokeDasharray={251.2} 
                      strokeDashoffset={251.2 - (251.2 * progress.percentage) / 100} 
                      strokeLinecap="round" 
                      className={`${progress.percentage === 100 ? 'text-emerald-400' : 'text-brand'} transition-all duration-1000 ease-out`} 
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-xl font-black text-white">{progress.percentage}%</span>
                  </div>
                </div>
                
                <div className="flex-1">
                  {progress.percentage === 100 ? (
                    <div>
                      <p className="text-emerald-400 font-bold text-sm mb-1 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> All-Star Profile
                      </p>
                      <p className="text-slate-400 text-xs">You're fully set up to stand out!</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-white font-bold text-sm mb-1">Next step:</p>
                      <p className="text-brand text-xs font-medium bg-brand/10 px-2.5 py-1 rounded-md inline-block border border-brand/20 line-clamp-1">
                        + {progress.missingItems[0]}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              {progress.percentage < 100 && (
                <button onClick={() => setIsEditModalOpen(true)} className="w-full mt-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-sm transition-colors border border-white/5">
                  Complete Profile
                </button>
              )}
            </div>
          )}

          {activeProfile?.accountType === 'employer' ? (
            <>
              {isOwnProfile && (
                <div className="neo-card p-6 relative overflow-hidden group bg-gradient-to-br from-brand to-brand-purple border-white/10 shadow-2xl">
                  <h2 className="text-xl font-bold text-white mb-2">Hiring?</h2>
                  <p className="text-white/80 text-sm mb-4">Post a new job and reach thousands of top professionals.</p>
                  <Link href="/jobs/post" className="w-full py-3 bg-white text-slate-900 font-bold rounded-xl shadow-lg hover:scale-105 transition-transform flex justify-center items-center gap-2">
                    <Plus className="w-5 h-5" /> Post a Job
                  </Link>
                </div>
              )}

              <div className="neo-card p-6 relative overflow-hidden group bg-slate-900/40 backdrop-blur-md border-white/5 shadow-2xl">
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                <h2 className="text-xl font-bold flex items-center gap-3 text-white mb-6">
                  <Building2 className="w-5 h-5 text-blue-500" />
                  Company Details
                </h2>
                <div className="flex flex-col gap-4">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Industry</p>
                    <p className="text-white font-medium">{activeProfile.industry || "Not specified"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Company Size</p>
                    <p className="text-white font-medium">{activeProfile.companySize || "Not specified"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Founded</p>
                    <p className="text-white font-medium">{activeProfile.foundedYear || "Not specified"}</p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Resume Download */}
              {activeProfile?.resumeUrl && (
                <div className="neo-card p-6 relative overflow-hidden group bg-gradient-to-br from-brand/20 to-brand-purple/20 border-brand/30 shadow-2xl">
                  <h2 className="text-xl font-bold text-brand mb-2">Professional Resume</h2>
                  <p className="text-slate-300 text-sm mb-4">View detailed work history and qualifications.</p>
                  <a 
                    href={activeProfile.resumeUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full py-3 bg-brand text-white font-bold rounded-xl shadow-[0_0_15px_rgba(236,72,153,0.3)] hover:bg-brand-purple hover:shadow-[0_0_20px_rgba(168,85,247,0.5)] transition-all flex items-center justify-center gap-2"
                  >
                    View Full Resume (PDF)
                  </a>
                </div>
              )}

              {/* Skills Section */}
              <div className="neo-card p-6 relative overflow-hidden group bg-slate-900/40 backdrop-blur-md border-white/5 shadow-2xl">
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                <div className="flex justify-between items-center mb-6 z-10 relative">
                  <h2 className="text-xl font-bold flex items-center gap-3 text-white">
                    <Code2 className="w-5 h-5 text-blue-500" />
                    Top Skills
                  </h2>
                  {isOwnProfile && (
                    <button onClick={() => setIsEditModalOpen(true)} className="text-slate-400 hover:text-white hover:bg-white/10 p-1.5 rounded-full transition-all">
                      <Plus className="w-5 h-5" />
                    </button>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2 z-10 relative">
                  {activeProfile?.skills && activeProfile.skills.length > 0 ? (
                    activeProfile.skills.map((skill: string, index: number) => (
                      <span key={index} className="px-4 py-2 bg-slate-800/80 hover:bg-blue-500/10 text-slate-200 hover:text-blue-400 font-medium rounded-xl border border-white/10 hover:border-blue-500/30 transition-all cursor-default shadow-sm hover:shadow-[0_0_15px_rgba(59,130,246,0.15)]">
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400 text-lg">No skills added yet.</span>
                  )}
                </div>
              </div>

              {/* Languages Section */}
              <div className="neo-card p-6 relative overflow-hidden group bg-slate-900/40 backdrop-blur-md border-white/5 shadow-2xl">
                <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
                <div className="flex justify-between items-center mb-6 z-10 relative">
                  <h2 className="text-xl font-bold flex items-center gap-3 text-white">
                    <Globe className="w-5 h-5 text-amber-500" />
                    Languages
                  </h2>
                </div>
                
                <div className="flex flex-col gap-3 z-10 relative">
                  <div className="flex justify-between items-center p-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] transition-colors cursor-default border border-transparent hover:border-white/5">
                    <span className="font-bold text-white text-lg">English</span>
                    <span className="text-xs font-bold px-3 py-1 bg-amber-500/10 text-amber-400 rounded-full border border-amber-500/20 uppercase tracking-wide">Native</span>
                  </div>
                </div>
              </div>

              {/* Certifications Section */}
              <div className="neo-card p-6 relative overflow-hidden group bg-slate-900/40 backdrop-blur-md border-white/5 shadow-2xl">
                <div className="absolute top-0 left-0 w-1 h-full bg-emerald-400"></div>
                <div className="flex justify-between items-center mb-6 z-10 relative">
                  <h2 className="text-xl font-bold flex items-center gap-3 text-white">
                    <Zap className="w-5 h-5 text-emerald-400" />
                    Certifications
                  </h2>
                </div>
                
                <div className="flex flex-col gap-3 z-10 relative">
                  {activeProfile?.certifications && activeProfile.certifications.length > 0 ? (
                    activeProfile.certifications.map((cert: string, index: number) => (
                      <div key={index} className="p-4 rounded-xl bg-slate-800/50 border border-white/5">
                        <span className="font-bold text-white">{cert}</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-slate-400">No certifications added.</span>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Portfolio & Links */}
          <div className="neo-card p-6 relative overflow-hidden group bg-slate-900/40 backdrop-blur-md border-white/5 shadow-2xl">
            <div className="absolute top-0 left-0 w-1 h-full bg-brand-purple"></div>
            <div className="flex justify-between items-center mb-6 z-10 relative">
              <h2 className="text-xl font-bold flex items-center gap-3 text-white">
                <Globe className="w-5 h-5 text-brand-purple" />
                {activeProfile?.accountType === 'employer' ? 'Links' : 'Portfolio'}
              </h2>
            </div>
            
            <div className="flex flex-col gap-3 z-10 relative">
              {activeProfile?.portfolio && activeProfile.portfolio.length > 0 ? (
                activeProfile.portfolio.map((link: string, index: number) => (
                  <a key={index} href={link} target="_blank" rel="noopener noreferrer" className="p-3 rounded-xl bg-brand-purple/10 text-brand-purple border border-brand-purple/20 hover:bg-brand-purple hover:text-white transition-colors truncate text-sm font-medium">
                    {link}
                  </a>
                ))
              ) : (
                <span className="text-slate-400">No links added.</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {isEditModalOpen && <EditProfileModal onClose={() => setIsEditModalOpen(false)} />}
      <AuthRequiredModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        actionName="connect or follow users" 
      />
    </div>
  );
}
