"use client";

import { useEffect, useState, useRef } from "react";
import { useLightboxStore } from "@/store/useLightboxStore";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";

export default function ImageLightbox() {
  const { isOpen, images, currentIndex, closeLightbox, nextImage, prevImage } = useLightboxStore();
  const [scale, setScale] = useState(1);
  const dragY = useMotionValue(0);
  const backdropOpacity = useTransform(dragY, [-300, 0, 300], [0.35, 0.95, 0.35]);

  // Reset scale and drag offset when image changes or modal closes
  useEffect(() => {
    setScale(1);
    dragY.set(0);
  }, [currentIndex, isOpen, dragY]);

  // Keyboard navigation
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

  // Lock body scroll when lightbox is open
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

  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.3, 3));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.3, 1));
  const handleResetZoom = () => setScale(1);

  if (!isOpen || images.length === 0) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center select-none overflow-hidden touch-none">
        {/* Dynamic Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black backdrop-blur-md"
          style={{ opacity: backdropOpacity }}
          onClick={closeLightbox}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.95 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        />

        {/* Top Control Bar */}
        <div className="absolute top-0 left-0 right-0 p-4 sm:p-6 flex items-center justify-between z-[120] bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none">
          <div className="text-white/80 text-xs sm:text-sm font-semibold tracking-wide drop-shadow-md">
            {images.length > 1 ? `${currentIndex + 1} / ${images.length}` : ""}
          </div>

          <div className="flex items-center gap-2 sm:gap-3 bg-slate-900/80 px-3 py-1.5 rounded-full border border-white/10 shadow-2xl backdrop-blur-lg pointer-events-auto">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleZoomIn();
              }}
              className="p-1.5 text-white/80 hover:text-white transition-colors rounded-full hover:bg-white/10 active:scale-95"
              title="Zoom In (+)"
            >
              <ZoomIn className="w-5 h-5 text-brand" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleZoomOut();
              }}
              className="p-1.5 text-white/80 hover:text-white transition-colors rounded-full hover:bg-white/10 active:scale-95"
              title="Zoom Out (-)"
            >
              <ZoomOut className="w-5 h-5 text-brand" />
            </button>

            {scale > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleResetZoom();
                }}
                className="p-1.5 text-white/80 hover:text-white transition-colors rounded-full hover:bg-white/10 active:scale-95"
                title="Reset Zoom"
              >
                <RotateCcw className="w-4 h-4 text-amber-400" />
              </button>
            )}

            <div className="w-px h-4 bg-white/20 my-auto" />

            <button
              onClick={(e) => {
                e.stopPropagation();
                closeLightbox();
              }}
              className="p-1.5 text-slate-300 hover:text-rose-400 transition-colors rounded-full hover:bg-white/10 active:scale-95"
              title="Close (Esc or swipe down)"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Gesture & Sizing Container (Desktop 100% full-fit, Mobile swipe-down dismiss) */}
        <div
          className="relative w-full h-full flex items-center justify-center p-3 sm:p-6 md:p-10 pointer-events-auto"
          onClick={closeLightbox}
        >
          <motion.div
            style={{ y: dragY }}
            drag={scale === 1 ? "y" : false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.8}
            onDragEnd={(_, info) => {
              if (scale > 1) return;
              const shouldDismiss =
                Math.abs(info.offset.y) > 90 || Math.abs(info.velocity.y) > 400;
              if (shouldDismiss) {
                closeLightbox();
              }
            }}
            onClick={(e) => e.stopPropagation()}
            className="relative flex items-center justify-center max-w-full max-h-full cursor-grab active:cursor-grabbing"
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <img
              src={images[currentIndex]}
              alt="Viewing preview"
              className="object-contain rounded-xl shadow-2xl transition-transform duration-150 ease-out pointer-events-auto"
              style={{
                maxWidth: scale === 1 ? "90vw" : `calc(${scale * 90}vw)`,
                maxHeight: scale === 1 ? "85vh" : `calc(${scale * 85}vh)`,
                width: "auto",
                height: "auto",
                cursor: scale > 1 ? "zoom-out" : "zoom-in",
              }}
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
          </motion.div>
        </div>

        {/* Navigation Arrows for multi-image galleries */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 text-white/80 hover:text-white hover:bg-white/10 rounded-full backdrop-blur-md transition-all z-[120] bg-slate-900/50 border border-white/10 active:scale-95 shadow-xl"
              title="Previous Image (Left Arrow)"
            >
              <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 text-white/80 hover:text-white hover:bg-white/10 rounded-full backdrop-blur-md transition-all z-[120] bg-slate-900/50 border border-white/10 active:scale-95 shadow-xl"
              title="Next Image (Right Arrow)"
            >
              <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
            </button>
          </>
        )}
      </div>
    </AnimatePresence>
  );
}
