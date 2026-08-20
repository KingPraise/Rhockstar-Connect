/* eslint-disable @next/next/no-img-element */
"use client";

import { Heart, MessageCircle, Share2, MoreHorizontal, Bookmark, Send, Reply, Edit2, Trash2, Flag, X, Loader2, FileText, Check, Eye, EyeOff, BarChart2, CheckCircle2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { toggleLike, toggleSavePost, addComment, deleteComment, deletePost, updatePost, updateComment, toggleCommentVisibility, votePoll, Post } from "@/lib/services/posts";
import { getUserById } from "@/lib/services/users";
import { useAuthStore } from "@/store/useAuthStore";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useLightboxStore } from "@/store/useLightboxStore";
import toast from "react-hot-toast";

import AuthRequiredModal from "@/components/auth/AuthRequiredModal";
import VerifiedBadge from "@/components/ui/VerifiedBadge";
import UserAvatar from "@/components/ui/UserAvatar";

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
  const [isLikesModalOpen, setIsLikesModalOpen] = useState(false);
  const [likesUsers, setLikesUsers] = useState<any[]>([]);
  const [isLoadingLikes, setIsLoadingLikes] = useState(false);
  
  const { openLightbox } = useLightboxStore();
  const [replyingTo, setReplyingTo] = useState<{ id: string; name: string } | null>(null);
  
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [editPostText, setEditPostText] = useState(post.content);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentText, setEditCommentText] = useState("");

  const commentInputRef = useRef<HTMLInputElement>(null);
  
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleOpenLikesModal = async () => {
    setIsLikesModalOpen(true);
    if (!post.likes || post.likes.length === 0) return;
    
    setIsLoadingLikes(true);
    try {
      const usersData = await Promise.all(
        post.likes.map(id => getUserById(id))
      );
      setLikesUsers(usersData.filter(res => res.success && res.user).map(res => res.user));
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingLikes(false);
    }
  };

  const promptGuestAuth = (action: string) => {
    setAuthActionName(action);
    setAuthModalOpen(true);
  };

  const handleReplyComment = (commentId: string, userName: string) => {
    if (!profile) {
      promptGuestAuth("reply to comments");
      return;
    }
    setReplyingTo({ id: commentId, name: userName });
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
      toast.success("Link copied to clipboard!");
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
    await addComment(post.id, profile, commentText.trim(), replyingTo?.id);
    setCommentText("");
    setReplyingTo(null);
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

  const handleToggleCommentVisibility = async (commentId: string, currentIsHidden: boolean) => {
    if (!profile) return;
    const res = await toggleCommentVisibility(post.id, commentId, !currentIsHidden);
    if (res.success) {
      toast.success(currentIsHidden ? "Comment unhidden" : "Comment hidden");
    } else {
      toast.error(res.error || "Failed to update comment");
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (confirm("Delete this comment?")) {
      await deleteComment(post.id, commentId);
    }
  };

  const handleSavePostEdit = async () => {
    if (!editPostText.trim() || editPostText === post.content) {
      setIsEditingPost(false);
      return;
    }
    setIsSavingEdit(true);
    await updatePost(post.id, editPostText.trim());
    setIsSavingEdit(false);
    setIsEditingPost(false);
  };

  const handleSaveCommentEdit = async (commentId: string, currentContent: string) => {
    if (!editCommentText.trim() || editCommentText === currentContent) {
      setEditingCommentId(null);
      return;
    }
    await updateComment(post.id, commentId, editCommentText.trim());
    setEditingCommentId(null);
  };

  // Format timestamp safely
  let timeAgo = "Just now";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const createdAt = post.createdAt as any;
  if (createdAt?.toDate && typeof createdAt.toDate === 'function') {
    timeAgo = formatDistanceToNow(createdAt.toDate(), { addSuffix: true });
  }

  const searchParams = useSearchParams();
  
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash;
      const targetId = searchParams?.get("postId") || (hash.startsWith("#post-") ? hash.replace("#post-", "") : null);

      if (targetId === post.id) {
        const timer = setTimeout(() => {
          const el = document.getElementById(`post-${post.id}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.classList.add('ring-2', 'ring-brand', 'shadow-[0_0_35px_rgba(56,189,248,0.6)]', 'scale-[1.01]');
            setTimeout(() => {
              el.classList.remove('ring-2', 'ring-brand', 'shadow-[0_0_35px_rgba(56,189,248,0.6)]', 'scale-[1.01]');
            }, 4000);
          }
        }, 300);
        return () => clearTimeout(timer);
      }
    }
  }, [post.id, searchParams]);

  return (
    <div id={`post-${post.id}`} className="neo-card p-3.5 sm:p-4 mb-3.5 border border-white/5 bg-slate-900/60 rounded-2xl hover:border-white/10 transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <Link href={`/profile?uid=${post.userId}`} className="flex items-center gap-3 group min-w-0">
          <UserAvatar src={post.user.avatar} name={post.user.name} className="w-9 h-9 shrink-0 shadow-inner group-hover:scale-105 transition-transform" textClassName="text-xs font-bold" />
          <div className="min-w-0">
            <h4 className="font-bold text-sm text-white group-hover:text-purple-300 transition-colors flex items-center gap-1.5 truncate">
              <span className="truncate">{post.user.name}</span>
              <VerifiedBadge tier={(post.user as any)?.subscriptionTier} />
            </h4>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 truncate">
              <span className="truncate">@{post.user.handle}</span>
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
                  <button onClick={() => { setIsEditingPost(true); setEditPostText(post.content); setShowMenu(false); }} className="w-full px-4 py-3 text-left text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors flex items-center gap-2">
                    <Edit2 className="w-4 h-4" /> Edit Post
                  </button>
                  <button onClick={handleDeletePost} disabled={isDeleting} className="w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-slate-800 hover:text-red-300 transition-colors flex items-center gap-2 disabled:opacity-50">
                    <Trash2 className="w-4 h-4" /> {isDeleting ? "Deleting..." : "Delete Post"}
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => { setShowMenu(false); toast.success("Post reported to admins."); }} className="w-full px-4 py-3 text-left text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors flex items-center gap-2">
                    <Flag className="w-4 h-4" /> Report Post
                  </button>
                  <button onClick={() => { setShowMenu(false); toast.success("User blocked. You will no longer see their posts."); }} className="w-full px-4 py-3 text-left text-sm text-rose-400 hover:bg-slate-800 hover:text-rose-300 transition-colors flex items-center gap-2 border-t border-white/5">
                    <X className="w-4 h-4" /> Block User
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      {isEditingPost ? (
        <div className="mb-4">
          <textarea
            value={editPostText}
            onChange={(e) => setEditPostText(e.target.value)}
            className="neo-input w-full min-h-[100px] resize-none bg-slate-900/40 text-sm text-slate-200 p-3 rounded-xl border border-brand/50 focus:outline-none focus:ring-1 focus:ring-brand"
            disabled={isSavingEdit}
          />
          <div className="flex justify-end gap-2 mt-2">
            <button 
              onClick={() => setIsEditingPost(false)}
              disabled={isSavingEdit}
              className="px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800"
            >
              Cancel
            </button>
            <button 
              onClick={handleSavePostEdit}
              disabled={isSavingEdit || !editPostText.trim()}
              className="px-3 py-1.5 text-xs font-semibold bg-brand text-white rounded-lg hover:bg-brand/80 transition-colors flex items-center gap-1"
            >
              {isSavingEdit ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              Save
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-3 text-sm text-slate-200 leading-snug whitespace-pre-wrap">
          {post.content}
        </div>
      )}

      {/* Image Attachment */}
      {post.imageUrl && (
        <div className="mb-3 rounded-xl overflow-hidden border border-white/5 bg-black/20 max-h-72 sm:max-h-80 flex items-center justify-center">
          <img 
            src={post.imageUrl} 
            alt="Post attachment" 
            className="max-w-full max-h-72 sm:max-h-80 object-cover cursor-pointer hover:opacity-95 transition-opacity w-full"
            loading="lazy"
            onClick={() => openLightbox([post.imageUrl!])}
          />
        </div>
      )}

      {/* Document Attachment */}
      {post.documentUrl && (
        <div className="mb-3">
          <a 
            href={post.documentUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 rounded-xl border border-white/10 bg-slate-800/40 hover:bg-slate-800/80 transition-colors group"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <FileText className="w-4 h-4" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-white truncate">{post.documentName || "Document"}</span>
                <span className="text-[11px] text-slate-400">Click to view/download</span>
              </div>
            </div>
            <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 group-hover:bg-purple-600 group-hover:text-white transition-colors shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            </div>
          </a>
        </div>
      )}

      {/* Interactive Poll Widget */}
      {post.poll && (
        <div className="mb-3 p-3.5 rounded-2xl bg-slate-950/60 border border-purple-500/20 space-y-2.5">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-white text-xs sm:text-sm flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-purple-400 shrink-0" />
              <span>{post.poll.question}</span>
            </h4>
            <span className="text-[10px] font-semibold text-purple-300 px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20">
              {post.poll.totalVotes || 0} {post.poll.totalVotes === 1 ? 'vote' : 'votes'}
            </span>
          </div>

          <div className="space-y-2">
            {post.poll.options.map((option) => {
              const hasVoted = profile ? option.votes.includes(profile.uid) : false;
              const percentage = post.poll!.totalVotes > 0 
                ? Math.round((option.votes.length / post.poll!.totalVotes) * 100) 
                : 0;

              return (
                <button
                  key={option.id}
                  onClick={async () => {
                    if (!profile) {
                      promptGuestAuth("vote in polls");
                      return;
                    }
                    await votePoll(post.id, option.id, profile.uid);
                  }}
                  className={`w-full relative overflow-hidden p-2.5 rounded-xl text-left border transition-all ${
                    hasVoted 
                      ? "bg-purple-900/30 border-purple-500/50 text-white font-bold" 
                      : "bg-slate-900/70 hover:bg-slate-800/80 border-white/5 text-slate-200"
                  }`}
                >
                  {/* Progress Fill Bar */}
                  <div 
                    className="absolute top-0 bottom-0 left-0 bg-purple-600/20 transition-all duration-500" 
                    style={{ width: `${percentage}%` }}
                  />

                  <div className="relative z-10 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 truncate font-medium">
                      {hasVoted && <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />}
                      <span className="truncate">{option.text}</span>
                    </span>
                    <span className="font-bold text-slate-300 ml-2 shrink-0">{percentage}%</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Action Bar */}
      <div className="flex items-center gap-4 sm:gap-6 pt-2.5 border-t border-white/5 text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <button 
            onClick={handleLike}
            disabled={!profile || isLiking}
            className={`flex items-center transition-all group ${
              isLiked ? "text-red-500" : "text-slate-400 hover:text-red-400"
            } ${isLiking ? "opacity-50 cursor-not-allowed" : ""}`}
            title="Like Post"
          >
            <div className={`p-1.5 rounded-full ${isLiked ? 'bg-red-500/10 text-red-500 border border-red-500/30' : 'bg-slate-800/40 hover:bg-slate-800'}`}>
              <Heart className={`w-3.5 h-3.5 transition-transform group-hover:scale-110 ${isLiked ? 'fill-current' : ''}`} />
            </div>
          </button>
          <button 
            onClick={handleOpenLikesModal} 
            className="text-xs font-semibold text-slate-400 hover:text-white transition-colors hover:underline px-0.5 cursor-pointer"
            title="See who liked this"
          >
            {likeCount}
          </button>
        </div>

        <button 
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-purple-300 transition-all group"
        >
          <div className="p-1.5 rounded-full bg-slate-800/40 group-hover:bg-slate-800">
            <MessageCircle className="w-3.5 h-3.5 transition-transform group-hover:scale-110" />
          </div>
          <span>{post.commentsCount || 0}</span>
        </button>

        <button 
          onClick={handleShare}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-emerald-400 transition-all group"
        >
          <div className="p-1.5 rounded-full bg-slate-800/40 group-hover:bg-slate-800">
            <Share2 className="w-3.5 h-3.5 transition-transform group-hover:scale-110" />
          </div>
          <span className="hidden sm:inline">Share</span>
        </button>
        
        <button 
          onClick={handleSave}
          disabled={!profile || isSaving}
          className={`flex items-center gap-1.5 text-xs font-medium transition-all group ml-auto ${
            isSaved ? "text-amber-400" : "text-slate-400 hover:text-amber-400"
          }`}
        >
          <div className={`p-1.5 rounded-full ${isSaved ? 'bg-amber-400/10 text-amber-400 border border-amber-400/30' : 'bg-slate-800/40 hover:bg-slate-800'}`}>
            <Bookmark className={`w-3.5 h-3.5 transition-transform group-hover:scale-110 ${isSaved ? 'fill-current' : ''}`} />
          </div>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-white/5 animate-in fade-in slide-in-from-top-2">
          {post.comments && post.comments.length > 0 ? (
            <div className="space-y-4 mb-4">
              {post.comments.filter(c => !c.replyToId).map((comment) => {
                let cTimeAgo = "Just now";
                const cCreatedAt = new Date(comment.createdAt);
                if (!isNaN(cCreatedAt.getTime())) {
                  cTimeAgo = formatDistanceToNow(cCreatedAt, { addSuffix: true });
                }
                
                // Get replies for this comment
                const replies = post.comments?.filter(c => c.replyToId === comment.id) || [];
                
                return (
                  <div key={comment.id} className="flex flex-col gap-3">
                    <div className="flex gap-3">
                      <Link href={`/profile?uid=${comment.userId}`}>
                        <UserAvatar src={comment.user.avatar} name={comment.user.name} className="w-10 h-10 shadow-inner" textClassName="text-xs font-bold" />
                      </Link>
                      <div className="flex-1 bg-slate-800/50 rounded-2xl rounded-tl-sm p-3">
                        <div className="flex items-center justify-between mb-1">
                          <Link href={`/profile?uid=${comment.userId}`} className="font-bold text-white text-sm hover:text-brand transition-colors">{comment.user.name}</Link>
                          <span className="text-xs text-slate-500">{cTimeAgo}</span>
                        </div>
                        {editingCommentId === comment.id ? (
                          <div className="mt-1 mb-2">
                            <textarea
                              value={editCommentText}
                              onChange={(e) => setEditCommentText(e.target.value)}
                              className="w-full bg-slate-900 text-sm text-white p-2 rounded-lg border border-brand/50 focus:outline-none resize-none"
                            />
                            <div className="flex justify-end gap-2 mt-2">
                              <button onClick={() => setEditingCommentId(null)} className="text-xs text-slate-400 hover:text-white">Cancel</button>
                              <button onClick={() => handleSaveCommentEdit(comment.id, comment.content)} className="text-xs bg-brand text-white px-3 py-1 rounded">Save</button>
                            </div>
                          </div>
                        ) : (
                          <p className={`text-sm ${comment.isHidden ? 'text-slate-500 italic' : 'text-slate-300'}`}>
                            {comment.isHidden && (post.userId !== profile?.uid && profile?.role !== 'admin') 
                              ? "This comment has been hidden." 
                              : comment.content}
                          </p>
                        )}
                        <div className="mt-2 pt-1 border-t border-white/5 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => handleReplyComment(comment.id, comment.user.name)}
                            className="text-xs font-semibold text-slate-400 hover:text-brand flex items-center gap-1 transition-colors"
                          >
                            <Reply className="w-3.5 h-3.5" />
                            Reply
                          </button>
                          {profile?.uid === comment.userId && (
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => { setEditingCommentId(comment.id); setEditCommentText(comment.content); }}
                                className="text-xs font-semibold text-slate-500 hover:text-white flex items-center gap-1 transition-colors"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteComment(comment.id)}
                                className="text-xs font-semibold text-slate-500 hover:text-red-400 flex items-center gap-1 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                          {(post.userId === profile?.uid || profile?.role === 'admin') && (
                            <button
                              type="button"
                              onClick={() => handleToggleCommentVisibility(comment.id, !!comment.isHidden)}
                              className={`text-xs font-semibold flex items-center gap-1 transition-colors ${comment.isHidden ? 'text-amber-500 hover:text-amber-400' : 'text-slate-500 hover:text-white'}`}
                              title={comment.isHidden ? "Unhide comment" : "Hide comment"}
                            >
                              {comment.isHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Render Replies */}
                    {replies.length > 0 && (
                      <div className="ml-11 space-y-3 relative before:absolute before:left-[-22px] before:top-0 before:bottom-4 before:w-px before:bg-white/10">
                        {replies.map((reply) => {
                          let rTimeAgo = "Just now";
                          const rCreatedAt = new Date(reply.createdAt);
                          if (!isNaN(rCreatedAt.getTime())) {
                            rTimeAgo = formatDistanceToNow(rCreatedAt, { addSuffix: true });
                          }
                          return (
                            <div key={reply.id} className="flex gap-3 relative before:absolute before:left-[-22px] before:top-4 before:w-4 before:h-px before:bg-white/10">
                              <Link href={`/profile?uid=${reply.userId}`}>
                                <UserAvatar src={reply.user.avatar} name={reply.user.name} className="w-8 h-8 shrink-0 shadow-inner" textClassName="text-[10px] font-bold" />
                              </Link>
                              <div className="flex-1 bg-slate-900/50 rounded-2xl rounded-tl-sm p-3 border border-white/5">
                                <div className="flex items-center justify-between mb-1">
                                  <Link href={`/profile?uid=${reply.userId}`} className="font-bold text-white text-xs hover:text-brand transition-colors">{reply.user.name}</Link>
                                  <span className="text-[10px] text-slate-500">{rTimeAgo}</span>
                                </div>
                                {editingCommentId === reply.id ? (
                                  <div className="mt-1">
                                    <textarea
                                      value={editCommentText}
                                      onChange={(e) => setEditCommentText(e.target.value)}
                                      className="w-full bg-slate-800 text-xs text-white p-2 rounded-lg border border-brand/50 focus:outline-none resize-none"
                                    />
                                    <div className="flex justify-end gap-2 mt-1">
                                      <button onClick={() => setEditingCommentId(null)} className="text-[10px] text-slate-400 hover:text-white">Cancel</button>
                                      <button onClick={() => handleSaveCommentEdit(reply.id, reply.content)} className="text-[10px] bg-brand text-white px-2 py-0.5 rounded">Save</button>
                                    </div>
                                  </div>
                                ) : (
                                  <p className={`text-xs ${reply.isHidden ? 'text-slate-500 italic' : 'text-slate-300'}`}>
                                    {reply.isHidden && (post.userId !== profile?.uid && profile?.role !== 'admin')
                                      ? "This reply has been hidden."
                                      : reply.content}
                                  </p>
                                )}
                                <div className="mt-1 pt-1 border-t border-white/5 flex justify-end gap-2">
                                  {profile?.uid === reply.userId && (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => { setEditingCommentId(reply.id); setEditCommentText(reply.content); }}
                                        className="text-[10px] font-semibold text-slate-500 hover:text-white transition-colors flex items-center gap-1"
                                      >
                                        <Edit2 className="w-3 h-3" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteComment(reply.id)}
                                        className="text-[10px] font-semibold text-slate-500 hover:text-red-400 transition-colors flex items-center gap-1"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </>
                                  )}
                                  {(post.userId === profile?.uid || profile?.role === 'admin') && (
                                    <button
                                      type="button"
                                      onClick={() => handleToggleCommentVisibility(reply.id, !!reply.isHidden)}
                                      className={`text-[10px] font-semibold flex items-center gap-1 transition-colors ${reply.isHidden ? 'text-amber-500 hover:text-amber-400' : 'text-slate-500 hover:text-white'}`}
                                      title={reply.isHidden ? "Unhide reply" : "Hide reply"}
                                    >
                                      {reply.isHidden ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
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
            <UserAvatar src={profile?.avatar} name={profile?.fullName} className="w-10 h-10 shadow-md shrink-0" textClassName="text-sm font-bold" />
            <input
              ref={commentInputRef}
              type="text"
              value={commentText}
              onChange={(e) => {
                setCommentText(e.target.value);
                if (e.target.value === "") setReplyingTo(null); // Clear reply state if input is completely cleared
              }}
              placeholder={replyingTo ? `Replying to ${replyingTo.name}...` : "Write a comment..."}
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
      {/* Auth Required Modal */}
      {authModalOpen && (
        <AuthRequiredModal 
          isOpen={authModalOpen} 
          onClose={() => setAuthModalOpen(false)} 
          title={`Sign in to ${authActionName}`} 
        />
      )}

      {/* Likes Modal */}
      {isLikesModalOpen && mounted && createPortal(
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in"
          onClick={() => setIsLikesModalOpen(false)}
        >
          <div 
            className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-sm mx-4 overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b border-white/10 bg-slate-800/50">
              <h3 className="text-lg font-bold text-white">Likes</h3>
              <button onClick={() => setIsLikesModalOpen(false)} className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/5">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 max-h-[60vh] overflow-y-auto no-scrollbar space-y-4">
              {isLoadingLikes ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 text-brand animate-spin" />
                </div>
              ) : likesUsers.length > 0 ? (
                likesUsers.map(u => (
                  <Link href={`/profile?uid=${u.uid}`} key={u.uid} onClick={() => setIsLikesModalOpen(false)} className="flex items-center gap-3 group">
                    <UserAvatar src={u.avatar} name={u.fullName} className="w-10 h-10 shrink-0" textClassName="text-sm font-bold" />
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm truncate group-hover:text-brand transition-colors">{u.fullName}</p>
                      <p className="text-slate-400 text-xs truncate">@{u.username}</p>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-center text-slate-500 py-4 text-sm">No likes yet.</p>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
