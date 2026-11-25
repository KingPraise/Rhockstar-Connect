"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { Globe, Loader2, MessageSquarePlus, X } from "lucide-react";

import MessageInput from "@/components/messages/MessageInput";
import DMHeader from "@/components/messages/DMHeader";
import DMMessageFeed from "@/components/messages/DMMessageFeed";
import ChatSidebar, {
  CATEGORY_FILTERS,
} from "@/components/messages/ChatSidebar";
import CommunityChannelView from "@/components/messages/CommunityChannelView";
import ForwardMessageModal from "@/components/messages/ForwardMessageModal";

import CreateCommunityModal from "@/components/chat/CreateCommunityModal";
import LevelUpModal from "@/components/gamification/LevelUpModal";
import LeaderboardView from "@/components/gamification/LeaderboardView";

import { useAuthStore } from "@/store/useAuthStore";
import { trackEvent } from "@/lib/analytics";
import { uploadMediaToCloudinary } from "@/lib/services/cloudinary";
import {
  subscribeToChats,
  subscribeToMessages,
  sendMessage,
  Chat,
  Message,
  getOrCreateChat,
  updateTypingStatus,
  markMessagesAsRead,
  editMessage,
  deleteMessage,
  toggleArchiveChat,
  deleteChatForUser,
  markChatAsUnread,
} from "@/lib/services/messages";
import {
  getAllUsers,
  UserBasic,
  getUserById,
  getUserByUsername,
  listenToUserProfile,
} from "@/lib/services/users";
import { formatDistanceToNow } from "date-fns";
import {
  subscribeToCommunities,
  subscribeToCommunityMessages,
  sendCommunityMessage,
  joinCommunity,
  leaveCommunity,
  requestToJoinCommunity,
  cancelJoinRequest,
  acceptJoinRequest,
  declineJoinRequest,
  updateCommunityAccess,
  Community,
  CommunityMessage,
  CommunityAccessType,
  JoinRequestDetail,
  markCommunityAsRead,
  isCommunityUnread,
} from "@/lib/services/communities";
import {
  awardUserXP,
  checkDailyStreak,
  StardomRank,
} from "@/lib/services/gamification";

