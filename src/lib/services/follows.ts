import { db } from '../firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  onSnapshot,
  increment,
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { createNotification } from './notifications';
import { getUserById } from './users';

export interface FollowData {
  id: string;
  followerId: string;
  targetUserId: string;
  createdAt: unknown;
}

export const followUser = async (followerId: string, targetUserId: string) => {
  try {
    if (followerId === targetUserId) {
      return { success: false, error: "You cannot follow yourself" };
    }

    const followId = `${followerId}_${targetUserId}`;
    const followRef = doc(db, 'follows', followId);
    
    const snap = await getDoc(followRef);
    if (snap.exists()) {
      return { success: true, isFollowing: true };
    }

    await setDoc(followRef, {
      followerId,
      targetUserId,
      createdAt: serverTimestamp()
    });

    // Increment follower counts on user documents
    const targetUserRef = doc(db, 'users', targetUserId);
    const followerUserRef = doc(db, 'users', followerId);

    await Promise.all([
      updateDoc(targetUserRef, { followersCount: increment(1) }).catch(() => {}),
      updateDoc(followerUserRef, { followingCount: increment(1) }).catch(() => {})
    ]);

    // Send notification
    const { user: followerProfile } = await getUserById(followerId);
    const senderName = followerProfile?.fullName || 'Someone';
    const senderAvatar = followerProfile?.avatar || '';

    await createNotification({
      userId: targetUserId,
      type: "follow",
      title: "New Follower",
      message: `${senderName} started following you.`,
      link: `/profile?uid=${followerId}`,
      senderId: followerId,
      senderName,
      senderAvatar
    });

    return { success: true, isFollowing: true };
  } catch (error: unknown) {
    console.error("Error following user:", error);
    return { success: false, error: (error as Error).message };
  }
};

export const unfollowUser = async (followerId: string, targetUserId: string) => {
  try {
    const followId = `${followerId}_${targetUserId}`;
    const followRef = doc(db, 'follows', followId);

    await deleteDoc(followRef);

    // Decrement follower counts
    const targetUserRef = doc(db, 'users', targetUserId);
    const followerUserRef = doc(db, 'users', followerId);

    await Promise.all([
      updateDoc(targetUserRef, { followersCount: increment(-1) }).catch(() => {}),
      updateDoc(followerUserRef, { followingCount: increment(-1) }).catch(() => {})
    ]);

    return { success: true, isFollowing: false };
  } catch (error: unknown) {
    console.error("Error unfollowing user:", error);
    return { success: false, error: (error as Error).message };
  }
};

export const checkIsFollowing = async (followerId: string, targetUserId: string): Promise<boolean> => {
  try {
    const followId = `${followerId}_${targetUserId}`;
    const snap = await getDoc(doc(db, 'follows', followId));
    return snap.exists();
  } catch {
    return false;
  }
};

export const listenToFollowState = (
  followerId: string, 
  targetUserId: string, 
  callback: (isFollowing: boolean) => void
) => {
  const followId = `${followerId}_${targetUserId}`;
  return onSnapshot(doc(db, 'follows', followId), (docSnap) => {
    callback(docSnap.exists());
  });
};
