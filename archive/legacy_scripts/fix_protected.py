with open("src/components/auth/ProtectedRoute.tsx", "r", encoding="utf-8") as f:
    content = f.read()

import re

# replace "const { user, isLoading } = useAuthStore();"
content = content.replace("const { user, isLoading } = useAuthStore();", "const { user, profile, isLoading, logout } = useAuthStore();")

# add check for banned
check = """  useEffect(() => {
    if (!isLoading && profile?.isBanned) {
      import('react-hot-toast').then(({ toast }) => {
        toast.error("Your account has been banned due to policy violations.");
      });
      logout();
      router.replace("/login");
    }
  }, [profile, isLoading, logout, router]);

  useEffect(() => {"""
content = content.replace("  useEffect(() => {\n    if (!isLoading && !user && !isPublicRoute) {", check + "\n    if (!isLoading && !user && !isPublicRoute) {")

with open("src/components/auth/ProtectedRoute.tsx", "w", encoding="utf-8") as f:
    f.write(content)
