import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

/**
 * Flutterwave Automated Recurring Subscription & Payment Webhook
 * Handles:
 * - charge.completed (extends subscription +30 days from previous expiration date)
 * - subscription.cancelled (marks status as cancelled while preserving remaining paid days)
 */
export async function POST(req: Request) {
  try {
    // 1. Verify Webhook Signature
    const secretHash = process.env.FLUTTERWAVE_WEBHOOK_SECRET_HASH || process.env.FLUTTERWAVE_SECRET_HASH || '';
    const signature = req.headers.get('verif-hash');

    if (secretHash && (!signature || signature !== secretHash)) {
      console.warn('[Webhook Security Alert] Invalid or missing Flutterwave verif-hash header.');
      return NextResponse.json({ error: 'Unauthorized webhook signature' }, { status: 401 });
    }

    const payload = await req.json();
    const eventType = payload.event || payload['event.type'];
    const data = payload.data || {};

    // ================= CASE A: CHARGE COMPLETED (RENEWAL OR RECURRING CHARGE) =================
    if (eventType === 'charge.completed' && data.status === 'successful') {
      const transactionId = String(data.id || data.tx_ref || '');
      if (!transactionId) {
        return NextResponse.json({ status: 'ignored', reason: 'Missing transaction ID' }, { status: 200 });
      }

      // Idempotency Check: Ensure this webhook event hasn't already been processed
      const txDocRef = adminDb.collection('processed_transactions').doc(transactionId);
      const txSnap = await txDocRef.get();
      if (txSnap.exists) {
        return NextResponse.json({ status: 'already_processed' }, { status: 200 });
      }

      const customerEmail = (data.customer?.email || '').toLowerCase().trim();
      const metaUserId = data.meta?.userId || '';
      const paidAmount = Number(data.amount || 0);
      const currency = String(data.currency || 'NGN').toUpperCase();

      // Locate user document by meta.userId or customer email
      let userDocSnap: FirebaseFirestore.DocumentSnapshot | null = null;
      if (metaUserId) {
        const snap = await adminDb.collection('users').doc(metaUserId).get();
        if (snap.exists) userDocSnap = snap;
      }

      if (!userDocSnap && customerEmail) {
        const querySnap = await adminDb
          .collection('users')
          .where('email', '==', customerEmail)
          .limit(1)
          .get();
        if (!querySnap.empty) {
          userDocSnap = querySnap.docs[0];
        }
      }

      if (!userDocSnap || !userDocSnap.exists) {
        console.warn(`[Webhook] User not found for email: ${customerEmail} / tx: ${transactionId}`);
        return NextResponse.json({ status: 'user_not_found' }, { status: 200 });
      }

      const userData = userDocSnap.data() || {};
      const userId = userDocSnap.id;

      // Determine tier based on payment amount or existing subscription tier
      let tier: 'pro' | 'elite' = (userData.subscriptionTier === 'elite' ? 'elite' : 'pro');
      if (
        (currency === 'NGN' && paidAmount >= 14000) ||
        ((currency === 'USD' || currency === 'EUR' || currency === 'GBP') && paidAmount >= 7.5)
      ) {
        tier = 'elite';
      }

      // Calculate new expiration: +30 days from previous expiration (if still active in future), else from now
      const now = new Date();
      let baseDate = now;
      if (userData.premiumUntil) {
        const existingExpiry = new Date(userData.premiumUntil);
        if (!isNaN(existingExpiry.getTime()) && existingExpiry > now) {
          baseDate = existingExpiry;
        }
      }

      const newExpiry = new Date(baseDate.getTime() + 30 * 24 * 60 * 60 * 1000);

      // Update user subscription state
      await adminDb.collection('users').doc(userId).update({
        subscriptionTier: tier,
        subscriptionStatus: 'active',
        subscriptionSource: 'paid',
        acquisitionType: 'paid',
        premiumUntil: newExpiry.toISOString(),
        lastPaymentRef: transactionId,
        lastPaymentDate: now.toISOString(),
      });

      // Record processed transaction atomically
      await txDocRef.set({
        transactionId,
        userId,
        userEmail: customerEmail,
        type: 'subscription_webhook_renewal',
        tier,
        amount: paidAmount,
        currency,
        flwTxRef: data.tx_ref || '',
        subscriptionSource: 'paid',
        verifiedAt: now.toISOString(),
      });

      // Send in-app notification to user
      await adminDb.collection('notifications').add({
        userId,
        type: 'system',
        title: `Subscription Renewed (${tier.toUpperCase()}) 👑`,
        message: `Your Rhockstar ${tier.toUpperCase()} membership has been extended by 30 days until ${newExpiry.toLocaleDateString()}.`,
        link: '/premium',
        read: false,
        createdAt: now,
      });

      return NextResponse.json({
        success: true,
        status: 'renewed',
        userId,
        tier,
        premiumUntil: newExpiry.toISOString(),
      });
    }

    // ================= CASE B: SUBSCRIPTION CANCELLED / FAILED =================
    if (eventType === 'subscription.cancelled' || (eventType === 'charge.completed' && data.status === 'failed')) {
      const customerEmail = (data.customer?.email || '').toLowerCase().trim();
      if (!customerEmail) {
        return NextResponse.json({ status: 'ignored' }, { status: 200 });
      }

      const querySnap = await adminDb
        .collection('users')
        .where('email', '==', customerEmail)
        .limit(1)
        .get();

      if (!querySnap.empty) {
        const userDoc = querySnap.docs[0];
        const userData = userDoc.data() || {};
        const expiryStr = userData.premiumUntil
          ? new Date(userData.premiumUntil).toLocaleDateString()
          : 'the end of your billing cycle';

        // Preserve remaining paid days; only mark status as 'cancelled' so it won't auto-renew
        await adminDb.collection('users').doc(userDoc.id).update({
          subscriptionStatus: 'cancelled',
        });

        await adminDb.collection('notifications').add({
          userId: userDoc.id,
          type: 'system',
          title: 'Subscription Auto-Renewal Update',
          message:
            eventType === 'subscription.cancelled'
              ? `Your recurring subscription has been cancelled. You will continue to enjoy your full ${String(userData.subscriptionTier || 'Pro').toUpperCase()} perks until ${expiryStr}.`
              : `We couldn't process your recurring renewal charge. Your current perks remain active until ${expiryStr}.`,
          link: '/premium',
          read: false,
          createdAt: new Date(),
        });
      }

      return NextResponse.json({ success: true, status: 'cancellation_processed' }, { status: 200 });
    }

    return NextResponse.json({ status: 'unhandled_event' }, { status: 200 });
  } catch (error) {
    console.error('Flutterwave webhook processing error:', error);
    return NextResponse.json({ error: 'Webhook processing error' }, { status: 500 });
  }
}
