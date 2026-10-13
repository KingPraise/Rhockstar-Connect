with open("src/app/(dashboard)/messages/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    'className="flex-1 flex flex-col md:flex-row max-w-[1600px] mx-auto w-full h-full min-h-[calc(100vh-12rem)] gap-2 md:gap-4 p-2 md:p-4 lg:p-6 lg:gap-6"',
    'className="flex-1 flex flex-col md:flex-row max-w-[1600px] mx-auto w-full h-full min-h-[calc(100vh-12rem)] gap-0 sm:gap-2 md:gap-4 p-0 sm:p-2 md:p-4 lg:p-6 lg:gap-6"'
)

with open("src/app/(dashboard)/messages/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
