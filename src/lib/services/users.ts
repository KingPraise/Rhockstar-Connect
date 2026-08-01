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

export const getAllUsers = async (): Promise<{ success: boolean; users?: UserBasic[]; error?: string }> => {
  try {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    const users: UserBasic[] = [];
    
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      // Exclude super admins from public listings
      if (data.role !== 'admin') {
        users.push({
          uid: docSnap.id,
          fullName: data.fullName,
          username: data.username,
          avatar: data.avatar || data.fullName.substring(0, 2).toUpperCase(),
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

export const updateUserProfile = async (
  userId: string,
  data: Partial<Omit<UserBasic, 'uid'>> & { bio?: string; headline?: string; location?: any; phone?: string; dob?: string; relationship?: string; isLocked?: boolean }
) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, data);

    // If avatar, name, or username changed, update all their posts
    if (data.avatar !== undefined || data.fullName !== undefined || data.username !== undefined) {
      const postsQuery = query(collection(db, 'posts'), where('userId', '==', userId));
      const snapshot = await getDocs(postsQuery);
      
      if (!snapshot.empty) {
        const batch = writeBatch(db);
        let count = 0;
        
        snapshot.docs.forEach(postDoc => {
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
        
        if (count > 0) {
          await batch.commit();
        }
      }
    }

    return { success: true };
  } catch (error: unknown) {
    console.error("Error updating user profile:", error);
    return { success: false, error: (error as Error).message };
  }
};
