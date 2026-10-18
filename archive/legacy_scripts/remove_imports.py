with open("src/components/layout/Sidebar.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Remove logoutUser import
import re
content = re.sub(r"import\s*{\s*logoutUser\s*}\s*from\s*['\"]@/lib/auth['\"];?\n?", "", content)

# Remove LogOut from lucide-react imports if it's there
content = re.sub(r"\bLogOut\b,?\s*", "", content)

with open("src/components/layout/Sidebar.tsx", "w", encoding="utf-8") as f:
    f.write(content)
