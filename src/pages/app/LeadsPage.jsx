import { useState, useEffect } from "react";
import {
  FiSearch,
  FiDownload,
  FiPlus,
  FiTrash2,
  FiEdit,
  FiX,
  FiEye,
  FiUser,
  FiCalendar,
  FiCheckCircle,
} from "react-icons/fi";
import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function LeadsPage() {
  const { business } = useAuth();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [viewingLead, setViewingLead] = useState(null);

  // New Lead Form State
  const [newLead, setNewLead] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    budget: "₹5,000 - ₹10,000",
    source: "Website Direct",
    notes: "",
    assigned_to: "",
    follow_up_date: "",
  });

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await api.getLeads(statusFilter, searchTerm);
      if (res.success) {
        setLeads(res.leads);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [statusFilter, business?.id]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchLeads();
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.updateLead(id, { status: newStatus });
      setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l)));
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this lead from your CRM pipeline?")) return;
    try {
      await api.deleteLead(id);
      setLeads((prev) => prev.filter((l) => l.id !== id));
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createLead(newLead);
      setCreateModalOpen(false);
      setNewLead({
        name: "",
        email: "",
        phone: "",
        service: "",
        budget: "₹5,000 - ₹10,000",
        source: "Website Direct",
        notes: "",
        assigned_to: "",
        follow_up_date: "",
      });
      fetchLeads();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const statusPills = [
    { label: "All Leads", value: "all" },
    { label: "New", value: "new" },
    { label: "Contacted", value: "contacted" },
    { label: "Qualified", value: "qualified" },
    { label: "Converted", value: "converted" },
    { label: "Lost", value: "lost" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-theme-primary">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-theme-primary flex items-center gap-2">
            <span>Inbound Leads CRM</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-950/40 border border-blue-500/40 text-blue-400">
              {leads.length} Records
            </span>
          </h1>
          <p className="text-xs text-theme-muted mt-1">
            Capture, qualify and convert customer inquiries for {business?.name || "your business"}.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={api.exportLeadsCsvUrl()}
            download
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-theme-surface hover:bg-theme-surface-hover border border-theme-subtle text-xs font-medium text-theme-secondary hover:text-theme-primary transition-colors shadow-sm cursor-pointer"
          >
            <FiDownload />
            <span>Export CSV</span>
          </a>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
          >
            <FiPlus className="text-sm" />
            <span>Add Lead</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-theme-card border border-theme-card flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {statusPills.map((p) => (
            <button
              key={p.value}
              onClick={() => setStatusFilter(p.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === p.value
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "text-theme-muted hover:text-theme-primary hover:bg-theme-surface"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex items-center w-full md:w-72">
          <div className="relative w-full">
            <FiSearch className="absolute left-3 top-2.5 text-theme-muted text-xs" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, service..."
              className="w-full bg-theme-surface border border-theme-subtle rounded-xl pl-8 pr-3 py-1.5 text-xs text-theme-primary placeholder-theme-muted focus:outline-none focus:border-blue-500"
            />
          </div>
        </form>
      </div>

      {/* Leads Table */}
      <div className="p-5 rounded-2xl bg-theme-card border border-theme-card overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-theme-muted">Loading pipeline...</div>
        ) : leads.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <p className="text-xs text-theme-muted">No leads found matching current filter.</p>
            <button
              onClick={() => {
                setStatusFilter("all");
                setSearchTerm("");
              }}
              className="text-xs text-blue-400 hover:underline cursor-pointer"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="text-theme-muted border-b border-theme-subtle pb-3">
                  <th className="pb-3 font-semibold">Lead Contact</th>
                  <th className="pb-3 font-semibold">Service & Budget</th>
                  <th className="pb-3 font-semibold">Follow-Up & Assignee</th>
                  <th className="pb-3 font-semibold">Source</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Notes</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme-subtle">
                {leads.map((lead) => {
                  const statusColors = {
                    new: "bg-blue-950/60 text-blue-400 border-blue-800/50",
                    contacted: "bg-amber-950/60 text-amber-400 border-amber-800/50",
                    qualified: "bg-purple-950/60 text-purple-400 border-purple-800/50",
                    converted: "bg-emerald-950/60 text-emerald-400 border-emerald-800/50",
                    lost: "bg-red-950/60 text-red-400 border-red-800/50",
                  };
                  return (
                    <tr key={lead.id} className="hover:bg-theme-surface/40 transition-colors">
                      <td className="py-3.5 pr-4">
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
                      <td className="py-3.5 pr-4">
                        <div className="text-theme-secondary font-medium">{lead.service || "General Inquiry"}</div>
                        <div className="text-[10px] text-theme-muted">{lead.budget || "Standard"}</div>
                      </td>
                      <td className="py-3.5 pr-4">
                        <div className="text-theme-secondary font-medium text-[11px] flex items-center gap-1.5">
                          <FiUser className="text-theme-muted shrink-0" />
                          <span>{lead.assigned_to || "Unassigned"}</span>
                        </div>
                        {lead.follow_up_date && (
                          <div className="text-[10px] text-amber-400 flex items-center gap-1 mt-0.5">
                            <FiCalendar className="shrink-0" />
                            <span>Due: {lead.follow_up_date}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 pr-4">
                        <span className="text-[11px] text-theme-secondary font-mono">{lead.source}</span>
                      </td>
                      <td className="py-3.5 pr-4">
                        <select
                          value={lead.status}
                          onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border bg-theme-surface text-theme-primary focus:outline-none cursor-pointer ${
                            statusColors[lead.status] || statusColors.new
                          }`}
                        >
                          <option value="new">NEW</option>
                          <option value="contacted">CONTACTED</option>
                          <option value="qualified">QUALIFIED</option>
                          <option value="converted">CONVERTED</option>
                          <option value="lost">LOST</option>
                        </select>
                      </td>
                      <td className="py-3.5 pr-4 max-w-xs truncate text-theme-muted text-[11px]">
                        {lead.notes || "—"}
                      </td>
                      <td className="py-3.5 text-right space-x-1">
                        <button
                          onClick={() => setViewingLead(lead)}
                          className="p-1.5 rounded-lg text-theme-muted hover:text-emerald-400 hover:bg-theme-surface transition-colors cursor-pointer"
                          title="View Lead Details"
                        >
                          <FiEye />
                        </button>
                        <button
                          onClick={() => setEditingLead(lead)}
                          className="p-1.5 rounded-lg text-theme-muted hover:text-blue-400 hover:bg-theme-surface transition-colors cursor-pointer"
                          title="Edit Lead"
                        >
                          <FiEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(lead.id)}
                          className="p-1.5 rounded-lg text-theme-muted hover:text-red-400 hover:bg-theme-surface transition-colors cursor-pointer"
                          title="Delete Lead"
                        >
                          <FiTrash2 />
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

      {/* Create Lead Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-theme-card border border-theme-subtle rounded-3xl p-6 space-y-4 shadow-2xl text-theme-primary">
            <div className="flex items-center justify-between pb-3 border-b border-theme-subtle">
              <h3 className="text-base font-bold text-theme-primary">Add New Inbound Lead</h3>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="text-theme-muted hover:text-theme-primary cursor-pointer"
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-theme-secondary font-semibold mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newLead.name}
                  onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                  placeholder="e.g. Vikramaditya Sen"
                  className="w-full bg-theme-surface border border-theme-subtle rounded-xl px-3 py-2 text-theme-primary placeholder-theme-muted focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-theme-secondary font-semibold mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={newLead.email}
                    onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                    placeholder="client@domain.com"
                    className="w-full bg-theme-surface border border-theme-subtle rounded-xl px-3 py-2 text-theme-primary placeholder-theme-muted focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-theme-secondary font-semibold mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={newLead.phone}
                    onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                    placeholder="+91 98000 00000"
                    className="w-full bg-theme-surface border border-theme-subtle rounded-xl px-3 py-2 text-theme-primary placeholder-theme-muted focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-theme-secondary font-semibold mb-1">Service</label>
                  <input
                    type="text"
                    value={newLead.service}
                    onChange={(e) => setNewLead({ ...newLead, service: e.target.value })}
                    placeholder="Hair Spa / Custom App"
                    className="w-full bg-theme-surface border border-theme-subtle rounded-xl px-3 py-2 text-theme-primary placeholder-theme-muted focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-theme-secondary font-semibold mb-1">Budget</label>
                  <input
                    type="text"
                    value={newLead.budget}
                    onChange={(e) => setNewLead({ ...newLead, budget: e.target.value })}
                    placeholder="₹5,000 - ₹10,000"
                    className="w-full bg-theme-surface border border-theme-subtle rounded-xl px-3 py-2 text-theme-primary placeholder-theme-muted focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-theme-secondary font-semibold mb-1">Assign to Staff</label>
                  <input
                    type="text"
                    value={newLead.assigned_to}
                    onChange={(e) => setNewLead({ ...newLead, assigned_to: e.target.value })}
                    placeholder="e.g. Vikram Sharma"
                    className="w-full bg-theme-surface border border-theme-subtle rounded-xl px-3 py-2 text-theme-primary placeholder-theme-muted focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-theme-secondary font-semibold mb-1">Follow-up Date</label>
                  <input
                    type="date"
                    value={newLead.follow_up_date}
                    onChange={(e) => setNewLead({ ...newLead, follow_up_date: e.target.value })}
                    className="w-full bg-theme-surface border border-theme-subtle rounded-xl px-3 py-2 text-theme-primary placeholder-theme-muted focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-theme-secondary font-semibold mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={newLead.notes}
                  onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })}
                  placeholder="Inquiry notes..."
                  className="w-full bg-theme-surface border border-theme-subtle rounded-xl px-3 py-2 text-theme-primary placeholder-theme-muted focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-theme-subtle">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-1.5 text-theme-muted hover:text-theme-primary cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-md shadow-blue-600/30 cursor-pointer"
                >
                  Save Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Lead Modal */}
      {editingLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-theme-card border border-theme-subtle rounded-3xl p-6 space-y-4 shadow-2xl text-theme-primary">
            <div className="flex items-center justify-between pb-3 border-b border-theme-subtle">
              <h3 className="text-base font-bold text-theme-primary">Edit Lead: {editingLead.name}</h3>
              <button
                onClick={() => setEditingLead(null)}
                className="text-theme-muted hover:text-theme-primary cursor-pointer"
              >
                <FiX />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  await api.updateLead(editingLead.id, editingLead);
                  setEditingLead(null);
                  fetchLeads();
                } catch (err) {
                  alert("Error: " + err.message);
                }
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block text-theme-secondary font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editingLead.name}
                  onChange={(e) => setEditingLead({ ...editingLead, name: e.target.value })}
                  className="w-full bg-theme-surface border border-theme-subtle rounded-xl px-3 py-2 text-theme-primary focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-theme-secondary font-semibold mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={editingLead.email}
                    onChange={(e) => setEditingLead({ ...editingLead, email: e.target.value })}
                    className="w-full bg-theme-surface border border-theme-subtle rounded-xl px-3 py-2 text-theme-primary focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-theme-secondary font-semibold mb-1">Phone</label>
                  <input
                    type="tel"
                    value={editingLead.phone || ""}
                    onChange={(e) => setEditingLead({ ...editingLead, phone: e.target.value })}
                    className="w-full bg-theme-surface border border-theme-subtle rounded-xl px-3 py-2 text-theme-primary focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-theme-secondary font-semibold mb-1">Assign to Staff</label>
                  <input
                    type="text"
                    value={editingLead.assigned_to || ""}
                    onChange={(e) => setEditingLead({ ...editingLead, assigned_to: e.target.value })}
                    placeholder="Staff member name"
                    className="w-full bg-theme-surface border border-theme-subtle rounded-xl px-3 py-2 text-theme-primary focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-theme-secondary font-semibold mb-1">Follow-up Date</label>
                  <input
                    type="date"
                    value={editingLead.follow_up_date || ""}
                    onChange={(e) => setEditingLead({ ...editingLead, follow_up_date: e.target.value })}
                    className="w-full bg-theme-surface border border-theme-subtle rounded-xl px-3 py-2 text-theme-primary focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-theme-secondary font-semibold mb-1">Status</label>
                <select
                  value={editingLead.status}
                  onChange={(e) => setEditingLead({ ...editingLead, status: e.target.value })}
                  className="w-full bg-theme-surface border border-theme-subtle rounded-xl px-3 py-2 text-theme-primary focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="new">NEW</option>
                  <option value="contacted">CONTACTED</option>
                  <option value="qualified">QUALIFIED</option>
                  <option value="converted">CONVERTED (Creates Customer)</option>
                  <option value="lost">LOST</option>
                </select>
              </div>

              <div>
                <label className="block text-theme-secondary font-semibold mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={editingLead.notes || ""}
                  onChange={(e) => setEditingLead({ ...editingLead, notes: e.target.value })}
                  className="w-full bg-theme-surface border border-theme-subtle rounded-xl px-3 py-2 text-theme-primary focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-theme-subtle">
                <button
                  type="button"
                  onClick={() => setEditingLead(null)}
                  className="px-4 py-1.5 text-theme-muted hover:text-theme-primary cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-md shadow-blue-600/30 cursor-pointer"
                >
                  Update Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Lead Details Modal */}
      {viewingLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-theme-card border border-theme-subtle rounded-3xl p-6 space-y-4 shadow-2xl text-theme-primary">
            <div className="flex items-center justify-between pb-3 border-b border-theme-subtle">
              <div className="flex items-center gap-2">
                <FiUser className="text-blue-500 text-base" />
                <h3 className="text-base font-bold text-theme-primary">{viewingLead.name}</h3>
              </div>
              <button
                onClick={() => setViewingLead(null)}
                className="text-theme-muted hover:text-theme-primary cursor-pointer"
              >
                <FiX />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-theme-surface border border-theme-subtle">
                <div>
                  <span className="text-theme-muted block text-[10px] uppercase font-semibold">Email</span>
                  <span className="font-medium text-theme-primary">{viewingLead.email}</span>
                </div>
                <div>
                  <span className="text-theme-muted block text-[10px] uppercase font-semibold">Phone</span>
                  <span className="font-medium text-theme-primary">{viewingLead.phone || "Not provided"}</span>
                </div>
                <div>
                  <span className="text-theme-muted block text-[10px] uppercase font-semibold">Service</span>
                  <span className="font-medium text-theme-primary">{viewingLead.service || "General Inquiry"}</span>
                </div>
                <div>
                  <span className="text-theme-muted block text-[10px] uppercase font-semibold">Budget</span>
                  <span className="font-medium text-theme-primary">{viewingLead.budget || "Standard"}</span>
                </div>
                <div>
                  <span className="text-theme-muted block text-[10px] uppercase font-semibold">Status</span>
                  <span className="font-bold uppercase text-blue-400">{viewingLead.status}</span>
                </div>
                <div>
                  <span className="text-theme-muted block text-[10px] uppercase font-semibold">Lead Source</span>
                  <span className="font-mono text-theme-primary">{viewingLead.source}</span>
                </div>
                <div>
                  <span className="text-theme-muted block text-[10px] uppercase font-semibold">Assigned Staff</span>
                  <span className="font-medium text-theme-primary">{viewingLead.assigned_to || "Unassigned"}</span>
                </div>
                <div>
                  <span className="text-theme-muted block text-[10px] uppercase font-semibold">Follow-Up Date</span>
                  <span className="font-medium text-amber-400">{viewingLead.follow_up_date || "No date set"}</span>
                </div>
              </div>

              {viewingLead.notes && (
                <div className="p-3 rounded-xl bg-theme-surface border border-theme-subtle">
                  <span className="text-theme-muted block text-[10px] uppercase font-semibold mb-1">Notes & History</span>
                  <p className="text-theme-secondary whitespace-pre-wrap">{viewingLead.notes}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-theme-subtle">
              <button
                type="button"
                onClick={() => {
                  setEditingLead(viewingLead);
                  setViewingLead(null);
                }}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs cursor-pointer"
              >
                Edit Lead
              </button>
              <button
                type="button"
                onClick={() => setViewingLead(null)}
                className="px-4 py-1.5 text-theme-muted hover:text-theme-primary text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
