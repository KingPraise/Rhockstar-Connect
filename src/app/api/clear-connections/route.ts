import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET() {
  try {
    const querySnapshot = await adminDb.collection('connections').get();
    let count = 0;
    
    // Create a batch to delete all documents efficiently
    const batch = adminDb.batch();
    
    for (const d of querySnapshot.docs) {
      batch.delete(d.ref);
      count++;
    }
    
    await batch.commit();
    return NextResponse.json({ success: true, count });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
