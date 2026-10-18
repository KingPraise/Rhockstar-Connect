with open("src/components/auth/ProtectedRoute.tsx", "r", encoding="utf-8") as f:
    content = f.read()

import re

old_public = """  const isPublicRoute = 
    pathname === "/feed" || 
    pathname.startsWith("/profile") || 
    pathname === "/jobs" || 
    pathname === "/terms";"""

new_public = """  const isPublicRoute = 
    pathname === "/feed" || 
    pathname.startsWith("/profile") || 
    pathname.startsWith("/company") ||
    pathname === "/jobs" || 
    pathname === "/terms" ||
    pathname === "/privacy";"""

content = content.replace(old_public, new_public)

with open("src/components/auth/ProtectedRoute.tsx", "w", encoding="utf-8") as f:
    f.write(content)
