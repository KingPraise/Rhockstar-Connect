import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

async function verifyAdminCaller(req: Request) {
  if (!adminAuth || !adminDb) {
    return { error: 'Firebase Admin not initialized', status: 500 };
  }

  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: 'Unauthorized: Missing token', status: 401 };
  }

  const token = authHeader.split('Bearer ')[1];
  let decodedToken;
  try {
    decodedToken = await adminAuth.verifyIdToken(token);
  } catch {
    return { error: 'Unauthorized: Invalid token', status: 401 };
  }

  const callerDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
  if (!callerDoc.exists || callerDoc.data()?.role !== 'admin') {
    return { error: 'Forbidden: Admin access required', status: 403 };
  }

  return { callerUid: decodedToken.uid };
}

// GET: Scan for orphaned Auth accounts (users in Firebase Auth with no Firestore document)
export async function GET(req: Request) {
  try {
    const authCheck = await verifyAdminCaller(req);
    if ('error' in authCheck) {
      return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
    }

    if (!adminAuth || !adminDb) {
      return NextResponse.json({ error: 'Firebase Admin not available' }, { status: 500 });
    }

    // 1. Fetch all Firestore user IDs (projection only uid/id to be fast)
    const firestoreSnap = await adminDb.collection('users').select().get();
    const firestoreUserIds = new Set(firestoreSnap.docs.map(doc => doc.id));

    // 2. Fetch Auth users
    const orphanedAuthUsers: Array<{
      uid: string;
      email?: string;
      displayName?: string;
      creationTime?: string;
      lastSignInTime?: string;
    }> = [];

    let nextPageToken: string | undefined;
    do {
      const list = await adminAuth.listUsers(1000, nextPageToken);
      for (const user of list.users) {
        if (!firestoreUserIds.has(user.uid)) {
          orphanedAuthUsers.push({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            creationTime: user.metadata.creationTime,
            lastSignInTime: user.metadata.lastSignInTime,
          });
        }
      }
      nextPageToken = list.pageToken;
    } while (nextPageToken);

    return NextResponse.json({
      success: true,
      orphanedCount: orphanedAuthUsers.length,
      orphans: orphanedAuthUsers,
    });
  } catch (err: any) {
    console.error('Error scanning for orphaned users:', err);
    return NextResponse.json({ error: err.message || 'Failed to scan users' }, { status: 500 });
  }
}

// POST: Purge or Heal selected orphaned users
export async function POST(req: Request) {
  try {
    const authCheck = await verifyAdminCaller(req);
    if ('error' in authCheck) {
      return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
    }

    if (!adminAuth || !adminDb) {
      return NextResponse.json({ error: 'Firebase Admin not available' }, { status: 500 });
    }

    const body = await req.json().catch(() => ({}));
    const { action, uids } = body;

    if (!Array.isArray(uids) || uids.length === 0) {
      return NextResponse.json({ error: 'Missing or empty uids list' }, { status: 400 });
    }

    if (action === 'purge') {
      // Delete from Firebase Auth
      let deleted = 0;
      for (const uid of uids) {
        try {
          await adminAuth.deleteUser(uid);
          deleted++;
        } catch (delErr) {
          console.warn(`Failed to delete orphan ${uid}:`, delErr);
        }
      }
      return NextResponse.json({ success: true, message: `Successfully purged ${deleted} orphaned Auth accounts.` });
    } else if (action === 'heal') {
      // Reconstruct default Firestore documents so they become full active accounts
      let healed = 0;
      for (const uid of uids) {
        try {
          const authUser = await adminAuth.getUser(uid);
          const rawPrefix = (authUser.email?.split('@')[0] || 'member').toLowerCase().replace(/[^a-z0-9_]/g, '');
          const username = `${rawPrefix}${Math.floor(100 + Math.random() * 900)}`;

          await adminDb.collection('users').doc(uid).set({
            uid,
            fullName: authUser.displayName || authUser.email?.split('@')[0] || 'Rhockstar Member',
            username,
            email: authUser.email || '',
            accountType: 'standard',
            bio: '',
            headline: '',
            location: { city: '', state: '', country: '' },
            stats: { posts: 0, followers: 0, following: 0, connections: 0 },
            referralCode: username,
            referralCount: 0,
            referredFriends: [],
            claimedRewards: [],
            createdAt: FieldValue.serverTimestamp(),
            lastLogin: FieldValue.serverTimestamp(),
          });
          healed++;
        } catch (healErr) {
          console.warn(`Failed to heal orphan ${uid}:`, healErr);
        }
      }
      return NextResponse.json({ success: true, message: `Successfully healed ${healed} accounts in Firestore.` });
    }

    return NextResponse.json({ error: 'Invalid action. Supported: "purge" or "heal"' }, { status: 400 });
  } catch (err: any) {
    console.error('Error handling orphaned users:', err);
    return NextResponse.json({ error: err.message || 'Operation failed' }, { status: 500 });
  }
}
