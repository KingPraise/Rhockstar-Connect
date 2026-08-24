"use client";

import { useEffect, useState } from "react";
import { useLightboxStore } from "@/store/useLightboxStore";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

export default function ImageLightbox() {
  const { isOpen, images, currentIndex, closeLightbox, nextImage, prevImage } = useLightboxStore();
  const [scale, setScale] = useState(1);

  // Reset scale when image changes or modal closes
  useEffect(() => {
    setScale(1);
  }, [currentIndex, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "+" || e.key === "=") handleZoomIn();
      if (e.key === "-") handleZoomOut();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeLightbox, nextImage, prevImage, scale]);

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

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.3, 3));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.3, 1));
  const handleResetZoom = () => setScale(1);

  if (!isOpen || images.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm animate-in fade-in duration-200 select-none">
      
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-[110] bg-gradient-to-b from-black/80 via-black/40 to-transparent">
        <div className="text-white/70 text-sm font-bold">
          {images.length > 1 ? `${currentIndex + 1} / ${images.length}` : ""}
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3 bg-slate-900/80 px-3 py-1.5 rounded-full border border-white/10 shadow-lg">
          <button 
            onClick={handleZoomIn}
            className="p-1.5 text-white/80 hover:text-white transition-colors rounded-full hover:bg-white/10"
            title="Zoom In (+)"
          >
            <ZoomIn className="w-5 h-5 text-brand" />
          </button>

          <button 
            onClick={handleZoomOut}
            className="p-1.5 text-white/80 hover:text-white transition-colors rounded-full hover:bg-white/10"
            title="Zoom Out (-)"
          >
            <ZoomOut className="w-5 h-5 text-brand" />
          </button>

          {scale > 1 && (
            <button 
              onClick={handleResetZoom}
              className="p-1.5 text-white/80 hover:text-white transition-colors rounded-full hover:bg-white/10"
              title="Reset Zoom"
            >
              <RotateCcw className="w-4 h-4 text-amber-400" />
            </button>
          )}

          <div className="w-px h-4 bg-white/20 my-auto" />

          <button 
            onClick={closeLightbox}
            className="p-1.5 text-slate-300 hover:text-rose-400 transition-colors rounded-full hover:bg-white/10"
            title="Close (Esc)"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Image Container */}
      <div 
        className="relative w-full h-full flex items-center justify-center p-4 md:p-12 overflow-auto"
        onClick={closeLightbox}
      >
        <img
          src={images[currentIndex]}
          alt={`Lightbox image ${currentIndex + 1}`}
          className="max-w-full max-h-full object-contain transition-transform duration-200 ease-out shadow-2xl rounded-lg"
          style={{ transform: `scale(${scale})` }}
          onClick={(e) => {
            e.stopPropagation();
            if (scale > 1) {
              handleResetZoom();
            } else {
              handleZoomIn();
            }
          }}
          draggable={false}
        />
      </div>

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); prevImage(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 text-white/80 hover:text-white hover:bg-white/10 rounded-full backdrop-blur-md transition-all z-[110] bg-slate-900/40 border border-white/10"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          
          <button
            onClick={(e) => { e.stopPropagation(); nextImage(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-white/80 hover:text-white hover:bg-white/10 rounded-full backdrop-blur-md transition-all z-[110] bg-slate-900/40 border border-white/10"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </>
      )}
    </div>
  );
}
