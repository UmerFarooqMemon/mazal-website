"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useTheme } from "@/context/ThemeContext";
import { resolveMediaUrl } from "@/lib/api-config";

function userInitials(name?: string | null) {
  return (
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U"
  );
}

interface UserAvatarProps {
  name?: string | null;
  imageUrl?: string | null;
  className?: string;
  textClassName?: string;
  showOnlineDot?: boolean;
  ring?: boolean;
}

export default function UserAvatar({
  name,
  imageUrl,
  className = "h-9 w-9",
  textClassName = "text-sm",
  showOnlineDot = false,
  ring = false,
}: UserAvatarProps) {
  const { getColor, getGradient } = useTheme();
  const initials = userInitials(name);
  const resolvedImageUrl = resolveMediaUrl(imageUrl);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [resolvedImageUrl]);

  const showImage = Boolean(resolvedImageUrl) && !imageError;

  const ringStyle = ring
    ? {
        boxShadow: `0 0 0 2px ${getColor("surface")}, 0 0 0 4px ${getColor("primary")}30`,
      }
    : undefined;

  return (
    <div className={`relative shrink-0 ${className}`}>
      {showImage ? (
        <div
          className={`relative h-full w-full overflow-hidden rounded-full shadow-sm`}
          style={ringStyle}
        >
          <Image
            src={resolvedImageUrl!}
            alt={name || "Profile"}
            fill
            className="object-cover"
            unoptimized
            onError={() => setImageError(true)}
          />
        </div>
      ) : (
        <div
          className={`flex h-full w-full items-center justify-center rounded-full font-semibold text-white shadow-sm ${textClassName}`}
          style={{
            background: getGradient("primaryButton"),
            ...ringStyle,
          }}
        >
          {initials}
        </div>
      )}
      {showOnlineDot ? (
        <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500" />
      ) : null}
    </div>
  );
}
