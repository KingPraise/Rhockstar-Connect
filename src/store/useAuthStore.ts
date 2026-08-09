import { create } from 'zustand';
import { User as FirebaseUser } from 'firebase/auth';

export interface UserProfile {
  uid: string;
  fullName: string;
  username: string;
  email: string;
  bio?: string;
  headline?: string;
  location?: { city?: string; state?: string; country?: string } | string;
  avatar?: string;
  stats?: { posts: number; followers: number; following: number; connections: number };
  phone?: string;
  dob?: string;
  relationship?: string;
  website?: string;
  skills?: string[];
  education?: string;
  certifications?: string[];
  portfolio?: string[];
  resumeUrl?: string;
  socialLinks?: Record<string, string>;
  
  // Dating Fields
  datingActive?: boolean;
  datingInterests?: string[];
  datingGoals?: string;
  datingPhotos?: string[];
  datingPrompts?: Array<{ prompt: string; answer: string }>;
  datingVoiceIntro?: string;

  visibility?: 'public' | 'connections' | 'private';
  role?: 'admin' | 'user';
  accountType?: 'standard' | 'employer';
  
  // Employer Fields
  companySize?: string;
  industry?: string;
  foundedYear?: string;
  companyJobs?: string[];

  subscriptionTier?: 'free' | 'pro' | 'elite';
  subscriptionStatus?: 'active' | 'inactive';
  savedPosts?: string[];
  referralCode?: string;
  referralCount?: number;
  referredFriends?: Array<{ uid: string; name: string; joinedAt: string }>;
  claimedRewards?: string[];
}

interface AuthState {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  isLoading: boolean;
  setUser: (user: FirebaseUser | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setLoading: (isLoading: boolean) => void;
  unreadNotifications: number;
  setUnreadNotifications: (count: number) => void;
  unreadMessages: number;
  setUnreadMessages: (count: number) => void;
  aiWidgetVisible: boolean;
  setAiWidgetVisible: (visible: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  isLoading: true,
  unreadNotifications: 0,
  unreadMessages: 0,
  aiWidgetVisible: true,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (isLoading) => set({ isLoading }),
  setUnreadNotifications: (count) => set({ unreadNotifications: count }),
  setUnreadMessages: (count) => set({ unreadMessages: count }),
  setAiWidgetVisible: (visible) => set({ aiWidgetVisible: visible }),
  logout: () => set({ user: null, profile: null, isLoading: false, unreadNotifications: 0, unreadMessages: 0, aiWidgetVisible: true })
}));
