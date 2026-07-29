"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import PostComposer from "@/components/feed/PostComposer";
import PostCard from "@/components/feed/PostCard";
import { subscribeToFeed, Post } from "@/lib/services/posts";
import { Loader2 } from "lucide-react";
import PullToRefresh from "@/components/ui/PullToRefresh";

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [limitCount, setLimitCount] = useState(10);
  const [hasMore, setHasMore] = useState(true);

  const observer = useRef<IntersectionObserver | null>(null);
  
  const lastPostElementRef = useCallback((node: HTMLDivElement) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setLimitCount(prev => prev + 10);
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  const handleRefresh = async () => {
    setLimitCount(10);
    // Artificial delay to show the refresh spinner
    await new Promise(resolve => setTimeout(resolve, 800));
  };

  useEffect(() => {
    const unsubscribe = subscribeToFeed(limitCount, (newPosts) => {
      setPosts(newPosts);
      setLoading(false);
      // If we got fewer posts than the limit, we've reached the end
      if (newPosts.length < limitCount) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
    });

    return () => unsubscribe();
  }, [limitCount]);

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Your Feed</h1>
          <p className="text-slate-400 text-lg">Stay updated with your professional network.</p>
        </div>
        
        {/* Post Composer */}
        <PostComposer />
        
        {/* Feed Timeline */}
        <div className="flex flex-col gap-6">
          {loading ? (
            <div className="space-y-6 w-full">
              {[1, 2, 3].map((i) => (
                <div key={i} className="neo-card p-6 animate-pulse">
                  <div className="flex gap-4 items-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-slate-800"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-slate-800 rounded w-1/4"></div>
                      <div className="h-3 bg-slate-800/50 rounded w-1/5"></div>
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="h-4 bg-slate-800 rounded w-3/4"></div>
                    <div className="h-4 bg-slate-800 rounded w-1/2"></div>
                  </div>
                  <div className="h-64 bg-slate-800/50 rounded-xl mb-4"></div>
                  <div className="flex gap-6 border-t border-white/5 pt-4">
                    <div className="w-16 h-8 bg-slate-800 rounded-lg"></div>
                    <div className="w-16 h-8 bg-slate-800 rounded-lg"></div>
                    <div className="w-16 h-8 bg-slate-800 rounded-lg"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : posts.length > 0 ? (
            <>
              {posts.map((post, index) => {
                if (posts.length === index + 1) {
                  return (
                    <div ref={lastPostElementRef} key={post.id}>
                      <PostCard post={post} />
                    </div>
                  );
                } else {
                  return <PostCard key={post.id} post={post} />;
                }
              })}
              {hasMore && (
                <div className="flex justify-center py-6">
                  <Loader2 className="w-6 h-6 text-brand animate-spin" />
                </div>
              )}
              {!hasMore && posts.length > 0 && (
                <div className="text-center py-6 text-slate-500 text-sm">
                  You have caught up with all posts!
                </div>
              )}
            </>
          ) : (
            <div className="text-center p-12 neo-card">
              <p className="text-slate-400">No posts yet. Be the first to post!</p>
            </div>
          )}
        </div>
      </div>
    </PullToRefresh>
  );
}
