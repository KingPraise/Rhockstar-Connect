with open("src/app/(dashboard)/settings/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

import re

old_verify = """<button className="px-4 py-2 bg-brand/10 text-brand font-bold rounded-lg border border-brand/20 hover:bg-brand hover:text-white transition-colors">
                            Verify Now
                          </button>"""

new_verify = """<button onClick={() => toast.success("Phone verification coming soon!")} className="px-4 py-2 bg-brand/10 text-brand font-bold rounded-lg border border-brand/20 hover:bg-brand hover:text-white transition-colors">
                            Coming Soon
                          </button>"""

content = content.replace(old_verify, new_verify)

with open("src/app/(dashboard)/settings/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
