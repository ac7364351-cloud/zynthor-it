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
  FiArchive,
  FiTrash2,
  FiRotateCcw,
  FiEdit3,
  FiEye,
  FiDownload,
  FiAlertTriangle,
  FiX,
  FiSearch,
} from "react-icons/fi";
import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function AdminPage() {
  const { business, switchBusiness } = useAuth();
  const navigate = useNavigate();

  // Navigation tab: 'active' | 'archived'
  const [activeTab, setActiveTab] = useState("active");

  const [businesses, setBusinesses] = useState([]);
  const [archivedBusinesses, setArchivedBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [industryFilter, setIndustryFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");

  // Notifications / feedback
  const [feedback, setFeedback] = useState(null);

  // Modals state
  const [inspectModal, setInspectModal] = useState(null); // business object with counts
  const [editModal, setEditModal] = useState(null); // business object to edit
  const [createModal, setCreateModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null); // business object to delete
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  // Create Form State
  const [createForm, setCreateForm] = useState({
    name: "",
    industry: "general",
    email: "",
    phone: "",
    address: "",
    currency: "INR",
    plan: "growth",
  });

  // Edit Form State
  const [editForm, setEditForm] = useState({
    name: "",
    industry: "general",
    email: "",
    phone: "",
    address: "",
    currency: "INR",
    plan: "growth",
  });

  const showFeedback = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const loadData = async (isRef = false) => {
    if (isRef) setRefreshing(true);
    setLoading(true);
    try {
      const [actRes, archRes] = await Promise.all([
        api.getBusinesses({ include_archived: "false" }),
        api.getArchivedBusinesses().catch(() => ({ success: true, businesses: [] })),
      ]);

      if (actRes.success && actRes.businesses) {
        setBusinesses(actRes.businesses);
      }
      if (archRes.success && archRes.businesses) {
        setArchivedBusinesses(archRes.businesses);
      }
    } catch (err) {
      showFeedback("error", `Failed to load establishments: ${err.message}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSwitchAndManage = (bId) => {
    switchBusiness(bId);
    showFeedback("success", `Switched active workspace to establishment #${bId}.`);
    navigate("/dashboard");
  };

  const handleInspectBusiness = async (bId) => {
    try {
      const res = await api.getBusiness(bId);
      if (res.success) {
        setInspectModal(res);
      }
    } catch (err) {
      showFeedback("error", `Failed to load business details: ${err.message}`);
    }
  };

  const handleOpenEdit = (b) => {
    setEditModal(b);
    setEditForm({
      name: b.name || "",
      industry: b.industry || "general",
      email: b.email || "",
      phone: b.phone || "",
      address: b.address || "",
      currency: b.currency || "INR",
      plan: b.plan || "growth",
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editModal) return;
    try {
      await api.updateBusiness(editModal.id, editForm);
      showFeedback("success", `Establishment '${editForm.name}' updated successfully.`);
      setEditModal(null);
      loadData(false);
    } catch (err) {
      showFeedback("error", `Update failed: ${err.message}`);
    }
  };

  const handleCreateBusiness = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createBusiness(createForm);
      showFeedback("success", res.message || "Establishment provisioned successfully.");
      setCreateModal(false);
      setCreateForm({
        name: "",
        industry: "general",
        email: "",
        phone: "",
        address: "",
        currency: "INR",
        plan: "growth",
      });
      loadData(false);
    } catch (err) {
      showFeedback("error", `Creation failed: ${err.message}`);
    }
  };

  const handleToggleActivate = async (b) => {
    try {
      if (b.status === "active") {
        await api.deactivateBusiness(b.id);
        showFeedback("success", `Establishment '${b.name}' deactivated.`);
      } else {
        await api.activateBusiness(b.id);
        showFeedback("success", `Establishment '${b.name}' activated.`);
      }
      loadData(false);
    } catch (err) {
      showFeedback("error", err.message);
    }
  };

  const handleArchiveBusiness = async (b) => {
    if (!window.confirm(`Archive '${b.name}'? It will disappear from active listings and customer portals.`)) {
      return;
    }
    try {
      await api.archiveBusiness(b.id);
      showFeedback("success", `Establishment '${b.name}' moved to Archives.`);
      loadData(false);
    } catch (err) {
      showFeedback("error", err.message);
    }
  };

  const handleRestoreBusiness = async (b) => {
    try {
      await api.restoreBusiness(b.id);
      showFeedback("success", `Establishment '${b.name}' restored to active directory.`);
      loadData(false);
    } catch (err) {
      showFeedback("error", err.message);
    }
  };

  const handlePermanentDelete = async (e) => {
    e.preventDefault();
    if (!deleteModal) return;
    if (deleteConfirmText.trim().toLowerCase() !== deleteModal.name.trim().toLowerCase()) {
      showFeedback("error", "The entered business name does not match exactly.");
      return;
    }

    setDeleting(true);
    try {
      const isDemo = deleteModal.is_demo === 1;
      const res = await api.deleteBusinessPermanent(deleteModal.id, deleteConfirmText, isDemo);
      showFeedback("success", res.message || "Establishment permanently purged.");
      setDeleteModal(null);
      setDeleteConfirmText("");
      loadData(false);
    } catch (err) {
      showFeedback("error", `Permanent deletion failed: ${err.message}`);
    } finally {
      setDeleting(false);
    }
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

  const currentList = activeTab === "active" ? businesses : archivedBusinesses;

  const filteredBusinesses = currentList.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesIndustry = industryFilter === "all" || b.industry === industryFilter;
    const matchesPlan = planFilter === "all" || b.plan === planFilter;
    return matchesSearch && matchesIndustry && matchesPlan;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-theme-primary w-full min-w-0 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-theme-primary flex items-center gap-2">
              <FiShield className="text-blue-500" />
              <span>Super Admin & Business Management</span>
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-950/40 border border-emerald-500/40 text-emerald-400">
              ● Multi-Tenant Engine Online
            </span>
          </div>
          <p className="text-xs text-theme-muted mt-1">
            Complete lifecycle management: Provision, inspect, edit, activate, archive, restore, and safe permanent purge.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-theme-surface hover:bg-theme-surface-hover border border-theme-subtle text-xs font-medium text-theme-secondary hover:text-theme-primary transition-colors cursor-pointer"
          >
            <FiRefreshCw className={`text-xs ${refreshing ? "animate-spin" : ""}`} />
            <span>Sync</span>
          </button>
          <button
            onClick={() => setCreateModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
          >
            <FiPlus className="text-sm" />
            <span>Provision New Business</span>
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-3.5 rounded-2xl text-xs flex items-center justify-between border animate-in fade-in ${
            feedback.type === "error"
              ? "bg-red-950/70 border-red-500/50 text-red-200"
              : "bg-emerald-950/70 border-emerald-500/50 text-emerald-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "error" ? <FiAlertTriangle className="text-base shrink-0" /> : <FiCheckCircle className="text-base shrink-0" />}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white">
            <FiX />
          </button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-theme-card border border-theme-card shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-theme-muted">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Active Establishments</span>
            <div className="p-2 rounded-xl bg-blue-950/40 text-blue-400 border border-blue-800/40">
              <FiBriefcase className="text-sm" />
            </div>
          </div>
          <div className="text-2xl font-bold text-theme-primary">{businesses.length} Active</div>
          <div className="text-[11px] text-theme-muted">Isolated multi-tenant SQLite/MySQL nodes</div>
        </div>

        <div className="p-5 rounded-2xl bg-theme-card border border-theme-card shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-theme-muted">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Archived Businesses</span>
            <div className="p-2 rounded-xl bg-slate-900/60 text-slate-300 border border-slate-700">
              <FiArchive className="text-sm" />
            </div>
          </div>
          <div className="text-2xl font-bold text-theme-primary">{archivedBusinesses.length} Archived</div>
          <div className="text-[11px] text-theme-muted">Safely stored, restorable on demand</div>
        </div>

        <div className="p-5 rounded-2xl bg-theme-card border border-theme-card shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-theme-muted">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Active Tenant</span>
            <div className="p-2 rounded-xl bg-purple-950/40 text-purple-400 border border-purple-800/40">
              <FiLayers className="text-sm" />
            </div>
          </div>
          <div className="text-xl font-bold text-theme-primary truncate">{business?.name || "Luxe Aura"}</div>
          <div className="text-[11px] text-purple-400 capitalize">{business?.industry} OS • {business?.plan || "Growth"} Tier</div>
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
      </div>

      {/* Main Tabbed Directory & Management Card */}
      <div className="p-5 rounded-2xl bg-theme-card border border-theme-card space-y-4">
        {/* Tabs Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-theme-subtle">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("active")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "active"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "bg-theme-surface text-theme-secondary hover:text-theme-primary hover:bg-theme-surface-hover"
              }`}
            >
              Active Establishments ({businesses.length})
            </button>
            <button
              onClick={() => setActiveTab("archived")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "archived"
                  ? "bg-amber-600 text-white shadow-md shadow-amber-600/30"
                  : "bg-theme-surface text-theme-secondary hover:text-theme-primary hover:bg-theme-surface-hover"
              }`}
            >
              Archived ({archivedBusinesses.length})
            </button>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <FiSearch className="absolute left-3 top-2.5 text-theme-muted text-xs" />
              <input
                type="text"
                placeholder="Search businesses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl bg-theme-surface border border-theme-subtle text-xs text-theme-primary placeholder-theme-muted focus:outline-none focus:border-blue-500 w-44 sm:w-56"
              />
            </div>

            <select
              value={industryFilter}
              onChange={(e) => setIndustryFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-theme-surface border border-theme-subtle text-xs text-theme-primary focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Verticals</option>
              <option value="salon">Salon & Spa</option>
              <option value="cafe">Cafe & Dining</option>
              <option value="agency">Agency / IT</option>
              <option value="general">General</option>
            </select>

            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-theme-surface border border-theme-subtle text-xs text-theme-primary focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Plans</option>
              <option value="starter">Starter</option>
              <option value="growth">Growth</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>
        </div>

        {/* Directory Table */}
        {loading ? (
          <div className="py-12 text-center text-xs text-theme-muted">Loading establishment directory...</div>
        ) : filteredBusinesses.length === 0 ? (
          <div className="py-12 text-center text-xs text-theme-muted">
            {activeTab === "active" ? "No active businesses match your criteria." : "No archived establishments found."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="text-theme-muted border-b border-theme-subtle">
                  <th className="pb-3 font-semibold">Tenant Name & ID</th>
                  <th className="pb-3 font-semibold">Vertical Suite</th>
                  <th className="pb-3 font-semibold">Plan & Status</th>
                  <th className="pb-3 font-semibold">Customer Portal</th>
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
                      <td className="py-3.5 pr-3">
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
                              {b.is_demo === 1 && (
                                <span className="text-[9px] px-1 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                                  Demo
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-theme-muted font-mono">{b.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 pr-3">{getIndustryBadge(b.industry)}</td>

                      <td className="py-3.5 pr-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10.5px] font-mono font-semibold uppercase px-2 py-0.5 rounded bg-theme-surface border border-theme-subtle text-amber-400 dark:text-amber-300">
                            {b.plan || "Growth"}
                          </span>
                          <span
                            className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full capitalize ${
                              b.status === "active"
                                ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/40"
                                : b.is_archived
                                ? "bg-slate-800 text-slate-400 border border-slate-700"
                                : "bg-red-950/60 text-red-400 border border-red-800/40"
                            }`}
                          >
                            {b.status || "active"}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 pr-3">
                        <Link
                          to={portalUrl}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-medium"
                        >
                          <span>{b.industry === "cafe" ? "QR Menu" : "Booking Portal"}</span>
                          <FiExternalLink className="text-[10px]" />
                        </Link>
                      </td>

                      <td className="py-3.5 text-right space-x-1.5">
                        {activeTab === "active" ? (
                          <>
                            {/* Inspect */}
                            <button
                              onClick={() => handleInspectBusiness(b.id)}
                              className="p-1.5 rounded-lg bg-theme-surface hover:bg-theme-surface-hover text-theme-secondary hover:text-theme-primary transition-colors cursor-pointer"
                              title="Inspect Business Breakdown"
                            >
                              <FiEye />
                            </button>

                            {/* Edit */}
                            <button
                              onClick={() => handleOpenEdit(b)}
                              className="p-1.5 rounded-lg bg-theme-surface hover:bg-theme-surface-hover text-theme-secondary hover:text-theme-primary transition-colors cursor-pointer"
                              title="Edit Business Profile"
                            >
                              <FiEdit3 />
                            </button>

                            {/* Activate / Deactivate */}
                            <button
                              onClick={() => handleToggleActivate(b)}
                              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                b.status === "active"
                                  ? "bg-emerald-950/30 text-emerald-400 border-emerald-800/40 hover:bg-red-950/30 hover:text-red-400 hover:border-red-800/40"
                                  : "bg-red-950/30 text-red-400 border-red-800/40 hover:bg-emerald-950/30 hover:text-emerald-400"
                              }`}
                              title={b.status === "active" ? "Deactivate" : "Activate"}
                            >
                              <FiActivity />
                            </button>

                            {/* Archive */}
                            <button
                              onClick={() => handleArchiveBusiness(b)}
                              className="p-1.5 rounded-lg bg-theme-surface hover:bg-amber-950/30 text-theme-secondary hover:text-amber-400 transition-colors cursor-pointer"
                              title="Archive Business"
                            >
                              <FiArchive />
                            </button>

                            {/* Switch & Manage */}
                            <button
                              onClick={() => handleSwitchAndManage(b.id)}
                              className="px-2.5 py-1 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-semibold shadow-md shadow-blue-600/25 transition-all cursor-pointer inline-flex items-center gap-1"
                            >
                              <span>Switch</span>
                              <FiArrowRight />
                            </button>
                          </>
                        ) : (
                          <>
                            {/* Restore */}
                            <button
                              onClick={() => handleRestoreBusiness(b)}
                              className="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold shadow-md shadow-emerald-600/25 transition-all cursor-pointer inline-flex items-center gap-1"
                            >
                              <FiRotateCcw />
                              <span>Restore</span>
                            </button>

                            {/* Export Backup */}
                            <a
                              href={api.exportBusinessUrl(b.id)}
                              download
                              className="p-1.5 rounded-lg bg-theme-surface hover:bg-theme-surface-hover text-theme-secondary hover:text-theme-primary transition-colors inline-block"
                              title="Download Full JSON Backup"
                            >
                              <FiDownload />
                            </a>

                            {/* Permanent Delete */}
                            <button
                              onClick={() => {
                                setDeleteModal(b);
                                setDeleteConfirmText("");
                              }}
                              className="p-1.5 rounded-lg bg-red-950/40 text-red-400 hover:bg-red-900/60 border border-red-800/40 transition-colors cursor-pointer"
                              title="Permanently Delete Business"
                            >
                              <FiTrash2 />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ====================================================================
          MODAL 1: INSPECT BUSINESS BREAKDOWN DETAILS
          ==================================================================== */}
      {inspectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-theme-card border border-theme-card rounded-3xl p-6 space-y-5 shadow-2xl text-theme-primary animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-theme-subtle">
              <div>
                <h3 className="text-lg font-bold text-theme-primary flex items-center gap-2">
                  <span>{inspectModal.business.name}</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                    ID #{inspectModal.business.id}
                  </span>
                </h3>
                <p className="text-xs text-theme-muted font-mono mt-0.5">{inspectModal.business.slug}</p>
              </div>
              <button onClick={() => setInspectModal(null)} className="text-theme-muted hover:text-theme-primary">
                <FiX className="text-lg" />
              </button>
            </div>

            {/* Counts Breakdown Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-theme-surface border border-theme-subtle text-center">
                <div className="text-xs text-theme-muted font-semibold uppercase">Users</div>
                <div className="text-lg font-bold text-theme-primary">{inspectModal.counts.users}</div>
              </div>
              <div className="p-3 rounded-xl bg-theme-surface border border-theme-subtle text-center">
                <div className="text-xs text-theme-muted font-semibold uppercase">Leads</div>
                <div className="text-lg font-bold text-theme-primary">{inspectModal.counts.leads}</div>
              </div>
              <div className="p-3 rounded-xl bg-theme-surface border border-theme-subtle text-center">
                <div className="text-xs text-theme-muted font-semibold uppercase">Customers</div>
                <div className="text-lg font-bold text-theme-primary">{inspectModal.counts.customers}</div>
              </div>
              <div className="p-3 rounded-xl bg-theme-surface border border-theme-subtle text-center">
                <div className="text-xs text-theme-muted font-semibold uppercase">Invoices</div>
                <div className="text-lg font-bold text-theme-primary">{inspectModal.counts.invoices}</div>
              </div>
            </div>

            {/* Profile Information */}
            <div className="p-4 rounded-xl bg-theme-surface border border-theme-subtle space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-theme-muted font-semibold">Vertical Suite: </span>
                  <span className="capitalize">{inspectModal.business.industry}</span>
                </div>
                <div>
                  <span className="text-theme-muted font-semibold">Subscription Plan: </span>
                  <span className="capitalize">{inspectModal.business.plan}</span>
                </div>
                <div>
                  <span className="text-theme-muted font-semibold">Contact Email: </span>
                  <span>{inspectModal.business.email}</span>
                </div>
                <div>
                  <span className="text-theme-muted font-semibold">Contact Phone: </span>
                  <span>{inspectModal.business.phone || "Not set"}</span>
                </div>
                <div>
                  <span className="text-theme-muted font-semibold">Currency: </span>
                  <span>{inspectModal.business.currency}</span>
                </div>
                <div>
                  <span className="text-theme-muted font-semibold">Status: </span>
                  <span className="capitalize">{inspectModal.business.status || "active"}</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-between items-center pt-2">
              <a
                href={api.exportBusinessUrl(inspectModal.business.id)}
                download
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-theme-surface hover:bg-theme-surface-hover text-xs text-theme-secondary hover:text-theme-primary border border-theme-subtle transition-colors"
              >
                <FiDownload />
                <span>Export JSON Backup</span>
              </a>

              <div className="flex gap-2">
                <button
                  onClick={() => setInspectModal(null)}
                  className="px-4 py-1.5 rounded-xl text-xs text-theme-secondary hover:text-theme-primary"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleSwitchAndManage(inspectModal.business.id);
                    setInspectModal(null);
                  }}
                  className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30"
                >
                  Switch into Workspace
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL 2: EDIT BUSINESS
          ==================================================================== */}
      {editModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-theme-card border border-theme-card rounded-3xl p-6 space-y-4 shadow-2xl text-theme-primary animate-in fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-theme-subtle">
              <h3 className="text-base font-bold text-theme-primary">Edit Establishment Profile</h3>
              <button onClick={() => setEditModal(null)} className="text-theme-muted hover:text-theme-primary">
                <FiX />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-theme-secondary mb-1">Business Name *</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full bg-theme-surface border border-theme-subtle rounded-xl px-3 py-2 text-xs text-theme-primary focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-theme-secondary mb-1">Vertical Suite</label>
                  <select
                    value={editForm.industry}
                    onChange={(e) => setEditForm({ ...editForm, industry: e.target.value })}
                    className="w-full bg-theme-surface border border-theme-subtle rounded-xl px-3 py-2 text-xs text-theme-primary focus:outline-none focus:border-blue-500"
                  >
                    <option value="salon">Salon & Spa</option>
                    <option value="cafe">Cafe & Dining</option>
                    <option value="agency">Agency / IT</option>
                    <option value="general">General Business</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-theme-secondary mb-1">Plan Tier</label>
                  <select
                    value={editForm.plan}
                    onChange={(e) => setEditForm({ ...editForm, plan: e.target.value })}
                    className="w-full bg-theme-surface border border-theme-subtle rounded-xl px-3 py-2 text-xs text-theme-primary focus:outline-none focus:border-blue-500"
                  >
                    <option value="starter">Starter</option>
                    <option value="growth">Growth</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-theme-secondary mb-1">Contact Email *</label>
                  <input
                    type="email"
                    required
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full bg-theme-surface border border-theme-subtle rounded-xl px-3 py-2 text-xs text-theme-primary focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-theme-secondary mb-1">Phone</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full bg-theme-surface border border-theme-subtle rounded-xl px-3 py-2 text-xs text-theme-primary focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-theme-secondary mb-1">Physical Address</label>
                <input
                  type="text"
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  className="w-full bg-theme-surface border border-theme-subtle rounded-xl px-3 py-2 text-xs text-theme-primary focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditModal(null)}
                  className="px-4 py-1.5 text-xs text-theme-secondary hover:text-theme-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-md shadow-blue-600/30"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL 3: PROVISION NEW BUSINESS
          ==================================================================== */}
      {createModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-theme-card border border-theme-card rounded-3xl p-6 space-y-4 shadow-2xl text-theme-primary animate-in fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-theme-subtle">
              <h3 className="text-base font-bold text-theme-primary">Provision New Business Tenant</h3>
              <button onClick={() => setCreateModal(false)} className="text-theme-muted hover:text-theme-primary">
                <FiX />
              </button>
            </div>

            <form onSubmit={handleCreateBusiness} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-theme-secondary mb-1">Business / Brand Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ivory Dental Spa"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  className="w-full bg-theme-surface border border-theme-subtle rounded-xl px-3 py-2 text-xs text-theme-primary focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-theme-secondary mb-1">Vertical Suite *</label>
                  <select
                    value={createForm.industry}
                    onChange={(e) => setCreateForm({ ...createForm, industry: e.target.value })}
                    className="w-full bg-theme-surface border border-theme-subtle rounded-xl px-3 py-2 text-xs text-theme-primary focus:outline-none focus:border-blue-500"
                  >
                    <option value="salon">Salon & Spa Suite</option>
                    <option value="cafe">Cafe & Restaurant Suite</option>
                    <option value="agency">Agency & Professional Services</option>
                    <option value="general">General Business CRM</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-theme-secondary mb-1">Initial Tier</label>
                  <select
                    value={createForm.plan}
                    onChange={(e) => setCreateForm({ ...createForm, plan: e.target.value })}
                    className="w-full bg-theme-surface border border-theme-subtle rounded-xl px-3 py-2 text-xs text-theme-primary focus:outline-none focus:border-blue-500"
                  >
                    <option value="starter">Starter Essential (₹999/mo)</option>
                    <option value="growth">Growth Professional (₹2,499/mo)</option>
                    <option value="enterprise">Enterprise Titanium (₹4,999/mo)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-theme-secondary mb-1">Owner / Contact Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="owner@domain.com"
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    className="w-full bg-theme-surface border border-theme-subtle rounded-xl px-3 py-2 text-xs text-theme-primary focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-theme-secondary mb-1">Phone</label>
                  <input
                    type="text"
                    placeholder="+91 98000 00000"
                    value={createForm.phone}
                    onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                    className="w-full bg-theme-surface border border-theme-subtle rounded-xl px-3 py-2 text-xs text-theme-primary focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-theme-secondary mb-1">Physical Address</label>
                <input
                  type="text"
                  placeholder="Branch location or HQ address"
                  value={createForm.address}
                  onChange={(e) => setCreateForm({ ...createForm, address: e.target.value })}
                  className="w-full bg-theme-surface border border-theme-subtle rounded-xl px-3 py-2 text-xs text-theme-primary focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateModal(false)}
                  className="px-4 py-1.5 text-xs text-theme-secondary hover:text-theme-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-md shadow-blue-600/30"
                >
                  Provision Tenant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL 4: PERMANENT DELETION SAFETY MODAL (PHASE 2 REQUIREMENT)
          ==================================================================== */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="w-full max-w-md bg-theme-card border border-red-500/50 rounded-3xl p-6 space-y-4 shadow-2xl text-theme-primary animate-in zoom-in-95">
            <div className="flex items-center gap-3 text-red-400 pb-2 border-b border-theme-subtle">
              <div className="p-2 rounded-xl bg-red-950/60 border border-red-800">
                <FiTrash2 className="text-xl" />
              </div>
              <div>
                <h3 className="text-base font-bold text-red-300">Irreversible Permanent Deletion</h3>
                <p className="text-[11px] text-theme-muted">Safety verification and database integrity protocol</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-red-950/30 border border-red-900/50 text-xs text-red-200 space-y-2">
              <p className="font-semibold">
                You are about to permanently purge establishment:
              </p>
              <div className="p-2 rounded bg-black/40 border border-red-900/40 font-mono text-center text-sm font-bold text-red-300">
                {deleteModal.name} (ID #{deleteModal.id})
              </div>
              <ul className="text-[11px] space-y-1 list-disc list-inside text-red-300/80">
                <li>All associated leads, appointments, dishes, and orders will be purged.</li>
                <li>An audit snapshot will be archived in the security log.</li>
                <li>This operation is atomic and irreversible.</li>
              </ul>
            </div>

            <form onSubmit={handlePermanentDelete} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-theme-secondary mb-1">
                  Type <span className="font-mono text-red-400">"{deleteModal.name}"</span> to confirm:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Type exact business name..."
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="w-full bg-theme-surface border border-red-500/50 rounded-xl px-3.5 py-2 text-xs text-theme-primary focus:outline-none focus:border-red-400"
                />
              </div>

              <div className="flex justify-between items-center pt-2">
                <a
                  href={api.exportBusinessUrl(deleteModal.id)}
                  download
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  <FiDownload />
                  <span>Download Backup First</span>
                </a>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setDeleteModal(null);
                      setDeleteConfirmText("");
                    }}
                    className="px-3.5 py-1.5 text-xs text-theme-secondary hover:text-theme-primary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={
                      deleteConfirmText.trim().toLowerCase() !== deleteModal.name.trim().toLowerCase() ||
                      deleting
                    }
                    className="px-4 py-1.5 text-xs font-semibold bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl shadow-lg shadow-red-600/30 cursor-pointer"
                  >
                    {deleting ? "Purging..." : "Confirm & Purge"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}