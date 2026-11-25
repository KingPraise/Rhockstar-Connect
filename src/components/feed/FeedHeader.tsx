"use client";

import Link from "next/link";
import {
  Check,
  ChevronRight,
  Compass,
  Loader2,
  Search,
  UserPlus,
  Users,
} from "lucide-react";

import type { UserBasic } from "@/lib/services/users";
import UserAvatar from "@/components/ui/UserAvatar";
import VerifiedBadge from "@/components/ui/VerifiedBadge";

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

interface FeedHeaderProps {
  openSearch: () => void;
  suggestedLoading: boolean;
  suggestedPeople: UserBasic[];
  sentRequestIds: Set<string>;
  connectingUserIds: Set<string>;
  isOnline: boolean;
  handleConnect: (targetUserId: string, targetName: string) => void;
}

export default function FeedHeader({
  openSearch,
  suggestedLoading,
  suggestedPeople,
  sentRequestIds,
  connectingUserIds,
  isOnline,
  handleConnect,
}: FeedHeaderProps) {
  return (
    <>
      {/* Header */}
      <div className="mb-4 sm:mb-6 space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>Rhockstar Feed</span>
              <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Hub
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Connect with people, join communities, and explore opportunities.
            </p>
          </div>

          <button
            onClick={openSearch}
            className="w-full sm:w-80 flex items-center gap-3 px-3.5 py-2 sm:py-2.5 bg-slate-900/80 hover:bg-slate-800 border border-white/10 rounded-2xl text-slate-400 hover:text-white transition-all shadow-inner group text-left"
          >
            <Search className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform shrink-0" />
            <span className="text-xs font-medium truncate">
              Search people, jobs, communities...
            </span>
          </button>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] sm:text-xs font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              Public Communities
            </span>

            <Link
              href="/messages?category=All"
              className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-0.5"
            >
              Explore All
              <ChevronRight className="w-3 h-3" />
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

      {/* Mobile Suggested Connections */}
      {suggestedLoading ? (
        <div className="block lg:hidden mb-4 space-y-3">
          <div className="p-3.5 bg-slate-900/80 border border-white/5 rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-400" />
                Suggested Connections
              </span>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-1.5 scrollbar-none">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="p-3 bg-slate-800/40 border border-white/5 rounded-2xl flex items-center gap-3 shrink-0 min-w-[270px] animate-pulse"
                >
                  <div className="w-12 h-12 rounded-full bg-slate-700 shrink-0" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="h-3.5 bg-slate-700 rounded w-28" />
                    <div className="h-2.5 bg-slate-700/60 rounded w-20" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : suggestedPeople.length > 0 ? (
        <div className="block lg:hidden mb-4 space-y-3">
          <div className="p-3.5 bg-slate-900/80 border border-white/5 rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-400" />
                Suggested Connections
              </span>

              <Link
                href="/network"
                className="text-xs font-semibold text-purple-400 hover:underline"
              >
                View All
              </Link>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-1.5 scrollbar-none">
              {suggestedPeople.map((user) => (
                <div
                  key={user.uid}
                  className="p-3 bg-slate-800/60 border border-white/10 rounded-2xl flex items-center gap-3 shrink-0 min-w-[270px] shadow-sm hover:border-purple-500/30 transition-all"
                >
                  <UserAvatar
                    name={user.fullName}
                    src={user.avatar}
                    className="w-12 h-12 text-sm font-bold shrink-0 shadow-inner"
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/profile?uid=${user.uid}`}
                        className="font-bold text-white text-sm truncate block hover:underline"
                      >
                        {user.fullName}
                      </Link>
                      <VerifiedBadge tier={user.subscriptionTier} />
                    </div>

                    <p className="text-xs text-purple-300/80 truncate mt-0.5">
                      {user.headline ||
                        user.industry ||
                        user.accountType ||
                        "Member"}
                    </p>
                  </div>

                  {sentRequestIds.has(user.uid) ? (
                    <span className="p-2 px-3 bg-emerald-500/20 text-emerald-400 rounded-xl text-xs shrink-0 flex items-center gap-1.5 font-semibold border border-emerald-500/30">
                      <Check className="w-4 h-4" />
                      <span>Sent</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => handleConnect(user.uid, user.fullName)}
                      disabled={connectingUserIds.has(user.uid) || !isOnline}
                      className="p-2 px-3 bg-purple-600/20 text-purple-300 hover:bg-purple-600 hover:text-white rounded-xl text-xs font-semibold shrink-0 disabled:opacity-50 flex items-center gap-1.5 transition-all border border-purple-500/30"
                    >
                      {connectingUserIds.has(user.uid) ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4" />
                          <span>Connect</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
