import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

const RESERVED_USERNAMES = [
  'admin', 'administrator', 'support', 'help', 'team', 'official', 'verified', 'verify', 
  'security', 'system', 'moderator', 'mod', 'staff', 'founder', 'ceo', 'owner', 'developer', 
  'dev', 'news', 'updates', 'blog', 'careers', 'jobs', 'ads', 'advertise', 'business', 
  'press', 'media', 'privacy', 'legal', 'terms', 'community', 'events', 'feedback', 
  'report', 'appeal', 'notifications', 'api', 'bot', 'ai', 'assistant', 'store', 'market', 
  'payments', 'wallet', 'rhockstarconnect', 'rhockstarnation', 
  'rhockstar_support', 'rhockstar_help', 'rhockstar_official', 'connectsupport', 'connectadmin'
];

export async function POST(req: Request) {
  try {
    if (!adminAuth || !adminDb) {
      return NextResponse.json({ error: 'Server initialization error. Please try again shortly.' }, { status: 500 });
    }

    const body = await req.json().catch(() => ({}));
    const { email, password, fullName, username, referralCode, accountType } = body;

    // 1. Validation
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Please provide a valid email address.' }, { status: 400 });
    }

    if (!password || typeof password !== 'string' || password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters long.' }, { status: 400 });
    }

    if (!fullName || typeof fullName !== 'string' || !fullName.trim()) {
      return NextResponse.json({ error: 'Please enter your full name.' }, { status: 400 });
    }

    if (!username || typeof username !== 'string') {
      return NextResponse.json({ error: 'Please choose a username.' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanUsername = username.toLowerCase().replace('@', '').replace(/[^a-z0-9_]/g, '').trim();

    if (cleanUsername.length < 3) {
      return NextResponse.json({ error: 'Username must be at least 3 characters long.' }, { status: 400 });
    }

    if (RESERVED_USERNAMES.includes(cleanUsername)) {
      return NextResponse.json({ error: 'This username is reserved and cannot be used.' }, { status: 400 });
    }

    // 2. Check if username is taken in Firestore
    const usernameSnap = await adminDb.collection('users')
      .where('username', '==', cleanUsername)
      .limit(1)
      .get();

    if (!usernameSnap.empty) {
      return NextResponse.json({ error: 'This username is already taken. Please choose another.' }, { status: 400 });
    }

    // 3. Check if email already exists in Auth or Firestore
    let existingAuthUser: any = null;
    try {
      existingAuthUser = await adminAuth.getUserByEmail(cleanEmail);
    } catch (e: any) {
      if (e?.code !== 'auth/user-not-found') {
        // Ignored, user doesn't exist
      }
    }

    if (existingAuthUser) {
      // Check if Firestore document exists
      const existingDoc = await adminDb.collection('users').doc(existingAuthUser.uid).get();
      if (existingDoc.exists) {
        return NextResponse.json({
          error: 'This email address is already registered. If you already have an account, please log in or reset your password.'
        }, { status: 400 });
      } else {
        // Orphaned Auth user without a Firestore doc: purge the broken Auth user so registration can proceed cleanly
        try {
          await adminAuth.deleteUser(existingAuthUser.uid);
        } catch (delErr) {
          console.warn('Could not purge orphaned user before recreate:', delErr);
        }
      }
    }

    // 4. Create user in Firebase Auth
    let newAuthUser;
    try {
      newAuthUser = await adminAuth.createUser({
        email: cleanEmail,
        password: password,
        displayName: fullName.trim(),
      });
    } catch (authCreateErr: any) {
      console.error('Error creating Auth user:', authCreateErr);
      if (authCreateErr?.code === 'auth/email-already-in-use') {
        return NextResponse.json({
          error: 'This email address is already registered. If you already have an account, please log in or reset your password.'
        }, { status: 400 });
      }
      return NextResponse.json({ error: authCreateErr?.message || 'Failed to create user account' }, { status: 400 });
    }

    // 5. Create user document in Firestore with Admin privileges
    try {
      await adminDb.collection('users').doc(newAuthUser.uid).set({
        uid: newAuthUser.uid,
        fullName: fullName.trim(),
        username: cleanUsername,
        email: cleanEmail,
        accountType: accountType === 'employer' ? 'employer' : 'standard',
        bio: '',
        headline: '',
        location: { city: '', state: '', country: '' },
        stats: { posts: 0, followers: 0, following: 0, connections: 0 },
        referralCode: cleanUsername,
        referralCount: 0,
        referredFriends: [],
        claimedRewards: [],
        createdAt: FieldValue.serverTimestamp(),
        lastLogin: FieldValue.serverTimestamp(),
      });
    } catch (dbErr: any) {
      console.error('Error creating user Firestore doc, rolling back Auth:', dbErr);
      // Rollback Auth user if database creation failed
      try {
        await adminAuth.deleteUser(newAuthUser.uid);
      } catch (rollbackErr) {
        console.warn('Rollback failed:', rollbackErr);
      }
      return NextResponse.json({ error: 'Could not set up user profile. Please try again.' }, { status: 500 });
    }

    // 6. Record Referral if provided
    if (referralCode && typeof referralCode === 'string' && referralCode.trim()) {
      try {
        const cleanRefCode = referralCode.trim().replace('@', '').toLowerCase();
        let referrerDoc: any = null;

        const refSnap = await adminDb.collection('users').where('username', '==', cleanRefCode).limit(1).get();
        if (!refSnap.empty) {
          referrerDoc = refSnap.docs[0];
        } else {
          // Fallback by doc id
          const idDoc = await adminDb.collection('users').doc(cleanRefCode).get();
          if (idDoc.exists) {
            referrerDoc = idDoc;
          }
        }

        if (referrerDoc && referrerDoc.id !== newAuthUser.uid) {
          await referrerDoc.ref.update({
            referralCount: FieldValue.increment(1),
            referredFriends: FieldValue.arrayUnion({
              uid: newAuthUser.uid,
              name: fullName.trim(),
              joinedAt: new Date().toISOString()
            })
          });

          // Create notification for referrer
          await adminDb.collection('notifications').add({
            userId: referrerDoc.id,
            type: 'connection',
            title: '🎉 Referral Joined!',
            message: `${fullName.trim()} joined Rhockstar Connect using your referral link!`,
            link: '/referrals',
            read: false,
            createdAt: FieldValue.serverTimestamp(),
          });
        }
      } catch (refErr) {
        console.warn('Referral recording warning:', refErr);
        // Do not fail registration if referral processing encounters an issue
      }
    }

    return NextResponse.json({
      success: true,
      uid: newAuthUser.uid,
      message: 'Account created successfully'
    });
  } catch (err: any) {
    console.error('Unhandled registration error:', err);
    return NextResponse.json({ error: err.message || 'Registration failed' }, { status: 500 });
  }
}
