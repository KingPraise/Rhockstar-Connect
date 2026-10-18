import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  where,
  getDocs,
  getDoc,
  setDoc,
  doc,
  updateDoc,
  arrayUnion
} from 'firebase/firestore';

import { createNotification } from './notifications';
import { getUserById } from './users';

export interface Chat {
  id: string;
  participants: string[];
  lastMessage: string;
  lastMessageTime: unknown;
  unreadCount: Record<string, number>;
  typingStatus?: Record<string, boolean>;
  archivedFor?: string[];
  deletedFor?: string[];
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  type?: 'text' | 'image' | 'audio' | 'document';
  mediaUrl?: string;
  status?: 'sent' | 'delivered' | 'read';
  readAt?: unknown;
  createdAt: unknown;
  replyToId?: string;
  replyToText?: string;
  isEdited?: boolean;
  isDeleted?: boolean;
  deletedForMe?: string[];
}

// Ensure a chat exists between two users
export const getOrCreateChat = async (userId1: string, userId2: string) => {
  try {
    // 1. Check deterministic 1-on-1 chat ID first: [id1, id2].sort().join('_')
    const deterministicId = [userId1, userId2].sort().join('_');
    const deterministicDocRef = doc(db, 'chats', deterministicId);
    const deterministicSnap = await getDoc(deterministicDocRef);

    if (deterministicSnap.exists()) {
      return { success: true, chat: { id: deterministicSnap.id, ...deterministicSnap.data() } as Chat };
    }

    // 2. Query existing chats to handle legacy non-deterministic random IDs
    const chatsRef = collection(db, 'chats');
    const q = query(chatsRef, where('participants', 'array-contains', userId1));
    const snapshot = await getDocs(q);
    
    let existingChat: any = null;
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.participants && data.participants.includes(userId2)) {
        if (!existingChat) {
          existingChat = { id: docSnap.id, ...data };
        } else if (data.lastMessage && !existingChat.lastMessage) {
          existingChat = { id: docSnap.id, ...data };
        }
      }
    });

    if (existingChat) {
      return { success: true, chat: existingChat as Chat };
    }

    // 3. Create new chat using deterministic ID to guarantee uniqueness across all concurrent requests
    const newChatData = {
      participants: [userId1, userId2],
      lastMessage: "",
      lastMessageTime: serverTimestamp(),
      unreadCount: { [userId1]: 0, [userId2]: 0 },
      typingStatus: { [userId1]: false, [userId2]: false }
    };
    
    await setDoc(deterministicDocRef, newChatData);
    
    return { success: true, chat: { id: deterministicId, ...newChatData } as Chat };
  } catch (error: unknown) {
    console.error("Error getting or creating chat:", error);
    return { success: false, error: (error as Error).message };
  }
};

// Send a message
export const sendMessage = async (
  chatId: string, 
  senderId: string, 
  text: string, 
  type: 'text' | 'image' | 'audio' | 'document' = 'text',
  mediaUrl?: string,
  replyToId?: string,
  replyToText?: string
) => {
  try {
    const messagesRef = collection(db, `chats/${chatId}/messages`);
    const chatRef = doc(db, 'chats', chatId);

    const messageData: any = {
      chatId,
      senderId,
      text,
      type,
      status: 'delivered',
      createdAt: serverTimestamp()
    };
    if (mediaUrl) {
      messageData.mediaUrl = mediaUrl;
    }
    if (replyToId) {
      messageData.replyToId = replyToId;
    }
    if (replyToText) {
      messageData.replyToText = replyToText;
    }

    await addDoc(messagesRef, messageData);
    
    // Get chat to find recipient
    const chatSnap = await getDoc(chatRef);
    if (chatSnap.exists()) {
      const participants: string[] = chatSnap.data().participants || [];
      const recipientId = participants.find(p => p !== senderId);
      
      const { increment, arrayRemove } = await import('firebase/firestore');

      await updateDoc(chatRef, {
        lastMessage: text,
        lastMessageTime: serverTimestamp(),
        ...(recipientId ? { 
          [`unreadCount.${recipientId}`]: increment(1),
          deletedFor: arrayRemove(recipientId)
        } : {})
      });

      if (recipientId) {
        // Fetch sender profile to include in notification
        const { user: senderProfile } = await getUserById(senderId);
        const senderName = senderProfile?.fullName || 'Someone';
        const senderAvatar = senderProfile?.avatar || '';

        const currentUnread = chatSnap.data().unreadCount?.[recipientId] || 0;
        const newUnread = currentUnread + 1;

        const title = newUnread > 1 ? `${newUnread} New Messages from ${senderName}` : `New Message from ${senderName}`;
        const messageBody = newUnread > 1 ? `You have ${newUnread} unread messages.` : (type === 'text' ? (text.length > 50 ? `${text.substring(0, 50)}...` : text) : `Sent an ${type}`);
        
        await createNotification({
          userId: recipientId,
          type: "message",
          title,
          message: messageBody,
          link: `/messages?chatId=${chatId}`,
          targetId: chatId,
          senderId: senderId,
          senderName,
          senderAvatar
        });

        // Trigger FCM Push Notification
        fetch('/api/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: recipientId,
            title,
            body: messageBody,
            url: `/messages?chatId=${chatId}`
          })
        }).catch(console.error);
      }
    }

    return { success: true };
  } catch (error: unknown) {
    console.error("Error sending message:", error);
    return { success: false, error: (error as Error).message };
  }
};

