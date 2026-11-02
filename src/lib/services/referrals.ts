import { db } from '../firebase';
import { 
  collection, 
  getDocs,
  doc,
  getDoc,
  updateDoc,
  query,
  where,
  arrayUnion,
  increment,
  serverTimestamp
} from 'firebase/firestore';
import { createNotification } from './notifications';

export interface ReferralTier {
  id: string;
  requiredInvites: number;
  title: string;
  badgeName?: string;
  description: string;
  rewardType: 'premium' | 'boost' | 'badge_and_jobs' | 'vip';
  rewardDays?: number;
  extraJobs?: number;
}

export const REFERRAL_TIERS: ReferralTier[] = [
  {
    id: 'tier_1',
    requiredInvites: 1,
    title: '7 Days Free Premium',
    description: 'Unlock 7 days of Premium access with full dating spotlight and search filters.',
    rewardType: 'premium',
    rewardDays: 7
  },
  {
    id: 'tier_2',
    requiredInvites: 3,
    title: '7-Day Profile Boost',
    description: 'Boost your profile to the top of Discover and Dating lists for 7 days.',
    rewardType: 'boost',
    rewardDays: 7
  },
  {
    id: 'tier_3',
    requiredInvites: 5,
    title: 'Featured Badge & +20 Job Applications',
    description: 'Earn the "Featured Professional" profile badge and 20 extra job application credits.',
    badgeName: 'Featured Professional',
    rewardType: 'badge_and_jobs',
    extraJobs: 20
  },
  {
    id: 'tier_4',
    requiredInvites: 10,
    title: 'VIP Legend Badge + 30 Days Premium',
    description: 'Unlock the gold "Rhockstar Legend" VIP badge, 30 days Premium & maximum visibility.',
    badgeName: 'Rhockstar Legend',
    rewardType: 'vip',
    rewardDays: 30
  }
];

export const recordReferral = async (referralCode: string, newUserId: string, newUserName: string) => {
  try {
    const cleanCode = referralCode.trim().replace('@', '').toLowerCase();
    if (!cleanCode) return { success: false, error: 'Empty referral code' };

    // Search user by username or uid
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('username', '==', cleanCode));
    let snapshot = await getDocs(q);

    let referrerDoc = snapshot.docs[0];
    
    // Fallback: search by uid if not found by username
    if (!referrerDoc) {
      const docRef = doc(db, 'users', cleanCode);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        referrerDoc = docSnap;
      }
    }

    if (!referrerDoc) {
      return { success: false, error: 'Referrer not found' };
    }

    const referrerId = referrerDoc.id;
    // Don't allow self-referral
    if (referrerId === newUserId) return { success: false, error: 'Self-referral not allowed' };

    const referrerRef = doc(db, 'users', referrerId);
    
    // Update referrer record
    await updateDoc(referrerRef, {
      referralCount: increment(1),
      referredFriends: arrayUnion({
        uid: newUserId,
        name: newUserName,
        joinedAt: new Date().toISOString()
      })
    });

    // Notify referrer
    await createNotification({
      userId: referrerId,
      type: 'connection',
      title: '🎉 Referral Joined!',
      message: `${newUserName} joined Rhockstar Connect using your referral link! Check your Rewards Hub to claim your perks.`,
      link: '/referrals'
    });

    return { success: true };
  } catch (error: unknown) {
    console.error('Error recording referral:', error);
    return { success: false, error: (error as Error).message };
  }
};

export const claimReferralReward = async (userId: string, tierId: string) => {
  try {
    const { auth } = await import('@/lib/firebase');
    const token = await auth.currentUser?.getIdToken();

    if (!token) {
      return { success: false, error: 'Session expired. Please log in again.' };
    }

    const res = await fetch('/api/referrals/claim', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ tierId })
    });

    const data = await res.json().catch(() => ({}));
    if (res.ok && data.success) {
      return { success: true, message: data.message };
    }
    return { success: false, error: data.error || 'Failed to claim reward' };
  } catch (error: unknown) {
    console.error('Error claiming reward:', error);
    return { success: false, error: (error as Error).message };
  }
};
