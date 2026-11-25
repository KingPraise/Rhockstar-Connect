/* eslint-disable @next/next/no-img-element */
"use client";

import { useRef, useState } from "react";
import type { ChangeEvent, FormEvent, RefObject } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  AtSign,
  Check,
  Crown,
  FileText,
  Globe,
  Loader2,
  Lock,
  MessageSquare,
  MoreHorizontal,
  Paperclip,
  Reply,
  Search,
  Send,
  Shield,
  Sparkles,
  Trash2,
  UserX,
  Users,
  X,
} from "lucide-react";

import type {
  Community,
  CommunityAccessType,
  CommunityMessage,
  JoinRequestDetail,
} from "@/lib/services/communities";
import {
  deleteCommunityMessage,
  removeMemberFromCommunity,
} from "@/lib/services/communities";
import type { UserBasic } from "@/lib/services/users";
import type { UserProfile } from "@/store/useAuthStore";
import { useLightboxStore } from "@/store/useLightboxStore";

import PhotoEditor from "@/components/media/PhotoEditor";
import StardomBadge from "@/components/gamification/StardomBadge";
import StreakBadge from "@/components/gamification/StreakBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import UserAvatar from "@/components/ui/UserAvatar";
import VerifiedBadge from "@/components/ui/VerifiedBadge";

interface CommunityChannelViewProps {
  profile: UserProfile;
  activeCommunity: Community;
  setActiveCommunity: (
    updater: Community | null | ((prev: Community | null) => Community | null)
  ) => void;
  communityMessages: CommunityMessage[];
  users: Record<string, UserBasic>;

  isCommunityInfoOpen: boolean;
  setIsCommunityInfoOpen: (open: boolean) => void;

  communityMembersList: UserBasic[];
  setCommunityMembersList: (
    updater: UserBasic[] | ((prev: UserBasic[]) => UserBasic[])
  ) => void;
  isLoadingCommunityMembers: boolean;
  memberSearchQuery: string;
  setMemberSearchQuery: (query: string) => void;
  filteredCommunityMembers: UserBasic[];

  openMessageMenuId: string | null;
  setOpenMessageMenuId: (id: string | null) => void;

  communityReplyingTo: CommunityMessage | null;
  setCommunityReplyingTo: (msg: CommunityMessage | null) => void;

  setForwardingMessage: (msg: CommunityMessage) => void;

  newCommunityMessageText: string;
  setNewCommunityMessageText: (text: string) => void;
  sendingCommunityMsg: boolean;

  communityMediaFile: File | null;
  setCommunityMediaFile: (file: File | null) => void;
  communityMediaPreview: string | null;
  setCommunityMediaPreview: (url: string | null) => void;
  communityEditingImage: File | null;
  setCommunityEditingImage: (file: File | null) => void;

  handleCommunityFileSelect: (e: ChangeEvent<HTMLInputElement>) => void;
  handleCommunityEditorConfirm: (editedFile: File) => void;
  handleSendCommunityMessage: (e?: FormEvent<HTMLFormElement>) => void;

  handleJoinCommunity: (comm: Community) => void;
  handleLeaveCommunity: (comm: Community) => void;
  handleCancelJoinRequest: (comm: Community) => void;
  handleAcceptRequest: (comm: Community, req: JoinRequestDetail) => void;
  handleDeclineRequest: (comm: Community, userId: string) => void;
  handleUpdateCommunityAccess: (
    comm: Community,
    newAccess: CommunityAccessType
  ) => void;

  toTimestampDate: (value: unknown) => Date | null;
  formatMessageTime: (createdAt: unknown) => string;
  communityMessagesEndRef: RefObject<HTMLDivElement | null>;
}

