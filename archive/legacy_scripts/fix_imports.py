import re
with open("src/components/chat/CreateCommunityModal.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("import { useState } from \"react\";", "import { useState, useEffect } from \"react\";\nimport { createPortal } from \"react-dom\";")

with open("src/components/chat/CreateCommunityModal.tsx", "w", encoding="utf-8") as f:
    f.write(content)

with open("src/app/(dashboard)/messages/page.tsx", "r", encoding="utf-8") as f:
    content2 = f.read()

if "import { createPortal }" not in content2:
    content2 = content2.replace("import { useState, useEffect, useRef } from \"react\";", "import { useState, useEffect, useRef } from \"react\";\nimport { createPortal } from \"react-dom\";")

with open("src/app/(dashboard)/messages/page.tsx", "w", encoding="utf-8") as f:
    f.write(content2)
