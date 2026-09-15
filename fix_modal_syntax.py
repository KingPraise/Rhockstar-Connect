with open("src/components/chat/CreateCommunityModal.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("  ), document.body);", "  , document.body);")

with open("src/components/chat/CreateCommunityModal.tsx", "w", encoding="utf-8") as f:
    f.write(content)
