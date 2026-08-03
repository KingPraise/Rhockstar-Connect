"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import PostComposer from "@/components/feed/PostComposer";
import PostCard from "@/components/feed/PostCard";
import { subscribeToFeed, Post } from "@/lib/services/posts";
import { Loader2, MessageSquarePlus } from "lucide-react";
import PullToRefresh from "@/components/ui/PullToRefresh";
import PostCardSkeleton from "@/components/feed/PostCardSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";

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
      <div className="w-full max-w-3xl mx-auto">
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
                <PostCardSkeleton key={i} />
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
            <div className="neo-card flex items-center justify-center min-h-[40vh]">
              <EmptyState 
                icon={MessageSquarePlus}
                title="No posts yet"
                description="Your feed is quiet. Be the first to start a conversation or connect with more professionals."
              />
            </div>
          )}
        </div>
      </div>
    </PullToRefresh>
  );
}
