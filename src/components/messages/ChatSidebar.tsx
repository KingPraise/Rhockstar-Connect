"use client";

import { useRef } from "react";
import type { MouseEvent, TouchEvent } from "react";
import {
  Archive,
  ArchiveRestore,
  CheckCheck,
  CheckCircle2,
  Compass,
  Globe,
  Inbox,
  Lock,
  Mail,
  MessageSquare,
  MessageSquarePlus,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  Trophy,
  Users,
  X,
} from "lucide-react";

import type { Chat } from "@/lib/services/messages";
import type { Community } from "@/lib/services/communities";
import { isCommunityUnread, markCommunityAsRead } from "@/lib/services/communities";
import type { UserBasic } from "@/lib/services/users";
import type { UserProfile } from "@/store/useAuthStore";

import StardomBadge from "@/components/gamification/StardomBadge";
import StreakBadge from "@/components/gamification/StreakBadge";
import LeaderboardView from "@/components/gamification/LeaderboardView";
import { EmptyState } from "@/components/ui/EmptyState";
import UserAvatar from "@/components/ui/UserAvatar";
import VerifiedBadge from "@/components/ui/VerifiedBadge";

export const CATEGORY_FILTERS = [
  "All",
  "Sports",
  "Tech & Career",
  "Hobbies",
  "Campus",
  "General",
];

interface ChatSidebarProps {
  profile: UserProfile;
  unreadCommunities: number;

  messagesMode: "direct" | "communities" | "leaderboard";
  setMessagesMode: (mode: "direct" | "communities" | "leaderboard") => void;

  chats: Chat[];
  activeChat: Chat | null;
  setActiveChat: (chat: Chat | null) => void;

  communities: Community[];
  filteredCommunities: Community[];
  joinedCommunities: Community[];
  discoverCommunities: Community[];
  activeCommunity: Community | null;
  setActiveCommunity: (community: Community | null) => void;

  communityCategory: string;
  setCommunityCategory: (category: string) => void;
  communityViewTab: "all" | "joined" | "discover";
  setCommunityViewTab: (tab: "all" | "joined" | "discover") => void;

  users: Record<string, UserBasic>;
  availableUsers: UserBasic[];

  showNewChat: boolean;
  setShowNewChat: (show: boolean) => void;
  setIsCreateCommunityOpen: (open: boolean) => void;

  searchQuery: string;
  setSearchQuery: (query: string) => void;

  chatTab: "inbox" | "archived";
  setChatTab: (tab: "inbox" | "archived") => void;

  activeMenuChatId: string | null;
  setActiveMenuChatId: (chatId: string | null) => void;

  swipedChatId: string | null;
  setSwipedChatId: (chatId: string | null) => void;
  swipingChatId: string | null;
  setSwipingChatId: (chatId: string | null) => void;
  swipeOffset: number;
  setSwipeOffset: (offset: number) => void;

  getUserStatus: (user: UserBasic) => { isOnline: boolean; text: string };
  formatMessageTime: (createdAt: unknown) => string;
  formatCommunityTime: (createdAt: unknown) => string;

  startNewChatWithUser: (otherUserId: string) => void;
  handleToggleArchive: (chatId: string, isArchived: boolean, e?: MouseEvent) => void;
  handleDeleteChat: (chatId: string, e?: MouseEvent) => void;
  handleMarkAsRead: (chatId: string, e?: MouseEvent) => void;
  handleMarkAsUnread: (chatId: string, e?: MouseEvent) => void;

  handleJoinCommunity: (comm: Community) => void;
  handleCancelJoinRequest: (comm: Community) => void;
}

