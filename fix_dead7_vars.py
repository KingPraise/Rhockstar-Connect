with open("src/app/(dashboard)/company/[username]/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("companyUser.uid", "company.uid").replace("companyUser.fullName", "company.fullName")

with open("src/app/(dashboard)/company/[username]/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
