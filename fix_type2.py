with open("src/store/useAuthStore.ts", "r", encoding="utf-8") as f:
    content = f.read()

old_type = """  subscriptionTier?: 'free' | 'pro' | 'elite';
  subscriptionStatus?: 'active' | 'inactive';"""

new_type = """  subscriptionTier?: 'free' | 'pro' | 'elite';
  subscriptionStatus?: 'active' | 'inactive';
  premiumUntil?: string;"""

content = content.replace(old_type, new_type)

with open("src/store/useAuthStore.ts", "w", encoding="utf-8") as f:
    f.write(content)
