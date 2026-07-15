/* eslint-disable @next/next/no-img-element */
"use client";

import { Heart, MessageCircle, Share2, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { toggleLike, Post } from "@/lib/services/posts";
import { useAuthStore } from "@/store/useAuthStore";
import { formatDistanceToNow } from "date-fns";

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const { profile } = useAuthStore();
  const [isLiking, setIsLiking] = useState(false);

  // Check if current user liked it
  const isLiked = profile ? post.likes?.includes(profile.uid) : false;
  const likeCount = post.likes?.length || 0;

  const handleLike = async () => {
    if (!profile || isLiking) return;
    setIsLiking(true);
    await toggleLike(post.id, profile.uid);
    setIsLiking(false);
  };

  // Format timestamp safely
  let timeAgo = "Just now";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const createdAt = post.createdAt as any;
  if (createdAt?.toDate && typeof createdAt.toDate === 'function') {
    timeAgo = formatDistanceToNow(createdAt.toDate(), { addSuffix: true });
  }

  return (
    <div className="neo-card p-6 mb-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4 cursor-pointer group">
          <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center font-bold text-white shadow-inner group-hover:shadow-[0_0_15px_rgba(56,189,248,0.3)] transition-shadow">
            {post.user.avatar}
          </div>
          <div>
            <h4 className="font-bold text-white group-hover:text-brand transition-colors">{post.user.name}</h4>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>@{post.user.handle}</span>
              <span>•</span>
              <span>{timeAgo}</span>
            </div>
          </div>
        </div>
        
        <button className="text-slate-400 hover:text-white transition-colors p-2 rounded-full hover:bg-slate-800/50">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Body */}
      <div className="mb-4 text-slate-300 leading-relaxed whitespace-pre-wrap">
        {post.content}
      </div>

      {/* Image Attachment */}
      {post.imageUrl && (
        <div className="mb-6 rounded-xl overflow-hidden border border-white/5 bg-black/20 max-h-[500px] flex items-center justify-center">
          <img 
            src={post.imageUrl} 
            alt="Post attachment" 
            className="max-w-full max-h-[500px] object-contain"
            loading="lazy"
          />
        </div>
      )}

      {/* Action Bar */}
      <div className="flex items-center gap-6 pt-4 border-t border-white/5">
        <button 
          onClick={handleLike}
          disabled={!profile || isLiking}
          className={`flex items-center gap-2 text-sm font-medium transition-all group ${
            isLiked ? "text-red-500" : "text-slate-400 hover:text-red-400"
          } ${isLiking ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <div className={`p-2 rounded-full neo-card ${isLiked ? 'bg-red-500/10 border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'bg-slate-800/30 hover:border-red-400/30'}`}>
            <Heart className={`w-4 h-4 transition-transform group-hover:scale-110 ${isLiked ? 'fill-current' : ''}`} />
          </div>
          <span>{likeCount}</span>
        </button>

        <button className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-brand transition-all group">
          <div className="p-2 rounded-full neo-card bg-slate-800/30 group-hover:border-brand/30">
            <MessageCircle className="w-4 h-4 transition-transform group-hover:scale-110" />
          </div>
          <span>{post.commentsCount || 0}</span>
        </button>

        <button className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-emerald-400 transition-all group ml-auto">
          <div className="p-2 rounded-full neo-card bg-slate-800/30 group-hover:border-emerald-400/30">
            <Share2 className="w-4 h-4 transition-transform group-hover:scale-110" />
          </div>
          <span className="hidden sm:inline">Share</span>
        </button>
      </div>
    </div>
  );
}
