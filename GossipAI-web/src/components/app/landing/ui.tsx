import type { ReactNode } from "react";

export const APPLE_PATH =
  "M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8s-105-37.5-155.5-127.4C46.7 790.7 0 663 0 541.8c0-207.5 135.4-317.3 269-317.3 70.5 0 129.5 46.4 174 46.4 43 0 110.6-49 193.9-49 31.3 0 113.7 2.9 169.9 87.1zm-234.8-181.9c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z";

export function PlayIcon({ light = false }: { light?: boolean }) {
  const id = light ? "L" : "D";
  return (
    <svg viewBox="0 0 512 512" className="h-6 w-6 shrink-0" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`gp4${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={light ? "#aaeecc" : "#32a071"} />
          <stop offset="100%" stopColor={light ? "#88ffbb" : "#00e887"} />
        </linearGradient>
        <linearGradient id={`gp1${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={light ? "#9af0ff" : "#00c3ff"} />
          <stop offset="100%" stopColor={light ? "#7fffff" : "#1de9b6"} />
        </linearGradient>
        <linearGradient id={`gp2${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={light ? "#ffe566" : "#ffbc00"} />
          <stop offset="100%" stopColor={light ? "#ffb066" : "#ff4c00"} />
        </linearGradient>
        <linearGradient id={`gp3${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={light ? "#ff9090" : "#e5405e"} />
          <stop offset="100%" stopColor={light ? "#ffb066" : "#ff6b00"} />
        </linearGradient>
      </defs>
      <path fill={`url(#gp4${id})`} d="M54 50L271 256 54 462c-16-11-27-29-27-52V102c0-23 11-41 27-52z" />
      <path fill={`url(#gp1${id})`} d="M399 204l-56-32L271 256l72 72 57-33c24-14 38-38 38-64s-14-50-39-27z" transform="translate(-1,0)" />
      <path fill={`url(#gp2${id})`} d="M54 462l217-206 72 72-234 135c-20 12-41 11-55-1z" />
      <path fill={`url(#gp3${id})`} d="M54 50c14-12 35-13 55-2l234 135-72 73L54 50z" />
    </svg>
  );
}

export function StoreBadge({
  href,
  label,
  eyebrow,
  title,
  icon,
  dark = false,
}: {
  href: string;
  label: string;
  eyebrow: string;
  title: string;
  icon: ReactNode;
  dark?: boolean;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className={
        dark
          ? "inline-flex h-13 items-center gap-3 rounded-[10px] border border-white/30 bg-white/10 px-5 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
          : "inline-flex h-13 items-center gap-3 rounded-[10px] bg-black px-5 text-white transition-opacity hover:opacity-80"
      }
    >
      {icon}
      <div className="flex flex-col items-start leading-tight">
        <span className={`text-[10px] font-normal tracking-wide ${dark ? "text-white/70" : ""}`}>{eyebrow}</span>
        <span className="text-[17px] font-semibold tracking-tight">{title}</span>
      </div>
    </a>
  );
}

