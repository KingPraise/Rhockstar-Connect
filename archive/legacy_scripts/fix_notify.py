with open("src/app/api/notify/route.ts", "r", encoding="utf-8") as f:
    content = f.read()

import re
replacement = """import { NextResponse } from 'next/server';
import { adminDb, adminMessaging, adminAuth } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split('Bearer ')[1];
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch (err) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, title, body, icon, url } = await req.json();

    if (!userId || !title || !body) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }"""

content = re.sub(
    r"import { NextResponse } from 'next/server';\s*import { adminDb, adminMessaging } from '@/lib/firebase-admin';\s*import { FieldValue } from 'firebase-admin/firestore';\s*export async function POST\(req: Request\) {\s*try {\s*const { userId, title, body, icon, url } = await req.json\(\);(.*?)if \(!userId \|\| !title \|\| !body\)",
    replacement,
    content,
    flags=re.DOTALL
)

with open("src/app/api/notify/route.ts", "w", encoding="utf-8") as f:
    f.write(content)
