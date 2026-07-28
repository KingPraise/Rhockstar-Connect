/* eslint-disable @next/next/no-img-element */
"use client";

import { Heart, MessageCircle, Share2, MoreHorizontal, Bookmark, Send, Reply, Edit2, Trash2, Flag } from "lucide-react";
import { useState, useRef } from "react";
import { toggleLike, toggleSavePost, addComment, deletePost, Post } from "@/lib/services/posts";
import { useAuthStore } from "@/store/useAuthStore";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

import AuthRequiredModal from "@/components/auth/AuthRequiredModal";

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const { profile, setProfile } = useAuthStore();
  const [isLiking, setIsLiking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authActionName, setAuthActionName] = useState("interact");
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const commentInputRef = useRef<HTMLInputElement>(null);

  const promptGuestAuth = (action: string) => {
    setAuthActionName(action);
    setAuthModalOpen(true);
  };

  const handleReplyComment = (userName: string) => {
    if (!profile) {
      promptGuestAuth("reply to comments");
      return;
    }
    setCommentText(`@${userName} `);
    if (!showComments) setShowComments(true);
    setTimeout(() => {
      commentInputRef.current?.focus();
    }, 100);
  };

  // Check if current user liked it
  const isLiked = profile ? post.likes?.includes(profile.uid) : false;
  const likeCount = post.likes?.length || 0;

  const handleLike = async () => {
    if (!profile) {
      promptGuestAuth("like posts");
      return;
    }
    if (isLiking) return;
    setIsLiking(true);
    await toggleLike(post.id, profile.uid);
    setIsLiking(false);
  };

  const isSaved = profile?.savedPosts?.includes(post.id) || false;

  const handleSave = async () => {
    if (!profile) {
      promptGuestAuth("save posts");
      return;
    }
    if (isSaving) return;
    setIsSaving(true);
    const res = await toggleSavePost(post.id, profile.uid);
    if (res.success && res.isSaved !== undefined) {
      // Update local profile state
      const newSavedPosts = res.isSaved 
        ? [...(profile.savedPosts || []), post.id]
        : (profile.savedPosts || []).filter(id => id !== post.id);
      
      setProfile({ ...profile, savedPosts: newSavedPosts });
    }
    setIsSaving(false);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Post by ${post.user.name}`,
        text: post.content,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(`${window.location.href}#${post.id}`);
      alert("Link copied to clipboard!");
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) {
      promptGuestAuth("comment on posts");
      return;
    }
    if (!commentText.trim() || isCommenting) return;
    
    setIsCommenting(true);
    await addComment(post.id, profile, commentText.trim());
    setCommentText("");
    setIsCommenting(false);
  };

  const handleDeletePost = async () => {
    if (confirm("Are you sure you want to delete this post?")) {
      setIsDeleting(true);
      await deletePost(post.id);
      setIsDeleting(false);
      setShowMenu(false);
    }
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
        <Link href={`/profile?uid=${post.userId}`} className="flex items-center gap-4 group">
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
        </Link>
        <div className="relative z-20">
          <button 
            type="button"
            onClick={(e) => { e.preventDefault(); setShowMenu(!showMenu); }} 
            className="text-slate-400 hover:text-white transition-colors p-3 -m-1 rounded-full hover:bg-slate-800/50 flex items-center justify-center cursor-pointer"
            aria-label="Post Options"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl bg-slate-900 border border-white/10 shadow-2xl overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-200">
              {profile?.uid === post.userId ? (
                <>
                  <button onClick={() => { /* Handle Edit */ }} className="w-full px-4 py-3 text-left text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors flex items-center gap-2">
                    <Edit2 className="w-4 h-4" /> Edit Post
                  </button>
                  <button onClick={handleDeletePost} disabled={isDeleting} className="w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-slate-800 hover:text-red-300 transition-colors flex items-center gap-2 disabled:opacity-50">
                    <Trash2 className="w-4 h-4" /> {isDeleting ? "Deleting..." : "Delete Post"}
                  </button>
                </>
              ) : (
                <button onClick={() => { /* Handle Report */ setShowMenu(false); alert("Post reported to admins."); }} className="w-full px-4 py-3 text-left text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors flex items-center gap-2">
                  <Flag className="w-4 h-4" /> Report Post
                </button>
              )}
            </div>
          )}
        </div>
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

        <button 
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-brand transition-all group"
        >
          <div className="p-2 rounded-full neo-card bg-slate-800/30 group-hover:border-brand/30">
            <MessageCircle className="w-4 h-4 transition-transform group-hover:scale-110" />
          </div>
          <span>{post.commentsCount || 0}</span>
        </button>

        <button 
          onClick={handleShare}
          className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-emerald-400 transition-all group"
        >
          <div className="p-2 rounded-full neo-card bg-slate-800/30 group-hover:border-emerald-400/30">
            <Share2 className="w-4 h-4 transition-transform group-hover:scale-110" />
          </div>
          <span className="hidden sm:inline">Share</span>
        </button>
        
        <button 
          onClick={handleSave}
          disabled={!profile || isSaving}
          className={`flex items-center gap-2 text-sm font-medium transition-all group ml-auto ${
            isSaved ? "text-amber-400" : "text-slate-400 hover:text-amber-400"
          }`}
        >
          <div className={`p-2 rounded-full neo-card ${isSaved ? 'bg-amber-400/10 border-amber-400/30' : 'bg-slate-800/30 hover:border-amber-400/30'}`}>
            <Bookmark className={`w-4 h-4 transition-transform group-hover:scale-110 ${isSaved ? 'fill-current' : ''}`} />
          </div>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-white/5 animate-in fade-in slide-in-from-top-2">
          {post.comments && post.comments.length > 0 ? (
            <div className="space-y-4 mb-4">
              {post.comments.map((comment) => {
                let cTimeAgo = "Just now";
                const cCreatedAt = new Date(comment.createdAt);
                if (!isNaN(cCreatedAt.getTime())) {
                  cTimeAgo = formatDistanceToNow(cCreatedAt, { addSuffix: true });
                }
                return (
                  <div key={comment.id} className="flex gap-3">
                    <Link href={`/profile?uid=${comment.userId}`} className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-white text-xs shrink-0 hover:ring-2 hover:ring-brand transition-all">
                      {comment.user.avatar}
                    </Link>
                    <div className="flex-1 bg-slate-800/50 rounded-2xl rounded-tl-sm p-3">
                      <div className="flex items-center justify-between mb-1">
                        <Link href={`/profile?uid=${comment.userId}`} className="font-bold text-white text-sm hover:text-brand transition-colors">{comment.user.name}</Link>
                        <span className="text-xs text-slate-500">{cTimeAgo}</span>
                      </div>
                      <p className="text-sm text-slate-300">{comment.content}</p>
                      <div className="mt-2 pt-1 border-t border-white/5 flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleReplyComment(comment.user.name)}
                          className="text-xs font-semibold text-slate-400 hover:text-brand flex items-center gap-1 transition-colors"
                        >
                          <Reply className="w-3.5 h-3.5" />
                          Reply
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-sm text-slate-500 py-2">
              No comments yet. Be the first to start the conversation!
            </div>
          )}

          {/* Add Comment Input */}
          <form onSubmit={handleAddComment} className="flex gap-2 items-center mt-4">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-white text-xs shrink-0">
              {profile?.avatar || profile?.fullName?.substring(0, 2).toUpperCase() || 'U'}
            </div>
            <input
              ref={commentInputRef}
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 bg-slate-900/50 border border-white/10 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-brand/50"
              disabled={isCommenting}
            />
            <button
              type="submit"
              disabled={!commentText.trim() || isCommenting}
              className="p-2 rounded-full bg-brand/20 text-brand hover:bg-brand/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
      {/* Guest Auth Prompt Modal */}
      <AuthRequiredModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        actionName={authActionName} 
      />
    </div>
  );
}
