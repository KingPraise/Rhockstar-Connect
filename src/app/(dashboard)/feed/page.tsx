"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import PostComposer from "@/components/feed/PostComposer";
import PostCard from "@/components/feed/PostCard";
import { subscribeToFeed, Post } from "@/lib/services/posts";
import { getAllUsers, UserBasic } from "@/lib/services/users";
import { getJobs, JobListing } from "@/lib/services/jobs";
import { sendConnectionRequest } from "@/lib/services/connections";
import { useAuthStore } from "@/store/useAuthStore";
import { Loader2, MessageSquarePlus, Search, Compass, Users, Briefcase, ChevronRight, UserPlus, Sparkles, Check } from "lucide-react";
import PullToRefresh from "@/components/ui/PullToRefresh";
import PostCardSkeleton from "@/components/feed/PostCardSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useSearchStore } from "@/store/useSearchStore";
import Link from "next/link";
import UserAvatar from "@/components/ui/UserAvatar";
import toast from "react-hot-toast";

const COMMUNITY_CHIPS = [
  { name: "Football", category: "Sports", icon: "⚽", color: "from-green-600/20 to-emerald-600/20 border-green-500/30 text-green-300" },
  { name: "Jobs & Opportunities", category: "Tech & Career", icon: "💼", color: "from-blue-600/20 to-indigo-600/20 border-blue-500/30 text-blue-300" },
  { name: "Technology", category: "Tech & Career", icon: "💻", color: "from-purple-600/20 to-fuchsia-600/20 border-purple-500/30 text-purple-300" },
  { name: "Automobiles", category: "Hobbies", icon: "🚗", color: "from-amber-600/20 to-orange-600/20 border-amber-500/30 text-amber-300" },
  { name: "Students & Campus", category: "Campus", icon: "🎓", color: "from-cyan-600/20 to-sky-600/20 border-cyan-500/30 text-cyan-300" },
  { name: "Relationships", category: "General", icon: "❤️", color: "from-rose-600/20 to-pink-600/20 border-rose-500/30 text-rose-300" },
];

