import { db } from '../firebase';
import { 
  collection, 
  getDocs,
  doc,
  getDoc,
  updateDoc,
  query,
  where
} from 'firebase/firestore';

export interface UserBasic {
  uid: string;
  fullName: string;
  username: string;
  avatar: string;
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
          avatar: data.avatar || data.fullName.substring(0, 2).toUpperCase()
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
  data: Partial<Omit<UserBasic, 'uid'>> & { bio?: string; headline?: string; location?: any; phone?: string; dob?: string; relationship?: string }
) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, data);
    return { success: true };
  } catch (error: unknown) {
    console.error("Error updating user profile:", error);
    return { success: false, error: (error as Error).message };
  }
};
