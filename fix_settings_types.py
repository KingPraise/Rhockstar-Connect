with open("src/store/useAuthStore.ts", "r", encoding="utf-8") as f:
    content = f.read()

import re

old_type = """  isBanned?: boolean;"""
new_type = """  isBanned?: boolean;
  notificationSettings?: { connectionAlerts?: boolean; postInteractions?: boolean; };"""

if "notificationSettings?" not in content:
    content = content.replace(old_type, new_type)

with open("src/store/useAuthStore.ts", "w", encoding="utf-8") as f:
    f.write(content)

with open("src/lib/services/users.ts", "r", encoding="utf-8") as f:
    users_content = f.read()

users_old_type = """  accountType?: 'standard' | 'employer';"""
users_new_type = """  accountType?: 'standard' | 'employer';
  notificationSettings?: { connectionAlerts?: boolean; postInteractions?: boolean; };"""

if "notificationSettings?" not in users_content:
    users_content = users_content.replace(users_old_type, users_new_type)

with open("src/lib/services/users.ts", "w", encoding="utf-8") as f:
    f.write(users_content)
