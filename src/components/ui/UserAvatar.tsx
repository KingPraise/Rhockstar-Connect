"use client";

import { useState } from "react";

interface UserAvatarProps {
  src?: string | null;
  name?: string | null;
  className?: string;
  textClassName?: string;
  size?: string; // e.g. "w-10 h-10" or "w-16 h-16"
}

export default function UserAvatar({
  src,
  name,
  className = "w-12 h-12",
  textClassName = "text-base font-bold",
}: UserAvatarProps) {
  const [imgError, setImgError] = useState(false);

  const getInitials = (): string => {
    if (name && name.trim().length > 0) {
      const parts = name.trim().split(" ").filter(Boolean);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return parts[0].substring(0, 2).toUpperCase();
    }
    if (src && !isUrl(src)) {
      return src.substring(0, 2).toUpperCase();
    }
    return "??";
  };

  const isUrl = (val?: string | null): boolean => {
    if (!val) return false;
    const str = val.trim();
    return (
      str.startsWith("http://") ||
      str.startsWith("https://") ||
      str.startsWith("/") ||
      str.startsWith("data:") ||
      str.length > 10
    );
  };

  const shouldRenderImage = isUrl(src) && !imgError;

  return (
    <div
      className={`rounded-full bg-gradient-to-br from-brand to-brand-purple flex items-center justify-center shadow-md overflow-hidden shrink-0 relative ${className}`}
    >
      {shouldRenderImage ? (
        <img
          src={src!}
          alt={name || "User Avatar"}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className={`text-white select-none ${textClassName}`}>
          {getInitials()}
        </span>
      )}
    </div>
  );
}
