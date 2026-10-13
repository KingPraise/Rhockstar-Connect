"use client";


interface VerifiedBadgeProps {
  tier?: 'free' | 'pro' | 'elite' | string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function VerifiedBadge({ tier, size = 'sm', className = '' }: VerifiedBadgeProps) {
  if (!tier || tier === 'free') return null;

  const isElite = tier === 'elite';

  const sizeDimensions = {
    sm: { width: 16, height: 16, checkSize: 'w-2.5 h-2.5' },
    md: { width: 18, height: 18, checkSize: 'w-3 h-3' },
    lg: { width: 22, height: 22, checkSize: 'w-3.5 h-3.5' },
  }[size] || { width: 16, height: 16, checkSize: 'w-2.5 h-2.5' };

  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 align-middle ${className}`}
      title={isElite ? "Elite Verified Member" : "Verified Member"}
    >
      <svg
        width={sizeDimensions.width}
        height={sizeDimensions.height}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-sm"
      >
        {/* Scalloped badge background */}
        <path
          d="M10.243 2.257a2.5 2.5 0 0 1 3.514 0l.69.69a1 1 0 0 0 .973.26l.942-.252a2.5 2.5 0 0 1 3.044 1.758l.252.942a1 1 0 0 0 .688.688l.942.252a2.5 2.5 0 0 1 1.758 3.044l-.252.942a1 1 0 0 0 .26.973l.69.69a2.5 2.5 0 0 1 0 3.514l-.69.69a1 1 0 0 0-.26.973l.252.942a2.5 2.5 0 0 1-1.758 3.044l-.942.252a1 1 0 0 0-.688.688l-.252.942a2.5 2.5 0 0 1-3.044 1.758l-.942-.252a1 1 0 0 0-.973.26l-.69.69a2.5 2.5 0 0 1-3.514 0l-.69-.69a1 1 0 0 0-.973-.26l-.942.252a2.5 2.5 0 0 1-3.044-1.758l-.252-.942a1 1 0 0 0-.688-.688l-.942-.252a2.5 2.5 0 0 1-1.758-3.044l.252-.942a1 1 0 0 0-.26-.973l-.69-.69a2.5 2.5 0 0 1 0-3.514l.69-.69a1 1 0 0 0 .26-.973l-.252-.942a2.5 2.5 0 0 1 1.758-3.044l.942-.252a1 1 0 0 0 .688-.688l.252-.942a2.5 2.5 0 0 1 3.044-1.758l.942.252a1 1 0 0 0 .973-.26l.69-.69Z"
          fill={isElite ? "#F59E0B" : "#3B82F6"}
        />
        {/* Crisp checkmark */}
        <path
          d="M8.5 12.5L11 15L16 9.5"
          stroke="#FFFFFF"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
