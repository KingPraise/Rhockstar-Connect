with open("src/app/(dashboard)/settings/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

import re
content = re.sub(r'placeholder="[^"]*"', 'placeholder="********"', content)

with open("src/app/(dashboard)/settings/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
