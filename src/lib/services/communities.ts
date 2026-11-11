import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  doc,
  updateDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove,
  increment,
  where,
  getDocs,
  getDoc
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { createNotification } from './notifications';

export type CommunityAccessType = 'public' | 'private' | 'locked';

export interface JoinRequestDetail {
  uid: string;
  fullName: string;
  username?: string;
  avatar?: string;
  requestedAt?: unknown;
}

export interface Community {
  id: string;
  name: string;
  description: string;
  category: string; // 'Sports' | 'Tech & Career' | 'Hobbies' | 'Campus' | 'General'
  icon?: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar?: string;
  memberCount: number;
  members: string[]; // List of user UIDs
  admins: string[];
  accessType?: CommunityAccessType; // 'public' (free) | 'private' (requires approval) | 'locked' (no new members)
  pendingRequests?: string[]; // Array of UIDs
  pendingRequestDetails?: JoinRequestDetail[]; // Detailed requests for admin review
  lastMessage?: string;
  lastMessageTime?: unknown;
  lastSenderName?: string;
  lastSenderId?: string;
  createdAt?: unknown;
}

export interface CommunityMessage {
  id: string;
  communityId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  text: string;
  type?: 'text' | 'image' | 'audio' | 'document';
  mediaUrl?: string;
  createdAt: unknown;
  isDeleted?: boolean;
  replyToId?: string;
  replyToText?: string;
  replyToSenderName?: string;
}

// Local read timestamp tracking for immediate client-side responsiveness
export const markCommunityAsRead = (communityId: string) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`rhockstar_comm_read_${communityId}`, String(Date.now()));
    window.dispatchEvent(new CustomEvent('rhockstar:community-read', { detail: { communityId } }));
  } catch (e) {
    console.warn('Failed to save community read marker:', e);
  }
};

export const getCommunityLastRead = (communityId: string): number => {
  if (typeof window === 'undefined') return 0;
  try {
    const val = localStorage.getItem(`rhockstar_comm_read_${communityId}`);
    return val ? Number(val) : 0;
  } catch {
    return 0;
  }
};

export const isCommunityUnread = (community: Community, lastReadTimestamp?: number): boolean => {
  if (!community.lastMessageTime) return false;
  const readTime = lastReadTimestamp !== undefined ? lastReadTimestamp : getCommunityLastRead(community.id);
  let msgTime = 0;
  if (typeof (community.lastMessageTime as any)?.toMillis === 'function') {
    msgTime = (community.lastMessageTime as any).toMillis();
  } else if (community.lastMessageTime instanceof Date) {
    msgTime = community.lastMessageTime.getTime();
  } else if (typeof community.lastMessageTime === 'number') {
    msgTime = community.lastMessageTime;
  }
  return msgTime > readTime;
};

// Create a new public community
export const createCommunity = async (data: {
  name: string;
  description: string;
  category: string;
  icon?: string;
  accessType?: CommunityAccessType;
  creatorId: string;
  creatorName: string;
  creatorAvatar?: string;
}) => {
  try {
    const communitiesRef = collection(db, 'communities');
    const newDoc = await addDoc(communitiesRef, {
      name: data.name,
      description: data.description,
      category: data.category || 'General',
      icon: data.icon || '💬',
      accessType: data.accessType || 'public',
      creatorId: data.creatorId,
      creatorName: data.creatorName,
      creatorAvatar: data.creatorAvatar || '',
      memberCount: 1,
      members: [data.creatorId],
      admins: [data.creatorId],
      lastMessage: 'Community created! Welcome everyone 👋',
      lastMessageTime: serverTimestamp(),
      lastSenderName: data.creatorName,
      lastSenderId: data.creatorId,
      createdAt: serverTimestamp(),
    });

    // Mark as read for creator
    markCommunityAsRead(newDoc.id);

    // Send initial welcome message
    const messagesRef = collection(db, 'communities', newDoc.id, 'messages');
    await addDoc(messagesRef, {
      communityId: newDoc.id,
      senderId: data.creatorId,
      senderName: data.creatorName,
      senderAvatar: data.creatorAvatar || '',
      text: `Welcome to ${data.name}! ${data.description}`,
      type: 'text',
      createdAt: serverTimestamp(),
    });

    return { success: true, id: newDoc.id };
  } catch (error: any) {
    console.error('Error creating community:', error);
    return { success: false, error: error.message };
  }
};

// Real-time listener for public communities
export const subscribeToCommunities = (
  callback: (communities: Community[]) => void
) => {
  const communitiesRef = collection(db, 'communities');
  const q = query(communitiesRef, orderBy('createdAt', 'desc'));

  return onSnapshot(q, (snapshot) => {
    const list: Community[] = [];
    snapshot.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() } as Community);
    });
    callback(list);
  });
};

