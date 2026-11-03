import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FiTrendingUp,
  FiUsers,
  FiCalendar,
  FiCoffee,
  FiCheckCircle,
  FiClock,
  FiPlus,
  FiArrowUpRight,
  FiPhone,
  FiMail,
  FiMoreVertical,
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
        <span className="text-xs text-slate-400 font-medium">Loading executive analytics...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header & Quick Sync */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              {business?.name || "Luxe Aura Studio"} Overview
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400">
              ● Live Systems Online
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time multi-tenant telemetry, sales conversions, and customer operations.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 transition-colors"
          >
            <FiRefreshCw className={`text-xs ${refreshing ? "animate-spin" : ""}`} />
            <span>Sync</span>
          </button>
          <Link
            to="/app/leads"
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all"
          >
            <FiPlus className="text-sm" />
            <span>New Inbound Lead</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-950/50 border border-red-500/40 text-red-300 text-xs flex items-center space-x-2">
          <FiAlertTriangle className="text-base flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Revenue */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl relative overflow-hidden shadow-xl shadow-black/20 group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Real Revenue</span>
            <div className="p-2 rounded-xl bg-emerald-950/50 text-emerald-400 border border-emerald-800/50">
              <FiTrendingUp className="text-sm" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            ₹{(stats?.totalRevenue || 0).toLocaleString("en-IN")}
          </div>
          <div className="flex items-center space-x-1 text-xs text-emerald-400 mt-2 font-medium">
            <FiArrowUpRight />
            <span>Calculated from authorized DB records</span>
          </div>
        </div>

        {/* KPI 2: Active Leads */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl relative overflow-hidden shadow-xl shadow-black/20 group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Inbound CRM Leads</span>
            <div className="p-2 rounded-xl bg-blue-950/50 text-blue-400 border border-blue-800/50">
              <FiUsers className="text-sm" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {stats?.totalLeads || 0}
          </div>
          <div className="text-xs text-slate-400 mt-2 flex items-center space-x-2">
            <span className="text-blue-400 font-semibold">{stats?.newLeads || 0} New</span>
            <span>•</span>
            <span>{stats?.conversionRate || 0}% Conversion</span>
          </div>
        </div>

        {/* KPI 3: Salon Appointments */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl relative overflow-hidden shadow-xl shadow-black/20 group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Appointments</span>
            <div className="p-2 rounded-xl bg-purple-950/50 text-purple-400 border border-purple-800/50">
              <FiCalendar className="text-sm" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {stats?.appointmentsCount || 0}
          </div>
          <div className="text-xs text-purple-400 mt-2 font-medium">
            Active bookings & wellness slots
          </div>
        </div>

        {/* KPI 4: Active Kitchen Orders */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl relative overflow-hidden shadow-xl shadow-black/20 group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Kitchen Orders</span>
            <div className="p-2 rounded-xl bg-amber-950/50 text-amber-400 border border-amber-800/50">
              <FiCoffee className="text-sm" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {stats?.activeOrdersCount || 0}
          </div>
          <div className="text-xs text-amber-400 mt-2 font-medium">
            Live orders in KDS kitchen workflow
          </div>
        </div>
      </div>

      {/* Main Workspace Grid: Leads Table + Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Inbound Leads Table */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl shadow-xl shadow-black/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
              <div>
                <h2 className="text-base font-semibold text-white">Recent Inbound Leads</h2>
                <p className="text-xs text-slate-400">Strictly authorized tenant lead records</p>
              </div>
              <Link
                to="/app/leads"
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center space-x-1"
              >
                <span>View Full CRM</span>
                <FiArrowUpRight />
              </Link>
            </div>

            {/* Table */}
            <div className="overflow-x-auto mt-4">
              {recentLeads.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  No inbound leads recorded yet for this tenant.
                </div>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-800/80">
                      <th className="pb-3 font-semibold">Lead Contact</th>
                      <th className="pb-3 font-semibold">Service Requirement</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 font-semibold text-right">Quick Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {recentLeads.map((lead) => {
                      const statusStyles = {
                        new: "bg-blue-950/80 text-blue-400 border-blue-800/60",
                        contacted: "bg-amber-950/80 text-amber-400 border-amber-800/60",
                        qualified: "bg-purple-950/80 text-purple-400 border-purple-800/60",
                        converted: "bg-emerald-950/80 text-emerald-400 border-emerald-800/60",
                        lost: "bg-red-950/80 text-red-400 border-red-800/60",
                      };
                      return (
                        <tr key={lead.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3.5 pr-3">
                            <div className="font-semibold text-white">{lead.name}</div>
                            <div className="text-[11px] text-slate-400 flex items-center space-x-2 mt-0.5">
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
                            <div className="text-slate-200 font-medium">{lead.service || "General Inquiry"}</div>
                            <div className="text-[10px] text-slate-400">{lead.budget || "Standard"}</div>
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
                                className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-semibold transition-colors"
                              >
                                Mark Contacted
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setUpdatingLead(lead);
                                  setStatusVal(lead.status);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] font-medium transition-colors"
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
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl shadow-xl shadow-black/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
              <h2 className="text-base font-semibold text-white">Operations Audit Trail</h2>
              <span className="text-[10px] font-mono uppercase bg-slate-800 px-2 py-0.5 rounded text-slate-400">
                Live Audit
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {activities.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">No activity recorded yet.</div>
              ) : (
                activities.slice(0, 5).map((act) => (
                  <div key={act.id} className="flex items-start space-x-3 text-xs">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-slate-200">
                        {act.action} <span className="text-slate-400 font-normal">by {act.user_name}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{act.details}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 mt-4">
            <Link
              to="/app/ai-bot"
              className="w-full flex items-center justify-center space-x-2 py-2 rounded-xl bg-gradient-to-r from-blue-600/20 to-indigo-600/20 hover:from-blue-600/30 hover:to-indigo-600/30 text-blue-400 border border-blue-500/30 text-xs font-semibold transition-all"
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
          <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Update Lead Status</h3>
            <p className="text-xs text-slate-400">
              Change pipeline status for <strong className="text-white">{updatingLead.name}</strong>.
            </p>
            <select
              value={statusVal}
              onChange={(e) => setStatusVal(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="converted">Converted (Creates Customer)</option>
              <option value="lost">Lost</option>
            </select>
            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setUpdatingLead(null)}
                className="px-4 py-1.5 text-xs text-slate-400 hover:text-white rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveStatus}
                className="px-4 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-md shadow-blue-600/30"
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
