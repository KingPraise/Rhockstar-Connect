with open("src/store/useAuthStore.ts", "r", encoding="utf-8") as f:
    content = f.read()

import re
old_type = """  subscriptionStatus?: 'active' | 'inactive' | 'cancelled';
  accountType?: 'user' | 'employer';"""

new_type = """  subscriptionStatus?: 'active' | 'inactive' | 'cancelled';
  premiumUntil?: string;
  accountType?: 'user' | 'employer';"""

content = content.replace(old_type, new_type)

with open("src/store/useAuthStore.ts", "w", encoding="utf-8") as f:
    f.write(content)
