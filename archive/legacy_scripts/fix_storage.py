new_rules = """rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.resource.size < 20 * 1024 * 1024; // max 20MB
    }
  }
}
"""
with open("storage.rules", "w", encoding="utf-8") as f:
    f.write(new_rules)

# Fix createAdmin.js
try:
    with open("scripts/createAdmin.js", "r", encoding="utf-8") as f:
        content = f.read()
    content = content.replace("RhockstarAdmin2026", "process.env.ADMIN_PASSWORD || 'fallback-pass-change-me'")
    with open("scripts/createAdmin.js", "w", encoding="utf-8") as f:
        f.write(content)
except FileNotFoundError:
    pass
