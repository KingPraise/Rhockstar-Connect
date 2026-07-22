import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs,
  serverTimestamp,
  doc,
  setDoc
} from 'firebase/firestore';

import { UserBasic } from './users';

export interface DatingInteraction {
  id?: string;
  fromUserId: string;
  toUserId: string;
  action: 'like' | 'pass';
  createdAt: unknown;
}

export interface Match {
  id: string;
  user1Id: string;
  user2Id: string;
  createdAt: unknown;
}

/**
 * Record a like or pass.
 * Returns { isMatch: true } if the other user already liked this user.
 */
export const recordDatingAction = async (fromUserId: string, toUserId: string, action: 'like' | 'pass') => {
  try {
    // 1. Record the action
    const interactionsRef = collection(db, 'dating_interactions');
    await addDoc(interactionsRef, {
      fromUserId,
      toUserId,
      action,
      createdAt: serverTimestamp()
    });

    if (action === 'like') {
      // 2. Check if it's a mutual match
      const q = query(interactionsRef, 
        where('fromUserId', '==', toUserId),
        where('toUserId', '==', fromUserId),
        where('action', '==', 'like')
      );
      
      const existingLikes = await getDocs(q);
      
      if (!existingLikes.empty) {
        // Mutual Match! Create a match record
        const matchId = [fromUserId, toUserId].sort().join('_'); // Unique ID for this pair
        const matchRef = doc(db, 'matches', matchId);
        
        await setDoc(matchRef, {
          user1Id: fromUserId,
          user2Id: toUserId,
          createdAt: serverTimestamp()
        });
        
        return { success: true, isMatch: true };
      }
    }
    
    return { success: true, isMatch: false };
  } catch (error: unknown) {
    console.error("Error recording dating action:", error);
    return { success: false, error: (error as Error).message };
  }
};

/**
 * Get users the current user hasn't interacted with yet
 */
export const getDatingProspects = async (currentUserId: string, allUsers: UserBasic[]) => {
  try {
    const interactionsRef = collection(db, 'dating_interactions');
    const q = query(interactionsRef, where('fromUserId', '==', currentUserId));
    
    const snapshot = await getDocs(q);
    const interactedUserIds = new Set<string>();
    
    snapshot.forEach(docSnap => {
      interactedUserIds.add(docSnap.data().toUserId);
    });

    // Filter out current user and already interacted users
    const prospects = allUsers.filter(u => u.uid !== currentUserId && !interactedUserIds.has(u.uid));
    
    return { success: true, prospects };
  } catch (error: unknown) {
    console.error("Error fetching prospects:", error);
    return { success: false, error: (error as Error).message };
  }
};
