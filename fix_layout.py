with open("src/app/(dashboard)/layout.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("w-full p-4 pt-20 pb-24 md:p-8", "w-full p-0 pt-20 pb-24 md:p-8")

with open("src/app/(dashboard)/layout.tsx", "w", encoding="utf-8") as f:
    f.write(content)
