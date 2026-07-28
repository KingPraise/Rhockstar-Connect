"use client";

import { useEffect, useState } from "react";
import PostComposer from "@/components/feed/PostComposer";
import PostCard from "@/components/feed/PostCard";
import { subscribeToFeed, Post } from "@/lib/services/posts";
import { Loader2 } from "lucide-react";

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToFeed((newPosts) => {
      setPosts(newPosts);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
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
          posts.map(post => (
            <PostCard key={post.id} post={post} />
          ))
        ) : (
          <div className="text-center p-12 neo-card">
            <p className="text-slate-400">No posts yet. Be the first to post!</p>
          </div>
        )}
      </div>
    </div>
  );
}
