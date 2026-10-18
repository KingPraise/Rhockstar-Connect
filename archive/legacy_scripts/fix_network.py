with open("src/app/(dashboard)/network/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    'className="flex-1 max-w-[1600px] mx-auto w-full p-4 lg:p-8 flex flex-col lg:flex-row gap-8"',
    'className="flex-1 max-w-[1600px] mx-auto w-full p-0 sm:p-4 lg:p-8 flex flex-col lg:flex-row gap-4 sm:gap-8"'
)
content = content.replace(
    'className="flex-1 max-w-[1600px] mx-auto w-full p-4 lg:p-8 flex gap-8"',
    'className="flex-1 max-w-[1600px] mx-auto w-full p-0 sm:p-4 lg:p-8 flex gap-4 sm:gap-8"'
)
content = content.replace(
    'className="neo-card p-5 rounded-2xl bg-slate-900/60 border border-white/5 flex flex-col group hover:-translate-y-1 transition-all duration-300"',
    'className="neo-card p-5 rounded-none sm:rounded-2xl bg-slate-900/60 border-y sm:border border-white/5 flex flex-col group hover:-translate-y-1 transition-all duration-300"'
)

with open("src/app/(dashboard)/network/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
