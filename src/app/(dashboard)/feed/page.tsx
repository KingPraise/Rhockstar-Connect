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

import { sendConnectionRequest } from "@/lib/services/connections";

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

const FALLBACK_SUGGESTED_PEOPLE: UserBasic[] = [
  {
    uid: "vVGsCR7knwVrxIMYK8pmHDlVjho2",
    fullName: "Adewale Sunday",
    username: "fadasunday",
    avatar: "",
    headline: "Automobile Specialist",
    industry: "Automobiles",
    connections: 12,
    subscriptionTier: "pro",
  },
  {
    uid: "yY1Jk5UWZhNHXXYOVlfe5gmqCUx1",
    fullName: "Chinedu Emmanuel",
    username: "brazil",
    avatar: "",
    headline: "Fullstack Developer",
    industry: "Technology",
    connections: 8,
  },
  {
    uid: "DoLqoHeILXQygrgMJjQMOD6SWoo1",
    fullName: "Kemisola Adebayo",
    username: "wonuolami",
    avatar:
      "https://res.cloudinary.com/dkayul64b/image/upload/q_auto,f_auto/v1791388104/avatars/v0x4tmp8ctgmy6lcsa9a.jpg",
    headline: "Product Designer & UI Specialist",
    industry: "Tech & Career",
    connections: 15,
    subscriptionTier: "pro",
  },
  {
    uid: "0sBerfsz51XTXjngFJio2RgnAmb2",
    fullName: "Rhockstar Nation",
    username: "rnation",
    avatar:
      "https://res.cloudinary.com/dkayul64b/image/upload/q_auto,f_auto/v1791235215/avatars/wbboy1qsbzzz5pl5datq.jpg",
    headline: "Media & Creator Community",
    industry: "General",
    connections: 45,
    subscriptionTier: "elite",
  },
];

const FALLBACK_FEATURED_JOBS: JobListing[] = [
  {
    id: "GqRuqiXiK4L9yQaG9ofs",
    title: "Virtual Assistant",
    company: "Rhockstar Nation",
    location: "Lagos (Remote)",
    type: "Remote",
    salary: "₦50,000 / mo",
    description:
      "Support day-to-day remote operations, communication, scheduling, and administrative tasks.",
    postedAt: "Recently",
    logo:
      "https://res.cloudinary.com/dkayul64b/image/upload/q_auto,f_auto/v1791235215/avatars/wbboy1qsbzzz5pl5datq.jpg",
  },
  {
    id: "I4lkQDqmIsof3KzZhlU6",
    title: "Full-Stack Engineer (Next.js)",
    company: "Techstars Africa",
    location: "Remote",
    type: "Contract",
    salary: "$2,000 - $4,000/mo",
    description:
      "Build and maintain modern web applications using Next.js, React, APIs, and backend services.",
    postedAt: "Recently",
    logo: "T",
  },
  {
    id: "MDJ4NrfEukGyQ0L4HJr3",
    title: "Senior Product Designer",
    company: "Rhockstar Connect",
    location: "Lagos (Hybrid)",
    type: "Full-time",
    salary: "₦500k - ₦800k/mo",
    description:
      "Design user-focused product experiences, interfaces, and workflows across Rhockstar Connect.",
    postedAt: "Recently",
    logo: "R",
  },
];

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

