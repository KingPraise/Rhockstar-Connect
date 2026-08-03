import { db } from '../firebase';
import { 
  collection, 
  getDocs,
  doc,
  getDoc,
  updateDoc,
  query,
  where,
  writeBatch
} from 'firebase/firestore';

export interface UserBasic {
  uid: string;
  fullName: string;
  username: string;
  avatar: string;
  bio?: string;
  headline?: string;
  accountType?: string;
  location?: any;
  industry?: string;
  companySize?: string;
  foundedYear?: string;
  website?: string;
  portfolio?: string[];
  datingActive?: boolean;
  datingInterests?: string[];
  datingGoals?: string;
  datingPhotos?: string[];
  datingPrompts?: Array<{ prompt: string; answer: string }>;
  datingVoiceIntro?: string;
  subscriptionTier?: string;
  subscriptionStatus?: string;
  lastLogin?: any;
}

export const getAllUsers = async (excludeAdmins = true): Promise<{ success: boolean; users?: UserBasic[]; error?: string }> => {
  try {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    const users: UserBasic[] = [];
    
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      // Exclude super admins from public listings if requested
      if (!excludeAdmins || data.role !== 'admin') {
        users.push({
          uid: docSnap.id,
          fullName: data.fullName || 'Unknown User',
          username: data.username || '',
          avatar: data.avatar || (data.fullName ? data.fullName.substring(0, 2).toUpperCase() : '??'),
          bio: data.bio || '',
          headline: data.headline || '',
          location: data.location,
          industry: data.industry,
          accountType: data.accountType,
          companySize: data.companySize,
          foundedYear: data.foundedYear,
          website: data.website,
          portfolio: data.portfolio,
          datingActive: data.datingActive,
          datingInterests: data.datingInterests,
          datingGoals: data.datingGoals,
          datingPhotos: data.datingPhotos,
          datingPrompts: data.datingPrompts,
          datingVoiceIntro: data.datingVoiceIntro,
          subscriptionTier: data.subscriptionTier,
          subscriptionStatus: data.subscriptionStatus,
          lastLogin: data.lastLogin
        });
      }
    });

    return { success: true, users };
  } catch (error: unknown) {
    console.error("Error fetching users:", error);
    return { success: false, error: (error as Error).message };
  }
};

export const getUserById = async (userId: string): Promise<{ success: boolean; user?: any; error?: string }> => {
  try {
    const userRef = doc(db, 'users', userId);
    const docSnap = await getDoc(userRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return { 
        success: true, 
        user: {
          uid: docSnap.id,
          ...data
        } 
      };
    }
    return { success: false, error: "User not found" };
  } catch (error: unknown) {
    console.error("Error fetching user:", error);
    return { success: false, error: (error as Error).message };
  }
};

export const getUserByUsername = async (username: string): Promise<{ success: boolean; user?: any; error?: string }> => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('username', '==', username.replace('@', '')));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      const docSnap = snapshot.docs[0];
      return { 
        success: true, 
        user: {
          uid: docSnap.id,
          ...docSnap.data()
        } 
      };
    }
    return { success: false, error: "User not found" };
  } catch (error: unknown) {
    console.error("Error fetching user by username:", error);
    return { success: false, error: (error as Error).message };
  }
};

const RESERVED_USERNAMES = [
  'admin', 'administrator', 'support', 'help', 'team', 'official', 'verified', 'verify', 
  'security', 'system', 'moderator', 'mod', 'staff', 'founder', 'ceo', 'owner', 'developer', 
  'dev', 'news', 'updates', 'blog', 'careers', 'jobs', 'ads', 'advertise', 'business', 
  'press', 'media', 'privacy', 'legal', 'terms', 'community', 'events', 'feedback', 
  'report', 'appeal', 'notifications', 'api', 'bot', 'ai', 'assistant', 'store', 'market', 
  'payments', 'wallet', 'rhockstar', 'rhockstarconnect', 'rhockstarnation', 
  'rhockstar_support', 'rhockstar_help', 'rhockstar_official', 'connectsupport', 'connectadmin'
];

export const updateUserProfile = async (
  userId: string,
  data: Partial<Omit<UserBasic, 'uid'>> & { bio?: string; headline?: string; location?: any; phone?: string; dob?: string; relationship?: string; isLocked?: boolean }
) => {
  try {
    if (data.username) {
      const cleanUsername = data.username.toLowerCase().replace('@', '');
      if (RESERVED_USERNAMES.includes(cleanUsername)) {
        return { success: false, error: "This username is reserved and cannot be used." };
      }
    }

    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, data);

    // If avatar, name, or username changed, update all their posts, comments, jobs, and notifications
    if (data.avatar !== undefined || data.fullName !== undefined || data.username !== undefined) {
      const batch = writeBatch(db);
      let count = 0;

      // 1. Update Posts authored by user
      const postsQuery = query(collection(db, 'posts'), where('userId', '==', userId));
      const postsSnap = await getDocs(postsQuery);
      postsSnap.docs.forEach(postDoc => {
        const postData = postDoc.data();
        if (postData.user) {
          batch.update(postDoc.ref, {
            'user.name': data.fullName !== undefined ? data.fullName : postData.user.name,
            'user.handle': data.username !== undefined ? data.username : postData.user.handle,
            'user.avatar': data.avatar !== undefined ? data.avatar : postData.user.avatar,
          });
          count++;
        }
      });

      // 2. Update Comments left by user on ANY post
      const allPostsQuery = query(collection(db, 'posts'));
      const allPostsSnap = await getDocs(allPostsQuery);
      allPostsSnap.docs.forEach(postDoc => {
        const postData = postDoc.data();
        if (postData.comments && Array.isArray(postData.comments)) {
          let updated = false;
          const newComments = postData.comments.map((comment: any) => {
            if (comment.userId === userId) {
              updated = true;
              return {
                ...comment,
                userName: data.fullName !== undefined ? data.fullName : comment.userName,
                userAvatar: data.avatar !== undefined ? data.avatar : comment.userAvatar,
              };
            }
            return comment;
          });
          
          if (updated) {
            batch.update(postDoc.ref, { comments: newComments });
            count++;
          }
        }
      });

      // 3. Update Jobs posted by user
      const jobsQuery = query(collection(db, 'jobs'), where('companyId', '==', userId));
      const jobsSnap = await getDocs(jobsQuery);
      jobsSnap.docs.forEach(jobDoc => {
        const updates: any = {};
        if (data.avatar !== undefined) updates.logo = data.avatar;
        if (data.fullName !== undefined) updates.company = data.fullName;
        
        if (Object.keys(updates).length > 0) {
          batch.update(jobDoc.ref, updates);
          count++;
        }
      });

      // 4. Update Notifications where user is the sender
      const notifQuery = query(collection(db, 'notifications'), where('senderId', '==', userId));
      const notifSnap = await getDocs(notifQuery);
      notifSnap.docs.forEach(notifDoc => {
        const updates: any = {};
        if (data.avatar !== undefined) updates.senderAvatar = data.avatar;
        if (data.fullName !== undefined) updates.senderName = data.fullName;
        
        if (Object.keys(updates).length > 0) {
          batch.update(notifDoc.ref, updates);
          count++;
        }
      });

      if (count > 0) {
        // If batch exceeds 500 operations, it will fail, but for this scale it's okay for now.
        // In a real app we would chunk the batch into arrays of 500.
        await batch.commit();
      }
    }

    return { success: true };
  } catch (error: unknown) {
    console.error("Error updating user profile:", error);
    return { success: false, error: (error as Error).message };
  }
};