// Join a community
export const joinCommunity = async (communityId: string, userId: string) => {
  try {
    const communityRef = doc(db, 'communities', communityId);
    await updateDoc(communityRef, {
      members: arrayUnion(userId),
      memberCount: increment(1),
    });
    // Mark as read upon joining
    markCommunityAsRead(communityId);
    return { success: true };
  } catch (error: any) {
    console.error('Error joining community:', error);
    return { success: false, error: error.message };
  }
};

// Leave a community
export const leaveCommunity = async (communityId: string, userId: string) => {
  try {
    const communityRef = doc(db, 'communities', communityId);
    await updateDoc(communityRef, {
      members: arrayRemove(userId),
      memberCount: increment(-1),
    });
    return { success: true };
  } catch (error: any) {
    console.error('Error leaving community:', error);
    return { success: false, error: error.message };
  }
};

// Send message inside a community with smart @mention and reply alerts
export const sendCommunityMessage = async (
  communityId: string,
  senderId: string,
  text: string,
  senderName: string,
  senderAvatar?: string,
  type: 'text' | 'image' | 'audio' | 'document' = 'text',
  mediaUrl?: string,
  replyToId?: string,
  replyToText?: string,
  replyToSenderName?: string,
  communityName?: string
) => {
  try {
    const messagesRef = collection(db, 'communities', communityId, 'messages');
    const messageData: any = {
      communityId,
      senderId,
      senderName,
      senderAvatar: senderAvatar || '',
      text,
      type,
      mediaUrl: mediaUrl || '',
      createdAt: serverTimestamp(),
    };
    if (replyToId) {
      messageData.replyToId = replyToId;
    }
    if (replyToText) {
      messageData.replyToText = replyToText;
    }
    if (replyToSenderName) {
      messageData.replyToSenderName = replyToSenderName;
    }
    await addDoc(messagesRef, messageData);

    // Update community last message & sender details
    const communityRef = doc(db, 'communities', communityId);
    await updateDoc(communityRef, {
      lastMessage: text || (type === 'image' ? 'Sent an image' : 'Attachment'),
      lastMessageTime: serverTimestamp(),
      lastSenderName: senderName || 'Member',
      lastSenderId: senderId,
    });

    // Sender has read their own message
    markCommunityAsRead(communityId);

    // Asynchronously dispatch targeted mention & reply notifications without blocking message delivery
    (async () => {
      try {
        const recipientsToNotify = new Set<string>();

        // 1. Reply alert
        if (replyToId) {
          try {
            const repliedMsgDoc = await getDoc(doc(db, 'communities', communityId, 'messages', replyToId));
            if (repliedMsgDoc.exists()) {
              const originalSenderId = repliedMsgDoc.data()?.senderId;
              if (originalSenderId && originalSenderId !== senderId) {
                recipientsToNotify.add(originalSenderId);
              }
            }
          } catch (replyErr) {
            console.warn('Reply target lookup notice:', replyErr);
          }
        }

        // 2. Mention alerts (@username)
        const mentionMatches = text.match(/@([a-zA-Z0-9_]+)/g);
        if (mentionMatches && mentionMatches.length > 0) {
          const rawUsernames = [...new Set(mentionMatches.map((m) => m.slice(1).toLowerCase()))];
          for (const handle of rawUsernames.slice(0, 5)) {
            try {
              const userQuery = query(collection(db, 'users'), where('username', '==', handle));
              const snap = await getDocs(userQuery);
              if (!snap.empty) {
                const targetUid = snap.docs[0].id;
                if (targetUid !== senderId) {
                  recipientsToNotify.add(targetUid);
                }
              }
            } catch (mentionErr) {
              console.warn('Mention target lookup notice:', mentionErr);
            }
          }
        }

        if (recipientsToNotify.size > 0) {
          const auth = getAuth();
          const authToken = auth.currentUser ? await auth.currentUser.getIdToken().catch(() => null) : null;
          const commTitle = communityName || 'Community';

          for (const targetUid of recipientsToNotify) {
            // In-app Firestore notification
            createNotification({
              userId: targetUid,
              type: 'message',
              title: `Mentioned in ${commTitle}`,
              message: `${senderName}: ${text.slice(0, 100)}`,
              link: `/messages?communityId=${communityId}`,
              senderId,
              senderName,
              senderAvatar,
            }).catch(() => {});

            // Push notification via /api/notify if authenticated
            if (authToken) {
              fetch('/api/notify', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${authToken}`,
                },
                body: JSON.stringify({
                  userId: targetUid,
                  title: `Mention in ${commTitle}`,
                  body: `${senderName}: ${text.slice(0, 120)}`,
                  url: `/messages?communityId=${communityId}`,
                }),
              }).catch(() => {});
            }
          }
        }
      } catch (notifDispatchErr) {
        console.warn('Community notification dispatch notice:', notifDispatchErr);
      }
    })();

    return { success: true };
  } catch (error: any) {
    console.error('Error sending community message:', error);
    return { success: false, error: error.message };
  }
};

// Real-time listener for community messages
export const subscribeToCommunityMessages = (
  communityId: string,
  callback: (messages: CommunityMessage[]) => void
) => {
  const messagesRef = collection(db, 'communities', communityId, 'messages');
  const q = query(messagesRef, orderBy('createdAt', 'asc'));

  return onSnapshot(q, (snapshot) => {
    const list: CommunityMessage[] = [];
    snapshot.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() } as CommunityMessage);
    });
    callback(list);
  });
};

// Delete a message (Admin or Sender)
export const deleteCommunityMessage = async (
  communityId: string,
  messageId: string
) => {
  try {
    const messageRef = doc(db, 'communities', communityId, 'messages', messageId);
    await updateDoc(messageRef, {
      isDeleted: true,
      text: 'This message was deleted.',
    });
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting community message:', error);
    return { success: false, error: error.message };
  }
};

// Remove a member from a community (Admin only)
export const removeMemberFromCommunity = async (
  communityId: string,
  memberId: string
) => {
  try {
    const communityRef = doc(db, 'communities', communityId);
    await updateDoc(communityRef, {
      members: arrayRemove(memberId),
      memberCount: increment(-1),
    });
    return { success: true };
  } catch (error: any) {
    console.error('Error removing member:', error);
    return { success: false, error: error.message };
  }
};

// Request to join a private community
export const requestToJoinCommunity = async (
  communityId: string, 
  user: { uid: string; fullName: string; username?: string; avatar?: string }
) => {
  try {
    const communityRef = doc(db, 'communities', communityId);
    const requestItem: JoinRequestDetail = {
      uid: user.uid,
      fullName: user.fullName,
      username: user.username || '',
      avatar: user.avatar || '',
      requestedAt: new Date().toISOString(),
    };

    await updateDoc(communityRef, {
      pendingRequests: arrayUnion(user.uid),
      pendingRequestDetails: arrayUnion(requestItem),
    });
    return { success: true };
  } catch (error: any) {
    console.error('Error requesting to join community:', error);
    return { success: false, error: error.message };
  }
};

// Cancel a pending join request
export const cancelJoinRequest = async (communityId: string, userId: string, requestDetail?: JoinRequestDetail) => {
  try {
    const communityRef = doc(db, 'communities', communityId);
    const updates: any = {
      pendingRequests: arrayRemove(userId),
    };
    if (requestDetail) {
      updates.pendingRequestDetails = arrayRemove(requestDetail);
    }
    await updateDoc(communityRef, updates);
    return { success: true };
  } catch (error: any) {
    console.error('Error canceling join request:', error);
    return { success: false, error: error.message };
  }
};

// Accept a join request (Admin only)
export const acceptJoinRequest = async (
  communityId: string, 
  requestUser: { uid: string; fullName?: string; username?: string; avatar?: string }
) => {
  try {
    const communityRef = doc(db, 'communities', communityId);
    
    // Add to members and remove from pending
    await updateDoc(communityRef, {
      members: arrayUnion(requestUser.uid),
      memberCount: increment(1),
      pendingRequests: arrayRemove(requestUser.uid),
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error accepting join request:', error);
    return { success: false, error: error.message };
  }
};

// Decline a join request (Admin only)
export const declineJoinRequest = async (communityId: string, userId: string) => {
  try {
    const communityRef = doc(db, 'communities', communityId);
    await updateDoc(communityRef, {
      pendingRequests: arrayRemove(userId),
    });
    return { success: true };
  } catch (error: any) {
    console.error('Error declining join request:', error);
    return { success: false, error: error.message };
  }
};

// Update community access settings (Public, Private, Locked)
export const updateCommunityAccess = async (communityId: string, accessType: CommunityAccessType) => {
  try {
    const communityRef = doc(db, 'communities', communityId);
    await updateDoc(communityRef, {
      accessType,
    });
    return { success: true };
  } catch (error: any) {
    console.error('Error updating community access:', error);
    return { success: false, error: error.message };
  }
};

// Update community details (Admin only)
export const updateCommunity = async (communityId: string, updates: Partial<Community>) => {
  try {
    const communityRef = doc(db, 'communities', communityId);
    await updateDoc(communityRef, updates);
    return { success: true };
  } catch (error: any) {
    console.error('Error updating community:', error);
    return { success: false, error: error.message };
  }
};

// Delete community (Admin only)
export const deleteCommunity = async (communityId: string) => {
  try {
    const communityRef = doc(db, 'communities', communityId);
    await deleteDoc(communityRef);
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting community:', error);
    return { success: false, error: error.message };
  }
};
