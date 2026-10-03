with open("src/lib/services/users.ts", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("export const becomeEmployer = async (uid: string) => {\n  return updateUserProfile(uid, { role: 'employer' });\n};", "export const becomeEmployer = async (uid: string) => {\n  return updateUserProfile(uid, { role: 'employer', accountType: 'employer' as any });\n};")

with open("src/lib/services/users.ts", "w", encoding="utf-8") as f:
    f.write(content)
