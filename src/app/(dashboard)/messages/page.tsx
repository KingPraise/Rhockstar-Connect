"use client";

import { useEffect, useState, useRef } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { subscribeToChats, subscribeToMessages, sendMessage, Chat, Message, getOrCreateChat, updateTypingStatus, markMessagesAsRead, editMessage, deleteMessage, toggleArchiveChat, deleteChatForUser, markChatAsUnread } from "@/lib/services/messages";
import { getAllUsers, UserBasic, getUserById, getUserByUsername } from "@/lib/services/users";
import { formatDistanceToNow } from "date-fns";
import { 
  subscribeToCommunities, 
  subscribeToCommunityMessages, 
  sendCommunityMessage, 
  joinCommunity, 
  leaveCommunity, 
  deleteCommunityMessage, 
  removeMemberFromCommunity, 
  Community, 
  CommunityMessage 
} from "@/lib/services/communities";
import CreateCommunityModal from "@/components/chat/CreateCommunityModal";
import { 
  Send, Search, Loader2, MessageSquarePlus, Check, CheckCheck, Image as ImageIcon, Mic, Square, FileText, X, Edit2, Reply, Trash2, MoreHorizontal, Archive, Inbox, MoreVertical, Mail, ArchiveRestore, User, 
  Globe, Users, Compass, Plus, Sparkles, ShieldCheck, UserX, Crown, MessageSquare 
} from "lucide-react";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import toast from "react-hot-toast";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import UserAvatar from "@/components/ui/UserAvatar";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const CATEGORY_FILTERS = ["All", "Sports", "Tech & Career", "Hobbies", "Campus", "General"];

