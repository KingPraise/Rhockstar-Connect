import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

const REFERRAL_TIERS: Record<string, {
  id: string;
  name: string;
  requiredInvites: number;
  rewardType: 'premium' | 'boost' | 'badge_and_jobs' | 'vip';
  rewardDays?: number;
  badgeName?: string;
  extraJobs?: number;
}> = {
  tier_starter: {
    id: 'tier_starter',
    name: 'Starter Connector',
    requiredInvites: 3,
    rewardType: 'premium',
    rewardDays: 7,
  },
  tier_bronze: {
    id: 'tier_bronze',
    name: 'Bronze Ambassador',
    requiredInvites: 5,
    rewardType: 'boost',
    rewardDays: 7,
  },
  tier_silver: {
    id: 'tier_silver',
    name: 'Silver Influencer',
    requiredInvites: 10,
    rewardType: 'badge_and_jobs',
    badgeName: 'Featured Professional',
    extraJobs: 20,
  },
  tier_gold: {
    id: 'tier_gold',
    name: 'Gold Rhockstar',
    requiredInvites: 25,
    rewardType: 'vip',
    rewardDays: 30,
    badgeName: 'Rhockstar Legend',
  },
};

export async function POST(req: Request) {
  try {
    if (!adminAuth || !adminDb) {
      return NextResponse.json(
        { error: 'Backend administration services unavailable' },
        { status: 503 }
      );
    }

    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized: Missing token' },
        { status: 401 }
      );
    }

    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch (err: any) {
      return NextResponse.json(
        { error: 'Invalid or expired session token' },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { tierId } = body;

    if (!tierId || !REFERRAL_TIERS[tierId]) {
      return NextResponse.json(
        { error: 'Invalid referral reward tier specified.' },
        { status: 400 }
      );
    }

    const tier = REFERRAL_TIERS[tierId];
    const userDocRef = adminDb.collection('users').doc(decodedToken.uid);
    const userDocSnap = await userDocRef.get();

    if (!userDocSnap.exists) {
      return NextResponse.json(
        { error: 'User profile not found.' },
        { status: 404 }
      );
    }

    const userData = userDocSnap.data() || {};
    const referralCount = Number(userData.referralCount || 0);
    const claimedRewards: string[] = userData.claimedRewards || [];

    if (referralCount < tier.requiredInvites) {
      return NextResponse.json(
        { error: `You need at least ${tier.requiredInvites} referrals to claim this reward.` },
        { status: 400 }
      );
    }

    if (claimedRewards.includes(tierId)) {
      return NextResponse.json(
        { error: 'This reward has already been claimed.' },
        { status: 400 }
      );
    }

    const now = new Date();
    const updateData: Record<string, any> = {
      claimedRewards: FieldValue.arrayUnion(tierId),
    };

    if (tier.rewardType === 'premium') {
      const daysToAdd = tier.rewardDays || 7;
      const currentExpiry = userData.premiumUntil ? new Date(userData.premiumUntil) : now;
      const baseDate = currentExpiry > now ? currentExpiry : now;
      baseDate.setDate(baseDate.getDate() + daysToAdd);

      updateData.subscriptionTier = 'pro';
      updateData.subscriptionStatus = 'active';
      updateData.subscriptionSource = 'referral';
      updateData.acquisitionType = 'reward';
      updateData.premiumUntil = baseDate.toISOString();
      updateData.subscriptionRemindersSent = [];
    } else if (tier.rewardType === 'boost') {
      const daysToAdd = tier.rewardDays || 7;
      const baseDate = new Date();
      baseDate.setDate(baseDate.getDate() + daysToAdd);

      updateData.isBoosted = true;
      updateData.boostedUntil = baseDate.toISOString();
    } else if (tier.rewardType === 'badge_and_jobs') {
      updateData.badges = FieldValue.arrayUnion(tier.badgeName || 'Featured Professional');
      updateData.extraJobApps = FieldValue.increment(tier.extraJobs || 20);
    } else if (tier.rewardType === 'vip') {
      const daysToAdd = tier.rewardDays || 30;
      const currentExpiry = userData.premiumUntil ? new Date(userData.premiumUntil) : now;
      const baseDate = currentExpiry > now ? currentExpiry : now;
      baseDate.setDate(baseDate.getDate() + daysToAdd);

      updateData.subscriptionTier = 'elite';
      updateData.subscriptionStatus = 'active';
      updateData.subscriptionSource = 'referral';
      updateData.acquisitionType = 'reward';
      updateData.premiumUntil = baseDate.toISOString();
      updateData.subscriptionRemindersSent = [];
      updateData.isBoosted = true;
      updateData.badges = FieldValue.arrayUnion(tier.badgeName || 'Rhockstar Legend');
    }

    await userDocRef.update(updateData);

    return NextResponse.json({
      success: true,
      message: `Successfully claimed ${tier.name}!`,
      tierId,
    });
  } catch (err: any) {
    console.error('Referral reward claim error:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to claim referral reward' },
      { status: 500 }
    );
  }
}
