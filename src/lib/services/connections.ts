import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';

import { createNotification } from './notifications';

export interface ConnectionRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: unknown;
}

export const sendConnectionRequest = async (fromUserId: string, toUserId: string) => {
  try {
    // Check if already sent
    const connRef = collection(db, 'connections');
    const q = query(connRef, 
      where('fromUserId', '==', fromUserId),
      where('toUserId', '==', toUserId)
    );
    const existing = await getDocs(q);
    if (!existing.empty) {
      return { success: false, error: "Request already exists" };
    }

    const data = {
      fromUserId,
      toUserId,
      status: 'pending',
      createdAt: serverTimestamp()
    };
    await addDoc(connRef, data);

    // Trigger notification to recipient
    await createNotification({
      userId: toUserId,
      type: "connection",
      title: "New Connection Request",
      message: "Sent you a connection request.",
      link: "/network"
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
      const connSnap = await getDocs(query(collection(db, 'connections')));
      const connData = connSnap.docs.find(d => d.id === connectionId)?.data();
      if (connData?.fromUserId) {
        await createNotification({
          userId: connData.fromUserId,
          type: "connection",
          title: "Connection Accepted",
          message: "Accepted your connection request!",
          link: "/network"
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