export default function MessagesPage() {
  const { profile } = useAuthStore();
  const searchParams = useSearchParams();
  const targetUserParam = searchParams.get('user') || searchParams.get('uid');
  
  // DMs State
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

  // Communities State
  const [messagesMode, setMessagesMode] = useState<'direct' | 'communities'>('direct');
  const [communities, setCommunities] = useState<Community[]>([]);
  const [activeCommunity, setActiveCommunity] = useState<Community | null>(null);
  const [communityMessages, setCommunityMessages] = useState<CommunityMessage[]>([]);
  const [communityCategory, setCommunityCategory] = useState<string>('All');
  const [newCommunityMessageText, setNewCommunityMessageText] = useState("");
  const [isCreateCommunityOpen, setIsCreateCommunityOpen] = useState(false);
  const [isCommunityInfoOpen, setIsCommunityInfoOpen] = useState(false);
  const [sendingCommunityMsg, setSendingCommunityMsg] = useState(false);

  // Media upload & editing state
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [openMessageMenuId, setOpenMessageMenuId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);

  // Voice Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // iOS WhatsApp style touch swipe state
  const [swipedChatId, setSwipedChatId] = useState<string | null>(null);
  const [swipingChatId, setSwipingChatId] = useState<string | null>(null);
  const [swipeOffset, setSwipeOffset] = useState<number>(0);
  const touchStartXRef = useRef<number>(0);
  const touchStartYRef = useRef<number>(0);
  const isHorizontalSwipeRef = useRef<boolean | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const communityMessagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Touch handlers for chat card swipe left
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
      if (diffX < 0) {
        setSwipeOffset(Math.max(diffX, -160));
      } else {
        setSwipeOffset(0);
      }
    }
  };

  const handleTouchEnd = (chatId: string) => {
    if (isHorizontalSwipeRef.current) {
      if (swipeOffset < -60) {
        setSwipedChatId(chatId);
      } else {
        setSwipedChatId(null);
      }
    }
    setSwipingChatId(null);
    setSwipeOffset(0);
  };

  // Helper for last seen status
  const getUserStatus = (lastLogin: any) => {
    if (!lastLogin) return { isOnline: false, text: "Offline" };
    const date = (lastLogin as any)?.toDate ? (lastLogin as any).toDate() : new Date(lastLogin as any);
    const diffInMinutes = (new Date().getTime() - date.getTime()) / (1000 * 60);
    if (diffInMinutes < 3) return { isOnline: true, text: "Online" };
    return { isOnline: false, text: `Last seen ${formatDistanceToNow(date, { addSuffix: true })}` };
  };

  // Helper to format timestamps
  const formatMessageTime = (createdAt: any) => {
    if (!createdAt) return "";
    const date = (createdAt as any)?.toDate ? (createdAt as any).toDate() : new Date(createdAt as any);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Load users & friends
  useEffect(() => {
    const fetchUsers = async () => {
      const res = await getAllUsers();
      const userList = res.success && res.users ? res.users : [];
      const userMap: Record<string, UserBasic> = {};
      userList.forEach(u => {
        userMap[u.uid] = u;
      });
      setUsers(userMap);
      if (profile?.uid) {
        setFriends(userList.filter(u => u.uid !== profile.uid).map(u => u.uid));
      }
    };
    fetchUsers();
  }, [profile?.uid]);

  // Handle URL target user param
  useEffect(() => {
    if (targetUserParam && profile?.uid) {
      const initiateChat = async () => {
        let targetUid = targetUserParam;
        if (!users[targetUserParam]) {
          const userRes = await getUserByUsername(targetUserParam);
          if (userRes.success && userRes.user) {
            targetUid = userRes.user.uid;
          }
        }
        if (targetUid !== profile.uid) {
          const res = await getOrCreateChat(profile.uid, targetUid);
          if (res.success && res.chat) {
            setActiveChat(res.chat as Chat);
            setMessagesMode('direct');
          }
        }
      };
      initiateChat();
    }
  }, [targetUserParam, profile?.uid, users]);

  // Subscribe to DMs
  useEffect(() => {
    if (!profile?.uid) return;
    const unsubscribe = subscribeToChats(profile.uid, async (updatedChats) => {
      setChats(updatedChats);
      
      const missingUserIds = new Set<string>();
      updatedChats.forEach(chat => {
        const otherUserId = chat.participants.find(p => p !== profile.uid);
        if (otherUserId && !users[otherUserId]) {
          missingUserIds.add(otherUserId);
        }
      });

      if (missingUserIds.size > 0) {
        const fetchedMap: Record<string, UserBasic> = {};
        await Promise.all(
          Array.from(missingUserIds).map(async (uid) => {
            const res = await getUserById(uid);
            if (res.success && res.user) {
              fetchedMap[uid] = res.user;
            }
          })
        );
        if (Object.keys(fetchedMap).length > 0) {
          setUsers(prev => ({ ...prev, ...fetchedMap }));
        }
      }

      if (activeChat) {
        const current = updatedChats.find(c => c.id === activeChat.id);
        if (current) setActiveChat(current);
      }
    });
    return () => unsubscribe();
  }, [profile?.uid, activeChat?.id]);

  // Subscribe to DM Messages
  useEffect(() => {
    if (!activeChat) {
      setMessages([]);
      return;
    }
    const unsubscribe = subscribeToMessages(activeChat.id, (newMessages) => {
      setMessages(newMessages);
    });
    if (profile?.uid) {
      markMessagesAsRead(activeChat.id, profile.uid);
    }
    return () => unsubscribe();
  }, [activeChat?.id, profile?.uid]);

  // Subscribe to Public Communities
  useEffect(() => {
    const unsubscribe = subscribeToCommunities((list) => {
      setCommunities(list);
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to Active Community Messages
  useEffect(() => {
    if (!activeCommunity) {
      setCommunityMessages([]);
      return;
    }
    const unsubscribe = subscribeToCommunityMessages(activeCommunity.id, (msgs) => {
      setCommunityMessages(msgs);
    });
    return () => unsubscribe();
  }, [activeCommunity?.id]);

  // Auto-scroll DMs
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeChat]);

  // Auto-scroll Communities
  useEffect(() => {
    communityMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [communityMessages, activeCommunity]);

  // Send DM Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !mediaFile) || !activeChat || !profile?.uid) return;

    const file = mediaFile;
    const text = newMessage;

    setNewMessage("");
    setMediaFile(null);
    setMediaPreviewUrl(null);
    setReplyingTo(null);
    
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
        toast.error("Failed to upload file.");
      }
      setIsUploadingImage(false);
    }

    await sendMessage(
      activeChat.id, 
      profile.uid, 
      finalMsgText, 
      type, 
      uploadedMediaUrl,
      replyingTo?.id,
      replyingTo?.text
    );
  };

  // Send Community Message
  const handleSendCommunityMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommunityMessageText.trim() || !activeCommunity || !profile) return;

    try {
      setSendingCommunityMsg(true);
      const text = newCommunityMessageText.trim();
      setNewCommunityMessageText("");

      await sendCommunityMessage(
        activeCommunity.id,
        profile.uid,
        text,
        profile.fullName,
        profile.avatar || "",
        'text'
      );
    } catch (err: any) {
      console.error("Error sending community message:", err);
      toast.error("Failed to send message");
    } finally {
      setSendingCommunityMsg(false);
    }
  };

  // Join Community Handler
  const handleJoinCommunity = async (comm: Community) => {
    if (!profile) {
      toast.error("Please log in to join communities");
      return;
    }
    const res = await joinCommunity(comm.id, profile.uid);
    if (res.success) {
      toast.success(`Joined ${comm.name}! 🎉`);
      setActiveCommunity({ ...comm, members: [...comm.members, profile.uid], memberCount: comm.memberCount + 1 });
    } else {
      toast.error(res.error || "Failed to join community");
    }
  };

  // Leave Community Handler
  const handleLeaveCommunity = async (comm: Community) => {
    if (!profile) return;
    const res = await leaveCommunity(comm.id, profile.uid);
    if (res.success) {
      toast.success(`Left ${comm.name}`);
      setActiveCommunity(null);
    } else {
      toast.error(res.error || "Failed to leave community");
    }
  };

  // File Select Handler
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMediaFile(file);
      if (file.type.startsWith('image/')) {
        setMediaPreviewUrl(URL.createObjectURL(file));
      } else {
        setMediaPreviewUrl(null);
      }
    }
  };

  // DM actions
  const handleToggleArchive = async (chatId: string, isArchived: boolean, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!profile?.uid) return;
    const res = await toggleArchiveChat(chatId, profile.uid, isArchived);
    if (res.success) {
      toast.success(isArchived ? "Chat restored to Inbox" : "Chat archived");
    }
  };

  const handleDeleteChat = async (chatId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!profile?.uid) return;
    if (confirm("Are you sure you want to delete this chat? It will be hidden from your inbox.")) {
      const res = await deleteChatForUser(chatId, profile.uid);
      if (res.success) {
        toast.success("Chat deleted");
        if (activeChat?.id === chatId) setActiveChat(null);
      }
    }
  };

  const handleMarkAsUnread = async (chatId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!profile?.uid) return;
    await markChatAsUnread(chatId, profile.uid);
    setActiveMenuChatId(null);
    toast.success("Marked as unread");
  };

  const handleMarkAsRead = async (chatId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!profile?.uid) return;
    await markMessagesAsRead(chatId, profile.uid);
    setActiveMenuChatId(null);
    toast.success("Marked as read");
  };

  const startNewChatWithUser = async (otherUserId: string) => {
    if (!profile?.uid) return;
    setShowNewChat(false);
    const res = await getOrCreateChat(profile.uid, otherUserId);
    if (res.success && res.chat) {
      setActiveChat(res.chat as Chat);
      setMessagesMode('direct');
    }
  };

  if (!profile) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-100px)]">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </div>
    );
  }

  // Filter available users for DM
  const availableUsers = Object.values(users).filter(
    (u) => u.uid !== profile.uid && 
           (u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.username.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Filter public communities
  const filteredCommunities = communities.filter((c) => {
    const matchesCategory = communityCategory === 'All' || c.category === communityCategory;
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col md:flex-row max-w-[1600px] mx-auto w-full h-[calc(100vh-100px)] gap-2 md:gap-4 p-2 md:p-4 lg:p-6 lg:gap-6">
      
      {/* SIDEBAR */}
      <div className={`${(activeChat || activeCommunity) ? 'hidden md:flex' : 'flex'} w-full md:w-[350px] lg:w-[400px] flex-col neo-card bg-slate-900/60 border border-white/5 rounded-3xl overflow-hidden shadow-2xl`}>
        
        {/* Header & Mode Bar */}
        <div className="p-4 border-b border-white/5 flex flex-col gap-3 bg-slate-900/80 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Messages</h2>
            {messagesMode === 'direct' ? (
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

          {/* Mode Switcher: DMs vs Public Communities */}
          <div className="flex bg-slate-950 p-1 rounded-2xl border border-white/10 gap-1">
            <button
              onClick={() => { setMessagesMode('direct'); setActiveCommunity(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                messagesMode === 'direct' ? 'bg-brand text-slate-950 shadow-md font-extrabold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Direct Chats
            </button>
            <button
              onClick={() => { setMessagesMode('communities'); setActiveChat(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                messagesMode === 'communities' ? 'bg-brand text-slate-950 shadow-md font-extrabold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              Communities 🌐
            </button>
          </div>

          {/* Inbox / Archived Tab Switcher (For Direct Messages mode) */}
          {messagesMode === 'direct' && (
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
          )}

          {/* Category Filters (For Public Communities mode) */}
          {messagesMode === 'communities' && (
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              {CATEGORY_FILTERS.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCommunityCategory(cat)}
                  className={`px-3 py-1 rounded-xl text-[11px] font-bold shrink-0 transition-all ${
                    communityCategory === cat 
                      ? 'bg-brand/20 text-brand border border-brand/40' 
                      : 'bg-slate-800/80 text-slate-400 hover:text-white border border-white/5'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search */}
        <div className="p-4 border-b border-white/5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={messagesMode === 'direct' ? "Search conversations..." : "Search communities e.g., Football..."}
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
        </div>

        {/* List Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">

          {/* MODE 1: DIRECT MESSAGES */}
          {messagesMode === 'direct' && (
            showNewChat ? (
              <div className="p-2 space-y-1">
                <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider flex justify-between items-center">
                  <span>Start New Conversation</span>
                  <button onClick={() => setShowNewChat(false)} className="text-slate-400 hover:text-white text-xs">Cancel</button>
                </div>
                {availableUsers.length > 0 ? (
                  availableUsers.map((u) => (
                    <button
                      key={u.uid}
                      onClick={() => startNewChatWithUser(u.uid)}
                      className="w-full p-3 flex items-center gap-3 hover:bg-slate-800/60 rounded-2xl transition-colors text-left"
                    >
                      <UserAvatar src={u.avatar} name={u.fullName} className="w-10 h-10 shrink-0" textClassName="text-sm font-bold" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white text-sm truncate">{u.fullName}</h3>
                        <p className="text-xs text-slate-400 truncate">@{u.username}</p>
                      </div>
                    </button>
                  ))
                ) : (
                  <p className="p-4 text-center text-slate-400 text-xs">No professionals found matching "{searchQuery}"</p>
                )}
              </div>
            ) : (
              (() => {
                const filteredChats = chats.filter(chat => {
                  if (!profile?.uid) return false;
                  const isDeleted = chat.deletedFor?.includes(profile.uid);
                  if (isDeleted) return false;

                  const isArchived = chat.archivedFor?.includes(profile.uid);
                  if (chatTab === 'inbox' && isArchived) return false;
                  if (chatTab === 'archived' && !isArchived) return false;

                  const otherUserId = chat.participants.find(p => p !== profile.uid);
                  const otherUser = otherUserId ? users[otherUserId] : null;
                  if (!otherUser) return true;

                  return (
                    otherUser.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    otherUser.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (chat.lastMessage && chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()))
                  );
                });

                return filteredChats.length > 0 ? filteredChats.map((chat) => {
                  const otherUserId = chat.participants.find(p => p !== profile.uid) || chat.participants[0];
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
                      {/* Swipe actions */}
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
                          <Archive className="w-5 h-5 text-slate-950" />
                          <span className="text-[10px]">{isArchived ? "Unarchive" : "Archive"}</span>
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

                      {/* Swipeable card */}
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
                              : 'bg-slate-900 hover:bg-slate-850'
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

                        {/* Options Dropdown Trigger (Tablet/Desktop only) */}
                        <div className="hidden sm:block relative shrink-0" onClick={(e) => e.stopPropagation()}>
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
            )
          )}

          {/* MODE 2: PUBLIC COMMUNITIES DIRECTORY */}
          {messagesMode === 'communities' && (
            filteredCommunities.length > 0 ? (
              <div className="p-2 space-y-2">
                {filteredCommunities.map((comm) => {
                  const isJoined = comm.members.includes(profile.uid);
                  const isActive = activeCommunity?.id === comm.id;

                  return (
                    <div
                      key={comm.id}
                      onClick={() => setActiveCommunity(comm)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isActive 
                          ? 'bg-slate-800 border-brand/50 shadow-lg' 
                          : 'bg-slate-900/80 hover:bg-slate-800/60 border-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-12 h-12 rounded-2xl bg-brand/10 text-2xl flex items-center justify-center shrink-0 border border-brand/20 shadow-inner">
                          {comm.icon || "💬"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h3 className="font-bold text-white text-sm truncate">{comm.name}</h3>
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-800 text-slate-400 border border-white/5">
                              {comm.category}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 truncate mb-1">{comm.description}</p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400">
                            <Users className="w-3 h-3 text-brand" />
                            <span>{comm.memberCount} members</span>
                            {comm.creatorId === profile.uid && (
                              <span className="text-amber-400 font-bold flex items-center gap-0.5">
                                • Creator
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Join / Joined Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isJoined) {
                            setActiveCommunity(comm);
                          } else {
                            handleJoinCommunity(comm);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                          isJoined 
                            ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-white/10' 
                            : 'bg-gradient-to-r from-brand to-brand-purple text-slate-950 hover:opacity-90 shadow-md font-extrabold'
                        }`}
                      >
                        {isJoined ? "Open" : "Join"}
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
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
            )
          )}
        </div>
      </div>

      {/* MAIN CONVERSATION AREA */}

      {/* VIEW 1: ACTIVE DM CHAT */}
      {messagesMode === 'direct' && activeChat && (
        <div className="flex-1 flex flex-col neo-card bg-slate-900/60 border border-white/5 rounded-3xl overflow-hidden shadow-2xl relative">
          
          {/* DM Header */}
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

            {/* DM Options */}
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
                          <Archive className="w-3.5 h-3.5 text-amber-400" />
                          {isArchived ? "Unarchive Chat" : "Archive Chat"}
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

          {/* DM Message Feed */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
            {/* Replying banner */}
            {replyingTo && (
              <div className="p-3 bg-slate-800/90 border border-brand/40 rounded-2xl flex items-center justify-between gap-3 text-xs mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Reply className="w-4 h-4 text-brand shrink-0" />
                  <div className="min-w-0">
                    <span className="font-bold text-brand block">Replying to message</span>
                    <span className="text-slate-300 truncate block">{replyingTo.text}</span>
                  </div>
                </div>
                <button onClick={() => setReplyingTo(null)} className="p-1 text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {(() => {
              let dmLastDate: Date | null = null;
              
              return messages.map((msg) => {
                const isMe = msg.senderId === profile.uid;
                const isEditingThis = editingMessageId === msg.id;
                const isMenuOpen = openMessageMenuId === msg.id;

                if (msg.deletedForMe?.includes(profile.uid)) return null;

                const msgDate = (msg.createdAt as any)?.toDate ? (msg.createdAt as any).toDate() : new Date((msg.createdAt as any) || Date.now());
                const now = new Date();
                const yesterday = new Date(now);
                yesterday.setDate(yesterday.getDate() - 1);
                
                const isSameDay = (d1: Date, d2: Date) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
                const showDateHeader = !dmLastDate || !isSameDay(dmLastDate, msgDate);
                if (showDateHeader) {
                  dmLastDate = msgDate;
                }
                
                let dateLabel = msgDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                if (isSameDay(msgDate, now)) dateLabel = 'Today';
                else if (isSameDay(msgDate, yesterday)) dateLabel = 'Yesterday';

                return (
                  <div key={msg.id} className="flex flex-col w-full">
                    {showDateHeader && (
                      <div className="flex justify-center my-4">
                        <span className="px-3 py-1 rounded-full bg-slate-800/80 border border-white/5 text-[10px] font-semibold text-slate-400">
                          {dateLabel}
                        </span>
                      </div>
                    )}
                    <div className={`flex w-full ${isMe ? "justify-end" : "justify-start"} mb-2`}>
                      <div className={`flex items-start gap-2 group relative ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                      {/* Action Menu Trigger (Dropdown) */}
                      {!msg.isDeleted && !isEditingThis && (
                        <div className={`relative flex items-center gap-1 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                          <button
                            onClick={() => setOpenMessageMenuId(isMenuOpen ? null : msg.id)}
                            className="p-1 rounded-full text-slate-500 hover:bg-slate-800 hover:text-white transition-colors"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {isMenuOpen && (
                            <div className={`absolute top-full ${isMe ? "right-0" : "left-0"} mt-1 w-32 bg-slate-900 border border-white/10 rounded-xl shadow-2xl z-50 py-1 flex flex-col`}>
                              <button
                                onClick={() => { setReplyingTo(msg); setOpenMessageMenuId(null); }}
                                className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-slate-800 text-slate-300"
                              >
                                <Reply className="w-3.5 h-3.5" /> Reply
                              </button>
                              {isMe && (
                                <button
                                  onClick={() => {
                                    setEditingMessageId(msg.id);
                                    setEditingText(msg.text);
                                    setOpenMessageMenuId(null);
                                  }}
                                  className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-slate-800 text-slate-300"
                                >
                                  <Edit2 className="w-3.5 h-3.5" /> Edit
                                </button>
                              )}
                              <button
                                onClick={async () => {
                                  if (confirm(isMe ? "Delete message for everyone?" : "Delete message for you?")) {
                                    await deleteMessage(activeChat.id, msg.id, profile.uid, isMe ? 'forEveryone' : 'forMe');
                                    toast.success("Message deleted");
                                  }
                                  setOpenMessageMenuId(null);
                                }}
                                className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-slate-800 text-rose-400"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                        </div>
                      )}

                      <div className={`max-w-[75vw] sm:max-w-[75%] rounded-2xl p-3.5 space-y-1 relative shadow-md ${isMe ? "bg-gradient-to-r from-brand to-brand-purple text-slate-950 font-medium rounded-tr-sm" : "bg-slate-800/90 text-white border border-white/5 rounded-tl-sm"}`}>
                        {/* Reply preview */}
                        {msg.replyToText && (
                          <div className="p-2 rounded-xl bg-black/20 border-l-2 border-slate-950 text-xs mb-2 opacity-80">
                            <span className="font-bold block text-[11px]">Replying to:</span>
                            <span className="truncate block">{msg.replyToText}</span>
                          </div>
                        )}

                        {/* Inline Editing view */}
                        {isEditingThis ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={editingText}
                              onChange={(e) => setEditingText(e.target.value)}
                              className="w-full px-3 py-1.5 bg-slate-900 text-white text-xs rounded-xl border border-brand focus:outline-none"
                            />
                            <div className="flex justify-end gap-2 text-xs">
                              <button
                                onClick={() => setEditingMessageId(null)}
                                className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={async () => {
                                  if (editingText.trim()) {
                                    await editMessage(activeChat.id, msg.id, editingText.trim());
                                    setEditingMessageId(null);
                                    toast.success("Message updated");
                                  }
                                }}
                                className="px-2.5 py-1 rounded-lg bg-slate-950 text-brand font-bold"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        ) : msg.isDeleted ? (
                          <p className="text-xs italic opacity-60 flex items-center gap-1">
                            <Trash2 className="w-3 h-3" /> This message was deleted
                          </p>
                        ) : (
                          <>
                            {msg.type === 'image' && msg.mediaUrl && (
                              <img src={msg.mediaUrl} alt="Shared" className="rounded-xl max-h-60 w-full object-cover mb-2" />
                            )}
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                          </>
                        )}

                        <div className="flex items-center justify-end gap-1.5 text-[10px] ">
                          {msg.isEdited && !msg.isDeleted && <span className="italic font-normal">(edited)</span>}
                          <span>{formatMessageTime(msg.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              });
            })()}
            <div ref={messagesEndRef} />
          </div>

          {/* DM Input Bar */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-white/5 bg-slate-900/90 flex items-center gap-3">
            <input
              type="text"
              placeholder="Write a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 bg-slate-800 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-brand"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="p-3 bg-brand text-slate-950 font-bold rounded-2xl hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      )}

      {/* VIEW 2: ACTIVE PUBLIC COMMUNITY CHAT ROOM */}
      {messagesMode === 'communities' && activeCommunity && (
        <div className="flex-1 flex flex-col neo-card bg-slate-900/60 border border-white/5 rounded-3xl overflow-hidden shadow-2xl relative">
          
          {/* Community Room Header */}
          <div className="p-4 sm:p-5 border-b border-white/5 bg-slate-900/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between gap-3">
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
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold text-white truncate">{activeCommunity.name}</h2>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-800 text-brand border border-brand/20 shrink-0">
                    {activeCommunity.category}
                  </span>
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
              className={`p-2.5 rounded-xl border transition-all ${
                isCommunityInfoOpen 
                  ? 'bg-brand/20 text-brand border-brand/40' 
                  : 'bg-slate-800/80 text-slate-400 hover:text-white border-white/5'
              }`}
              title="Community Members & Info"
            >
              <Users className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 flex overflow-hidden relative">
            
            {/* Group Chat Messages Stream */}
            <div className="flex-1 flex flex-col justify-between overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar">
                {communityMessages.length > 0 ? (
                  (() => {
                  let commLastDate: Date | null = null;
                  
                  return communityMessages.map((msg) => {
                    const isMe = msg.senderId === profile.uid;
                    const isCreator = msg.senderId === activeCommunity.creatorId;
                    
                    const msgDate = (msg.createdAt as any)?.toDate ? (msg.createdAt as any).toDate() : new Date((msg.createdAt as any) || Date.now());
                    const now = new Date();
                    const yesterday = new Date(now);
                    yesterday.setDate(yesterday.getDate() - 1);
                    
                    const isSameDay = (d1: Date, d2: Date) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
                    const showDateHeader = !commLastDate || !isSameDay(commLastDate, msgDate);
                    if (showDateHeader) {
                      commLastDate = msgDate;
                    }
                    
                    let dateLabel = msgDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                    if (isSameDay(msgDate, now)) dateLabel = 'Today';
                    else if (isSameDay(msgDate, yesterday)) dateLabel = 'Yesterday';

                    return (
                      <div key={msg.id} className="flex flex-col w-full">
                        {showDateHeader && (
                          <div className="flex justify-center my-4">
                            <span className="px-3 py-1 rounded-full bg-slate-800/80 border border-white/5 text-[10px] font-semibold text-slate-400">
                              {dateLabel}
                            </span>
                          </div>
                        )}
                        <div className={`flex w-full ${isMe ? "justify-end" : "justify-start"} mb-2`}>
                          <div className={`flex items-start gap-2 group relative ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                          {!isMe && (
                            <UserAvatar src={msg.senderAvatar} name={msg.senderName} className="w-8 h-8 rounded-full shrink-0 mt-1" textClassName="text-xs font-bold" />
                          )}
                          <div className={`max-w-[80vw] sm:max-w-[70%] rounded-2xl p-3.5 space-y-1 relative shadow-md ${isMe ? "bg-gradient-to-r from-brand to-brand-purple text-slate-950 font-medium rounded-tr-sm" : "bg-slate-800/90 text-white border border-white/5 rounded-tl-sm"}`}>
                            {!isMe && (
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <span className="text-xs font-bold text-brand truncate flex items-center gap-1">
                                  {msg.senderName}
                                  {isCreator && (
                                    <span title="Creator">
                                      <Crown className="w-3 h-3 text-amber-400 fill-amber-400" />
                                    </span>
                                  )}
                                </span>
                              </div>
                            )}
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                            <div className="flex items-center justify-end gap-2 text-[10px] ">
                              <span>{formatMessageTime(msg.createdAt)}</span>
                              
                              {/* Delete Message Button (For message owner or Community Creator) */}
                              {(isMe || activeCommunity.creatorId === profile.uid) && !msg.isDeleted && (
                                <button
                                  onClick={async () => {
                                    if (confirm("Delete this message?")) {
                                      await deleteCommunityMessage(activeCommunity.id, msg.id);
                                    }
                                  }}
                                  className="text-rose-500 hover:text-rose-400 p-0.5 ml-1"
                                  title="Delete Message"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                })()
                ) : (
                  <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                    <EmptyState
                      icon={MessageSquare}
                      title="Welcome to the Community!"
                      description="Be the first to post a message to this public room."
                    />
                  </div>
                )}
                <div ref={communityMessagesEndRef} />
              </div>

              {/* Group Message Input */}
              <form onSubmit={handleSendCommunityMessage} className="p-4 border-t border-white/5 bg-slate-900/90 flex items-center gap-3">
                <input
                  type="text"
                  placeholder={`Message ${activeCommunity.name}...`}
                  value={newCommunityMessageText}
                  onChange={(e) => setNewCommunityMessageText(e.target.value)}
                  className="flex-1 bg-slate-800 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-brand"
                />
                <button
                  type="submit"
                  disabled={!newCommunityMessageText.trim() || sendingCommunityMsg}
                  className="p-3 bg-gradient-to-r from-brand to-brand-purple text-slate-950 font-bold rounded-2xl hover:opacity-90 disabled:opacity-50 transition-opacity shadow-md"
                >
                  {sendingCommunityMsg ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </form>
            </div>

            {/* Info & Members Side Panel Drawer */}
            {isCommunityInfoOpen && (
              <div className="w-72 bg-slate-900 border-l border-white/5 p-5 flex flex-col gap-6 overflow-y-auto animate-in slide-in-from-right duration-200 z-20">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <h3 className="font-bold text-white text-sm">Community Details</h3>
                  <button onClick={() => setIsCommunityInfoOpen(false)} className="text-slate-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Info Card */}
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 rounded-3xl bg-brand/10 text-3xl flex items-center justify-center mx-auto border border-brand/20 shadow-inner">
                    {activeCommunity.icon || "💬"}
                  </div>
                  <h4 className="font-bold text-white text-base">{activeCommunity.name}</h4>
                  <p className="text-xs text-slate-400">{activeCommunity.description}</p>
                </div>

                {/* Member Status & Join/Leave */}
                <div className="p-3 bg-slate-800/60 rounded-2xl border border-white/5 space-y-2 text-center">
                  <div className="text-xs text-slate-300 font-medium">
                    {activeCommunity.members.length} Public Members
                  </div>
                  {activeCommunity.members.includes(profile.uid) ? (
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
                      Join Community
                    </button>
                  )}
                </div>

                {/* Creator Details */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Creator / Admin</h4>
                  <div className="flex items-center gap-3 p-2.5 bg-slate-800/40 rounded-xl border border-white/5">
                    <UserAvatar src={activeCommunity.creatorAvatar} name={activeCommunity.creatorName} className="w-8 h-8 rounded-full" textClassName="text-xs font-bold" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white truncate flex items-center gap-1">
                        {activeCommunity.creatorName}
                        <Crown className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
                      </p>
                      <p className="text-[10px] text-amber-400 font-semibold">Community Admin</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* VIEW 3: EMPTY STATE WHEN NO CHAT IS OPEN */}
      {!activeChat && !activeCommunity && (
        <div className="hidden md:flex flex-1 flex-col items-center justify-center neo-card bg-slate-900/60 border border-white/5 rounded-3xl p-8 text-center shadow-2xl">
          <div className="w-20 h-20 rounded-3xl bg-brand/10 text-brand flex items-center justify-center mb-4 border border-brand/20 shadow-inner">
            <Globe className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Welcome to Rhockstar Messages</h2>
          <p className="text-slate-400 text-sm max-w-md leading-relaxed mb-6">
            Connect 1-on-1 with professionals or join vibrant Public Communities to discuss football, tech, jobs, music, and more!
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setMessagesMode('communities'); }}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-brand to-brand-purple text-slate-950 font-extrabold text-xs shadow-lg hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <Globe className="w-4 h-4" />
              Explore Communities
            </button>
            <button
              onClick={() => { setMessagesMode('direct'); setShowNewChat(true); }}
              className="px-5 py-2.5 rounded-2xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-700 transition-colors border border-white/10 flex items-center gap-2"
            >
              <MessageSquarePlus className="w-4 h-4" />
              New Private Chat
            </button>
          </div>
        </div>
      )}

      {/* Create Community Modal */}
      <CreateCommunityModal
        isOpen={isCreateCommunityOpen}
        onClose={() => setIsCreateCommunityOpen(false)}
        onCreated={(commId) => {
          setMessagesMode('communities');
          const created = communities.find(c => c.id === commId);
          if (created) setActiveCommunity(created);
        }}
      />

    </div>
  );
}

