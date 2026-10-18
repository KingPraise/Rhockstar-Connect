with open("src/app/(dashboard)/network/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Add removeConnection import
if "removeConnection" not in content:
    content = content.replace("updateConnectionStatus \n} from \"@/lib/services/connections\";", "updateConnectionStatus,\n  removeConnection\n} from \"@/lib/services/connections\";")
    # Handle single line import if it is
    content = content.replace("updateConnectionStatus } from \"@/lib/services/connections\";", "updateConnectionStatus, removeConnection } from \"@/lib/services/connections\";")

# Add handleRemoveRequest function
handler = """  const handleRespond = async (connectionId: string, status: 'accepted' | 'rejected') => {
"""

new_handler = """  const handleRemoveRequest = async (connectionId: string) => {
    setActionLoading(prev => [...prev, connectionId]);
    const res = await removeConnection(connectionId);
    if (res.success) {
      toast.success("Request cancelled");
      await fetchData();
    } else {
      toast.error(res.error || "Failed to cancel request");
    }
    setActionLoading(prev => prev.filter(id => id !== connectionId));
  };

  const handleRespond = async (connectionId: string, status: 'accepted' | 'rejected') => {
"""
content = content.replace(handler, new_handler)

# Update the sent status button
old_button = """                  {status === 'sent' && (
                    <button disabled className="w-full py-2 rounded-xl bg-slate-800/50 text-slate-500 font-bold flex items-center justify-center gap-2 cursor-not-allowed text-xs border border-white/5">
                      Request Pending
                    </button>
                  )}"""

new_button = """                  {status === 'sent' && (
                    <button 
                      onClick={() => {
                        const sentConn = connections.find(c => c.fromUserId === profile?.uid && c.toUserId === user.uid && c.status === 'pending');
                        if (sentConn) handleRemoveRequest(sentConn.id);
                      }}
                      disabled={actionLoading.some(id => connections.find(c => c.id === id && c.toUserId === user.uid))}
                      className="w-full py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 font-bold transition-all flex items-center justify-center gap-2 text-xs border border-red-500/20"
                    >
                      <X className="w-3.5 h-3.5" />
                      Cancel Request
                    </button>
                  )}"""
content = content.replace(old_button, new_button)

with open("src/app/(dashboard)/network/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
