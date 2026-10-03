import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  doc,
  updateDoc,
  serverTimestamp,
  onSnapshot,
  increment,
  Timestamp,
  getDoc
} from 'firebase/firestore';

export interface Advertisement {
  id: string;
  companyId: string;
  companyName: string;
  companyLogo?: string;
  companyEmail?: string;
  title: string;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  ctaText: string;
  targetUrl: string;
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'paused' | 'expired';
  rejectionReason?: string;
  price?: number;
  currency?: string;
  durationDays?: number; // e.g. 7, 14, 30
  viewsCount: number;
  clicksCount: number;
  createdAt: any;
  approvedAt?: any;
  paidAt?: any;
  expiresAt?: any;
}

// Send Email via Firebase Trigger Email Extension (writes to 'mail' collection)
export const sendAdNotificationEmail = async (to: string | string[], subject: string, html: string) => {
  try {
    const mailRef = collection(db, 'mail');
    await addDoc(mailRef, {
      to: Array.isArray(to) ? to : [to],
      message: {
        subject,
        html,
      },
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    console.error("Firebase Trigger Email write error:", err);
  }
};

// Create a new advertisement submission
export const createAdvertisement = async (adData: {
  companyId: string;
  companyName: string;
  companyLogo?: string;
  companyEmail?: string;
  title: string;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  ctaText: string;
  targetUrl: string;
  durationDays?: number;
}) => {
  try {
    const adsRef = collection(db, 'advertisements');
    const newDoc = await addDoc(adsRef, {
      ...adData,
      durationDays: adData.durationDays || 7,
      status: 'pending',
      viewsCount: 0,
      clicksCount: 0,
      createdAt: serverTimestamp(),
    });

    // Notify SuperAdmin via Firebase Trigger Email
    sendAdNotificationEmail(
      'admin@rhockstarconnect.com',
      `🆕 New Advert Submitted for Review: "${adData.title}"`,
      `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b;">
          <h2 style="color: #9333ea;">Rhockstar Connect — New Advert Review</h2>
          <p>A new advertisement has been submitted for review by <strong>${adData.companyName}</strong>.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 15px 0;" />
          <p><strong>Title:</strong> ${adData.title}</p>
          <p><strong>Content:</strong> ${adData.content}</p>
          <p><strong>Target Link:</strong> <a href="${adData.targetUrl}">${adData.targetUrl}</a></p>
          <br/>
          <a href="https://rhockstarconnect.com/admin/ads" style="background-color: #9333ea; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold;">Review Advert on Admin Dashboard</a>
        </div>
      `
    );

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

  const now = new Date();

  return onSnapshot(q, (snapshot) => {
    const list: Advertisement[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as Advertisement;
      
      // Auto-expire check
      if (data.expiresAt) {
        const expireDate = data.expiresAt.toDate ? data.expiresAt.toDate() : new Date(data.expiresAt);
        if (expireDate < now) {
          // Auto mark as expired in Firestore
          updateDoc(doc(db, 'advertisements', docSnap.id), { status: 'expired' });
          return;
        }
      }

      list.push({ ...data, id: docSnap.id });
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

    // Fetch ad doc to send email to advertiser
    const adSnap = await getDoc(adRef);
    if (adSnap.exists()) {
      const adData = adSnap.data() as Advertisement;
      if (adData.companyEmail) {
        sendAdNotificationEmail(
          adData.companyEmail,
          `✅ Your Advert "${adData.title}" Has Been Approved!`,
          `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b;">
              <h2 style="color: #10b981;">Rhockstar Connect — Advert Approved!</h2>
              <p>Great news! Your advertisement <strong>"${adData.title}"</strong> has been reviewed and approved.</p>
              <p>Please complete your payment of <strong>₦${price.toLocaleString()}</strong> to start broadcasting live on the Rhockstar Connect feed.</p>
              <br/>
              <a href="https://rhockstarconnect.com/employer/ads" style="background-color: #10b981; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold;">Pay & Activate Advert</a>
            </div>
          `
        );
      }
    }

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

    // Fetch ad doc to send email to advertiser
    const adSnap = await getDoc(adRef);
    if (adSnap.exists()) {
      const adData = adSnap.data() as Advertisement;
      if (adData.companyEmail) {
        sendAdNotificationEmail(
          adData.companyEmail,
          `Notice regarding your Advert "${adData.title}"`,
          `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b;">
              <h2 style="color: #ef4444;">Rhockstar Connect — Advert Update</h2>
              <p>Your advertisement <strong>"${adData.title}"</strong> was reviewed, but could not be approved at this time.</p>
              <p><strong>Reason:</strong> ${reason}</p>
              <p>No payment has been charged. You can edit and resubmit your advert anytime from your dashboard.</p>
              <br/>
              <a href="https://rhockstarconnect.com/employer/ads" style="background-color: #9333ea; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold;">Go to Advertiser Dashboard</a>
            </div>
          `
        );
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error rejecting advertisement:', error);
    return { success: false, error: error.message };
  }
};

// Advertiser pays for an approved ad -> status becomes active with expiration date!
export const confirmAdPayment = async (adId: string, durationDays: number = 7) => {
  try {
    const adRef = doc(db, 'advertisements', adId);
    const expireTimestamp = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);

    await updateDoc(adRef, {
      status: 'active',
      paidAt: serverTimestamp(),
      expiresAt: Timestamp.fromDate(expireTimestamp),
      durationDays,
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