export default function FeedPage() {
  const { profile } = useAuthStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [limitCount, setLimitCount] = useState(10);
  const [hasMore, setHasMore] = useState(true);
  const { openSearch } = useSearchStore();

  // Dynamic Real Time DB State
  const [suggestedPeople, setSuggestedPeople] = useState<UserBasic[]>([]);
  const [featuredJobs, setFeaturedJobs] = useState<JobListing[]>([]);
  const [connectingUserIds, setConnectingUserIds] = useState<Set<string>>(new Set());
  const [sentRequestIds, setSentRequestIds] = useState<Set<string>>(new Set());

  const observer = useRef<IntersectionObserver | null>(null);
  
  const lastPostElementRef = useCallback((node: HTMLDivElement) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setLimitCount(prev => prev + 10);
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  const handleRefresh = async () => {
    setLimitCount(10);
    await new Promise(resolve => setTimeout(resolve, 800));
  };

  // Subscribe to real-time posts feed
  useEffect(() => {
    const unsubscribe = subscribeToFeed(limitCount, (newPosts) => {
      setPosts(newPosts);
      setLoading(false);
      if (newPosts.length < limitCount) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
    });

    return () => unsubscribe();
  }, [limitCount]);

  // Fetch real database users & jobs from Firestore
  useEffect(() => {
    const fetchSidebarData = async () => {
      // 1. Fetch Real Users from Firestore
      try {
        const userRes = await getAllUsers(true);
        if (userRes.success && userRes.users) {
          const filtered = userRes.users
            .filter(u => u.uid !== profile?.uid)
            .slice(0, 5);
          setSuggestedPeople(filtered);
        }
      } catch (err) {
        console.error("Failed to load suggested users:", err);
      }

      // 2. Fetch Real Jobs from Firestore
      try {
        const jobRes = await getJobs({ limitCount: 4 });
        if (jobRes.success && jobRes.jobs && jobRes.jobs.length > 0) {
          setFeaturedJobs(jobRes.jobs);
        }
      } catch (err) {
        console.error("Failed to load featured jobs:", err);
      }
    };

    fetchSidebarData();
  }, [profile?.uid]);

  // Handle real connection request to Firestore
  const handleConnect = async (targetUserId: string, targetName: string) => {
    if (!profile?.uid) {
      toast.error("Please sign in to connect with users");
      return;
    }

    setConnectingUserIds(prev => new Set(prev).add(targetUserId));

    try {
      const res = await sendConnectionRequest(profile.uid, targetUserId);
      if (res.success) {
        setSentRequestIds(prev => new Set(prev).add(targetUserId));
        toast.success(`Connection request sent to ${targetName}! 🎉`);
      } else {
        toast.error(res.error || "Failed to send connection request");
      }
    } catch (err: any) {
      toast.error("Failed to send connection request");
    } finally {
      setConnectingUserIds(prev => {
        const next = new Set(prev);
        next.delete(targetUserId);
        return next;
      });
    }
  };

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="w-full max-w-6xl mx-auto px-1 sm:px-2 pb-16 lg:pb-6">
        
        {/* Top Header & Search Section */}
        <div className="mb-4 sm:mb-6 space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>Rhockstar Feed</span>
                <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">Hub</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">Connect with people, join communities, and explore opportunities.</p>
            </div>

            {/* Global Search Bar */}
            <button
              onClick={openSearch}
              className="w-full sm:w-80 flex items-center gap-3 px-3.5 py-2 sm:py-2.5 bg-slate-900/80 hover:bg-slate-800 border border-white/10 rounded-2xl text-slate-400 hover:text-white transition-all shadow-inner group text-left"
            >
              <Search className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform shrink-0" />
              <span className="text-xs font-medium truncate">Search people, jobs, communities...</span>
            </button>
          </div>

          {/* Community Discovery Categories Strip */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] sm:text-xs font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
                <Compass className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                Public Communities
              </span>
              <Link href="/messages" className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-0.5">
                Explore All <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none -mx-1 px-1">
              {COMMUNITY_CHIPS.map((chip) => (
                <Link
                  key={chip.name}
                  href={`/messages?category=${encodeURIComponent(chip.category)}`}
                  className={`whitespace-nowrap px-3 py-1.5 rounded-xl bg-gradient-to-r ${chip.color} border text-xs font-bold flex items-center gap-1.5 hover:scale-105 transition-transform shrink-0`}
                >
                  <span>{chip.icon}</span>
                  <span>{chip.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile / Tablet Horizontal Suggestions Widget (Real DB Users) */}
        {suggestedPeople.length > 0 && (
          <div className="block lg:hidden mb-4 space-y-3">
            <div className="p-3 bg-slate-900/80 border border-white/5 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-purple-400" /> Suggested Connections
                </span>
                <Link href="/network" className="text-[11px] font-medium text-purple-400 hover:underline">
                  View All
                </Link>
              </div>
              <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
                {suggestedPeople.map((user) => (
                  <div key={user.uid} className="p-2.5 bg-slate-800/40 border border-white/5 rounded-xl flex items-center gap-2 shrink-0 min-w-[210px]">
                    <UserAvatar name={user.fullName} src={user.avatar} className="w-8 h-8 text-xs font-bold shrink-0" />
                    <div className="min-w-0 flex-1">
                      <Link href={`/profile?uid=${user.uid}`} className="font-bold text-white text-xs truncate block hover:underline">
                        {user.fullName}
                      </Link>
                      <p className="text-[10px] text-purple-300/80 truncate">{user.headline || user.industry || user.accountType || "Member"}</p>
                    </div>
                    {sentRequestIds.has(user.uid) ? (
                      <span className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs shrink-0 flex items-center gap-1 font-semibold">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <button
                        onClick={() => handleConnect(user.uid, user.fullName)}
                        disabled={connectingUserIds.has(user.uid)}
                        className="p-1.5 bg-purple-600/20 text-purple-300 hover:bg-purple-600 hover:text-white rounded-lg text-xs shrink-0 disabled:opacity-50"
                      >
                        {connectingUserIds.has(user.uid) ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <UserPlus className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
          
          {/* Main Feed Column */}
          <div className="lg:col-span-8 space-y-3.5">
            
            {/* Post Composer */}
            <PostComposer />

            {/* Posts Stream */}
            {loading ? (
              <div className="space-y-3.5">
                {[1, 2, 3].map((i) => (
                  <PostCardSkeleton key={i} />
                ))}
              </div>
            ) : posts.length > 0 ? (
              <div className="space-y-3.5">
                {posts.map((post, index) => {
                  if (posts.length === index + 1) {
                    return (
                      <div ref={lastPostElementRef} key={post.id}>
                        <PostCard post={post} />
                      </div>
                    );
                  } else {
                    return <PostCard key={post.id} post={post} />;
                  }
                })}
                {hasMore && (
                  <div className="flex justify-center py-6">
                    <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
                  </div>
                )}
                {!hasMore && (
                  <div className="text-center py-6 text-slate-500 text-xs font-medium">
                    You have caught up with all posts!
                  </div>
                )}
              </div>
            ) : (
              <div className="neo-card flex items-center justify-center min-h-[30vh] p-6 text-center">
                <EmptyState 
                  icon={MessageSquarePlus}
                  title="No posts yet"
                  description="Your feed is quiet. Be the first to start a conversation or connect with professionals."
                />
              </div>
            )}
          </div>

          {/* Right Sidebar Column (Desktop) */}
          <div className="hidden lg:flex flex-col gap-5 lg:col-span-4 sticky top-20">
            
            {/* People You May Know Widget (Real DB Users) */}
            <div className="neo-card p-4 bg-slate-900/80 border border-white/5 rounded-2xl space-y-3">
              <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-400" />
                  People You May Know
                </h3>
                <Link href="/network" className="text-xs font-medium text-purple-400 hover:underline">
                  See All
                </Link>
              </div>

              <div className="space-y-3">
                {suggestedPeople.length > 0 ? (
                  suggestedPeople.map((user) => (
                    <div key={user.uid} className="flex items-center justify-between gap-2 p-2 rounded-xl hover:bg-slate-800/50 transition-colors">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <UserAvatar name={user.fullName} src={user.avatar} className="w-8 h-8 text-xs font-bold shrink-0" />
                        <div className="min-w-0">
                          <Link href={`/profile?uid=${user.uid}`} className="font-bold text-white text-xs truncate block hover:underline">
                            {user.fullName}
                          </Link>
                          <p className="text-[11px] text-purple-300/80 truncate">{user.headline || user.industry || user.accountType || "Member"}</p>
                        </div>
                      </div>

                      {sentRequestIds.has(user.uid) ? (
                        <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-bold shrink-0 flex items-center gap-1 border border-emerald-500/30">
                          <Check className="w-3 h-3" />
                          <span>Sent</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleConnect(user.uid, user.fullName)}
                          disabled={connectingUserIds.has(user.uid)}
                          className="px-2.5 py-1 bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1 border border-purple-500/30 disabled:opacity-50"
                        >
                          {connectingUserIds.has(user.uid) ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <>
                              <UserPlus className="w-3 h-3" />
                              <span>Connect</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 text-center py-2">No suggested users found yet.</p>
                )}
              </div>
            </div>

            {/* Jobs Showcase Widget (Real DB Jobs) */}
            <div className="neo-card p-4 bg-slate-900/80 border border-white/5 rounded-2xl space-y-3">
              <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-emerald-400" />
                  Jobs For You
                </h3>
                <Link href="/jobs" className="text-xs font-medium text-emerald-400 hover:underline">
                  View Jobs
                </Link>
              </div>

              <div className="space-y-2.5">
                {featuredJobs.length > 0 ? (
                  featuredJobs.map((job) => (
                    <div key={job.id} className="p-3 bg-slate-800/40 rounded-xl border border-white/5 hover:border-emerald-500/30 transition-all space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-white text-xs">{job.title}</h4>
                          <p className="text-[11px] text-slate-400">{job.company} • {job.location}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] font-bold text-emerald-400">{job.salary}</span>
                        <Link 
                          href="/jobs" 
                          className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded-lg text-[11px] font-bold transition-all border border-emerald-500/30"
                        >
                          View Job
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 text-center py-2">No active jobs listed yet.</p>
                )}
              </div>
            </div>

          </div>

        </div>

      </div>
    </PullToRefresh>
  );
}
