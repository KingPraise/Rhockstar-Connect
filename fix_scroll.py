with open("src/app/(dashboard)/messages/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace('bottom-full ${isMe ? "right-0" : "left-0"} mb-1', 'bottom-full ${isMe ? "left-0" : "right-0"} mb-1')

with open("src/app/(dashboard)/messages/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
