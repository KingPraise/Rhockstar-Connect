import re
with open("src/app/(dashboard)/messages/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Add createPortal import
if "createPortal" not in content:
    content = re.sub(r'(import React.*?\n)', r'\1import { createPortal } from "react-dom";\n', content, count=1)

content = content.replace("{forwardingMessage && (", "{forwardingMessage && typeof window !== 'undefined' && createPortal(")

content = re.sub(r'(No other conversations to forward to<\/p>\s*)\}\)\s*<\/div>\s*<\/div>\s*<\/div>\s*\)\}', r'\1)}\n              </div>\n            </div>\n          </div>\n        ), document.body)}', content)

with open("src/app/(dashboard)/messages/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
