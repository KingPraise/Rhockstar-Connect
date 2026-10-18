with open("src/components/layout/Sidebar.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("  const handleLogout = async () => {\n    await logoutUser();\n    logout();\n    window.location.href = '/login';\n  };\n", "")

with open("src/components/layout/Sidebar.tsx", "w", encoding="utf-8") as f:
    f.write(content)
