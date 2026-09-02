import os

with open("src/app/(dashboard)/messages/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

old_block = """                      <p className="text-[10px] text-slate-400 mt-2 leading-tight">
                        {activeCommunity.accessType === 'private' ? 'New members must request and be approved.' :
                         activeCommunity.accessType === 'locked' ? 'No new members can request or join.' :
                         'Anyone can join instantly.'}
                      </p>
                    </div>
                  </div>
                )}"""

new_block = """                      <p className="text-[10px] text-slate-400 mt-2 leading-tight">
                        {activeCommunity.accessType === 'private' ? 'New members must request and be approved.' :
                         activeCommunity.accessType === 'locked' ? 'No new members can request or join.' :
                         'Anyone can join instantly.'}
                      </p>
                    </div>
                    
                    <div className="pt-3 border-t border-white/10 space-y-2 mt-3">
                      <h4 className="text-xs font-bold text-white mb-2">Edit Details</h4>
                      <input 
                         type="text" 
                         defaultValue={activeCommunity.name}
                         onBlur={async (e) => {
                             if(e.target.value && e.target.value !== activeCommunity.name) {
                                 await updateCommunity(activeCommunity.id, { name: e.target.value });
                                 toast.success("Community name updated");
                             }
                         }}
                         className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:border-brand focus:outline-none" 
                      />
                      <input 
                         type="text" 
                         defaultValue={activeCommunity.category}
                         onBlur={async (e) => {
                             if(e.target.value && e.target.value !== activeCommunity.category) {
                                 await updateCommunity(activeCommunity.id, { category: e.target.value });
                                 toast.success("Community category updated");
                             }
                         }}
                         className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:border-brand focus:outline-none" 
                      />
                    </div>
                    
                    <div className="pt-3 border-t border-white/10 mt-3">
                      <button 
                        onClick={async () => {
                           if(window.confirm("Are you sure you want to delete this community? This action cannot be undone.")) {
                               const res = await deleteCommunity(activeCommunity.id);
                               if(res.success) {
                                  setActiveCommunity(null);
                                  setIsCommunityInfoOpen(false);
                                  toast.success("Community deleted");
                               } else {
                                  toast.error("Failed to delete community");
                               }
                           }
                        }}
                        className="w-full py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/30 rounded-xl text-xs font-bold transition-colors"
                      >
                         Delete Community
                      </button>
                    </div>

                  </div>
                )}"""

content = content.replace(old_block, new_block)

with open("src/app/(dashboard)/messages/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
