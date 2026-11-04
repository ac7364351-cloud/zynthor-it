import { Link, useLocation } from "react-router-dom";
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
  const { business } = useAuth();

  const isCurrent = (path) => {
    if (path === "/app") return location.pathname === "/app";
    return location.pathname.startsWith(path);
  };

  const navGroups = [
    {
      group: "Core Workspace",
      items: [
        { label: "Dashboard", path: "/app", icon: FiGrid },
        { label: "Inbound Leads", path: "/app/leads", icon: FiUsers },
        { label: "Customer Directory", path: "/app/customers", icon: FiUsers },
      ],
    },
    {
      group: "Vertical Suites",
      items: [
        {
          label: "Salon & Spa Suite",
          path: "/app/salon",
          icon: FiScissors,
          badge: business?.industry === "salon" ? "Active" : null,
        },
        {
          label: "Cafe & Restaurant",
          path: "/app/cafe",
          icon: FiCoffee,
          badge: business?.industry === "cafe" ? "Active" : null,
        },
      ],
    },
    {
      group: "Intelligence",
      items: [
        { label: "Zynthor AI Copilot", path: "/app/ai-bot", icon: FiCpu, badge: "AI" },
        { label: "Automation Rules", path: "/app/automation", icon: FiZap },
        { label: "Analytics & Reports", path: "/app/reports", icon: FiBarChart2 },
      ],
    },
    {
      group: "Organization",
      items: [
        { label: "Settings & Team", path: "/app/settings", icon: FiSettings },
        { label: "Plans & Limits", path: "/app/plans", icon: FiCreditCard },
      ],
    },
  ];

  const sidebarWidth = isCollapsed ? "lg:w-20" : "lg:w-64";

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      <aside
        className={`fixed top-16 bottom-0 left-0 z-30 border-r border-theme-subtle bg-theme-secondary/95 backdrop-blur-xl flex flex-col justify-between transition-all duration-200 ease-in-out ${
          isOpen ? "translate-x-0 w-72" : "-translate-x-full lg:translate-x-0"
        } ${sidebarWidth}`}
      >
        {/* Top Branding Section (Occupies full width of sidebar container) */}
        <div className="px-3.5 py-4 border-b border-theme-subtle flex items-center justify-between min-h-[64px] bg-theme-secondary">
          <Link
            to="/app"
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
            />
          </Link>

          {/* Desktop Collapse / Expand Toggle Button */}
          {!isCollapsed && onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex items-center justify-center p-1.5 rounded-lg text-theme-muted hover:text-theme-primary hover:bg-theme-surface border border-theme-subtle transition-colors cursor-pointer shrink-0 ml-1"
              title="Collapse Sidebar"
              aria-label="Collapse Sidebar"
            >
              <FiChevronLeft className="text-sm" />
            </button>
          )}
        </div>

        {/* Collapsed Mode Expand Button */}
        {isCollapsed && onToggleCollapse && (
          <div className="hidden lg:flex justify-center py-2 border-b border-theme-subtle bg-theme-surface/40">
            <button
              onClick={onToggleCollapse}
              className="p-1.5 rounded-lg text-theme-muted hover:text-theme-primary hover:bg-theme-surface border border-theme-subtle transition-colors cursor-pointer"
              title="Expand Sidebar"
              aria-label="Expand Sidebar"
            >
              <FiChevronRight className="text-sm" />
            </button>
          </div>
        )}

        {/* Navigation items list */}
        <div className="overflow-y-auto px-2.5 py-3 space-y-5 flex-1">
          {navGroups.map((grp) => (
            <div key={grp.group} className="space-y-1">
              {!isCollapsed && (
                <div className="px-2.5 text-[10.5px] font-bold uppercase tracking-wider text-theme-muted">
                  {grp.group}
                </div>
              )}
              {isCollapsed && (
                <div className="h-2 border-t border-theme-subtle mx-1 my-1 opacity-50" />
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
                          ? "bg-gradient-to-r from-blue-600/25 to-indigo-600/20 text-blue-400 border border-blue-500/40 shadow-sm"
                          : "text-theme-secondary hover:text-theme-primary hover:bg-theme-surface"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          className={`text-base shrink-0 ${
                            active ? "text-blue-400" : "text-theme-muted"
                          }`}
                        />
                        {!isCollapsed && (
                          <span className="truncate">{item.label}</span>
                        )}
                      </div>
                      {!isCollapsed && item.badge && (
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-950/60 text-blue-400 border border-blue-800/40 shrink-0">
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
        <div className="p-3 border-t border-theme-subtle bg-theme-secondary space-y-2">
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
      </aside>
    </>
  );
}
