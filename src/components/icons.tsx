import type { SVGProps } from "react";

export function AppLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(var(--primary))" />
          <stop offset="100%" stopColor="hsl(45 93% 60%)" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill="hsl(var(--background))" stroke="url(#grad1)" strokeWidth="4" />
      <g transform="translate(50, 50) scale(0.9)">
        <polygon points="0,-30 28.5,-15 17.5,24 -17.5,24 -28.5,-15" fill="hsl(45 93% 47% / 0.8)" />
        <path d="M 0,-32 V -42 L 8,-37 V-32 Z" fill="hsl(210 100% 98% / 0.9)" />
        <path d="M 29,-16 L 39,-10 L 39,0 L 29,-6 Z" fill="hsl(210 100% 98% / 0.9)" />
        <path d="M 18,25 L 24,35 L 14,40 L 8,30 Z" fill="hsl(210 100% 98% / 0.9)" />
        <path d="M -18,25 L -24,35 L -14,40 L -8,30 Z" fill="hsl(200 80% 60% / 0.9)" />
        <path d="M -29,-16 L -39,-10 L -39,0 L -29,-6 Z" fill="hsl(200 80% 60% / 0.9)" />
        <path d="M 0,-30 L -12, -22 V -12 L 0, -20 V -30 Z" fill="hsl(var(--background))" />
        <path d="M 0,-30 L 12, -22 V -12 L 0, -20 V -30 Z" fill="hsl(var(--card))" />
        <path d="M 28.5, -15 L 12, -22 V -12 L 23, -5 Z" fill="hsl(var(--background))" />
        <path d="M -28.5, -15 L -12, -22 V -12 L -23, -5 Z" fill="hsl(var(--card))" />
        <path d="M -17.5, 24 L -12, 10 L 0, 18 L -12, 28 Z" fill="hsl(var(--background))" />
        <path d="M 17.5, 24 L 12, 10 L 0, 18 L 12, 28 Z" fill="hsl(var(--card))" />
        <path d="M 0, 18 L -12, 10 L -12, -12 L 0, -20 L 12, -12 L 12, 10 Z" fill="hsl(var(--background))" opacity="0.5" />
      </g>
    </svg>
  );
}
