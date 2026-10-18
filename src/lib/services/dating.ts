import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  serverTimestamp, 
  doc, 
  setDoc,
  updateDoc,
  getDoc
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

export interface MatchDetail {
  matchId: string;
  partner: UserBasic;
  createdAt: any;
  isExtended?: boolean;
  lastExtendedAt?: any;
  hasMessaged?: boolean;
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
 * Enforces Double-Blind Incognito Mode: Incognito users are only visible to people they liked first or verified subscribers.
 */
export const getDatingProspects = async (currentUserId: string, allUsers: UserBasic[]) => {
  try {
    const interactionsRef = collection(db, 'dating_interactions');
    
    // Fetch both viewer's outgoing interactions and incoming likes to viewer
    const [outgoingSnap, incomingLikesSnap] = await Promise.all([
      getDocs(query(interactionsRef, where('fromUserId', '==', currentUserId))),
      getDocs(query(interactionsRef, where('toUserId', '==', currentUserId), where('action', '==', 'like')))
    ]);

    const interactedUserIds = new Set<string>();
    outgoingSnap.forEach(docSnap => {
      interactedUserIds.add(docSnap.data().toUserId);
    });

    const likedViewerUserIds = new Set<string>();
    incomingLikesSnap.forEach(docSnap => {
      likedViewerUserIds.add(docSnap.data().fromUserId);
    });

    // Check if current viewer is a verified subscriber (Pro / Elite / Admin)
    const viewerUser = allUsers.find(u => u.uid === currentUserId);
    const viewerIsVerified = viewerUser?.subscriptionTier === 'pro' || viewerUser?.subscriptionTier === 'elite' || viewerUser?.role === 'admin';

    // Filter out current user, already interacted users, inactive daters, and enforce Incognito Double-Blind rules
    const prospects = allUsers.filter(u => {
      if (u.uid === currentUserId || interactedUserIds.has(u.uid) || !u.datingActive) {
        return false;
      }
      // If prospect has Incognito Mode active (and is Pro/Elite), only reveal to people they liked first or verified accounts
      const prospectIsPaid = u.subscriptionTier === 'pro' || u.subscriptionTier === 'elite' || u.role === 'admin';
      if (u.datingIncognito && prospectIsPaid) {
        return likedViewerUserIds.has(u.uid) || viewerIsVerified;
      }
      return true;
    });
    
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
 * Get all mutual matches for the current user along with 48-hour countdown metadata
 */
export const getDatingMatches = async (currentUserId: string) => {
  try {
    const matchesRef = collection(db, 'matches');
    const chatsRef = collection(db, 'chats');
    
    const [snap1, snap2, chatsSnap] = await Promise.all([
      getDocs(query(matchesRef, where('user1Id', '==', currentUserId))),
      getDocs(query(matchesRef, where('user2Id', '==', currentUserId))),
      getDocs(query(chatsRef, where('participants', 'array-contains', currentUserId)))
    ]);

    // Map partner UID -> whether a real message has been exchanged
    const messagedPartners = new Set<string>();
    chatsSnap.forEach(chatDoc => {
      const chatData = chatDoc.data();
      if (chatData.lastMessage && String(chatData.lastMessage).trim().length > 0) {
        const participants: string[] = chatData.participants || [];
        participants.forEach(p => {
          if (p !== currentUserId) messagedPartners.add(p);
        });
      }
    });

    const rawMatches = new Map<string, { matchId: string; createdAt: any; isExtended?: boolean; lastExtendedAt?: any }>();
    
    snap1.forEach(d => {
      const data = d.data();
      if (data.user2Id) {
        rawMatches.set(data.user2Id, {
          matchId: d.id,
          createdAt: data.createdAt,
          isExtended: data.isExtended || false,
          lastExtendedAt: data.lastExtendedAt || null
        });
      }
    });

    snap2.forEach(d => {
      const data = d.data();
      if (data.user1Id) {
        rawMatches.set(data.user1Id, {
          matchId: d.id,
          createdAt: data.createdAt,
          isExtended: data.isExtended || false,
          lastExtendedAt: data.lastExtendedAt || null
        });
      }
    });

    const matches: UserBasic[] = [];
    const matchDetails: MatchDetail[] = [];

    await Promise.all(
      Array.from(rawMatches.entries()).map(async ([partnerUid, meta]) => {
        const res = await getUserById(partnerUid);
        if (res.success && res.user) {
          matches.push(res.user);
          matchDetails.push({
            matchId: meta.matchId,
            partner: res.user,
            createdAt: meta.createdAt,
            isExtended: meta.isExtended,
            lastExtendedAt: meta.lastExtendedAt,
            hasMessaged: messagedPartners.has(partnerUid)
          });
        }
      })
    );

    return { success: true, matches, matchDetails };
  } catch (error: unknown) {
    console.error("Error fetching dating matches:", error);
    return { success: false, error: (error as Error).message, matches: [], matchDetails: [] };
  }
};

/**
 * Reactivate / Extend an expired 48-hour match once
 */
export const reactivateExpiredMatch = async (matchId: string) => {
  try {
    const matchRef = doc(db, 'matches', matchId);
    await updateDoc(matchRef, {
      isExtended: true,
      lastExtendedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error: unknown) {
    console.error("Error reactivating match:", error);
    return { success: false, error: (error as Error).message };
  }
};

/**
 * Discover shared communities ("Circles") between two daters
 */
export const getSharedCommunities = async (userAId: string, userBId: string) => {
  try {
    const commRef = collection(db, 'communities');
    const q = query(commRef, where('members', 'array-contains', userAId));
    const snap = await getDocs(q);

    const shared: Array<{ id: string; name: string; category: string; icon?: string }> = [];
    snap.forEach(docSnap => {
      const data = docSnap.data();
      const members: string[] = data.members || [];
      if (members.includes(userBId)) {
        shared.push({
          id: docSnap.id,
          name: data.name || 'Community Circle',
          category: data.category || 'General',
          icon: data.icon
        });
      }
    });

    return { success: true, shared };
  } catch (error: unknown) {
    console.error("Error fetching shared communities:", error);
    return { success: false, shared: [] };
  }
};
