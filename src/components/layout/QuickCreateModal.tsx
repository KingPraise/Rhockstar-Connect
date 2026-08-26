"use client";

import { useState } from "react";
import { X, FileText, Image as ImageIcon, Briefcase, Users, BarChart2, Sparkles, Lock, Megaphone } from "lucide-react";
import { useRouter } from "next/navigation";
import CreateCommunityModal from "@/components/chat/CreateCommunityModal";
import CreateAdModal from "@/components/ads/CreateAdModal";
import { useAuthStore } from "@/store/useAuthStore";
import toast from "react-hot-toast";

interface QuickCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickCreateModal({ isOpen, onClose }: QuickCreateModalProps) {
  const router = useRouter();
  const { profile } = useAuthStore();
  const [isCommunityModalOpen, setIsCommunityModalOpen] = useState(false);
  const [isAdModalOpen, setIsAdModalOpen] = useState(false);

  const isEmployer = profile?.accountType === 'employer' || profile?.role === 'admin' || (profile as any)?.role === 'employer';

  if (!isOpen && !isCommunityModalOpen && !isAdModalOpen) return null;

  const handleAction = (action: string) => {
    switch (action) {
      case "post":
        onClose();
        router.push("/feed");
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }, 100);
        break;
      case "photo":
        onClose();
        router.push("/feed");
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: "smooth" });
          toast.success("Attach your photo in the composer!");
        }, 100);
        break;
      case "job":
        if (isEmployer) {
          onClose();
          router.push("/jobs/post");
        } else {
          toast.error("Only Employer accounts can post job listings. Upgrade your account in Settings!", { icon: "💼" });
        }
        break;
      case "ad":
        onClose();
        setIsAdModalOpen(true);
        break;
      case "community":
        onClose();
        setIsCommunityModalOpen(true);
        break;
      case "poll":
        onClose();
        router.push("/feed");
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: "smooth" });
          toast("Click the Poll icon (📊) in the composer to launch a poll!", { icon: "📊" });
        }, 100);
        break;
    }
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md max-h-[80vh] sm:max-h-[85vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4 sm:space-y-5 custom-scrollbar">
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 pb-4 bg-slate-900/95 backdrop-blur-md -mx-4 sm:-mx-6 px-4 sm:px-6 -mt-4 sm:-mt-6 pt-4 sm:pt-6 rounded-t-3xl">
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
            <div className="grid grid-cols-1 gap-3 pb-8">
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

              {/* Create Job - Role Gated */}
              <button
                onClick={() => handleAction("job")}
                className={`flex items-center gap-4 p-3.5 border rounded-2xl transition-all group text-left ${
                  isEmployer 
                    ? "bg-slate-800/60 hover:bg-emerald-900/30 border-white/5 hover:border-emerald-500/30" 
                    : "bg-slate-800/30 border-white/5 opacity-80"
                }`}
              >
                <div className={`p-3 rounded-xl transition-colors ${
                  isEmployer ? "bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white" : "bg-slate-700/50 text-slate-400"
                }`}>
                  <Briefcase className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-white text-sm group-hover:text-emerald-300">Create Job</h4>
                    {!isEmployer && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Employer Only
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">Post open opportunities for top talent</p>
                </div>
              </button>

              {/* Create Community - Opens Chat Community Builder */}
              <button
                onClick={() => handleAction("community")}
                className="flex items-center gap-4 p-3.5 bg-slate-800/60 hover:bg-amber-900/30 border border-white/5 hover:border-amber-500/30 rounded-2xl transition-all group text-left"
              >
                <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl group-hover:bg-amber-600 group-hover:text-white transition-colors">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm group-hover:text-amber-300">Create Community</h4>
                  <p className="text-xs text-slate-400">Launch a public chat room inside the Messages page</p>
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

              {/* Create Advert Option */}
              <button
                onClick={() => handleAction("ad")}
                className="flex items-center gap-4 p-3.5 bg-slate-800/60 hover:bg-purple-900/30 border border-white/5 hover:border-purple-500/30 rounded-2xl transition-all group text-left"
              >
                <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm group-hover:text-purple-300">Create Advert</h4>
                  <p className="text-xs text-slate-400">Promote your brand or product to Rhockstar Connect feed</p>
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
          toast.success("Public community created! Opening Chat...");
        }}
      />

      {/* Advert Creation Modal */}
      <CreateAdModal
        isOpen={isAdModalOpen}
        onClose={() => setIsAdModalOpen(false)}
      />
    </>
  );
}
