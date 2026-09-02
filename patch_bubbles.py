import os

with open("src/app/(dashboard)/messages/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Modify DM bubble
old_dm_bubble = """<div className={`rounded-2xl px-4 py-2.5 space-y-1 relative shadow-md transition-all ${isMe ? "bg-gradient-to-r from-brand to-brand-purple text-slate-950 font-medium rounded-br-xs shadow-brand/10" : "bg-slate-800/90 text-white border border-white/10 rounded-bl-xs"}`}>"""
new_dm_bubble = """<div 
  onClick={() => !isEditingThis && !msg.isDeleted && setOpenMessageMenuId(isMenuOpen ? null : msg.id)}
  className={`rounded-2xl px-4 py-2.5 space-y-1 relative shadow-md transition-all cursor-pointer ${isMe ? "bg-gradient-to-r from-brand to-brand-purple text-slate-950 font-medium rounded-br-xs shadow-brand/10" : "bg-slate-800/90 text-white border border-white/10 rounded-bl-xs"}`}>"""

content = content.replace(old_dm_bubble, new_dm_bubble)

# 2. Modify Community bubble
old_comm_bubble = """<div className={`rounded-2xl px-4 py-2.5 space-y-1 shadow-md transition-all ${isMe ? "bg-gradient-to-r from-brand to-brand-purple text-slate-950 rounded-br-sm" : "bg-slate-800 border border-white/5 rounded-bl-sm"}`}>"""
new_comm_bubble = """<div 
  onClick={() => !isEditingThis && !msg.isDeleted && setOpenMessageMenuId(isMenuOpen ? null : msg.id)}
  className={`rounded-2xl px-4 py-2.5 space-y-1 shadow-md transition-all cursor-pointer ${isMe ? "bg-gradient-to-r from-brand to-brand-purple text-slate-950 rounded-br-sm" : "bg-slate-800 border border-white/5 rounded-bl-sm"}`}>"""

content = content.replace(old_comm_bubble, new_comm_bubble)

# 3. Add Copy and Forward to DM Dropdown
old_dm_dropdown = """                                <button
                                  onClick={async () => {
                                    if (confirm(isMe ? "Delete message for everyone?" : "Delete message for you?")) {
                                      await deleteMessage(activeChat.id, msg.id, profile.uid, isMe ? 'forEveryone' : 'forMe');
                                      toast.success("Message deleted");
                                    }
                                    setOpenMessageMenuId(null);
                                  }}
                                  className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-slate-800 text-rose-400"
                                >
                                  <Trash2 className="w-3.5 h-3.5" /> Delete
                                </button>
                              </div>"""
new_dm_dropdown = """                                <button
                                  onClick={() => { navigator.clipboard.writeText(msg.text); toast.success("Copied to clipboard"); setOpenMessageMenuId(null); }}
                                  className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-slate-800 text-slate-300"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg> Copy
                                </button>
                                <button
                                  onClick={() => { toast.success("Forwarding coming soon!"); setOpenMessageMenuId(null); }}
                                  className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-slate-800 text-slate-300"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg> Forward
                                </button>
                                <button
                                  onClick={async () => {
                                    if (window.confirm(isMe ? "Delete message for everyone?" : "Delete message for you?")) {
                                      await deleteMessage(activeChat.id, msg.id, profile.uid, isMe ? 'forEveryone' : 'forMe');
                                      toast.success("Message deleted");
                                    }
                                    setOpenMessageMenuId(null);
                                  }}
                                  className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-slate-800 text-rose-400"
                                >
                                  <Trash2 className="w-3.5 h-3.5" /> Delete
                                </button>
                              </div>"""
content = content.replace(old_dm_dropdown, new_dm_dropdown)

# 4. Add Copy and Forward to Community Dropdown
old_comm_dropdown = """                                    <button
                                      onClick={async () => {
                                        if (confirm("Delete message for everyone?")) {
                                          await deleteCommunityMessage(activeCommunity.id, msg.id);
                                          toast.success("Message deleted");
                                        }
                                        setOpenMessageMenuId(null);
                                      }}
                                      className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-slate-800 text-rose-400"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" /> Delete
                                    </button>
                                  )}
                                </div>"""
new_comm_dropdown = """                                    <button
                                      onClick={() => { navigator.clipboard.writeText(msg.text); toast.success("Copied to clipboard"); setOpenMessageMenuId(null); }}
                                      className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-slate-800 text-slate-300"
                                    >
                                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg> Copy
                                    </button>
                                    <button
                                      onClick={() => { toast.success("Forwarding coming soon!"); setOpenMessageMenuId(null); }}
                                      className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-slate-800 text-slate-300"
                                    >
                                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg> Forward
                                    </button>
                                    <button
                                      onClick={async () => {
                                        if (window.confirm("Delete message for everyone?")) {
                                          await deleteCommunityMessage(activeCommunity.id, msg.id);
                                          toast.success("Message deleted");
                                        }
                                        setOpenMessageMenuId(null);
                                      }}
                                      className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-slate-800 text-rose-400"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" /> Delete
                                    </button>
                                  )}
                                </div>"""
content = content.replace(old_comm_dropdown, new_comm_dropdown)

with open("src/app/(dashboard)/messages/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
