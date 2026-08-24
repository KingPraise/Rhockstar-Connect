import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs,
  getDoc,
  doc,
  updateDoc,
  serverTimestamp,
  orderBy,
  onSnapshot,
  increment
} from 'firebase/firestore';

export interface Advertisement {
  id: string;
  companyId: string;
  companyName: string;
  companyLogo?: string;
  title: string;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  ctaText: string; // e.g. "Shop Now", "Learn More", "Apply Now", "Visit Website"
  targetUrl: string;
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'paused' | 'expired';
  rejectionReason?: string;
  price?: number; // e.g. 15000 (in NGN or USD equivalent)
  currency?: string;
  viewsCount: number;
  clicksCount: number;
  createdAt: any;
  approvedAt?: any;
  paidAt?: any;
  expiresAt?: any;
}

// Create a new advertisement submission
export const createAdvertisement = async (adData: {
  companyId: string;
  companyName: string;
  companyLogo?: string;
  title: string;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  ctaText: string;
  targetUrl: string;
}) => {
  try {
    const adsRef = collection(db, 'advertisements');
    const newDoc = await addDoc(adsRef, {
      ...adData,
      status: 'pending',
      viewsCount: 0,
      clicksCount: 0,
      createdAt: serverTimestamp(),
    });

    return { success: true, id: newDoc.id };
  } catch (error: any) {
    console.error('Error creating advertisement:', error);
    return { success: false, error: error.message };
  }
};

// Real-time listener for active sponsored ads (for Feed)
export const subscribeToActiveAds = (
  callback: (ads: Advertisement[]) => void
) => {
  const adsRef = collection(db, 'advertisements');
  const q = query(
    adsRef,
    where('status', '==', 'active')
  );

  return onSnapshot(q, (snapshot) => {
    const list: Advertisement[] = [];
    snapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() } as Advertisement);
    });
    callback(list);
  }, (err) => {
    console.error("subscribeToActiveAds error:", err);
  });
};

// Real-time listener for company's own ads
export const subscribeToCompanyAds = (
  companyId: string,
  callback: (ads: Advertisement[]) => void
) => {
  const adsRef = collection(db, 'advertisements');
  const q = query(
    adsRef,
    where('companyId', '==', companyId)
  );

  return onSnapshot(q, (snapshot) => {
    const list: Advertisement[] = [];
    snapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() } as Advertisement);
    });
    // Client-side sort by createdAt desc
    list.sort((a, b) => (b.createdAt?.toMillis ? b.createdAt.toMillis() : 0) - (a.createdAt?.toMillis ? a.createdAt.toMillis() : 0));
    callback(list);
  }, (err) => {
    console.error("subscribeToCompanyAds error:", err);
  });
};

// Real-time listener for Admin Dashboard (all ads)
export const subscribeToAllAds = (
  callback: (ads: Advertisement[]) => void
) => {
  const adsRef = collection(db, 'advertisements');

  return onSnapshot(adsRef, (snapshot) => {
    const list: Advertisement[] = [];
    snapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() } as Advertisement);
    });
    list.sort((a, b) => (b.createdAt?.toMillis ? b.createdAt.toMillis() : 0) - (a.createdAt?.toMillis ? a.createdAt.toMillis() : 0));
    callback(list);
  }, (err) => {
    console.error("subscribeToAllAds error:", err);
  });
};

// Admin approves an ad and sets price
export const approveAdvertisement = async (adId: string, price: number = 15000) => {
  try {
    const adRef = doc(db, 'advertisements', adId);
    await updateDoc(adRef, {
      status: 'approved',
      price,
      currency: 'NGN',
      approvedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error: any) {
    console.error('Error approving advertisement:', error);
    return { success: false, error: error.message };
  }
};

// Admin rejects an ad with a reason (no payment charged)
export const rejectAdvertisement = async (adId: string, reason: string) => {
  try {
    const adRef = doc(db, 'advertisements', adId);
    await updateDoc(adRef, {
      status: 'rejected',
      rejectionReason: reason,
    });
    return { success: true };
  } catch (error: any) {
    console.error('Error rejecting advertisement:', error);
    return { success: false, error: error.message };
  }
};

// Advertiser pays for an approved ad -> status becomes active!
export const confirmAdPayment = async (adId: string) => {
  try {
    const adRef = doc(db, 'advertisements', adId);
    await updateDoc(adRef, {
      status: 'active',
      paidAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error: any) {
    console.error('Error confirming ad payment:', error);
    return { success: false, error: error.message };
  }
};

// Admin or Advertiser pauses/resumes ad
export const updateAdStatus = async (adId: string, status: 'active' | 'paused' | 'expired') => {
  try {
    const adRef = doc(db, 'advertisements', adId);
    await updateDoc(adRef, { status });
    return { success: true };
  } catch (error: any) {
    console.error('Error updating ad status:', error);
    return { success: false, error: error.message };
  }
};

// Track ad view / impression (+1)
export const trackAdImpression = async (adId: string) => {
  try {
    const adRef = doc(db, 'advertisements', adId);
    await updateDoc(adRef, {
      viewsCount: increment(1),
    });
  } catch (error) {
    console.error('Error tracking ad impression:', error);
  }
};

// Track ad CTA click (+1)
export const trackAdClick = async (adId: string) => {
  try {
    const adRef = doc(db, 'advertisements', adId);
    await updateDoc(adRef, {
      clicksCount: increment(1),
    });
  } catch (error) {
    console.error('Error tracking ad click:', error);
  }
};
