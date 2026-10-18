import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';

// Minimum acceptable price thresholds across supported currencies
const MIN_PRICING: Record<string, Record<string, number>> = {
  pro: {
    NGN: 4500, // standard 5,000 NGN (with slight buffer for gateway rounding)
    USD: 3,
    EUR: 3,
    GBP: 2.5,
    GHS: 40,
    KES: 400
  },
  elite: {
    NGN: 14000, // standard 15,000 NGN
    USD: 9,
    EUR: 9,
    GBP: 7.5,
    GHS: 120,
    KES: 1200
  },
  ad: {
    NGN: 4500,
    USD: 3,
    EUR: 3,
    GBP: 2.5,
    GHS: 40,
    KES: 400
  }
};

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: Missing or invalid token format' }, { status: 401 });
    }
    
    const token = authHeader.split('Bearer ')[1];
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch {
      return NextResponse.json({ error: 'Unauthorized: Invalid authentication token' }, { status: 401 });
    }

    const body = await req.json();
    const { transaction_id, tier, type, adId } = body;

    if (!transaction_id) {
      return NextResponse.json({ error: 'Missing transaction ID' }, { status: 400 });
    }

    // 1. REPLAY ATTACK DEFENSE: Check if transaction has already been processed
    const txDocRef = adminDb.collection('processed_transactions').doc(String(transaction_id));
    const txDocSnap = await txDocRef.get();

    if (txDocSnap.exists) {
      return NextResponse.json({ 
        error: 'Security Warning: This transaction has already been processed and cannot be reused.' 
      }, { status: 409 });
    }

    // 2. VERIFY TRANSACTION WITH FLUTTERWAVE
    const secretKey = process.env.FLUTTERWAVE_SECRET_KEY || '';
    if (!secretKey) {
      console.error('FLUTTERWAVE_SECRET_KEY is missing from environment variables');
      return NextResponse.json({ error: 'Payment gateway configuration error' }, { status: 500 });
    }
    
    const flwRes = await fetch(`https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json'
      }
    });

    const flwData = await flwRes.json();

    if (flwData.status !== 'success' || flwData.data?.status !== 'successful') {
      return NextResponse.json({ error: 'Transaction verification failed with payment provider' }, { status: 400 });
    }

    const paidAmount = Number(flwData.data.amount || 0);
    const currency = (flwData.data.currency || 'NGN').toUpperCase();

    // 3. CURRENCY & AMOUNT TAMPERING DEFENSE
    if (type === 'subscription' && tier) {
      const tierKey = tier.toLowerCase();
      const expectedThresholds = MIN_PRICING[tierKey] || MIN_PRICING.pro;
      const minExpected = expectedThresholds[currency] || (currency === 'NGN' ? 4500 : 3);

      if (paidAmount < minExpected) {
        return NextResponse.json({ 
          error: `Underpayment detected: ${paidAmount} ${currency} does not satisfy tier requirements.` 
        }, { status: 400 });
      }

      const expiration = new Date();
      expiration.setDate(expiration.getDate() + 30);
      
      // Update user with paid subscription and clear acquisition source
      await adminDb.collection('users').doc(decodedToken.uid).update({
        subscriptionTier: tier,
        subscriptionStatus: 'active',
        subscriptionSource: 'paid', // Separates real revenue from giveaway rewards
        acquisitionType: 'paid',
        premiumUntil: expiration.toISOString(),
        lastPaymentRef: String(transaction_id),
        lastPaymentDate: new Date().toISOString()
      });

      // Record transaction atomically to prevent replay
      await txDocRef.set({
        transactionId: String(transaction_id),
        userId: decodedToken.uid,
        userEmail: decodedToken.email || flwData.data?.customer?.email || '',
        type: 'subscription',
        tier,
        amount: paidAmount,
        currency,
        flwTxRef: flwData.data.tx_ref || '',
        paymentType: flwData.data.payment_type || '',
        subscriptionSource: 'paid',
        verifiedAt: new Date().toISOString()
      });
      
      return NextResponse.json({ success: true, message: 'Subscription upgraded successfully' });
    } 
    else if (type === 'ad' && adId) {
      // Validate ad ownership before activation
      const adDocRef = adminDb.collection('advertisements').doc(adId);
      const adDocSnap = await adDocRef.get();

      if (!adDocSnap.exists) {
        return NextResponse.json({ error: 'Advertisement not found' }, { status: 404 });
      }

      const adData = adDocSnap.data();
      if (adData?.companyId !== decodedToken.uid && !decodedToken.admin) {
        return NextResponse.json({ error: 'Forbidden: You do not own this advertisement' }, { status: 403 });
      }

      const minExpected = MIN_PRICING.ad[currency] || (currency === 'NGN' ? 4500 : 3);
      if (paidAmount < minExpected) {
        return NextResponse.json({ 
          error: `Underpayment detected for advertisement activation.` 
        }, { status: 400 });
      }

      await adDocRef.update({
        status: 'active',
        paidAt: new Date().toISOString(),
        paymentRef: String(transaction_id),
        amountPaid: paidAmount,
        currency
      });

      // Record transaction atomically to prevent replay
      await txDocRef.set({
        transactionId: String(transaction_id),
        userId: decodedToken.uid,
        userEmail: decodedToken.email || '',
        type: 'ad',
        adId,
        amount: paidAmount,
        currency,
        flwTxRef: flwData.data.tx_ref || '',
        verifiedAt: new Date().toISOString()
      });
      
      return NextResponse.json({ success: true, message: 'Ad activated successfully' });
    }
    
    return NextResponse.json({ error: 'Invalid operation type' }, { status: 400 });

  } catch (error: any) {
    console.error('Payment verification error:', error);
    return NextResponse.json({ error: 'Internal server error during verification' }, { status: 500 });
  }
}
