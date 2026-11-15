"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useLightboxStore } from "@/store/useLightboxStore";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";

export default function ImageLightbox() {
  const { isOpen, images, currentIndex, closeLightbox, nextImage, prevImage } = useLightboxStore();
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isGesturing, setIsGesturing] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const dragY = useMotionValue(0);
  const backdropOpacity = useTransform(dragY, [-300, 0, 300], [0.35, 0.95, 0.35]);

  // Touch gesture tracking ref
  const gestureRef = useRef<{
    isPinching: boolean;
    isPanning: boolean;
    startDist: number;
    startScale: number;
    startPan: { x: number; y: number };
    startFocus: { x: number; y: number };
    lastTouch: { x: number; y: number };
    lastTapTime: number;
  }>({
    isPinching: false,
    isPanning: false,
    startDist: 0,
    startScale: 1,
    startPan: { x: 0, y: 0 },
    startFocus: { x: 0, y: 0 },
    lastTouch: { x: 0, y: 0 },
    lastTapTime: 0,
  });

  // Reset scale and pan when image changes or modal closes
  const resetTransform = useCallback(() => {
    setScale(1);
    setPan({ x: 0, y: 0 });
    dragY.set(0);
    setIsGesturing(false);
  }, [dragY]);

  useEffect(() => {
    resetTransform();
  }, [currentIndex, isOpen, resetTransform]);

  // Zoom controls
  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.5, 4));
  };

  const handleZoomOut = () => {
    setScale((prev) => {
      const next = Math.max(prev - 0.5, 1);
      if (next === 1) setPan({ x: 0, y: 0 });
      return next;
    });
  };

  const handleResetZoom = () => {
    resetTransform();
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight" && scale === 1) nextImage();
      if (e.key === "ArrowLeft" && scale === 1) prevImage();
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

  // Touch Handlers for Natural Pinch-to-Zoom & Pan
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const touches = e.touches;

    if (touches.length === 2) {
      // 2 fingers = Pinch gesture
      const dist = Math.hypot(
        touches[0].clientX - touches[1].clientX,
        touches[0].clientY - touches[1].clientY
      );
      const focusX = (touches[0].clientX + touches[1].clientX) / 2;
      const focusY = (touches[0].clientY + touches[1].clientY) / 2;

      gestureRef.current.isPinching = true;
      gestureRef.current.isPanning = false;
      gestureRef.current.startDist = dist;
      gestureRef.current.startScale = scale;
      gestureRef.current.startPan = { ...pan };
      gestureRef.current.startFocus = { x: focusX, y: focusY };
      setIsGesturing(true);
    } else if (touches.length === 1) {
      // 1 finger = Potential pan if zoomed, or tap detection
      gestureRef.current.lastTouch = {
        x: touches[0].clientX,
        y: touches[0].clientY,
      };

      if (scale > 1.05) {
        gestureRef.current.isPanning = true;
        setIsGesturing(true);
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const touches = e.touches;

    if (touches.length === 2 && gestureRef.current.isPinching) {
      e.preventDefault();
      const dist = Math.hypot(
        touches[0].clientX - touches[1].clientX,
        touches[0].clientY - touches[1].clientY
      );
      const focusX = (touches[0].clientX + touches[1].clientX) / 2;
      const focusY = (touches[0].clientY + touches[1].clientY) / 2;

      const scaleFactor = dist / gestureRef.current.startDist;
      const newScale = Math.min(
        Math.max(gestureRef.current.startScale * scaleFactor, 0.8),
        4.5
      );

      // Keep the exact pinch area in focus
      const container = containerRef.current;
      if (container) {
        const rect = container.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const focalOffsetX = gestureRef.current.startFocus.x - centerX;
        const focalOffsetY = gestureRef.current.startFocus.y - centerY;

        const scaleDiff = newScale / gestureRef.current.startScale - 1;
        const newPanX =
          gestureRef.current.startPan.x +
          (focusX - gestureRef.current.startFocus.x) -
          focalOffsetX * scaleDiff;
        const newPanY =
          gestureRef.current.startPan.y +
          (focusY - gestureRef.current.startFocus.y) -
          focalOffsetY * scaleDiff;

        setScale(newScale);
        setPan({ x: newPanX, y: newPanY });
      }
    } else if (touches.length === 1 && gestureRef.current.isPanning && scale > 1.05) {
      e.preventDefault();
      const dx = touches[0].clientX - gestureRef.current.lastTouch.x;
      const dy = touches[0].clientY - gestureRef.current.lastTouch.y;

      gestureRef.current.lastTouch = {
        x: touches[0].clientX,
        y: touches[0].clientY,
      };

      setPan((prev) => ({
        x: prev.x + dx,
        y: prev.y + dy,
      }));
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    const remainingTouches = e.touches.length;

    if (remainingTouches === 0) {
      setIsGesturing(false);
      gestureRef.current.isPinching = false;
      gestureRef.current.isPanning = false;

      // Snap back if zoomed out below 1.05
      if (scale < 1.05) {
        setScale(1);
        setPan({ x: 0, y: 0 });
      } else {
        // Clamp scale and pan to prevent image from flying off screen
        const finalScale = Math.min(scale, 4);
        setScale(finalScale);

        if (imgRef.current && containerRef.current) {
          const imgRect = imgRef.current.getBoundingClientRect();
          const winWidth = window.innerWidth;
          const winHeight = window.innerHeight;

          const maxPanX = Math.max(0, (imgRect.width - winWidth) / 2 + 50);
          const maxPanY = Math.max(0, (imgRect.height - winHeight) / 2 + 50);

          setPan((prev) => ({
            x: Math.min(Math.max(prev.x, -maxPanX), maxPanX),
            y: Math.min(Math.max(prev.y, -maxPanY), maxPanY),
          }));
        }
      }
    } else if (remainingTouches === 1) {
      // Transition from pinch to single-finger pan
      gestureRef.current.isPinching = false;
      if (scale > 1.05) {
        gestureRef.current.isPanning = true;
        gestureRef.current.lastTouch = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        };
      }
    }
  };

  // Double Tap to toggle Zoom
  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    e.stopPropagation();
    const now = Date.now();
    const timeSinceLast = now - gestureRef.current.lastTapTime;

    if (timeSinceLast < 300) {
      // Double tap!
      if (scale > 1) {
        resetTransform();
      } else {
        const container = containerRef.current;
        if (container) {
          const rect = container.getBoundingClientRect();
          const clickX = e.clientX - (rect.left + rect.width / 2);
          const clickY = e.clientY - (rect.top + rect.height / 2);
          setScale(2.5);
          setPan({ x: -clickX * 1.5, y: -clickY * 1.5 });
        } else {
          setScale(2.5);
        }
      }
      gestureRef.current.lastTapTime = 0;
    } else {
      gestureRef.current.lastTapTime = now;
    }
  };

  // Desktop Mouse Wheel Zoom
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.3 : -0.3;
    setScale((prev) => {
      const next = Math.min(Math.max(prev + delta, 1), 4);
      if (next === 1) setPan({ x: 0, y: 0 });
      return next;
    });
  };

  if (!isOpen || images.length === 0) return null;

  return (
    <AnimatePresence>
      <div
        ref={containerRef}
        className="fixed inset-0 z-[100] flex items-center justify-center select-none overflow-hidden touch-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        onWheel={handleWheel}
      >
        {/* Dynamic Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black backdrop-blur-md"
          style={{ opacity: backdropOpacity }}
          onClick={() => {
            if (scale > 1) {
              resetTransform();
            } else {
              closeLightbox();
            }
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.95 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        />

        {/* Top Control Bar */}
        <div className="absolute top-0 left-0 right-0 p-4 sm:p-6 flex items-center justify-between z-[120] bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none">
          <div className="text-white/80 text-xs sm:text-sm font-semibold tracking-wide drop-shadow-md flex items-center gap-2">
            <span>{images.length > 1 ? `${currentIndex + 1} / ${images.length}` : ""}</span>
            {scale > 1 && (
              <span className="text-[11px] font-bold text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded-full border border-purple-500/30">
                {Math.round(scale * 100)}%
              </span>
            )}
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

        {/* Gesture & Sizing Container (Desktop 100% full-fit, Mobile swipe-down dismiss when 1x) */}
        <div
          className="relative w-full h-full flex items-center justify-center p-2 sm:p-6 md:p-10 pointer-events-auto"
          onClick={() => {
            if (scale > 1) {
              resetTransform();
            } else {
              closeLightbox();
            }
          }}
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
            className="relative flex items-center justify-center max-w-full max-h-full"
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <img
              ref={imgRef}
              src={images[currentIndex]}
              alt="Viewing preview"
              className="object-contain rounded-xl shadow-2xl pointer-events-auto select-none"
              style={{
                maxWidth: "92vw",
                maxHeight: "86vh",
                width: "auto",
                height: "auto",
                transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${scale})`,
                transition: isGesturing
                  ? "none"
                  : "transform 0.22s cubic-bezier(0.2, 0, 0.2, 1)",
                cursor: scale > 1 ? "grab" : "zoom-in",
                touchAction: "none",
                willChange: "transform",
              }}
              onClick={handleImageClick}
              draggable={false}
            />
          </motion.div>
        </div>

        {/* Navigation Arrows for multi-image galleries */}
        {images.length > 1 && scale === 1 && (
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