export default function CommunityChannelView({
  profile,
  activeCommunity,
  setActiveCommunity,
  communityMessages,
  users,
  isCommunityInfoOpen,
  setIsCommunityInfoOpen,
  setCommunityMembersList,
  isLoadingCommunityMembers,
  memberSearchQuery,
  setMemberSearchQuery,
  filteredCommunityMembers,
  openMessageMenuId,
  setOpenMessageMenuId,
  communityReplyingTo,
  setCommunityReplyingTo,
  setForwardingMessage,
  newCommunityMessageText,
  setNewCommunityMessageText,
  sendingCommunityMsg,
  communityMediaFile,
  setCommunityMediaFile,
  communityMediaPreview,
  setCommunityMediaPreview,
  communityEditingImage,
  setCommunityEditingImage,
  handleCommunityFileSelect,
  handleCommunityEditorConfirm,
  handleSendCommunityMessage,
  handleJoinCommunity,
  handleLeaveCommunity,
  handleCancelJoinRequest,
  handleAcceptRequest,
  handleDeclineRequest,
  handleUpdateCommunityAccess,
  toTimestampDate,
  formatMessageTime,
  communityMessagesEndRef,
}: CommunityChannelViewProps) {
  const openLightbox = useLightboxStore((s) => s.openLightbox);
  const communityFileInputRef = useRef<HTMLInputElement>(null);
  const communityTextareaRef = useRef<HTMLTextAreaElement>(null);

  // @username mention autocomplete state inside Community Chat
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionStart, setMentionStart] = useState<number | null>(null);
  const [mentionEnd, setMentionEnd] = useState<number | null>(null);

  const handleCommunityInputChange = (value: string) => {
    setNewCommunityMessageText(value);

    const cursor = communityTextareaRef.current?.selectionStart ?? value.length;
    const textBefore = value.slice(0, cursor);
    const match = textBefore.match(/(^|[\s(])@([a-zA-Z0-9_]*)$/);

    if (!match) {
      setMentionQuery(null);
      setMentionStart(null);
      setMentionEnd(null);
      return;
    }

    setMentionQuery(match[2]);
    setMentionStart(cursor - match[2].length - 1);
    setMentionEnd(cursor);
  };

  const handleSelectCommunityMention = (member: UserBasic) => {
    if (mentionStart === null || mentionEnd === null) return;
    const cleanHandle = (member.username || "").trim();
    const inserted = `@${cleanHandle} `;
    const updated =
      newCommunityMessageText.slice(0, mentionStart) +
      inserted +
      newCommunityMessageText.slice(mentionEnd);
    const nextCursor = mentionStart + inserted.length;

    setNewCommunityMessageText(updated);
    setMentionQuery(null);
    setMentionStart(null);
    setMentionEnd(null);

    requestAnimationFrame(() => {
      communityTextareaRef.current?.focus();
      communityTextareaRef.current?.setSelectionRange(nextCursor, nextCursor);
    });
  };

  // Prioritize active community members first, then other users
  const communityMemberSet = new Set(activeCommunity.members || []);
  const mentionCandidates =
    mentionQuery === null
      ? []
      : Object.values(users)
          .filter(
            (u) =>
              u.uid !== profile.uid &&
              u.username &&
              (u.username.toLowerCase().includes(mentionQuery.toLowerCase()) ||
                u.fullName?.toLowerCase().includes(mentionQuery.toLowerCase()))
          )
          .sort((a, b) => {
            const aInComm = communityMemberSet.has(a.uid) ? 1 : 0;
            const bInComm = communityMemberSet.has(b.uid) ? 1 : 0;
            return bInComm - aInComm;
          })
          .slice(0, 6);

  return (
    <div className="flex-1 h-full flex flex-col neo-card bg-slate-900/60 border border-white/5 rounded-3xl overflow-hidden shadow-2xl relative min-w-0">
      {/* Community Header */}
      <div className="p-4 sm:p-5 border-b border-white/5 bg-slate-900/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <button
            className="md:hidden p-2 -ml-2 text-slate-400 hover:text-white"
            onClick={() => setActiveCommunity(null)}
          >
            ← Back
          </button>

          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-brand/10 text-2xl flex items-center justify-center shrink-0 border border-brand/20 shadow-inner">
            {activeCommunity.icon || "💬"}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm sm:text-base font-bold text-white">
                {activeCommunity.name}
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-800 text-brand border border-brand/20 shrink-0">
                {activeCommunity.category}
              </span>
              {activeCommunity.accessType === "private" && (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-purple-950/80 text-purple-300 border border-purple-500/30 shrink-0 flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" /> Private
                </span>
              )}
              {activeCommunity.accessType === "locked" && (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-rose-950/80 text-rose-300 border border-rose-500/30 shrink-0 flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" /> Locked
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-brand" />
              <span>{activeCommunity.memberCount} members</span>
            </p>
          </div>
        </div>

        {/* Info & Members Drawer Trigger */}
        <button
          onClick={() => setIsCommunityInfoOpen(!isCommunityInfoOpen)}
          className={`relative p-2.5 rounded-xl border transition-all ${
            isCommunityInfoOpen
              ? "bg-brand/20 text-brand border-brand/40"
              : "bg-slate-800/80 text-slate-400 hover:text-white border-white/5"
          }`}
          title="Community Members & Info"
        >
          <Users className="w-5 h-5" />
          {(activeCommunity.creatorId === profile.uid ||
            activeCommunity.admins?.includes(profile.uid)) &&
            (activeCommunity.pendingRequests?.length || 0) > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-extrabold flex items-center justify-center shadow-lg animate-pulse">
                {activeCommunity.pendingRequests?.length}
              </span>
            )}
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Group Chat Messages Stream or Non-Member Gated View */}
        {(activeCommunity.members || []).includes(profile.uid) ? (
          <div className="flex-1 flex flex-col justify-between overflow-hidden min-w-0">
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 custom-scrollbar">
              {communityMessages.length > 0 ? (
                (() => {
                  let commLastDate: Date | null = null;

                  return communityMessages.map((msg) => {
                    const isMe = msg.senderId === profile.uid;
                    const isCreator =
                      msg.senderId === activeCommunity.creatorId;

                    const msgDate = toTimestampDate(msg.createdAt);
                    const now = new Date();
                    const yesterday = new Date(now);
                    yesterday.setDate(yesterday.getDate() - 1);

                    const isSameDay = (d1: Date, d2: Date) =>
                      d1.getFullYear() === d2.getFullYear() &&
                      d1.getMonth() === d2.getMonth() &&
                      d1.getDate() === d2.getDate();

                    const showDateHeader = Boolean(
                      msgDate &&
                        (!commLastDate || !isSameDay(commLastDate, msgDate))
                    );

                    if (msgDate && showDateHeader) {
                      commLastDate = msgDate;
                    }

                    let dateLabel = msgDate
                      ? msgDate.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "";

                    if (msgDate && isSameDay(msgDate, now)) dateLabel = "Today";
                    else if (msgDate && isSameDay(msgDate, yesterday))
                      dateLabel = "Yesterday";

                    return (
                      <div
                        key={msg.id}
                        id={msg.id}
                        className="flex flex-col w-full"
                      >
                        {showDateHeader && (
                          <div className="flex justify-center my-3">
                            <span className="px-3 py-1 rounded-full bg-slate-800/90 border border-white/10 text-[11px] font-semibold text-slate-400 shadow-sm backdrop-blur-sm">
                              {dateLabel}
                            </span>
                          </div>
                        )}
                        <div
                          className={`flex w-full ${
                            isMe ? "justify-end" : "justify-start"
                          } mb-1`}
                        >
                          <div
                            className={`flex items-end gap-2 group relative max-w-[85vw] sm:max-w-[75%] ${
                              isMe ? "flex-row-reverse" : "flex-row"
                            }`}
                          >
                            <Link
                              href={`/profile?uid=${msg.senderId}`}
                              className="shrink-0 mb-1"
                            >
                              <UserAvatar
                                src={
                                  isMe ? profile?.avatar : msg.senderAvatar
                                }
                                name={
                                  isMe ? profile?.fullName : msg.senderName
                                }
                                className="w-8 h-8 rounded-full"
                                textClassName="text-[10px] font-bold"
                              />
                            </Link>

                            <div
                              onClick={() =>
                                !msg.isDeleted &&
                                setOpenMessageMenuId(
                                  openMessageMenuId === msg.id ? null : msg.id
                                )
                              }
                              className={`rounded-2xl px-4 py-2.5 relative shadow-md transition-all cursor-pointer ${
                                isMe
                                  ? "bg-gradient-to-r from-brand to-brand-purple text-slate-950 font-medium rounded-br-xs shadow-brand/10"
                                  : "bg-slate-800/90 text-white border border-white/10 rounded-bl-xs"
                              }`}
                            >
                              {!isMe && (
                                <div className="flex items-center gap-1.5 mb-1">
                                  <Link
                                    href={`/profile?uid=${msg.senderId}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-[11px] font-bold text-brand hover:underline flex items-center gap-1"
                                  >
                                    {msg.senderName}
                                    <VerifiedBadge
                                      tier={
                                        users[msg.senderId]?.subscriptionTier
                                      }
                                      size="xs"
                                    />
                                    {isCreator && (
                                      <span title="Community Creator">
                                        <Crown className="w-3 h-3 text-amber-400 fill-amber-400" />
                                      </span>
                                    )}
                                  </Link>
                                  {users[msg.senderId]?.stardomXP !==
                                    undefined && (
                                    <StardomBadge
                                      xp={users[msg.senderId]?.stardomXP || 0}
                                      variant="compact"
                                    />
                                  )}
                                  {users[msg.senderId]?.streakCount &&
                                  (users[msg.senderId]?.streakCount || 0) >
                                    0 ? (
                                    <StreakBadge
                                      streakCount={
                                        users[msg.senderId]?.streakCount || 0
                                      }
                                      size="sm"
                                    />
                                  ) : null}
                                </div>
                              )}

                              {msg.replyToText && (
                                <div
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (msg.replyToId) {
                                      const el = document.getElementById(
                                        msg.replyToId
                                      );
                                      if (el) {
                                        el.scrollIntoView({
                                          behavior: "smooth",
                                          block: "center",
                                        });
                                        el.classList.add(
                                          "animate-pulse",
                                          "bg-brand/20"
                                        );
                                        setTimeout(
                                          () =>
                                            el.classList.remove(
                                              "animate-pulse",
                                              "bg-brand/20"
                                            ),
                                          2000
                                        );
                                      }
                                    }
                                  }}
                                  className={`p-2 rounded-xl ${
                                    isMe ? "bg-black/20" : "bg-slate-700/50"
                                  } border-l-2 border-brand text-xs mb-1.5 cursor-pointer hover:opacity-100 transition-opacity opacity-80`}
                                >
                                  <span className="font-bold block text-[10px] text-brand">
                                    {msg.replyToSenderName || "User"}
                                  </span>
                                  <span className="line-clamp-2 text-[11px] whitespace-normal break-words">
                                    {msg.replyToText}
                                  </span>
                                </div>
                              )}

                              {msg.mediaUrl && (
                                <div className="mb-2">
                                  {msg.type === "image" ||
                                  (!msg.type &&
                                    (msg.mediaUrl.includes("/image/") ||
                                      msg.mediaUrl.match(
                                        /\.(jpeg|jpg|gif|png|webp)/i
                                      ))) ? (
                                    <img
                                      src={msg.mediaUrl}
                                      alt="Community media"
                                      className="rounded-xl max-h-60 w-full object-cover cursor-pointer hover:opacity-95 transition-opacity shadow-sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openLightbox([msg.mediaUrl!]);
                                      }}
                                    />
                                  ) : msg.type === "document" ? (
                                    <a
                                      href={msg.mediaUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      className={`flex items-center gap-2 p-2.5 rounded-xl ${
                                        isMe
                                          ? "bg-black/20 text-slate-950"
                                          : "bg-slate-700/60 text-white"
                                      } hover:opacity-90 transition-opacity`}
                                    >
                                      <FileText className="w-5 h-5 text-brand shrink-0" />
                                      <div className="min-w-0 flex-1">
                                        <p className="text-xs font-bold truncate">
                                          Attachment
                                        </p>
                                        <p className="text-[10px] opacity-75">
                                          Click to view/download
                                        </p>
                                      </div>
                                    </a>
                                  ) : null}
                                </div>
                              )}

                              {(!msg.mediaUrl ||
                                (msg.text &&
                                  msg.text !== "Sent an image" &&
                                  msg.text !== "Attachment")) && (
                                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                                  {msg.text
                                    .split(/(@[a-zA-Z0-9_]+)/g)
                                    .map((part, idx) =>
                                      part.startsWith("@") ? (
                                        <Link
                                          key={`${msg.id}-mention-${idx}`}
                                          href={`/profile?username=${encodeURIComponent(
                                            part.slice(1).trim()
                                          )}`}
                                          onClick={(e) => e.stopPropagation()}
                                          className={
                                            isMe
                                              ? "font-extrabold underline decoration-slate-950/60 hover:opacity-80"
                                              : "text-brand font-semibold hover:underline"
                                          }
                                        >
                                          {part}
                                        </Link>
                                      ) : (
                                        <span key={`${msg.id}-text-${idx}`}>
                                          {part}
                                        </span>
                                      )
                                    )}
                                </p>
                              )}

                              <div
                                className={`flex items-center justify-end gap-2 text-[10px] ${
                                  isMe
                                    ? "text-slate-950/70 font-semibold"
                                    : "text-slate-400 font-medium"
                                }`}
                              >
                                <span>{formatMessageTime(msg.createdAt)}</span>
                              </div>
                            </div>

                            {/* Message Actions (Dropdown) */}
                            {!msg.isDeleted && (
                              <div
                                className={`relative flex items-center self-center transition-opacity ${
                                  openMessageMenuId === msg.id
                                    ? "opacity-100"
                                    : "opacity-0 group-hover:opacity-100"
                                }`}
                              >
                                <button
                                  onClick={() =>
                                    setOpenMessageMenuId(
                                      openMessageMenuId === msg.id
                                        ? null
                                        : msg.id
                                    )
                                  }
                                  className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                                  title="Message options"
                                >
                                  <MoreHorizontal className="w-4 h-4" />
                                </button>

                                {openMessageMenuId === msg.id && (
                                  <div
                                    className={`absolute top-full ${
                                      isMe ? "right-0" : "left-0"
                                    } mt-1 w-32 bg-slate-900 border border-white/10 rounded-xl shadow-2xl z-50 py-1 flex flex-col`}
                                  >
                                    <button
                                      onClick={() => {
                                        setCommunityReplyingTo(msg);
                                        setOpenMessageMenuId(null);
                                        setTimeout(
                                          () =>
                                            communityTextareaRef.current?.focus(),
                                          50
                                        );
                                      }}
                                      className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-slate-800 text-slate-300"
                                    >
                                      <Reply className="w-3.5 h-3.5" /> Reply
                                    </button>
                                    <button
                                      onClick={() => {
                                        navigator.clipboard.writeText(msg.text);
                                        toast.success("Copied to clipboard");
                                        setOpenMessageMenuId(null);
                                      }}
                                      className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-slate-800 text-slate-300"
                                    >
                                      <svg
                                        className="w-3.5 h-3.5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                        />
                                      </svg>{" "}
                                      Copy
                                    </button>
                                    <button
                                      onClick={() => {
                                        setForwardingMessage(msg);
                                        setOpenMessageMenuId(null);
                                      }}
                                      className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-slate-800 text-slate-300"
                                    >
                                      <svg
                                        className="w-3.5 h-3.5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                                        />
                                      </svg>{" "}
                                      Forward
                                    </button>
                                    {(isMe ||
                                      activeCommunity.creatorId ===
                                        profile.uid) && (
                                      <button
                                        onClick={async () => {
                                          if (
                                            window.confirm(
                                              "Delete this message?"
                                            )
                                          ) {
                                            await deleteCommunityMessage(
                                              activeCommunity.id,
                                              msg.id
                                            );
                                            toast.success("Message deleted");
                                          }
                                          setOpenMessageMenuId(null);
                                        }}
                                        className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-slate-800 text-rose-400"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" /> Delete
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                  <EmptyState
                    icon={MessageSquare}
                    title="Welcome to the Community!"
                    description="Be the first to post a message to this public community."
                  />
                </div>
              )}
              <div ref={communityMessagesEndRef} />
            </div>

            {/* Community Attachment Preview Chip with Photo Re-Edit */}
            {communityMediaFile && (
              <div className="px-4 pt-3 pb-1 bg-slate-900/95 border-t border-white/5 flex items-center gap-3 animate-in slide-in-from-bottom duration-150">
                {communityMediaPreview ? (
                  <div className="relative shrink-0">
                    <img
                      src={communityMediaPreview}
                      alt="Attachment preview"
                      className="w-14 h-14 object-cover rounded-xl border border-brand/40 shadow-md"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setCommunityEditingImage(communityMediaFile)
                      }
                      className="absolute -bottom-1 -right-1 px-1.5 py-0.5 bg-black/80 hover:bg-black text-white rounded-md text-[10px] font-semibold flex items-center gap-0.5 border border-white/20 shadow"
                      title="Edit photo"
                    >
                      <Sparkles className="w-2.5 h-2.5 text-purple-400" />
                      <span>Edit</span>
                    </button>
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-brand shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">
                    {communityMediaFile.name}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {(communityMediaFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (communityMediaPreview)
                      URL.revokeObjectURL(communityMediaPreview);
                    setCommunityMediaFile(null);
                    setCommunityMediaPreview(null);
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                  title="Remove attachment"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Community Photo Editor */}
            {communityEditingImage && (
              <PhotoEditor
                image={communityEditingImage}
                onConfirm={handleCommunityEditorConfirm}
                onClose={() => setCommunityEditingImage(null)}
              />
            )}

            {/* Community Reply Banner */}
            {communityReplyingTo && (
              <div className="px-4 pt-3 pb-1 bg-slate-900/95 border-t border-white/5 animate-in slide-in-from-bottom duration-150">
                <div className="flex items-center gap-3 p-2.5 bg-slate-800/80 rounded-xl border-l-4 border-brand">
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold text-brand block">
                      {communityReplyingTo.senderId === profile.uid
                        ? "You"
                        : communityReplyingTo.senderName || "User"}
                    </span>
                    <span className="text-xs text-slate-300 truncate block">
                      {communityReplyingTo.text}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCommunityReplyingTo(null)}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Group Message Input with @Mention Autocomplete */}
            <form
              onSubmit={handleSendCommunityMessage}
              className="p-3.5 sm:p-4 border-t border-white/5 bg-slate-900/95 backdrop-blur-md flex items-end gap-2 sm:gap-3"
            >
              <input
                type="file"
                ref={communityFileInputRef}
                onChange={handleCommunityFileSelect}
                accept="image/*,.pdf,.doc,.docx"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => communityFileInputRef.current?.click()}
                disabled={sendingCommunityMsg}
                className="p-2.5 mb-0.5 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors shrink-0"
                title="Attach image or file"
              >
                <Paperclip className="w-5 h-5" />
              </button>

              <div className="relative flex-1 min-w-0 flex">
                {mentionQuery !== null && mentionCandidates.length > 0 && (
                  <div className="absolute bottom-full left-0 right-0 mb-2 max-h-60 overflow-y-auto rounded-2xl border border-white/10 bg-slate-900/95 backdrop-blur-xl shadow-2xl z-50 divide-y divide-white/5 custom-scrollbar">
                    <div className="p-2 px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between bg-slate-950/80 sticky top-0 z-10 border-b border-white/5">
                      <span className="flex items-center gap-1.5 text-purple-300">
                        <AtSign className="w-3.5 h-3.5 text-brand" /> Mention
                        Member
                      </span>
                    </div>
                    {mentionCandidates.map((u) => (
                      <button
                        key={u.uid}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleSelectCommunityMention(u)}
                        className="w-full p-2.5 px-3.5 flex items-center gap-3 hover:bg-white/5 active:bg-white/10 transition-colors text-left"
                      >
                        <UserAvatar
                          src={u.avatar}
                          name={u.fullName || u.username}
                          className="w-8 h-8 shrink-0"
                          textClassName="text-xs font-bold"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-white truncate">
                            {u.fullName}
                          </p>
                          <p className="text-xs text-brand font-medium truncate">
                            @{u.username?.trim()}
                          </p>
                        </div>
                        {communityMemberSet.has(u.uid) && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shrink-0">
                            Member
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                <textarea
                  ref={communityTextareaRef}
                  rows={1}
                  placeholder={`Message ${activeCommunity.name}... (type @ to mention)`}
                  value={newCommunityMessageText}
                  onChange={(e) => {
                    handleCommunityInputChange(e.target.value);
                    e.target.style.height = "auto";
                    e.target.style.height =
                      Math.min(e.target.scrollHeight, 150) + "px";
                    if (!e.target.value) e.target.style.height = "auto";
                  }}
                  onBlur={() => {
                    window.setTimeout(() => {
                      setMentionQuery(null);
                      setMentionStart(null);
                      setMentionEnd(null);
                    }, 150);
                  }}
                  onKeyDown={(e) => {
                    const isTouchDevice =
                      typeof window !== "undefined" &&
                      ("ontouchstart" in window ||
                        navigator.maxTouchPoints > 0);
                    if (
                      e.key === "Enter" &&
                      !e.shiftKey &&
                      !e.ctrlKey &&
                      !isTouchDevice
                    ) {
                      e.preventDefault();
                      setMentionQuery(null);
                      handleSendCommunityMessage();
                      e.currentTarget.style.height = "auto";
                    }
                  }}
                  className="flex-1 w-full bg-slate-800 border border-white/10 rounded-2xl px-4 py-2.5 sm:py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-brand shadow-inner resize-none min-h-[44px] max-h-[140px] overflow-y-auto"
                />
              </div>

              <button
                type="submit"
                disabled={
                  (!newCommunityMessageText.trim() && !communityMediaFile) ||
                  sendingCommunityMsg
                }
                className="p-3 mb-0.5 bg-gradient-to-r from-brand to-brand-purple text-slate-950 font-bold rounded-2xl hover:opacity-90 disabled:opacity-50 transition-opacity shadow-md shrink-0"
              >
                {sendingCommunityMsg ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </form>
          </div>
        ) : (
          /* Non-Member Gated Access View */
          <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 text-center max-w-lg mx-auto space-y-6">
            <div className="w-20 h-20 rounded-3xl bg-slate-800/80 border border-white/10 flex items-center justify-center text-4xl shadow-xl">
              {activeCommunity.icon || "💬"}
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-extrabold text-white tracking-tight">
                {activeCommunity.name}
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                {activeCommunity.description}
              </p>
            </div>

            {(() => {
              const hasRequested = activeCommunity.pendingRequests?.includes(
                profile.uid
              );
              const isPrivate = activeCommunity.accessType === "private";
              const isLocked = activeCommunity.accessType === "locked";

              if (isLocked) {
                return (
                  <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/20 text-rose-300 text-xs space-y-1 w-full max-w-sm">
                    <p className="font-bold flex items-center justify-center gap-1.5 text-rose-400">
                      <Lock className="w-4 h-4" /> Community Closed
                    </p>
                    <p className="text-slate-400">
                      This community is currently locked by the administrator.
                      New members are not accepted.
                    </p>
                  </div>
                );
              }

              if (isPrivate) {
                if (hasRequested) {
                  return (
                    <div className="p-6 rounded-3xl bg-slate-800/60 border border-amber-500/30 text-center space-y-4 w-full max-w-sm shadow-xl">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mx-auto text-xl">
                        ⏳
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-base">
                          Join Request Pending
                        </h4>
                        <p className="text-xs text-slate-400 mt-1">
                          Your request is waiting for review by the community
                          admin. You will gain access once approved.
                        </p>
                      </div>
                      <button
                        onClick={() => handleCancelJoinRequest(activeCommunity)}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors border border-white/10"
                      >
                        Cancel Join Request
                      </button>
                    </div>
                  );
                }

                return (
                  <div className="p-6 rounded-3xl bg-slate-800/60 border border-purple-500/30 text-center space-y-4 w-full max-w-sm shadow-xl">
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center mx-auto">
                      <Lock className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-base">
                        Private Community
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">
                        This community is exclusive. Submit a request to the
                        community administrator to participate.
                      </p>
                    </div>
                    <button
                      onClick={() => handleJoinCommunity(activeCommunity)}
                      className="w-full py-3 bg-gradient-to-r from-purple-600 to-brand text-white font-bold rounded-2xl text-xs shadow-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                    >
                      <Lock className="w-4 h-4" /> Request to Join
                    </button>
                  </div>
                );
              }

              return (
                <div className="space-y-4 w-full max-w-sm">
                  <div className="p-3 bg-brand/10 border border-brand/20 rounded-2xl text-xs text-brand">
                    Public Community • {activeCommunity.memberCount} members
                    already participating
                  </div>
                  <button
                    onClick={() => handleJoinCommunity(activeCommunity)}
                    className="w-full py-3 bg-gradient-to-r from-brand to-brand-purple text-slate-950 font-extrabold rounded-2xl text-sm shadow-lg hover:opacity-90 transition-opacity"
                  >
                    Join Community Now
                  </button>
                </div>
              );
            })()}
          </div>
        )}

        {/* Info & Members Side Panel Drawer */}
        {isCommunityInfoOpen && (
          <div className="w-80 bg-slate-900 border-l border-white/5 p-5 flex flex-col gap-6 overflow-y-auto animate-in slide-in-from-right duration-200 z-20 custom-scrollbar shrink-0">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="font-bold text-white text-sm">
                Community Details
              </h3>
              <button
                onClick={() => setIsCommunityInfoOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Info Card */}
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-3xl bg-brand/10 text-3xl flex items-center justify-center mx-auto border border-brand/20 shadow-inner">
                {activeCommunity.icon || "💬"}
              </div>
              <h4 className="font-bold text-white text-base">
                {activeCommunity.name}
              </h4>
              <p className="text-xs text-slate-400">
                {activeCommunity.description}
              </p>
              <div className="flex items-center justify-center gap-1.5 pt-1">
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-800 text-brand border border-brand/20">
                  {activeCommunity.category}
                </span>
                <span
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-md border flex items-center gap-1 ${
                    activeCommunity.accessType === "private"
                      ? "bg-purple-950/80 text-purple-300 border-purple-500/30"
                      : activeCommunity.accessType === "locked"
                        ? "bg-rose-950/80 text-rose-300 border-rose-500/30"
                        : "bg-emerald-950/80 text-emerald-300 border-emerald-500/30"
                  }`}
                >
                  {activeCommunity.accessType === "private" ? (
                    <>
                      <Lock className="w-2.5 h-2.5" /> Private
                    </>
                  ) : activeCommunity.accessType === "locked" ? (
                    <>
                      <Lock className="w-2.5 h-2.5" /> Locked
                    </>
                  ) : (
                    <>
                      <Globe className="w-2.5 h-2.5" /> Public
                    </>
                  )}
                </span>
              </div>
            </div>

            {/* ADMIN SETTINGS: ACCESS CONTROL */}
            {(activeCommunity.creatorId === profile.uid ||
              activeCommunity.admins?.includes(profile.uid)) && (
              <div className="p-3.5 bg-slate-800/40 rounded-2xl border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-brand" /> Access Control
                  </h4>
                  <span className="text-[10px] text-amber-400 font-bold">
                    Admin
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() =>
                      handleUpdateCommunityAccess(activeCommunity, "public")
                    }
                    className={`py-1.5 px-2 rounded-xl text-[10px] font-bold transition-all ${
                      (activeCommunity.accessType || "public") === "public"
                        ? "bg-emerald-600 text-white shadow-md"
                        : "bg-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    Public
                  </button>
                  <button
                    onClick={() =>
                      handleUpdateCommunityAccess(activeCommunity, "private")
                    }
                    className={`py-1.5 px-2 rounded-xl text-[10px] font-bold transition-all ${
                      activeCommunity.accessType === "private"
                        ? "bg-purple-600 text-white shadow-md"
                        : "bg-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    Private
                  </button>
                  <button
                    onClick={() =>
                      handleUpdateCommunityAccess(activeCommunity, "locked")
                    }
                    className={`py-1.5 px-2 rounded-xl text-[10px] font-bold transition-all ${
                      activeCommunity.accessType === "locked"
                        ? "bg-rose-600 text-white shadow-md"
                        : "bg-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    Locked
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">
                  {activeCommunity.accessType === "private"
                    ? "New members must request and be approved."
                    : activeCommunity.accessType === "locked"
                      ? "No new members can request or join."
                      : "Anyone can join with 1-click."}
                </p>
              </div>
            )}

            {/* ADMIN SETTINGS: PENDING JOIN REQUESTS */}
            {(activeCommunity.creatorId === profile.uid ||
              activeCommunity.admins?.includes(profile.uid)) && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <span>Join Requests</span>
                    {(activeCommunity.pendingRequests?.length || 0) > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                        {activeCommunity.pendingRequests?.length}
                      </span>
                    )}
                  </h4>
                </div>

                {(activeCommunity.pendingRequests?.length || 0) > 0 ? (
                  <div className="space-y-2">
                    {activeCommunity.pendingRequests?.map((reqUid) => {
                      const reqUser = users[reqUid] || {
                        uid: reqUid,
                        fullName: "Member Applicant",
                        avatar: "",
                      };
                      return (
                        <div
                          key={reqUid}
                          className="p-2.5 bg-slate-800/60 rounded-xl border border-white/5 flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <UserAvatar
                              src={reqUser.avatar}
                              name={reqUser.fullName}
                              className="w-8 h-8 rounded-full shrink-0"
                              textClassName="text-xs font-bold"
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-white truncate">
                                {reqUser.fullName}
                              </p>
                              {reqUser.username && (
                                <p className="text-[10px] text-slate-400 truncate">
                                  @{reqUser.username}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() =>
                                handleAcceptRequest(activeCommunity, {
                                  uid: reqUid,
                                  fullName: reqUser.fullName,
                                  username: reqUser.username,
                                  avatar: reqUser.avatar,
                                })
                              }
                              className="p-1.5 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded-lg transition-colors"
                              title="Accept Request"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() =>
                                handleDeclineRequest(activeCommunity, reqUid)
                              }
                              className="p-1.5 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white rounded-lg transition-colors"
                              title="Decline Request"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic p-2 bg-slate-800/20 rounded-xl border border-white/5 text-center">
                    No pending join requests
                  </p>
                )}
              </div>
            )}

            {/* Member Status & Join/Leave */}
            <div className="p-3 bg-slate-800/60 rounded-2xl border border-white/5 space-y-2 text-center">
              <div className="text-xs text-slate-300 font-medium">
                {(activeCommunity.members || []).length} Members
              </div>
              {(activeCommunity.members || []).includes(profile.uid) ? (
                <button
                  onClick={() => handleLeaveCommunity(activeCommunity)}
                  className="w-full py-2 bg-rose-600/20 text-rose-400 hover:bg-rose-600/30 rounded-xl text-xs font-bold transition-colors"
                >
                  Leave Community
                </button>
              ) : (
                <button
                  onClick={() => handleJoinCommunity(activeCommunity)}
                  className="w-full py-2 bg-brand text-slate-950 rounded-xl text-xs font-extrabold transition-opacity hover:opacity-90 shadow-md"
                >
                  {activeCommunity.accessType === "private"
                    ? "Request to Join"
                    : "Join Community"}
                </button>
              )}
            </div>

            {/* Creator Details */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Creator / Admin
              </h4>
              <div className="flex items-center gap-3 p-2.5 bg-slate-800/40 rounded-xl border border-white/5">
                <UserAvatar
                  src={activeCommunity.creatorAvatar}
                  name={activeCommunity.creatorName}
                  className="w-8 h-8 rounded-full"
                  textClassName="text-xs font-bold"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate flex items-center gap-1">
                    {activeCommunity.creatorName}
                    <Crown className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
                  </p>
                  <p className="text-[10px] text-amber-400 font-semibold">
                    Community Admin
                  </p>
                </div>
              </div>
            </div>

            {/* Community Members Directory */}
            <div className="space-y-2.5 pt-2 border-t border-white/5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-brand" />
                  Members ({(activeCommunity.members || []).length})
                </h4>
              </div>

              {(activeCommunity.members || []).length > 3 && (
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search members..."
                    value={memberSearchQuery}
                    onChange={(e) => setMemberSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-800/80 border border-white/5 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand/40"
                  />
                </div>
              )}

              {isLoadingCommunityMembers ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="w-5 h-5 animate-spin text-brand" />
                </div>
              ) : (
                <div className="space-y-1.5 max-h-64 overflow-y-auto custom-scrollbar pr-1">
                  {filteredCommunityMembers.map((member) => {
                    const isCreator = member.uid === activeCommunity.creatorId;
                    const isAdmin =
                      isCreator ||
                      activeCommunity.admins?.includes(member.uid);
                    const canRemove =
                      (profile.uid === activeCommunity.creatorId ||
                        activeCommunity.admins?.includes(profile.uid)) &&
                      member.uid !== profile.uid &&
                      member.uid !== activeCommunity.creatorId;

                    return (
                      <div
                        key={member.uid}
                        className="flex items-center justify-between gap-2 p-2 bg-slate-800/40 hover:bg-slate-800/70 rounded-xl border border-white/5 transition-colors group"
                      >
                        <Link
                          href={`/profile?uid=${member.uid}`}
                          className="flex items-center gap-2.5 min-w-0 flex-1 hover:opacity-90"
                          title="View Profile"
                        >
                          <UserAvatar
                            src={member.avatar}
                            name={member.fullName || member.username}
                            className="w-7 h-7 rounded-full shrink-0"
                            textClassName="text-[10px] font-bold"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-white truncate flex items-center gap-1">
                              <span>{member.fullName || member.username}</span>
                              {member.subscriptionTier && (
                                <VerifiedBadge
                                  tier={member.subscriptionTier}
                                  size="xs"
                                />
                              )}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate">
                              @{member.username}
                            </p>
                          </div>
                        </Link>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {isCreator ? (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center gap-0.5">
                              <Crown className="w-2.5 h-2.5" /> Admin
                            </span>
                          ) : isAdmin ? (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20 flex items-center gap-0.5">
                              <Shield className="w-2.5 h-2.5" /> Mod
                            </span>
                          ) : null}

                          {canRemove && (
                            <button
                              type="button"
                              onClick={async (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (
                                  window.confirm(
                                    `Remove ${
                                      member.fullName || member.username
                                    } from this community?`
                                  )
                                ) {
                                  const res = await removeMemberFromCommunity(
                                    activeCommunity.id,
                                    member.uid
                                  );
                                  if (res.success) {
                                    toast.success("Member removed");
                                    setCommunityMembersList((prev) =>
                                      prev.filter((m) => m.uid !== member.uid)
                                    );
                                    setActiveCommunity((prev) =>
                                      prev
                                        ? {
                                            ...prev,
                                            members: (prev.members || []).filter(
                                              (id) => id !== member.uid
                                            ),
                                            memberCount: Math.max(
                                              0,
                                              prev.memberCount - 1
                                            ),
                                          }
                                        : null
                                    );
                                  } else {
                                    toast.error(
                                      res.error || "Failed to remove member"
                                    );
                                  }
                                }
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-400 rounded transition-all"
                              title="Remove member"
                            >
                              <UserX className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {filteredCommunityMembers.length === 0 && (
                    <p className="text-xs text-slate-500 text-center py-2">
                      No members found
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
