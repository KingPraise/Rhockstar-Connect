"use client";

import { useState } from "react";
import { X, Users, Sparkles, MessageSquare, Loader2, Compass } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { createCommunity } from "@/lib/services/communities";
import toast from "react-hot-toast";

interface CreateCommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (communityId: string) => void;
}

const EMOJI_OPTIONS = ["⚽", "💻", "💼", "🎵", "🎮", "🎓", "🚀", "🔥", "❤️", "🎨", "📚", "💬"];
const CATEGORIES = ["Sports", "Tech & Career", "Hobbies", "Campus", "General"];

export default function CreateCommunityModal({ isOpen, onClose, onCreated }: CreateCommunityModalProps) {
  const { profile } = useAuthStore();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("General");
  const [icon, setIcon] = useState("💬");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter a community name");
      return;
    }
    if (!profile) {
      toast.error("You must be logged in to create a community");
      return;
    }

    try {
      setLoading(true);
      const res = await createCommunity({
        name: name.trim(),
        description: description.trim(),
        category,
        icon,
        creatorId: profile.uid,
        creatorName: profile.fullName,
        creatorAvatar: profile.avatar || "",
      });

      if (res.success && res.id) {
        toast.success(`Community "${name}" created successfully! 🎉`);
        onCreated(res.id);
        onClose();
        // Reset form
        setName("");
        setDescription("");
        setCategory("General");
        setIcon("💬");
      } else {
        toast.error(res.error || "Failed to create community");
      }
    } catch (err: any) {
      console.error("Create community error:", err);
      toast.error("Failed to create community");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand/10 text-brand flex items-center justify-center font-bold text-lg">
              <Compass className="w-5 h-5 text-brand" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Create Community</h2>
              <p className="text-xs text-slate-400">Build a public discussion space for your passion</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[80vh]">
          {/* Icon Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2">Community Icon</label>
            <div className="flex flex-wrap gap-2">
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setIcon(emoji)}
                  className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-all ${
                    icon === emoji ? "bg-brand/20 border-2 border-brand scale-110" : "bg-slate-800 hover:bg-slate-700 border border-white/5"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Community Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Football Lovers, Tech Developers"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand text-sm"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-white focus:outline-none focus:border-brand text-sm cursor-pointer"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Description</label>
            <textarea
              rows={3}
              placeholder="What is this community about? Share what members will discuss..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand text-sm resize-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-brand to-brand-purple hover:opacity-90 rounded-xl transition-opacity flex items-center gap-2 shadow-lg disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Create Community
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
