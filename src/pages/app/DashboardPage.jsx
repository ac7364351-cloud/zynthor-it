import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FiTrendingUp,
  FiUsers,
  FiCalendar,
  FiCoffee,
  FiPlus,
  FiArrowUpRight,
  FiRefreshCw,
  FiAlertTriangle,
} from "react-icons/fi";
import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function DashboardPage() {
  const { business } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentLeads, setRecentLeads] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Status update modal state
  const [updatingLead, setUpdatingLead] = useState(null);
  const [statusVal, setStatusVal] = useState("contacted");

  const loadData = async (isRef = false) => {
    if (isRef) setRefreshing(true);
    try {
      setError(null);
      const res = await api.getDashboardStats();
      if (res.success) {
        setStats(res.stats);
        setRecentLeads(res.recentLeads || []);
        setActivities(res.recentActivities || []);
      }
    } catch (err) {
      setError(err.message || "Failed to load dashboard metrics.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [business?.id]);

  const handleMarkContacted = async (leadId) => {
    try {
      await api.updateLead(leadId, { status: "contacted" });
      setRecentLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, status: "contacted" } : l))
      );
      loadData(false);
    } catch (err) {
      alert("Failed to update status: " + err.message);
    }
  };

  const handleSaveStatus = async () => {
    if (!updatingLead) return;
    try {
      await api.updateLead(updatingLead.id, { status: statusVal });
      setRecentLeads((prev) =>
        prev.map((l) => (l.id === updatingLead.id ? { ...l, status: statusVal } : l))
      );
      setUpdatingLead(null);
      loadData(false);
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-theme-muted font-medium">Loading executive analytics...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-theme-primary w-full min-w-0">
      {/* Header & Quick Sync */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 min-w-0">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-theme-primary break-words">
              {business?.name || "Luxe Aura Studio"} Overview
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-950/40 border border-emerald-500/40 text-emerald-400 shrink-0">
              ● Live Systems Online
            </span>
          </div>
          <p className="text-xs text-theme-muted mt-1">
            Real-time multi-tenant telemetry, sales conversions, and customer operations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-theme-surface hover:bg-theme-surface-hover border border-theme-subtle text-xs font-medium text-theme-secondary hover:text-theme-primary transition-colors cursor-pointer shrink-0"
          >
            <FiRefreshCw className={`text-xs ${refreshing ? "animate-spin" : ""}`} />
            <span>Sync</span>
          </button>
          <Link
            to="/leads"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all cursor-pointer shrink-0"
          >
            <FiPlus className="text-sm shrink-0" />
            <span>New Inbound Lead</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
          <FiAlertTriangle className="text-base shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Primary KPI Metrics Grid — High-Contrast Elevated Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Revenue */}
        <div className="p-5 rounded-2xl bg-theme-card border border-theme-card relative overflow-hidden transition-all group hover:border-slate-500/50">
          <div className="flex items-center justify-between text-xs text-theme-muted mb-2">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Real Revenue</span>
            <div className="p-2 rounded-xl bg-emerald-950/40 text-emerald-400 border border-emerald-800/40">
              <FiTrendingUp className="text-sm" />
            </div>
          </div>
          <div className="text-2xl font-bold text-theme-primary tracking-tight">
            ₹{(stats?.totalRevenue || 0).toLocaleString("en-IN")}
          </div>
          <div className="flex items-center gap-1 text-xs text-emerald-400 mt-2 font-medium">
            <FiArrowUpRight />
            <span>Calculated from authorized DB records</span>
          </div>
        </div>

        {/* KPI 2: Active Leads */}
        <div className="p-5 rounded-2xl bg-theme-card border border-theme-card relative overflow-hidden transition-all group hover:border-slate-500/50">
          <div className="flex items-center justify-between text-xs text-theme-muted mb-2">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Inbound CRM Leads</span>
            <div className="p-2 rounded-xl bg-blue-950/40 text-blue-400 border border-blue-800/40">
              <FiUsers className="text-sm" />
            </div>
          </div>
          <div className="text-2xl font-bold text-theme-primary tracking-tight">
            {stats?.totalLeads || 0}
          </div>
          <div className="text-xs text-theme-muted mt-2 flex items-center gap-2">
            <span className="text-blue-400 font-semibold">{stats?.newLeads || 0} New</span>
            <span>•</span>
            <span>{stats?.conversionRate || 0}% Conversion</span>
          </div>
        </div>

        {/* KPI 3: Salon Appointments */}
        <div className="p-5 rounded-2xl bg-theme-card border border-theme-card relative overflow-hidden transition-all group hover:border-slate-500/50">
          <div className="flex items-center justify-between text-xs text-theme-muted mb-2">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Appointments</span>
            <div className="p-2 rounded-xl bg-purple-950/40 text-purple-400 border border-purple-800/40">
              <FiCalendar className="text-sm" />
            </div>
          </div>
          <div className="text-2xl font-bold text-theme-primary tracking-tight">
            {stats?.appointmentsCount || 0}
          </div>
          <div className="text-xs text-purple-400 mt-2 font-medium">
            Active bookings & wellness slots
          </div>
        </div>

        {/* KPI 4: Active Kitchen Orders */}
        <div className="p-5 rounded-2xl bg-theme-card border border-theme-card relative overflow-hidden transition-all group hover:border-slate-500/50">
          <div className="flex items-center justify-between text-xs text-theme-muted mb-2">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Kitchen Orders</span>
            <div className="p-2 rounded-xl bg-amber-950/40 text-amber-400 border border-amber-800/40">
              <FiCoffee className="text-sm" />
            </div>
          </div>
          <div className="text-2xl font-bold text-theme-primary tracking-tight">
            {stats?.activeOrdersCount || 0}
          </div>
          <div className="text-xs text-amber-400 mt-2 font-medium">
            Live orders in KDS kitchen workflow
          </div>
        </div>
      </div>

      {/* Main Workspace Grid: Leads Table + Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-w-0">
        {/* Left Column: Recent Inbound Leads Table */}
        <div className="lg:col-span-2 p-4 sm:p-5 rounded-2xl bg-theme-card border border-theme-card flex flex-col justify-between min-w-0 overflow-hidden">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-theme-subtle">
              <div>
                <h2 className="text-base font-semibold text-theme-primary">Recent Inbound Leads</h2>
                <p className="text-xs text-theme-muted">Strictly authorized tenant lead records</p>
              </div>
              <Link
                to="/leads"
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
              >
                <span>View Full CRM</span>
                <FiArrowUpRight />
              </Link>
            </div>

            {/* Table */}
            <div className="overflow-x-auto mt-4">
              {recentLeads.length === 0 ? (
                <div className="py-12 text-center text-xs text-theme-muted">
                  No inbound leads recorded yet for this tenant.
                </div>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="text-theme-muted border-b border-theme-subtle">
                      <th className="pb-3 font-semibold">Lead Contact</th>
                      <th className="pb-3 font-semibold">Service Requirement</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 font-semibold text-right">Quick Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-theme-subtle">
                    {recentLeads.map((lead) => {
                      const statusStyles = {
                        new: "bg-blue-950/60 text-blue-400 border-blue-800/50",
                        contacted: "bg-amber-950/60 text-amber-400 border-amber-800/50",
                        qualified: "bg-purple-950/60 text-purple-400 border-purple-800/50",
                        converted: "bg-emerald-950/60 text-emerald-400 border-emerald-800/50",
                        lost: "bg-red-950/60 text-red-400 border-red-800/50",
                      };
                      return (
                        <tr key={lead.id} className="hover:bg-theme-surface/50 transition-colors">
                          <td className="py-3.5 pr-3">
                            <div className="font-semibold text-theme-primary">{lead.name}</div>
                            <div className="text-[11px] text-theme-muted flex items-center gap-2 mt-0.5">
                              <span>{lead.email}</span>
                              {lead.phone && (
                                <>
                                  <span>•</span>
                                  <span>{lead.phone}</span>
                                </>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 pr-3">
                            <div className="text-theme-secondary font-medium">{lead.service || "General Inquiry"}</div>
                            <div className="text-[10px] text-theme-muted">{lead.budget || "Standard"}</div>
                          </td>
                          <td className="py-3.5 pr-3">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                statusStyles[lead.status] || statusStyles.new
                              }`}
                            >
                              {lead.status}
                            </span>
                          </td>
                          <td className="py-3.5 text-right space-x-2">
                            {lead.status === "new" ? (
                              <button
                                onClick={() => handleMarkContacted(lead.id)}
                                className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-semibold transition-colors cursor-pointer"
                              >
                                Mark Contacted
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setUpdatingLead(lead);
                                  setStatusVal(lead.status);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-theme-surface hover:bg-theme-surface-hover text-theme-secondary border border-theme-subtle text-[11px] font-medium transition-colors cursor-pointer"
                              >
                                Update Status
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Recent Activities Feed */}
        <div className="p-5 rounded-2xl bg-theme-card border border-theme-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-theme-subtle">
              <h2 className="text-base font-semibold text-theme-primary">Operations Audit Trail</h2>
              <span className="text-[10px] font-mono uppercase bg-theme-surface px-2 py-0.5 rounded text-theme-muted border border-theme-subtle">
                Live Audit
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {activities.length === 0 ? (
                <div className="text-center py-8 text-xs text-theme-muted">No activity recorded yet.</div>
              ) : (
                activities.slice(0, 5).map((act) => (
                  <div key={act.id} className="flex items-start gap-3 text-xs">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                    <div>
                      <div className="font-semibold text-theme-secondary">
                        {act.action} <span className="text-theme-muted font-normal">by {act.user_name}</span>
                      </div>
                      <p className="text-[11px] text-theme-muted mt-0.5">{act.details}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-theme-subtle mt-4">
            <Link
              to="/ai-bot"
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-gradient-to-r from-blue-600/20 to-indigo-600/20 hover:from-blue-600/30 hover:to-indigo-600/30 text-blue-400 border border-blue-500/30 text-xs font-semibold transition-all"
            >
              <span>Ask AI Copilot to summarize activities</span>
              <FiArrowUpRight />
            </Link>
          </div>
        </div>
      </div>

      {/* Status Update Modal */}
      {updatingLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-theme-card border border-theme-card rounded-2xl p-6 space-y-4 shadow-2xl text-theme-primary">
            <h3 className="text-base font-bold text-theme-primary">Update Lead Status</h3>
            <p className="text-xs text-theme-muted">
              Change pipeline status for <strong className="text-theme-primary">{updatingLead.name}</strong>.
            </p>
            <select
              value={statusVal}
              onChange={(e) => setStatusVal(e.target.value)}
              className="w-full bg-theme-surface border border-theme-subtle rounded-xl px-3 py-2 text-xs text-theme-primary focus:outline-none focus:border-blue-500"
            >
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="converted">Converted (Creates Customer)</option>
              <option value="lost">Lost</option>
            </select>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setUpdatingLead(null)}
                className="px-4 py-1.5 text-xs text-theme-muted hover:text-theme-primary rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveStatus}
                className="px-4 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-md shadow-blue-600/30 cursor-pointer"
              >
                Save Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
