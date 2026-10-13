with open("src/app/(dashboard)/messages/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("const targetUserParam = searchParams.get('user') || searchParams.get('uid');", "const targetUserParam = searchParams.get('chatId') || searchParams.get('user') || searchParams.get('uid');")

with open("src/app/(dashboard)/messages/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
