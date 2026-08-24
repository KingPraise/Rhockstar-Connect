"use client";

import { useState } from "react";
import { X, Megaphone, Loader2, Image as ImageIcon, ExternalLink, Sparkles, ShieldCheck } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { createAdvertisement } from "@/lib/services/ads";
import UserAvatar from "@/components/ui/UserAvatar";
import toast from "react-hot-toast";

interface CreateAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (adId: string) => void;
}

const CTA_OPTIONS = [
  "Learn More",
  "Shop Now",
  "Apply Now",
  "Visit Website",
  "Sign Up",
  "Contact Us",
  "Get Started"
];

export default function CreateAdModal({ isOpen, onClose, onCreated }: CreateAdModalProps) {
  const { profile } = useAuthStore();
  const [companyName, setCompanyName] = useState(profile?.fullName || "");
  const [companyLogo, setCompanyLogo] = useState(profile?.avatar || "");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [ctaText, setCtaText] = useState("Learn More");
  const [targetUrl, setTargetUrl] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim() || !targetUrl.trim()) {
      toast.error("Please fill in all required advert fields");
      return;
    }

    if (!profile) {
      toast.error("You must be signed in to submit an advertisement");
      return;
    }

    // Basic URL validation
    let formattedUrl = targetUrl.trim();
    if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
      formattedUrl = `https://${formattedUrl}`;
    }

    try {
      setLoading(true);
      const res = await createAdvertisement({
        companyId: profile.uid,
        companyName: companyName.trim() || profile.fullName,
        companyLogo: companyLogo.trim() || profile.avatar || "",
        companyEmail: profile.email || "",
        title: title.trim(),
        content: content.trim(),
        mediaUrl: mediaUrl.trim() || undefined,
        mediaType,
        ctaText,
        targetUrl: formattedUrl,
      });

      if (res.success && res.id) {
        toast.success("Advert submitted for review! 🚀 Admin will approve shortly.");
        if (onCreated) onCreated(res.id);
        onClose();
        // Reset form
        setTitle("");
        setContent("");
        setMediaUrl("");
        setTargetUrl("");
      } else {
        toast.error(res.error || "Failed to submit advert");
      }
    } catch (err: any) {
      console.error("Ad creation error:", err);
      toast.error("An error occurred submitting your advert");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/5 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-lg border border-purple-500/20">
              <Megaphone className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">Create Sponsored Advert</h2>
              <p className="text-xs text-slate-400">Promote your brand to thousands of professionals</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body with Split Live Preview */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Left Inputs Column */}
            <div className="space-y-4">
              
              {/* Company Info */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Company / Brand Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Rhockstar Tech"
                  className="w-full neo-input py-2.5 text-xs text-white"
                  required
                />
              </div>

              {/* Company Logo URL */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Company Logo URL (Optional)</label>
                <input
                  type="url"
                  value={companyLogo}
                  onChange={(e) => setCompanyLogo(e.target.value)}
                  placeholder="https://example.com/logo.png"
                  className="w-full neo-input py-2.5 text-xs text-white"
                />
              </div>

              {/* Ad Headline Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Ad Headline / Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Launch Your Tech Career with Us"
                  className="w-full neo-input py-2.5 text-xs text-white"
                  required
                />
              </div>

              {/* Ad Body Content */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Ad Text Content</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={3}
                  placeholder="Describe your offer, event, or product..."
                  className="w-full neo-input py-2.5 text-xs text-white resize-none"
                  required
                />
              </div>

              {/* Media URL & Type */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-400">Media URL (Image / Video)</label>
                  <div className="flex items-center gap-2 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setMediaType('image')}
                      className={`px-2 py-0.5 rounded-md font-bold ${mediaType === 'image' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                    >
                      Image
                    </button>
                    <button
                      type="button"
                      onClick={() => setMediaType('video')}
                      className={`px-2 py-0.5 rounded-md font-bold ${mediaType === 'video' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                    >
                      Video
                    </button>
                  </div>
                </div>
                <input
                  type="url"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder={mediaType === 'image' ? "https://images.unsplash.com/photo..." : "https://example.com/video.mp4"}
                  className="w-full neo-input py-2.5 text-xs text-white"
                />
              </div>

              {/* CTA Button Text */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Call-to-Action Button</label>
                <select
                  value={ctaText}
                  onChange={(e) => setCtaText(e.target.value)}
                  className="w-full neo-input py-2.5 text-xs text-white bg-slate-950"
                >
                  {CTA_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              {/* Destination URL */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Target Website Link</label>
                <input
                  type="text"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  placeholder="https://yourcompany.com/landing-page"
                  className="w-full neo-input py-2.5 text-xs text-white"
                  required
                />
              </div>

            </div>

            {/* Right Column: Live Feed Ad Preview */}
            <div className="space-y-2">
              <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Megaphone className="w-3.5 h-3.5 text-purple-400" />
                Live Feed Preview
              </span>

              {/* Live Preview Card Container */}
              <div className="neo-card p-3.5 sm:p-4 rounded-2xl bg-slate-900/90 border border-purple-500/30 space-y-3 shadow-xl">
                
                {/* Header Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <UserAvatar name={companyName || "Company"} src={companyLogo} className="w-9 h-9 text-xs font-bold shrink-0" />
                    <div>
                      <h4 className="font-bold text-white text-xs flex items-center gap-1">
                        {companyName || "Your Company Name"}
                      </h4>
                      <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20">
                        Sponsored
                      </span>
                    </div>
                  </div>
                </div>

                {/* Ad Content */}
                <div className="space-y-1">
                  <h5 className="font-bold text-white text-xs">{title || "Ad Headline Title Goes Here"}</h5>
                  <p className="text-xs text-slate-300 line-clamp-3 leading-snug">
                    {content || "Your promotional text and product description will be rendered right here."}
                  </p>
                </div>

                {/* Media Preview */}
                {mediaUrl ? (
                  <div className="rounded-xl overflow-hidden border border-white/10 max-h-48 bg-black/40 flex items-center justify-center">
                    {mediaType === 'video' ? (
                      <video src={mediaUrl} controls className="max-h-48 w-full object-cover" />
                    ) : (
                      <img src={mediaUrl} alt="Ad preview" className="max-h-48 w-full object-cover" />
                    )}
                  </div>
                ) : (
                  <div className="h-32 rounded-xl border border-dashed border-white/10 bg-slate-950/40 flex flex-col items-center justify-center text-slate-500 gap-1">
                    <ImageIcon className="w-6 h-6" />
                    <span className="text-[11px]">Media Attachment Preview</span>
                  </div>
                )}

                {/* CTA Action Banner */}
                <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-3">
                  <span className="text-[10px] text-slate-400 truncate max-w-[150px]">
                    {targetUrl || "rhockstarconnect.com"}
                  </span>
                  <div className="px-3 py-1.5 bg-purple-600 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-1 shrink-0">
                    <span>{ctaText}</span>
                    <ExternalLink className="w-3 h-3" />
                  </div>
                </div>

              </div>

              {/* Review Process Note */}
              <div className="p-3 bg-purple-950/20 border border-purple-500/20 rounded-xl flex items-start gap-2 text-xs text-purple-300">
                <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <span>
                  Submitted adverts are reviewed by SuperAdmins within 1–2 hours. No payment is taken until approved!
                </span>
              </div>

            </div>

          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-white/5 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all shadow-lg shadow-purple-600/30 flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Megaphone className="w-4 h-4" />
                  Submit for Review
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
