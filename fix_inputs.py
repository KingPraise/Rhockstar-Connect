import os

with open("src/app/(dashboard)/messages/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Replace DM input
old_dm_input = """            <input
              type="text"
              placeholder="Write a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 bg-slate-800 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-brand"
            />"""
new_dm_input = """            <textarea
              rows={1}
              placeholder="Write a message..."
              value={newMessage}
              onChange={(e) => {
                 setNewMessage(e.target.value);
                 e.target.style.height = 'auto';
                 e.target.style.height = Math.min(e.target.scrollHeight, 150) + 'px';
                 if (!e.target.value) e.target.style.height = 'auto';
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey) {
                  e.preventDefault();
                  handleSendMessage(e as any);
                  e.currentTarget.style.height = 'auto';
                }
              }}
              className="flex-1 bg-slate-800 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-brand resize-none min-h-[46px] max-h-[150px] overflow-y-auto"
            />"""

content = content.replace(old_dm_input, new_dm_input)

# Replace Community input
old_comm_input = """                  <input
                    type="text"
                    placeholder={`Message ${activeCommunity.name}...`}
                    value={newCommunityMessageText}
                    onChange={(e) => setNewCommunityMessageText(e.target.value)}
                    className="flex-1 bg-slate-800 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-brand shadow-inner"
                  />"""
new_comm_input = """                  <textarea
                    rows={1}
                    placeholder={`Message ${activeCommunity.name}...`}
                    value={newCommunityMessageText}
                    onChange={(e) => {
                       setNewCommunityMessageText(e.target.value);
                       e.target.style.height = 'auto';
                       e.target.style.height = Math.min(e.target.scrollHeight, 150) + 'px';
                       if (!e.target.value) e.target.style.height = 'auto';
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey) {
                        e.preventDefault();
                        handleSendCommunityMessage(e as any);
                        e.currentTarget.style.height = 'auto';
                      }
                    }}
                    className="flex-1 bg-slate-800 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-brand shadow-inner resize-none min-h-[46px] max-h-[150px] overflow-y-auto"
                  />"""

content = content.replace(old_comm_input, new_comm_input)

with open("src/app/(dashboard)/messages/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
