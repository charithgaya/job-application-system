import React from "react";

interface LogoProps {
  className?: string;
  withText?: boolean;
}

export default function Logo({ className = "w-8 h-8", withText = false }: LogoProps) {
  const logoMark = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      className={`shrink-0 ${className}`}
      fill="none"
    >
      {/* Light blue background base */}
      <rect x="10" y="25" width="80" height="60" rx="16" fill="#EFF6FF" />
      
      {/* Briefcase Handle */}
      <path
        d="M35 30 V22 C35 16.477 39.477 12 45 12 H55 C60.523 12 65 16.477 65 22 V30"
        stroke="#2563EB"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Briefcase Body */}
      <rect
        x="15"
        y="30"
        width="70"
        height="50"
        rx="12"
        stroke="#2563EB"
        strokeWidth="8"
        strokeLinejoin="round"
        fill="#FFFFFF"
      />
      
      {/* Document Lines */}
      <line x1="30" y1="46" x2="48" y2="46" stroke="#2563EB" strokeWidth="6" strokeLinecap="round" />
      <line x1="30" y1="58" x2="40" y2="58" stroke="#2563EB" strokeWidth="6" strokeLinecap="round" />

      {/* Magnifying Glass (Search/Target) overlay in Orange */}
      <circle cx="68" cy="68" r="14" fill="#FFFFFF" stroke="#F97316" strokeWidth="6" />
      <path d="M78 78 L90 90" stroke="#F97316" strokeWidth="8" strokeLinecap="round" />
    </svg>
  );

  if (!withText) {
    return logoMark;
  }

  return (
    <div className="flex items-center gap-3">
      {logoMark}
      <span className="text-xl font-extrabold tracking-tight text-[#1E293B]">
        Job Portal
      </span>
    </div>
  );
}
