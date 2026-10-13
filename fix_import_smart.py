with open("src/app/(dashboard)/messages/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

if "createPortal" not in content:
    content = content.replace("\"use client\";", "\"use client\";\nimport { createPortal } from \"react-dom\";")
    with open("src/app/(dashboard)/messages/page.tsx", "w", encoding="utf-8") as f:
        f.write(content)
