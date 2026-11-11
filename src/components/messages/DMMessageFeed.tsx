"use client";

import type { RefObject } from "react";
import type { Message } from "@/lib/services/messages";
import type { UserBasic } from "@/lib/services/users";
import UserAvatar from "@/components/ui/UserAvatar";
import {
  Check,
  CheckCheck,
  Edit2,
  MoreHorizontal,
  Reply,
  Trash2,
} from "lucide-react";

interface DMMessageFeedProps {
  messages: Message[];
  currentUserId: string;
  currentUserAvatar?: string;
  currentUserName?: string;
  otherUser?: UserBasic;

  editingMessageId: string | null;
  editingText: string;
  setEditingText: (value: string) => void;
  onCancelEdit: () => void;
  onSaveEdit: (message: Message) => void;

  openMessageMenuId: string | null;
  onToggleMenu: (messageId: string) => void;
  onReply: (message: Message) => void;
  onEdit: (message: Message) => void;
  onCopy: (message: Message) => void;
  onForward: (message: Message) => void;
  onDelete: (message: Message, isOwnMessage: boolean) => void;

  formatMessageTime: (createdAt: unknown) => string;
  messagesEndRef: RefObject<HTMLDivElement | null>;
}

export default function DMMessageFeed({
  messages,
  currentUserId,
  currentUserAvatar,
  currentUserName,
  otherUser,
  editingMessageId,
  editingText,
  setEditingText,
  onCancelEdit,
  onSaveEdit,
  openMessageMenuId,
  onToggleMenu,
  onReply,
  onEdit,
  onCopy,
  onForward,
  onDelete,
  formatMessageTime,
  messagesEndRef,
}: DMMessageFeedProps) {
  let lastMessageDate: Date | null = null;

  const isSameDay = (first: Date, second: Date) =>
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate();

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 custom-scrollbar">
      {messages.map((msg) => {
        const isMe = msg.senderId === currentUserId;
        const isEditingThis = editingMessageId === msg.id;
        const isMenuOpen = openMessageMenuId === msg.id;

        if (msg.deletedForMe?.includes(currentUserId)) return null;

        const createdAt = msg.createdAt as {
          toDate?: () => Date;
        } | Date | string | number | null;

        let msgDate: Date;

        if (createdAt instanceof Date) {
          msgDate = createdAt;
        } else if (
          createdAt &&
          typeof createdAt === "object" &&
          "toDate" in createdAt &&
          typeof createdAt.toDate === "function"
        ) {
          msgDate = createdAt.toDate();
        } else if (
          typeof createdAt === "string" ||
          typeof createdAt === "number"
        ) {
          msgDate = new Date(createdAt);
        } else {
          msgDate = new Date();
        }

        const now = new Date();
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);

        const showDateHeader =
          !lastMessageDate || !isSameDay(lastMessageDate, msgDate);

        if (showDateHeader) {
          lastMessageDate = msgDate;
        }

        let dateLabel = msgDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });

        if (isSameDay(msgDate, now)) dateLabel = "Today";
        else if (isSameDay(msgDate, yesterday)) dateLabel = "Yesterday";

        return (
          <div key={msg.id} id={msg.id} className="flex flex-col w-full">
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
                className={`flex items-end gap-2 group relative max-w-[85vw] sm:max-w-[70%] ${
                  isMe ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <UserAvatar
                  src={isMe ? currentUserAvatar : otherUser?.avatar}
                  name={
                    isMe
                      ? currentUserName
                      : otherUser?.fullName || "Member"
                  }
                  className="w-7 h-7 rounded-full shrink-0 mb-1"
                  textClassName="text-[10px] font-bold"
                />

                <div
                  onClick={() =>
                    !isEditingThis &&
                    !msg.isDeleted &&
                    onToggleMenu(msg.id)
                  }
                  className={`rounded-2xl px-4 py-2.5 space-y-1 relative shadow-md transition-all cursor-pointer ${
                    isMe
                      ? "bg-gradient-to-r from-brand to-brand-purple text-slate-950 font-medium rounded-br-xs shadow-brand/10"
                      : "bg-slate-800/90 text-white border border-white/10 rounded-bl-xs"
                  }`}
                >
                  {msg.replyToText && (
                    <div
                      onClick={(event) => {
                        event.stopPropagation();

                        if (!msg.replyToId) return;

                        const element = document.getElementById(
                          msg.replyToId
                        );

                        if (element) {
                          element.scrollIntoView({
                            behavior: "smooth",
                            block: "center",
                          });
                          element.classList.add(
                            "animate-pulse",
                            "bg-brand/20"
                          );

                          setTimeout(
                            () =>
                              element.classList.remove(
                                "animate-pulse",
                                "bg-brand/20"
                              ),
                            2000
                          );
                        }
                      }}
                      className="p-2 rounded-xl bg-black/20 border-l-2 border-slate-950 text-xs mb-1.5 opacity-80 cursor-pointer hover:opacity-100 transition-opacity"
                    >
                      <span className="font-bold block text-[10px]">
                        Replying to:
                      </span>
                      <span className="line-clamp-2 text-[11px] whitespace-normal break-words">
                        {msg.replyToText}
                      </span>
                    </div>
                  )}

                  {isEditingThis ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editingText}
                        onChange={(event) =>
                          setEditingText(event.target.value)
                        }
                        className="w-full px-3 py-1.5 bg-slate-900 text-white text-xs rounded-xl border border-brand focus:outline-none"
                      />

                      <div className="flex justify-end gap-2 text-xs">
                        <button
                          type="button"
                          onClick={onCancelEdit}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                        >
                          Cancel
                        </button>

                        <button
                          type="button"
                          onClick={() => onSaveEdit(msg)}
                          className="px-2.5 py-1 rounded-lg bg-slate-950 text-brand font-bold"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : msg.isDeleted ? (
                    <p className="text-xs italic opacity-60 flex items-center gap-1">
                      <Trash2 className="w-3 h-3" />
                      This message was deleted
                    </p>
                  ) : (
                    <>
                      {msg.type === "image" && msg.mediaUrl && (
                        <a
                          href={msg.mediaUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full"
                        >
                          <img
                            src={msg.mediaUrl}
                            alt="Shared"
                            className="rounded-xl max-h-60 w-full object-cover mb-2 cursor-pointer hover:opacity-95 transition-opacity shadow-sm"
                            title="Click to view full image"
                          />
                        </a>
                      )}

                      {msg.type === "audio" && msg.mediaUrl && (
                        <div className="mb-2 w-full min-w-[220px] sm:min-w-[260px] max-w-full">
                          <audio
                            controls
                            src={msg.mediaUrl}
                            className="w-full h-10"
                          />
                        </div>
                      )}

                      {msg.type === "document" && msg.mediaUrl && (
                        <a
                          href={msg.mediaUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 p-2.5 mb-2 rounded-xl bg-black/20 hover:bg-black/30 transition-colors border border-white/10 w-full"
                        >
                          <span className="text-sm font-medium truncate flex-1">
                            {msg.text || "ViewDocument"}
                          </span>
                        </a>
                      )}

                      {(msg.type === "text" ||
                        (msg.type === "image" &&
                          msg.text !== "Sent an image") ||
                        (msg.type === "document" && !msg.mediaUrl)) &&
                        msg.text && (
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">
                            {msg.text}
                          </p>
                        )}
                    </>
                  )}

                  <div
                    className={`flex items-center justify-end gap-1.5 text-[10px] ${
                      isMe
                        ? "text-slate-950/70 font-semibold"
                        : "text-slate-400 font-medium"
                    }`}
                  >
                    {msg.isEdited && !msg.isDeleted && (
                      <span className="italic font-normal">(edited)</span>
                    )}

                    <span>{formatMessageTime(msg.createdAt)}</span>

                    {isMe && !msg.isDeleted && (
                      <div className="flex items-center ml-0.5">
                        {msg.status === "read" ? (
                          <span
                            title={`Read at ${formatMessageTime(
                              msg.readAt || msg.createdAt
                            )}`}
                          >
                            <CheckCheck className="w-3.5 h-3.5 text-blue-600" />
                          </span>
                        ) : (
                          <Check className="w-3 h-3 text-slate-950/60" />
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {!msg.isDeleted && !isEditingThis && (
                  <div
                    className={`relative flex items-center self-center transition-opacity ${
                      isMenuOpen
                        ? "opacity-100"
                        : "opacity-0 group-hover:opacity-100"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => onToggleMenu(msg.id)}
                      className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      title="Message options"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>

                    {isMenuOpen && (
                      <div
                        className={`absolute top-full ${
                          isMe ? "right-0" : "left-0"
                        } mt-1 w-32 bg-slate-900 border border-white/10 rounded-xl shadow-2xl z-50 py-1 flex flex-col`}
                      >
                        <button
                          type="button"
                          onClick={() => onReply(msg)}
                          className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-slate-800 text-slate-300"
                        >
                          <Reply className="w-3.5 h-3.5" />
                          Reply
                        </button>

                        {isMe && (
                          <button
                            type="button"
                            onClick={() => onEdit(msg)}
                            className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-slate-800 text-slate-300"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            Edit
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => onCopy(msg)}
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
                          </svg>
                          Copy
                        </button>

                        <button
                          type="button"
                          onClick={() => onForward(msg)}
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
                          </svg>
                          Forward
                        </button>

                        <button
                          type="button"
                          onClick={() => onDelete(msg, isMe)}
                          className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-slate-800 text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}

      <div ref={messagesEndRef} />
    </div>
  );
}
