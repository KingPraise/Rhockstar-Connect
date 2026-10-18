with open("src/app/(dashboard)/messages/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    'className="flex-1 flex flex-col neo-card bg-slate-900/60 border border-white/5 rounded-3xl overflow-hidden shadow-2xl"',
    'className="flex-1 flex flex-col neo-card bg-slate-900/60 border-y sm:border border-white/5 rounded-none sm:rounded-3xl overflow-hidden shadow-2xl"'
)
content = content.replace(
    'className="hidden md:flex flex-1 flex-col items-center justify-center neo-card bg-slate-900/60 border border-white/5 rounded-3xl p-8 text-center shadow-2xl"',
    'className="hidden md:flex flex-1 flex-col items-center justify-center neo-card bg-slate-900/60 border border-white/5 rounded-none sm:rounded-3xl p-8 text-center shadow-2xl"'
)

with open("src/app/(dashboard)/messages/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
