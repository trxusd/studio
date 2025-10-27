import type { SVGProps } from "react";

export function AppLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <defs>
        <linearGradient id="yellow-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))' }} />
          <stop offset="100%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 0.8 }} />
        </linearGradient>
        <linearGradient id="sky-blue-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#38bdf8' }} />
          <stop offset="100%" style={{ stopColor: '#0ea5e9' }} />
        </linearGradient>
        <linearGradient id="blue-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: 'hsl(var(--accent))' }} />
          <stop offset="100%" style={{ stopColor: 'hsl(var(--accent))' }} />
        </linearGradient>
      </defs>

      {/* Yellow Border Circle */}
      <circle cx="50" cy="50" r="48" fill="none" stroke="hsl(var(--primary))" strokeWidth="4" />

      {/* Main Hexagon (Ball) - Outline */}
      <path
        d="M50 8 L89.6 29.5 L89.6 70.5 L50 92 L10.4 70.5 L10.4 29.5 Z"
        fill="none"
        stroke="hsl(var(--foreground))"
        strokeWidth="1"
      />

      {/* Center Pentagon - Yellow */}
      <polygon
        points="50,36 67,47 59.5,68 40.5,68 33,47"
        fill="hsl(var(--primary))"
      />

      {/* Top Triangle - White */}
      <path d="M50 8 L62 31 L38 31 Z" fill="hsl(var(--foreground))" />

      {/* Right Triangle - Sky Blue */}
      <path d="M89.6 29.5 L69 39 L69 61 Z" fill="url(#sky-blue-gradient)" />

      {/* Bottom Right Triangle - White */}
      <path d="M89.6 70.5 L69 61 L59.5 68 L62 89 Z" fill="hsl(var(--foreground))" />

      {/* Bottom Left Triangle - Sky Blue */}
      <path d="M10.4 70.5 L31 61 L40.5 68 L38 89 Z" fill="url(#sky-blue-gradient)" />

      {/* Left Triangle - White */}
      <path d="M10.4 29.5 L31 39 L31 61 Z" fill="hsl(var(--foreground))" />

    </svg>
  );
}
