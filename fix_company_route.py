with open("src/components/auth/ProtectedRoute.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace('pathname.startsWith("/profile") ||', 'pathname.startsWith("/profile") || \n    pathname.startsWith("/company") ||')

with open("src/components/auth/ProtectedRoute.tsx", "w", encoding="utf-8") as f:
    f.write(content)
