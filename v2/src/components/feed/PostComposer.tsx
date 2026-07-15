/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useRef } from "react";
import { Image as ImageIcon, Video, Send, X, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { createPost } from "@/lib/services/posts";

export default function PostComposer() {
  const { profile } = useAuthStore();
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
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
    const result = await createPost(profile, content, imageFile);
    setIsPosting(false);

    if (result.success) {
      setContent("");
      removeImage();
    } else {
      alert("Failed to create post. Please try again.");
    }
  };

  if (!profile) return null; // Or skeleton loader

  return (
    <div className="neo-card p-6 mb-8 relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand/10 rounded-full blur-2xl" />
      
      <form onSubmit={handlePost}>
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
