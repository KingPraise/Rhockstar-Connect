with open("src/app/(dashboard)/settings/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

import re

# Remove the incorrectly placed logic block that was put BEFORE export default function
logic_match = re.search(r'const handlePasswordChange = async \(\) => \{.*?\};\s*const handleTogglePref = async \(key: string, currentValue: boolean\) => \{.*?\};\s*export default function SettingsPage\(\) \{', content, re.DOTALL)
if logic_match:
    # We found it outside.
    logic_text = logic_match.group(0).replace('export default function SettingsPage() {', '')
    content = content.replace(logic_match.group(0), 'export default function SettingsPage() {\n' + logic_text)
else:
    print("Could not find the outside logic block.")

with open("src/app/(dashboard)/settings/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
