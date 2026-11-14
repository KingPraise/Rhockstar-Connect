"use client";

import Link from "next/link";
import { Users, Check, UserPlus, Loader2 } from "lucide-react";
import UserAvatar from "@/components/ui/UserAvatar";
import VerifiedBadge from "@/components/ui/VerifiedBadge";
import type { UserBasic } from "@/lib/services/users";

interface SuggestedPeopleSidebarProps {
  suggestedPeople: UserBasic[];
  suggestedLoading: boolean;
  sentRequestIds: Set<string>;
  connectingUserIds: Set<string>;
  isOnline: boolean;
  handleConnect: (targetUserId: string, targetName: string) => void;
}

export default function SuggestedPeopleSidebar({
  suggestedPeople,
  suggestedLoading,
  sentRequestIds,
  connectingUserIds,
  isOnline,
  handleConnect,
}: SuggestedPeopleSidebarProps) {
  return (
    <div className="neo-card p-4 bg-slate-900/80 border border-white/5 rounded-2xl space-y-3">
      <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
        <h3 className="font-bold text-white text-sm flex items-center gap-2">
          <Users className="w-4 h-4 text-purple-400" />
          <span>Suggested People</span>
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
          [1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center gap-2.5 p-2 rounded-xl animate-pulse"
            >
              <div className="w-8 h-8 rounded-full bg-slate-700 shrink-0" />
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="h-3 bg-slate-700 rounded w-28" />
                <div className="h-2 bg-slate-700/60 rounded w-16" />
              </div>
            </div>
          ))
        ) : suggestedPeople.length > 0 ? (
          suggestedPeople.map((user) => (
            <div
              key={user.uid}
              className="flex items-center justify-between gap-2 p-2 rounded-xl hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <UserAvatar
                  name={user.fullName}
                  src={user.avatar}
                  className="w-8 h-8 text-xs font-bold shrink-0"
                />

                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/profile?uid=${user.uid}`}
                      className="font-bold text-white text-xs truncate block hover:underline"
                    >
                      {user.fullName}
                    </Link>
                    <VerifiedBadge tier={user.subscriptionTier} />
                  </div>

                  <p className="text-[11px] text-purple-300/80 truncate">
                    {user.headline ||
                      user.industry ||
                      user.accountType ||
                      "Member"}
                  </p>
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
                  disabled={connectingUserIds.has(user.uid) || !isOnline}
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
          <p className="text-xs text-slate-500 text-center py-2">
            No suggested users found yet.
          </p>
        )}
      </div>
    </div>
  );
}
