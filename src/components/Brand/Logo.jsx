import ZynthorLogo from "./ZynthorLogo";

export default function Logo({
  size = "md",
  showWordmark = true,
  className = "",
  collapsed = false,
}) {
  return (
    <ZynthorLogo
      size={size}
      collapsed={collapsed || !showWordmark}
      variant={showWordmark ? "full" : "icon"}
      className={className}
      badgeText="IT"
    />
  );
}
