"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { getAllUsers, UserBasic } from "@/lib/services/users";
import { getFeedPosts, Post } from "@/lib/services/posts";
import { getUserConnections, sendConnectionRequest, ConnectionRequest } from "@/lib/services/connections";
import { Search as SearchIcon, Users, FileText, Loader2, ArrowRight, UserPlus, Check, MessageSquare } from "lucide-react";
import Link from "next/link";
import PostCard from "@/components/feed/PostCard";
import AuthRequiredModal from "@/components/auth/AuthRequiredModal";
import VerifiedBadge from "@/components/ui/VerifiedBadge";
import UserAvatar from "@/components/ui/UserAvatar";
import toast from "react-hot-toast";

export default function SearchPage() {
  const { profile } = useAuthStore();
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<UserBasic[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [connections, setConnections] = useState<ConnectionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string[]>([]);
  
  const [filteredUsers, setFilteredUsers] = useState<UserBasic[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [usersRes, postsRes] = await Promise.all([
        getAllUsers(),
        getFeedPosts()
      ]);
      
      if (usersRes.success && usersRes.users) {
        setUsers(usersRes.users);
      }
      if (postsRes.success && postsRes.posts) {
        setPosts(postsRes.posts);
      }

      if (profile?.uid) {
        const connRes = await getUserConnections(profile.uid);
        if (connRes.success && connRes.connections) {
          setConnections(connRes.connections);
        }
      }
      setLoading(false);
    };
    fetchData();
  }, [profile?.uid]);

  const handleConnect = async (toUserId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!profile?.uid) return;
    setActionLoading(prev => [...prev, toUserId]);
    const res = await sendConnectionRequest(profile.uid, toUserId);
    if (res.success) {
      toast.success("Connection request sent!");
      const connRes = await getUserConnections(profile.uid);
      if (connRes.success && connRes.connections) {
        setConnections(connRes.connections);
      }
    } else {
      toast.error(res.error || "Failed to send request");
    }
    setActionLoading(prev => prev.filter(id => id !== toUserId));
  };

  const getStatusForUser = (userId: string) => {
    const userConns = connections.filter(c => c.fromUserId === userId || c.toUserId === userId);
    if (userConns.length === 0) return 'none';
    if (userConns.some(c => c.status === 'accepted')) return 'connected';
    if (userConns.some(c => c.status === 'pending')) return 'pending';
    return 'none';
  };

  useEffect(() => {
    if (!query.trim()) {
      setFilteredUsers([]);
      setFilteredPosts([]);
      return;
    }

    const lowerQuery = query.toLowerCase();

    const u = users.filter(user => 
      user.fullName.toLowerCase().includes(lowerQuery) || 
      user.username.toLowerCase().includes(lowerQuery)
    );

    const p = posts.filter(post => 
      post.content.toLowerCase().includes(lowerQuery) ||
      post.user.name.toLowerCase().includes(lowerQuery)
    );

    setFilteredUsers(u);
    setFilteredPosts(p);
  }, [query, users, posts]);

  if (!profile) {
    return (
      <div className="flex-1 max-w-2xl mx-auto w-full pt-8">
        <AuthRequiredModal isOpen={true} onClose={() => {}} title="Sign in to Search" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex justify-center py-6 md:py-8 px-4 relative max-h-[calc(100vh-80px)] overflow-y-auto no-scrollbar">
      <div className="w-full max-w-2xl space-y-6">
        
        {/* Search Header */}
        <div className="neo-card bg-slate-900/60 border border-white/5 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-brand/10 to-brand-purple/10 pointer-events-none" />
          <h1 className="text-2xl font-bold text-white mb-4 relative z-10 flex items-center gap-2">
            <SearchIcon className="w-6 h-6 text-brand" />
            Search Rhockstar Connect
          </h1>
          
          <div className="relative group z-10">
            <SearchIcon className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-brand transition-colors" />
            <input 
              type="text"
              placeholder="Search for people, posts, or keywords..."
              className="w-full bg-slate-800/80 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/50 transition-all shadow-inner text-lg"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center p-12">
            <Loader2 className="w-8 h-8 text-brand animate-spin" />
          </div>
        )}

        {/* Results */}
        {!loading && query.trim() && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            
            {/* Users Section */}
            {filteredUsers.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2 pl-2">
                  <Users className="w-5 h-5 text-brand" />
                  People
                </h2>
                <div className="grid gap-4">
                  {filteredUsers.map(user => {
                    const status = getStatusForUser(user.uid);
                    const isOwn = profile?.uid === user.uid;
                    const isLoading = actionLoading.includes(user.uid);

                    return (
                      <Link 
                        key={user.uid} 
                        href={`/profile?uid=${user.uid}`}
                        className="neo-card bg-slate-900/40 border border-white/5 rounded-2xl p-4 flex items-center gap-4 hover:border-brand/30 hover:bg-slate-800/60 transition-all group"
                      >
                        <UserAvatar src={user.avatar} name={user.fullName} className="w-12 h-12" textClassName="text-base font-bold" />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-white group-hover:text-brand transition-colors truncate flex items-center gap-1.5">
                            <span>{user.fullName}</span>
                            <VerifiedBadge tier={user.subscriptionTier} />
                          </h3>
                          <p className="text-sm text-slate-400 truncate">@{user.username}</p>
                        </div>
                        
                        {!isOwn && (
                          <div className="shrink-0" onClick={e => e.stopPropagation()}>
                            {status === 'connected' ? (
                              <Link
                                href={`/messages?user=${user.uid}`}
                                className="px-3 py-1.5 rounded-xl bg-brand/10 hover:bg-brand/20 text-brand font-bold text-xs flex items-center gap-1 border border-brand/20 transition-all"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                Message
                              </Link>
                            ) : status === 'pending' ? (
                              <button
                                disabled
                                className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-400 font-bold text-xs flex items-center gap-1 border border-white/10"
                              >
                                <Check className="w-3.5 h-3.5" />
                                Pending
                              </button>
                            ) : (
                              <button
                                onClick={(e) => handleConnect(user.uid, e)}
                                disabled={isLoading}
                                className="px-3 rounded-xl py-1.5 bg-gradient-to-r from-brand to-brand-purple text-white font-bold text-xs flex items-center gap-1 shadow-md hover:scale-105 transition-all disabled:opacity-50"
                              >
                                {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
                                Connect
                              </button>
                            )}
                          </div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Posts Section */}
            {filteredPosts.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2 pl-2 mt-4">
                  <FileText className="w-5 h-5 text-emerald-400" />
                  Posts
                </h2>
                <div className="space-y-4">
                  {filteredPosts.map(post => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              </div>
            )}

            {/* No Results */}
            {filteredUsers.length === 0 && filteredPosts.length === 0 && (
              <div className="neo-card bg-slate-900/40 border border-white/5 rounded-3xl p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
                  <SearchIcon className="w-8 h-8 text-slate-500" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">No results found</h3>
                <p className="text-slate-400">We couldn&apos;t find anything matching &quot;{query}&quot;.</p>
              </div>
            )}
          </div>
        )}

        {/* Empty State (No query) */}
        {!loading && !query.trim() && (
          <div className="text-center p-12 text-slate-500">
            <SearchIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>Start typing to search across the network.</p>
          </div>
        )}
      </div>
    </div>
  );
}
