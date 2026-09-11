with open("src/components/auth/ProtectedRoute.tsx", "r", encoding="utf-8") as f:
    content = f.read()

import re

# Add premium expiration check
check = """  useEffect(() => {
    const checkExpiration = async () => {
      if (!isLoading && profile && profile.premiumUntil && profile.subscriptionTier && profile.subscriptionTier !== 'free') {
        const expirationDate = new Date(profile.premiumUntil);
        if (expirationDate < new Date()) {
          import('firebase/firestore').then(async ({ doc, updateDoc }) => {
            const { db } = await import('@/lib/firebase');
            await updateDoc(doc(db, 'users', profile.uid), {
              subscriptionTier: 'free',
              subscriptionStatus: 'inactive'
            });
            import('react-hot-toast').then(({ toast }) => {
              toast.error("Your Premium subscription has expired.");
            });
            // Update local state to avoid infinite loops
            useAuthStore.getState().setProfile({ ...profile, subscriptionTier: 'free', subscriptionStatus: 'inactive' } as any);
          });
        }
      }
    };
    checkExpiration();
  }, [profile, isLoading]);

  useEffect(() => {"""
content = content.replace("  useEffect(() => {\n    if (!isLoading && profile?.isBanned) {", check + "\n    if (!isLoading && profile?.isBanned) {")

with open("src/components/auth/ProtectedRoute.tsx", "w", encoding="utf-8") as f:
    f.write(content)
