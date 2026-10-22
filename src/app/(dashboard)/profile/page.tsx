"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ProfileHeader from "@/components/profile/ProfileHeader";
import EditProfileModal from "@/components/profile/EditProfileModal";
import AuthRequiredModal from "@/components/auth/AuthRequiredModal";
import { 
  Plus, Building2, GraduationCap, Code2, Globe, Heart, ChevronRight, Zap, 
  UserPlus, Target, CheckCircle2, MessageSquare, User, MoreHorizontal, 
  FileText, Briefcase, MapPin, Calendar, ExternalLink, Sparkles, ChevronDown, 
  ChevronUp, ShieldCheck, Volume2, Flame 
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { getUserById, getUserByUsername, trackProfileView, listenToUserProfile } from "@/lib/services/users";
import { sendConnectionRequest } from "@/lib/services/connections";
import { followUser, unfollowUser, listenToFollowState } from "@/lib/services/follows";
import { calculateProfileProgress } from "@/lib/utils/profileProgress";
import { subscribeToUserPosts, Post } from "@/lib/services/posts";
import { recordDatingAction } from "@/lib/services/dating";
import PostCard from "@/components/feed/PostCard";
import PostComposer from "@/components/feed/PostComposer";
import PostCardSkeleton from "@/components/feed/PostCardSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
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
  const queryTab = searchParams.get("tab");
  const queryEdit = searchParams.get("edit");

  const [targetUser, setTargetUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'none' | 'pending' | 'accepted' | 'rejected'>('none');
  const [actionLoading, setActionLoading] = useState(false);
  
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  // Profile navigation & user posts
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'posts' | 'about' | 'experience' | 'skills' | 'portfolio' | 'dating'>(
    queryTab === 'dating' ? 'dating' : 'posts'
  );
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showIntroDetails, setShowIntroDetails] = useState(false);

  useEffect(() => {
    if (queryTab === 'dating') {
      setActiveTab('dating');
    }
  }, [queryTab]);

  useEffect(() => {
    if (queryEdit === 'true') {
      setIsEditModalOpen(true);
    }
  }, [queryEdit]);

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

      // Only listen to target user document when viewing another person's profile
      if (fetchedUser) {
        unsubscribeUser = listenToUserProfile(fetchedUser.uid, (updatedUser) => {
          setTargetUser(updatedUser);
        });

        if (loggedInProfile && fetchedUser.uid !== loggedInProfile.uid) {
          trackProfileView(fetchedUser.uid, loggedInProfile.uid);

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

          unsubscribeFollow = listenToFollowState(loggedInProfile.uid, fetchedUser.uid, (following) => {
            setIsFollowing(following);
          });
        }
      }
    };

    fetchTargetUser();

    return () => {
      if (unsubscribeUser) unsubscribeUser();
      if (unsubscribeFollow) unsubscribeFollow();
    };
  }, [queryUser, queryUid, loggedInProfile?.uid]);

  // Active UID for profile posts
  const activeUid = targetUser?.uid || loggedInProfile?.uid;

  // Subscribe to user posts in real-time with safety timeout
  useEffect(() => {
    if (!activeUid) {
      setPosts([]);
      setPostsLoading(false);
      return;
    }

    // Only trigger skeleton if we have no posts yet
    setPostsLoading(prev => posts.length === 0 ? true : prev);
    let isMounted = true;

    // Safety timeout: Never let user wait more than 2.5 seconds on skeleton
    const safetyTimer = setTimeout(() => {
      if (isMounted) {
        setPostsLoading(false);
      }
    }, 2500);

    const unsubscribe = subscribeToUserPosts(activeUid, (userPosts) => {
      if (isMounted) {
        clearTimeout(safetyTimer);
        setPosts(userPosts);
        setPostsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(safetyTimer);
      if (unsubscribe) unsubscribe();
    };
  }, [activeUid]);

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

  const formattedLocation = typeof activeProfile?.location === 'object' && activeProfile.location !== null
    ? [activeProfile.location.city, activeProfile.location.state, activeProfile.location.country].filter(Boolean).join(", ")
    : (activeProfile?.location || "");

  return (
    <div className={`w-full max-w-5xl mx-auto flex flex-col gap-6 relative p-2 sm:p-4 rounded-3xl transition-all duration-500 bg-gradient-to-b ${themeClasses.glow}`}>
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

      {/* Profile Navigation Tabs (Facebook / Twitter style) */}
      <div className="flex items-center justify-between border-b border-white/10 px-1 sm:px-0 gap-2 relative z-20">
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-2">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
              activeTab === 'posts'
                ? 'bg-gradient-to-r from-brand to-brand-purple text-white shadow-lg shadow-brand/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Posts</span>
            {posts.length > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                activeTab === 'posts' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300'
              }`}>
                {posts.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('about')}
            className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
              activeTab === 'about'
                ? 'bg-gradient-to-r from-brand to-brand-purple text-white shadow-lg shadow-brand/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <User className="w-4 h-4" />
            <span>About</span>
          </button>

          {activeProfile?.accountType !== 'employer' && (
            <button
              onClick={() => setActiveTab('experience')}
              className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
                activeTab === 'experience'
                  ? 'bg-gradient-to-r from-brand to-brand-purple text-white shadow-lg shadow-brand/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Experience</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('skills')}
            className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
              activeTab === 'skills'
                ? 'bg-gradient-to-r from-brand to-brand-purple text-white shadow-lg shadow-brand/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>{activeProfile?.accountType === 'employer' ? 'Company Details' : 'Skills & Education'}</span>
          </button>

          <button
            onClick={() => setActiveTab('portfolio')}
            className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
              activeTab === 'portfolio'
                ? 'bg-gradient-to-r from-brand to-brand-purple text-white shadow-lg shadow-brand/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Links</span>
          </button>

          {activeProfile?.datingActive && (
            <button
              onClick={() => setActiveTab('dating')}
              className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
                activeTab === 'dating'
                  ? 'bg-gradient-to-r from-brand to-brand-purple text-white shadow-lg shadow-brand/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Heart className="w-4 h-4 text-brand" />
              <span>Dating</span>
            </button>
          )}
        </div>

        {/* 3-Dots / Show More Menu Dropdown */}
        <div className="relative shrink-0">
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-800/60 hover:bg-slate-700 text-slate-300 hover:text-white border border-white/5 flex items-center gap-1.5 text-xs font-bold transition-colors"
            title="Profile Categories"
          >
            <MoreHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">More</span>
          </button>

          {showMoreMenu && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-1.5 z-50 flex flex-col gap-0.5 backdrop-blur-xl">
              <button
                onClick={() => { setActiveTab('posts'); setShowMoreMenu(false); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-white/10 text-left transition-colors"
              >
                <MessageSquare className="w-4 h-4 text-brand" />
                <span>Posts & Activity</span>
              </button>
              <button
                onClick={() => { setActiveTab('about'); setShowMoreMenu(false); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-white/10 text-left transition-colors"
              >
                <User className="w-4 h-4 text-brand-purple" />
                <span>About & Bio</span>
              </button>
              {activeProfile?.accountType !== 'employer' && (
                <button
                  onClick={() => { setActiveTab('experience'); setShowMoreMenu(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-white/10 text-left transition-colors"
                >
                  <Building2 className="w-4 h-4 text-blue-400" />
                  <span>Work Experience</span>
                </button>
              )}
              <button
                onClick={() => { setActiveTab('skills'); setShowMoreMenu(false); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-white/10 text-left transition-colors"
              >
                <Code2 className="w-4 h-4 text-emerald-400" />
                <span>{activeProfile?.accountType === 'employer' ? 'Company Details' : 'Skills & Education'}</span>
              </button>
              <button
                onClick={() => { setActiveTab('portfolio'); setShowMoreMenu(false); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-white/10 text-left transition-colors"
              >
                <Globe className="w-4 h-4 text-amber-400" />
                <span>Portfolio & Links</span>
              </button>
              {activeProfile?.datingActive && (
                <button
                  onClick={() => { setActiveTab('dating'); setShowMoreMenu(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-white/10 text-left transition-colors"
                >
                  <Heart className="w-4 h-4 text-brand" />
                  <span>Dating Profile</span>
                </button>
              )}
              {activeProfile?.resumeUrl && (
                <a
                  href={activeProfile.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setShowMoreMenu(false)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-brand hover:bg-brand/10 text-left transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  <span>Download Resume (PDF)</span>
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* TAB CONTENT: POSTS */}
      {activeTab === 'posts' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {/* Main Feed Column */}
          <div className="lg:col-span-2 flex flex-col gap-4 sm:gap-6">
            {isOwnProfile && <PostComposer />}

            {postsLoading && posts.length === 0 ? (
              <div className="space-y-4">
                <PostCardSkeleton />
                <PostCardSkeleton />
              </div>
            ) : posts.length > 0 ? (
              <div className="space-y-4">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <div className="neo-card p-8 sm:p-12 text-center flex flex-col items-center justify-center bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-3xl shadow-xl">
                <div className="w-16 h-16 rounded-2xl bg-brand/10 text-brand flex items-center justify-center mb-4 border border-brand/20">
                  <MessageSquare className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {isOwnProfile ? "You haven't posted yet" : `No posts from @${activeProfile.username || 'user'} yet`}
                </h3>
                <p className="text-slate-400 text-sm max-w-md leading-relaxed mb-6">
                  {isOwnProfile 
                    ? "Share updates, industry insights, achievements, or media with your network on Rhockstar Connect!" 
                    : "When they share updates, photos, or discussions, they will appear right here."}
                </p>
                {isOwnProfile && (
                  <Link href="/feed" className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand to-brand-purple text-white font-bold text-xs shadow-lg hover:opacity-95 transition-opacity">
                    Explore Feed & Share
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Right Sidebar Column */}
          <div className="flex flex-col gap-6">
            {/* Intro Snapshot Card */}
            <div className="neo-card p-6 relative overflow-hidden group bg-slate-900/40 backdrop-blur-md border-white/5 shadow-2xl">
              <div className="absolute top-0 left-0 w-1 h-full bg-brand"></div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <User className="w-4 h-4 text-brand" />
                  Intro
                </h3>
                {isOwnProfile && (
                  <button onClick={() => setIsEditModalOpen(true)} className="text-xs text-brand hover:underline font-semibold">
                    Edit
                  </button>
                )}
              </div>

              {activeProfile.headline && (
                <p className="text-slate-200 text-sm font-semibold mb-3">
                  {activeProfile.headline}
                </p>
              )}

              {activeProfile.bio && (
                <p className="text-slate-400 text-xs leading-relaxed line-clamp-3 mb-4 whitespace-pre-wrap">
                  {activeProfile.bio}
                </p>
              )}

              <div className="space-y-2.5 text-xs text-slate-300 pt-2 border-t border-white/5">
                {formattedLocation && (
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="truncate">Lives in <strong className="text-white">{formattedLocation}</strong></span>
                  </div>
                )}
                {activeProfile.education && (
                  <div className="flex items-center gap-2.5">
                    <GraduationCap className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="truncate">Studied at <strong className="text-white">{activeProfile.education}</strong></span>
                  </div>
                )}
                {activeProfile.website && (
                  <div className="flex items-center gap-2.5">
                    <Globe className="w-4 h-4 text-slate-400 shrink-0" />
                    <a href={activeProfile.website} target="_blank" rel="noopener noreferrer" className="text-brand hover:underline truncate">
                      {activeProfile.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
                {activeProfile.skills && activeProfile.skills.length > 0 && (
                  <div className="flex items-center gap-2.5">
                    <Code2 className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="truncate">Top skill: <strong className="text-white">{activeProfile.skills[0]}</strong></span>
                  </div>
                )}
              </div>

              <button
                onClick={() => setActiveTab('about')}
                className="w-full mt-4 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white font-bold rounded-xl text-xs transition-colors border border-white/5 flex items-center justify-center gap-1.5"
              >
                <span>View Full Profile Details</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Stardom Status Card */}
            <StardomBadge xp={activeProfile?.stardomXP || 0} variant="full-card" />

            {/* Profile Strength Card */}
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

            {/* Resume Download */}
            {activeProfile?.resumeUrl && (
              <div className="neo-card p-6 relative overflow-hidden group bg-gradient-to-br from-brand/20 to-brand-purple/20 border-brand/30 shadow-2xl">
                <h2 className="text-lg font-bold text-brand mb-1">Professional Resume</h2>
                <p className="text-slate-300 text-xs mb-4">View verified qualifications & work history.</p>
                <a 
                  href={activeProfile.resumeUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full py-2.5 bg-brand text-white font-bold rounded-xl text-xs shadow-[0_0_15px_rgba(236,72,153,0.3)] hover:bg-brand-purple transition-all flex items-center justify-center gap-2"
                >
                  <FileText className="w-4 h-4" /> View Full Resume (PDF)
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: ABOUT */}
      {activeTab === 'about' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          <div className="lg:col-span-2 flex flex-col gap-4 sm:gap-6">
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

            {/* Quick Overview & Details */}
            <div className="neo-card p-4 sm:p-6 md:p-8 flex flex-col gap-4 relative overflow-hidden group bg-slate-900/40 backdrop-blur-md border-white/5 shadow-2xl">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
              <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2.5">
                <User className="w-5 h-5 text-blue-400" />
                Contact & Basic Info
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Full Name</p>
                  <p className="text-white font-medium">{activeProfile.fullName}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Username</p>
                  <p className="text-brand font-medium">@{activeProfile.username}</p>
                </div>
                {formattedLocation && (
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Location</p>
                    <p className="text-white font-medium">{formattedLocation}</p>
                  </div>
                )}
                {activeProfile.website && (
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Website</p>
                    <a href={activeProfile.website} target="_blank" rel="noopener noreferrer" className="text-brand hover:underline font-medium truncate block">
                      {activeProfile.website}
                    </a>
                  </div>
                )}
                {activeProfile.headline && (
                  <div className="sm:col-span-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Headline</p>
                    <p className="text-white font-medium">{activeProfile.headline}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <StardomBadge xp={activeProfile?.stardomXP || 0} variant="full-card" />
            {isOwnProfile && (
              <button 
                onClick={() => setIsEditModalOpen(true)}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl border border-white/10 transition-colors shadow-lg"
              >
                Edit Profile Details
              </button>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: EXPERIENCE */}
      {activeTab === 'experience' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          <div className="lg:col-span-2 flex flex-col gap-4 sm:gap-6">
            {/* Experience Section */}
            <div className="neo-card p-4 sm:p-6 md:p-8 flex flex-col gap-4 sm:gap-6 relative overflow-hidden group bg-slate-900/40 backdrop-blur-md border-white/5 shadow-2xl">
              <div className="absolute top-0 left-0 w-1 h-full bg-brand-purple"></div>
              <div className="flex justify-between items-center z-10">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold flex items-center gap-2 sm:gap-3 text-white">
                  <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-brand-purple" />
                  Experience
                </h2>
                {isOwnProfile && (
                  <button onClick={() => setIsEditModalOpen(true)} className="text-slate-400 hover:text-white hover:bg-white/10 p-1.5 rounded-full transition-all group-hover:scale-110">
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                )}
              </div>
              
              <div className="flex flex-col gap-6 relative before:absolute before:inset-0 before:ml-7 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent z-10">
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group/item is-active mt-2 sm:mt-4">
                  <div className="flex items-center justify-center w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-slate-900 border-2 sm:border-4 border-slate-900 shadow-[0_0_15px_rgba(168,85,247,0.4)] text-white z-10 shrink-0 md:order-1 md:group-odd/item:-translate-x-1/2 md:group-even/item:translate-x-1/2">
                    <Building2 className="w-4 h-4 sm:w-6 sm:h-6" />
                  </div>
                  <div className="w-[calc(100%-3rem)] sm:w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] neo-card p-4 sm:p-6 bg-slate-800/50 hover:bg-slate-800 border border-white/5 group-hover/item:border-brand-purple/50 transition-all shadow-lg hover:shadow-brand-purple/10">
                    <div className="flex flex-col">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold text-base sm:text-xl text-white">{activeProfile?.headline || "Professional"}</h3>
                      </div>
                      <p className="text-brand-purple font-semibold text-sm sm:text-lg">{activeProfile?.fullName}</p>
                      <p className="text-slate-300 text-xs sm:text-sm mt-2 font-medium bg-white/5 w-fit px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full border border-white/10">Active Member</p>
                      <p className="text-slate-400 text-xs sm:text-sm mt-3 leading-relaxed">{activeProfile?.bio || "Connect with this professional on Rhockstar Connect."}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <StardomBadge xp={activeProfile?.stardomXP || 0} variant="full-card" />
          </div>
        </div>
      )}

      {/* TAB CONTENT: SKILLS & EDUCATION */}
      {activeTab === 'skills' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          <div className="lg:col-span-2 flex flex-col gap-4 sm:gap-6">
            {activeProfile?.accountType === 'employer' ? (
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
            ) : (
              <>
                {/* Education Section */}
                <div className="neo-card p-4 sm:p-6 md:p-8 flex flex-col gap-4 sm:gap-6 relative overflow-hidden group bg-slate-900/40 backdrop-blur-md border-white/5 shadow-2xl">
                  <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                  <div className="flex justify-between items-center z-10">
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold flex items-center gap-2 sm:gap-3 text-white">
                      <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500" />
                      Education
                    </h2>
                    {isOwnProfile && (
                      <button onClick={() => setIsEditModalOpen(true)} className="text-slate-400 hover:text-white hover:bg-white/10 p-1.5 rounded-full transition-all group-hover:scale-110">
                        <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    )}
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
          </div>

          <div className="flex flex-col gap-6">
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
            <StardomBadge xp={activeProfile?.stardomXP || 0} variant="full-card" />
          </div>
        </div>
      )}

      {/* TAB CONTENT: PORTFOLIO & LINKS */}
      {activeTab === 'portfolio' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          <div className="lg:col-span-2 flex flex-col gap-4 sm:gap-6">
            {/* Portfolio & Links */}
            <div className="neo-card p-6 relative overflow-hidden group bg-slate-900/40 backdrop-blur-md border-white/5 shadow-2xl">
              <div className="absolute top-0 left-0 w-1 h-full bg-brand-purple"></div>
              <div className="flex justify-between items-center mb-6 z-10 relative">
                <h2 className="text-xl font-bold flex items-center gap-3 text-white">
                  <Globe className="w-5 h-5 text-brand-purple" />
                  {activeProfile?.accountType === 'employer' ? 'Links & Website' : 'Portfolio & Socials'}
                </h2>
              </div>
              
              <div className="flex flex-col gap-3 z-10 relative">
                {/* Social Profiles Grid */}
                {activeProfile?.socialLinks && Object.values(activeProfile.socialLinks).some(Boolean) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
                    {activeProfile.socialLinks.linkedin && (
                      <a
                        href={activeProfile.socialLinks.linkedin.startsWith('http') ? activeProfile.socialLinks.linkedin : `https://${activeProfile.socialLinks.linkedin}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3.5 rounded-xl bg-[#0A66C2]/10 border border-[#0A66C2]/25 hover:bg-[#0A66C2]/20 text-[#70b5f9] transition-all flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-7 h-7 rounded-lg bg-[#0A66C2] text-white flex items-center justify-center font-black text-sm">in</span>
                          <div>
                            <p className="text-[10px] font-bold uppercase text-slate-400">LinkedIn</p>
                            <p className="text-xs font-semibold truncate max-w-[170px] text-white">
                              {activeProfile.socialLinks.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, '@')}
                            </p>
                          </div>
                        </div>
                        <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                      </a>
                    )}
                    {activeProfile.socialLinks.twitter && (
                      <a
                        href={activeProfile.socialLinks.twitter.startsWith('http') ? activeProfile.socialLinks.twitter : `https://${activeProfile.socialLinks.twitter}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3.5 rounded-xl bg-slate-800/80 border border-white/10 hover:border-white/25 text-white transition-all flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-7 h-7 rounded-lg bg-black border border-white/20 text-white flex items-center justify-center font-black text-sm">𝕏</span>
                          <div>
                            <p className="text-[10px] font-bold uppercase text-slate-400">Twitter / X</p>
                            <p className="text-xs font-semibold truncate max-w-[170px] text-white">
                              {activeProfile.socialLinks.twitter.replace(/^https?:\/\/(www\.)?(twitter|x)\.com\//, '@')}
                            </p>
                          </div>
                        </div>
                        <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                      </a>
                    )}
                    {activeProfile.socialLinks.github && (
                      <a
                        href={activeProfile.socialLinks.github.startsWith('http') ? activeProfile.socialLinks.github : `https://${activeProfile.socialLinks.github}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3.5 rounded-xl bg-slate-800/80 border border-white/10 hover:border-white/25 text-white transition-all flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-7 h-7 rounded-lg bg-slate-900 border border-white/20 text-white flex items-center justify-center font-mono font-bold text-xs">git</span>
                          <div>
                            <p className="text-[10px] font-bold uppercase text-slate-400">GitHub</p>
                            <p className="text-xs font-semibold truncate max-w-[170px] text-white">
                              {activeProfile.socialLinks.github.replace(/^https?:\/\/(www\.)?github\.com\//, '@')}
                            </p>
                          </div>
                        </div>
                        <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                      </a>
                    )}
                    {activeProfile.socialLinks.instagram && (
                      <a
                        href={activeProfile.socialLinks.instagram.startsWith('http') ? activeProfile.socialLinks.instagram : `https://${activeProfile.socialLinks.instagram}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3.5 rounded-xl bg-pink-500/10 border border-pink-500/25 hover:bg-pink-500/20 text-pink-300 transition-all flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center font-bold text-xs">📷</span>
                          <div>
                            <p className="text-[10px] font-bold uppercase text-slate-400">Instagram</p>
                            <p className="text-xs font-semibold truncate max-w-[170px] text-white">
                              {activeProfile.socialLinks.instagram.replace(/^https?:\/\/(www\.)?instagram\.com\//, '@')}
                            </p>
                          </div>
                        </div>
                        <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                      </a>
                    )}
                  </div>
                )}
                {activeProfile?.website && (
                  <div className="p-3.5 rounded-xl bg-slate-800/60 border border-white/5 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase">Primary Website</p>
                      <a href={activeProfile.website} target="_blank" rel="noopener noreferrer" className="text-brand font-semibold hover:underline text-sm truncate">
                        {activeProfile.website}
                      </a>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-400" />
                  </div>
                )}
                {activeProfile?.portfolio && activeProfile.portfolio.length > 0 ? (
                  activeProfile.portfolio.map((link: string, index: number) => (
                    <a key={index} href={link} target="_blank" rel="noopener noreferrer" className="p-3 rounded-xl bg-brand-purple/10 text-brand-purple border border-brand-purple/20 hover:bg-brand-purple hover:text-white transition-colors truncate text-sm font-medium flex items-center justify-between">
                      <span>{link}</span>
                      <ExternalLink className="w-4 h-4 shrink-0" />
                    </a>
                  ))
                ) : (
                  !activeProfile?.website && <span className="text-slate-400">No links added.</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <StardomBadge xp={activeProfile?.stardomXP || 0} variant="full-card" />
          </div>
        </div>
      )}

      {/* TAB CONTENT: DATING PROFILE */}
      {activeTab === 'dating' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          <div className="lg:col-span-2 flex flex-col gap-4 sm:gap-6">
            <div className="neo-card p-6 relative overflow-hidden group bg-slate-900/40 backdrop-blur-md border-white/5 shadow-2xl space-y-6">
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-brand to-brand-purple"></div>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand shrink-0">
                    <Heart className="w-5 h-5 fill-brand/30" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white flex items-center gap-2">
                      Dating Profile
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-brand/20 text-brand border border-brand/30">
                        Active
                      </span>
                    </h2>
                    <p className="text-xs text-slate-400">Relationship goals, voice note, prompts, and dating photos</p>
                  </div>
                </div>

                {!isOwnProfile && loggedInProfile && (
                  <button
                    onClick={async () => {
                      if (!activeProfile?.uid) return;
                      const res = await recordDatingAction(loggedInProfile.uid, activeProfile.uid, 'like');
                      if (res.success) {
                        toast.success(res.isMatch ? "🎉 It's a Mutual Match!" : `Liked @${activeProfile.username || 'user'}!`);
                      } else {
                        toast.error(res.error || "Failed to send like");
                      }
                    }}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand to-brand-purple text-white font-bold text-xs shadow-lg shadow-brand/25 hover:opacity-95 transition-opacity shrink-0"
                  >
                    <Heart className="w-4 h-4 fill-white" />
                    <span>Send Dating Like</span>
                  </button>
                )}
              </div>

              {/* Photos Gallery */}
              {activeProfile?.datingPhotos && activeProfile.datingPhotos.length > 0 ? (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Dating Photos</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {activeProfile.datingPhotos.map((photoUrl: string, idx: number) => (
                      <div
                        key={idx}
                        className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-slate-800 border border-white/10 group shadow-md"
                      >
                        <img 
                          src={photoUrl} 
                          alt={`Dating photo ${idx + 1}`} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center rounded-2xl bg-slate-800/30 border border-white/5 text-slate-400 text-sm">
                  No dating photos uploaded yet.
                </div>
              )}

              {/* Dating Goals / Intent */}
              {activeProfile?.datingGoals && (
                <div className="p-4 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">Relationship Intent</span>
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-brand/20 text-brand border border-brand/30">
                    🎯 {activeProfile.datingGoals}
                  </span>
                </div>
              )}

              {/* Voice Intro Note */}
              {activeProfile?.datingVoiceIntro && (
                <div className="p-4 rounded-2xl bg-brand/10 border border-brand/20 space-y-2">
                  <h4 className="text-xs font-bold text-brand uppercase tracking-wider flex items-center gap-2">
                    <Volume2 className="w-4 h-4" />
                    <span>Voice Intro</span>
                  </h4>
                  <audio controls src={activeProfile.datingVoiceIntro} className="w-full h-9" />
                </div>
              )}

              {/* Prompts & Answers */}
              {activeProfile?.datingPrompts && activeProfile.datingPrompts.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Conversation Starters</h4>
                  <div className="grid grid-cols-1 gap-3">
                    {activeProfile.datingPrompts.map((p: any, idx: number) => (
                      <div key={idx} className="p-4 rounded-2xl bg-gradient-to-br from-slate-800/60 to-slate-900 border border-white/10 space-y-1">
                        <p className="text-xs font-bold text-brand">{p.prompt}</p>
                        <p className="text-sm font-semibold text-white leading-relaxed">{p.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Dating Interests Tags */}
              {activeProfile?.datingInterests && activeProfile.datingInterests.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Interests & Passions</h4>
                  <div className="flex flex-wrap gap-2">
                    {activeProfile.datingInterests.map((interest: string, idx: number) => (
                      <span key={idx} className="px-3 py-1 rounded-xl bg-slate-800 text-slate-200 text-xs font-medium border border-white/5">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-6">
            <div className="neo-card p-6 bg-gradient-to-br from-brand/10 to-brand-purple/10 border-brand/20 shadow-xl rounded-3xl space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-brand" />
                Rhockstar Dating
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Connect with creatives, professionals, and like-minded individuals in a verified community.
              </p>
              <Link
                href="/dating"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-brand to-brand-purple text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-brand/20 hover:opacity-95 transition-opacity"
              >
                <span>Open Dating Hub</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <StardomBadge xp={activeProfile?.stardomXP || 0} variant="full-card" />
          </div>
        </div>
      )}

      {isEditModalOpen && <EditProfileModal onClose={() => setIsEditModalOpen(false)} />}
      <AuthRequiredModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        actionName="connect or follow users" 
      />
    </div>
  );
}
