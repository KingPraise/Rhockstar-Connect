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
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Loader2, Users, UserPlus, Check, X, Search, Lock, Filter, Inbox, Send, ChevronRight } from "lucide-react";
import Link from "next/link";
import PremiumLockModal from "@/components/ui/PremiumLockModal";
import toast from "react-hot-toast";

type TabId = 'discover' | 'my-connections' | 'invitations' | 'sent-requests';

export default function NetworkPage() {
  const { profile } = useAuthStore();
  
  const [users, setUsers] = useState<UserBasic[]>([]);
  const [connections, setConnections] = useState<ConnectionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoading, setActionLoading] = useState<string[]>([]);
  const [premiumLockOpen, setPremiumLockOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('discover');

  const isPremium = profile?.subscriptionTier === 'pro' || profile?.subscriptionTier === 'elite';

  const handlePremiumFilterClick = () => {
    if (isPremium) {
      toast.success("This premium filter will be available soon!", { icon: "✨", style: { background: '#334155', color: '#fff' } });
    } else {
      setPremiumLockOpen(true);
    }
  };

  const fetchData = async () => {
    if (!profile?.uid) return;
    
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
    setActionLoading(prev => [...prev, toUserId]);
    await sendConnectionRequest(profile.uid, toUserId);
    await fetchData();
    setActionLoading(prev => prev.filter(id => id !== toUserId));
  };

  const handleRespond = async (connectionId: string, status: 'accepted' | 'rejected') => {
    setActionLoading(prev => [...prev, connectionId]);
    await updateConnectionStatus(connectionId, status);
    await fetchData();
    setActionLoading(prev => prev.filter(id => id !== connectionId));
  };

  const getStatusForUser = (userId: string) => {
    const userConns = connections.filter(c => c.fromUserId === userId || c.toUserId === userId);
    if (userConns.length === 0) return 'none';
    
    if (userConns.some(c => c.status === 'accepted')) return 'connected';
    
    const pendingSent = userConns.find(c => c.status === 'pending' && c.fromUserId === profile?.uid);
    if (pendingSent) return 'sent';
    
    const pendingReceived = userConns.find(c => c.status === 'pending' && c.toUserId === profile?.uid);
    if (pendingReceived) return 'received';
    
    return 'none';
  };

  if (!profile || loading) {
    return (
      <div className="flex-1 max-w-[1600px] mx-auto w-full p-4 lg:p-8 flex gap-8">
        {/* Skeleton Sidebar */}
        <div className="hidden lg:block w-64 shrink-0 space-y-4">
          <Skeleton className="h-12 w-full rounded-2xl" />
          <Skeleton className="h-12 w-full rounded-2xl" />
          <Skeleton className="h-12 w-full rounded-2xl" />
        </div>
        {/* Skeleton Content */}
        <div className="flex-1">
          <div className="mb-8">
            <Skeleton className="h-10 w-48 mb-2" />
            <Skeleton className="h-6 w-full max-w-md" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="neo-card p-5 rounded-2xl flex items-center gap-4 bg-slate-900/40">
                <Skeleton className="w-14 h-14 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <Skeleton className="w-10 h-10 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Filter users based on search
  const searchFilteredUsers = users.filter(u => 
    u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group users based on connection status
  const pendingReceived = connections.filter(c => c.toUserId === profile.uid && c.status === 'pending');
  const pendingSent = connections.filter(c => c.fromUserId === profile.uid && c.status === 'pending');
  const accepted = connections.filter(c => c.status === 'accepted');

  // Filter for currently active tab
  const getTabUsers = () => {
    switch(activeTab) {
      case 'my-connections':
        return searchFilteredUsers.filter(u => getStatusForUser(u.uid) === 'connected');
      case 'invitations':
        return searchFilteredUsers.filter(u => getStatusForUser(u.uid) === 'received');
      case 'sent-requests':
        return searchFilteredUsers.filter(u => getStatusForUser(u.uid) === 'sent');
      case 'discover':
      default:
        // Exclude connected or pending if we just want "discover" (or maybe we show all non-connected)
        return searchFilteredUsers.filter(u => getStatusForUser(u.uid) === 'none');
    }
  };

  const displayedUsers = getTabUsers();

  const tabs = [
    { id: 'discover', label: 'People You May Know', icon: UserPlus, count: null },
    { id: 'my-connections', label: 'My Connections', icon: Users, count: accepted.length },
    { id: 'invitations', label: 'Invitations', icon: Inbox, count: pendingReceived.length },
    { id: 'sent-requests', label: 'Sent Requests', icon: Send, count: pendingSent.length },
  ];

  return (
    <div className="flex-1 max-w-[1600px] mx-auto w-full p-4 lg:p-8 flex flex-col lg:flex-row gap-8">
      
      {/* SIDEBAR (Desktop) & SCROLLABLE BAR (Mobile) */}
      <div className="w-full lg:w-72 shrink-0">
        <div className="sticky top-24 neo-card rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-white/5 overflow-hidden">
          <div className="p-6 pb-2 hidden lg:block">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Connections</h1>
            <p className="text-slate-400 text-sm mt-1">Manage your professional network</p>
          </div>
          
          <div className="flex lg:flex-col overflow-x-auto no-scrollbar p-2 lg:p-4 gap-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabId)}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all whitespace-nowrap lg:whitespace-normal shrink-0 ${
                  activeTab === tab.id 
                    ? 'bg-brand/10 text-brand font-bold border border-brand/20' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50 border border-transparent'
                }`}
              >
                <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-brand' : 'text-slate-500'}`} />
                <span className="flex-1 text-left">{tab.label}</span>
                {tab.count !== null && tab.count > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    activeTab === tab.id ? 'bg-brand text-white' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 space-y-6">
        {/* HEADER & SEARCH */}
        <div className="neo-card p-6 rounded-3xl flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-900/60 backdrop-blur-xl border border-white/5">
          <div className="w-full">
            <div className="relative group w-full">
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
        </div>

        {/* PREMIUM FILTERS BAR */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5 text-amber-400" /> Filters:
          </span>
          {[
            "Verified Gold Badge Only",
            "Senior Tech & Executive Roles",
            "Highest Profile Views"
          ].map((filterLabel, idx) => (
            <button
              key={idx}
              onClick={handlePremiumFilterClick}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900/80 border border-amber-500/30 text-amber-300 text-xs font-bold hover:bg-amber-500/10 transition-all flex items-center gap-1.5 shrink-0 group"
            >
              <Lock className="w-3 h-3 text-amber-400 group-hover:scale-110 transition-transform" />
              <span>{filterLabel}</span>
            </button>
          ))}
        </div>

        {/* TAB TITLE */}
        <div className="flex items-center gap-2 pb-2">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="w-2 h-8 bg-brand rounded-full"></span>
            {tabs.find(t => t.id === activeTab)?.label}
          </h2>
          <span className="bg-brand/20 text-brand px-3 py-0.5 rounded-full text-sm font-bold">
            {displayedUsers.length}
          </span>
        </div>

        {/* USERS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
          {displayedUsers.length > 0 ? displayedUsers.map(user => {
            const status = getStatusForUser(user.uid);
            
            // For Invitations tab, we need the connection ID to accept/reject
            const receivedConn = connections.find(c => c.fromUserId === user.uid && c.toUserId === profile.uid && c.status === 'pending');
            
            return (
              <div key={user.uid} className="neo-card p-5 rounded-2xl bg-slate-900/60 border border-white/5 flex flex-col group hover:-translate-y-1 transition-all duration-300">
                <Link href={`/profile?uid=${user.uid}`} className="flex items-start gap-4 w-full group/profile mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand to-brand-purple flex items-center justify-center shadow-lg shrink-0 ring-2 ring-transparent group-hover/profile:ring-brand/50 transition-all">
                    <span className="text-xl font-bold text-white">{user.avatar}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white truncate group-hover/profile:text-brand transition-colors">{user.fullName}</h3>
                    <p className="text-sm text-slate-400 truncate group-hover/profile:text-white transition-colors">@{user.username}</p>
                    {user.headline && (
                      <p className="text-xs text-slate-500 truncate mt-1">{user.headline}</p>
                    )}
                  </div>
                </Link>
                
                <div className="mt-auto">
                  {status === 'none' && (
                    <button 
                      onClick={() => handleConnect(user.uid)}
                      disabled={actionLoading.includes(user.uid)}
                      className="w-full py-2.5 rounded-xl bg-brand/10 text-brand font-bold hover:bg-brand hover:text-white transition-all flex items-center justify-center gap-2 text-sm"
                    >
                      {actionLoading.includes(user.uid) ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                        <>
                          <UserPlus className="w-4 h-4" />
                          Connect
                        </>
                      )}
                    </button>
                  )}

                  {status === 'sent' && (
                    <button disabled className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-400 font-bold flex items-center justify-center gap-2 cursor-not-allowed text-sm">
                      Request Pending
                    </button>
                  )}

                  {status === 'connected' && (
                    <Link href="/messages" className="w-full py-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 font-bold hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center gap-2 text-sm">
                      Message
                    </Link>
                  )}

                  {status === 'received' && receivedConn && (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleRespond(receivedConn.id, 'accepted')}
                        disabled={actionLoading.includes(receivedConn.id)}
                        className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 text-sm"
                      >
                        {actionLoading.includes(receivedConn.id) ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Accept'}
                      </button>
                      <button 
                        onClick={() => handleRespond(receivedConn.id, 'rejected')}
                        disabled={actionLoading.includes(receivedConn.id)}
                        className="py-2.5 px-4 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-red-500/20 hover:text-red-400 transition-all flex items-center justify-center gap-2 text-sm"
                      >
                        Ignore
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          }) : (
            <div className="col-span-full">
              <EmptyState 
                icon={Users}
                title="No professionals found"
                description={
                  searchQuery 
                    ? "We couldn't find anyone matching your search." 
                    : activeTab === 'discover' 
                      ? "You've connected with everyone available!"
                      : "You don't have any users in this category yet."
                }
              />
            </div>
          )}
        </div>
      </div>
      
      <PremiumLockModal
        isOpen={premiumLockOpen}
        onClose={() => setPremiumLockOpen(false)}
        title="Unlock Advanced Professional Search"
        description="Filter professionals by Verified Badges, Executive Seniority, High Industry Ratings, and Active Hiring Status."
      />
    </div>
  );
}
