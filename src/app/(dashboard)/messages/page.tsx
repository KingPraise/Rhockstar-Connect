"use client";

import { useEffect, useState, useRef } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { subscribeToChats, subscribeToMessages, sendMessage, Chat, Message, getOrCreateChat } from "@/lib/services/messages";
import { getAllUsers, UserBasic } from "@/lib/services/users";
import { Send, Search, Loader2, MessageSquarePlus, Check, CheckCheck } from "lucide-react";
import { markMessagesAsRead } from "@/lib/services/messages";

export default function MessagesPage() {
  const { profile } = useAuthStore();
  
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [users, setUsers] = useState<Record<string, UserBasic>>({});
  const [friends, setFriends] = useState<string[]>([]);
  
  const [showNewChat, setShowNewChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch all users and connections
    const fetchData = async () => {
      if (!profile?.uid) return;
      
      const { success, users } = await getAllUsers();
      if (success && users) {
        const usersMap: Record<string, UserBasic> = {};
        users.forEach(u => usersMap[u.uid] = u);
        setUsers(usersMap);
      }
      
      // Fetch accepted connections (friends)
      const { getUserConnections } = await import("@/lib/services/connections");
      const connRes = await getUserConnections(profile.uid);
      if (connRes.success && connRes.connections) {
        const acceptedIds = connRes.connections
          .filter(c => c.status === 'accepted')
          .map(c => c.fromUserId === profile.uid ? c.toUserId : c.fromUserId);
        setFriends(acceptedIds);
      }
    };
    fetchData();
  }, [profile?.uid]);

  useEffect(() => {
    if (!profile?.uid) return;
    
    // Subscribe to chats
    const unsubscribe = subscribeToChats(profile.uid, (fetchedChats) => {
      setChats(fetchedChats);
    });

    return () => unsubscribe();
  }, [profile?.uid]);

  useEffect(() => {
    if (!activeChat || !profile?.uid) return;
    
    // Subscribe to active chat messages
    const unsubscribe = subscribeToMessages(activeChat.id, (fetchedMessages) => {
      setMessages(fetchedMessages);
      markMessagesAsRead(activeChat.id, profile.uid);
    });

    return () => unsubscribe();
  }, [activeChat, profile?.uid]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatMessageTime = (timestamp: any) => {
    if (!timestamp) return "";
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return "";
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.uid || !activeChat || !newMessage.trim()) return;

    const text = newMessage;
    setNewMessage(""); // Optimistic clear
    
    await sendMessage(activeChat.id, profile.uid, text);
  };

  const startNewChat = async (otherUserId: string) => {
    if (!profile?.uid) return;
    setShowNewChat(false);
    
    const { success, chat } = await getOrCreateChat(profile.uid, otherUserId);
    if (success && chat) {
      setActiveChat(chat);
    }
  };

  if (!profile) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-100px)]">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </div>
    );
  }

  // Filter users for new chat: Only accepted friends (excluding self) matching search
  const availableUsers = Object.values(users).filter(
    (u) => u.uid !== profile.uid && 
           friends.includes(u.uid) &&
           u.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full h-[calc(100vh-100px)] gap-4 p-4 lg:p-6 lg:gap-8">
      
      {/* SIDEBAR: CHAT LIST */}
      <div className={`${activeChat ? 'hidden md:flex' : 'flex'} w-full md:w-[350px] lg:w-[400px] flex-col neo-card bg-slate-900/60 border border-white/5 rounded-3xl overflow-hidden shadow-2xl`}>
        <div className="p-6 border-b border-white/5 bg-slate-900/80 sticky top-0 z-10 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white tracking-tight">Messages</h2>
            <button 
              onClick={() => setShowNewChat(!showNewChat)}
              className="p-2 rounded-xl bg-brand/10 text-brand hover:bg-brand/20 transition-colors"
            >
              <MessageSquarePlus className="w-5 h-5" />
            </button>
          </div>
          
          <div className="relative group">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-brand transition-colors" />
            <input 
              type="text"
              placeholder={showNewChat ? "Search to start chat..." : "Search messages..."}
              className="w-full bg-slate-800/50 border border-white/5 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/50 transition-all shadow-inner"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-2">
          {showNewChat ? (
            // NEW CHAT VIEW
            <div className="space-y-1">
              <p className="px-3 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">Suggested Connections</p>
              {availableUsers.map(u => (
                <button
                  key={u.uid}
                  onClick={() => startNewChat(u.uid)}
                  className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-white/5 transition-colors text-left"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand to-brand-purple flex items-center justify-center shadow-lg flex-shrink-0">
                    <span className="text-lg font-bold text-white">{u.avatar}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{u.fullName}</h3>
                    <p className="text-sm text-slate-400">@{u.username}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            // EXISTING CHATS VIEW
            chats.length > 0 ? chats.map((chat) => {
              const otherUserId = chat.participants.find(p => p !== profile.uid) || chat.participants[0];
              const otherUser = users[otherUserId];
              
              if (!otherUser) return null;

              return (
                <button
                  key={chat.id}
                  onClick={() => setActiveChat(chat)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-left ${
                    activeChat?.id === chat.id 
                      ? 'bg-gradient-to-r from-brand/10 to-transparent border-l-2 border-brand shadow-inner' 
                      : 'hover:bg-white/5'
                  }`}
                >
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand to-brand-purple flex items-center justify-center shadow-lg flex-shrink-0">
                      <span className="text-lg font-bold text-white">{otherUser.avatar}</span>
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={`font-bold truncate ${activeChat?.id === chat.id ? 'text-brand' : 'text-white'}`}>
                        {otherUser.fullName}
                      </h3>
                    </div>
                    <p className="text-sm text-slate-400 truncate">
                      {chat.lastMessage || "No messages yet"}
                    </p>
                  </div>
                </button>
              );
            }) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                  <MessageSquarePlus className="w-8 h-8 text-slate-500" />
                </div>
                <p className="font-medium text-white mb-2">No messages yet</p>
                <p className="text-sm">Start a conversation with a connection!</p>
              </div>
            )
          )}
        </div>
      </div>

      {/* MAIN CONTENT: ACTIVE CHAT */}
      {activeChat ? (
        <div className="flex-1 flex flex-col neo-card bg-slate-900/60 border border-white/5 rounded-3xl overflow-hidden shadow-2xl relative">
          
          {/* Active Chat Header */}
          <div className="p-6 border-b border-white/5 bg-slate-900/80 backdrop-blur-md sticky top-0 z-10 flex items-center gap-4">
            <button 
              className="md:hidden p-2 -ml-2 text-slate-400 hover:text-white"
              onClick={() => setActiveChat(null)}
            >
              ← Back
            </button>
            
            {(() => {
              const otherUserId = activeChat.participants.find(p => p !== profile.uid) || activeChat.participants[0];
              const otherUser = users[otherUserId];
              
              return otherUser ? (
                <>
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand to-brand-purple flex items-center justify-center shadow-lg">
                    <span className="text-lg font-bold text-white">{otherUser.avatar}</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white leading-tight">{otherUser.fullName}</h2>
                    <p className="text-xs font-medium text-emerald-400">Online</p>
                  </div>
                </>
              ) : (
                <div className="animate-pulse flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/10" />
                  <div className="h-4 w-32 bg-white/10 rounded" />
                </div>
              );
            })()}
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="text-center">
              <span className="px-3 py-1 bg-white/5 rounded-full text-xs font-medium text-slate-500">
                Beginning of your conversation
              </span>
            </div>

            {messages.map((msg) => {
              const isMine = msg.senderId === profile.uid;
              const formattedTime = formatMessageTime(msg.createdAt);
              const isRead = msg.status === 'read';

              return (
                <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-2.5 flex flex-col gap-1 ${
                    isMine 
                      ? 'bg-gradient-to-br from-brand to-brand-purple text-white rounded-tr-sm shadow-[0_5px_15px_rgba(56,189,248,0.2)]' 
                      : 'bg-slate-800 text-slate-100 rounded-tl-sm border border-white/5'
                  }`}>
                    <p className="leading-relaxed text-sm md:text-base break-words">{msg.text}</p>
                    
                    {/* Timestamp & Status Ticks */}
                    <div className={`flex items-center gap-1 text-[10px] ${isMine ? 'justify-end text-white/80' : 'justify-start text-slate-400'}`}>
                      <span>{formattedTime}</span>
                      {isMine && (
                        isRead ? (
                          <CheckCheck className="w-3.5 h-3.5 text-cyan-200 inline" />
                        ) : (
                          <Check className="w-3.5 h-3.5 text-white/70 inline" />
                        )
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input - Embedded Send Button guarantee visible on mobile */}
          <div className="p-3 md:p-6 border-t border-white/5 bg-slate-900/80 backdrop-blur-md">
            <form onSubmit={handleSendMessage} className="relative flex items-center w-full">
              <input 
                type="text"
                placeholder="Type your message..."
                className="w-full bg-slate-800/60 border border-white/10 rounded-2xl pl-5 pr-14 py-3.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/50 transition-all shadow-inner"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button 
                type="submit"
                disabled={!newMessage.trim()}
                className="absolute right-1.5 p-2.5 rounded-xl bg-gradient-to-r from-brand to-brand-purple text-white shadow-md disabled:opacity-40 disabled:shadow-none transition-all active:scale-95 flex items-center justify-center cursor-pointer"
                aria-label="Send Message"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 flex-col items-center justify-center neo-card bg-slate-900/60 border border-white/5 rounded-3xl text-slate-400 p-8 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-5 mix-blend-screen pointer-events-none" />
          <div className="w-24 h-24 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(56,189,248,0.2)]">
            <Send className="w-10 h-10 text-brand ml-2" />
          </div>
          <h2 className="text-3xl font-extrabold text-white mb-3">Your Messages</h2>
          <p className="max-w-sm font-medium">Select a conversation from the sidebar or start a new chat to begin networking.</p>
        </div>
      )}
    </div>
  );
}