// Mark messages as read in active chat
export const markMessagesAsRead = async (chatId: string, currentUserId: string) => {
  try {
    const messagesRef = collection(db, `chats/${chatId}/messages`);
    const q = query(messagesRef, where('senderId', '!=', currentUserId));
    const snapshot = await getDocs(q);

    const updatePromises: Promise<void>[] = [];
    snapshot.forEach((docSnap) => {
      if (docSnap.data().status !== 'read') {
        updatePromises.push(updateDoc(doc(db, `chats/${chatId}/messages`, docSnap.id), { 
          status: 'read',
          readAt: serverTimestamp()
        }));
      }
    });

    // Also clear unreadCount on the chat document
    updatePromises.push(updateDoc(doc(db, 'chats', chatId), {
      [`unreadCount.${currentUserId}`]: 0
    }));

    await Promise.all(updatePromises);
  } catch (error) {
    console.error("Error marking messages read:", error);
  }
};

// Mark chat as unread
export const markChatAsUnread = async (chatId: string, userId: string) => {
  try {
    const chatRef = doc(db, 'chats', chatId);
    await updateDoc(chatRef, {
      [`unreadCount.${userId}`]: 1
    });
    return { success: true };
  } catch (error) {
    console.error("Error marking chat unread:", error);
    return { success: false };
  }
};

// Archive / Unarchive chat
export const toggleArchiveChat = async (chatId: string, userId: string, isCurrentlyArchived: boolean) => {
  try {
    const chatRef = doc(db, 'chats', chatId);
    const { arrayUnion, arrayRemove } = await import('firebase/firestore');
    await updateDoc(chatRef, {
      archivedFor: isCurrentlyArchived ? arrayRemove(userId) : arrayUnion(userId)
    });
    return { success: true };
  } catch (error) {
    console.error("Error toggling archive status:", error);
    return { success: false };
  }
};

// Delete chat conversation for user
export const deleteChatForUser = async (chatId: string, userId: string) => {
  try {
    const chatRef = doc(db, 'chats', chatId);
    const { arrayUnion } = await import('firebase/firestore');
    await updateDoc(chatRef, {
      deletedFor: arrayUnion(userId),
      [`unreadCount.${userId}`]: 0
    });
    return { success: true };
  } catch (error) {
    console.error("Error deleting chat:", error);
    return { success: false };
  }
};

// Update typing status
export const updateTypingStatus = async (chatId: string, userId: string, isTyping: boolean) => {
  try {
    const chatRef = doc(db, 'chats', chatId);
    await updateDoc(chatRef, {
      [`typingStatus.${userId}`]: isTyping
    });
  } catch (error) {
    console.error("Error updating typing status:", error);
  }
};

export const editMessage = async (chatId: string, messageId: string, newText: string) => {
  try {
    const msgRef = doc(db, `chats/${chatId}/messages`, messageId);
    await updateDoc(msgRef, {
      text: newText,
      isEdited: true
    });
    return { success: true };
  } catch (error) {
    console.error("Error editing message:", error);
    return { success: false };
  }
};

export const deleteMessage = async (chatId: string, messageId: string, userId: string, mode: 'forMe' | 'forEveryone') => {
  try {
    const msgRef = doc(db, `chats/${chatId}/messages`, messageId);
    if (mode === 'forEveryone') {
      await updateDoc(msgRef, {
        isDeleted: true
      });
    } else {
      await updateDoc(msgRef, {
        deletedForMe: arrayUnion(userId)
      });
    }
    return { success: true };
  } catch (error) {
    console.error("Error deleting message:", error);
    return { success: false };
  }
};

// Subscribe to a user's chats
export const subscribeToChats = (userId: string, callback: (chats: Chat[]) => void) => {
  const q = query(
    collection(db, 'chats'), 
    where('participants', 'array-contains', userId)
  );
  
  return onSnapshot(q, (snapshot) => {
    const rawChats: Chat[] = [];
    snapshot.forEach((doc) => {
      rawChats.push({ id: doc.id, ...doc.data() } as Chat);
    });
    
    // Sort descending by last message time first
    rawChats.sort((a, b) => {
      const timeA = (a.lastMessageTime as any)?.toMillis?.() || (a.lastMessageTime as any)?.seconds * 1000 || 0;
      const timeB = (b.lastMessageTime as any)?.toMillis?.() || (b.lastMessageTime as any)?.seconds * 1000 || 0;
      return timeB - timeA;
    });

    // Deduplicate chats per other participant to prevent duplicate threads
    const chatMap = new Map<string, Chat>();
    for (const chat of rawChats) {
      const otherUserId = chat.participants.find(p => p !== userId) || chat.id;
      if (!chatMap.has(otherUserId)) {
        chatMap.set(otherUserId, chat);
      } else {
        const existing = chatMap.get(otherUserId)!;
        // If the current one has a message and the existing one does not, use current
        if (chat.lastMessage && !existing.lastMessage) {
          chatMap.set(otherUserId, chat);
        }
      }
    }

    const chats = Array.from(chatMap.values());
    // Re-sort after deduplication
    chats.sort((a, b) => {
      const timeA = (a.lastMessageTime as any)?.toMillis?.() || (a.lastMessageTime as any)?.seconds * 1000 || 0;
      const timeB = (b.lastMessageTime as any)?.toMillis?.() || (b.lastMessageTime as any)?.seconds * 1000 || 0;
      return timeB - timeA;
    });

    callback(chats);
  }, (error) => {
    console.error("Chats subscription error:", error);
  });
};

// Subscribe to messages in a specific chat
export const subscribeToMessages = (chatId: string, callback: (messages: Message[]) => void) => {
  const q = query(
    collection(db, `chats/${chatId}/messages`),
    orderBy('createdAt', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    const messages: Message[] = [];
    snapshot.forEach((doc) => {
      messages.push({ id: doc.id, ...doc.data() } as Message);
    });
    callback(messages);
  });
};
