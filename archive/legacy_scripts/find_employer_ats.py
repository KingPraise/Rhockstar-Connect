with open("src/app/(dashboard)/employer/[jobId]/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

import re
# We need to find the if (!profile || !isEmployer || !isElite) and add || job.companyId !== profile.uid
# Wait, do we have `job` defined at that point? The QA report says lines 119-122. Let's inspect those lines first.
for i, line in enumerate(content.split('\n')):
    if "isElite" in line or "isEmployer" in line or "if (!profile" in line:
        print(f"{i}: {line}")
