"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { getAllUsers, UserBasic } from "@/lib/services/users";
import { 
  ConnectionRequest, 
  getUserConnections, 
  sendConnectionRequest, 
  updateConnectionStatus 
} from "@/lib/services/connections";
import { Loader2, Users, UserPlus, Check, X, Search, Lock, Crown, Filter } from "lucide-react";
import Link from "next/link";
import PremiumLockModal from "@/components/ui/PremiumLockModal";

export default function NetworkPage() {
  const { profile } = useAuthStore();
  
  const [users, setUsers] = useState<UserBasic[]>([]);
  const [connections, setConnections] = useState<ConnectionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [premiumLockOpen, setPremiumLockOpen] = useState(false);

  const fetchData = async () => {
    if (!profile?.uid) return;
    setLoading(true);
    
    const [usersRes, connRes] = await Promise.all([
      getAllUsers(),
      getUserConnections(profile.uid)
    ]);

    if (usersRes.success && usersRes.users) {
      // Filter out self
      setUsers(usersRes.users.filter(u => u.uid !== profile.uid));
    }
    
    if (connRes.success && connRes.connections) {
      setConnections(connRes.connections);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    const initFetch = async () => {
      if (!profile?.uid) return;
      setLoading(true);
      const [usersRes, connRes] = await Promise.all([
        getAllUsers(),
        getUserConnections(profile.uid)
      ]);
      if (usersRes.success && usersRes.users) {
        setUsers(usersRes.users.filter(u => u.uid !== profile.uid));
      }
      if (connRes.success && connRes.connections) {
        setConnections(connRes.connections);
      }
      setLoading(false);
    };
    initFetch();
  }, [profile?.uid]);

  const handleConnect = async (toUserId: string) => {
    if (!profile?.uid) return;
    setActionLoading(toUserId);
    await sendConnectionRequest(profile.uid, toUserId);
    await fetchData();
    setActionLoading(null);
  };

  const handleRespond = async (connectionId: string, status: 'accepted' | 'rejected') => {
    setActionLoading(connectionId);
    await updateConnectionStatus(connectionId, status);
    await fetchData();
    setActionLoading(null);
  };

  if (!profile || loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-100px)]">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </div>
    );
  }

  // Filter users based on search
  const filteredUsers = users.filter(u => 
    u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group users based on connection status
  const pendingReceived = connections.filter(c => c.toUserId === profile.uid && c.status === 'pending');
  const accepted = connections.filter(c => c.status === 'accepted');

  const getStatusForUser = (userId: string) => {
    const conn = connections.find(c => c.fromUserId === userId || c.toUserId === userId);
    if (!conn) return 'none';
    if (conn.status === 'accepted') return 'connected';
    if (conn.status === 'pending' && conn.fromUserId === profile.uid) return 'sent';
    if (conn.status === 'pending' && conn.toUserId === profile.uid) return 'received';
    return 'none';
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-8 space-y-8">
      
      {/* HEADER & SEARCH */}
      <div className="neo-card p-6 rounded-3xl flex flex-col md:flex-row gap-6 justify-between items-center bg-slate-900/60 backdrop-blur-xl border border-white/5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand/20 to-brand-purple/20 flex items-center justify-center border border-white/5">
            <Users className="w-7 h-7 text-brand" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Your Network</h1>
            <p className="text-slate-400 font-medium">{accepted.length} Connections</p>
          </div>
        </div>
        
        <div className="relative group w-full md:w-96">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-brand transition-colors" />
          <input 
            type="text"
            placeholder="Search professionals..."
            className="w-full bg-slate-800/50 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/50 transition-all shadow-inner"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* PREMIUM FILTERS BAR */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 shrink-0">
          <Filter className="w-3.5 h-3.5 text-amber-400" /> Filters:
        </span>
        {[
          "Verified Gold Badge Only",
          "Senior Tech & Executive Roles",
          "Highest Profile Views",
          "Active Hiring Managers"
        ].map((filterLabel, idx) => (
          <button
            key={idx}
            onClick={() => setPremiumLockOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900/80 border border-amber-500/30 text-amber-300 text-xs font-bold hover:bg-amber-500/10 transition-all flex items-center gap-1.5 shrink-0 group"
          >
            <Lock className="w-3 h-3 text-amber-400 group-hover:scale-110 transition-transform" />
            <span>{filterLabel}</span>
          </button>
        ))}
      </div>

      {/* PENDING INVITATIONS */}
      {pendingReceived.length > 0 && !searchQuery && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="w-2 h-8 bg-brand rounded-full"></span>
            Pending Invitations
            <span className="bg-brand/20 text-brand px-3 py-0.5 rounded-full text-sm">{pendingReceived.length}</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingReceived.map(conn => {
              const user = users.find(u => u.uid === conn.fromUserId);
              if (!user) return null;
              
              return (
                <div key={conn.id} className="neo-card p-5 rounded-2xl flex items-center gap-4 bg-slate-900/40 border border-white/5 hover:border-brand/30 transition-colors">
                  <Link href={`/profile?uid=${user.uid}`} className="w-14 h-14 rounded-full bg-gradient-to-br from-brand to-brand-purple flex items-center justify-center shadow-lg flex-shrink-0 hover:ring-2 hover:ring-brand transition-all">
                    <span className="text-xl font-bold text-white">{user.avatar}</span>
                  </Link>
                  <Link href={`/profile?uid=${user.uid}`} className="flex-1 min-w-0 group block">
                    <h3 className="font-bold text-white truncate group-hover:text-brand transition-colors">{user.fullName}</h3>
                    <p className="text-sm text-slate-400 truncate group-hover:text-white transition-colors">@{user.username}</p>
                  </Link>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleRespond(conn.id, 'accepted')}
                      disabled={actionLoading === conn.id}
                      className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all"
                    >
                      {actionLoading === conn.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                    </button>
                    <button 
                      onClick={() => handleRespond(conn.id, 'rejected')}
                      disabled={actionLoading === conn.id}
                      className="w-10 h-10 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* DISCOVER PEOPLE */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="w-2 h-8 bg-brand-purple rounded-full"></span>
          {searchQuery ? 'Search Results' : 'Discover Professionals'}
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredUsers.length > 0 ? filteredUsers.map(user => {
            const status = getStatusForUser(user.uid);
            
            return (
              <div key={user.uid} className="neo-card p-6 rounded-3xl bg-slate-900/60 border border-white/5 flex flex-col items-center text-center group hover:-translate-y-1 transition-all duration-300">
                <Link href={`/profile?uid=${user.uid}`} className="flex flex-col items-center w-full block group/profile">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-brand to-brand-purple flex items-center justify-center shadow-lg mb-4 ring-4 ring-slate-900 group-hover/profile:ring-brand/50 transition-all">
                    <span className="text-3xl font-bold text-white">{user.avatar}</span>
                  </div>
                  
                  <h3 className="font-bold text-lg text-white mb-1 truncate w-full group-hover/profile:text-brand transition-colors">{user.fullName}</h3>
                  <p className="text-sm text-slate-400 mb-6 group-hover/profile:text-white transition-colors">@{user.username}</p>
                </Link>
                
                {status === 'none' && (
                  <button 
                    onClick={() => handleConnect(user.uid)}
                    disabled={actionLoading === user.uid}
                    className="w-full py-3 rounded-xl bg-brand/10 text-brand font-bold hover:bg-brand hover:text-white transition-all flex items-center justify-center gap-2"
                  >
                    {actionLoading === user.uid ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                      <>
                        <UserPlus className="w-5 h-5" />
                        Connect
                      </>
                    )}
                  </button>
                )}

                {status === 'sent' && (
                  <button disabled className="w-full py-3 rounded-xl bg-slate-800 text-slate-400 font-bold flex items-center justify-center gap-2 cursor-not-allowed">
                    Pending
                  </button>
                )}

                {status === 'connected' && (
                  <Link href="/messages" className="w-full py-3 rounded-xl bg-emerald-500/10 text-emerald-500 font-bold hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center gap-2">
                    Message
                  </Link>
                )}

                {status === 'received' && (
                  <div className="w-full py-3 rounded-xl bg-brand-purple/10 text-brand-purple font-bold flex items-center justify-center gap-2">
                    Review Request
                  </div>
                )}
              </div>
            );
          }) : (
            <div className="col-span-full py-12 text-center text-slate-400 neo-card border border-white/5 rounded-3xl">
              <Users className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <p className="font-medium text-lg text-white">No professionals found</p>
              <p>Try adjusting your search terms.</p>
            </div>
          )}
        </div>
      </section>
      
      <PremiumLockModal
        isOpen={premiumLockOpen}
        onClose={() => setPremiumLockOpen(false)}
        title="Unlock Advanced Professional Search"
        description="Filter professionals by Verified Badges, Executive Seniority, High Industry Ratings, and Active Hiring Status."
      />
    </div>
  );
}
