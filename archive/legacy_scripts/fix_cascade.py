with open("src/lib/services/users.ts", "r", encoding="utf-8") as f:
    content = f.read()

import re

# Match the whole block starting from `// 2. Update Comments left by user on ANY post`
# until the start of `// 3. Update Jobs posted by user`
pattern = re.compile(r'\s*// 2\. Update Comments left by user on ANY post.*?(?=\s*// 3\. Update Jobs posted by user)', re.DOTALL)

if pattern.search(content):
    content = pattern.sub('\n        // Note: Client-side cascade updates for comments have been removed due to batch limits and security rules.\n', content)
    with open("src/lib/services/users.ts", "w", encoding="utf-8") as f:
        f.write(content)
    print("Fixed DATA-03")
else:
    print("Could not find the pattern for DATA-03")
