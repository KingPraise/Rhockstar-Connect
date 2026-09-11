with open("src/app/(dashboard)/messages/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

import re

# We need to find the lucide-react import and add Paperclip, Mic, Square
match = re.search(r'import\s+\{([^}]+)\}\s+from\s+"lucide-react";', content)
if match:
    imports = [x.strip() for x in match.group(1).split(',')]
    if 'Paperclip' not in imports:
        imports.append('Paperclip')
    if 'Mic' not in imports:
        imports.append('Mic')
    if 'Square' not in imports:
        imports.append('Square')
    content = content.replace(match.group(0), f'import {{ {", ".join(imports)} }} from "lucide-react";')

with open("src/app/(dashboard)/messages/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
