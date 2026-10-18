for file in ["src/components/feed/PostCard.tsx", "src/app/(dashboard)/dating/page.tsx"]:
    with open(file, "r", encoding="utf-8") as f:
        content = f.read()

    # Find the updateUserProfile call and cast to any
    import re
    content = re.sub(r'(updateUserProfile\([^,]+,\s*\{\s*blockedUsers:\s*\[[^\]]+\]\s*)(\})', r'\1} as any', content)

    with open(file, "w", encoding="utf-8") as f:
        f.write(content)
