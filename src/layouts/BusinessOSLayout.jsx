import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import OSNavbar from "../components/OSNavbar";
import OSSidebar from "../components/OSSidebar";
import GlobalSearch from "../components/GlobalSearch";
import QuickActionModal from "../components/QuickActionModal";
import { useAuth } from "../context/AuthContext";

export default function BusinessOSLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("zynthor_sidebar_collapsed") === "true";
    }
    return false;
  });

  const [searchOpen, setSearchOpen] = useState(false);
  const [quickActionOpen, setQuickActionOpen] = useState(false);
  const location = useLocation();
  const { business } = useAuth();

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("zynthor_sidebar_collapsed", String(next));
      return next;
    });
  };

  // Dynamic Page Title
  useEffect(() => {
    const titles = {
      "/app": "Executive Dashboard",
      "/app/leads": "Inbound Leads & CRM Pipeline",
      "/app/customers": "Customer Directory",
      "/app/salon": "Salon & Spa Suite",
      "/app/cafe": "Cafe & Restaurant Suite",
      "/app/ai-bot": "Zynthor AI Copilot",
      "/app/automation": "Automation Rules & Logs",
      "/app/reports": "Operational & Financial Reports",
      "/app/settings": "Business Settings & Team",
      "/app/plans": "Subscription & Limits",
      "/app/onboarding": "Business Onboarding Wizard",
    };
    const prefix = titles[location.pathname] || "Workspace";
    document.title = `${prefix} | ${business?.name || "Zynthor Business OS"}`;
  }, [location.pathname, business?.name]);

  // Global Keyboard Shortcuts (Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-theme-main text-theme-primary flex flex-col font-sans selection:bg-blue-600 selection:text-white transition-colors duration-200">
      {/* Top Navigation Bar */}
      <OSNavbar
        onOpenSearch={() => setSearchOpen(true)}
        onOpenQuickAction={() => setQuickActionOpen(true)}
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        isSidebarCollapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapse}
      />

      <div className="flex-1 w-full max-w-full flex overflow-hidden relative">
        {/* Persistent & Responsive Collapsible Sidebar */}
        <OSSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={toggleSidebarCollapse}
        />

        {/* Main Content Area — Automatically adapts to sidebar width */}
        <main
          className={`flex-1 w-full max-w-full overflow-x-hidden min-h-[calc(100vh-4rem)] p-3 sm:p-6 lg:p-8 bg-theme-main transition-[padding] duration-200 ease-in-out ${
            sidebarCollapsed ? "lg:pl-20" : "lg:pl-64"
          }`}
        >
          <Outlet />
        </main>
      </div>

      {/* Global Modals */}
      <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <QuickActionModal
        isOpen={quickActionOpen}
        onClose={() => setQuickActionOpen(false)}
        onActionSuccess={() => window.location.reload()}
      />
    </div>
  );
}
