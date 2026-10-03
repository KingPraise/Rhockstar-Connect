with open("src/components/gamification/LeaderboardView.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    'className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar"',
    'className="flex-1 overflow-y-auto p-0 sm:p-6 space-y-4 sm:space-y-6 custom-scrollbar"'
)
content = content.replace(
    'className="p-6 rounded-3xl bg-gradient-to-r from-brand/20 via-purple-600/20 to-slate-900 border border-brand/20 relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl"',
    'className="p-4 sm:p-6 rounded-none sm:rounded-3xl bg-gradient-to-r from-brand/20 via-purple-600/20 to-slate-900 border-y sm:border border-brand/20 relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl"'
)
content = content.replace(
    'className="p-4 rounded-3xl bg-slate-900/80 border border-white/5 space-y-2 shadow-xl"',
    'className="p-2 sm:p-4 rounded-none sm:rounded-3xl bg-slate-900/80 border-y sm:border border-white/5 space-y-2 shadow-xl"'
)
# Top 3 podium styling
content = content.replace(
    'className="order-2 sm:order-1 p-5 rounded-3xl bg-slate-900/90 border border-slate-700/60 flex flex-col items-center text-center relative shadow-xl transform hover:-translate-y-1 transition-transform"',
    'className="order-2 sm:order-1 p-4 sm:p-5 rounded-none sm:rounded-3xl bg-slate-900/90 border-y sm:border border-slate-700/60 flex flex-col items-center text-center relative shadow-xl transform hover:-translate-y-1 transition-transform"'
)
content = content.replace(
    'className="order-1 sm:order-2 p-6 rounded-3xl bg-gradient-to-b from-amber-500/20 to-slate-900 border-2 border-amber-500/40 flex flex-col items-center text-center relative shadow-2xl transform hover:-translate-y-1 transition-transform"',
    'className="order-1 sm:order-2 p-5 sm:p-6 rounded-none sm:rounded-3xl bg-gradient-to-b from-amber-500/20 to-slate-900 border-y-2 sm:border-2 border-amber-500/40 flex flex-col items-center text-center relative shadow-2xl transform hover:-translate-y-1 transition-transform"'
)
content = content.replace(
    'className="order-3 p-5 rounded-3xl bg-slate-900/90 border border-amber-800/40 flex flex-col items-center text-center relative shadow-xl transform hover:-translate-y-1 transition-transform"',
    'className="order-3 p-4 sm:p-5 rounded-none sm:rounded-3xl bg-slate-900/90 border-y sm:border border-amber-800/40 flex flex-col items-center text-center relative shadow-xl transform hover:-translate-y-1 transition-transform"'
)

with open("src/components/gamification/LeaderboardView.tsx", "w", encoding="utf-8") as f:
    f.write(content)
