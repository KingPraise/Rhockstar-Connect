with open("src/app/admin/(protected)/jobs/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

import re
# Find the outside logic block
logic_match = re.search(r'const handleDeleteJob = async \(jobId: string\) => \{.*?\};\s*export default function AdminJobsPage\(\) \{', content, re.DOTALL)
if logic_match:
    logic_text = logic_match.group(0).replace('export default function AdminJobsPage() {', '')
    content = content.replace(logic_match.group(0), 'export default function AdminJobsPage() {\n' + logic_text)

with open("src/app/admin/(protected)/jobs/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
