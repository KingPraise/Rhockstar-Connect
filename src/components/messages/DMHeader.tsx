
"use client";

import Link from "next/link";
import { MoreVertical, User, Archive, Trash2 } from "lucide-react";
import type { Chat } from "@/lib/services/messages";
import type { UserBasic } from "@/lib/services/users";
import UserAvatar from "@/components/ui/UserAvatar";
import VerifiedBadge from "@/components/ui/VerifiedBadge";

interface DMHeaderProps {
  activeChat: Chat;
  currentUserId: string;
  otherUser: UserBasic | undefined;
  isOnline: boolean;
  statusText: string;
  menuOpen: boolean;
  onBack: () => void;
  onToggleMenu: () => void;
  onCloseMenu: () => void;
  onToggleArchive: (chatId: string, isArchived: boolean) => void;
  onDeleteChat: (chatId: string) => void;
}

export default function DMHeader({
  activeChat,
  currentUserId,
  otherUser,
  isOnline,
  statusText,
  menuOpen,
  onBack,
  onToggleMenu,
  onCloseMenu,
  onToggleArchive,
  onDeleteChat,
}: DMHeaderProps) {
  const otherUserId =
    activeChat.participants.find((id) => id !== currentUserId) ||
    activeChat.participants[0];

  const isArchived = activeChat.archivedFor?.includes(currentUserId) ?? false;

  return (
    <div className="p-4 sm:p-5 border-b border-white/5 bg-slate-900/80 backdrop-blur-md sticky top-0z-10 flex items-center justify-between gap-4 shrink-0">
      <div className="flex items-center gap-4 min-w-0">
        <button
          type="button"
          className="md:hidden p-2 -ml-2 text-slate-400 hover:text-white"
          onClick={onBack}
        >
          ← Back
        </button>

        {otherUser ? (
          <Link
            href={`/profile?uid=${otherUserId}`}
            className="flex items-center gap-4 group cursor-pointer min-w-0"
          >
            <div className="relative shrink-0">
              <UserAvatar
                src={otherUser.avatar}
                name={otherUser.fullName}
                className="w-12 h-12 group-hover:shadow-[0_0_15px_rgba(56,189,248,0.3)] transition-shadow"
                textClassName="text-lg font-bold"
              />

              {isOnline && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-900" />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="text-lg font-bold text-white leading-tight group-hover:text-brand transition-colors truncate">
                  {otherUser.fullName}
                </h2>
                <VerifiedBadge tier={otherUser.subscriptionTier} />
              </div>

              <p
                className={`text-xs font-medium ${
                  isOnline ? "text-emerald-400" : "text-slate-400"
                }`}
              >
                {statusText}
              </p>
            </div>
          </Link>
        ) : (
          <div className="flex items-center gap-3">
            <UserAvatar
              name="Member"
              className="w-10 h-10"
              textClassName="text-sm font-bold"
            />
            <h2 className="text-base font-bold text-white">
              Rhockstar Member
            </h2>
          </div>
        )}
      </div>

      <div className="relative shrink-0">
        <button
          type="button"
          onClick={onToggleMenu}
          className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors border border-white/5"
          title="Conversation Options"
          aria-label="Conversation options"
          aria-expanded={menuOpen}
        >
          <MoreVertical className="w-5 h-5" />
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-12 w-48 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl z-50 p-1 animate-in fade-in zoom-in-95 duration-150">
            <Link
              href={`/profile?uid=${otherUserId}`}
              className="w-full px-3.5 py-2.5 text-xs text-left text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl transition-colors flex items-center gap-2"
              onClick={onCloseMenu}
            >
              <User className="w-3.5 h-3.5 text-brand" />
              View Profile
            </Link>

            <button
              type="button"
              onClick={() => {
                onCloseMenu();
                onToggleArchive(activeChat.id, isArchived);
              }}
              className="w-full px-3.5 py-2.5 text-xs text-left text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl transition-colors flex items-center gap-2"
            >
              <Archive className="w-3.5 h-3.5 text-amber-400" />
              {isArchived ? "Unarchive Chat" : "Archive Chat"}
            </button>

            <button
              type="button"
              onClick={() => {
                onCloseMenu();
                onDeleteChat(activeChat.id);
              }}
              className="w-full px-3.5 py-2.5 text-xs text-left text-red-400 hover:bg-red-500/10 rounded-xl transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Chat
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
