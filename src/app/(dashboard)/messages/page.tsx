"use client";

import { useEffect, useState, useRef } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { subscribeToChats, subscribeToMessages, sendMessage, Chat, Message, getOrCreateChat, updateTypingStatus, markMessagesAsRead } from "@/lib/services/messages";
import { getAllUsers, UserBasic } from "@/lib/services/users";
import { Send, Search, Loader2, MessageSquarePlus, Check, CheckCheck, Image as ImageIcon, Mic, Square, FileText } from "lucide-react";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import toast from "react-hot-toast";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";

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
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeChat || !profile?.uid) return;
    
    // Validate file
    const isImage = file.type.startsWith('image/');
    const isDoc = file.type.includes('pdf') || file.type.includes('document') || file.name.endsWith('.pdf') || file.name.endsWith('.doc') || file.name.endsWith('.docx');
    
    if (!isImage && !isDoc) {
      toast.error("Please select a valid image or document file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB.");
      return;
    }

    try {
      setIsUploadingImage(true);
      const timestamp = Date.now();
      const storageRef = ref(storage, `chats/${activeChat.id}/${timestamp}_${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      const type = isImage ? 'image' : 'document';
      const msgText = isImage ? "Sent an image" : file.name;
      
      await sendMessage(activeChat.id, profile.uid, msgText, type, downloadURL);
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload file. Please try again.");
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const [isRecording, setIsRecording] = useState(false);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        if (!activeChat || !profile?.uid) return;
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        try {
          setIsUploadingAudio(true);
          const timestamp = Date.now();
          const storageRef = ref(storage, `chats/${activeChat.id}/${timestamp}_audio.webm`);
          await uploadBytes(storageRef, audioBlob);
          const downloadURL = await getDownloadURL(storageRef);
          
          await sendMessage(activeChat.id, profile.uid, "Sent a voice note", "audio", downloadURL);
        } catch (error) {
          console.error("Error uploading audio:", error);
          toast.error("Failed to upload voice note.");
        } finally {
          setIsUploadingAudio(false);
          // Stop all tracks to release mic
          stream.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      toast.error("Could not access microphone. Please check your permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

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
    
    // Clear typing status
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    updateTypingStatus(activeChat.id, profile.uid, false);
    
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
              <div className="h-full flex flex-col items-center justify-center">
                <EmptyState 
                  icon={MessageSquarePlus}
                  title="No messages yet"
                  description="Start a conversation with a connection!"
                />
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
                    {msg.type === 'image' && msg.mediaUrl ? (
                      <div className="rounded-xl overflow-hidden mb-1 relative bg-slate-900/50">
                        <img src={msg.mediaUrl} alt="Attachment" className="max-w-full h-auto max-h-64 object-contain" />
                        {msg.text !== "Sent an image" && <p className="leading-relaxed text-sm md:text-base break-words mt-2 px-1">{msg.text}</p>}
                      </div>
                    ) : msg.type === 'document' && msg.mediaUrl ? (
                      <a href={msg.mediaUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 mb-1 bg-slate-900/50 rounded-xl border border-white/10 hover:bg-slate-900/80 transition-colors">
                        <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium truncate min-w-0 max-w-[150px] md:max-w-[200px]">{msg.text}</span>
                      </a>
                    ) : msg.type === 'audio' && msg.mediaUrl ? (
                      <div className="mb-1">
                        <audio controls className="max-w-[200px] md:max-w-[250px] h-10">
                          <source src={msg.mediaUrl} type="audio/webm" />
                        </audio>
                      </div>
                    ) : (
                      <p className="leading-relaxed text-sm md:text-base break-words">{msg.text}</p>
                    )}
                    
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
            {(() => {
               const otherUserId = activeChat.participants.find(p => p !== profile?.uid) || activeChat.participants[0];
               const isTyping = activeChat.typingStatus?.[otherUserId];
               if (isTyping) {
                 return (
                   <div className="flex justify-start">
                     <div className="bg-slate-800 text-slate-400 rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm flex items-center gap-1.5 border border-white/5">
                       <span className="w-1.5 h-1.5 rounded-full bg-brand/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                       <span className="w-1.5 h-1.5 rounded-full bg-brand/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                       <span className="w-1.5 h-1.5 rounded-full bg-brand/60 animate-bounce" style={{ animationDelay: '300ms' }} />
                     </div>
                   </div>
                 );
               }
               return null;
            })()}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input - Embedded Send Button guarantee visible on mobile */}
          <div className="p-3 md:p-6 border-t border-white/5 bg-slate-900/80 backdrop-blur-md">
            <form onSubmit={handleSendMessage} className="relative flex items-center w-full bg-slate-800/60 border border-white/10 rounded-2xl pl-[4.5rem] pr-14 py-1.5 focus-within:border-brand/50 focus-within:ring-1 focus-within:ring-brand/50 transition-all shadow-inner">
              <input 
                type="file" 
                accept="image/*,application/pdf,.doc,.docx" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
              />
              <div className="absolute left-1.5 bottom-1.5 flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingImage || isRecording || isUploadingAudio}
                  className="p-2 rounded-xl text-slate-400 hover:text-brand hover:bg-white/5 transition-colors disabled:opacity-50"
                  title="Attach Photo"
                >
                  {isUploadingImage ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5" />}
                </button>
                <button
                  type="button"
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isUploadingAudio || isUploadingImage}
                  className={`p-2 rounded-xl transition-colors disabled:opacity-50 ${isRecording ? 'text-red-500 bg-red-500/10 hover:bg-red-500/20' : 'text-slate-400 hover:text-brand hover:bg-white/5'}`}
                  title={isRecording ? "Stop Recording" : "Record Voice Note"}
                >
                  {isUploadingAudio ? <Loader2 className="w-5 h-5 animate-spin" /> : isRecording ? <Square className="w-4 h-4 fill-current" /> : <Mic className="w-5 h-5" />}
                </button>
              </div>
              {isRecording && (
                <div className="absolute left-20 right-14 top-0 bottom-0 bg-slate-800/90 rounded-xl flex items-center px-4 animate-pulse">
                  <div className="w-2 h-2 rounded-full bg-red-500 mr-2" />
                  <span className="text-red-500 text-sm font-medium">Recording voice note...</span>
                </div>
              )}
              <textarea 
                placeholder="Type your message... (Shift+Enter for new line)"
                className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none resize-none min-h-[24px] max-h-[120px] scrollbar-thin my-2"
                value={newMessage}
                rows={1}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                  
                  if (activeChat && profile) {
                    updateTypingStatus(activeChat.id, profile.uid, true);
                    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                    typingTimeoutRef.current = setTimeout(() => {
                      updateTypingStatus(activeChat.id, profile.uid, false);
                    }, 2000);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (newMessage.trim()) {
                      handleSendMessage(e as any);
                    }
                  }
                }}
              />
              <button 
                type="submit"
                disabled={!newMessage.trim()}
                className="absolute right-1.5 bottom-1.5 p-2.5 rounded-xl bg-gradient-to-r from-brand to-brand-purple text-white shadow-md disabled:opacity-40 disabled:shadow-none transition-all active:scale-95 flex items-center justify-center cursor-pointer"
                aria-label="Send Message"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 flex-col items-center justify-center neo-card bg-slate-900/60 border border-white/5 rounded-3xl relative overflow-hidden shadow-2xl">
          <EmptyState 
            icon={Send}
            title="Your Messages"
            description="Select a conversation from the sidebar or start a new chat to begin networking."
          />
        </div>
      )}
    </div>
  );
}