export default function FeedPage() {
  const { profile } = useAuthStore();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const [limitCount, setLimitCount] = useState(10);
  const [hasMore, setHasMore] = useState(true);

  const [isOnline, setIsOnline] = useState(true);
  const [isFromCache, setIsFromCache] = useState(false);

  const { openSearch } = useSearchStore();

  // Dynamic DB state with guaranteed fallbacks
  const [suggestedPeople, setSuggestedPeople] =
    useState<UserBasic[]>(
      FALLBACK_SUGGESTED_PEOPLE
    );

  const [featuredJobs, setFeaturedJobs] =
    useState<JobListing[]>(
      FALLBACK_FEATURED_JOBS
    );

  const [activeAds, setActiveAds] =
    useState<Advertisement[]>([]);

  const [
    connectingUserIds,
    setConnectingUserIds,
  ] = useState<Set<string>>(new Set());

  const [
    sentRequestIds,
    setSentRequestIds,
  ] = useState<Set<string>>(new Set());

  const observer =
    useRef<IntersectionObserver | null>(
      null
    );

  const searchParams = useSearchParams();

  const targetPostId =
    searchParams?.get("postId");

  /**
   * Watch browser network state.
   */
  useEffect(() => {
    if (
      typeof window ===
      "undefined"
    )
      return;

    setIsOnline(
      navigator.onLine
    );

    const handleOnline = () => {
      setIsOnline(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

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
    };
  }, []);

  /**
   * Infinite scrolling.
   *
   * Disabled while offline because there is
   * no server available to retrieve more posts.
   */
  const lastPostElementRef =
    useCallback(
      (
        node: HTMLDivElement | null
      ) => {
        if (
          loading ||
          !isOnline
        )
          return;

        if (observer.current) {
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

  /**
   * Pull to refresh.
   *
   * Firestore already provides cached content
   * while offline, so avoid pretending to fetch
   * fresh server data with no connection.
   */
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
              400
            )
        );

        return;
      }

      setLimitCount(10);

      await new Promise(
        (resolve) =>
          setTimeout(
            resolve,
            800
          )
      );
    };

  /**
   * Subscribe to realtime posts feed.
   *
   * Firestore can return:
   * - local IndexedDB cached data
   * - fresh server data
   */
  useEffect(() => {
    let isCancelled = false;

    const unsubscribe =
      subscribeToFeed(
        limitCount,
        async (
          newPosts,
          meta
        ) => {
          if (isCancelled)
            return;

          setIsFromCache(
            meta?.fromCache ??
              false
          );

          /**
           * Deep-linked post loading.
           *
           * Avoid an unnecessary remote fetch when
           * we're definitely offline.
           */
          if (
            targetPostId &&
            !newPosts.some(
              (p) =>
                p.id ===
                targetPostId
            ) &&
            isOnline
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
                    (p) =>
                      p.id !==
                      targetPostId
                  ),
                ]);

                setLoading(
                  false
                );

                /**
                 * Only trust pagination status
                 * when this isn't merely a cached
                 * Firestore snapshot.
                 */
                if (
                  !meta?.fromCache
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

          setPosts(newPosts);

          setLoading(false);

          /**
           * A local cache can contain fewer documents
           * than actually exist on the server.
           *
           * Therefore only determine whether we've
           * reached the end when Firestore confirms
           * server-backed data.
           */
          if (
            !meta?.fromCache
          ) {
            if (
              newPosts.length <
              limitCount
            ) {
              setHasMore(
                false
              );
            } else {
              setHasMore(
                true
              );
            }
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
    isOnline,
  ]);

  /**
   * Subscribe to active sponsored ads.
   *
   * Existing production behaviour remains unchanged.
   */
  useEffect(() => {
    const unsubscribe =
      subscribeToActiveAds(
        (
          fetchedAds
        ) => {
          setActiveAds(
            fetchedAds
          );
        }
      );

    return () =>
      unsubscribe();
  }, []);

  /**
   * Fetch sidebar users and jobs.
   *
   * When offline, existing fallback data remains
   * visible instead of forcing network requests.
   */
  useEffect(() => {
    if (!isOnline) return;

    const fetchSidebarData =
      async () => {
        // Real Users
        try {
          const userRes =
            await getAllUsers(
              false
            );

          if (
            userRes.success &&
            userRes.users &&
            userRes.users
              .length > 0
          ) {
            const filtered =
              userRes.users
                .filter(
                  (u) =>
                    u.uid !==
                      profile?.uid &&
                    u.fullName &&
                    u.fullName !==
                      "Unknown User"
                )
                .slice(
                  0,
                  5
                );

            if (
              filtered.length >
              0
            ) {
              setSuggestedPeople(
                filtered
              );
            }
          }
        } catch (err) {
          console.error(
            "Failed to load suggested users:",
            err
          );
        }

        // Real Jobs
        try {
          const jobRes =
            await getJobs({
              limitCount: 4,
            });

          if (
            jobRes.success &&
            jobRes.jobs &&
            jobRes.jobs
              .length > 0
          ) {
            setFeaturedJobs(
              jobRes.jobs
            );
          }
        } catch (err) {
          console.error(
            "Failed to load featured jobs:",
            err
          );
        }
      };

    fetchSidebarData();
  }, [
    profile?.uid,
    isOnline,
  ]);

  /**
   * Connection requests are online actions.
   */
  const handleConnect = async (
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
        "You're offline. Connect to the internet to send a connection request."
      );
      return;
    }

    setConnectingUserIds(
      (prev) =>
        new Set(prev).add(
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
            new Set(prev);

          next.delete(
            targetUserId
          );

          return next;
        }
      );
    }
  };

  const showingCachedFeed =
    !isOnline ||
    isFromCache;

  return (
    <PullToRefresh
      onRefresh={
        handleRefresh
      }
    >
      <div className="w-full max-w-6xl mx-auto px-1 sm:px-2 pb-16 lg:pb-6">
        {/* Top Header & Search Section */}

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

            {/* Global Search Bar */}

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

          {/* Optional cache state inside feed */}

          {!isOnline &&
            posts.length >
              0 && (
              <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200">
                <WifiOff className="w-4 h-4 shrink-0 text-amber-400" />

                <div className="text-xs">
                  <span className="font-bold">
                    Saved feed
                  </span>

                  <span className="text-slate-400">
                    {" "}
                    — reconnect to
                    load newer
                    posts.
                  </span>
                </div>
              </div>
            )}

          {/* Community Discovery Categories Strip */}

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

        {suggestedPeople.length >
          0 && (
          <div className="block lg:hidden mb-4 space-y-3">
            <div className="p-3 bg-slate-900/80 border border-white/5 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-purple-400" />

                  Suggested
                  Connections
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
                  (
                    user
                  ) => (
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
        )}

        {/* Main Responsive Layout */}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
          {/* Main Feed */}

          <div className="lg:col-span-8 space-y-3.5">
            <PostComposer />

            {/* Posts Stream */}

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
                      ) -
                      1;

                    const showAdAfterThisPost =
                      (index +
                        1) %
                        7 ===
                        0 &&
                      activeAds.length >
                        0 &&
                      isOnline;

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
                  !showingCachedFeed && (
                    <div className="text-center py-6 text-slate-500 text-xs font-medium">
                      You have caught
                      up with all
                      posts!
                    </div>
                  )}

                {showingCachedFeed &&
                  !isOnline && (
                    <div className="text-center py-6 text-slate-500 text-xs font-medium">
                      Connect to the
                      internet to
                      load newer
                      posts.
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
                  description="Connect to the internet and open your feed first. Recently loaded posts will then be available offline."
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

          {/* Right Sidebar */}

          <div className="hidden lg:flex flex-col gap-5 lg:col-span-4 sticky top-20">
            {/* People You May Know */}

            <div className="neo-card p-4 bg-slate-900/80 border border-white/5 rounded-2xl space-y-3">
              <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-400" />

                  People You May
                  Know
                </h3>

                <Link
                  href="/network"
                  className="text-xs font-medium text-purple-400 hover:underline"
                >
                  See All
                </Link>
              </div>

              <div className="space-y-3">
                {suggestedPeople.length >
                0 ? (
                  suggestedPeople.map(
                    (
                      user
                    ) => (
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

            {/* Jobs Widget */}

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
                {featuredJobs.length >
                0 ? (
                  featuredJobs.map(
                    (
                      job
                    ) => (
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