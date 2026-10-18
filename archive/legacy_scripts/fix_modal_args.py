import re
with open("src/app/(dashboard)/messages/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Replace the closing parenthesis of forwardingMessage
old = "No other conversations to forward to</p>\n              )}\n            </div>\n          </div>\n        </div>\n      )}"
new = "No other conversations to forward to</p>\n              )}\n            </div>\n          </div>\n        </div>\n      ), document.body)}"
content = content.replace(old, new)

with open("src/app/(dashboard)/messages/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
