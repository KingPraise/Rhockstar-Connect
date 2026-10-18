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

import { UserBasic, getUserById } from './users';
import { createNotification } from './notifications';
import { getOrCreateChat } from './messages';

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
  partner?: UserBasic;
}

/**
 * Record a like or pass.
 * Automatically notifies recipient when liked, and generates a mutual match if already liked back.
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

    // Fetch initiator info for notification
    const { user: fromUser } = await getUserById(fromUserId);
    const fromName = fromUser?.fullName || 'Someone';
    const fromAvatar = fromUser?.avatar || '';

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
        const matchId = [fromUserId, toUserId].sort().join('_');
        const matchRef = doc(db, 'matches', matchId);
        
        await setDoc(matchRef, {
          user1Id: fromUserId,
          user2Id: toUserId,
          createdAt: serverTimestamp()
        });

        // Automatically create or link the chat thread
        const chatRes = await getOrCreateChat(fromUserId, toUserId);
        const chatId = chatRes.chat?.id || matchId;

        // Fetch recipient info
        const { user: toUser } = await getUserById(toUserId);
        const toName = toUser?.fullName || 'Someone';

        // Notify recipient of the mutual match
        await createNotification({
          userId: toUserId,
          type: 'match',
          title: "It's a Match! 💖",
          message: `You and ${fromName} liked each other! Tap to start chatting now.`,
          link: `/messages?chatId=${chatId}`,
          targetId: chatId,
          senderId: fromUserId,
          senderName: fromName,
          senderAvatar: fromAvatar
        });

        // Trigger FCM push to recipient
        fetch('/api/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: toUserId,
            title: "It's a Match! 💖",
            body: `You and ${fromName} liked each other! Start chatting now.`,
            url: `/messages?chatId=${chatId}`
          })
        }).catch(console.error);

        return { success: true, isMatch: true, matchPartner: toUser };
      } else {
        // Notify recipient that someone liked them on Dating
        await createNotification({
          userId: toUserId,
          type: 'like',
          title: "Someone is interested in you! 💖",
          message: `${fromName} liked your dating profile. Tap to see who is interested!`,
          link: '/dating?tab=interested',
          targetId: fromUserId,
          senderId: fromUserId,
          senderName: fromName,
          senderAvatar: fromAvatar
        });

        // Trigger FCM push
        fetch('/api/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: toUserId,
            title: "Someone is interested in you! 💖",
            body: `${fromName} liked your dating profile. Tap to check out their profile!`,
            url: '/dating?tab=interested'
          })
        }).catch(console.error);
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

    // Filter out current user, already interacted users, and users who aren't active in dating
    const prospects = allUsers.filter(u => u.uid !== currentUserId && !interactedUserIds.has(u.uid) && u.datingActive);
    
    return { success: true, prospects };
  } catch (error: unknown) {
    console.error("Error fetching prospects:", error);
    return { success: false, error: (error as Error).message };
  }
};

/**
 * Get users who have liked the current user (Interested in You / Admirers)
 */
export const getInterestedUsers = async (currentUserId: string) => {
  try {
    const interactionsRef = collection(db, 'dating_interactions');
    
    // 1. Fetch all likes directed to current user
    const likesQuery = query(
      interactionsRef, 
      where('toUserId', '==', currentUserId),
      where('action', '==', 'like')
    );
    const likesSnap = await getDocs(likesQuery);

    // 2. Fetch actions performed by current user (to filter out already interacted)
    const myActionsQuery = query(
      interactionsRef,
      where('fromUserId', '==', currentUserId)
    );
    const myActionsSnap = await getDocs(myActionsQuery);
    const myInteractedUserIds = new Set<string>();
    myActionsSnap.forEach(d => {
      myInteractedUserIds.add(d.data().toUserId);
    });

    const admirerUserIds: string[] = [];
    likesSnap.forEach(docSnap => {
      const fromUid = docSnap.data().fromUserId;
      if (!myInteractedUserIds.has(fromUid)) {
        admirerUserIds.push(fromUid);
      }
    });

    // Deduplicate IDs
    const uniqueUids = Array.from(new Set(admirerUserIds));

    // 3. Fetch user profiles for admirers
    const admirers: UserBasic[] = [];
    await Promise.all(
      uniqueUids.map(async (uid) => {
        const res = await getUserById(uid);
        if (res.success && res.user && res.user.datingActive !== false) {
          admirers.push(res.user);
        }
      })
    );

    return { success: true, admirers };
  } catch (error: unknown) {
    console.error("Error fetching interested users:", error);
    return { success: false, error: (error as Error).message, admirers: [] };
  }
};

/**
 * Get all mutual matches for the current user
 */
export const getDatingMatches = async (currentUserId: string) => {
  try {
    const matchesRef = collection(db, 'matches');
    
    const [snap1, snap2] = await Promise.all([
      getDocs(query(matchesRef, where('user1Id', '==', currentUserId))),
      getDocs(query(matchesRef, where('user2Id', '==', currentUserId)))
    ]);

    const partnerIds = new Set<string>();
    snap1.forEach(d => {
      const partnerId = d.data().user2Id;
      if (partnerId) partnerIds.add(partnerId);
    });
    snap2.forEach(d => {
      const partnerId = d.data().user1Id;
      if (partnerId) partnerIds.add(partnerId);
    });

    const matches: UserBasic[] = [];
    await Promise.all(
      Array.from(partnerIds).map(async (uid) => {
        const res = await getUserById(uid);
        if (res.success && res.user) {
          matches.push(res.user);
        }
      })
    );

    return { success: true, matches };
  } catch (error: unknown) {
    console.error("Error fetching dating matches:", error);
    return { success: false, error: (error as Error).message, matches: [] };
  }
};
