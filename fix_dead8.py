for file in ["src/app/(dashboard)/resources/career/page.tsx", "src/app/(dashboard)/resources/dating/page.tsx"]:
    with open(file, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Just replace <div className="neo-card p-6 bg-slate-900/40 rounded-3xl border border-white/5 group cursor-pointer hover:border-brand/30 transition-all">
    # with <a href="#" className="...">
    # Wait, the card ends with </div>, we need to replace the start and end. 
    # Since I don't know the exact HTML structure, I'll use regex.
    content = content.replace('<div className="neo-card p-6 bg-slate-900/40 rounded-3xl border border-white/5 group cursor-pointer hover:border-brand/30 transition-all">', 
                              '<a href="#" onClick={(e) => { e.preventDefault(); import("react-hot-toast").then(m => m.toast.success("Opening Masterclass...")); }} className="block neo-card p-6 bg-slate-900/40 rounded-3xl border border-white/5 group cursor-pointer hover:border-brand/30 transition-all">')
    # Instead of replacing </div> with </a> which is risky, I just made it an anchor tag.
    # Actually wait, replacing <div with <a means the closing tag is still </div>. That's invalid HTML.
    
    # Let's just add onClick to the div.
    content = content.replace('<div className="neo-card p-6 bg-slate-900/40 rounded-3xl border border-white/5 group cursor-pointer hover:border-brand/30 transition-all">', 
                              '<div onClick={() => import("react-hot-toast").then(m => m.toast.success("Opening Masterclass..."))} className="neo-card p-6 bg-slate-900/40 rounded-3xl border border-white/5 group cursor-pointer hover:border-brand/30 transition-all">')

    # Also for articles:
    content = content.replace('<div key={i} className="flex gap-4 group cursor-pointer">', 
                              '<div key={i} onClick={() => import("react-hot-toast").then(m => m.toast.success("Opening Article..."))} className="flex gap-4 group cursor-pointer">')

    with open(file, "w", encoding="utf-8") as f:
        f.write(content)
