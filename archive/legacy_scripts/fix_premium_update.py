with open("src/app/(dashboard)/premium/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

import re
old = """const res = await updateUserProfile(profile.uid, {
      subscriptionTier: tier,
      subscriptionStatus: 'active'
    });"""

new = """const expiration = new Date();
    expiration.setDate(expiration.getDate() + 30);
    const res = await updateUserProfile(profile.uid, {
      subscriptionTier: tier,
      subscriptionStatus: 'active',
      premiumUntil: expiration.toISOString()
    });"""

content = content.replace(old, new)

with open("src/app/(dashboard)/premium/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
