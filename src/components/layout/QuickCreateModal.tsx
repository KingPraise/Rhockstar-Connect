"use client";

import { useState } from "react";
import { X, FileText, Image as ImageIcon, Briefcase, Users, BarChart2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import CreateCommunityModal from "@/components/chat/CreateCommunityModal";
import toast from "react-hot-toast";

interface QuickCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickCreateModal({ isOpen, onClose }: QuickCreateModalProps) {
  const router = useRouter();
  const [isCommunityModalOpen, setIsCommunityModalOpen] = useState(false);

  if (!isOpen && !isCommunityModalOpen) return null;

  const handleAction = (action: string) => {
    onClose();
    switch (action) {
      case "post":
        router.push("/feed");
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }, 100);
        break;
      case "photo":
        router.push("/feed");
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: "smooth" });
          toast.success("Attach your photo in the composer!");
        }, 100);
        break;
      case "job":
        router.push("/jobs/post");
        break;
      case "community":
        setIsCommunityModalOpen(true);
        break;
      case "poll":
        router.push("/feed");
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: "smooth" });
          toast("Poll feature coming in next update!", { icon: "📊" });
        }, 100);
        break;
    }
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Create New</h3>
                  <p className="text-xs text-slate-400">Select an action to launch content</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Action Grid */}
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => handleAction("post")}
                className="flex items-center gap-4 p-3.5 bg-slate-800/60 hover:bg-purple-900/30 border border-white/5 hover:border-purple-500/30 rounded-2xl transition-all group text-left"
              >
                <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm group-hover:text-purple-300">Create Post</h4>
                  <p className="text-xs text-slate-400">Share updates, thoughts, or news with your network</p>
                </div>
              </button>

              <button
                onClick={() => handleAction("photo")}
                className="flex items-center gap-4 p-3.5 bg-slate-800/60 hover:bg-sky-900/30 border border-white/5 hover:border-sky-500/30 rounded-2xl transition-all group text-left"
              >
                <div className="p-3 bg-sky-500/10 text-sky-400 rounded-xl group-hover:bg-sky-600 group-hover:text-white transition-colors">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm group-hover:text-sky-300">Upload Photo</h4>
                  <p className="text-xs text-slate-400">Share visual media and achievements</p>
                </div>
              </button>

              <button
                onClick={() => handleAction("job")}
                className="flex items-center gap-4 p-3.5 bg-slate-800/60 hover:bg-emerald-900/30 border border-white/5 hover:border-emerald-500/30 rounded-2xl transition-all group text-left"
              >
                <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm group-hover:text-emerald-300">Create Job</h4>
                  <p className="text-xs text-slate-400">Post open opportunities for top talent</p>
                </div>
              </button>

              <button
                onClick={() => handleAction("community")}
                className="flex items-center gap-4 p-3.5 bg-slate-800/60 hover:bg-amber-900/30 border border-white/5 hover:border-amber-500/30 rounded-2xl transition-all group text-left"
              >
                <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl group-hover:bg-amber-600 group-hover:text-white transition-colors">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm group-hover:text-amber-300">Create Community</h4>
                  <p className="text-xs text-slate-400">Start a public chat room for topics & interest groups</p>
                </div>
              </button>

              <button
                onClick={() => handleAction("poll")}
                className="flex items-center gap-4 p-3.5 bg-slate-800/60 hover:bg-rose-900/30 border border-white/5 hover:border-rose-500/30 rounded-2xl transition-all group text-left"
              >
                <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl group-hover:bg-rose-600 group-hover:text-white transition-colors">
                  <BarChart2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm group-hover:text-rose-300">Create Poll</h4>
                  <p className="text-xs text-slate-400">Ask questions and gather opinions from the community</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Community Creation Modal */}
      <CreateCommunityModal 
        isOpen={isCommunityModalOpen}
        onClose={() => setIsCommunityModalOpen(false)}
        onCreated={(id) => {
          setIsCommunityModalOpen(false);
          router.push("/messages");
        }}
      />
    </>
  );
}
