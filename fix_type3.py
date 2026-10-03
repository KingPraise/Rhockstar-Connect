with open("src/store/useAuthStore.ts", "r", encoding="utf-8") as f:
    content = f.read()

import re
old_type = """  accountType?: 'standard' | 'employer';"""
new_type = """  accountType?: 'standard' | 'employer';
  isBanned?: boolean;"""

content = content.replace(old_type, new_type)

with open("src/store/useAuthStore.ts", "w", encoding="utf-8") as f:
    f.write(content)
