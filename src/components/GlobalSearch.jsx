import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiX, FiArrowRight, FiCommand, FiUser, FiCalendar, FiCoffee, FiScissors, FiCpu, FiLayers } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

export default function GlobalSearch({ isOpen, onClose }) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { business } = useAuth();

  const isSalon = business?.industry === "salon";
  const isCafe = business?.industry === "cafe";

  const allItems = [
    { title: "Executive Dashboard", category: "Navigation", path: "/app", icon: FiLayers, desc: "Real-time KPIs, conversion analytics & activity feed" },
    { title: "Inbound Leads CRM", category: "CRM & Sales", path: "/app/leads", icon: FiUser, desc: "Pipeline management, lead status, notes & CSV export" },
    { title: "Customer Directory", category: "CRM & Sales", path: "/app/customers", icon: FiUser, desc: "Client profiles, lifetime spend and visit history" },
    { title: "Salon & Spa Suite", category: "Verticals", path: "/app/salon", icon: FiScissors, desc: "Service catalogue, staff rosters, calendar & bookings" },
    { title: "Cafe & Restaurant Suite", category: "Verticals", path: "/app/cafe", icon: FiCoffee, desc: "Menu editor, table manager, live kitchen KDS & QR menu" },
    { title: "Zynthor AI Copilot", category: "AI & Automation", path: "/app/ai-bot", icon: FiCpu, desc: "Bilingual concierge, intent routing & smart prompt assist" },
    { title: "Automation Engine", category: "AI & Automation", path: "/app/automation", icon: FiCpu, desc: "Trigger rules, automated SMS/email alerts & execution logs" },
    { title: "Financial & Operational Reports", category: "Analytics", path: "/app/reports", icon: FiLayers, desc: "Revenue charts, service breakdowns & conversion audits" },
    { title: "Business Settings & Team", category: "Configuration", path: "/app/settings", icon: FiLayers, desc: "Operating hours, AI instructions & team permissions" },
    { title: "Subscription Plans & Pricing", category: "Billing", path: "/app/plans", icon: FiLayers, desc: "Current tier features, limits and upgrades" },
    { title: "Public Client Booking Portal", category: "Portals", path: isSalon ? `/book/${business?.slug || "luxe-aura"}` : "/book/luxe-aura", icon: FiCalendar, desc: "External booking experience for retail clients" },
    { title: "Public Digital QR Menu", category: "Portals", path: isCafe ? `/menu/${business?.slug || "velvet-vine"}` : "/menu/velvet-vine", icon: FiCoffee, desc: "Contactless digital QR menu for cafe patrons" },
  ];

  const filtered = query.trim()
    ? allItems.filter(
        (it) =>
          it.title.toLowerCase().includes(query.toLowerCase()) ||
          it.category.toLowerCase().includes(query.toLowerCase()) ||
          it.desc.toLowerCase().includes(query.toLowerCase())
      )
    : allItems;

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filtered.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
      } else if (e.key === "Enter" && filtered[selectedIndex]) {
        e.preventDefault();
        navigate(filtered[selectedIndex].path);
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filtered, selectedIndex, navigate, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/70 backdrop-blur-md transition-opacity">
      <div
        className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800 bg-slate-950/60">
          <FiSearch className="text-slate-400 text-xl mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search commands, modules, leads, services, tables..."
            className="w-full bg-transparent text-base text-white placeholder-slate-500 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors mr-2"
            >
              <FiX className="text-lg" />
            </button>
          )}
          <span className="flex items-center text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded border border-slate-700">
            <FiCommand className="mr-1" /> ESC
          </span>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <p className="text-sm">No matching records or actions found for "{query}".</p>
            </div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.title + item.path}
                  onClick={() => {
                    navigate(item.path);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                    isSelected
                      ? "bg-blue-600/20 border border-blue-500/40 text-white"
                      : "hover:bg-slate-800/60 text-slate-200 border border-transparent"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`p-2 rounded-lg ${
                        isSelected ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      <Icon className="text-base" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-sm">{item.title}</span>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                  {isSelected && <FiArrowRight className="text-blue-400 text-base" />}
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span className="text-[11px] font-medium text-slate-400">Zynthor Business OS</span>
        </div>
      </div>
    </div>
  );
}
