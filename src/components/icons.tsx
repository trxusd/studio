import type { SVGProps } from "react";

export function AppLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m12 14 4-4" />
      <path d="M12 14 8 10" />
      <path d="M12 2a10 10 0 1 0 10 10" />
      <path d="M12 22a10 10 0 0 0-9.7-7.85" />
      <path d="M21.7 14.15a10 10 0 0 0-9.7-12.05" />
    </svg>
  );
}
