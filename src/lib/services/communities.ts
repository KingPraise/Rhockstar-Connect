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
  arrayUnion,
  arrayRemove,
  increment
} from 'firebase/firestore';

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
  lastMessage?: string;
  lastMessageTime?: unknown;
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
}

// Create a new public community
export const createCommunity = async (data: {
  name: string;
  description: string;
  category: string;
  icon?: string;
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
      creatorId: data.creatorId,
      creatorName: data.creatorName,
      creatorAvatar: data.creatorAvatar || '',
      memberCount: 1,
      members: [data.creatorId],
      admins: [data.creatorId],
      lastMessage: 'Community created! Welcome everyone 👋',
      lastMessageTime: serverTimestamp(),
      createdAt: serverTimestamp(),
    });

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

// Send message inside a community
export const sendCommunityMessage = async (
  communityId: string,
  senderId: string,
  text: string,
  senderName: string,
  senderAvatar?: string,
  type: 'text' | 'image' | 'audio' | 'document' = 'text',
  mediaUrl?: string
) => {
  try {
    const messagesRef = collection(db, 'communities', communityId, 'messages');
    await addDoc(messagesRef, {
      communityId,
      senderId,
      senderName,
      senderAvatar: senderAvatar || '',
      text,
      type,
      mediaUrl: mediaUrl || '',
      createdAt: serverTimestamp(),
    });

    // Update community last message
    const communityRef = doc(db, 'communities', communityId);
    await updateDoc(communityRef, {
      lastMessage: text || (type === 'image' ? 'Sent an image' : 'Attachment'),
      lastMessageTime: serverTimestamp(),
    });

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
