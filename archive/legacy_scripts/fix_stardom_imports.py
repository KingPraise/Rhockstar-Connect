with open("src/components/gamification/StardomInfoModal.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("\"use client\";", "\"use client\";\nimport { useState, useEffect } from \"react\";\nimport { createPortal } from \"react-dom\";")

with open("src/components/gamification/StardomInfoModal.tsx", "w", encoding="utf-8") as f:
    f.write(content)