const toTimestampDate = (value: unknown): Date | null => {
  if (value == null) return null;

  try {
    let date: Date;

    if (value instanceof Date) {
      date = value;
    } else if (
      typeof value === "object" &&
      "toDate" in value &&
      typeof value.toDate === "function"
    ) {
      date = value.toDate();
    } else if (typeof value === "string" || typeof value === "number") {
      date = new Date(value);
    } else {
      return null;
    }

    return Number.isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
};

function MessagesContent() {
  const { profile, unreadCommunities } = useAuthStore();
  const searchParams = useSearchParams();
  const targetUserParam =
    searchParams.get("chatId") ||
    searchParams.get("user") ||
    searchParams.get("uid");
  const targetCommunityIdParam = searchParams.get("communityId");
  const targetCategoryParam = searchParams.get("category");

  // Check and maintain daily streak on mount
  useEffect(() => {
    if (profile?.uid) {
      checkDailyStreak(profile.uid).then((res) => {
        if (res.isNewDay && res.streakCount > 1) {
          toast.success(
            `🔥 ${res.streakCount} Day Streak Active! Keep chatting to level up!`,
            { icon: "🔥" }
          );
        }
      });
    }
  }, [profile?.uid]);

  // DMs State
  const [chats, setChats] = useState<Chat[]>([]);
  const [isChatsLoaded, setIsChatsLoaded] = useState(false);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [messagesState, setMessagesState] = useState<{
    chatId: string | null;
    items: Message[];
  }>({ chatId: null, items: [] });

  const messages =
    activeChat && messagesState.chatId === activeChat.id
      ? messagesState.items
      : [];
  const [newMessage, setNewMessage] = useState("");
  const [users, setUsers] = useState<Record<string, UserBasic>>({});
  const [showNewChat, setShowNewChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [chatTab, setChatTab] = useState<"inbox" | "archived">("inbox");
  const [activeMenuChatId, setActiveMenuChatId] = useState<string | null>(null);
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);

  // Communities State
  const [messagesMode, setMessagesMode] = useState<
    "direct" | "communities" | "leaderboard"
  >("direct");
  const [leveledUpRank, setLeveledUpRank] = useState<StardomRank | null>(null);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [activeCommunity, setActiveCommunity] = useState<Community | null>(
    null
  );
  const [communityMessagesState, setCommunityMessagesState] = useState<{
    communityId: string | null;
    items: CommunityMessage[];
  }>({ communityId: null, items: [] });

  const communityMessages =
    activeCommunity && communityMessagesState.communityId === activeCommunity.id
      ? communityMessagesState.items
      : [];
  const [communityCategory, setCommunityCategory] = useState<string>("All");
  const [communityViewTab, setCommunityViewTab] = useState<
    "all" | "joined" | "discover"
  >("all");
  const [newCommunityMessageText, setNewCommunityMessageText] = useState("");
  const [isCreateCommunityOpen, setIsCreateCommunityOpen] = useState(false);
  const [isCommunityInfoOpen, setIsCommunityInfoOpen] = useState(false);
  const [sendingCommunityMsg, setSendingCommunityMsg] = useState(false);
  const [communityReplyingTo, setCommunityReplyingTo] =
    useState<CommunityMessage | null>(null);

  // Community Attachment & Photo Editing State
  const [communityMediaFile, setCommunityMediaFile] = useState<File | null>(
    null
  );
  const [communityMediaPreview, setCommunityMediaPreview] = useState<
    string | null
  >(null);
  const [communityEditingImage, setCommunityEditingImage] =
    useState<File | null>(null);

  // Community Members List State
  const [communityMembersList, setCommunityMembersList] = useState<UserBasic[]>(
    []
  );
  const [isLoadingCommunityMembers, setIsLoadingCommunityMembers] =
    useState(false);
  const [memberSearchQuery, setMemberSearchQuery] = useState("");

  // Media upload & editing state
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string | null>(null);
  const [, setIsUploadingImage] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [openMessageMenuId, setOpenMessageMenuId] = useState<string | null>(
    null
  );
  const [editingText, setEditingText] = useState("");
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [forwardingMessage, setForwardingMessage] = useState<
    Message | CommunityMessage | null
  >(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Voice Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Swipe state for ChatSidebar
  const [swipedChatId, setSwipedChatId] = useState<string | null>(null);
  const [swipingChatId, setSwipingChatId] = useState<string | null>(null);
  const [swipeOffset, setSwipeOffset] = useState<number>(0);

  const activeChatRef = useRef<Chat | null>(null);
  const activeCommunityRef = useRef<Community | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const communityMessagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getUserStatus = (user: UserBasic) => {
    const date = toTimestampDate(user.lastSeen || user.lastLogin);
    if (!date) return { isOnline: false, text: "Offline" };

    // eslint-disable-next-line react-hooks/purity
    const diffInMinutes = (new Date().getTime() - date.getTime()) / (1000 * 60);

    if (diffInMinutes < 3 && user?.isOnline === true) {
      return { isOnline: true, text: "Online" };
    }

    return {
      isOnline: false,
      text: `Last seen ${formatDistanceToNow(date, { addSuffix: true })}`,
    };
  };

  const formatMessageTime = (createdAt: unknown) => {
    const date = toTimestampDate(createdAt);
    if (!date) return "";
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatCommunityTime = (createdAt: unknown) => {
    const date = toTimestampDate(createdAt);
    if (!date) return "";

    const now = new Date();

    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }

    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  // Load users
  useEffect(() => {
    const fetchUsers = async () => {
      const res = await getAllUsers();
      const userList = res.success && res.users ? res.users : [];
      const userMap: Record<string, UserBasic> = {};
      userList.forEach((u) => {
        userMap[u.uid] = u;
      });
      setUsers(userMap);
    };
    fetchUsers();
  }, [profile?.uid]);

  // Load community member profiles when drawer is opened
  useEffect(() => {
    if (!activeCommunity || !isCommunityInfoOpen) return;
    let isCancelled = false;
    const loadMembers = async () => {
      setIsLoadingCommunityMembers(true);
      try {
        const memberIds = activeCommunity.members || [];
        const loaded: UserBasic[] = [];
        const missingIds: string[] = [];

        memberIds.forEach((id) => {
          if (users[id]) {
            loaded.push(users[id]);
          } else {
            missingIds.push(id);
          }
        });

        if (missingIds.length > 0) {
          const fetchPromises = missingIds.map((id) => getUserById(id));
          const results = await Promise.all(fetchPromises);
          results.forEach((res) => {
            if (res.success && res.user) {
              loaded.push(res.user);
            }
          });
        }

        if (!isCancelled) {
          setCommunityMembersList(loaded);
        }
      } catch (err) {
        console.error("Failed to load community members:", err);
      } finally {
        if (!isCancelled) setIsLoadingCommunityMembers(false);
      }
    };
    loadMembers();
    return () => {
      isCancelled = true;
    };
  }, [
    activeCommunity?.id,
    isCommunityInfoOpen,
    activeCommunity?.members,
    users,
  ]);

  const filteredCommunityMembers = memberSearchQuery.trim()
    ? communityMembersList.filter(
        (m) =>
          m.fullName?.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
          m.username?.toLowerCase().includes(memberSearchQuery.toLowerCase())
      )
    : communityMembersList;

  // Handle URL category deep-link (e.g. /messages?category=Sports from Feed chips)
  const initiatedCategoryRef = useRef<string | null>(null);
  useEffect(() => {
    if (!targetCategoryParam) return;
    if (initiatedCategoryRef.current === targetCategoryParam) return;
    initiatedCategoryRef.current = targetCategoryParam;

    setMessagesMode("communities");
    setActiveChat(null);
    if (CATEGORY_FILTERS.includes(targetCategoryParam)) {
      setCommunityCategory(targetCategoryParam);
    } else {
      setCommunityCategory("All");
    }
  }, [targetCategoryParam]);

  // Handle URL communityId deep-link (e.g. /messages?communityId=... from notifications)
  const initiatedCommunityParamRef = useRef<string | null>(null);
  useEffect(() => {
    if (!targetCommunityIdParam || communities.length === 0) return;
    if (initiatedCommunityParamRef.current === targetCommunityIdParam) return;

    const matched = communities.find((c) => c.id === targetCommunityIdParam);
    if (matched) {
      initiatedCommunityParamRef.current = targetCommunityIdParam;
      setMessagesMode("communities");
      setActiveChat(null);
      markCommunityAsRead(matched.id);
      setActiveCommunity(matched);
    }
  }, [targetCommunityIdParam, communities]);

  // Handle URL target user param or chatId
  const initiatedTargetParamRef = useRef<string | null>(null);
  useEffect(() => {
    if (!targetUserParam || !profile?.uid || !isChatsLoaded) return;
    if (initiatedTargetParamRef.current === targetUserParam) return;

    const initiateChat = async () => {
      const existingChatById = chats.find((c) => c.id === targetUserParam);
      if (existingChatById) {
        initiatedTargetParamRef.current = targetUserParam;
        setActiveChat(existingChatById);
        setMessagesMode("direct");
        return;
      }

      let targetUid = targetUserParam;
      if (!users[targetUserParam]) {
        const userRes = await getUserByUsername(targetUserParam);
        if (userRes.success && userRes.user) {
          targetUid = userRes.user.uid;
        } else {
          try {
            const { getDoc, doc } = await import("firebase/firestore");
            const { db } = await import("@/lib/firebase");
            const legacyDoc = await getDoc(doc(db, "chats", targetUserParam));
            if (legacyDoc.exists()) {
              const participants = legacyDoc.data()?.participants || [];
              const partnerId = participants.find(
                (p: string) => p !== profile.uid
              );
              if (partnerId) {
                const canonicalChat = chats.find(
                  (c) => c.participants && c.participants.includes(partnerId)
                );
                if (canonicalChat) {
                  initiatedTargetParamRef.current = targetUserParam;
                  setActiveChat(canonicalChat);
                  setMessagesMode("direct");
                  return;
                }
              }
            }
          } catch {
            // Ignore and proceed
          }
        }
      }

      if (targetUid === profile.uid) return;

      const existingChatByParticipant = chats.find(
        (c) => c.participants && c.participants.includes(targetUid)
      );
      if (existingChatByParticipant) {
        initiatedTargetParamRef.current = targetUserParam;
        setActiveChat(existingChatByParticipant);
        setMessagesMode("direct");
        return;
      }

      initiatedTargetParamRef.current = targetUserParam;

      const res = await getOrCreateChat(profile.uid, targetUid);
      if (res.success && res.chat) {
        setActiveChat(res.chat as Chat);
        setMessagesMode("direct");
      }
    };

    initiateChat();
  }, [targetUserParam, profile?.uid, isChatsLoaded, chats, users]);

  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  useEffect(() => {
    activeCommunityRef.current = activeCommunity;
  }, [activeCommunity]);

  // Subscribe to DMs
  useEffect(() => {
    if (!profile?.uid) return;
    const unsubscribe = subscribeToChats(profile.uid, async (updatedChats) => {
      setChats(updatedChats);
      setIsChatsLoaded(true);

      const missingUserIds = new Set<string>();
      updatedChats.forEach((chat) => {
        const otherUserId = chat.participants.find((p) => p !== profile.uid);
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
          setUsers((prev) => ({ ...prev, ...fetchedMap }));
        }
      }

      if (activeChatRef.current) {
        const current = updatedChats.find(
          (c) => c.id === activeChatRef.current?.id
        );
        if (current) setActiveChat(current);
      }
    });
    return () => unsubscribe();
  }, [profile?.uid]);

  // Subscribe to DM Messages & Real-time Presence
  const activeChatId = activeChat?.id;
  const activeChatParticipants = activeChat?.participants;

  useEffect(() => {
    if (!activeChatId || !activeChatParticipants) return;

    const unsubscribeMsgs = subscribeToMessages(activeChatId, (newMessages) => {
      setMessagesState({ chatId: activeChatId, items: newMessages });
    });

    if (profile?.uid) {
      markMessagesAsRead(activeChatId, profile.uid);
    }

    const otherUserId = activeChatParticipants.find(
      (id: string) => id !== profile?.uid
    );

    let unsubscribePresence: (() => void) | undefined;

    if (otherUserId) {
      unsubscribePresence = listenToUserProfile(otherUserId, (updatedUser) => {
        setUsers((prev) => ({
          ...prev,
          [otherUserId]: {
            ...prev[otherUserId],
            ...updatedUser,
            uid: otherUserId,
          },
        }));
      });
    }

    return () => {
      unsubscribeMsgs();
      unsubscribePresence?.();
    };
  }, [activeChatId, activeChatParticipants, profile?.uid]);

  // Subscribe to Public Communities & keep activeCommunity synced
  useEffect(() => {
    const unsubscribe = subscribeToCommunities((list) => {
      setCommunities(list);
      if (activeCommunityRef.current) {
        const updatedActive = list.find(
          (c) => c.id === activeCommunityRef.current?.id
        );
        if (updatedActive) {
          setActiveCommunity(updatedActive);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to Active Community Messages
  const activeCommunityId = activeCommunity?.id;

  useEffect(() => {
    if (!activeCommunityId) {
      setCommunityMessagesState({ communityId: null, items: [] });
      return;
    }

    markCommunityAsRead(activeCommunityId);

    const unsubscribe = subscribeToCommunityMessages(
      activeCommunityId,
      (msgs) => {
        setCommunityMessagesState({
          communityId: activeCommunityId,
          items: msgs,
        });
      }
    );

    return () => unsubscribe();
  }, [activeCommunityId]);

  // Auto-scroll DMs & Communities
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeChatId]);

  useEffect(() => {
    communityMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [communityMessages, activeCommunity]);

  // Send DM Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !mediaFile) || !activeChat || !profile?.uid)
      return;

    const file = mediaFile;
    const text = newMessage;

    setNewMessage("");
    setMediaFile(null);
    setMediaPreviewUrl(null);
    setReplyingTo(null);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    updateTypingStatus(activeChat.id, profile.uid, false);

    let uploadedMediaUrl = undefined;
    let type: "text" | "image" | "audio" | "document" = "text";
    let finalMsgText = text;

    if (file) {
      try {
        setIsUploadingImage(true);
        uploadedMediaUrl = await uploadMediaToCloudinary(
          file,
          "messages",
          file.type.startsWith("image/") ? "image" : "auto",
          activeChat.id
        );

        if (file.type.startsWith("image/")) type = "image";
        else if (
          file.type.startsWith("audio/") ||
          file.type.includes("mp4") ||
          file.type.includes("webm") ||
          file.name.endsWith(".webm") ||
          file.name.endsWith(".mp3") ||
          file.name.endsWith(".ogg") ||
          file.name.endsWith(".m4a") ||
          file.name.endsWith(".wav")
        )
          type = "audio";
        else type = "document";

        if (!finalMsgText) {
          if (type === "image") finalMsgText = "Sent an image";
          else if (type === "audio") finalMsgText = "Sent an audio message";
          else finalMsgText = file.name;
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

    awardUserXP(profile.uid, "send_message").then((res) => {
      if (res.leveledUp && res.newRank) {
        setLeveledUpRank(res.newRank);
      }
    });
  };

  const handleCommunityFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (file.type.startsWith("image/")) {
      setCommunityEditingImage(file);
      return;
    }

    if (communityMediaPreview) {
      URL.revokeObjectURL(communityMediaPreview);
    }
    setCommunityMediaFile(file);
    setCommunityMediaPreview(null);
  };

  const handleCommunityEditorConfirm = (editedFile: File) => {
    if (communityMediaPreview) {
      URL.revokeObjectURL(communityMediaPreview);
    }
    setCommunityMediaFile(editedFile);
    setCommunityMediaPreview(URL.createObjectURL(editedFile));
    setCommunityEditingImage(null);
  };

  // Send Community Message
  const handleSendCommunityMessage = async (
    e?: React.FormEvent<HTMLFormElement>
  ) => {
    e?.preventDefault();
    if (
      (!newCommunityMessageText.trim() && !communityMediaFile) ||
      !activeCommunity ||
      !profile
    )
      return;

    try {
      setSendingCommunityMsg(true);
      const text = newCommunityMessageText.trim();
      const replyId = communityReplyingTo?.id;
      const replyText = communityReplyingTo?.text;
      const replySenderName = communityReplyingTo?.senderName;

      let uploadedMediaUrl: string | undefined = undefined;
      let msgType: "text" | "image" | "audio" | "document" = "text";

      if (communityMediaFile) {
        const isImg = communityMediaFile.type.startsWith("image/");
        msgType = isImg ? "image" : "document";
        try {
          uploadedMediaUrl = await uploadMediaToCloudinary(
            communityMediaFile,
            "messages",
            isImg ? "image" : "auto"
          );
        } catch (uploadErr: any) {
          toast.error(`Media upload failed: ${uploadErr.message}`);
          setSendingCommunityMsg(false);
          return;
        }
      }

      setNewCommunityMessageText("");
      setCommunityReplyingTo(null);
      if (communityMediaPreview) {
        URL.revokeObjectURL(communityMediaPreview);
        setCommunityMediaPreview(null);
      }
      setCommunityMediaFile(null);

      await sendCommunityMessage(
        activeCommunity.id,
        profile.uid,
        text || (msgType === "image" ? "Sent an image" : "Attachment"),
        profile.fullName,
        profile.avatar || "",
        msgType,
        uploadedMediaUrl,
        replyId,
        replyText,
        replySenderName,
        activeCommunity.name
      );

      awardUserXP(profile.uid, "send_message").then((res) => {
        if (res.leveledUp && res.newRank) {
          setLeveledUpRank(res.newRank);
        }
      });
    } catch (err: unknown) {
      console.error("Error sending community message:", err);
      toast.error("Failed to send message");
    } finally {
      setSendingCommunityMsg(false);
    }
  };

  // Community Membership & Moderation Handlers
  const handleJoinCommunity = async (comm: Community) => {
    if (!profile) {
      toast.error("Please log in to join communities");
      return;
    }

    if (comm.accessType === "locked") {
      toast.error("This community is locked and not accepting new members.");
      return;
    }

    if (comm.accessType === "private") {
      const res = await requestToJoinCommunity(comm.id, {
        uid: profile.uid,
        fullName: profile.fullName,
        username: profile.username,
        avatar: profile.avatar,
      });
      if (res.success) {
        trackEvent("join_community", {
          community_id: comm.id,
          access_type: comm.accessType,
          status: "pending",
        });
        toast.success("Join request sent to community admin! 🔒");
      } else {
        toast.error(res.error || "Failed to send request");
      }
      return;
    }

    const res = await joinCommunity(comm.id, profile.uid);
    if (res.success) {
      toast.success(`Joined ${comm.name}! 🎉`);
      setActiveCommunity({
        ...comm,
        members: [...comm.members, profile.uid],
        memberCount: comm.memberCount + 1,
      });
    } else {
      toast.error(res.error || "Failed to join community");
    }
  };

  const handleCancelJoinRequest = async (comm: Community) => {
    if (!profile?.uid) return;
    const res = await cancelJoinRequest(comm.id, profile.uid);
    if (res.success) {
      toast.success("Join request cancelled");
    } else {
      toast.error("Failed to cancel request");
    }
  };

  const handleAcceptRequest = async (
    comm: Community,
    req: JoinRequestDetail
  ) => {
    const res = await acceptJoinRequest(comm.id, req);
    if (res.success) {
      toast.success(`Accepted ${req.fullName || "User"} into ${comm.name}! 🎉`);
    } else {
      toast.error("Failed to accept request");
    }
  };

  const handleDeclineRequest = async (comm: Community, userId: string) => {
    const res = await declineJoinRequest(comm.id, userId);
    if (res.success) {
      toast.success("Join request declined");
    } else {
      toast.error("Failed to decline request");
    }
  };

  const handleUpdateCommunityAccess = async (
    comm: Community,
    newAccess: CommunityAccessType
  ) => {
    const res = await updateCommunityAccess(comm.id, newAccess);
    if (res.success) {
      toast.success(`Community access updated to ${newAccess.toUpperCase()}`);
    } else {
      toast.error("Failed to update access settings");
    }
  };

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

  // Voice Note Recording
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

      mediaRecorder.onstop = () => {
        const mimeType = mediaRecorder.mimeType || "audio/webm";
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });

        let ext = "webm";
        if (mimeType.includes("mp4")) ext = "mp4";
        else if (mimeType.includes("ogg")) ext = "ogg";
        else if (mimeType.includes("mpeg") || mimeType.includes("mp3"))
          ext = "mp3";

        const audioFile = new File(
          [audioBlob],
          `voice-note-${Date.now()}.${ext}`,
          { type: mimeType }
        );

        if (mediaPreviewUrl) URL.revokeObjectURL(mediaPreviewUrl);

        const previewUrl = URL.createObjectURL(audioBlob);
        setMediaFile(audioFile);
        setMediaPreviewUrl(previewUrl);

        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);

      let time = 0;
      recordingTimerRef.current = setInterval(() => {
        time++;
        setRecordingTime(time);
      }, 1000);
    } catch {
      toast.error("Microphone access denied");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      setRecordingTime(0);
    }
  };

  // DM Actions
  const handleToggleArchive = async (
    chatId: string,
    isArchived: boolean,
    e?: React.MouseEvent
  ) => {
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
    if (
      confirm(
        "Are you sure you want to delete this chat? It will be hidden from your inbox."
      )
    ) {
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
    const existing = chats.find(
      (c) => c.participants && c.participants.includes(otherUserId)
    );
    if (existing) {
      setActiveChat(existing);
      setMessagesMode("direct");
      return;
    }
    const res = await getOrCreateChat(profile.uid, otherUserId);
    if (res.success && res.chat) {
      setActiveChat(res.chat as Chat);
      setMessagesMode("direct");
    }
  };

  if (!profile) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-100px)]">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </div>
    );
  }

  const availableUsers = Object.values(users).filter(
    (u) =>
      u.uid !== profile.uid &&
      (u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.username.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredCommunities = communities.filter((c) => {
    const matchesCategory =
      communityCategory === "All" || c.category === communityCategory;
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const joinedCommunities = filteredCommunities
    .filter((c) => (c.members || []).includes(profile.uid))
    .sort((a, b) => {
      const aUnread =
        isCommunityUnread(a) && a.lastSenderId !== profile.uid ? 1 : 0;
      const bUnread =
        isCommunityUnread(b) && b.lastSenderId !== profile.uid ? 1 : 0;
      if (aUnread !== bUnread) return bUnread - aUnread;
      const aTime =
        (a.lastMessageTime as any)?.toMillis?.() ||
        (a.lastMessageTime as any)?.seconds * 1000 ||
        0;
      const bTime =
        (b.lastMessageTime as any)?.toMillis?.() ||
        (b.lastMessageTime as any)?.seconds * 1000 ||
        0;
      return bTime - aTime;
    });

  const discoverCommunities = filteredCommunities.filter(
    (c) => !(c.members || []).includes(profile.uid)
  );

  const otherPartnerId = activeChat
    ? activeChat.participants.find((id) => id !== profile.uid) ||
      activeChat.participants[0]
    : undefined;
  const otherPartner = otherPartnerId ? users[otherPartnerId] : undefined;
  const otherPartnerStatus = otherPartner
    ? getUserStatus(otherPartner)
    : { isOnline: false, text: "" };

  return (
    <div className="flex-1 flex flex-col md:flex-row max-w-[1600px] mx-auto w-full h-[calc(100dvh-10rem)] md:h-[calc(100vh-4rem)] max-h-[920px] gap-2 md:gap-4 p-2 md:p-3 lg:p-4 lg:gap-5 overflow-hidden">
      {/* SIDEBAR */}
      <ChatSidebar
        profile={profile}
        unreadCommunities={unreadCommunities}
        messagesMode={messagesMode}
        setMessagesMode={setMessagesMode}
        chats={chats}
        activeChat={activeChat}
        setActiveChat={setActiveChat}
        communities={communities}
        filteredCommunities={filteredCommunities}
        joinedCommunities={joinedCommunities}
        discoverCommunities={discoverCommunities}
        activeCommunity={activeCommunity}
        setActiveCommunity={setActiveCommunity}
        communityCategory={communityCategory}
        setCommunityCategory={setCommunityCategory}
        communityViewTab={communityViewTab}
        setCommunityViewTab={setCommunityViewTab}
        users={users}
        availableUsers={availableUsers}
        showNewChat={showNewChat}
        setShowNewChat={setShowNewChat}
        setIsCreateCommunityOpen={setIsCreateCommunityOpen}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        chatTab={chatTab}
        setChatTab={setChatTab}
        activeMenuChatId={activeMenuChatId}
        setActiveMenuChatId={setActiveMenuChatId}
        swipedChatId={swipedChatId}
        setSwipedChatId={setSwipedChatId}
        swipingChatId={swipingChatId}
        setSwipingChatId={setSwipingChatId}
        swipeOffset={swipeOffset}
        setSwipeOffset={setSwipeOffset}
        getUserStatus={getUserStatus}
        formatMessageTime={formatMessageTime}
        formatCommunityTime={formatCommunityTime}
        startNewChatWithUser={startNewChatWithUser}
        handleToggleArchive={handleToggleArchive}
        handleDeleteChat={handleDeleteChat}
        handleMarkAsRead={handleMarkAsRead}
        handleMarkAsUnread={handleMarkAsUnread}
        handleJoinCommunity={handleJoinCommunity}
        handleCancelJoinRequest={handleCancelJoinRequest}
      />

      {/* VIEW 1: ACTIVE DM CHAT */}
      {messagesMode === "direct" && activeChat && (
        <div className="flex-1 h-full flex flex-col neo-card bg-slate-900/60 border border-white/5 rounded-3xl overflow-hidden shadow-2xl relative min-w-0">
          <DMHeader
            activeChat={activeChat}
            currentUserId={profile.uid}
            otherUser={otherPartner}
            isOnline={otherPartnerStatus.isOnline}
            statusText={otherPartnerStatus.text}
            menuOpen={headerMenuOpen}
            onBack={() => setActiveChat(null)}
            onToggleMenu={() => setHeaderMenuOpen(!headerMenuOpen)}
            onCloseMenu={() => setHeaderMenuOpen(false)}
            onToggleArchive={handleToggleArchive}
            onDeleteChat={handleDeleteChat}
          />

          <DMMessageFeed
            messages={messages}
            currentUserId={profile.uid}
            currentUserAvatar={profile.avatar}
            currentUserName={profile.fullName}
            otherUser={otherPartner}
            editingMessageId={editingMessageId}
            editingText={editingText}
            setEditingText={setEditingText}
            onCancelEdit={() => setEditingMessageId(null)}
            onSaveEdit={async (msg) => {
              if (editingText.trim()) {
                await editMessage(activeChat.id, msg.id, editingText.trim());
                setEditingMessageId(null);
                toast.success("Message updated");
              }
            }}
            openMessageMenuId={openMessageMenuId}
            onToggleMenu={(messageId) =>
              setOpenMessageMenuId(
                openMessageMenuId === messageId ? null : messageId
              )
            }
            onReply={(msg) => {
              setReplyingTo(msg);
              setOpenMessageMenuId(null);
              setTimeout(() => textareaRef.current?.focus(), 0);
            }}
            onEdit={(msg) => {
              setEditingMessageId(msg.id);
              setEditingText(msg.text);
              setOpenMessageMenuId(null);
            }}
            onCopy={(msg) => {
              navigator.clipboard.writeText(msg.text);
              toast.success("Copied to clipboard");
              setOpenMessageMenuId(null);
            }}
            onForward={(msg) => {
              setForwardingMessage(msg);
              setOpenMessageMenuId(null);
            }}
            onDelete={async (msg, isOwnMessage) => {
              if (
                window.confirm(
                  isOwnMessage
                    ? "Delete message for everyone?"
                    : "Delete message for you?"
                )
              ) {
                await deleteMessage(
                  activeChat.id,
                  msg.id,
                  profile.uid,
                  isOwnMessage ? "forEveryone" : "forMe"
                );
                toast.success("Message deleted");
              }
              setOpenMessageMenuId(null);
            }}
            formatMessageTime={formatMessageTime}
            messagesEndRef={messagesEndRef}
          />

          {replyingTo && (
            <div className="px-4 pt-3 pb-1 bg-slate-900/95 border-t border-white/5 animate-in slide-in-from-bottom duration-150">
              <div className="flex items-center gap-3 p-2.5 bg-slate-800/80 rounded-xl border-l-4 border-brand">
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-brand block">
                    {replyingTo.senderId === profile.uid
                      ? "You"
                      : users[replyingTo.senderId]?.fullName || "User"}
                  </span>
                  <span className="text-xs text-slate-300 truncate block">
                    {replyingTo.text}
                  </span>
                </div>
                <button
                  onClick={() => setReplyingTo(null)}
                  type="button"
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          <MessageInput
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            mediaFile={mediaFile}
            mediaPreviewUrl={mediaPreviewUrl}
            setMediaFile={setMediaFile}
            setMediaPreviewUrl={setMediaPreviewUrl}
            isRecording={isRecording}
            recordingTime={recordingTime}
            startRecording={startRecording}
            stopRecording={stopRecording}
            onSendMessage={handleSendMessage}
            textareaRef={textareaRef}
          />
        </div>
      )}

      {/* VIEW 2: ACTIVE PUBLIC COMMUNITY CHAT */}
      {messagesMode === "communities" && activeCommunity && (
        <CommunityChannelView
          profile={profile}
          activeCommunity={activeCommunity}
          setActiveCommunity={setActiveCommunity}
          communityMessages={communityMessages}
          users={users}
          isCommunityInfoOpen={isCommunityInfoOpen}
          setIsCommunityInfoOpen={setIsCommunityInfoOpen}
          communityMembersList={communityMembersList}
          setCommunityMembersList={setCommunityMembersList}
          isLoadingCommunityMembers={isLoadingCommunityMembers}
          memberSearchQuery={memberSearchQuery}
          setMemberSearchQuery={setMemberSearchQuery}
          filteredCommunityMembers={filteredCommunityMembers}
          openMessageMenuId={openMessageMenuId}
          setOpenMessageMenuId={setOpenMessageMenuId}
          communityReplyingTo={communityReplyingTo}
          setCommunityReplyingTo={setCommunityReplyingTo}
          setForwardingMessage={(msg) => setForwardingMessage(msg)}
          newCommunityMessageText={newCommunityMessageText}
          setNewCommunityMessageText={setNewCommunityMessageText}
          sendingCommunityMsg={sendingCommunityMsg}
          communityMediaFile={communityMediaFile}
          setCommunityMediaFile={setCommunityMediaFile}
          communityMediaPreview={communityMediaPreview}
          setCommunityMediaPreview={setCommunityMediaPreview}
          communityEditingImage={communityEditingImage}
          setCommunityEditingImage={setCommunityEditingImage}
          handleCommunityFileSelect={handleCommunityFileSelect}
          handleCommunityEditorConfirm={handleCommunityEditorConfirm}
          handleSendCommunityMessage={handleSendCommunityMessage}
          handleJoinCommunity={handleJoinCommunity}
          handleLeaveCommunity={handleLeaveCommunity}
          handleCancelJoinRequest={handleCancelJoinRequest}
          handleAcceptRequest={handleAcceptRequest}
          handleDeclineRequest={handleDeclineRequest}
          handleUpdateCommunityAccess={handleUpdateCommunityAccess}
          toTimestampDate={toTimestampDate}
          formatMessageTime={formatMessageTime}
          communityMessagesEndRef={communityMessagesEndRef}
        />
      )}

      {/* VIEW 3: LEADERBOARD MODE (Desktop View) */}
      {messagesMode === "leaderboard" && (
        <div className="hidden md:flex flex-1 flex-col neo-card bg-slate-900/60 border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
          <LeaderboardView />
        </div>
      )}

      {/* VIEW 4: EMPTY STATE WHEN NO CHAT IS OPEN */}
      {messagesMode !== "leaderboard" && !activeChat && !activeCommunity && (
        <div className="hidden md:flex flex-1 flex-col items-center justify-center neo-card bg-slate-900/60 border border-white/5 rounded-3xl p-8 text-center shadow-2xl">
          <div className="w-20 h-20 rounded-3xl bg-brand/10 text-brand flex items-center justify-center mb-4 border border-brand/20 shadow-inner">
            <Globe className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Welcome to Rhockstar Messages
          </h2>
          <p className="text-slate-400 text-sm max-w-md leading-relaxed mb-6">
            Connect 1-on-1 with professionals or join vibrant Public Communities
            to discuss football, tech, jobs, music, and more!
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMessagesMode("communities")}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-brand to-brand-purple text-slate-950 font-extrabold text-xs shadow-lg hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <Globe className="w-4 h-4" />
              Explore Communities
            </button>
            <button
              onClick={() => {
                setMessagesMode("direct");
                setShowNewChat(true);
              }}
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
          setMessagesMode("communities");
          const created = communities.find((c) => c.id === commId);
          if (created) setActiveCommunity(created);
        }}
      />

      {/* Stardom Level Up Celebration Modal */}
      <LevelUpModal
        isOpen={!!leveledUpRank}
        onClose={() => setLeveledUpRank(null)}
        newRank={leveledUpRank || "Explorer"}
      />

      {/* Forward Message Modal */}
      <ForwardMessageModal
        forwardingMessage={forwardingMessage}
        onClose={() => setForwardingMessage(null)}
        chats={chats}
        activeChatId={activeChat?.id}
        currentUserId={profile.uid}
        users={users}
      />
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-brand" />
        </div>
      }
    >
      <MessagesContent />
    </Suspense>
  );
}
