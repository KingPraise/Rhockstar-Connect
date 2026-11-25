"use client";

import { X } from "lucide-react";
import toast from "react-hot-toast";

import type { Chat, Message } from "@/lib/services/messages";
import { sendMessage } from "@/lib/services/messages";
import type { CommunityMessage } from "@/lib/services/communities";
import type { UserBasic } from "@/lib/services/users";
import UserAvatar from "@/components/ui/UserAvatar";

interface ForwardMessageModalProps {
  forwardingMessage: Message | CommunityMessage | null;
  onClose: () => void;
  chats: Chat[];
  activeChatId?: string;
  currentUserId: string;
  users: Record<string, UserBasic>;
}

export default function ForwardMessageModal({
  forwardingMessage,
  onClose,
  chats,
  activeChatId,
  currentUserId,
  users,
}: ForwardMessageModalProps) {
  if (!forwardingMessage) return null;

  const candidateChats = chats.filter((c) => c.id !== activeChatId);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[70vh]">
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <h3 className="text-base font-bold text-white">Forward Message</h3>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 mx-4 mt-3 bg-slate-800/60 rounded-xl border-l-4 border-brand">
          <p className="text-xs text-slate-300 truncate">
            {forwardingMessage.text || "Shared media"}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          <p className="text-xs text-slate-400 font-semibold mb-2">
            Select a conversation
          </p>
          {candidateChats.map((chat) => {
            const otherUserId =
              chat.participants.find((p) => p !== currentUserId) ||
              chat.participants[0];
            const otherUser = users[otherUserId];
            return (
              <button
                key={chat.id}
                onClick={async () => {
                  const hasMedia = Boolean(forwardingMessage.mediaUrl);
                  const forwardType = hasMedia
                    ? (forwardingMessage.type || "image")
                    : "text";
                  await sendMessage(
                    chat.id,
                    currentUserId,
                    `↩️ Forwarded: ${forwardingMessage.text || ""}`.trim(),
                    forwardType,
                    forwardingMessage.mediaUrl
                  );
                  toast.success(
                    `Forwarded to ${otherUser?.fullName || "chat"}`
                  );
                  onClose();
                }}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 transition-colors text-left"
              >
                <UserAvatar
                  src={otherUser?.avatar}
                  name={otherUser?.fullName || "User"}
                  className="w-10 h-10 rounded-full shrink-0"
                  textClassName="text-xs font-bold"
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {otherUser?.fullName || "User"}
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    @{otherUser?.username || "user"}
                  </p>
                </div>
              </button>
            );
          })}
          {candidateChats.length === 0 && (
            <p className="text-center text-slate-500 text-sm py-6">
              No other conversations to forward to
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
