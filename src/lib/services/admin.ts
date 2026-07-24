import { db } from '../firebase';
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  addDoc
} from 'firebase/firestore';

export interface AdminUser {
  uid: string;
  fullName: string;
  username: string;
  email: string;
  avatar?: string;
  role?: 'admin' | 'user';
  subscriptionTier?: 'free' | 'pro' | 'elite';
  subscriptionStatus?: 'active' | 'inactive';
  premiumUntil?: string;
  isBanned?: boolean;
  isBoosted?: boolean;
  createdAt?: any;
  lastLogin?: any;
  referralCount?: number;
}

export interface AdminReport {
  id: string;
  reporterId: string;
  reporterName: string;
  targetId: string;
  targetType: 'post' | 'user' | 'message' | 'comment';
  reason: string;
  details?: string;
  contentSnippet?: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: any;
}

export interface AdminSettingsData {
  maintenanceMode: boolean;
  announcementBanner: string;
  allowRegistrations: boolean;
  referralMultiplier: number;
  featuredSpotlightPrice: number;
}

// 1. USER MANAGEMENT
export const getAllUsersAdmin = async (): Promise<{ success: boolean; users: AdminUser[]; error?: string }> => {
  try {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    const users: AdminUser[] = snapshot.docs.map(docSnap => ({
      uid: docSnap.id,
      ...docSnap.data()
    })) as AdminUser[];

    return { success: true, users };
  } catch (error: unknown) {
    console.error('Error fetching admin users:', error);
    return { success: false, users: [], error: (error as Error).message };
  }
};

export const updateUserRole = async (userId: string, role: 'admin' | 'user') => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { role });
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: (error as Error).message };
  }
};

export const toggleUserBan = async (userId: string, isBanned: boolean) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { isBanned });
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: (error as Error).message };
  }
};

export const deleteUserAdmin = async (userId: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    await deleteDoc(userRef);
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: (error as Error).message };
  }
};

// 2. SUBSCRIPTION MANAGEMENT
export const grantUserSubscription = async (
  userId: string, 
  tier: 'pro' | 'elite' | 'free', 
  days: number = 30
) => {
  try {
    const userRef = doc(db, 'users', userId);
    const now = new Date();
    
    if (tier === 'free') {
      await updateDoc(userRef, {
        subscriptionTier: 'free',
        subscriptionStatus: 'inactive',
        premiumUntil: null
      });
    } else {
      const expiryDate = new Date();
      expiryDate.setDate(now.getDate() + days);

      await updateDoc(userRef, {
        subscriptionTier: tier,
        subscriptionStatus: 'active',
        premiumUntil: expiryDate.toISOString()
      });
    }

    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: (error as Error).message };
  }
};

// 3. REPORTS MODERATION
export const getSystemReports = async (): Promise<{ success: boolean; reports: AdminReport[]; error?: string }> => {
  try {
    const reportsRef = collection(db, 'reports');
    const snapshot = await getDocs(reportsRef);
    const reports: AdminReport[] = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    })) as AdminReport[];

    // In-memory sort by newest first
    reports.sort((a, b) => {
      const aTime = a.createdAt?.seconds || 0;
      const bTime = b.createdAt?.seconds || 0;
      return bTime - aTime;
    });

    return { success: true, reports };
  } catch (error: unknown) {
    console.error('Error fetching admin reports:', error);
    return { success: false, reports: [], error: (error as Error).message };
  }
};

export const createSystemReport = async (reportData: Omit<AdminReport, 'id' | 'status' | 'createdAt'>) => {
  try {
    const reportsRef = collection(db, 'reports');
    await addDoc(reportsRef, {
      ...reportData,
      status: 'pending',
      createdAt: serverTimestamp()
    });
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: (error as Error).message };
  }
};

export const resolveReport = async (
  reportId: string, 
  action: 'dismiss' | 'delete_content' | 'ban_user',
  targetId?: string,
  targetType?: string
) => {
  try {
    const reportRef = doc(db, 'reports', reportId);
    
    if (action === 'dismiss') {
      await updateDoc(reportRef, { status: 'dismissed' });
    } else if (action === 'delete_content' && targetId && targetType === 'post') {
      await deleteDoc(doc(db, 'posts', targetId));
      await updateDoc(reportRef, { status: 'resolved' });
    } else if (action === 'ban_user' && targetId) {
      await updateDoc(doc(db, 'users', targetId), { isBanned: true });
      await updateDoc(reportRef, { status: 'resolved' });
    } else {
      await updateDoc(reportRef, { status: 'resolved' });
    }

    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: (error as Error).message };
  }
};

// 4. PLATFORM SETTINGS
export const getAdminSettings = async (): Promise<AdminSettingsData> => {
  try {
    const settingsRef = doc(db, 'settings', 'global');
    const docSnap = await getDoc(settingsRef);
    if (docSnap.exists()) {
      return docSnap.data() as AdminSettingsData;
    }
  } catch (error) {
    console.error('Error reading admin settings:', error);
  }

  // Default Fallback Settings
  return {
    maintenanceMode: false,
    announcementBanner: "Welcome to Rhockstar Connect! Connect, Collaborate & Discover Opportunities.",
    allowRegistrations: true,
    referralMultiplier: 1,
    featuredSpotlightPrice: 9.99
  };
};

export const updateAdminSettings = async (settingsData: Partial<AdminSettingsData>) => {
  try {
    const settingsRef = doc(db, 'settings', 'global');
    await setDoc(settingsRef, settingsData, { merge: true });
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: (error as Error).message };
  }
};

// 5. SUPER ADMIN PROFILE
export const updateAdminProfile = async (
  userId: string,
  data: { fullName?: string; avatar?: string; bio?: string; headline?: string }
) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, data);
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: (error as Error).message };
  }
};
