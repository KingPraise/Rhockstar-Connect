"use client";

import UserAvatar from "@/components/ui/UserAvatar";
import { useState, useRef } from "react";
import Link from "next/link";
import { Image as ImageIcon, Send, X, Loader2, Sparkles, AlertCircle, FileText, BarChart2, Plus, Video } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { createPost, PollData } from "@/lib/services/posts";
import toast from "react-hot-toast";

export default function PostComposer() {
  const { profile } = useAuthStore();
  const [content, setContent] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<{ url: string, type: 'image' | 'video' | 'document', name?: string } | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Poll state
  const [showPollBuilder, setShowPollBuilder] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);

  const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setMediaFile(file);
      
      const isVideo = file.type.startsWith('video/') || file.name.endsWith('.mp4') || file.name.endsWith('.mov') || file.name.endsWith('.webm');
      const isDocument = !isVideo && (file.type.includes('pdf') || file.type.includes('document') || file.name.endsWith('.pdf') || file.name.endsWith('.doc') || file.name.endsWith('.docx'));
      
      if (isVideo) {
        setMediaPreview({ url: URL.createObjectURL(file), type: 'video', name: file.name });
      } else if (isDocument) {
        setMediaPreview({ url: '', type: 'document', name: file.name });
      } else {
        setMediaPreview({ url: URL.createObjectURL(file), type: 'image' });
      }
      
      setErrorMsg(null);
    }
  };

  const removeMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddPollOption = () => {
    if (pollOptions.length < 4) {
      setPollOptions([...pollOptions, ""]);
    }
  };

  const handlePollOptionChange = (index: number, val: string) => {
    const updated = [...pollOptions];
    updated[index] = val;
    setPollOptions(updated);
  };

  const handleRemovePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index));
    }
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!content.trim() && !mediaFile && !pollQuestion.trim()) || !profile) return;

    let pollData: PollData | null = null;
    if (showPollBuilder) {
      const validOptions = pollOptions.map(o => o.trim()).filter(Boolean);
      if (!pollQuestion.trim() || validOptions.length < 2) {
        setErrorMsg("Poll requires a question and at least 2 options!");
        return;
      }
      pollData = {
        question: pollQuestion.trim(),
        options: validOptions.map((opt, idx) => ({
          id: `opt_${idx + 1}_${Date.now()}`,
          text: opt,
          votes: []
        })),
        totalVotes: 0
      };
    }
    
    setIsPosting(true);
    setErrorMsg(null);

    try {
      const res = await createPost(profile, content, mediaFile, pollData);
      setIsPosting(false);

      if (res.success) {
        setContent("");
        removeMedia();
        setShowPollBuilder(false);
        setPollQuestion("");
        setPollOptions(["", ""]);
        toast.success("Post published!");
      } else {
        setErrorMsg(res.error || "Failed to publish post.");
      }
    } catch {
      setIsPosting(false);
      setErrorMsg("An unexpected error occurred.");
    }
  };

  if (!profile) {
    return (
      <div className="neo-card p-6 mb-6 flex flex-col md:flex-row items-center justify-between gap-4 border border-white/10 bg-slate-900/60 rounded-2xl">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-full bg-brand/10 text-brand">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">Viewing as Guest</h3>
            <p className="text-slate-400 text-xs">Log in or sign up to like, comment, share, and connect with professionals.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Link
            href="/login"
            className="flex-1 md:flex-initial py-2 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs text-center transition-all"
          >
            Log In
          </Link>
          <Link
            href="/register"
            className="flex-1 md:flex-initial py-2 px-4 rounded-xl bg-slate-800 text-white font-bold text-xs text-center border border-white/10 hover:bg-slate-700 transition-all"
          >
            Sign Up
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="neo-card p-3.5 sm:p-4 mb-4 border border-white/5 bg-slate-900/80 rounded-2xl relative overflow-hidden">
      <form onSubmit={handlePost}>
        {errorMsg && (
          <div className="mb-3 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between text-rose-400 text-xs">
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

        <div className="flex gap-3">
          <UserAvatar src={profile.avatar} name={profile.fullName} className="w-9 h-9 shrink-0" textClassName="text-xs font-bold" />
          <div className="flex-1 flex flex-col gap-2">
            <textarea
              className="w-full min-h-[75px] resize-none bg-slate-800/40 text-sm text-slate-200 placeholder:text-slate-500 p-3 rounded-xl border border-white/5 focus:outline-none focus:border-purple-500/50"
              placeholder={`Share an update, video, or opportunity, ${profile.fullName.split(' ')[0]}...`}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isPosting}
            />
            
            {/* Poll Builder Widget */}
            {showPollBuilder && (
              <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                    <BarChart2 className="w-3.5 h-3.5 text-purple-400" /> Create Community Poll
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowPollBuilder(false)}
                    className="text-slate-400 hover:text-white text-xs"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <input
                  type="text"
                  placeholder="Ask a question..."
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-900 text-xs text-white rounded-lg border border-white/10 focus:outline-none focus:border-purple-500"
                />

                <div className="space-y-2">
                  {pollOptions.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder={`Option ${idx + 1}`}
                        value={opt}
                        onChange={(e) => handlePollOptionChange(idx, e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-slate-900 text-xs text-white rounded-lg border border-white/10 focus:outline-none focus:border-purple-500"
                      />
                      {pollOptions.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemovePollOption(idx)}
                          className="text-rose-400 hover:text-rose-300 p-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {pollOptions.length < 4 && (
                  <button
                    type="button"
                    onClick={handleAddPollOption}
                    className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1 pt-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Option
                  </button>
                )}
              </div>
            )}

            {mediaPreview && (
              <div className="relative rounded-xl overflow-hidden border border-white/10 w-full max-w-sm mt-2">
                {mediaPreview.type === 'video' ? (
                  <video src={mediaPreview.url} controls className="w-full max-h-56 object-cover rounded-xl" />
                ) : mediaPreview.type === 'image' ? (
                  <img src={mediaPreview.url} alt="Upload preview" className="w-full max-h-48 object-cover" />
                ) : (
                  <div className="flex items-center gap-3 p-4 bg-slate-800/80">
                    <div className="w-10 h-10 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-medium text-white truncate pr-6">{mediaPreview.name}</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={removeMedia}
                  className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-white hover:bg-black/80 transition-colors backdrop-blur-sm shadow-md"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mt-3 pl-12">
          <div className="flex items-center gap-2">
            <input 
              type="file" 
              accept="image/*,video/*,application/pdf,.doc,.docx" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleMediaSelect}
              disabled={isPosting}
            />
            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()}
              disabled={isPosting}
              className="p-2 rounded-xl bg-slate-800/40 text-slate-400 hover:text-purple-300 hover:bg-slate-800 transition-all flex items-center gap-1 text-xs"
              title="Add Image or Document"
            >
              <ImageIcon className="w-4 h-4" />
            </button>

            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()}
              disabled={isPosting}
              className="p-2 rounded-xl bg-slate-800/40 text-slate-400 hover:text-purple-300 hover:bg-slate-800 transition-all flex items-center gap-1 text-xs"
              title="Add Video"
            >
              <Video className="w-4 h-4 text-purple-400" />
            </button>

            <button 
              type="button" 
              onClick={() => setShowPollBuilder(!showPollBuilder)}
              disabled={isPosting}
              className={`p-2 rounded-xl transition-all ${
                showPollBuilder ? "bg-purple-600/30 text-purple-300 border border-purple-500/40" : "bg-slate-800/40 text-slate-400 hover:text-purple-300 hover:bg-slate-800"
              }`}
              title="Create Poll"
            >
              <BarChart2 className="w-4 h-4" />
            </button>
          </div>

          <button
            type="submit"
            disabled={(!content.trim() && !mediaFile && !(showPollBuilder && pollQuestion.trim())) || isPosting}
            className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 shadow-lg shadow-purple-600/20 transition-all"
          >
            {isPosting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Post</span>
                <Send className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
