with open("src/app/(dashboard)/settings/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("const newValue = !currentValue;", "const newValue = !currentValue;\n      const { updateUserProfile } = await import('@/lib/services/users');")

with open("src/app/(dashboard)/settings/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
