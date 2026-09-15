with open("src/app/(dashboard)/notifications/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("font-bold text-lg truncate", "font-bold text-base leading-snug break-words pr-2")

with open("src/app/(dashboard)/notifications/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
