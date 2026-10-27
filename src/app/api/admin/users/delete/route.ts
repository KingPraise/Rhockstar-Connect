import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  try {
    if (!adminAuth || !adminDb) {
      return NextResponse.json({ error: 'Firebase Admin not initialized' }, { status: 500 });
    }

    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: Missing token' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch {
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    // Verify caller is admin
    const callerDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
    if (!callerDoc.exists || callerDoc.data()?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { targetUid } = body;

    if (!targetUid || typeof targetUid !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid targetUid' }, { status: 400 });
    }

    // Prevent self-deletion via admin panel
    if (targetUid === decodedToken.uid) {
      return NextResponse.json({ error: 'Cannot delete your own admin account' }, { status: 400 });
    }

    // 1. Delete from Firebase Auth (if user exists in Auth)
    try {
      await adminAuth.deleteUser(targetUid);
    } catch (authErr: any) {
      // If user was already deleted from Auth, continue to delete Firestore doc
      if (authErr?.code !== 'auth/user-not-found') {
        console.warn('Could not delete user from Firebase Auth:', authErr);
      }
    }

    // 2. Delete from Firestore users collection
    try {
      await adminDb.collection('users').doc(targetUid).delete();
    } catch (dbErr) {
      console.warn('Could not delete user document from Firestore:', dbErr);
    }

    return NextResponse.json({ success: true, message: 'User deleted from Auth and Firestore successfully' });
  } catch (err: any) {
    console.error('Error deleting user:', err);
    return NextResponse.json({ error: err.message || 'Failed to delete user' }, { status: 500 });
  }
}
