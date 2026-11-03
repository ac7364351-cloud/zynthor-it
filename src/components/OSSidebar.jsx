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
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

export default function OSSidebar({ isOpen, onClose }) {
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
        { label: "Salon & Spa Suite", path: "/app/salon", icon: FiScissors, badge: business?.industry === "salon" ? "Active" : null },
        { label: "Cafe & Restaurant", path: "/app/cafe", icon: FiCoffee, badge: business?.industry === "cafe" ? "Active" : null },
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

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      <aside
        className={`fixed top-16 bottom-0 left-0 z-30 w-64 border-r border-slate-800/80 bg-slate-950/95 lg:bg-slate-950/60 backdrop-blur-xl flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Navigation items list */}
        <div className="overflow-y-auto px-4 py-4 space-y-6 flex-1">
          {navGroups.map((grp) => (
            <div key={grp.group} className="space-y-1">
              <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {grp.group}
              </div>
              <div className="space-y-0.5 pt-1">
                {grp.items.map((item) => {
                  const Icon = item.icon;
                  const active = isCurrent(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={onClose}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        active
                          ? "bg-gradient-to-r from-blue-600/30 to-indigo-600/20 text-white border border-blue-500/40 shadow-sm"
                          : "text-slate-300 hover:text-white hover:bg-slate-900/80"
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <Icon
                          className={`text-base ${
                            active ? "text-blue-400" : "text-slate-400 group-hover:text-slate-300"
                          }`}
                        />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800/50">
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
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/80 space-y-2">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
            Live Customer Portals
          </div>
          <div className="space-y-1">
            <Link
              to={business?.industry === "salon" ? `/book/${business.slug}` : "/book/luxe-aura"}
              target="_blank"
              className="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 hover:text-white transition-colors"
            >
              <div className="flex items-center space-x-2">
                <FiCalendar className="text-pink-400" />
                <span className="font-medium">Salon Booking Portal</span>
              </div>
              <FiExternalLink className="text-slate-400 text-xs" />
            </Link>

            <Link
              to={business?.industry === "cafe" ? `/menu/${business.slug}` : "/menu/velvet-vine"}
              target="_blank"
              className="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 hover:text-white transition-colors"
            >
              <div className="flex items-center space-x-2">
                <FiCoffee className="text-amber-400" />
                <span className="font-medium">Digital QR Menu</span>
              </div>
              <FiExternalLink className="text-slate-400 text-xs" />
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
