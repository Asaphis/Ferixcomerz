import React from "react";

interface BrandLogoProps {
  size?: number;
}

export default function BrandLogo({ size = 32 }: BrandLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ filter: "drop-shadow(0 2px 8px rgba(2, 145, 192, 0.2))", flexShrink: 0 }}
    >
      <defs>
        <linearGradient id="logoGreen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#99BC0D" />
          <stop offset="100%" stopColor="#147115" />
        </linearGradient>
        <linearGradient id="logoGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#D69B04" />
          <stop offset="100%" stopColor="#935F04" />
        </linearGradient>
        <linearGradient id="logoBlue" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0291C0" />
          <stop offset="100%" stopColor="#012044" />
        </linearGradient>
      </defs>
      {/* Dynamic interlocking shield-ring concept representing high-end security and global commerce */}
      <path
        d="M60 10 L100 30 L100 70 C100 95 80 112 60 118 C40 112 20 95 20 70 L20 30 Z"
        stroke="url(#logoBlue)"
        strokeWidth="6"
        strokeLinejoin="round"
        fill="none"
        opacity="0.15"
      />
      {/* Blue Wing / Ribbon */}
      <path
        d="M25 45 C35 30, 55 35, 60 50 C65 65, 85 70, 95 55"
        stroke="url(#logoBlue)"
        strokeWidth="10"
        strokeLinecap="round"
        fill="none"
      />
      {/* Gold Ring */}
      <path
        d="M30 75 C40 60, 58 62, 60 70 C62 78, 80 80, 90 65"
        stroke="url(#logoGold)"
        strokeWidth="10"
        strokeLinecap="round"
        fill="none"
      />
      {/* Green Core Accent */}
      <circle cx="60" cy="60" r="12" fill="url(#logoGreen)" />
    </svg>
  );
}
