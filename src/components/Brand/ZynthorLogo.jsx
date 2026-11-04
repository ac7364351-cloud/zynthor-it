export default function ZynthorLogo({
  size = "md",
  collapsed = false,
  variant = "full",
  className = "",
  showBadge = true,
  badgeText = "BUSINESS OS",
  fullWidth = false,
}) {
  // Dimension presets
  const sizes = {
    sm: { icon: 28, text: "text-base", subtext: "text-[7.5px]", h: "h-7" },
    md: { icon: 34, text: "text-lg", subtext: "text-[8.5px]", h: "h-9" },
    lg: { icon: 40, text: "text-xl", subtext: "text-[9.5px]", h: "h-10" },
    xl: { icon: 48, text: "text-2xl", subtext: "text-[11px]", h: "h-12" },
  };

  const s = sizes[size] || sizes.md;
  const isIconOnly = collapsed || variant === "icon";

  return (
    <div
      className={`inline-flex items-center gap-2.5 select-none transition-all duration-200 bg-transparent ${
        collapsed ? "justify-center w-full" : fullWidth ? "w-full justify-between" : ""
      } ${className}`}
      style={{ background: "transparent" }}
    >
      <div className={`flex items-center gap-2.5 ${collapsed ? "justify-center" : ""}`}>
        {/* 100% Vector Transparent Shield Emblem — No Opaque Rect, No White Box */}
        <svg
          width={s.icon}
          height={s.icon}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="shrink-0 transition-transform duration-300 hover:scale-105"
          style={{ background: "transparent" }}
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
            <linearGradient id="zyTraverseGrad" x1="17" y1="16" x2="37" y2="33" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#c5a46d" />
            </linearGradient>
          </defs>

          {/* Clean Vector Outline — 100% Transparent Background */}
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

          {/* Diagonal Traverse with Obsidian Gold Gradient */}
          <path d="M34 16 L17 33 H26 L37 19 L34 16Z" fill="url(#zyTraverseGrad)" />

          {/* Bottom Bar */}
          <path d="M12 36 L15 30 H29 L35 36 H12Z" fill="url(#zyEmblemGrad)" />

          {/* Central Pulse Node */}
          <circle cx="24" cy="24" r="2" fill="#38bdf8" />
        </svg>

        {/* Wordmark (hidden in collapsed mode) */}
        {!isIconOnly && (
          <div className="flex flex-col leading-none min-w-0">
            <div className="flex items-center gap-1.5">
              <span
                className={`${s.text} font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-sky-300 to-amber-200 bg-clip-text text-transparent`}
              >
                ZYNTHOR
              </span>
              {showBadge && (
                <span
                  className={`${s.subtext} font-mono font-bold tracking-widest px-1.5 py-0.5 rounded-md border border-amber-500/30 bg-amber-950/40 text-amber-300 dark:text-amber-200 shrink-0 uppercase`}
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
    </div>
  );
}
