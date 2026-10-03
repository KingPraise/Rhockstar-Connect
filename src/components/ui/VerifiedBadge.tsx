"use client";

import { CheckCircle2 } from "lucide-react";

interface VerifiedBadgeProps {
  tier?: 'free' | 'pro' | 'elite' | string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function VerifiedBadge({ tier, size = 'sm', className = '' }: VerifiedBadgeProps) {
  if (!tier || tier === 'free') return null;

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const isElite = tier === 'elite';

  return (
    <span 
      className={`inline-flex items-center shrink-0 ${isElite ? 'text-amber-400' : 'text-brand'} ${className}`} 
      title={isElite ? "Elite Verified Member" : "Pro Verified Member"}
    >
      <CheckCircle2 className={`${iconSizes[size]} fill-current text-slate-950`} />
    </span>
  );
}
