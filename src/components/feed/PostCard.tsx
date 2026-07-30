/* eslint-disable @next/next/no-img-element */
"use client";

import { Heart, MessageCircle, Share2, MoreHorizontal, Bookmark, Send, Reply, Edit2, Trash2, Flag, X, Loader2, FileText, Check } from "lucide-react";
import { useState, useRef } from "react";
import { toggleLike, toggleSavePost, addComment, deleteComment, deletePost, updatePost, updateComment, Post } from "@/lib/services/posts";
import { getUserById } from "@/lib/services/users";
import { useAuthStore } from "@/store/useAuthStore";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { useLightboxStore } from "@/store/useLightboxStore";
import toast from "react-hot-toast";

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

  return (
    <div className="neo-card p-6 mb-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <Link href={`/profile?uid=${post.userId}`} className="flex items-center gap-4 group">
          <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center font-bold text-white shadow-inner overflow-hidden group-hover:shadow-[0_0_15px_rgba(56,189,248,0.3)] transition-shadow">
            {post.user.avatar?.startsWith('http') || post.user.avatar?.startsWith('/') ? (
              <img src={post.user.avatar} alt={post.user.name} className="w-full h-full object-cover" />
            ) : (
              post.user.avatar || post.user.name?.charAt(0) || 'U'
            )}
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
        <div className="mb-4 text-slate-300 leading-relaxed whitespace-pre-wrap">
          {post.content}
        </div>
      )}

      {/* Image Attachment */}
      {post.imageUrl && (
        <div className="mb-6 rounded-xl overflow-hidden border border-white/5 bg-black/20 max-h-[500px] flex items-center justify-center">
          <img 
            src={post.imageUrl} 
            alt="Post attachment" 
            className="max-w-full max-h-[500px] object-contain cursor-pointer hover:opacity-90 transition-opacity"
            loading="lazy"
            onClick={() => openLightbox([post.imageUrl!])}
          />
        </div>
      )}

      {/* Document Attachment */}
      {post.documentUrl && (
        <div className="mb-6">
          <a 
            href={post.documentUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-slate-800/40 hover:bg-slate-800/80 transition-colors group"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold text-white truncate">{post.documentName || "Document"}</span>
                <span className="text-xs text-slate-400">Click to view/download</span>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 group-hover:bg-brand group-hover:text-white transition-colors shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            </div>
          </a>
        </div>
      )}

      {/* Action Bar */}
      <div className="flex items-center gap-6 pt-4 border-t border-white/5">
        <div className="flex items-center gap-2">
          <button 
            onClick={handleLike}
            disabled={!profile || isLiking}
            className={`flex items-center text-sm font-medium transition-all group ${
              isLiked ? "text-red-500" : "text-slate-400 hover:text-red-400"
            } ${isLiking ? "opacity-50 cursor-not-allowed" : ""}`}
            title="Like Post"
          >
            <div className={`p-2 rounded-full neo-card ${isLiked ? 'bg-red-500/10 border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'bg-slate-800/30 hover:border-red-400/30'}`}>
              <Heart className={`w-4 h-4 transition-transform group-hover:scale-110 ${isLiked ? 'fill-current' : ''}`} />
            </div>
          </button>
          <button 
            onClick={handleOpenLikesModal} 
            className="text-sm font-medium text-slate-400 hover:text-white transition-colors hover:underline px-1 cursor-pointer"
            title="See who liked this"
          >
            {likeCount}
          </button>
        </div>

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
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-white text-sm shrink-0 shadow-inner overflow-hidden">
                          {comment.user.avatar?.startsWith('http') || comment.user.avatar?.startsWith('/') ? (
                            <img src={comment.user.avatar} alt={comment.user.name} className="w-full h-full object-cover" />
                          ) : (
                            comment.user.avatar || comment.user.name?.charAt(0) || 'U'
                          )}
                        </div>
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
                          <p className="text-sm text-slate-300">{comment.content}</p>
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
                                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-inner overflow-hidden">
                                  {reply.user.avatar?.startsWith('http') || reply.user.avatar?.startsWith('/') ? (
                                    <img src={reply.user.avatar} alt={reply.user.name} className="w-full h-full object-cover" />
                                  ) : (
                                    reply.user.avatar || reply.user.name?.charAt(0) || 'U'
                                  )}
                                </div>
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
                                  <p className="text-xs text-slate-300">{reply.content}</p>
                                )}
                                {profile?.uid === reply.userId && (
                                  <div className="mt-1 pt-1 border-t border-white/5 flex justify-end gap-2">
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
                                  </div>
                                )}
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
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand to-brand-purple flex items-center justify-center font-bold text-white shadow-md shrink-0 overflow-hidden">
              {profile?.avatar?.startsWith('http') || profile?.avatar?.startsWith('/') ? (
                <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                profile?.avatar || profile?.fullName?.substring(0, 2).toUpperCase() || 'U'
              )}
            </div>
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
      {isLikesModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-sm mx-4 overflow-hidden shadow-2xl">
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
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-white shrink-0 overflow-hidden">
                      {u.avatar?.startsWith('http') || u.avatar?.startsWith('/') ? (
                        <img src={u.avatar} alt={u.fullName} className="w-full h-full object-cover" />
                      ) : (
                        u.avatar || u.fullName?.charAt(0) || 'U'
                      )}
                    </div>
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
        </div>
      )}
    </div>
  );
}
