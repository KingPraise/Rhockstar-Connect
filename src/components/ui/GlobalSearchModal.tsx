"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, Users, Briefcase, MessageSquare, ArrowRight, Loader2 } from "lucide-react";
import { useSearchStore } from "@/store/useSearchStore";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function GlobalSearchModal() {
  const { isOpen, closeSearch } = useSearchStore();
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

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

  // Handle hardware back button on mobile
  useEffect(() => {
    if (isOpen) {
      window.history.pushState({ searchModalOpen: true }, "");

      const handlePopState = () => {
        closeSearch();
      };

      window.addEventListener("popstate", handlePopState);

      return () => {
        window.removeEventListener("popstate", handlePopState);
        if (window.history.state && window.history.state.searchModalOpen) {
          window.history.back();
        }
      };
    }
  }, [isOpen, closeSearch]);

  // Mock search logic
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(() => {
      // Mock results
      const mockResults = [
        { id: 1, type: 'person', name: 'Alex Rivera', role: 'Senior Product Designer', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex' },
        { id: 2, type: 'job', title: 'Frontend Developer', company: 'TechCorp Inc.', logo: 'T' },
        { id: 3, type: 'post', content: 'Just launched our new design system! Check it out...', author: 'Sarah Chen' },
      ];
      setResults(mockResults);
      setIsSearching(false);
    }, 600);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] sm:pt-[15vh] px-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={closeSearch}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Search Input */}
        <div className="relative flex items-center border-b border-white/10 px-4">
          <Search className="w-6 h-6 text-brand shrink-0" />
          <input
            ref={inputRef}
            type="text"
            className="w-full bg-transparent border-none text-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-0 py-6 px-4"
            placeholder="Search for people, jobs, posts..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
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
              <p className="mb-4 text-sm font-medium">Quick Searches</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {['UX Design', 'Remote Jobs', 'React Developers', 'Product Management'].map((term) => (
                  <button 
                    key={term}
                    onClick={() => setQuery(term)}
                    className="px-4 py-2 rounded-full bg-slate-800/50 border border-white/5 hover:bg-slate-800 hover:text-white transition-colors text-sm"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          ) : results.length > 0 ? (
            <div className="p-2 space-y-1">
              <div className="px-3 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">Top Results</div>
              
              {results.map((result, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    closeSearch();
                    if (result.type === 'person') router.push('/network');
                    if (result.type === 'job') router.push('/jobs');
                    if (result.type === 'post') router.push('/feed');
                  }}
                  className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-slate-800/50 transition-colors group text-left"
                >
                  {result.type === 'person' && (
                    <>
                      <div className="w-10 h-10 rounded-full bg-slate-800 overflow-hidden shrink-0 border border-white/10">
                        <Image src={result.avatar} alt={result.name} width={40} height={40} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">{result.name}</p>
                        <p className="text-sm text-brand truncate">{result.role}</p>
                      </div>
                      <Users className="w-4 h-4 text-slate-500 group-hover:text-brand transition-colors" />
                    </>
                  )}
                  {result.type === 'job' && (
                    <>
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand/20 to-brand-purple/20 flex items-center justify-center shrink-0 border border-brand/20 text-brand font-bold">
                        {result.logo}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">{result.title}</p>
                        <p className="text-sm text-slate-400 truncate">{result.company}</p>
                      </div>
                      <Briefcase className="w-4 h-4 text-slate-500 group-hover:text-brand transition-colors" />
                    </>
                  )}
                  {result.type === 'post' && (
                    <>
                      <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center shrink-0 border border-white/5">
                        <MessageSquare className="w-5 h-5 text-slate-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">{result.content}</p>
                        <p className="text-sm text-slate-400 truncate">Posted by {result.author}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-brand transition-colors" />
                    </>
                  )}
                </button>
              ))}
            </div>
          ) : !isSearching ? (
            <div className="p-12 text-center text-slate-500">
              <Search className="w-8 h-8 mx-auto mb-3 opacity-20" />
              <p>No results found for "{query}"</p>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="bg-slate-900 border-t border-white/5 p-4 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><kbd className="bg-slate-800 px-1.5 py-0.5 rounded border border-white/5 font-sans">↑</kbd><kbd className="bg-slate-800 px-1.5 py-0.5 rounded border border-white/5 font-sans">↓</kbd> to navigate</span>
            <span className="flex items-center gap-1"><kbd className="bg-slate-800 px-1.5 py-0.5 rounded border border-white/5 font-sans">Enter</kbd> to select</span>
          </div>
          <div className="font-medium text-brand">Rhockstar Search</div>
        </div>

      </div>
    </div>
  );
}
