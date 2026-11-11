"use client";

import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw } from 'lucide-react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}

export default function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const [currentY, setCurrentY] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const startYRef = useRef(0);
  const isRefreshingRef = useRef(false);
  isRefreshingRef.current = isRefreshing;
  
  const MAX_PULL = 90;
  const THRESHOLD = 65;
  
  useEffect(() => {
    const scrollParent = document.getElementById('main-scroll-container');
    if (!scrollParent) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (scrollParent.scrollTop <= 0) {
        startYRef.current = e.touches[0].clientY;
      } else {
        startYRef.current = 0;
      }
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (startYRef.current === 0 || isRefreshingRef.current) return;
      
      const y = e.touches[0].clientY;
      const diff = y - startYRef.current;
      
      if (diff > 0 && scrollParent.scrollTop <= 0) {
        setIsPulling(true);
        setCurrentY(Math.min(diff * 0.45, MAX_PULL));
      } else {
        if (isPulling) {
          setIsPulling(false);
          setCurrentY(0);
        }
      }
    };
    
    const handleTouchEnd = async () => {
      startYRef.current = 0;
      if (!isPulling || isRefreshingRef.current) return;
      
      if (currentY >= THRESHOLD * 0.45) {
        setIsRefreshing(true);
        setCurrentY(40);
        
        try {
          await onRefresh();
        } catch (e) {
          console.error(e);
        }
        
        setIsRefreshing(false);
      }
      
      setIsPulling(false);
      setCurrentY(0);
    };
    
    scrollParent.addEventListener('touchstart', handleTouchStart, { passive: true });
    scrollParent.addEventListener('touchmove', handleTouchMove, { passive: true });
    scrollParent.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    return () => {
      scrollParent.removeEventListener('touchstart', handleTouchStart);
      scrollParent.removeEventListener('touchmove', handleTouchMove);
      scrollParent.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onRefresh, isPulling, currentY]);

  const showIndicator = isPulling || isRefreshing;

  return (
    <div className="relative w-full">
      {/* Floating Refresh Indicator Pill */}
      {showIndicator && (
        <div 
          className="fixed top-16 left-0 right-0 flex justify-center items-center z-50 pointer-events-none transition-transform duration-150"
          style={{ 
            transform: `translateY(${isRefreshing ? 16 : Math.max(0, currentY - 20)}px)`,
            opacity: showIndicator ? 1 : 0
          }}
        >
          <div className="bg-slate-900/95 border border-purple-500/30 rounded-full px-3.5 py-1.5 shadow-2xl backdrop-blur-md flex items-center gap-2 text-xs font-bold text-purple-300">
            <RefreshCw 
              className={`w-3.5 h-3.5 text-purple-400 ${isRefreshing ? 'animate-spin' : ''}`}
              style={{ 
                transform: !isRefreshing ? `rotate(${currentY * 4}deg)` : 'none'
              }}
            />
            <span>{isRefreshing ? 'Refreshing...' : 'Pull to refresh'}</span>
          </div>
        </div>
      )}
      
      {/* Feed Children render directly with zero layout interference */}
      {children}
    </div>
  );
}
