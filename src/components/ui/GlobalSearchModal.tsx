"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, Users, Briefcase, MessageSquare, ArrowRight, Loader2 } from "lucide-react";
import { useSearchStore } from "@/store/useSearchStore";
import { useRouter } from "next/navigation";
import { getAllUsers, UserBasic } from "@/lib/services/users";
import { getJobs, JobListing } from "@/lib/services/jobs";
import { getFeedPosts, Post } from "@/lib/services/posts";
import UserAvatar from "@/components/ui/UserAvatar";
import VerifiedBadge from "@/components/ui/VerifiedBadge";

interface SearchResultItem {
  id: string;
  type: 'person' | 'job' | 'post';
  title: string;
  subtitle: string;
  avatar?: string;
  subscriptionTier?: string;
  link: string;
  data?: any;
}

export default function GlobalSearchModal() {
  const { isOpen, closeSearch } = useSearchStore();
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Cached Real Firebase Data for instant typing speed
  const [dbUsers, setDbUsers] = useState<UserBasic[]>([]);
  const [dbJobs, setDbJobs] = useState<JobListing[]>([]);
  const [dbPosts, setDbPosts] = useState<Post[]>([]);

  // Fetch real Firebase collections when modal opens
  useEffect(() => {
    if (isOpen) {
      async function loadRealData() {
        try {
          const [usersRes, jobsRes, postsRes] = await Promise.all([
            getAllUsers(),
            getJobs(),
            getFeedPosts(30)
          ]);

          if (usersRes.success && usersRes.users) {
            setDbUsers(usersRes.users);
          }
          if (jobsRes.success && jobsRes.jobs) {
            setDbJobs(jobsRes.jobs);
          }
          if (postsRes.posts) {
            setDbPosts(postsRes.posts);
          }
        } catch (err) {
          console.error("Global search data fetch failed:", err);
        }
      }

      loadRealData();
    }
  }, [isOpen]);

  // Handle Cmd+K / Ctrl+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        useSearchStore.getState().toggleSearch();
      }
      if (e.key === 'Escape') {
        closeSearch();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeSearch]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      document.body.style.overflow = "unset";
      setQuery("");
      setResults([]);
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Real-time search logic over real Firebase data
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const qStr = query.toLowerCase().trim();

    const timer = setTimeout(() => {
      const searchHits: SearchResultItem[] = [];

      // 1. Search People / Users
      dbUsers.forEach(u => {
        if (
          u.fullName.toLowerCase().includes(qStr) ||
          u.username.toLowerCase().includes(qStr) ||
          u.headline?.toLowerCase().includes(qStr) ||
          u.industry?.toLowerCase().includes(qStr) ||
          u.bio?.toLowerCase().includes(qStr)
        ) {
          searchHits.push({
            id: `user-${u.uid}`,
            type: 'person',
            title: u.fullName,
            subtitle: u.headline || u.industry || `@${u.username}`,
            avatar: u.avatar,
            subscriptionTier: u.subscriptionTier,
            link: `/profile?uid=${u.uid}`,
            data: u
          });
        }
      });

      // 2. Search Jobs
      dbJobs.forEach(j => {
        if (
          j.title.toLowerCase().includes(qStr) ||
          j.company.toLowerCase().includes(qStr) ||
          j.location.toLowerCase().includes(qStr) ||
          j.type.toLowerCase().includes(qStr) ||
          j.description?.toLowerCase().includes(qStr)
        ) {
          searchHits.push({
            id: `job-${j.id}`,
            type: 'job',
            title: j.title,
            subtitle: `${j.company} • ${j.location}`,
            avatar: j.logo,
            link: `/jobs`,
            data: j
          });
        }
      });

      // 3. Search Posts
      dbPosts.forEach(p => {
        if (
          p.content.toLowerCase().includes(qStr) ||
          p.user.name.toLowerCase().includes(qStr) ||
          p.user.handle.toLowerCase().includes(qStr)
        ) {
          searchHits.push({
            id: `post-${p.id}`,
            type: 'post',
            title: p.content.substring(0, 70) + (p.content.length > 70 ? '...' : ''),
            subtitle: `Posted by ${p.user.name}`,
            avatar: p.user.avatar,
            link: `/feed?postId=${p.id}`,
            data: p
          });
        }
      });

      setResults(searchHits.slice(0, 8));
      setIsSearching(false);
    }, 150);

    return () => clearTimeout(timer);
  }, [query, dbUsers, dbJobs, dbPosts]);

  const handleKeyDownInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && query.trim()) {
      closeSearch();
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] sm:pt-[15vh] px-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm transition-opacity"
        onClick={closeSearch}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Search Input */}
        <div className="relative flex items-center border-b border-white/10 px-4 sm:px-6">
          <Search className="w-6 h-6 text-brand shrink-0" />
          <input
            ref={inputRef}
            type="text"
            className="w-full bg-transparent border-none text-lg sm:text-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-0 py-5 px-4"
            placeholder="Search real people, jobs, posts..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDownInput}
          />
          {isSearching ? (
            <Loader2 className="w-5 h-5 text-slate-400 animate-spin shrink-0" />
          ) : (
            <div className="hidden sm:flex items-center gap-1 bg-slate-800 px-2 py-1 rounded text-xs text-slate-400 font-medium shrink-0 border border-white/5">
              <span>ESC</span>
            </div>
          )}
        </div>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto overscroll-contain">
          {query.trim() === "" ? (
            <div className="p-8 text-center text-slate-500">
              <p className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">Popular Real-Time Topics</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {['Remote Jobs', 'Designers', 'Developers', 'Product', 'Masterclass'].map((term) => (
                  <button 
                    key={term}
                    onClick={() => setQuery(term)}
                    className="px-4 py-2 rounded-full bg-slate-800/60 border border-white/5 hover:border-brand/40 hover:text-white transition-all text-sm font-medium"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          ) : results.length > 0 ? (
            <div className="p-3 space-y-1">
              <div className="flex items-center justify-between px-3 py-1.5 text-xs font-extrabold text-brand uppercase tracking-wider">
                <span>Real-Time Matches ({results.length})</span>
                <span className="text-[10px] text-slate-500 font-normal">Press Enter for full search</span>
              </div>
              
              {results.map((result) => (
                <button
                  key={result.id}
                  onClick={() => {
                    closeSearch();
                    router.push(result.link);
                  }}
                  className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-800/80 hover:border-brand/30 border border-transparent transition-all group text-left"
                >
                  {result.type === 'person' && (
                    <>
                      <UserAvatar src={result.avatar} name={result.title} className="w-11 h-11 shrink-0" textClassName="text-sm font-bold" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-white font-bold text-sm truncate group-hover:text-brand transition-colors">{result.title}</p>
                          <VerifiedBadge tier={result.subscriptionTier} />
                        </div>
                        <p className="text-xs text-slate-400 truncate">{result.subtitle}</p>
                      </div>
                      <Users className="w-4 h-4 text-slate-500 group-hover:text-brand transition-colors shrink-0" />
                    </>
                  )}
                  {result.type === 'job' && (
                    <>
                      <UserAvatar src={result.avatar} name={result.title} className="w-11 h-11 shrink-0 rounded-xl" textClassName="text-sm font-bold" />
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-bold text-sm truncate group-hover:text-brand transition-colors">{result.title}</p>
                        <p className="text-xs text-slate-400 truncate">{result.subtitle}</p>
                      </div>
                      <Briefcase className="w-4 h-4 text-slate-500 group-hover:text-brand transition-colors shrink-0" />
                    </>
                  )}
                  {result.type === 'post' && (
                    <>
                      <div className="w-11 h-11 rounded-2xl bg-slate-800/80 flex items-center justify-center shrink-0 border border-white/5 text-slate-400 group-hover:text-brand group-hover:border-brand/30 transition-colors">
                        <MessageSquare className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium text-sm truncate group-hover:text-brand transition-colors">{result.title}</p>
                        <p className="text-xs text-slate-400 truncate">{result.subtitle}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-brand transition-colors shrink-0" />
                    </>
                  )}
                </button>
              ))}
            </div>
          ) : !isSearching ? (
            <div className="p-12 text-center text-slate-500">
              <Search className="w-8 h-8 mx-auto mb-3 opacity-20" />
              <p className="text-sm font-medium">No real-time matches found for &quot;{query}&quot;</p>
              <button 
                onClick={() => {
                  closeSearch();
                  router.push(`/search?q=${encodeURIComponent(query)}`);
                }}
                className="mt-4 px-4 py-2 rounded-xl bg-brand/10 border border-brand/30 text-brand text-xs font-bold hover:bg-brand hover:text-white transition-all"
              >
                Search all on full Search page
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
