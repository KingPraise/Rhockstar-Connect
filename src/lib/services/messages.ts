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
  updateDoc
} from 'firebase/firestore';

import { createNotification } from './notifications';

export interface Chat {
  id: string;
  participants: string[];
  lastMessage: string;
  lastMessageTime: unknown;
  unreadCount: Record<string, number>;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  status?: 'sent' | 'delivered' | 'read';
  createdAt: unknown;
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
      unreadCount: { [userId1]: 0, [userId2]: 0 }
    };
    
    await setDoc(newChatRef, newChatData);
    
    return { success: true, chat: { id: newChatRef.id, ...newChatData } as Chat };
  } catch (error: unknown) {
    console.error("Error getting or creating chat:", error);
    return { success: false, error: (error as Error).message };
  }
};

// Send a message
export const sendMessage = async (chatId: string, senderId: string, text: string) => {
  try {
    const messagesRef = collection(db, `chats/${chatId}/messages`);
    const chatRef = doc(db, 'chats', chatId);

    const messageData = {
      chatId,
      senderId,
      text,
      status: 'delivered',
      createdAt: serverTimestamp()
    };

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
        await createNotification({
          userId: recipientId,
          type: "message",
          title: "New Message",
          message: text.length > 50 ? `${text.substring(0, 50)}...` : text,
          link: "/messages"
        });
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
