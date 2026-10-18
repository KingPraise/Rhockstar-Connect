with open("src/components/chat/CreateCommunityModal.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("  ), document.body);\n}", "  ), document.body);\n}")

# Let's just fix it completely using regex to be safe
import re
content = re.sub(r'  \), document\.body\);\n\}', r'  ), document.body);\n}', content)
