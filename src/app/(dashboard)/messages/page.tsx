"use client";

import { useEffect, useState, useRef } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { subscribeToChats, subscribeToMessages, sendMessage, Chat, Message, getOrCreateChat, updateTypingStatus, markMessagesAsRead, editMessage, deleteMessage, toggleArchiveChat, deleteChatForUser, markChatAsUnread } from "@/lib/services/messages";
import { getAllUsers, UserBasic, getUserById } from "@/lib/services/users";
import { Send, Search, Loader2, MessageSquarePlus, Check, CheckCheck, Image as ImageIcon, Mic, Square, FileText, X, Edit2, Reply, Trash2, MoreHorizontal, Archive, Inbox, MoreVertical, Mail, ArchiveRestore, User } from "lucide-react";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import toast from "react-hot-toast";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import UserAvatar from "@/components/ui/UserAvatar";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

import { useSearchParams } from "next/navigation";

export default function MessagesPage() {
  const { profile } = useAuthStore();
  const searchParams = useSearchParams();
  const targetUserParam = searchParams.get('user') || searchParams.get('uid');
  
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [users, setUsers] = useState<Record<string, UserBasic>>({});
  const [friends, setFriends] = useState<string[]>([]);
  const [showNewChat, setShowNewChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [chatTab, setChatTab] = useState<'inbox' | 'archived'>('inbox');
  const [activeMenuChatId, setActiveMenuChatId] = useState<string | null>(null);
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);

  // iOS WhatsApp style touch swipe state
  const [swipedChatId, setSwipedChatId] = useState<string | null>(null);
  const [swipingChatId, setSwipingChatId] = useState<string | null>(null);
  const [swipeOffset, setSwipeOffset] = useState<number>(0);
  const touchStartXRef = useRef<number>(0);
  const touchStartYRef = useRef<number>(0);
  const isHorizontalSwipeRef = useRef<boolean | null>(null);

  const handleTouchStart = (chatId: string, e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
    isHorizontalSwipeRef.current = null;
    setSwipingChatId(chatId);
  };

  const handleTouchMove = (chatId: string, e: React.TouchEvent) => {
    const diffX = e.touches[0].clientX - touchStartXRef.current;
    const diffY = e.touches[0].clientY - touchStartYRef.current;

    if (isHorizontalSwipeRef.current === null) {
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 8) {
        isHorizontalSwipeRef.current = true;
      } else if (Math.abs(diffY) > 8) {
        isHorizontalSwipeRef.current = false;
      }
    }

    if (isHorizontalSwipeRef.current) {
      if (diffX < 0) { // dragging left
        const currentOffset = swipedChatId === chatId ? -140 + diffX : diffX;
        setSwipeOffset(Math.max(currentOffset, -160));
      } else if (swipedChatId === chatId && diffX > 0) { // dragging right to close
        const currentOffset = -140 + diffX;
        setSwipeOffset(Math.min(currentOffset, 0));
      }
    }
  };

  const handleTouchEnd = (chatId: string) => {
    if (isHorizontalSwipeRef.current) {
      if (swipeOffset < -50) {
        setSwipedChatId(chatId);
      } else {
        setSwipedChatId(null);
      }
    }
    setSwipingChatId(null);
    setSwipeOffset(0);
  };

  const handleMarkAsRead = async (chatId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!profile?.uid) return;
    await markMessagesAsRead(chatId, profile.uid);
    setActiveMenuChatId(null);
    toast.success("Marked as read");
  };

  const handleMarkAsUnread = async (chatId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!profile?.uid) return;
    await markChatAsUnread(chatId, profile.uid);
    setActiveMenuChatId(null);
    toast.success("Marked as unread");
  };

  const handleToggleArchive = async (chatId: string, isCurrentlyArchived: boolean, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!profile?.uid) return;
    await toggleArchiveChat(chatId, profile.uid, isCurrentlyArchived);
    setActiveMenuChatId(null);
    if (activeChat?.id === chatId) setActiveChat(null);
    toast.success(isCurrentlyArchived ? "Unarchived chat" : "Archived chat");
  };

  const handleDeleteChat = async (chatId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!profile?.uid) return;
    if (window.confirm("Are you sure you want to delete this conversation? It will be removed from your inbox.")) {
      await deleteChatForUser(chatId, profile.uid);
      setActiveMenuChatId(null);
      if (activeChat?.id === chatId) setActiveChat(null);
      toast.success("Conversation deleted");
    }
  };
  
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string | null>(null);
  
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

    setMediaFile(file);
    if (isImage) {
      setMediaPreviewUrl(URL.createObjectURL(file));
    } else {
      setMediaPreviewUrl(file.name); // Just use name for documents
    }
    
    // Clear input so same file can be selected again if cancelled
    if (fileInputRef.current) fileInputRef.current.value = '';
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
      
      const { success, users } = await getAllUsers(false); // don't exclude admins
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

  // Dynamically fetch missing chat participants if any chat references a user not in users map
  useEffect(() => {
    if (chats.length === 0 || !profile?.uid) return;

    chats.forEach(async (chat) => {
      const otherUserId = chat.participants.find(p => p !== profile.uid) || chat.participants[0];
      if (otherUserId && !users[otherUserId]) {
        const { success, user } = await getUserById(otherUserId);
        if (success && user) {
          setUsers(prev => ({ ...prev, [otherUserId]: user }));
        }
      }
    });
  }, [chats, profile?.uid]);

  useEffect(() => {
    if (!targetUserParam || !profile?.uid) return;
    const initChatWithUser = async () => {
      const res = await getOrCreateChat(profile.uid, targetUserParam);
      if (res.success && res.chat) {
        setActiveChat(res.chat);
      }
    };
    initChatWithUser();
  }, [targetUserParam, profile?.uid]);

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

  const getUserStatus = (lastLogin: any) => {
    if (!lastLogin) return { isOnline: false, text: "Offline" };
    try {
      const date = lastLogin.toDate ? lastLogin.toDate() : new Date(lastLogin);
      const isOnline = (new Date().getTime() - date.getTime()) < 5 * 60 * 1000;
      if (isOnline) return { isOnline: true, text: "Online" };
      return { isOnline: false, text: `Last seen ${formatDistanceToNow(date, { addSuffix: true })}` };
    } catch {
      return { isOnline: false, text: "Offline" };
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.uid || !activeChat) return;
    if (!newMessage.trim() && !mediaFile) return;

    if (editingMessage) {
      if (newMessage.trim() === editingMessage.text) {
        setEditingMessage(null);
        setNewMessage("");
        return;
      }
      await editMessage(activeChat.id, editingMessage.id, newMessage.trim());
      setEditingMessage(null);
      setNewMessage("");
      return;
    }

    const text = newMessage;
    const file = mediaFile;
    const replyId = replyingTo?.id;
    const replyText = replyingTo?.text;

    setNewMessage(""); // Optimistic clear
    setMediaFile(null);
    setMediaPreviewUrl(null);
    setReplyingTo(null);
    
    // Clear typing status
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    updateTypingStatus(activeChat.id, profile.uid, false);
    
    let uploadedMediaUrl = undefined;
    let type: 'text' | 'image' | 'audio' | 'document' = 'text';
    let finalMsgText = text;

    if (file) {
      try {
        setIsUploadingImage(true);
        const timestamp = Date.now();
        const storageRef = ref(storage, `chats/${activeChat.id}/${timestamp}_${file.name}`);
        await uploadBytes(storageRef, file);
        uploadedMediaUrl = await getDownloadURL(storageRef);
        
        type = file.type.startsWith('image/') ? 'image' : 'document';
        if (!finalMsgText) {
           finalMsgText = type === 'image' ? "Sent an image" : file.name;
        }
      } catch (error) {
        console.error("Error uploading file:", error);
        toast.error("Failed to upload file. Sending message without attachment.");
      } finally {
        setIsUploadingImage(false);
      }
    }

    await sendMessage(activeChat.id, profile.uid, finalMsgText, type, uploadedMediaUrl, replyId, replyText);
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

  // Filter users for new chat: Allow chatting with any user on Rhockstar Connect matching search
  const availableUsers = Object.values(users).filter(
    (u) => u.uid !== profile.uid && 
           (u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.username.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex-1 flex flex-col md:flex-row max-w-[1600px] mx-auto w-full h-[calc(100vh-100px)] gap-2 md:gap-4 p-2 md:p-4 lg:p-6 lg:gap-6">
      
      {/* SIDEBAR: CHAT LIST */}
      <div className={`${activeChat ? 'hidden md:flex' : 'flex'} w-full md:w-[350px] lg:w-[400px] flex-col neo-card bg-slate-900/60 border border-white/5 rounded-3xl overflow-hidden shadow-2xl`}>
        {/* Sidebar Header & Tabs */}
        <div className="p-4 border-b border-white/5 flex flex-col gap-3 bg-slate-900/80 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Messages</h2>
            <button 
              onClick={() => setShowNewChat(true)}
              className="p-2 rounded-xl bg-brand/10 text-brand hover:bg-brand/20 transition-colors flex items-center gap-1.5 text-xs font-bold"
              title="Start New Chat"
            >
              <MessageSquarePlus className="w-4.5 h-4.5" />
              <span className="hidden sm:inline">New Chat</span>
            </button>
          </div>

          {/* Inbox / Archived Tab Switcher */}
          <div className="flex bg-slate-800/60 p-1 rounded-xl border border-white/5 gap-1">
            <button
              onClick={() => { setChatTab('inbox'); setShowNewChat(false); }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                chatTab === 'inbox' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Inbox className="w-3.5 h-3.5" />
              Inbox
            </button>
            <button
              onClick={() => { setChatTab('archived'); setShowNewChat(false); }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 relative ${
                chatTab === 'archived' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Archive className="w-3.5 h-3.5" />
              Archived
              {chats.filter(c => profile?.uid && c.archivedFor?.includes(profile.uid) && !c.deletedFor?.includes(profile.uid)).length > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] bg-brand text-slate-950 font-extrabold rounded-full ml-1">
                  {chats.filter(c => profile?.uid && c.archivedFor?.includes(profile.uid) && !c.deletedFor?.includes(profile.uid)).length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-white/5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800/50 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-brand/50 transition-colors"
            />
          </div>
        </div>

        {/* Chats List */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
          {showNewChat ? (
            <div className="p-2 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex justify-between items-center px-3 py-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Start New Chat</span>
                <button onClick={() => setShowNewChat(false)} className="text-xs text-slate-400 hover:text-white">Cancel</button>
              </div>
              {availableUsers.length > 0 ? (
                availableUsers.map((u) => (
                  <button
                    key={u.uid}
                    onClick={() => startNewChat(u.uid)}
                    className="w-full p-3 flex items-center gap-3 hover:bg-white/5 rounded-xl transition-all text-left group"
                  >
                    <UserAvatar src={u.avatar} name={u.fullName} className="w-10 h-10 group-hover:scale-105 transition-transform" textClassName="text-sm font-bold" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-slate-200 truncate group-hover:text-white transition-colors">{u.fullName}</h3>
                      <p className="text-xs text-slate-500 truncate">@{u.username}</p>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-sm text-slate-500">
                  {searchQuery ? "No matching users found." : "Search for any user to start a conversation."}
                </div>
              )}
            </div>
          ) : (
            (() => {
              const filteredChats = chats.filter(c => {
                if (!profile?.uid) return false;
                if (c.deletedFor?.includes(profile.uid)) return false;
                const isArchived = c.archivedFor?.includes(profile.uid);
                return chatTab === 'archived' ? isArchived : !isArchived;
              });

              return filteredChats.length > 0 ? filteredChats.map((chat) => {
                const otherUserId = chat.participants.find(p => p !== profile?.uid) || chat.participants[0];
                const otherUser = users[otherUserId] || {
                  uid: otherUserId,
                  fullName: "Member",
                  username: "user",
                  avatar: "",
                  lastLogin: null
                };
                const isTyping = chat.typingStatus?.[otherUserId];
                const isActive = activeChat?.id === chat.id;
                const unreadCount = chat.unreadCount?.[profile?.uid || ''] || 0;
                const isUnread = unreadCount > 0;
                const isArchived = chat.archivedFor?.includes(profile.uid);

                return (
                  <div 
                    key={chat.id} 
                    className={`relative border-b border-white/5 last:border-0 group/swipe select-none bg-slate-950 ${
                      activeMenuChatId === chat.id ? 'z-50 overflow-visible' : 'z-0 overflow-hidden'
                    }`}
                  >
                    {/* SWIPE ACTIONS (Underneath layer - only visible when swiped/swiping) */}
                    <div className={`absolute right-0 top-0 bottom-0 flex items-center h-full z-0 transition-opacity duration-150 ${
                      swipedChatId === chat.id || swipingChatId === chat.id ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                    }`}>
                      <button
                        onClick={(e) => {
                          setSwipedChatId(null);
                          handleToggleArchive(chat.id, !!isArchived, e);
                        }}
                        className="h-full px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold flex flex-col items-center justify-center gap-1 transition-colors text-xs shrink-0"
                      >
                        {isArchived ? (
                          <>
                            <ArchiveRestore className="w-5 h-5 text-slate-950" />
                            <span className="text-[10px]">Unarchive</span>
                          </>
                        ) : (
                          <>
                            <Archive className="w-5 h-5 text-slate-950" />
                            <span className="text-[10px]">Archive</span>
                          </>
                        )}
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

                    {/* SWIPEABLE CARD (Top layer - 100% SOLID opaque background) */}
                    <div
                      onTouchStart={(e) => handleTouchStart(chat.id, e)}
                      onTouchMove={(e) => handleTouchMove(chat.id, e)}
                      onTouchEnd={() => handleTouchEnd(chat.id)}
                      onClick={() => {
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
                            : (swipedChatId === chat.id ? '-140px' : '0px')
                        })`
                      }}
                      className={`w-full p-4 flex items-center justify-between gap-3 transition-transform duration-200 ease-out text-left relative z-10 cursor-pointer ${
                        isActive 
                          ? 'bg-slate-800 text-white shadow-md border-l-4 border-brand' 
                          : isUnread 
                            ? 'bg-slate-900 border-l-4 border-brand/70' 
                            : 'bg-slate-900 hover:bg-slate-800/90'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="relative shrink-0">
                          <UserAvatar src={otherUser.avatar} name={otherUser.fullName} className={`w-12 h-12 transition-transform ${isActive ? 'scale-105 ring-2 ring-brand' : ''}`} textClassName="text-lg font-bold" />
                          {getUserStatus(otherUser.lastLogin).isOnline && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-900" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <div className="flex justify-between items-baseline mb-0.5">
                            <h3 className={`font-semibold truncate ${isActive || isUnread ? 'text-white' : 'text-slate-200'}`}>{otherUser.fullName}</h3>
                            <span className="text-[10px] text-slate-400 shrink-0 ml-2">{formatMessageTime(chat.lastMessageTime)}</span>
                          </div>
                          <div className="flex items-center justify-between gap-1">
                            <p className={`text-sm truncate ${isTyping ? 'text-brand font-medium animate-pulse' : isUnread ? 'text-slate-200 font-medium' : 'text-slate-400'}`}>
                              {isTyping ? 'Typing...' : chat.lastMessage || 'Start a conversation'}
                            </p>
                            {isUnread && (
                              <span className="w-2.5 h-2.5 rounded-full bg-brand shrink-0" />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Options Dropdown Trigger */}
                      <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuChatId(activeMenuChatId === chat.id ? null : chat.id);
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
                                onClick={(e) => handleMarkAsUnread(chat.id, e)}
                                className="w-full px-3 py-2 text-xs text-left text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl transition-colors flex items-center gap-2"
                              >
                                <Mail className="w-3.5 h-3.5 text-brand" />
                                Mark as Unread
                              </button>
                            )}

                            <button
                              onClick={(e) => handleToggleArchive(chat.id, !!isArchived, e)}
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
              }) : (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                  <EmptyState 
                    icon={chatTab === 'archived' ? Archive : MessageSquarePlus}
                    title={chatTab === 'archived' ? "No archived chats" : "No messages yet"}
                    description={chatTab === 'archived' ? "Archived conversations will appear here." : "Search for any professional to start a conversation!"}
                  />
                </div>
              );
            })()
          )}
        </div>
      </div>

      {/* MAIN CONTENT: ACTIVE CHAT */}
      {activeChat ? (
        <div className="flex-1 flex flex-col neo-card bg-slate-900/60 border border-white/5 rounded-3xl overflow-hidden shadow-2xl relative">
          
          {/* Active Chat Header */}
          <div className="p-6 border-b border-white/5 bg-slate-900/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
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
                  <Link href={`/profile?uid=${otherUserId}`} className="flex items-center gap-4 group cursor-pointer">
                    <div className="relative">
                      <UserAvatar src={otherUser.avatar} name={otherUser.fullName} className="w-12 h-12 group-hover:shadow-[0_0_15px_rgba(56,189,248,0.3)] transition-shadow" textClassName="text-lg font-bold" />
                      {getUserStatus(otherUser.lastLogin).isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-900" />
                      )}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white leading-tight group-hover:text-brand transition-colors">{otherUser.fullName}</h2>
                      <p className={`text-xs font-medium ${getUserStatus(otherUser.lastLogin).isOnline ? 'text-emerald-400' : 'text-slate-400'}`}>
                        {getUserStatus(otherUser.lastLogin).text}
                      </p>
                    </div>
                  </Link>
                ) : (
                  <div className="flex items-center gap-3">
                    <UserAvatar name="Member" className="w-10 h-10" textClassName="text-sm font-bold" />
                    <h2 className="text-base font-bold text-white">Rhockstar Member</h2>
                  </div>
                );
              })()}
            </div>

            {/* Active Header Menu */}
            <div className="relative shrink-0">
              <button
                onClick={() => setHeaderMenuOpen(!headerMenuOpen)}
                className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors border border-white/5"
                title="Conversation Options"
              >
                <MoreVertical className="w-5 h-5" />
              </button>

              {headerMenuOpen && (
                <div className="absolute right-0 top-12 w-48 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl z-50 p-1 animate-in fade-in zoom-in-95 duration-150">
                  {(() => {
                    const otherUserId = activeChat.participants.find(p => p !== profile.uid) || activeChat.participants[0];
                    const isArchived = activeChat.archivedFor?.includes(profile.uid);
                    return (
                      <>
                        <Link
                          href={`/profile?uid=${otherUserId}`}
                          className="w-full px-3.5 py-2.5 text-xs text-left text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl transition-colors flex items-center gap-2"
                          onClick={() => setHeaderMenuOpen(false)}
                        >
                          <User className="w-3.5 h-3.5 text-brand" />
                          View Profile
                        </Link>

                        <button
                          onClick={() => {
                            setHeaderMenuOpen(false);
                            handleToggleArchive(activeChat.id, !!isArchived);
                          }}
                          className="w-full px-3.5 py-2.5 text-xs text-left text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl transition-colors flex items-center gap-2"
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
                          onClick={() => {
                            setHeaderMenuOpen(false);
                            handleDeleteChat(activeChat.id);
                          }}
                          className="w-full px-3.5 py-2.5 text-xs text-left text-red-400 hover:bg-red-500/10 rounded-xl transition-colors flex items-center gap-2"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete Chat
                        </button>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
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
              if (msg.deletedForMe?.includes(profile.uid)) return null;

              const formattedTime = formatMessageTime(msg.createdAt);
              const isRead = msg.status === 'read';

              return (
                <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'} group relative`}>
                  <div className={`relative max-w-[85%] md:max-w-[70%] flex flex-col gap-1`}>
                    
                    {/* Action buttons on hover */}
                    <div className={`absolute top-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 ${isMine ? 'right-full mr-2' : 'left-full ml-2'}`}>
                      <button onClick={() => { setReplyingTo(msg); setEditingMessage(null); }} className="p-1.5 bg-slate-800 text-slate-300 hover:text-white rounded-full border border-white/10 hover:bg-slate-700 transition-colors" title="Reply">
                        <Reply className="w-3.5 h-3.5" />
                      </button>
                      {isMine && !msg.isDeleted && msg.type === 'text' && (
                        <button onClick={() => { setEditingMessage(msg); setNewMessage(msg.text); setReplyingTo(null); }} className="p-1.5 bg-slate-800 text-slate-300 hover:text-white rounded-full border border-white/10 hover:bg-slate-700 transition-colors" title="Edit">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button onClick={() => {
                        if (isMine && !msg.isDeleted) {
                          const confirmEveryone = window.confirm("Delete for everyone? Cancel to delete for yourself only.");
                          deleteMessage(activeChat.id, msg.id, profile.uid, confirmEveryone ? 'forEveryone' : 'forMe');
                        } else {
                          deleteMessage(activeChat.id, msg.id, profile.uid, 'forMe');
                        }
                      }} className="p-1.5 bg-slate-800 text-slate-300 hover:text-red-400 rounded-full border border-white/10 hover:bg-slate-700 transition-colors" title="Delete">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className={`rounded-2xl px-4 py-2.5 flex flex-col gap-1 ${
                      isMine 
                        ? 'bg-gradient-to-br from-brand to-brand-purple text-white rounded-tr-sm shadow-[0_5px_15px_rgba(56,189,248,0.2)]' 
                        : 'bg-slate-800 text-slate-100 rounded-tl-sm border border-white/5'
                    }`}>
                      {msg.replyToText && (
                        <div className="mb-2 pl-3 border-l-2 border-white/30 bg-black/10 p-2 rounded text-xs opacity-80 overflow-hidden line-clamp-2">
                          <span className="font-semibold block mb-0.5">Replying to</span>
                          {msg.replyToText}
                        </div>
                      )}
                      
                      {msg.isDeleted ? (
                         <p className="italic text-white/50 text-sm">This message was deleted</p>
                      ) : msg.type === 'image' && msg.mediaUrl ? (
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
                        <p className="leading-relaxed text-sm md:text-base break-words whitespace-pre-wrap">{msg.text}</p>
                      )}
                      
                      {/* Timestamp & Status Ticks */}
                      <div className={`flex items-center gap-1 text-[10px] ${isMine ? 'justify-end text-white/80' : 'justify-start text-slate-400'}`}>
                        {msg.isEdited && <span className="mr-1">(edited)</span>}
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

          {/* Active States above Input */}
          {(replyingTo || editingMessage || mediaPreviewUrl) && (
            <div className="px-4 py-3 bg-slate-800/80 border-t border-white/10 flex items-center justify-between text-sm">
              <div className="flex items-center gap-3 overflow-hidden">
                {replyingTo && (
                  <>
                    <Reply className="w-4 h-4 text-brand shrink-0" />
                    <div className="truncate text-slate-300">Replying to: <span className="font-semibold text-white">{replyingTo.text}</span></div>
                  </>
                )}
                {editingMessage && (
                  <>
                    <Edit2 className="w-4 h-4 text-brand shrink-0" />
                    <div className="truncate text-slate-300">Editing message</div>
                  </>
                )}
                {mediaPreviewUrl && (
                  <>
                    <ImageIcon className="w-4 h-4 text-brand shrink-0" />
                    <div className="flex items-center gap-2">
                      <span className="text-slate-300 truncate max-w-[200px]">{mediaFile?.name}</span>
                      {mediaFile?.type.startsWith('image/') && (
                        <img src={mediaPreviewUrl} alt="Preview" className="h-10 w-10 object-cover rounded" />
                      )}
                    </div>
                  </>
                )}
              </div>
              <button 
                onClick={() => { setReplyingTo(null); setEditingMessage(null); setMediaFile(null); setMediaPreviewUrl(null); if (!editingMessage) setNewMessage(""); }} 
                className="p-1 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

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
                  disabled={isUploadingImage || isRecording || isUploadingAudio || !!editingMessage}
                  className="p-2 rounded-xl text-slate-400 hover:text-brand hover:bg-white/5 transition-colors disabled:opacity-50"
                  title="Attach Photo or Document"
                >
                  {isUploadingImage ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5" />}
                </button>
                <button
                  type="button"
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isUploadingAudio || isUploadingImage || !!editingMessage}
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
                placeholder="Type your message..."
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
                    if (newMessage.trim() || mediaFile) {
                      handleSendMessage(e as any);
                    }
                  }
                }}
              />
              <button 
                type="submit"
                disabled={(!newMessage.trim() && !mediaFile) || isUploadingImage}
                className="absolute right-1.5 bottom-1.5 p-2.5 rounded-xl bg-gradient-to-r from-brand to-brand-purple text-white shadow-md disabled:opacity-40 disabled:shadow-none transition-all active:scale-95 flex items-center justify-center cursor-pointer"
                aria-label="Send Message"
              >
                {isUploadingImage ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
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
