'use client';
import { useEffect, useState } from "react";

export default function ScrollPaddingController() {
  const [padding, setPadding] = useState('6rem'); // 24 = 6rem

  useEffect(() => {
    let lastScrollY = 0;
    const handleScroll = (e: Event) => {
      const currentScrollY = (e.target as HTMLElement).scrollTop;
      
      if (currentScrollY > lastScrollY + 10 && currentScrollY > 50) {
        setPadding('0rem'); // Hide padding
      } else if (currentScrollY < lastScrollY - 10 || currentScrollY < 50) {
        setPadding('6rem'); // Show padding
      }
      
      lastScrollY = currentScrollY;
    };

    document.getElementById("main-scroll-container")?.addEventListener("scroll", handleScroll, { passive: true });
    return () => document.getElementById("main-scroll-container")?.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty('--dynamic-bottom-padding', padding);
  }, [padding]);

  return null;
}
