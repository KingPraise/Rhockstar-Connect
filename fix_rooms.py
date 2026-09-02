import os

with open("src/app/(dashboard)/messages/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("Rooms 🌐", "Communities 🌐")
content = content.replace("public room", "public community")
content = content.replace("public community rooms", "public communities")

with open("src/app/(dashboard)/messages/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)

with open("src/components/layout/QuickCreateModal.tsx", "r", encoding="utf-8") as f:
    content2 = f.read()
    
content2 = content2.replace("public chat room", "public community")

with open("src/components/layout/QuickCreateModal.tsx", "w", encoding="utf-8") as f:
    f.write(content2)
