with open("src/components/feed/PostCard.tsx", "r", encoding="utf-8") as f:
    content = f.read()

import re

# Insert action functions
actions = """
  const handleReportPost = async () => {
    setShowMenu(false);
    toast.success("Post reported to admins.");
    if (profile) {
      const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');
      const reportRef = doc(db, 'reports', `post_${post.id}_${profile.uid}`);
      await setDoc(reportRef, {
        targetId: post.id,
        targetType: 'post',
        reporterId: profile.uid,
        reason: 'user_flagged',
        createdAt: serverTimestamp()
      }, { merge: true });
    }
  };

  const handleBlockUser = async () => {
    setShowMenu(false);
    toast.success("User blocked. You will no longer see their posts.");
    if (profile) {
      const { updateUserProfile } = await import('@/lib/services/users');
      const blocked = (profile as any).blockedUsers || [];
      if (!blocked.includes(post.userId)) {
        await updateUserProfile(profile.uid, {
          blockedUsers: [...blocked, post.userId]
        });
      }
    }
  };
"""

content = content.replace("  const [showMenu, setShowMenu] = useState(false);", "  const [showMenu, setShowMenu] = useState(false);\n" + actions)

content = content.replace('onClick={() => { setShowMenu(false); toast.success("Post reported to admins."); }}', 'onClick={handleReportPost}')
content = content.replace('onClick={() => { setShowMenu(false); toast.success("User blocked. You will no longer see their posts."); }}', 'onClick={handleBlockUser}')

with open("src/components/feed/PostCard.tsx", "w", encoding="utf-8") as f:
    f.write(content)

# Fix dating page
with open("src/app/(dashboard)/dating/page.tsx", "r", encoding="utf-8") as f:
    dating = f.read()

dating_actions = """
  const handleReportUser = async () => {
    setShowMenuId(null);
    toast.success("User reported to safety team.");
    if (profile && activeProfile) {
      const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');
      const reportRef = doc(db, 'reports', `user_${activeProfile.id}_${profile.uid}`);
      await setDoc(reportRef, {
        targetId: activeProfile.id,
        targetType: 'user',
        reporterId: profile.uid,
        reason: 'dating_flagged',
        createdAt: serverTimestamp()
      }, { merge: true });
    }
  };

  const handleBlockUser = async () => {
    setShowMenuId(null);
    toast.success("User blocked from matching.");
    if (profile && activeProfile) {
      const { updateUserProfile } = await import('@/lib/services/users');
      const blocked = (profile as any).blockedUsers || [];
      if (!blocked.includes(activeProfile.id)) {
        await updateUserProfile(profile.uid, {
          blockedUsers: [...blocked, activeProfile.id]
        });
      }
    }
  };
"""

dating = dating.replace("  const [showMenuId, setShowMenuId] = useState<string | null>(null);", "  const [showMenuId, setShowMenuId] = useState<string | null>(null);\n" + dating_actions)
dating = dating.replace('onClick={() => { setShowMenuId(null); toast.success("User reported to safety team."); }}', 'onClick={handleReportUser}')
dating = dating.replace('onClick={() => { setShowMenuId(null); toast.success("User blocked from matching."); }}', 'onClick={handleBlockUser}')

with open("src/app/(dashboard)/dating/page.tsx", "w", encoding="utf-8") as f:
    f.write(dating)
