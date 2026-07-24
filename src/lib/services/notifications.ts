import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs,
  updateDoc,
  doc,
  serverTimestamp,
  orderBy,
  onSnapshot
} from 'firebase/firestore';

export interface Notification {
  id: string;
  userId: string;
  type: "match" | "message" | "connection" | "job" | "like" | "comment";
  title: string;
  message: string;
  read: boolean;
  createdAt: any;
  link?: string;
}

export const createNotification = async (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => {
  try {
    const notifRef = collection(db, 'notifications');
    const newNotif = {
      ...notification,
      read: false,
      createdAt: serverTimestamp()
    };
    await addDoc(notifRef, newNotif);
    return { success: true };
  } catch (error) {
    console.error("Error creating notification:", error);
    return { success: false };
  }
};

export const subscribeToNotifications = (userId: string, callback: (notifications: Notification[]) => void) => {
  const notifRef = collection(db, 'notifications');
  const q = query(
    notifRef, 
    where('userId', '==', userId)
  );

  return onSnapshot(q, (snapshot) => {
    const notifications: Notification[] = [];
    snapshot.forEach((doc) => {
      notifications.push({ id: doc.id, ...doc.data() } as Notification);
    });

    // Sort in memory to avoid requiring a Firestore composite index
    notifications.sort((a, b) => {
      const timeA = (a.createdAt as any)?.toMillis?.() || 0;
      const timeB = (b.createdAt as any)?.toMillis?.() || 0;
      return timeB - timeA;
    });

    callback(notifications);
  }, (error) => {
    console.error("Notifications subscription error:", error);
  });
};

export const markNotificationAsRead = async (notificationId: string) => {
  try {
    const docRef = doc(db, 'notifications', notificationId);
    await updateDoc(docRef, { read: true });
    return { success: true };
  } catch (error) {
    console.error("Error marking notification read:", error);
    return { success: false };
  }
};

export const markAllNotificationsAsRead = async (userId: string) => {
  try {
    const notifRef = collection(db, 'notifications');
    const q = query(
      notifRef, 
      where('userId', '==', userId),
      where('read', '==', false)
    );
    const snapshot = await getDocs(q);
    
    const updates = snapshot.docs.map(docSnap => 
      updateDoc(doc(db, 'notifications', docSnap.id), { read: true })
    );
    await Promise.all(updates);
    
    return { success: true };
  } catch (error) {
    console.error("Error marking all read:", error);
    return { success: false };
  }
};
