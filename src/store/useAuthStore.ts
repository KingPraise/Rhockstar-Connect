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
  socialLinks?: Record<string, string>;
  visibility?: 'public' | 'connections' | 'private';
  role?: 'admin' | 'user';
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
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => set({ user: null, profile: null, isLoading: false })
}));
