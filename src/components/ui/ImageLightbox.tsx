"use client";

import { useEffect } from "react";
import { useLightboxStore } from "@/store/useLightboxStore";
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

export default function ImageLightbox() {
  const { isOpen, images, currentIndex, closeLightbox, nextImage, prevImage } = useLightboxStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") prevImage();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeLightbox, nextImage, prevImage]);

  // Prevent scrolling when lightbox is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || images.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-[110] bg-gradient-to-b from-black/60 to-transparent">
        <div className="text-white/60 text-sm font-medium">
          {images.length > 1 ? `${currentIndex + 1} / ${images.length}` : ""}
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            className="p-2 text-white/70 hover:text-white transition-colors rounded-full hover:bg-white/10"
            title="Zoom (Double click image)"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          <button 
            onClick={closeLightbox}
            className="p-2 text-white/70 hover:text-white transition-colors rounded-full hover:bg-white/10"
            title="Close (Esc)"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Image Container */}
      <div 
        className="relative w-full h-full flex items-center justify-center p-4 md:p-12"
        onClick={closeLightbox} // Click outside to close
      >
        <img
          src={images[currentIndex]}
          alt={`Lightbox image ${currentIndex + 1}`}
          className="max-w-full max-h-full object-contain select-none animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()} // Prevent click from closing
          onDoubleClick={(e) => {
            // Simple zoom effect toggle on double click
            e.stopPropagation();
            const target = e.currentTarget;
            if (target.style.transform === "scale(1.5)") {
              target.style.transform = "scale(1)";
              target.style.cursor = "zoom-in";
            } else {
              target.style.transform = "scale(1.5)";
              target.style.cursor = "zoom-out";
            }
          }}
          style={{ transition: "transform 0.2s ease", cursor: "zoom-in" }}
          draggable={false}
        />
      </div>

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); prevImage(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-full backdrop-blur-md transition-all z-[110]"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          
          <button
            onClick={(e) => { e.stopPropagation(); nextImage(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-full backdrop-blur-md transition-all z-[110]"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </>
      )}
    </div>
  );
}
