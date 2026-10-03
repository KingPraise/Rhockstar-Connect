import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = ""
}: EmptyStateProps) {
  return (
    <div className={`w-full max-w-md mx-auto text-center py-16 px-6 ${className}`}>
      <div className="mx-auto w-24 h-24 mb-6 rounded-full bg-slate-800/50 flex items-center justify-center border border-white/5 relative">
        <div className="absolute inset-0 bg-brand/10 rounded-full blur-xl" />
        <Icon className="w-12 h-12 text-slate-400 relative z-10" />
      </div>
      <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">{title}</h3>
      <p className="text-slate-400 leading-relaxed mb-8">{description}</p>
      
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="neo-button"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
