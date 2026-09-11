for file in ["src/app/(dashboard)/resources/career/page.tsx", "src/app/(dashboard)/resources/dating/page.tsx"]:
    with open(file, "r", encoding="utf-8") as f:
        content = f.read()
    
    content = content.replace('<a href="#" onClick={(e) => { e.preventDefault(); import("react-hot-toast").then(m => m.toast.success("Opening Masterclass...")); }} className="block neo-card p-6 bg-slate-900/40 rounded-3xl border border-white/5 group cursor-pointer hover:border-brand/30 transition-all">',
                              '<div onClick={(e) => { e.preventDefault(); import("react-hot-toast").then(m => m.toast.success("Opening Masterclass...")); }} className="neo-card p-6 bg-slate-900/40 rounded-3xl border border-white/5 group cursor-pointer hover:border-brand/30 transition-all">')

    with open(file, "w", encoding="utf-8") as f:
        f.write(content)
