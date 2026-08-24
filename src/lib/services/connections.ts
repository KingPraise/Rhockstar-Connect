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
  increment,
  onSnapshot,
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
      link: "/network?tab=invitations",
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
    const docSnap = await getDoc(docRef);
    const connData = docSnap.data();

    if (status === 'rejected') {
      await deleteDoc(docRef);
    } else {
      await updateDoc(docRef, { status });

      if (connData?.fromUserId && connData?.toUserId) {
        // Increment connection count on both user profiles
        await Promise.all([
          updateDoc(doc(db, 'users', connData.fromUserId), { connectionsCount: increment(1), connections: increment(1) }).catch(() => {}),
          updateDoc(doc(db, 'users', connData.toUserId), { connectionsCount: increment(1), connections: increment(1) }).catch(() => {})
        ]);

        // Fetch acceptor profile to include in notification
        const { user: acceptorProfile } = await getUserById(connData.toUserId);
        const acceptorName = acceptorProfile?.fullName || 'Someone';
        const acceptorAvatar = acceptorProfile?.avatar || '';

        await createNotification({
          userId: connData.fromUserId,
          type: "connection",
          title: "Connection Accepted",
          message: `${acceptorName} accepted your connection request!`,
          link: "/network?tab=my-connections",
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

export const removeConnection = async (connectionId: string) => {
  try {
    const docRef = doc(db, 'connections', connectionId);
    const docSnap = await getDoc(docRef);
    const connData = docSnap.data();

    if (docSnap.exists() && connData) {
      await deleteDoc(docRef);

      if (connData.status === 'accepted') {
        // Decrement connection counts
        await Promise.all([
          updateDoc(doc(db, 'users', connData.fromUserId), { connectionsCount: increment(-1), connections: increment(-1) }).catch(() => {}),
          updateDoc(doc(db, 'users', connData.toUserId), { connectionsCount: increment(-1), connections: increment(-1) }).catch(() => {})
        ]);
      }
    }
    return { success: true };
  } catch (error: unknown) {
    console.error("Error removing connection:", error);
    return { success: false, error: (error as Error).message };
  }
};

// Get all connection relationships for a user (both sent and received)
export const getUserConnections = async (userId: string) => {
  try {
    const connRef = collection(db, 'connections');
    
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

// Real-time listener for accepted connections count
export const listenToUserConnectionsCount = (userId: string, callback: (count: number) => void) => {
  const connRef = collection(db, 'connections');
  const sentQ = query(connRef, where('fromUserId', '==', userId), where('status', '==', 'accepted'));
  const recQ = query(connRef, where('toUserId', '==', userId), where('status', '==', 'accepted'));

  let sentCount = 0;
  let recCount = 0;

  const unsub1 = onSnapshot(sentQ, (snap) => {
    sentCount = snap.size;
    callback(sentCount + recCount);
  });

  const unsub2 = onSnapshot(recQ, (snap) => {
    recCount = snap.size;
    callback(sentCount + recCount);
  });

  return () => {
    unsub1();
    unsub2();
  };
};
