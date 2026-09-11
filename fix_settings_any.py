with open("src/app/(dashboard)/settings/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

import re
content = content.replace("        }\n      });", "        }\n      } as any);")

with open("src/app/(dashboard)/settings/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
