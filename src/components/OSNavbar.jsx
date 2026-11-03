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
  FiUser,
  FiLogOut,
  FiSettings,
  FiLayers,
  FiExternalLink,
  FiScissors,
  FiCoffee,
  FiBriefcase,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { api } from "../services/api";

export default function OSNavbar({ onOpenSearch, onOpenQuickAction }) {
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
    } catch (_err) {
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
    } catch (_err) {
      /* ignore */
    }
  };

  const getIndustryIcon = (ind) => {
    if (ind === "salon") return <FiScissors className="text-pink-400" />;
    if (ind === "cafe") return <FiCoffee className="text-amber-400" />;
    return <FiBriefcase className="text-blue-400" />;
  };

  return (
    <header className="sticky top-0 z-40 h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl px-4 lg:px-6 flex items-center justify-between text-slate-100 transition-colors">
      {/* Left: Brand & Business Switcher */}
      <div className="flex items-center space-x-3">
        <Link to="/app" className="flex items-center space-x-2.5">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 p-0.5 shadow-lg shadow-blue-500/25 flex items-center justify-center">
            <span className="font-extrabold text-white text-base tracking-wider">Z</span>
          </div>
          <div className="hidden sm:block">
            <span className="text-sm font-bold tracking-tight text-white block leading-tight">
              Zynthor <span className="text-blue-400 text-xs font-semibold px-1 py-0.5 rounded bg-blue-950/80 border border-blue-800/60 ml-1">OS</span>
            </span>
          </div>
        </Link>

        {/* Vertical Tenant Switcher */}
        <div className="relative" ref={bRef}>
          <button
            onClick={() => setBusinessDropdown(!businessDropdown)}
            className="flex items-center space-x-2 pl-3 pr-2.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-200 transition-all shadow-sm"
          >
            {getIndustryIcon(business?.industry)}
            <span className="truncate max-w-[140px] sm:max-w-[200px] text-white font-semibold">
              {business?.name || "Luxe Aura Studio"}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 uppercase font-mono">
              {business?.plan || "Growth"}
            </span>
            <FiChevronDown className="text-slate-400 text-xs" />
          </button>

          {businessDropdown && (
            <div className="absolute left-0 mt-2 w-72 rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl p-2 space-y-1 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                Switch Business Vertical Demo
              </div>
              {businesses.map((b) => (
                <button
                  key={b.id}
                  onClick={() => {
                    switchBusiness(b.id);
                    setBusinessDropdown(false);
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs transition-colors ${
                    business?.id === b.id
                      ? "bg-blue-600/20 text-white font-semibold border border-blue-500/40"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <div className="p-1.5 rounded-lg bg-slate-800">{getIndustryIcon(b.industry)}</div>
                    <div>
                      <div className="font-medium text-white">{b.name}</div>
                      <div className="text-[10px] text-slate-400 capitalize">{b.industry} Suite • {b.plan}</div>
                    </div>
                  </div>
                  {business?.id === b.id && <FiCheck className="text-blue-400 text-sm" />}
                </button>
              ))}
              <div className="pt-2 border-t border-slate-800">
                <Link
                  to="/app/onboarding"
                  onClick={() => setBusinessDropdown(false)}
                  className="flex items-center space-x-2 p-2 rounded-xl text-xs text-blue-400 hover:bg-blue-950/40 hover:text-blue-300 font-medium"
                >
                  <FiPlus />
                  <span>Onboard New Business...</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Center: Global Search Bar Trigger */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-xs text-slate-400 hover:text-slate-200 transition-all shadow-inner group"
        >
          <div className="flex items-center space-x-2">
            <FiSearch className="text-slate-400 group-hover:text-blue-400 transition-colors" />
            <span>Search commands, leads, services, tables...</span>
          </div>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-slate-800 text-slate-400 border border-slate-700 rounded">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Controls: Actions, Notifications, Theme, User */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Mobile search button */}
        <button
          onClick={onOpenSearch}
          className="md:hidden p-2 text-slate-300 hover:text-white rounded-xl hover:bg-slate-900"
          title="Search"
        >
          <FiSearch />
        </button>

        {/* Quick Action Button */}
        <button
          onClick={onOpenQuickAction}
          className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 transition-all"
        >
          <FiPlus className="text-sm" />
          <span>Action</span>
        </button>

        {/* Notifications Popover */}
        <div className="relative" ref={nRef}>
          <button
            onClick={() => setNotifDropdown(!notifDropdown)}
            className="relative p-2 text-slate-300 hover:text-white rounded-xl hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-colors"
          >
            <FiBell className="text-base" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500 ring-2 ring-slate-950 animate-pulse" />
            )}
          </button>

          {notifDropdown && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl p-2 z-50 text-slate-200">
              <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800 text-xs">
                <span className="font-semibold text-white">Notifications ({unreadCount})</span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] text-blue-400 hover:text-blue-300 font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/60">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">All caught up! No notifications.</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        api.markNotificationRead(n.id);
                        if (n.link) navigate(n.link);
                        setNotifDropdown(false);
                      }}
                      className={`p-3 text-xs cursor-pointer hover:bg-slate-800/60 transition-colors ${
                        !n.is_read ? "bg-blue-950/20 font-medium" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <span className="font-semibold text-white">{n.title}</span>
                        {!n.is_read && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1" />}
                      </div>
                      <p className="text-slate-400 text-[11px] mt-1">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Theme Switcher Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 text-slate-300 hover:text-white rounded-xl hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-colors"
          title={isDark ? "Switch to Light Canvas" : "Switch to Obsidian Dark"}
        >
          {isDark ? <FiSun className="text-amber-400 text-base" /> : <FiMoon className="text-blue-400 text-base" />}
        </button>

        {/* User Profile Menu */}
        <div className="relative" ref={pRef}>
          <button
            onClick={() => setProfileDropdown(!profileDropdown)}
            className="flex items-center space-x-2 p-1 pl-2 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 text-xs font-medium text-slate-200"
          >
            <div className="w-7 h-7 rounded-lg overflow-hidden bg-slate-800 border border-slate-700 flex items-center justify-center">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <FiUser className="text-slate-400" />
              )}
            </div>
            <span className="hidden lg:inline-block font-semibold text-white">{user?.name?.split(" ")[0] || "Elena"}</span>
            <FiChevronDown className="text-slate-400 text-xs" />
          </button>

          {profileDropdown && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl p-2 z-50 text-slate-200 space-y-1">
              <div className="px-3 py-2 border-b border-slate-800">
                <div className="font-semibold text-xs text-white">{user?.name || "Elena Rostova"}</div>
                <div className="text-[11px] text-slate-400 truncate">{user?.email || "elena@luxeaura.com"}</div>
                <div className="flex items-center space-x-1.5 mt-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-blue-900/50 text-blue-400 text-[10px] font-mono uppercase font-bold border border-blue-800/60">
                    {user?.role || "Owner"}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-900/50 text-emerald-400 text-[10px] font-mono uppercase font-bold border border-emerald-800/60">
                    {business?.plan || "Growth"} Tier
                  </span>
                </div>
              </div>

              <Link
                to="/app/settings"
                onClick={() => setProfileDropdown(false)}
                className="flex items-center space-x-2.5 p-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <FiSettings />
                <span>Business Settings</span>
              </Link>

              <Link
                to="/app/plans"
                onClick={() => setProfileDropdown(false)}
                className="flex items-center space-x-2.5 p-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <FiLayers />
                <span>Subscription & Quotas</span>
              </Link>

              <Link
                to="/"
                target="_blank"
                onClick={() => setProfileDropdown(false)}
                className="flex items-center space-x-2.5 p-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <FiExternalLink />
                <span>Public Marketing Site</span>
              </Link>

              <div className="pt-1 border-t border-slate-800">
                <button
                  onClick={() => {
                    logout();
                    setProfileDropdown(false);
                    navigate("/login");
                  }}
                  className="w-full flex items-center space-x-2.5 p-2 rounded-xl text-xs text-red-400 hover:bg-red-950/40 transition-colors"
                >
                  <FiLogOut />
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
