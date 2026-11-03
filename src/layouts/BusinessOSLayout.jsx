import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import OSNavbar from "../components/OSNavbar";
import OSSidebar from "../components/OSSidebar";
import GlobalSearch from "../components/GlobalSearch";
import QuickActionModal from "../components/QuickActionModal";
import { useAuth } from "../context/AuthContext";

export default function BusinessOSLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [quickActionOpen, setQuickActionOpen] = useState(false);
  const location = useLocation();
  const { business } = useAuth();

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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white transition-colors duration-150">
      {/* Top Navigation */}
      <OSNavbar
        onOpenSearch={() => setSearchOpen(true)}
        onOpenQuickAction={() => setQuickActionOpen(true)}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Persistent & Responsive Sidebar */}
        <OSSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content Area */}
        <main className="flex-1 lg:pl-64 overflow-y-auto min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 bg-gradient-to-b from-slate-950 via-slate-950/95 to-slate-900/60">
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
