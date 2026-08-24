"use client";

import { useEffect, useRef, useState } from "react";
import { Advertisement, trackAdImpression, trackAdClick } from "@/lib/services/ads";
import UserAvatar from "@/components/ui/UserAvatar";
import { ExternalLink, Sparkles, Megaphone } from "lucide-react";

interface SponsoredAdCardProps {
  ad: Advertisement;
}

export default function SponsoredAdCard({ ad }: SponsoredAdCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [hasImpressionBeenTracked, setHasImpressionBeenTracked] = useState(false);

  // Track impression when card becomes visible in viewport
  useEffect(() => {
    if (hasImpressionBeenTracked || !cardRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          trackAdImpression(ad.id);
          setHasImpressionBeenTracked(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(cardRef.current);

    return () => observer.disconnect();
  }, [ad.id, hasImpressionBeenTracked]);

  const handleCtaClick = () => {
    trackAdClick(ad.id);
    if (ad.targetUrl) {
      let target = ad.targetUrl;
      if (!target.startsWith("http://") && !target.startsWith("https://")) {
        target = `https://${target}`;
      }
      window.open(target, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div 
      ref={cardRef}
      className="neo-card p-3.5 sm:p-4 rounded-2xl bg-gradient-to-b from-purple-950/20 via-slate-900/90 to-slate-900/90 border border-purple-500/30 shadow-xl space-y-3 relative overflow-hidden transition-all hover:border-purple-500/50"
    >
      {/* Top Accent Gradient */}
      <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-purple-500 via-fuchsia-500 to-indigo-500" />

      {/* Header Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <UserAvatar name={ad.companyName} src={ad.companyLogo} className="w-9 h-9 text-xs font-bold shrink-0" />
          <div className="min-w-0">
            <h4 className="font-bold text-white text-xs truncate flex items-center gap-1">
              {ad.companyName}
            </h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] font-bold text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded-full border border-purple-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-purple-400" />
                Sponsored
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-1">
        <h3 className="font-bold text-white text-sm leading-snug">{ad.title}</h3>
        <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
          {ad.content}
        </p>
      </div>

      {/* Media Attachment */}
      {ad.mediaUrl && (
        <div className="rounded-xl overflow-hidden border border-white/5 bg-black/40 max-h-72 sm:max-h-80 flex items-center justify-center">
          {ad.mediaType === 'video' ? (
            <video 
              src={ad.mediaUrl} 
              controls 
              className="max-h-72 sm:max-h-80 w-full object-cover" 
            />
          ) : (
            <img 
              src={ad.mediaUrl} 
              alt={ad.title} 
              className="max-h-72 sm:max-h-80 w-full object-cover cursor-pointer hover:opacity-95 transition-opacity" 
              onClick={handleCtaClick}
            />
          )}
        </div>
      )}

      {/* CTA Footer Action Bar */}
      <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-3">
        <span className="text-[11px] text-slate-400 truncate max-w-[180px]">
          {ad.targetUrl?.replace(/^https?:\/\//, '')}
        </span>

        <button
          onClick={handleCtaClick}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/30 transition-all flex items-center gap-1.5 shrink-0"
        >
          <span>{ad.ctaText || "Learn More"}</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
}
