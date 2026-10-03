with open("src/app/(dashboard)/premium/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

import re
old_onSuccess = """  const handleSuccess = async (tier: 'pro' | 'elite') => {
    try {
      const { updateUserProfile } = await import('@/lib/services/users');
      const expiration = new Date();
      expiration.setDate(expiration.getDate() + 30);
      const res = await updateUserProfile(profile.uid, {
        subscriptionTier: tier,
        subscriptionStatus: 'active',
        premiumUntil: expiration.toISOString()
      });
      if (res.success) {
        setProfile({ ...profile, subscriptionTier: tier, subscriptionStatus: 'active' } as any);
        toast.success(`Welcome to ${tier.toUpperCase()}! Your upgrade was successful.`);
        router.push('/settings');
      }
    } catch (err) {
      toast.error("An error occurred while upgrading.");
    }
  };"""

new_onSuccess = """  const handleSuccess = async (tier: 'pro' | 'elite', transactionId: string) => {
    try {
      const { auth } = await import('@/lib/firebase');
      const token = await auth.currentUser?.getIdToken();
      
      const res = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ transaction_id: transactionId, type: 'subscription', tier })
      });
      
      const data = await res.json();
      
      if (data.success) {
        const expiration = new Date();
        expiration.setDate(expiration.getDate() + 30);
        setProfile({ ...profile, subscriptionTier: tier, subscriptionStatus: 'active', premiumUntil: expiration.toISOString() } as any);
        toast.success(`Welcome to ${tier.toUpperCase()}! Your upgrade was successful.`);
        router.push('/settings');
      } else {
        toast.error(data.error || "Payment verification failed.");
      }
    } catch (err) {
      toast.error("An error occurred while upgrading.");
    }
  };"""

content = content.replace(old_onSuccess, new_onSuccess)

old_handleClick = """      callback: (response) => {
        if (response.status === 'successful' || response.status === 'completed') {
          onSuccess(tier);
        } else {"""

new_handleClick = """      callback: (response) => {
        if (response.status === 'successful' || response.status === 'completed') {
          onSuccess(tier, response.transaction_id);
        } else {"""

content = content.replace(old_handleClick, new_handleClick)

with open("src/app/(dashboard)/premium/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
