import { cn } from "@/lib/utils";

/**
 * Sai's StudyMate AI logo — glowing "S" with AI orbit ring.
 * Pure SVG, scales cleanly, themable via currentColor.
 */
export function Logo({
  className,
  size = 36,
  withWordmark = false,
}: {
  className?: string;
  size?: number;
  withWordmark?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className="relative grid place-items-center rounded-xl"
        style={{ width: size, height: size }}
      >
        <svg
          viewBox="0 0 64 64"
          width={size}
          height={size}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-[0_0_12px_oklch(0.7_0.24_295/0.6)]"
        >
          <defs>
            <linearGradient id="logoGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="oklch(0.78 0.2 230)" />
              <stop offset="100%" stopColor="oklch(0.7 0.24 295)" />
            </linearGradient>
            <linearGradient id="logoGrad2" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="oklch(0.82 0.16 200)" />
              <stop offset="100%" stopColor="oklch(0.7 0.24 295)" />
            </linearGradient>
          </defs>

          {/* Rounded square base */}
          <rect x="2" y="2" width="60" height="60" rx="16" fill="url(#logoGrad)" opacity="0.18" />
          <rect x="2" y="2" width="60" height="60" rx="16" stroke="url(#logoGrad)" strokeWidth="1.5" />

          {/* Orbit ring */}
          <ellipse
            cx="32"
            cy="32"
            rx="24"
            ry="9"
            stroke="url(#logoGrad2)"
            strokeWidth="1.2"
            opacity="0.55"
            transform="rotate(-25 32 32)"
          />
          <circle cx="54" cy="22" r="2" fill="oklch(0.82 0.16 200)" />

          {/* Stylized S */}
          <path
            d="M42 22 C42 17, 37 14, 30 14 C22 14, 18 18, 18 23 C18 28, 23 30, 30 31 C38 32, 44 34, 44 41 C44 47, 38 50, 30 50 C22 50, 17 47, 17 41"
            stroke="url(#logoGrad)"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </div>

      {withWordmark && (
        <div className="flex flex-col leading-tight">
          <span className="font-display font-semibold tracking-tight text-foreground text-base">
            Sai's <span className="text-gradient">StudyMate</span>
          </span>
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            AI Tutor
          </span>
        </div>
      )}
    </div>
  );
}
