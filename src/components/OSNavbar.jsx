import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiSearch,
  FiPlus,
  FiBell,
  FiSun,
  FiMoon,
  FiChevronDown,
  FiCheck,
  FiLogOut,
  FiSettings,
  FiLayers,
  FiExternalLink,
  FiScissors,
  FiCoffee,
  FiBriefcase,
  FiMenu,
  FiSidebar,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { api } from "../services/api";
import ZynthorLogo from "./Brand/ZynthorLogo";

export default function OSNavbar({
  onOpenSearch,
  onOpenQuickAction,
  onToggleSidebar,
  isSidebarCollapsed,
  onToggleCollapse,
}) {
  const { user, business, businesses, switchBusiness, logout } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();

  const [businessDropdown, setBusinessDropdown] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const [notifDropdown, setNotifDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const bRef = useRef(null);
  const pRef = useRef(null);
  const nRef = useRef(null);

  const fetchNotifs = async () => {
    try {
      const res = await api.getNotifications();
      if (res.success && res.notifications) {
        setNotifications(res.notifications);
        setUnreadCount(res.notifications.filter((n) => !n.is_read).length);
      }
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 15000);
    return () => clearInterval(interval);
  }, [business?.id]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(e) {
      if (bRef.current && !bRef.current.contains(e.target)) setBusinessDropdown(false);
      if (pRef.current && !pRef.current.contains(e.target)) setProfileDropdown(false);
      if (nRef.current && !nRef.current.contains(e.target)) setNotifDropdown(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
      setUnreadCount(0);
    } catch {
      /* ignore */
    }
  };

  const getIndustryIcon = (ind) => {
    if (ind === "salon") return <FiScissors className="text-pink-400 shrink-0" />;
    if (ind === "cafe") return <FiCoffee className="text-amber-400 shrink-0" />;
    return <FiBriefcase className="text-blue-400 shrink-0" />;
  };

  // User display initial — Default "A"
  const userInitial = user?.name ? user.name.trim().charAt(0).toUpperCase() : "A";

  return (
    <header className="sticky top-0 z-40 h-16 w-full border-b border-theme-subtle bg-theme-secondary/90 backdrop-blur-xl px-2 sm:px-4 lg:px-6 flex items-center justify-between text-theme-primary transition-colors box-border">
      {/* ====================================================================
          LEFT: Mobile Menu + Collapse Toggle + Logo + Workspace Selector
          Responsive and overflow-safe on 360px/390px/768px/1280px/1440px
          ==================================================================== */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 shrink-1">
        {/* Mobile Sidebar Hamburger Toggle */}
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-theme-secondary hover:text-theme-primary hover:bg-theme-surface border border-theme-subtle transition-colors cursor-pointer shrink-0"
          title="Toggle Navigation Menu"
          aria-label="Toggle Navigation Menu"
        >
          <FiMenu className="text-base sm:text-lg" />
        </button>

        {/* Desktop Sidebar Collapse Toggle */}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-2 rounded-xl text-theme-secondary hover:text-theme-primary hover:bg-theme-surface border border-theme-subtle transition-colors cursor-pointer shrink-0"
            title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            aria-label="Toggle Sidebar Collapse"
          >
            <FiSidebar className="text-base" />
          </button>
        )}

        {/* Brand Link — Responsive: Icon-only on mobile (<sm), full on desktop (sm:) */}
        <Link
          to="/app"
          className="flex items-center shrink-0 overflow-hidden"
          title="Zynthor Business OS"
        >
          {/* Mobile Icon-only logo */}
          <div className="sm:hidden">
            <ZynthorLogo size="sm" collapsed={true} />
          </div>
          {/* Desktop logo when sidebar is collapsed or on tablet */}
          <div className="hidden sm:block">
            <ZynthorLogo size="sm" collapsed={false} badgeText="OS" />
          </div>
        </Link>

        {/* Vertical Workspace / Tenant Switcher */}
        <div className="relative min-w-0" ref={bRef}>
          <button
            onClick={() => setBusinessDropdown(!businessDropdown)}
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-2.5 py-1.5 rounded-xl bg-theme-surface/80 hover:bg-theme-surface border border-theme-subtle text-xs font-medium text-theme-secondary hover:text-theme-primary transition-all shadow-sm cursor-pointer min-w-0 shrink-1"
            title={`Active Workspace: ${business?.name || "Business OS"}`}
          >
            {getIndustryIcon(business?.industry)}
            {/* Show truncated name on sm+ screens; hide text on tiny mobile (<sm) */}
            <span className="hidden sm:inline-block truncate max-w-[100px] md:max-w-[160px] font-semibold text-theme-primary">
              {business?.name || "Luxe Aura"}
            </span>
            <span className="hidden md:inline-block text-[10px] px-1 py-0.5 rounded bg-theme-surface border border-theme-subtle text-theme-muted uppercase font-mono shrink-0">
              {business?.plan || "Growth"}
            </span>
            <FiChevronDown className="text-theme-muted text-xs shrink-0" />
          </button>

          {/* Workspace Dropdown */}
          {businessDropdown && (
            <div className="absolute left-0 mt-2 w-72 max-w-[calc(100vw-1.5rem)] rounded-2xl bg-theme-card border border-theme-subtle shadow-2xl p-2 space-y-1 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-2 text-[10.5px] font-bold text-theme-muted uppercase tracking-wider border-b border-theme-subtle">
                Switch Business Vertical Demo
              </div>
              <div className="max-h-64 overflow-y-auto space-y-1 py-1">
                {businesses.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => {
                      switchBusiness(b.id);
                      setBusinessDropdown(false);
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                      business?.id === b.id
                        ? "bg-blue-600/20 text-blue-400 font-semibold border border-blue-500/40"
                        : "text-theme-secondary hover:bg-theme-surface hover:text-theme-primary"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-1.5 rounded-lg bg-theme-surface shrink-0">
                        {getIndustryIcon(b.industry)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-theme-primary truncate">{b.name}</div>
                        <div className="text-[10px] text-theme-muted capitalize">
                          {b.industry} Suite • {b.plan}
                        </div>
                      </div>
                    </div>
                    {business?.id === b.id && <FiCheck className="text-blue-400 text-sm shrink-0 ml-2" />}
                  </button>
                ))}
              </div>
              <div className="pt-2 border-t border-theme-subtle">
                <Link
                  to="/app/onboarding"
                  onClick={() => setBusinessDropdown(false)}
                  className="flex items-center gap-2 p-2 rounded-xl text-xs text-blue-400 hover:bg-blue-950/40 font-medium transition-colors"
                >
                  <FiPlus className="shrink-0" />
                  <span>Onboard New Business...</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ====================================================================
          CENTER: Global Search Trigger (Responsive & Flex-Shrink Safe)
          ==================================================================== */}
      <div className="hidden md:flex items-center flex-1 max-w-xs lg:max-w-md mx-2 lg:mx-4 min-w-0">
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl bg-theme-surface/70 hover:bg-theme-surface border border-theme-subtle text-xs text-theme-muted hover:text-theme-primary transition-all shadow-inner group cursor-pointer min-w-0"
        >
          <div className="flex items-center gap-2 min-w-0">
            <FiSearch className="text-theme-muted group-hover:text-blue-400 transition-colors shrink-0" />
            <span className="truncate">Search commands, leads, services...</span>
          </div>
          <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-theme-secondary text-theme-muted border border-theme-subtle rounded shrink-0 ml-2">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* ====================================================================
          RIGHT: Actions, Notifications, Theme Toggle & Profile Avatar
          GUARANTEED: shrink-0, ml-auto, flex items-center gap-1 sm:gap-2
          NEVER overflows or gets clipped beyond viewport edge!
          ==================================================================== */}
      <div className="shrink-0 flex items-center gap-1 sm:gap-2.5 ml-auto">
        {/* Mobile Search Button */}
        <button
          onClick={onOpenSearch}
          className="md:hidden p-1.5 sm:p-2 text-theme-secondary hover:text-theme-primary rounded-xl hover:bg-theme-surface border border-theme-subtle transition-colors shrink-0"
          title="Search"
          aria-label="Search"
        >
          <FiSearch className="text-base" />
        </button>

        {/* Quick Action Button */}
        {onOpenQuickAction && (
          <button
            onClick={onOpenQuickAction}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/25 transition-all cursor-pointer shrink-0"
            title="Create New Lead or Booking"
          >
            <FiPlus className="text-sm shrink-0" />
            <span>Action</span>
          </button>
        )}

        {/* Notifications Popover */}
        <div className="relative shrink-0" ref={nRef}>
          <button
            onClick={() => setNotifDropdown(!notifDropdown)}
            className="relative p-1.5 sm:p-2 text-theme-secondary hover:text-theme-primary rounded-xl hover:bg-theme-surface border border-transparent hover:border-theme-subtle transition-colors cursor-pointer shrink-0"
            title="Notifications"
            aria-label="Notifications"
          >
            <FiBell className="text-base" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-500 ring-2 ring-theme-secondary animate-pulse" />
            )}
          </button>

          {notifDropdown && (
            <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-1.5rem)] rounded-2xl bg-theme-card border border-theme-subtle shadow-2xl p-2 z-50 text-theme-primary animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between px-3 py-2 border-b border-theme-subtle text-xs">
                <span className="font-semibold text-theme-primary">Notifications ({unreadCount})</span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] text-blue-400 hover:text-blue-300 font-medium cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-theme-subtle">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-theme-muted">
                    All caught up! No notifications.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        api.markNotificationRead(n.id);
                        if (n.link) navigate(n.link);
                        setNotifDropdown(false);
                      }}
                      className={`p-3 text-xs cursor-pointer hover:bg-theme-surface/70 transition-colors ${
                        !n.is_read ? "bg-blue-950/20 font-medium" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold text-theme-primary">{n.title}</span>
                        {!n.is_read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-theme-muted text-[11px] mt-1">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Theme Switcher Toggle (Light vs Dark) */}
        <button
          onClick={toggleTheme}
          className="p-1.5 sm:p-2 text-theme-secondary hover:text-theme-primary rounded-xl hover:bg-theme-surface border border-transparent hover:border-theme-subtle transition-colors cursor-pointer shrink-0"
          title={isDark ? "Switch to Light Canvas" : "Switch to Obsidian Dark"}
          aria-label={isDark ? "Switch to Light Canvas" : "Switch to Obsidian Dark"}
        >
          {isDark ? (
            <FiSun className="text-amber-400 text-base" />
          ) : (
            <FiMoon className="text-blue-500 text-base" />
          )}
        </button>

        {/* ====================================================================
            PRIORITY 1 FIX: USER PROFILE AVATAR CONTAINER
            - Always fully visible
            - Never pushed out of viewport
            - Initial "A" always rendered cleanly in rounded avatar circle
            - Profile dropdown stays strictly inside viewport (right-0)
            ==================================================================== */}
        <div className="relative shrink-0" ref={pRef}>
          <button
            onClick={() => setProfileDropdown(!profileDropdown)}
            className="flex items-center gap-1 sm:gap-2 p-1 pl-1 sm:pl-1.5 pr-1.5 sm:pr-2.5 rounded-xl bg-theme-surface/70 hover:bg-theme-surface border border-theme-subtle text-xs font-semibold text-theme-primary transition-all cursor-pointer shrink-0 shadow-sm"
            title={`Account Profile: ${user?.name || "Admin"}`}
            aria-label="User Account Menu"
          >
            {/* The Avatar Circle: Always Shows "A" or User Initial with High Contrast */}
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-xs sm:text-sm shadow-sm shrink-0 border border-blue-400/40 relative select-none">
              {user?.avatar && (
                <img
                  src={user.avatar}
                  alt={user.name || "User Avatar"}
                  className="w-full h-full object-cover absolute inset-0"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              )}
              {/* Fallback Initial "A" is always present */}
              <span>{userInitial}</span>
            </div>

            {/* User Name (Responsive: visible on desktop, hidden on mobile/tablet) */}
            <span className="hidden xl:inline-block font-semibold text-theme-primary max-w-[85px] truncate">
              {user?.name?.split(" ")[0] || "Admin"}
            </span>
            <FiChevronDown className="text-theme-muted text-xs shrink-0" />
          </button>

          {/* User Profile Dropdown Menu */}
          {profileDropdown && (
            <div className="absolute right-0 mt-2 w-64 max-w-[calc(100vw-1.5rem)] rounded-2xl bg-theme-card border border-theme-subtle shadow-2xl p-2 z-50 text-theme-primary space-y-1 animate-in fade-in zoom-in-95">
              <div className="px-3 py-2.5 border-b border-theme-subtle">
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shrink-0 border border-blue-400/40">
                    <span>{userInitial}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-theme-primary truncate">
                      {user?.name || "System Admin"}
                    </div>
                    <div className="text-[11px] text-theme-muted truncate">
                      {user?.email || "admin@zynthor.com"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="px-1.5 py-0.5 rounded bg-blue-900/40 text-blue-400 text-[10px] font-mono uppercase font-bold border border-blue-800/40">
                    {user?.role || "Owner"}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-900/40 text-emerald-400 text-[10px] font-mono uppercase font-bold border border-emerald-800/40">
                    {business?.plan || "Growth"} Tier
                  </span>
                </div>
              </div>

              <Link
                to="/app/settings"
                onClick={() => setProfileDropdown(false)}
                className="flex items-center gap-2.5 p-2 rounded-xl text-xs text-theme-secondary hover:text-theme-primary hover:bg-theme-surface transition-colors"
              >
                <FiSettings className="shrink-0 text-theme-muted" />
                <span>Business Settings</span>
              </Link>

              <Link
                to="/app/plans"
                onClick={() => setProfileDropdown(false)}
                className="flex items-center gap-2.5 p-2 rounded-xl text-xs text-theme-secondary hover:text-theme-primary hover:bg-theme-surface transition-colors"
              >
                <FiLayers className="shrink-0 text-theme-muted" />
                <span>Subscription & Quotas</span>
              </Link>

              <Link
                to="/"
                target="_blank"
                onClick={() => setProfileDropdown(false)}
                className="flex items-center gap-2.5 p-2 rounded-xl text-xs text-theme-secondary hover:text-theme-primary hover:bg-theme-surface transition-colors"
              >
                <FiExternalLink className="shrink-0 text-theme-muted" />
                <span>Public Marketing Site</span>
              </Link>

              <div className="pt-1 border-t border-theme-subtle">
                <button
                  onClick={() => {
                    logout();
                    setProfileDropdown(false);
                    navigate("/login");
                  }}
                  className="w-full flex items-center gap-2.5 p-2 rounded-xl text-xs text-red-400 hover:bg-red-950/30 transition-colors cursor-pointer"
                >
                  <FiLogOut className="shrink-0" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
