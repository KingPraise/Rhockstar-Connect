"use client";

import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw } from 'lucide-react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}

export default function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  
  const MAX_PULL = 100; // pixels
  const THRESHOLD = 70;
  
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      const scrollParent = document.getElementById('main-scroll-container');
      // Only pull if we're at the top of the container
      if (scrollParent && scrollParent.scrollTop <= 0) {
        setStartY(e.touches[0].clientY);
      } else {
        setStartY(0);
      }
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (startY === 0 || isRefreshing) return;
      
      const y = e.touches[0].clientY;
      const diff = y - startY;
      
      const scrollParent = document.getElementById('main-scroll-container');
      // Only care about pulling down
      if (diff > 0 && scrollParent && scrollParent.scrollTop <= 0) {
        setIsPulling(true);
        setCurrentY(Math.min(diff, MAX_PULL));
        // Prevent default scrolling when pulling to refresh
        if (e.cancelable) e.preventDefault();
      }
    };
    
    const handleTouchEnd = async () => {
      if (!isPulling || isRefreshing) return;
      
      if (currentY >= THRESHOLD) {
        setIsRefreshing(true);
        setCurrentY(50); // Hold at a certain distance while refreshing
        
        try {
          await onRefresh();
        } catch (e) {
          console.error(e);
        }
        
        setIsRefreshing(false);
      }
      
      setIsPulling(false);
      setCurrentY(0);
      setStartY(0);
    };
    
    const container = containerRef.current;
    if (container) {
      container.addEventListener('touchstart', handleTouchStart, { passive: true });
      container.addEventListener('touchmove', handleTouchMove, { passive: false });
      container.addEventListener('touchend', handleTouchEnd);
      
      return () => {
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchmove', handleTouchMove);
        container.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [startY, currentY, isPulling, isRefreshing, onRefresh]);

  return (
    <div className="relative w-full h-full">
      {/* Refresh Indicator */}
      <div 
        className="absolute top-0 left-0 right-0 flex justify-center items-center z-50 pointer-events-none transition-transform duration-200"
        style={{ 
          transform: `translateY(${isRefreshing ? 20 : (isPulling ? currentY - 40 : -50)}px)`,
          opacity: (isPulling || isRefreshing) ? 1 : 0
        }}
      >
        <div className="bg-slate-800 border border-white/10 rounded-full p-2 shadow-lg">
          <RefreshCw 
            className={`w-6 h-6 text-brand-purple ${isRefreshing ? 'animate-spin' : ''}`}
            style={{ 
              transform: !isRefreshing ? `rotate(${currentY * 3}deg)` : 'none'
            }}
          />
        </div>
      </div>
      
      {/* Content Container */}
      <div 
        ref={containerRef}
        className="w-full h-full transition-transform duration-200"
        style={{
          transform: `translateY(${isRefreshing ? 50 : (isPulling ? currentY * 0.5 : 0)}px)`
        }}
      >
        {children}
      </div>
    </div>
  );
}
