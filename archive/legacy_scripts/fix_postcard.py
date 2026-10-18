with open("src/components/feed/PostCard.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    'className="neo-card p-3.5 sm:p-4 mb-3.5 border border-white/5 bg-slate-900/60 rounded-2xl hover:border-white/10 transition-all duration-300"',
    'className="neo-card p-4 sm:p-4 mb-2 sm:mb-3.5 border-y sm:border border-white/5 bg-slate-900/60 rounded-none sm:rounded-2xl hover:border-white/10 transition-all duration-300"'
)

with open("src/components/feed/PostCard.tsx", "w", encoding="utf-8") as f:
    f.write(content)
