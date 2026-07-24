/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Image as ImageIcon, Video, Send, X, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { createPost } from "@/lib/services/posts";

export default function PostComposer() {
  const { profile } = useAuthStore();
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setErrorMsg(null);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!content.trim() && !imageFile) || !profile) return;
    
    setIsPosting(true);
    setErrorMsg(null);

    // 15 second timeout safety condition
    const postPromise = createPost(profile, content, imageFile);
    const timeoutPromise = new Promise<{ success: boolean; error?: string }>((resolve) => {
      setTimeout(() => {
        resolve({ 
          success: false, 
          error: "Posting timed out. Please check your internet connection and try again." 
        });
      }, 15000);
    });

    const result = await Promise.race([postPromise, timeoutPromise]);
    setIsPosting(false);

    if (result.success) {
      setContent("");
      removeImage();
      setErrorMsg(null);
    } else {
      setErrorMsg(result.error || "Failed to create post. Please try again.");
    }
  };

  if (!profile) {
    return (
      <div className="neo-card p-6 mb-8 border border-brand/20 bg-slate-900/80 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand to-brand-purple flex items-center justify-center text-white shrink-0 shadow-md">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">Viewing as Guest</h3>
            <p className="text-slate-400 text-sm">Log in or sign up to like, comment, share, and connect with professionals.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Link
            href="/login"
            className="flex-1 md:flex-initial py-2.5 px-5 rounded-xl bg-gradient-to-r from-brand to-brand-purple text-white font-bold text-sm text-center shadow-md hover:scale-105 transition-all"
          >
            Log In
          </Link>
          <Link
            href="/register"
            className="flex-1 md:flex-initial py-2.5 px-5 rounded-xl bg-slate-800 text-white font-bold text-sm text-center border border-white/10 hover:bg-slate-700 transition-all"
          >
            Sign Up
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="neo-card p-6 mb-8 relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand/10 rounded-full blur-2xl" />
      
      <form onSubmit={handlePost}>
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between text-rose-400 text-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMsg(null)}
              className="text-rose-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand to-brand-purple flex-shrink-0 flex items-center justify-center font-bold text-white shadow-inner">
            {profile.avatar || profile.fullName.substring(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 flex flex-col gap-3">
            <textarea
              className="neo-input w-full min-h-[100px] resize-none bg-slate-900/40 text-lg placeholder:text-slate-500"
              placeholder={`What's on your mind, ${profile.fullName.split(' ')[0]}?`}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isPosting}
            />
            
            {imagePreview && (
              <div className="relative rounded-xl overflow-hidden border border-white/10 w-full max-w-sm">
                <img src={imagePreview} alt="Upload preview" className="w-full h-auto object-cover" />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-white hover:bg-black/80 transition-colors backdrop-blur-sm"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 pl-16">
          <div className="flex gap-3">
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleImageSelect}
              disabled={isPosting}
            />
            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()}
              disabled={isPosting}
              className="w-10 h-10 rounded-full neo-card bg-slate-800/40 flex items-center justify-center text-slate-400 hover:text-brand hover:border-brand/30 transition-all group disabled:opacity-50"
            >
              <ImageIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </button>
            <button type="button" disabled className="w-10 h-10 rounded-full neo-card bg-slate-800/40 flex items-center justify-center text-slate-400 hover:text-brand-purple hover:border-brand-purple/30 transition-all group disabled:opacity-50">
              <Video className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </button>
          </div>

          <button
            type="submit"
            disabled={(!content.trim() && !imageFile) || isPosting}
            className="neo-button-primary !w-auto px-6 py-2 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center min-w-[100px] justify-center"
          >
            {isPosting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span>Post</span>
                <Send className="w-4 h-4 ml-2" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
