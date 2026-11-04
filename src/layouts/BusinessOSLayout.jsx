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
      "/": "Executive Dashboard",
      "/dashboard": "Executive Dashboard",
      "/app": "Executive Dashboard",
      "/admin": "Super Admin & Multi-Tenant Control",
      "/app/admin": "Super Admin & Multi-Tenant Control",
      "/business": "Business Owner Workspace",
      "/business-management": "Business Management Directory",
      "/leads": "Inbound Leads & CRM Pipeline",
      "/app/leads": "Inbound Leads & CRM Pipeline",
      "/customers": "Customer Directory",
      "/app/customers": "Customer Directory",
      "/salon": "Salon & Spa Suite",
      "/app/salon": "Salon & Spa Suite",
      "/cafe": "Cafe & Restaurant Suite",
      "/app/cafe": "Cafe & Restaurant Suite",
      "/ai-bot": "Zynthor AI Copilot",
      "/app/ai-bot": "Zynthor AI Copilot",
      "/automation": "Automation Rules & Logs",
      "/app/automation": "Automation Rules & Logs",
      "/reports": "Operational & Financial Reports",
      "/app/reports": "Operational & Financial Reports",
      "/brand-editor": "Website & Brand Customizer",
      "/app/brand-editor": "Website & Brand Customizer",
      "/settings": "Business Settings & Team",
      "/app/settings": "Business Settings & Team",
      "/plans": "Subscription & Limits",
      "/app/plans": "Subscription & Limits",
      "/onboarding": "Business Onboarding Wizard",
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
    <div className="flex h-screen w-screen max-w-full overflow-hidden bg-theme-main text-theme-primary font-sans selection:bg-blue-600 selection:text-white transition-colors duration-200">
      {/* Sidebar: Desktop flex child (fixed height h-screen), Mobile off-canvas */}
      <OSSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapse}
      />

      {/* Main Content Column: Automatically adapts to remaining width (viewport - sidebar) */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        {/* Top Navigation Bar: Strictly 100% width of the content column, avatar never clipped */}
        <OSNavbar
          onOpenSearch={() => setSearchOpen(true)}
          onOpenQuickAction={() => setQuickActionOpen(true)}
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          isSidebarCollapsed={sidebarCollapsed}
          onToggleCollapse={toggleSidebarCollapse}
        />

        {/* Main Content Scrollable Viewport: No horizontal overflow, fluid responsive */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-6 lg:p-8 bg-theme-main transition-colors">
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
