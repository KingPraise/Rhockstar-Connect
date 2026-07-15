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
      <div className="flex flex-col">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-brand" />
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
