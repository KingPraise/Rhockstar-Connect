with open("src/lib/services/gamification.ts", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("limit(15)", "limit(20)")

with open("src/lib/services/gamification.ts", "w", encoding="utf-8") as f:
    f.write(content)
