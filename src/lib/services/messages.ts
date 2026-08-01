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
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  type?: 'text' | 'image' | 'audio' | 'document';
  mediaUrl?: string;
  status?: 'sent' | 'delivered' | 'read';
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
    const chatsRef = collection(db, 'chats');
    const q = query(chatsRef, where('participants', 'array-contains', userId1));
    const snapshot = await getDocs(q);
    
    let existingChat = null;
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.participants.includes(userId2)) {
        existingChat = { id: doc.id, ...data };
      }
    });

    if (existingChat) {
      return { success: true, chat: existingChat as Chat };
    }

    // Create new chat
    const newChatRef = doc(collection(db, 'chats'));
    const newChatData = {
      participants: [userId1, userId2],
      lastMessage: "",
      lastMessageTime: serverTimestamp(),
      unreadCount: { [userId1]: 0, [userId2]: 0 },
      typingStatus: { [userId1]: false, [userId2]: false }
    };
    
    await setDoc(newChatRef, newChatData);
    
    return { success: true, chat: { id: newChatRef.id, ...newChatData } as Chat };
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
    
    await updateDoc(chatRef, {
      lastMessage: text,
      lastMessageTime: serverTimestamp()
    });

    // Notify recipient
    const chatSnap = await getDoc(chatRef);
    if (chatSnap.exists()) {
      const participants: string[] = chatSnap.data().participants || [];
      const recipientId = participants.find(p => p !== senderId);
      if (recipientId) {
        // Fetch sender profile to include in notification
        const { user: senderProfile } = await getUserById(senderId);
        const senderName = senderProfile?.fullName || 'Someone';
        const senderAvatar = senderProfile?.avatar || '';

        const title = `New Message from ${senderName}`;
        const messageBody = type === 'text' ? (text.length > 50 ? `${text.substring(0, 50)}...` : text) : `Sent an ${type}`;
        
        await createNotification({
          userId: recipientId,
          type: "message",
          title,
          message: messageBody,
          link: "/messages",
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
            url: "/messages"
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
        updatePromises.push(updateDoc(doc(db, `chats/${chatId}/messages`, docSnap.id), { status: 'read' }));
      }
    });

    await Promise.all(updatePromises);
  } catch (error) {
    console.error("Error marking messages read:", error);
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
    const chats: Chat[] = [];
    snapshot.forEach((doc) => {
      chats.push({ id: doc.id, ...doc.data() } as Chat);
    });
    
    // Sort in memory to avoid requiring a Firestore composite index
    chats.sort((a, b) => {
      // Handle Firebase Timestamps
      const timeA = (a.lastMessageTime as any)?.toMillis?.() || 0;
      const timeB = (b.lastMessageTime as any)?.toMillis?.() || 0;
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