export default function ChatSidebar({
  profile,
  unreadCommunities,
  messagesMode,
  setMessagesMode,
  chats,
  activeChat,
  setActiveChat,
  filteredCommunities,
  joinedCommunities,
  discoverCommunities,
  activeCommunity,
  setActiveCommunity,
  communityCategory,
  setCommunityCategory,
  communityViewTab,
  setCommunityViewTab,
  users,
  availableUsers,
  showNewChat,
  setShowNewChat,
  setIsCreateCommunityOpen,
  searchQuery,
  setSearchQuery,
  chatTab,
  setChatTab,
  activeMenuChatId,
  setActiveMenuChatId,
  swipedChatId,
  setSwipedChatId,
  swipingChatId,
  setSwipingChatId,
  swipeOffset,
  setSwipeOffset,
  getUserStatus,
  formatMessageTime,
  formatCommunityTime,
  startNewChatWithUser,
  handleToggleArchive,
  handleDeleteChat,
  handleMarkAsRead,
  handleMarkAsUnread,
  handleJoinCommunity,
  handleCancelJoinRequest,
}: ChatSidebarProps) {
  const touchStartXRef = useRef<number>(0);
  const touchStartYRef = useRef<number>(0);
  const touchStartTimeRef = useRef<number>(0);
  const isHorizontalSwipeRef = useRef<boolean>(false);
  const lastTapTimeRef = useRef<number>(0);

  const handleTouchStart = (_chatId: string, e: TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
    touchStartTimeRef.current = Date.now();
    isHorizontalSwipeRef.current = false;
  };

  const handleTouchMove = (chatId: string, e: TouchEvent) => {
    const diffX = e.touches[0].clientX - touchStartXRef.current;
    const diffY = e.touches[0].clientY - touchStartYRef.current;

    if (!isHorizontalSwipeRef.current) {
      if (Math.abs(diffX) > Math.abs(diffY) * 1.4 && Math.abs(diffX) > 14) {
        isHorizontalSwipeRef.current = true;
        setSwipingChatId(chatId);
      }
    }

    if (isHorizontalSwipeRef.current) {
      if (diffX < 0) {
        setSwipeOffset(Math.max(diffX, -160));
      } else if (swipedChatId === chatId) {
        setSwipeOffset(Math.min(0, -140 + diffX));
      } else {
        setSwipeOffset(0);
      }
    }
  };

  const handleTouchEnd = (chat: Chat, e: TouchEvent) => {
    const duration = Date.now() - touchStartTimeRef.current;
    const endX = e.changedTouches?.[0]?.clientX ?? touchStartXRef.current;
    const endY = e.changedTouches?.[0]?.clientY ?? touchStartYRef.current;
    const totalDiffX = Math.abs(endX - touchStartXRef.current);
    const totalDiffY = Math.abs(endY - touchStartYRef.current);

    if (!isHorizontalSwipeRef.current && totalDiffX < 12 && totalDiffY < 12 && duration < 500) {
      lastTapTimeRef.current = Date.now();
      if (swipedChatId === chat.id) {
        setSwipedChatId(null);
      } else {
        setActiveChat(chat);
      }
      setSwipingChatId(null);
      setSwipeOffset(0);
      isHorizontalSwipeRef.current = false;
      return;
    }

    if (isHorizontalSwipeRef.current) {
      if (swipeOffset < -60) {
        setSwipedChatId(chat.id);
      } else {
        setSwipedChatId(null);
      }
    }
    setSwipingChatId(null);
    setSwipeOffset(0);
    isHorizontalSwipeRef.current = false;
  };

  return (
    <div
      className={`${
        activeChat || activeCommunity ? "hidden md:flex" : "flex"
      } w-full md:w-[340px] lg:w-[380px] h-full flex-col neo-card bg-slate-900/60 border border-white/5 rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl shrink-0`}
    >
      {/* Header & Mode Bar */}
      <div className="p-4 border-b border-white/5 flex flex-col gap-3 bg-slate-900/80 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Messages</h2>
          {messagesMode === "direct" ? (
            <button
              onClick={() => setShowNewChat(true)}
              className="p-2 rounded-xl bg-brand/10 text-brand hover:bg-brand/20 transition-colors flex items-center gap-1.5 text-xs font-bold"
              title="Start New Chat"
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span className="hidden sm:inline">New Chat</span>
            </button>
          ) : (
            <button
              onClick={() => setIsCreateCommunityOpen(true)}
              className="p-2 rounded-xl bg-gradient-to-r from-brand to-brand-purple text-slate-950 hover:opacity-90 transition-opacity flex items-center gap-1.5 text-xs font-extrabold shadow-md"
              title="Create Community"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Create Community</span>
            </button>
          )}
        </div>

        {/* User Live Stardom Pill & Streak */}
        <div className="flex items-center justify-between gap-2 p-1.5 rounded-2xl bg-slate-950/80 border border-white/5">
          <StardomBadge
            xp={profile.stardomXP || 0}
            variant="progress-pill"
            className="w-full"
          />
          {profile.streakCount && profile.streakCount > 0 ? (
            <StreakBadge
              streakCount={profile.streakCount}
              showMultiplier={true}
              size="sm"
            />
          ) : null}
        </div>

        {/* Mode Switcher: DMs vs Public Communities vs Leaderboard */}
        <div className="flex bg-slate-950 p-1 rounded-2xl border border-white/10 gap-1">
          <button
            onClick={() => {
              setMessagesMode("direct");
              setActiveCommunity(null);
            }}
            className={`flex-1 py-2 text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-1 ${
              messagesMode === "direct"
                ? "bg-brand text-slate-950 shadow-md font-extrabold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <MessageSquare className="w-3 h-3" />
            Direct
          </button>
          <button
            onClick={() => {
              setMessagesMode("communities");
              setActiveChat(null);
            }}
            className={`flex-1 py-2 text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-1 ${
              messagesMode === "communities"
                ? "bg-brand text-slate-950 shadow-md font-extrabold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Globe className="w-3 h-3" />
            <span>Community 🌐</span>
            {unreadCommunities > 0 && (
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                  messagesMode === "communities"
                    ? "bg-slate-950 text-brand"
                    : "bg-emerald-500 text-white animate-pulse"
                }`}
              >
                {unreadCommunities > 99 ? "99+" : unreadCommunities}
              </span>
            )}
          </button>
          <button
            onClick={() => {
              setMessagesMode("leaderboard");
              setActiveChat(null);
              setActiveCommunity(null);
            }}
            className={`flex-1 py-2 text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-1 ${
              messagesMode === "leaderboard"
                ? "bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-md font-extrabold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Trophy className="w-3 h-3" />
            Ranks ⭐
          </button>
        </div>

        {/* Inbox / Archived Tab Switcher */}
        {messagesMode === "direct" && (
          <div className="flex bg-slate-800/60 p-1 rounded-xl border border-white/5 gap-1">
            <button
              onClick={() => {
                setChatTab("inbox");
                setShowNewChat(false);
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                chatTab === "inbox"
                  ? "bg-slate-700 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Inbox className="w-3.5 h-3.5" />
              Inbox
            </button>
            <button
              onClick={() => {
                setChatTab("archived");
                setShowNewChat(false);
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 relative ${
                chatTab === "archived"
                  ? "bg-slate-700 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Archive className="w-3.5 h-3.5" />
              Archived
              {chats.filter(
                (c) =>
                  profile?.uid &&
                  c.archivedFor?.includes(profile.uid) &&
                  !c.deletedFor?.includes(profile.uid)
              ).length > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] bg-brand text-slate-950 font-extrabold rounded-full ml-1">
                  {
                    chats.filter(
                      (c) =>
                        profile?.uid &&
                        c.archivedFor?.includes(profile.uid) &&
                        !c.deletedFor?.includes(profile.uid)
                    ).length
                  }
                </span>
              )}
            </button>
          </div>
        )}

        {/* Category Filters (For Public Communities mode) */}
        {messagesMode === "communities" && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {CATEGORY_FILTERS.map((cat) => (
              <button
                key={cat}
                onClick={() => setCommunityCategory(cat)}
                className={`px-3 py-1 rounded-xl text-[11px] font-bold shrink-0 transition-all ${
                  communityCategory === cat
                    ? "bg-brand/20 text-brand border border-brand/40"
                    : "bg-slate-800/80 text-slate-400 hover:text-white border border-white/5"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Search */}
      {messagesMode !== "leaderboard" && (
        <div className="p-4 border-b border-white/5 space-y-2.5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={
                messagesMode === "direct"
                  ? "Search conversations..."
                  : "Search communities e.g., Football..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-800/50 border border-white/5 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-brand/50 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {messagesMode === "communities" && (
            <div className="flex items-center gap-1.5 pt-0.5">
              <button
                onClick={() => setCommunityViewTab("all")}
                className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-bold transition-all text-center ${
                  communityViewTab === "all"
                    ? "bg-slate-700 text-white shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                All ({filteredCommunities.length})
              </button>

              <button
                onClick={() => setCommunityViewTab("joined")}
                className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-bold transition-all text-center flex items-center justify-center gap-1.5 ${
                  communityViewTab === "joined"
                    ? "bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 shadow-sm"
                    : "text-slate-400 hover:text-emerald-300 hover:bg-slate-800/60"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                Joined ({joinedCommunities.length})
              </button>

              <button
                onClick={() => setCommunityViewTab("discover")}
                className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-bold transition-all text-center flex items-center justify-center gap-1.5 ${
                  communityViewTab === "discover"
                    ? "bg-purple-600/30 text-purple-300 border border-purple-500/40 shadow-sm"
                    : "text-slate-400 hover:text-purple-300 hover:bg-slate-800/60"
                }`}
              >
                <Compass className="w-3 h-3 shrink-0" />
                Discover ({discoverCommunities.length})
              </button>
            </div>
          )}
        </div>
      )}

      {/* List Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* MODE 1: DIRECT MESSAGES */}
        {messagesMode === "direct" &&
          (showNewChat ? (
            <div className="p-2 space-y-1">
              <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider flex justify-between items-center">
                <span>Start New Conversation</span>
                <button
                  onClick={() => setShowNewChat(false)}
                  className="text-slate-400 hover:text-white text-xs"
                >
                  Cancel
                </button>
              </div>
              {availableUsers.length > 0 ? (
                availableUsers.map((u) => (
                  <button
                    key={u.uid}
                    onClick={() => startNewChatWithUser(u.uid)}
                    className="w-full p-3 flex items-center gap-3 hover:bg-slate-800/60 rounded-2xl transition-colors text-left"
                  >
                    <UserAvatar
                      src={u.avatar}
                      name={u.fullName}
                      className="w-10 h-10 shrink-0"
                      textClassName="text-sm font-bold"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-semibold text-white text-sm truncate">
                          {u.fullName}
                        </h3>
                        <VerifiedBadge tier={u.subscriptionTier} />
                      </div>
                      <p className="text-xs text-slate-400 truncate">
                        @{u.username}
                      </p>
                    </div>
                  </button>
                ))
              ) : (
                <p className="p-4 text-center text-slate-400 text-xs">
                  No professionals found matching &quot;{searchQuery}&quot;
                </p>
              )}
            </div>
          ) : (
            (() => {
              const seenUserIds = new Set<string>();
              const filteredChats = chats.filter((chat) => {
                if (!profile?.uid) return false;
                const isDeleted = chat.deletedFor?.includes(profile.uid);
                if (isDeleted) return false;

                const isArchived = chat.archivedFor?.includes(profile.uid);
                if (chatTab === "inbox" && isArchived) return false;
                if (chatTab === "archived" && !isArchived) return false;

                const otherUserId = chat.participants.find(
                  (p) => p !== profile.uid
                );
                if (otherUserId) {
                  if (seenUserIds.has(otherUserId)) return false;
                  seenUserIds.add(otherUserId);
                }

                const otherUser = otherUserId ? users[otherUserId] : null;
                if (!otherUser) return true;

                return (
                  otherUser.fullName
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                  otherUser.username
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                  (chat.lastMessage &&
                    chat.lastMessage
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase()))
                );
              });

              return filteredChats.length > 0 ? (
                filteredChats.map((chat) => {
                  const otherUserId =
                    chat.participants.find((p) => p !== profile.uid) ||
                    chat.participants[0];
                  const otherUser = users[otherUserId] || {
                    uid: otherUserId,
                    fullName: "Member",
                    username: "user",
                    avatar: "",
                    lastLogin: null,
                  };
                  const isTyping = chat.typingStatus?.[otherUserId];
                  const isActive = activeChat?.id === chat.id;
                  const unreadCount =
                    chat.unreadCount?.[profile?.uid || ""] || 0;
                  const isUnread = unreadCount > 0;
                  const isArchived = chat.archivedFor?.includes(profile.uid);

                  return (
                    <div
                      key={chat.id}
                      className={`relative border-b border-white/5 last:border-0 group/swipe select-none bg-slate-950 ${
                        activeMenuChatId === chat.id
                          ? "z-50 overflow-visible"
                          : "z-0 overflow-hidden"
                      }`}
                    >
                      {/* Swipe actions */}
                      <div
                        className={`absolute right-0 top-0 bottom-0 flex items-center h-full z-0 transition-opacity duration-150 ${
                          swipedChatId === chat.id || swipingChatId === chat.id
                            ? "opacity-100 pointer-events-auto"
                            : "opacity-0 pointer-events-none"
                        }`}
                      >
                        <button
                          onClick={(e) => {
                            setSwipedChatId(null);
                            handleToggleArchive(chat.id, !!isArchived, e);
                          }}
                          className="h-full px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold flex flex-col items-center justify-center gap-1 transition-colors text-xs shrink-0"
                        >
                          <Archive className="w-5 h-5 text-slate-950" />
                          <span className="text-[10px]">
                            {isArchived ? "Unarchive" : "Archive"}
                          </span>
                        </button>
                        <button
                          onClick={(e) => {
                            setSwipedChatId(null);
                            handleDeleteChat(chat.id, e);
                          }}
                          className="h-full px-4 bg-rose-600 hover:bg-rose-500 text-white font-extrabold flex flex-col items-center justify-center gap-1 transition-colors text-xs shrink-0"
                        >
                          <Trash2 className="w-5 h-5 text-white" />
                          <span className="text-[10px]">Delete</span>
                        </button>
                      </div>

                      <div
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            if (swipedChatId === chat.id) setSwipedChatId(null);
                            else setActiveChat(chat);
                          }
                        }}
                        onTouchStart={(e) => handleTouchStart(chat.id, e)}
                        onTouchMove={(e) => handleTouchMove(chat.id, e)}
                        onTouchEnd={(e) => handleTouchEnd(chat, e)}
                        onClick={() => {
                          if (Date.now() - lastTapTimeRef.current < 500) {
                            return;
                          }
                          if (swipedChatId === chat.id) {
                            setSwipedChatId(null);
                          } else {
                            setActiveChat(chat);
                          }
                        }}
                        style={{
                          transform: `translateX(${
                            swipingChatId === chat.id
                              ? `${swipeOffset}px`
                              : swipedChatId === chat.id
                                ? "-140px"
                                : "0px"
                          })`,
                        }}
                        className={`w-full p-4 flex items-center justify-between gap-3 transition-transform duration-200 ease-out text-left relative z-10 cursor-pointer ${
                          isActive
                            ? "bg-slate-800 text-white shadow-md border-l-4 border-brand"
                            : isUnread
                              ? "bg-slate-900 border-l-4 border-brand/70"
                              : "bg-slate-900 hover:bg-slate-850"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="relative shrink-0">
                            <UserAvatar
                              src={otherUser.avatar}
                              name={otherUser.fullName}
                              className={`w-12 h-12 transition-transform ${
                                isActive ? "scale-105 ring-2 ring-brand" : ""
                              }`}
                              textClassName="text-lg font-bold"
                            />
                            {getUserStatus(otherUser).isOnline && (
                              <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-900" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <div className="flex justify-between items-baseline mb-0.5">
                              <div className="flex items-center gap-1 min-w-0">
                                <h3
                                  className={`font-semibold truncate ${
                                    isActive || isUnread
                                      ? "text-white"
                                      : "text-slate-200"
                                  }`}
                                >
                                  {otherUser.fullName}
                                </h3>
                                <VerifiedBadge tier={otherUser.subscriptionTier} />
                              </div>
                              <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                                {formatMessageTime(chat.lastMessageTime)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-1">
                              <p
                                className={`text-sm truncate ${
                                  isTyping
                                    ? "text-brand font-medium animate-pulse"
                                    : isUnread
                                      ? "text-slate-200 font-medium"
                                      : "text-slate-400"
                                }`}
                              >
                                {isTyping
                                  ? "Typing..."
                                  : chat.lastMessage || "Start a conversation"}
                              </p>
                              {isUnread && (
                                <span className="w-2.5 h-2.5 rounded-full bg-brand shrink-0" />
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Options Dropdown Trigger (Tablet/Desktop only) */}
                        <div
                          className="hidden sm:block relative shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuChatId(
                                activeMenuChatId === chat.id ? null : chat.id
                              );
                            }}
                            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                            title="Chat Options"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>

                          {activeMenuChatId === chat.id && (
                            <div className="absolute right-0 top-8 w-44 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl z-[100] p-1 animate-in fade-in zoom-in-95 duration-150">
                              {isUnread ? (
                                <button
                                  onClick={(e) => handleMarkAsRead(chat.id, e)}
                                  className="w-full px-3 py-2 text-xs text-left text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl transition-colors flex items-center gap-2"
                                >
                                  <CheckCheck className="w-3.5 h-3.5 text-brand" />
                                  Mark as Read
                                </button>
                              ) : (
                                <button
                                  onClick={(e) =>
                                    handleMarkAsUnread(chat.id, e)
                                  }
                                  className="w-full px-3 py-2 text-xs text-left text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl transition-colors flex items-center gap-2"
                                >
                                  <Mail className="w-3.5 h-3.5 text-brand" />
                                  Mark as Unread
                                </button>
                              )}

                              <button
                                onClick={(e) =>
                                  handleToggleArchive(chat.id, !!isArchived, e)
                                }
                                className="w-full px-3 py-2 text-xs text-left text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl transition-colors flex items-center gap-2"
                              >
                                {isArchived ? (
                                  <>
                                    <ArchiveRestore className="w-3.5 h-3.5 text-amber-400" />
                                    Unarchive Chat
                                  </>
                                ) : (
                                  <>
                                    <Archive className="w-3.5 h-3.5 text-amber-400" />
                                    Archive Chat
                                  </>
                                )}
                              </button>

                              <button
                                onClick={(e) => handleDeleteChat(chat.id, e)}
                                className="w-full px-3 py-2 text-xs text-left text-red-400 hover:bg-red-500/10 rounded-xl transition-colors flex items-center gap-2"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Delete Chat
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                  <EmptyState
                    icon={chatTab === "archived" ? Archive : MessageSquarePlus}
                    title={
                      chatTab === "archived"
                        ? "No archived chats"
                        : "No messages yet"
                    }
                    description={
                      chatTab === "archived"
                        ? "Archived conversations will appear here."
                        : "Search for any professional to start a conversation!"
                    }
                  />
                </div>
              );
            })()
          ))}

        {/* MODE 2: PUBLIC COMMUNITIES DIRECTORY */}
        {messagesMode === "communities" &&
          (() => {
            const renderCommunityCard = (comm: Community, isJoined: boolean) => {
              const isActive = activeCommunity?.id === comm.id;
              const hasRequested = comm.pendingRequests?.includes(profile.uid);
              const isLocked = comm.accessType === "locked";
              const isPrivate = comm.accessType === "private";
              const isUnread =
                isJoined &&
                isCommunityUnread(comm) &&
                comm.lastSenderId !== profile.uid;
              const lastTimeStr = comm.lastMessageTime
                ? formatCommunityTime(comm.lastMessageTime)
                : "";

              return (
                <div
                  key={comm.id}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      markCommunityAsRead(comm.id);
                      setActiveCommunity(comm);
                    }
                  }}
                  onClick={() => {
                    markCommunityAsRead(comm.id);
                    setActiveCommunity(comm);
                  }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isActive
                      ? "bg-slate-800 border-brand/50 shadow-lg"
                      : "bg-slate-900/80 hover:bg-slate-800/60 border-white/5"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="relative shrink-0">
                      <div className="w-11 h-11 rounded-2xl bg-brand/10 text-2xl flex items-center justify-center border border-brand/20 shadow-inner">
                        {comm.icon || "💬"}
                      </div>
                      {isUnread && (
                        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-900 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <h3
                            className={`font-bold text-sm truncate ${
                              isUnread ? "text-white" : "text-slate-100"
                            }`}
                          >
                            {comm.name}
                          </h3>
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-800 text-slate-400 border border-white/5 shrink-0">
                            {comm.category}
                          </span>
                        </div>
                        {lastTimeStr && (
                          <span
                            className={`text-[10px] shrink-0 font-medium ${
                              isUnread
                                ? "text-emerald-400 font-bold"
                                : "text-slate-500"
                            }`}
                          >
                            {lastTimeStr}
                          </span>
                        )}
                      </div>
                      {comm.lastMessage ? (
                        <p
                          className={`text-xs truncate mb-1 ${
                            isUnread
                              ? "text-slate-200 font-semibold"
                              : "text-slate-400"
                          }`}
                        >
                          {comm.lastSenderName ? (
                            <span
                              className={
                                comm.lastSenderId === profile.uid
                                  ? "text-brand"
                                  : "text-slate-300 font-medium"
                              }
                            >
                              {comm.lastSenderId === profile.uid
                                ? "You: "
                                : `${comm.lastSenderName}: `}
                            </span>
                          ) : null}
                          {comm.lastMessage}
                        </p>
                      ) : (
                        <p className="text-xs text-slate-400 truncate mb-1">
                          {comm.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        <Users className="w-3 h-3 text-brand" />
                        <span>{comm.memberCount} members</span>
                        {comm.creatorId === profile.uid && (
                          <span className="text-amber-400 font-bold flex items-center gap-0.5">
                            • Creator
                          </span>
                        )}
                        {isJoined && (
                          <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                            • Member
                          </span>
                        )}
                        {isUnread && (
                          <span className="ml-auto text-[10px] font-black uppercase text-emerald-400 tracking-wider">
                            New Activity
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {(() => {
                    if (isJoined) {
                      return (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markCommunityAsRead(comm.id);
                            setActiveCommunity(comm);
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                            isUnread
                              ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-400"
                              : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-white/10"
                          }`}
                        >
                          {isUnread ? "Chat" : "Open"}
                        </button>
                      );
                    }

                    if (isLocked) {
                      return (
                        <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-rose-950/60 text-rose-400 border border-rose-500/20 shrink-0 flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Locked
                        </span>
                      );
                    }

                    if (isPrivate) {
                      if (hasRequested) {
                        return (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancelJoinRequest(comm);
                            }}
                            className="px-2.5 py-1.5 rounded-xl text-[10px] font-bold bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 border border-amber-500/30 transition-all shrink-0"
                            title="Click to cancel request"
                          >
                            ⏳ Pending
                          </button>
                        );
                      }
                      return (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleJoinCommunity(comm);
                          }}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-md transition-all shrink-0 flex items-center gap-1"
                        >
                          <Lock className="w-3 h-3" /> Request
                        </button>
                      );
                    }

                    return (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleJoinCommunity(comm);
                        }}
                        className="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md transition-all shrink-0"
                      >
                        Join
                      </button>
                    );
                  })()}
                </div>
              );
            };

            if (filteredCommunities.length === 0) {
              return (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                  <EmptyState
                    icon={Globe}
                    title="No communities found"
                    description="Be the first to create a community for this topic!"
                  />
                  <button
                    onClick={() => setIsCreateCommunityOpen(true)}
                    className="mt-4 px-4 py-2 bg-brand text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg"
                  >
                    <Plus className="w-4 h-4" />
                    Create Community
                  </button>
                </div>
              );
            }

            return (
              <div className="p-2 space-y-4">
                {(communityViewTab === "all" ||
                  communityViewTab === "joined") && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-2 pt-1 pb-0.5">
                      <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        My Communities
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {joinedCommunities.length} Joined
                      </span>
                    </div>

                    {joinedCommunities.length > 0 ? (
                      <div className="space-y-2">
                        {joinedCommunities.map((comm) =>
                          renderCommunityCard(comm, true)
                        )}
                      </div>
                    ) : (
                      <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-dashed border-white/10 text-center">
                        <p className="text-xs font-semibold text-slate-300">
                          You haven&apos;t joined any communities in this
                          category
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Explore the communities below and join conversations!
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {(communityViewTab === "all" ||
                  communityViewTab === "discover") && (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between px-2 pt-2 pb-0.5 border-t border-white/5">
                      <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Compass className="w-3.5 h-3.5 text-purple-400" />
                        Discover Communities
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {discoverCommunities.length} New
                      </span>
                    </div>

                    {discoverCommunities.length > 0 ? (
                      <div className="space-y-2">
                        {discoverCommunities.map((comm) =>
                          renderCommunityCard(comm, false)
                        )}
                      </div>
                    ) : (
                      <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-dashed border-white/10 text-center">
                        <p className="text-xs font-semibold text-slate-300">
                          No new communities to join in this category
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          You&apos;re already part of all available communities
                          here!
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })()}

        {/* MODE 3: LEADERBOARD / RANKS (Mobile View) */}
        {messagesMode === "leaderboard" && (
          <div className="md:hidden flex-1 flex flex-col p-2">
            <LeaderboardView />
          </div>
        )}

        {/* MODE 3: LEADERBOARD / RANKS (Desktop Sidebar Companion) */}
        {messagesMode === "leaderboard" && (
          <div className="hidden md:flex flex-col p-4 space-y-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-purple-600/10 to-slate-900 border border-amber-500/20">
              <div className="flex items-center gap-2 mb-2 text-amber-400 font-black text-sm">
                <Trophy className="w-4 h-4" />
                <span>Stardom Rankings</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                Earn XP by chatting, staying active daily, and engaging with
                communities to climb the Platform Hall of Fame.
              </p>
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-white/5 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Your XP:</span>
                  <span className="text-amber-400 font-mono font-bold">
                    {(profile.stardomXP || 0).toLocaleString()} XP
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Current Rank:</span>
                  <span className="text-white font-bold">
                    {profile.stardomRank || "Explorer"}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Daily Streak:</span>
                  <span className="text-orange-400 font-bold">
                    {profile.streakCount || 0} Days 🔥
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/50 border border-white/5 space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                How to Earn XP
              </h4>
              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand shrink-0" />
                  <span>Send a direct message (+5 XP)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />
                  <span>Message in public community (+8 XP)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                  <span>Keep daily streak active (Multiplier up to 2x)</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
