with open("src/app/(dashboard)/settings/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("useAuthStore.getState().useAuthStore.getState().setProfile", "useAuthStore.getState().setProfile")

with open("src/app/(dashboard)/settings/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
