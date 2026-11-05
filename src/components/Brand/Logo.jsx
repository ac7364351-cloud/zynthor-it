const Logo = ({ size = "md", showWordmark = true, className = "" }) => {
  // Dimension presets for consistent scaling
  const dimensions = {
    sm: { iconSize: 28, textClass: "text-lg", subtextClass: "text-[8px]" },
    md: { iconSize: 36, textClass: "text-xl", subtextClass: "text-[9px]" },
    lg: { iconSize: 44, textClass: "text-2xl", subtextClass: "text-[10px]" },
  };

  const { iconSize, textClass, subtextClass } = dimensions[size] || dimensions.md;

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Geometric Circuit-Tech Z Icon */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-300 group-hover:scale-105"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="zynthorGradPrimary" x1="4" y1="8" x2="60" y2="56" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
          <linearGradient id="zynthorGradCircuit" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* Outer Tech Container */}
        <rect
          x="2"
          y="2"
          width="60"
          height="60"
          rx="14"
          fill="#090d16"
          stroke="#1e293b"
          strokeWidth="2"
        />

        {/* Circuit Tracks */}
        <path
          d="M12 18 L24 18 L28 22"
          stroke="url(#zynthorGradCircuit)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="12" cy="18" r="2" fill="#38bdf8" />

        <path
          d="M52 46 L40 46 L36 42"
          stroke="url(#zynthorGradCircuit)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="52" cy="46" r="2" fill="#38bdf8" />

        {/* Bold Geometric Z Structure */}
        {/* Top Horizontal Bar */}
        <path
          d="M18 16 H48 L44 24 H26 L18 16Z"
          fill="url(#zynthorGradPrimary)"
        />

        {/* Diagonal Traverse with High-Precision Angle */}
        <path
          d="M45 22 L23 44 H34 L49 26 L45 22Z"
          fill="#f8fafc"
        />

        {/* Bottom Horizontal Bar */}
        <path
          d="M16 48 L20 40 H38 L46 48 H16Z"
          fill="url(#zynthorGradPrimary)"
        />

        {/* Subtle Circuit Interconnect Pulse */}
        <circle cx="32" cy="32" r="2.5" fill="#38bdf8" />
      </svg>

      {/* Wordmark */}
      {showWordmark && (
        <div className="flex flex-col leading-none">
          <span className={`${textClass} font-bold tracking-tight text-white group-hover:text-blue-400 transition-colors`}>
            Zynthor <span className="text-blue-500 font-extrabold">IT</span>
          </span>
          <span className={`${subtextClass} uppercase tracking-[0.22em] text-slate-400 font-semibold mt-1`}>
            Digital Engineering
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
