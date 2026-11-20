import React from 'react';

interface NovaLogoProps {
  size?: number;
  showText?: boolean;
  appName?: string;
  badge?: string;
  className?: string;
}

export const NovaLogo: React.FC<NovaLogoProps> = ({
  size = 24,
  showText = true,
  appName = 'NOVA IDE',
  badge = 'AI',
  className = ''
}) => {
  return (
    <div className={`flex items-center space-x-2.5 select-none ${className}`}>
      {/* Geometric Coding + Neural Diamond Logo Mark */}
      <div
        className="relative flex items-center justify-center rounded-lg p-0.5 group cursor-pointer transition-transform duration-300 hover:scale-105"
        style={{ width: size, height: size }}
      >
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full filter drop-shadow-[0_0_8px_rgba(168,85,247,0.35)]"
        >
          <defs>
            <linearGradient id="novaGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="50%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
            <linearGradient id="novaGlow" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#c084fc" stopOpacity="0.8" />
            </linearGradient>
            <filter id="novaBlur" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Outer Cyber Hexagon / Shield Frame */}
          <polygon
            points="24,3 43,14 43,34 24,45 5,34 5,14"
            stroke="url(#novaGradient1)"
            strokeWidth="2.5"
            strokeLinejoin="round"
            className="opacity-90"
            fill="rgba(15, 18, 30, 0.7)"
          />

          {/* Left Code Bracket < */}
          <path
            d="M 16 17 L 10 24 L 16 31"
            stroke="#22d3ee"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="drop-shadow-[0_0_4px_#06b6d4]"
          />

          {/* Right Code Bracket > */}
          <path
            d="M 32 17 L 38 24 L 32 31"
            stroke="#c084fc"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="drop-shadow-[0_0_4px_#a855f7]"
          />

          {/* Center Cosmic Nova / Neural Starburst Diamond */}
          <g transform="translate(24, 24)">
            {/* Primary 4-point Diamond */}
            <polygon
              points="0,-8 5,0 0,8 -5,0"
              fill="url(#novaGlow)"
              className="animate-pulse"
            />
            {/* Secondary diagonal star points */}
            <polygon
              points="0,-4 3,0 0,4 -3,0"
              transform="rotate(45)"
              fill="#ffffff"
            />
            {/* Center glowing focal point */}
            <circle cx="0" cy="0" r="1.5" fill="#ffffff" />
          </g>
        </svg>
      </div>

      {/* Brand Typography & Badge */}
      {showText && (
        <div className="flex items-center space-x-1.5 font-bold tracking-wider leading-none">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-purple-100 to-cyan-100 font-sans tracking-wide">
            {appName}
          </span>
          {badge && (
            <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-gradient-to-r from-purple-500/20 to-cyan-500/20 text-cyan-300 border border-cyan-400/30 shadow-[0_0_8px_rgba(6,182,212,0.25)]">
              {badge}
            </span>
          )}
        </div>
      )}
    </div>
  );
};