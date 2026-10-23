"use client";

import {
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";

import PostComposer from "@/components/feed/PostComposer";
import PostCard from "@/components/feed/PostCard";

import {
  subscribeToFeed,
  getPostById,
  Post,
} from "@/lib/services/posts";

import { useSearchParams } from "next/navigation";

import {
  getAllUsers,
  UserBasic,
} from "@/lib/services/users";

import {
  getJobs,
  JobListing,
} from "@/lib/services/jobs";

import {
  sendConnectionRequest,
  getUserConnections,
} from "@/lib/services/connections";

import { useAuthStore } from "@/store/useAuthStore";

import {
  Loader2,
  MessageSquarePlus,
  Search,
  Compass,
  Users,
  Briefcase,
  ChevronRight,
  UserPlus,
  Check,
  WifiOff,
} from "lucide-react";

import PullToRefresh from "@/components/ui/PullToRefresh";
import PostCardSkeleton from "@/components/feed/PostCardSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useSearchStore } from "@/store/useSearchStore";
import Link from "next/link";
import UserAvatar from "@/components/ui/UserAvatar";
import VerifiedBadge from "@/components/ui/VerifiedBadge";
import toast from "react-hot-toast";

import {
  subscribeToActiveAds,
  Advertisement,
} from "@/lib/services/ads";

import SponsoredAdCard from "@/components/feed/SponsoredAdCard";
import ProfileCompletionBanner from "@/components/profile/ProfileCompletionBanner";

const COMMUNITY_CHIPS = [
  {
    name: "Football",
    category: "Sports",
    icon: "⚽",
    color:
      "from-green-600/20 to-emerald-600/20 border-green-500/30 text-green-300",
  },
  {
    name: "Jobs & Opportunities",
    category: "Tech & Career",
    icon: "💼",
    color:
      "from-blue-600/20 to-indigo-600/20 border-blue-500/30 text-blue-300",
  },
  {
    name: "Technology",
    category: "Tech & Career",
    icon: "💻",
    color:
      "from-purple-600/20 to-fuchsia-600/20 border-purple-500/30 text-purple-300",
  },
  {
    name: "Automobiles",
    category: "Hobbies",
    icon: "🚗",
    color:
      "from-amber-600/20 to-orange-600/20 border-amber-500/30 text-amber-300",
  },
  {
    name: "Students & Campus",
    category: "Campus",
    icon: "🎓",
    color:
      "from-cyan-600/20 to-sky-600/20 border-cyan-500/30 text-cyan-300",
  },
  {
    name: "Relationships",
    category: "General",
    icon: "❤️",
    color:
      "from-rose-600/20 to-pink-600/20 border-rose-500/30 text-rose-300",
  },
];

const FEED_SIDEBAR_CACHE_KEY =
  "rhockstar-feed-sidebar-cache";

const FEED_SIDEBAR_CACHE_TTL =
  30 * 60 * 1000;

type FeedSidebarCache = {
  savedAt: number;
  suggestedPeople: UserBasic[];
  featuredJobs: JobListing[];
};

const readSidebarCache =
  (): FeedSidebarCache | null => {
    if (
      typeof window ===
      "undefined"
    ) {
      return null;
    }

    try {
      const raw =
        localStorage.getItem(
          FEED_SIDEBAR_CACHE_KEY
        );

      if (!raw) {
        return null;
      }

      const parsed =
        JSON.parse(
          raw
        ) as FeedSidebarCache;

      if (
        !parsed.savedAt ||
        Date.now() -
          parsed.savedAt >
          FEED_SIDEBAR_CACHE_TTL
      ) {
        localStorage.removeItem(
          FEED_SIDEBAR_CACHE_KEY
        );

        return null;
      }

      return parsed;
    } catch {
      return null;
    }
  };

const writeSidebarCache = (
  suggestedPeople: UserBasic[],
  featuredJobs: JobListing[]
) => {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  try {
    const payload: FeedSidebarCache =
      {
        savedAt: Date.now(),
        suggestedPeople,
        featuredJobs,
      };

    localStorage.setItem(
      FEED_SIDEBAR_CACHE_KEY,
      JSON.stringify(payload)
    );
  } catch {
    // Ignore storage errors.
  }
};

export default function FeedPage() {
  const { profile } =
    useAuthStore();

  const [posts, setPosts] = useState<Post[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }

    try {
      const cached = localStorage.getItem(
        "rhockstar_cached_feed_posts"
      );

      if (cached) {
        const parsed = JSON.parse(cached);

        if (
          Array.isArray(parsed) &&
          parsed.length > 0
        ) {
          return parsed;
        }
      }
    } catch {
      // Ignore malformed/unavailable local storage.
    }

    return [];
  });

  const [loading, setLoading] = useState(() => {
    if (typeof window === "undefined") {
      return true;
    }

    try {
      const cached = localStorage.getItem(
        "rhockstar_cached_feed_posts"
      );

      if (cached) {
        const parsed = JSON.parse(cached);

        if (
          Array.isArray(parsed) &&
          parsed.length > 0
        ) {
          return false;
        }
      }
    } catch {
      // Ignore malformed/unavailable local storage.
    }

    return true;
  });

  const [
    limitCount,
    setLimitCount,
  ] = useState(10);

  const [hasMore, setHasMore] =
    useState(true);

  const [
    isOnline,
    setIsOnline,
  ] = useState(true);

  const [
    isFromCache,
    setIsFromCache,
  ] = useState(false);

  const [
    networkSlow,
    setNetworkSlow,
  ] = useState(false);

  const { openSearch } =
    useSearchStore();

  const [
    suggestedPeople,
    setSuggestedPeople,
  ] = useState<UserBasic[]>([]);

  const [
    suggestedLoading,
    setSuggestedLoading,
  ] = useState(true);

  const [
    featuredJobs,
    setFeaturedJobs,
  ] = useState<JobListing[]>([]);

  const [
    jobsLoading,
    setJobsLoading,
  ] = useState(true);

  const [
    activeAds,
    setActiveAds,
  ] = useState<Advertisement[]>([]);

  const [
    connectingUserIds,
    setConnectingUserIds,
  ] = useState<Set<string>>(
    new Set()
  );

  const [
    sentRequestIds,
    setSentRequestIds,
  ] = useState<Set<string>>(
    new Set()
  );

  const observer =
    useRef<IntersectionObserver | null>(
      null
    );

  const syncTimerRef =
    useRef<ReturnType<
      typeof setTimeout
    > | null>(null);

  const hasServerSnapshotRef =
    useRef(false);

  // Hydrate cached sidebar immediately
  useEffect(() => {
    const cached =
      readSidebarCache();

    if (!cached) {
      return;
    }

    if (
      cached.suggestedPeople
        .length > 0
    ) {
      setSuggestedPeople(
        cached.suggestedPeople
      );
    }

    if (
      cached.featuredJobs
        .length > 0
    ) {
      setFeaturedJobs(
        cached.featuredJobs
      );
    }

    setSuggestedLoading(
      false
    );

    setJobsLoading(false);
  }, []);

  // Track browser connectivity
  useEffect(() => {
    if (
      typeof window ===
      "undefined"
    ) {
      return;
    }

    const clearSyncTimer =
      () => {
        if (
          syncTimerRef.current
        ) {
          clearTimeout(
            syncTimerRef.current
          );

          syncTimerRef.current =
            null;
        }
      };

    const startSyncTimer =
      () => {
        clearSyncTimer();

        setNetworkSlow(false);

        syncTimerRef.current =
          setTimeout(() => {
            if (
              !hasServerSnapshotRef.current
            ) {
              setNetworkSlow(
                true
              );
            }
          }, 4000);
      };

    const handleOnline = () => {
      setIsOnline(true);

      hasServerSnapshotRef.current =
        false;

      startSyncTimer();
    };

    const handleOffline =
      () => {
        setIsOnline(false);

        clearSyncTimer();

        setNetworkSlow(
          false
        );
      };

    const initialOnlineState =
      navigator.onLine;

    setIsOnline(
      initialOnlineState
    );

    if (initialOnlineState) {
      startSyncTimer();
    }

    window.addEventListener(
      "online",
      handleOnline
    );

    window.addEventListener(
      "offline",
      handleOffline
    );

    return () => {
      window.removeEventListener(
        "online",
        handleOnline
      );

      window.removeEventListener(
        "offline",
        handleOffline
      );

      clearSyncTimer();
    };
  }, []);

  const lastPostElementRef =
    useCallback(
      (
        node: HTMLDivElement
      ) => {
        if (
          loading ||
          !isOnline
        ) {
          return;
        }

        if (
          observer.current
        ) {
          observer.current.disconnect();
        }

        observer.current =
          new IntersectionObserver(
            (entries) => {
              if (
                entries[0]
                  ?.isIntersecting &&
                hasMore &&
                isOnline
              ) {
                setLimitCount(
                  (prev) =>
                    prev + 10
                );
              }
            }
          );

        if (node) {
          observer.current.observe(
            node
          );
        }
      },
      [
        loading,
        hasMore,
        isOnline,
      ]
    );

  const handleRefresh =
    async () => {
      if (
        typeof navigator !==
          "undefined" &&
        !navigator.onLine
      ) {
        await new Promise(
          (resolve) =>
            setTimeout(
              resolve,
              300
            )
        );

        return;
      }

      setLimitCount(10);

      await new Promise(
        (resolve) =>
          setTimeout(
            resolve,
            500
          )
      );
    };

  const searchParams =
    useSearchParams();

  const targetPostId =
    searchParams?.get(
      "postId"
    );

  // Main feed subscription
  useEffect(() => {
    let isCancelled = false;

    const unsubscribe =
      subscribeToFeed(
        limitCount,
        async (
          newPosts,
          meta
        ) => {
          if (isCancelled) {
            return;
          }

          const fromCache =
            meta?.fromCache ??
            false;

          setIsFromCache(
            fromCache
          );

          if (!fromCache) {
            hasServerSnapshotRef.current =
              true;

            setNetworkSlow(
              false
            );

            if (
              syncTimerRef.current
            ) {
              clearTimeout(
                syncTimerRef.current
              );

              syncTimerRef.current =
                null;
            }
          }

          if (
            targetPostId &&
            !newPosts.some(
              (post) =>
                post.id ===
                targetPostId
            ) &&
            typeof navigator !==
              "undefined" &&
            navigator.onLine
          ) {
            try {
              const res =
                await getPostById(
                  targetPostId
                );

              if (
                res.success &&
                res.post &&
                !isCancelled
              ) {
                setPosts([
                  res.post,

                  ...newPosts.filter(
                    (post) =>
                      post.id !==
                      targetPostId
                  ),
                ]);

                setLoading(
                  false
                );

                if (
                  !fromCache
                ) {
                  setHasMore(
                    newPosts.length >=
                      limitCount
                  );
                }

                return;
              }
            } catch (err) {
              console.error(
                "Error fetching targeted post:",
                err
              );
            }
          }

          setPosts(
            newPosts
          );

          setLoading(false);

          if (
            newPosts &&
            newPosts.length > 0
          ) {
            try {
              localStorage.setItem(
                "rhockstar_cached_feed_posts",
                JSON.stringify(
                  newPosts.slice(0, 25)
                )
              );
            } catch {
              // Ignore storage quota/privacy errors.
            }
          }

          if (!fromCache) {
            setHasMore(
              newPosts.length >=
                limitCount
            );
          }
        }
      );

    return () => {
      isCancelled = true;
      unsubscribe();
    };
  }, [
    limitCount,
    targetPostId,
  ]);

  // Sponsored ads stay live
  useEffect(() => {
    const unsubscribe =
      subscribeToActiveAds(
        (fetchedAds) => {
          setActiveAds(
            fetchedAds
          );
        }
      );

    return () =>
      unsubscribe();
  }, []);

  // Cache-first sidebar refresh
  useEffect(() => {
    let isCancelled = false;

    const cached =
      readSidebarCache();

    const fetchSidebarData =
      async () => {
        let nextPeople =
          cached?.suggestedPeople ??
          [];

        let nextJobs =
          cached?.featuredJobs ??
          [];

        if (
          !cached
            ?.suggestedPeople
            ?.length
        ) {
          setSuggestedLoading(
            true
          );
        }

        if (
          !cached
            ?.featuredJobs
            ?.length
        ) {
          setJobsLoading(
            true
          );
        }

        // Suggested users
        try {
          const [
            userRes,
            connRes,
          ] =
            await Promise.all([
              getAllUsers(false),

              profile?.uid
                ? getUserConnections(
                    profile.uid
                  )
                : Promise.resolve({
                    success: true,
                    connections:
                      [],
                  }),
            ]);

          if (
            !isCancelled &&
            userRes.success &&
            userRes.users
          ) {
            const connectedUserIds =
              new Set<string>();

            if (
              profile?.uid
            ) {
              connectedUserIds.add(
                profile.uid
              );
            }

            if (
              connRes.success &&
              connRes.connections
            ) {
              connRes.connections.forEach(
                (
                  connection: any
                ) => {
                  if (
                    connection.status ===
                      "accepted" ||
                    connection.status ===
                      "pending"
                  ) {
                    connectedUserIds.add(
                      connection.fromUserId ===
                        profile?.uid
                        ? connection.toUserId
                        : connection.fromUserId
                    );
                  }
                }
              );
            }

            nextPeople =
              userRes.users
                .filter(
                  (user) =>
                    !connectedUserIds.has(
                      user.uid
                    ) &&
                    user.fullName &&
                    user.fullName !==
                      "Unknown User"
                )
                .slice(
                  0,
                  5
                );

            setSuggestedPeople(
              nextPeople
            );
          }
        } catch (error) {
          console.error(
            "Failed to refresh suggested users:",
            error
          );
        } finally {
          if (
            !isCancelled
          ) {
            setSuggestedLoading(
              false
            );
          }
        }

        // Jobs
        try {
          const jobRes =
            await getJobs({
              limitCount: 4,
            });

          if (
            !isCancelled &&
            jobRes.success &&
            jobRes.jobs
          ) {
            nextJobs =
              jobRes.jobs;

            setFeaturedJobs(
              nextJobs
            );
          }
        } catch (error) {
          console.error(
            "Failed to refresh featured jobs:",
            error
          );
        } finally {
          if (
            !isCancelled
          ) {
            setJobsLoading(
              false
            );
          }
        }

        if (
          !isCancelled
        ) {
          writeSidebarCache(
            nextPeople,
            nextJobs
          );
        }
      };

    fetchSidebarData();

    return () => {
      isCancelled = true;
    };
  }, [profile?.uid]);

  const handleConnect =
    async (
      targetUserId: string,
      targetName: string
    ) => {
      if (!profile?.uid) {
        toast.error(
          "Please sign in to connect with users"
        );

        return;
      }

      if (!isOnline) {
        toast.error(
          "You're offline. Reconnect to send a connection request."
        );

        return;
      }

      setConnectingUserIds(
        (prev) =>
          new Set(
            prev
          ).add(
            targetUserId
          )
      );

      try {
        const res =
          await sendConnectionRequest(
            profile.uid,
            targetUserId
          );

        if (res.success) {
          setSentRequestIds(
            (prev) =>
              new Set(
                prev
              ).add(
                targetUserId
              )
          );

          toast.success(
            `Connection request sent to ${targetName}! 🎉`
          );
        } else {
          toast.error(
            res.error ||
              "Failed to send connection request"
          );
        }
      } catch {
        toast.error(
          "Failed to send connection request"
        );
      } finally {
        setConnectingUserIds(
          (prev) => {
            const next =
              new Set(
                prev
              );

            next.delete(
              targetUserId
            );

            return next;
          }
        );
      }
    };

  return (
    <PullToRefresh
      onRefresh={
        handleRefresh
      }
    >
      <div className="w-full max-w-6xl mx-auto px-1 sm:px-2 pb-16 lg:pb-6">
        {/* Header */}
        <div className="mb-4 sm:mb-6 space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>
                  Rhockstar Feed
                </span>

                <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Hub
                </span>
              </h1>

              <p className="text-xs sm:text-sm text-slate-400">
                Connect with
                people, join
                communities, and
                explore
                opportunities.
              </p>
            </div>

            <button
              onClick={
                openSearch
              }
              className="w-full sm:w-80 flex items-center gap-3 px-3.5 py-2 sm:py-2.5 bg-slate-900/80 hover:bg-slate-800 border border-white/10 rounded-2xl text-slate-400 hover:text-white transition-all shadow-inner group text-left"
            >
              <Search className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform shrink-0" />

              <span className="text-xs font-medium truncate">
                Search people,
                jobs,
                communities...
              </span>
            </button>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] sm:text-xs font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
                <Compass className="w-3.5 h-3.5 text-purple-400 shrink-0" />

                Public
                Communities
              </span>

              <Link
                href="/messages"
                className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-0.5"
              >
                Explore All

                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none -mx-1 px-1">
              {COMMUNITY_CHIPS.map(
                (chip) => (
                  <Link
                    key={
                      chip.name
                    }
                    href={`/messages?category=${encodeURIComponent(
                      chip.category
                    )}`}
                    className={`whitespace-nowrap px-3 py-1.5 rounded-xl bg-gradient-to-r ${chip.color} border text-xs font-bold flex items-center gap-1.5 hover:scale-105 transition-transform shrink-0`}
                  >
                    <span>
                      {
                        chip.icon
                      }
                    </span>

                    <span>
                      {
                        chip.name
                      }
                    </span>
                  </Link>
                )
              )}
            </div>
          </div>
        </div>

        {/* Mobile Suggestions */}
        {suggestedLoading ? (
          <div className="block lg:hidden mb-4 space-y-3">
            <div className="p-3 bg-slate-900/80 border border-white/5 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-purple-400" />
                  Suggested Connections
                </span>
              </div>

              <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
                {[1, 2].map(
                  (i) => (
                    <div
                      key={
                        i
                      }
                      className="p-2.5 bg-slate-800/40 border border-white/5 rounded-xl flex items-center gap-2 shrink-0 min-w-[210px] animate-pulse"
                    >
                      <div className="w-8 h-8 rounded-full bg-slate-700 shrink-0" />

                      <div className="min-w-0 flex-1 space-y-1.5">
                        <div className="h-3 bg-slate-700 rounded w-24" />
                        <div className="h-2 bg-slate-700/60 rounded w-16" />
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        ) : suggestedPeople.length >
          0 ? (
          <div className="block lg:hidden mb-4 space-y-3">
            <div className="p-3 bg-slate-900/80 border border-white/5 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-purple-400" />
                  Suggested Connections
                </span>

                <Link
                  href="/network"
                  className="text-[11px] font-medium text-purple-400 hover:underline"
                >
                  View All
                </Link>
              </div>

              <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
                {suggestedPeople.map(
                  (user) => (
                    <div
                      key={
                        user.uid
                      }
                      className="p-2.5 bg-slate-800/40 border border-white/5 rounded-xl flex items-center gap-2 shrink-0 min-w-[210px]"
                    >
                      <UserAvatar
                        name={
                          user.fullName
                        }
                        src={
                          user.avatar
                        }
                        className="w-8 h-8 text-xs font-bold shrink-0"
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1">
                          <Link
                            href={`/profile?uid=${user.uid}`}
                            className="font-bold text-white text-xs truncate block hover:underline"
                          >
                            {
                              user.fullName
                            }
                          </Link>

                          <VerifiedBadge
                            tier={
                              user.subscriptionTier
                            }
                          />
                        </div>

                        <p className="text-[10px] text-purple-300/80 truncate">
                          {user.headline ||
                            user.industry ||
                            user.accountType ||
                            "Member"}
                        </p>
                      </div>

                      {sentRequestIds.has(
                        user.uid
                      ) ? (
                        <span className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs shrink-0 flex items-center gap-1 font-semibold">
                          <Check className="w-3.5 h-3.5" />
                        </span>
                      ) : (
                        <button
                          onClick={() =>
                            handleConnect(
                              user.uid,
                              user.fullName
                            )
                          }
                          disabled={
                            connectingUserIds.has(
                              user.uid
                            ) ||
                            !isOnline
                          }
                          className="p-1.5 bg-purple-600/20 text-purple-300 hover:bg-purple-600 hover:text-white rounded-lg text-xs shrink-0 disabled:opacity-50"
                        >
                          {connectingUserIds.has(
                            user.uid
                          ) ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <UserPlus className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        ) : null}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
          {/* Main Feed */}
          <div className="lg:col-span-8 space-y-3.5">
            {networkSlow &&
              posts.length >
                0 && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
                  <WifiOff className="w-3.5 h-3.5 shrink-0" />

                  <span>
                    Connection is
                    slow. Showing
                    your latest
                    saved content.
                  </span>
                </div>
              )}

            {/* Profile Completion Onboarding & Reminder Banner */}
            <ProfileCompletionBanner />

            <PostComposer />

            {loading &&
            posts.length ===
              0 ? (
              <div className="space-y-3.5">
                {[1, 2, 3].map(
                  (i) => (
                    <PostCardSkeleton
                      key={
                        i
                      }
                    />
                  )
                )}
              </div>
            ) : posts.length >
              0 ? (
              <div className="space-y-3.5">
                {posts.map(
                  (
                    post,
                    index
                  ) => {
                    const adIndex =
                      Math.floor(
                        (index +
                          1) /
                          7
                      ) - 1;

                    const showAdAfterThisPost =
                      (index +
                        1) %
                        7 ===
                        0 &&
                      activeAds.length >
                        0;

                    const sponsoredAd =
                      showAdAfterThisPost
                        ? activeAds[
                            adIndex %
                              activeAds.length
                          ]
                        : null;

                    return (
                      <div
                        key={
                          post.id
                        }
                        className="space-y-3.5"
                      >
                        <div
                          ref={
                            posts.length ===
                            index +
                              1
                              ? lastPostElementRef
                              : null
                          }
                        >
                          <PostCard
                            post={
                              post
                            }
                          />
                        </div>

                        {sponsoredAd && (
                          <SponsoredAdCard
                            key={`ad-${sponsoredAd.id}-${index}`}
                            ad={
                              sponsoredAd
                            }
                          />
                        )}
                      </div>
                    );
                  }
                )}

                {hasMore &&
                  isOnline && (
                    <div className="flex justify-center py-6">
                      <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
                    </div>
                  )}

                {!hasMore &&
                  isOnline &&
                  !isFromCache && (
                    <div className="text-center py-6 text-slate-500 text-xs font-medium">
                      You have caught
                      up with all
                      posts!
                    </div>
                  )}
              </div>
            ) : !isOnline ? (
              <div className="neo-card flex items-center justify-center min-h-[30vh] p-6 text-center">
                <EmptyState
                  icon={
                    WifiOff
                  }
                  title="No saved posts available"
                  description="Reconnect to the internet and load your feed first. Recently viewed posts will then be available offline."
                />
              </div>
            ) : (
              <div className="neo-card flex items-center justify-center min-h-[30vh] p-6 text-center">
                <EmptyState
                  icon={
                    MessageSquarePlus
                  }
                  title="No posts yet"
                  description="Your feed is quiet. Be the first to start a conversation or connect with professionals."
                />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="hidden lg:flex flex-col gap-5 lg:col-span-4 sticky top-20">
            <div className="neo-card p-4 bg-slate-900/80 border border-white/5 rounded-2xl space-y-3">
              <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-400" />
                  People You May Know
                </h3>

                <Link
                  href="/network"
                  className="text-xs font-medium text-purple-400 hover:underline"
                >
                  See All
                </Link>
              </div>

              <div className="space-y-3">
                {suggestedLoading ? (
                  [1, 2, 3].map(
                    (i) => (
                      <div
                        key={
                          i
                        }
                        className="flex items-center gap-2.5 p-2 rounded-xl animate-pulse"
                      >
                        <div className="w-8 h-8 rounded-full bg-slate-700 shrink-0" />

                        <div className="min-w-0 flex-1 space-y-1.5">
                          <div className="h-3 bg-slate-700 rounded w-28" />
                          <div className="h-2 bg-slate-700/60 rounded w-16" />
                        </div>
                      </div>
                    )
                  )
                ) : suggestedPeople.length >
                  0 ? (
                  suggestedPeople.map(
                    (user) => (
                      <div
                        key={
                          user.uid
                        }
                        className="flex items-center justify-between gap-2 p-2 rounded-xl hover:bg-slate-800/50 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <UserAvatar
                            name={
                              user.fullName
                            }
                            src={
                              user.avatar
                            }
                            className="w-8 h-8 text-xs font-bold shrink-0"
                          />

                          <div className="min-w-0">
                            <div className="flex items-center gap-1">
                              <Link
                                href={`/profile?uid=${user.uid}`}
                                className="font-bold text-white text-xs truncate block hover:underline"
                              >
                                {
                                  user.fullName
                                }
                              </Link>

                              <VerifiedBadge
                                tier={
                                  user.subscriptionTier
                                }
                              />
                            </div>

                            <p className="text-[11px] text-purple-300/80 truncate">
                              {user.headline ||
                                user.industry ||
                                user.accountType ||
                                "Member"}
                            </p>
                          </div>
                        </div>

                        {sentRequestIds.has(
                          user.uid
                        ) ? (
                          <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-bold shrink-0 flex items-center gap-1 border border-emerald-500/30">
                            <Check className="w-3 h-3" />
                            <span>
                              Sent
                            </span>
                          </span>
                        ) : (
                          <button
                            onClick={() =>
                              handleConnect(
                                user.uid,
                                user.fullName
                              )
                            }
                            disabled={
                              connectingUserIds.has(
                                user.uid
                              ) ||
                              !isOnline
                            }
                            className="px-2.5 py-1 bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1 border border-purple-500/30 disabled:opacity-50"
                          >
                            {connectingUserIds.has(
                              user.uid
                            ) ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <>
                                <UserPlus className="w-3 h-3" />
                                <span>
                                  Connect
                                </span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    )
                  )
                ) : (
                  <p className="text-xs text-slate-500 text-center py-2">
                    No suggested
                    users found yet.
                  </p>
                )}
              </div>
            </div>

            <div className="neo-card p-4 bg-slate-900/80 border border-white/5 rounded-2xl space-y-3">
              <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-emerald-400" />
                  Jobs For You
                </h3>

                <Link
                  href="/jobs"
                  className="text-xs font-medium text-emerald-400 hover:underline"
                >
                  View Jobs
                </Link>
              </div>

              <div className="space-y-2.5">
                {jobsLoading ? (
                  [1, 2].map(
                    (i) => (
                      <div
                        key={
                          i
                        }
                        className="p-3 bg-slate-800/40 rounded-xl border border-white/5 space-y-2 animate-pulse"
                      >
                        <div className="h-3 bg-slate-700 rounded w-32" />
                        <div className="h-2 bg-slate-700/60 rounded w-20" />
                      </div>
                    )
                  )
                ) : featuredJobs.length >
                  0 ? (
                  featuredJobs.map(
                    (job) => (
                      <div
                        key={
                          job.id
                        }
                        className="p-3 bg-slate-800/40 rounded-xl border border-white/5 hover:border-emerald-500/30 transition-all space-y-1.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-bold text-white text-xs">
                              {
                                job.title
                              }
                            </h4>

                            <p className="text-[11px] text-slate-400">
                              {
                                job.company
                              }{" "}
                              •{" "}
                              {
                                job.location
                              }
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[11px] font-bold text-emerald-400">
                            {
                              job.salary
                            }
                          </span>

                          <Link
                            href="/jobs"
                            className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded-lg text-[11px] font-bold transition-all border border-emerald-500/30"
                          >
                            View Job
                          </Link>
                        </div>
                      </div>
                    )
                  )
                ) : (
                  <p className="text-xs text-slate-500 text-center py-2">
                    No active jobs
                    listed yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PullToRefresh>
  );
}