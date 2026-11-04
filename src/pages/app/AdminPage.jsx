import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiShield,
  FiBriefcase,
  FiPlus,
  FiCheckCircle,
  FiExternalLink,
  FiUsers,
  FiScissors,
  FiCoffee,
  FiActivity,
  FiDatabase,
  FiRefreshCw,
  FiArrowRight,
  FiLayers,
} from "react-icons/fi";
import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function AdminPage() {
  const { business, switchBusiness } = useAuth();
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const loadBusinesses = async (isRef = false) => {
    if (isRef) setRefreshing(true);
    try {
      const res = await api.getBusinesses();
      if (res.success && res.businesses) {
        setBusinesses(res.businesses);
      }
    } catch (err) {
      console.error("Failed to load businesses:", err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadBusinesses();
  }, []);

  const handleSwitchAndManage = (bId) => {
    switchBusiness(bId);
    navigate("/dashboard");
  };

  const getIndustryBadge = (industry) => {
    switch (industry) {
      case "salon":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-pink-950/40 text-pink-300 border border-pink-500/30">
            <FiScissors className="text-xs" /> Salon & Spa
          </span>
        );
      case "cafe":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-amber-950/40 text-amber-300 border border-amber-500/30">
            <FiCoffee className="text-xs" /> Cafe & Dining
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-blue-950/40 text-blue-300 border border-blue-500/30">
            <FiBriefcase className="text-xs" /> Enterprise & Agency
          </span>
        );
    }
  };

  const filteredBusinesses = businesses.filter(
    (b) =>
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-theme-primary w-full min-w-0 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-theme-primary flex items-center gap-2">
              <FiShield className="text-blue-500" />
              <span>Super Admin & Multi-Business Control</span>
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-950/40 border border-emerald-500/40 text-emerald-400">
              ● Multi-Tenant Engine Online
            </span>
          </div>
          <p className="text-xs text-theme-muted mt-1">
            Global tenant provisioning, multi-business directory, cross-tenant telemetry, and platform control.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => loadBusinesses(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-theme-surface hover:bg-theme-surface-hover border border-theme-subtle text-xs font-medium text-theme-secondary hover:text-theme-primary transition-colors cursor-pointer"
          >
            <FiRefreshCw className={`text-xs ${refreshing ? "animate-spin" : ""}`} />
            <span>Sync</span>
          </button>
          <Link
            to="/onboarding"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
          >
            <FiPlus className="text-sm" />
            <span>Onboard New Tenant</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-theme-card border border-theme-card shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-theme-muted">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Total Establishments</span>
            <div className="p-2 rounded-xl bg-blue-950/40 text-blue-400 border border-blue-800/40">
              <FiBriefcase className="text-sm" />
            </div>
          </div>
          <div className="text-2xl font-bold text-theme-primary">{businesses.length} Tenants</div>
          <div className="text-[11px] text-theme-muted">Isolated multi-tenant SQLite/MySQL nodes</div>
        </div>

        <div className="p-5 rounded-2xl bg-theme-card border border-theme-card shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-theme-muted">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Active Business</span>
            <div className="p-2 rounded-xl bg-purple-950/40 text-purple-400 border border-purple-800/40">
              <FiLayers className="text-sm" />
            </div>
          </div>
          <div className="text-xl font-bold text-theme-primary truncate">
            {business?.name || "Luxe Aura"}
          </div>
          <div className="text-[11px] text-purple-400 capitalize">
            {business?.industry} OS • {business?.plan || "Growth"} Tier
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-theme-card border border-theme-card shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-theme-muted">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Database Engine</span>
            <div className="p-2 rounded-xl bg-emerald-950/40 text-emerald-400 border border-emerald-800/40">
              <FiDatabase className="text-sm" />
            </div>
          </div>
          <div className="text-2xl font-bold text-theme-primary">Dual Engine</div>
          <div className="text-[11px] text-emerald-400">MySQL + Persistent WAL SQLite Fallback</div>
        </div>

        <div className="p-5 rounded-2xl bg-theme-card border border-theme-card shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-theme-muted">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Platform Status</span>
            <div className="p-2 rounded-xl bg-amber-950/40 text-amber-400 border border-amber-800/40">
              <FiActivity className="text-sm" />
            </div>
          </div>
          <div className="text-2xl font-bold text-theme-primary">100% Operational</div>
          <div className="text-[11px] text-amber-400">API Port 8000 • Vite Port 5173</div>
        </div>
      </div>

      {/* Multi-Tenant Directory Table */}
      <div className="p-5 rounded-2xl bg-theme-card border border-theme-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-theme-subtle">
          <div>
            <h2 className="text-base font-bold text-theme-primary">Multi-Tenant Business Directory</h2>
            <p className="text-xs text-theme-muted">Manage all SaaS organizations, switches, portals, and quotas</p>
          </div>
          <input
            type="text"
            placeholder="Search businesses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-theme-surface border border-theme-subtle text-xs text-theme-primary placeholder-theme-muted focus:outline-none focus:border-blue-500 w-full sm:w-60"
          />
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-theme-muted">Loading tenant database...</div>
        ) : filteredBusinesses.length === 0 ? (
          <div className="py-12 text-center text-xs text-theme-muted">No businesses found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="text-theme-muted border-b border-theme-subtle">
                  <th className="pb-3 font-semibold">Tenant Name & ID</th>
                  <th className="pb-3 font-semibold">Vertical Suite</th>
                  <th className="pb-3 font-semibold">Subscription Plan</th>
                  <th className="pb-3 font-semibold">Public Customer Portal</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme-subtle">
                {filteredBusinesses.map((b) => {
                  const isActive = business?.id === b.id;
                  const portalUrl =
                    b.industry === "salon"
                      ? `/book/${b.slug}`
                      : b.industry === "cafe"
                      ? `/menu/${b.slug}`
                      : `/book/${b.slug}`;

                  return (
                    <tr key={b.id} className="hover:bg-theme-surface/40 transition-colors">
                      <td className="py-4 pr-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-theme-surface border border-theme-subtle flex items-center justify-center font-bold text-xs text-theme-primary shrink-0">
                            #{b.id}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-theme-primary flex items-center gap-2">
                              <span>{b.name}</span>
                              {isActive && (
                                <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-blue-600 text-white font-mono uppercase font-semibold">
                                  Current
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-theme-muted font-mono">{b.slug}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 pr-3">{getIndustryBadge(b.industry)}</td>

                      <td className="py-4 pr-3">
                        <span className="text-xs font-mono font-semibold uppercase px-2 py-0.5 rounded bg-theme-surface border border-theme-subtle text-amber-400 dark:text-amber-300">
                          {b.plan || "Growth"} Tier
                        </span>
                      </td>

                      <td className="py-4 pr-3">
                        <Link
                          to={portalUrl}
                          target="_blank"
                          className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-medium"
                        >
                          <span>{b.industry === "cafe" ? "Digital QR Menu" : "Live Booking Portal"}</span>
                          <FiExternalLink className="text-xs" />
                        </Link>
                      </td>

                      <td className="py-4 text-right space-x-2">
                        <button
                          onClick={() => handleSwitchAndManage(b.id)}
                          className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/25 transition-all cursor-pointer inline-flex items-center gap-1"
                        >
                          <span>Switch to Tenant</span>
                          <FiArrowRight />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Global Administrative Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/leads"
          className="p-4 rounded-2xl bg-theme-card border border-theme-card hover:border-blue-500/50 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-950/40 text-blue-400 border border-blue-800/40">
              <FiUsers className="text-lg" />
            </div>
            <div>
              <div className="font-semibold text-xs text-theme-primary">Leads & Enquiries CRM</div>
              <div className="text-[11px] text-theme-muted">Manage pipeline conversions</div>
            </div>
          </div>
          <FiArrowRight className="text-theme-muted group-hover:text-blue-400 transition-colors" />
        </Link>

        <Link
          to="/settings"
          className="p-4 rounded-2xl bg-theme-card border border-theme-card hover:border-purple-500/50 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-950/40 text-purple-400 border border-purple-800/40">
              <FiShield className="text-lg" />
            </div>
            <div>
              <div className="font-semibold text-xs text-theme-primary">User & Role Management</div>
              <div className="text-[11px] text-theme-muted">Team members and permissions</div>
            </div>
          </div>
          <FiArrowRight className="text-theme-muted group-hover:text-purple-400 transition-colors" />
        </Link>

        <Link
          to="/plans"
          className="p-4 rounded-2xl bg-theme-card border border-theme-card hover:border-amber-500/50 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-950/40 text-amber-400 border border-amber-800/40">
              <FiLayers className="text-lg" />
            </div>
            <div>
              <div className="font-semibold text-xs text-theme-primary">Invoices & Subscription Plans</div>
              <div className="text-[11px] text-theme-muted">Tier quotas and commercial limits</div>
            </div>
          </div>
          <FiArrowRight className="text-theme-muted group-hover:text-amber-400 transition-colors" />
        </Link>
      </div>
    </div>
  );
}