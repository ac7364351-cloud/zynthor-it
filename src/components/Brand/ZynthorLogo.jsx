export default function ZynthorLogo({
  size = "md",
  collapsed = false,
  variant = "full",
  className = "",
  showBadge = true,
  badgeText = "BUSINESS OS",
}) {
  // Dimensions
  const sizes = {
    sm: { icon: 28, text: "text-base", subtext: "text-[7.5px]", h: "h-7" },
    md: { icon: 34, text: "text-lg", subtext: "text-[8.5px]", h: "h-9" },
    lg: { icon: 42, text: "text-xl", subtext: "text-[9.5px]", h: "h-11" },
    xl: { icon: 52, text: "text-2xl", subtext: "text-[11px]", h: "h-14" },
  };

  const s = sizes[size] || sizes.md;
  const isIconOnly = collapsed || variant === "icon";

  return (
    <div
      className={`inline-flex items-center gap-2.5 select-none transition-all duration-200 ${
        collapsed ? "justify-center" : ""
      } ${className}`}
    >
      {/* 100% Vector Transparent Shield Emblem */}
      <svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-300 hover:scale-105"
        aria-label="Zynthor Logo Emblem"
      >
        <defs>
          <linearGradient id="zyEmblemGrad" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
          <linearGradient id="zyCircuitGrad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.45" />
          </linearGradient>
        </defs>

        {/* Clean Vector Outline — 100% Transparent Background (No Opaque Rect) */}
        <rect
          x="2.5"
          y="2.5"
          width="43"
          height="43"
          rx="12"
          fill="none"
          stroke="url(#zyCircuitGrad)"
          strokeWidth="1.75"
        />

        {/* Circuit Traces */}
        <path d="M9 14 L18 14 L21 17" stroke="url(#zyCircuitGrad)" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="9" cy="14" r="1.75" fill="#38bdf8" />

        <path d="M39 34 L30 34 L27 31" stroke="url(#zyCircuitGrad)" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="39" cy="34" r="1.75" fill="#38bdf8" />

        {/* Geometric High-Precision Z Structure */}
        {/* Top Bar */}
        <path d="M14 12 H36 L33 18 H20 L14 12Z" fill="url(#zyEmblemGrad)" />

        {/* High-Contrast Diagonal Traverse (Always crisp white for visibility) */}
        <path d="M34 16 L17 33 H26 L37 19 L34 16Z" fill="#ffffff" />

        {/* Bottom Bar */}
        <path d="M12 36 L15 30 H29 L35 36 H12Z" fill="url(#zyEmblemGrad)" />

        {/* Central Pulse Node */}
        <circle cx="24" cy="24" r="2" fill="#38bdf8" />
      </svg>

      {/* Wordmark (hidden in collapsed icon mode) */}
      {!isIconOnly && (
        <div className="flex flex-col leading-none min-w-0">
          <div className="flex items-center gap-1.5">
            <span
              className={`${s.text} font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-indigo-400 to-sky-300 bg-clip-text text-transparent`}
            >
              ZYNTHOR
            </span>
            {showBadge && (
              <span
                className={`${s.subtext} font-mono font-bold tracking-widest px-1.5 py-0.5 rounded-md border border-blue-500/30 bg-blue-950/40 text-blue-400 shrink-0 uppercase`}
              >
                {badgeText}
              </span>
            )}
          </div>
          <span className="text-[9px] uppercase tracking-[0.2em] font-medium text-theme-muted mt-0.5 truncate">
            Autonomous Business OS
          </span>
        </div>
      )}
    </div>
  );
}
