import os

with open("src/app/(dashboard)/messages/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Fix import
content = content.replace(
    "  JoinRequestDetail\n} from \"@/lib/services/communities\";",
    "  JoinRequestDetail,\n  deleteCommunity,\n  updateCommunity\n} from \"@/lib/services/communities\";"
)

with open("src/app/(dashboard)/messages/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
