with open("src/components/profile/ProfileHeader.tsx", "r", encoding="utf-8") as f:
    content = f.read()

old_join = """          <div className="flex items-center gap-1.5 text-slate-400 py-1 px-2 md:py-1.5 md:px-4 rounded-full">
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span>Joined {format(new Date(), "MMMM yyyy")}</span>
          </div>"""

new_join = """          <div className="flex items-center gap-1.5 text-slate-400 py-1 px-2 md:py-1.5 md:px-4 rounded-full">
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span>Joined {profile?.createdAt ? format(new Date(profile.createdAt), "MMMM yyyy") : "Recently"}</span>
          </div>"""

content = content.replace(old_join, new_join)

with open("src/components/profile/ProfileHeader.tsx", "w", encoding="utf-8") as f:
    f.write(content)
