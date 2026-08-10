import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';

import { createNotification } from './notifications';
import { getUserById } from './users';

export interface ConnectionRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: unknown;
}

export const sendConnectionRequest = async (fromUserId: string, toUserId: string) => {
  try {
    const connRef = collection(db, 'connections');
    
    // Use getUserConnections to avoid requiring a composite index in Firestore
    const { success, connections } = await getUserConnections(fromUserId);
    if (!success) {
      return { success: false, error: "Failed to verify existing connections" };
    }
    
    const existing = connections?.find(c => 
      (c.fromUserId === fromUserId && c.toUserId === toUserId) ||
      (c.fromUserId === toUserId && c.toUserId === fromUserId)
    );

    if (existing) {
      return { success: false, error: "Request or connection already exists" };
    }

    const data = {
      fromUserId,
      toUserId,
      status: 'pending',
      createdAt: serverTimestamp()
    };
    await addDoc(connRef, data);

    // Fetch sender profile to include in notification
    const { user: senderProfile } = await getUserById(fromUserId);
    const senderName = senderProfile?.fullName || 'Someone';
    const senderAvatar = senderProfile?.avatar || '';

    // Trigger notification to recipient
    await createNotification({
      userId: toUserId,
      type: "connection",
      title: "New Connection Request",
      message: `${senderName} sent you a connection request.`,
      link: "/network",
      senderId: fromUserId,
      senderName,
      senderAvatar
    });

    return { success: true };
  } catch (error: unknown) {
    console.error("Error sending connection request:", error);
    return { success: false, error: (error as Error).message };
  }
};

export const updateConnectionStatus = async (connectionId: string, status: 'accepted' | 'rejected') => {
  try {
    const docRef = doc(db, 'connections', connectionId);
    if (status === 'rejected') {
      await deleteDoc(docRef);
    } else {
      await updateDoc(docRef, { status });

      // Get connection doc to notify sender
      const docSnap = await getDoc(docRef);
      const connData = docSnap.data();
      if (connData?.fromUserId && connData?.toUserId) {
        // Fetch acceptor profile to include in notification
        const { user: acceptorProfile } = await getUserById(connData.toUserId);
        const acceptorName = acceptorProfile?.fullName || 'Someone';
        const acceptorAvatar = acceptorProfile?.avatar || '';

        await createNotification({
          userId: connData.fromUserId,
          type: "connection",
          title: "Connection Accepted",
          message: `${acceptorName} accepted your connection request!`,
          link: "/network",
          senderId: connData.toUserId,
          senderName: acceptorName,
          senderAvatar: acceptorAvatar
        });
      }
    }
    return { success: true };
  } catch (error: unknown) {
    console.error("Error updating connection:", error);
    return { success: false, error: (error as Error).message };
  }
};

// Get all connection relationships for a user (both sent and received)
export const getUserConnections = async (userId: string) => {
  try {
    const connRef = collection(db, 'connections');
    
    // As Firestore doesn't support logical OR natively without composite indexes in client SDK easily,
    // we fetch sent and received separately and combine them.
    const sentQ = query(connRef, where('fromUserId', '==', userId));
    const recQ = query(connRef, where('toUserId', '==', userId));

    const [sentSnap, recSnap] = await Promise.all([getDocs(sentQ), getDocs(recQ)]);

    const connections: ConnectionRequest[] = [];
    
    sentSnap.forEach(d => connections.push({ id: d.id, ...d.data() } as ConnectionRequest));
    recSnap.forEach(d => connections.push({ id: d.id, ...d.data() } as ConnectionRequest));

    return { success: true, connections };
  } catch (error: unknown) {
    console.error("Error fetching connections:", error);
    return { success: false, error: (error as Error).message };
  }
};
