// components/AudioIcons.tsx
import React, { SVGProps } from "react";

interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

export function PlayIcon({ size = 24, className = "", ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      {...props}
    >
      <circle
        cx="12"
        cy="12"
        r="11"
        fill="rgba(252, 108, 20, 1)"
        stroke="rgba(255, 255, 255, 0.3)"
        strokeWidth="0.5"
      />
      <polygon points="9.5,7.5 16.5,12 9.5,16.5" fill="white" />
    </svg>
  );
}

export function PauseIcon({ size = 24, className = "", ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      {...props}
    >
      <circle
        cx="12"
        cy="12"
        r="11"
        fill="rgba(0, 0, 0, 0.8)"
        stroke="rgba(255, 255, 255, 0.3)"
        strokeWidth="0.5"
      />
      <rect x="9" y="7.5" width="2.5" height="9" fill="white" rx="0.5" />
      <rect x="12.5" y="7.5" width="2.5" height="9" fill="white" rx="0.5" />
    </svg>
  );
}

export function SkipBackIcon({ size = 24, className = "", ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      {...props}
    >
      <circle
        cx="12"
        cy="12"
        r="11"
        fill="rgba(252, 108, 20, 1)"
        stroke="rgba(255, 255, 255, 0.3)"
        strokeWidth="0.5"
      />
      {/* Strzałka w lewo */}
      <polygon points="14,9 11,12 14,15" fill="white" />
      <polygon points="11,9 8,12 11,15" fill="white" />
    </svg>
  );
}

export function SkipForwardIcon({ size = 24, className = "", ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      {...props}
    >
      <circle
        cx="12"
        cy="12"
        r="11"
        fill="rgba(252, 108, 20, 1)"
        stroke="rgba(255, 255, 255, 0.3)"
        strokeWidth="0.5"
      />
      {/* Strzałka w prawo */}
      <polygon points="10,9 13,12 10,15" fill="white" />
      <polygon points="13,9 16,12 13,15" fill="white" />
    </svg>
  );
}
