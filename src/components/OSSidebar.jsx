import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FiGrid,
  FiUsers,
  FiScissors,
  FiCoffee,
  FiCpu,
  FiZap,
  FiBarChart2,
  FiSettings,
  FiCreditCard,
  FiExternalLink,
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiLogOut,
  FiShield,
  FiEdit3,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import ZynthorLogo from "./Brand/ZynthorLogo";

export default function OSSidebar({
  isOpen,
  onClose,
  isCollapsed = false,
  onToggleCollapse,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, business, logout } = useAuth();

  const isCurrent = (path) => {
    if (path === "/dashboard") {
      return (
        location.pathname === "/" ||
        location.pathname === "/dashboard" ||
        location.pathname === "/app" ||
        location.pathname === "/business"
      );
    }
    if (path === "/admin") {
      return (
        location.pathname === "/admin" ||
        location.pathname === "/app/admin" ||
        location.pathname === "/business-management" ||
        location.pathname === "/app/business-management"
      );
    }
    return (
      location.pathname === path ||
      location.pathname === `/app${path}` ||
      location.pathname.startsWith(`${path}/`) ||
      location.pathname.startsWith(`/app${path}/`)
    );
  };

  const navGroups = [
    {
      group: "Core Workspace",
      items: [
        { label: "Dashboard", path: "/dashboard", icon: FiGrid },
        { label: "Inbound Leads & CRM", path: "/leads", icon: FiUsers },
        { label: "Customer Directory", path: "/customers", icon: FiUsers },
      ],
    },
    {
      group: "Vertical Suites",
      items: [
        {
          label: "Salon & Spa Suite",
          path: "/salon",
          icon: FiScissors,
          badge: business?.industry === "salon" ? "Active" : null,
        },
        {
          label: "Cafe & Restaurant",
          path: "/cafe",
          icon: FiCoffee,
          badge: business?.industry === "cafe" ? "Active" : null,
        },
      ],
    },
    {
      group: "Administration",
      items: [
        {
          label: "Super Admin & Tenants",
          path: "/admin",
          icon: FiShield,
          badge: user?.role === "owner" || user?.role === "admin" ? "Admin" : null,
        },
      ],
    },
    {
      group: "Intelligence",
      items: [
        { label: "Zynthor AI Copilot", path: "/ai-bot", icon: FiCpu, badge: "AI" },
        { label: "Automation Rules", path: "/automation", icon: FiZap },
        { label: "Analytics & Reports", path: "/reports", icon: FiBarChart2 },
      ],
    },
    {
      group: "Organization",
      items: [
        { label: "Brand & Website Editor", path: "/brand-editor", icon: FiEdit3 },
        { label: "Settings & Team", path: "/settings", icon: FiSettings },
        { label: "Plans & Invoices", path: "/plans", icon: FiCreditCard },
      ],
    },
  ];

  // User display initial — Default "A"
  const userInitial = user?.name ? user.name.trim().charAt(0).toUpperCase() : "A";

  const handleSignOut = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar Element:
          - Desktop (lg:): In-flow flex item, height h-screen, shrink-0, smooth width transition (w-64 vs w-20)
          - Mobile (<lg): Fixed drawer overlay (z-50 inset-y-0 left-0 w-72), slide-in with translate-x
      */}
      <aside
        className={`bg-theme-sidebar border-r border-theme-subtle flex flex-col justify-between select-none transition-all duration-200 ease-in-out ${
          /* Mobile positioning */
          "fixed inset-y-0 left-0 z-50 w-72 lg:static lg:z-auto lg:h-screen lg:shrink-0 " +
          (isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0")
        } ${isCollapsed ? "lg:w-20" : "lg:w-64"}`}
      >
        {/* Top Branding Section (Occupies full intended width of sidebar container) */}
        <div className="h-16 px-3.5 border-b border-theme-subtle flex items-center justify-between bg-theme-sidebar shrink-0">
          <Link
            to="/dashboard"
            onClick={onClose}
            className={`flex items-center overflow-hidden transition-all ${
              isCollapsed ? "justify-center w-full" : "w-full"
            }`}
            title="Zynthor Business OS"
          >
            <ZynthorLogo
              size={isCollapsed ? "sm" : "md"}
              collapsed={isCollapsed}
              badgeText="OS"
              fullWidth={!isCollapsed}
            />
          </Link>

          {/* Desktop Collapse / Expand Toggle Button inside expanded header */}
          {!isCollapsed && onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex items-center justify-center p-1.5 rounded-lg text-theme-muted hover:text-theme-primary hover:bg-theme-surface border border-theme-subtle transition-colors cursor-pointer shrink-0 ml-1.5"
              title="Collapse Sidebar"
              aria-label="Collapse Sidebar"
            >
              <FiChevronLeft className="text-base" />
            </button>
          )}
        </div>

        {/* Collapsed Mode Expand Button */}
        {isCollapsed && onToggleCollapse && (
          <div className="hidden lg:flex justify-center py-2 border-b border-theme-subtle bg-theme-surface/50 shrink-0">
            <button
              onClick={onToggleCollapse}
              className="p-1.5 rounded-lg text-theme-muted hover:text-theme-primary hover:bg-theme-surface border border-theme-subtle transition-colors cursor-pointer"
              title="Expand Sidebar"
              aria-label="Expand Sidebar"
            >
              <FiChevronRight className="text-base" />
            </button>
          </div>
        )}

        {/* Navigation items list */}
        <div className="overflow-y-auto px-2.5 py-3 space-y-5 flex-1 custom-scrollbar">
          {navGroups.map((grp) => (
            <div key={grp.group} className="space-y-1">
              {!isCollapsed && (
                <div className="px-2.5 text-[10.5px] font-bold uppercase tracking-wider text-theme-muted">
                  {grp.group}
                </div>
              )}
              {isCollapsed && (
                <div className="h-1.5 border-t border-theme-subtle mx-1 my-1 opacity-50" />
              )}
              <div className="space-y-0.5 pt-0.5">
                {grp.items.map((item) => {
                  const Icon = item.icon;
                  const active = isCurrent(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={onClose}
                      title={isCollapsed ? item.label : undefined}
                      className={`flex items-center rounded-xl text-xs font-semibold transition-all ${
                        isCollapsed ? "justify-center p-2.5" : "justify-between px-3 py-2"
                      } ${
                        active
                          ? "bg-gradient-to-r from-blue-600/25 via-indigo-600/20 to-amber-500/10 text-theme-primary border border-blue-500/40 shadow-sm"
                          : "text-theme-secondary hover:text-theme-primary hover:bg-theme-surface"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          className={`text-base shrink-0 ${
                            active ? "text-amber-400 dark:text-amber-300" : "text-theme-muted"
                          }`}
                        />
                        {!isCollapsed && (
                          <span className="truncate">{item.label}</span>
                        )}
                      </div>
                      {!isCollapsed && item.badge && (
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-theme-surface text-amber-400 dark:text-amber-300 border border-theme-subtle shrink-0">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Client Portal Shortcuts */}
        <div className="p-3 border-t border-theme-subtle bg-theme-sidebar space-y-1.5 shrink-0">
          {!isCollapsed && (
            <div className="text-[10.5px] font-bold text-theme-muted uppercase tracking-wider px-1">
              Live Customer Portals
            </div>
          )}
          <div className="space-y-1">
            <Link
              to={business?.industry === "salon" ? `/book/${business.slug}` : "/book/luxe-aura"}
              target="_blank"
              title="Salon Booking Portal"
              className={`flex items-center rounded-xl bg-theme-surface/70 hover:bg-theme-surface border border-theme-subtle text-xs text-theme-secondary hover:text-theme-primary transition-colors ${
                isCollapsed ? "justify-center p-2.5" : "justify-between p-2"
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <FiCalendar className="text-pink-400 shrink-0" />
                {!isCollapsed && <span className="font-medium truncate">Salon Portal</span>}
              </div>
              {!isCollapsed && <FiExternalLink className="text-theme-muted text-xs shrink-0" />}
            </Link>

            <Link
              to={business?.industry === "cafe" ? `/menu/${business.slug}` : "/menu/velvet-vine"}
              target="_blank"
              title="Digital QR Menu"
              className={`flex items-center rounded-xl bg-theme-surface/70 hover:bg-theme-surface border border-theme-subtle text-xs text-theme-secondary hover:text-theme-primary transition-colors ${
                isCollapsed ? "justify-center p-2.5" : "justify-between p-2"
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <FiCoffee className="text-amber-400 shrink-0" />
                {!isCollapsed && <span className="font-medium truncate">Digital QR Menu</span>}
              </div>
              {!isCollapsed && <FiExternalLink className="text-theme-muted text-xs shrink-0" />}
            </Link>
          </div>
        </div>

        {/* ====================================================================
            REQUIREMENT 5: USER PROFILE AND LOGOUT SECTIONS WITHIN SIDEBAR
            - Stays strictly within the sidebar
            - High-contrast avatar circle with "A"
            - Clean name, role, and explicit Sign Out button
            - Compact icon format when collapsed
            ==================================================================== */}
        <div className="p-3 border-t border-theme-subtle bg-theme-secondary/80 shrink-0">
          {!isCollapsed ? (
            <div className="flex items-center justify-between gap-2.5 p-2 rounded-2xl bg-theme-surface border border-theme-subtle">
              <div className="flex items-center gap-2.5 min-w-0">
                {/* Avatar with initial "A" */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-amber-500 text-white font-bold flex items-center justify-center text-xs shadow shrink-0 border border-blue-400/40 relative select-none">
                  {user?.avatar && (
                    <img
                      src={user.avatar}
                      alt={user.name || "User Avatar"}
                      className="w-full h-full object-cover rounded-full absolute inset-0"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  )}
                  <span>{userInitial}</span>
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-xs text-theme-primary truncate leading-tight">
                    {user?.name || "System Admin"}
                  </div>
                  <div className="text-[10px] text-theme-muted truncate capitalize">
                    {user?.role || "Owner"} • {business?.plan || "Growth"}
                  </div>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="p-1.5 rounded-xl text-theme-muted hover:text-red-400 hover:bg-red-950/20 border border-transparent hover:border-red-900/40 transition-colors cursor-pointer shrink-0"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <FiLogOut className="text-sm" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-1">
              <div
                className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-amber-500 text-white font-bold flex items-center justify-center text-xs shadow border border-blue-400/40 cursor-pointer select-none"
                title={`${user?.name || "Admin"} (${user?.role || "Owner"})`}
              >
                <span>{userInitial}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="p-1.5 rounded-lg text-theme-muted hover:text-red-400 hover:bg-red-950/20 transition-colors cursor-pointer"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <FiLogOut className="text-sm" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
