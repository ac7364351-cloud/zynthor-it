import { useState, useEffect } from "react";
import {
  FiUsers,
  FiSearch,
  FiFilter,
  FiDownload,
  FiPlus,
  FiCheckCircle,
  FiTrash2,
  FiEdit,
  FiPhone,
  FiMail,
  FiClock,
  FiX,
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

  // New Lead Form State
  const [newLead, setNewLead] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    budget: "₹5,000 - ₹10,000",
    source: "Website Direct",
    notes: "",
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
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
            <span>Inbound Leads CRM</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-950/80 border border-blue-500/40 text-blue-400">
              {leads.length} Records
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Capture, qualify and convert customer inquiries for {business?.name || "your business"}.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <a
            href={api.exportLeadsCsvUrl()}
            download
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 transition-colors shadow-sm"
          >
            <FiDownload />
            <span>Export CSV</span>
          </a>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all"
          >
            <FiPlus className="text-sm" />
            <span>Add Lead</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status Filters */}
        <div className="flex items-center space-x-1 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {statusPills.map((p) => (
            <button
              key={p.value}
              onClick={() => setStatusFilter(p.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                statusFilter === p.value
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex items-center w-full md:w-72">
          <div className="relative w-full">
            <FiSearch className="absolute left-3 top-2.5 text-slate-500 text-xs" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, service..."
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </form>
      </div>

      {/* Leads Table */}
      <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl shadow-xl shadow-black/20 overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">Loading pipeline...</div>
        ) : leads.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <p className="text-xs text-slate-400">No leads found matching current filter.</p>
            <button
              onClick={() => {
                setStatusFilter("all");
                setSearchTerm("");
              }}
              className="text-xs text-blue-400 hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800/80 pb-3">
                  <th className="pb-3 font-semibold">Lead Contact</th>
                  <th className="pb-3 font-semibold">Service & Budget</th>
                  <th className="pb-3 font-semibold">Source</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Notes</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {leads.map((lead) => {
                  const statusColors = {
                    new: "bg-blue-950/80 text-blue-400 border-blue-800/60",
                    contacted: "bg-amber-950/80 text-amber-400 border-amber-800/60",
                    qualified: "bg-purple-950/80 text-purple-400 border-purple-800/60",
                    converted: "bg-emerald-950/80 text-emerald-400 border-emerald-800/60",
                    lost: "bg-red-950/80 text-red-400 border-red-800/60",
                  };
                  return (
                    <tr key={lead.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 pr-4">
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
                      <td className="py-3.5 pr-4">
                        <div className="text-slate-200 font-medium">{lead.service || "General Inquiry"}</div>
                        <div className="text-[10px] text-slate-400">{lead.budget || "Standard"}</div>
                      </td>
                      <td className="py-3.5 pr-4">
                        <span className="text-[11px] text-slate-300 font-mono">{lead.source}</span>
                      </td>
                      <td className="py-3.5 pr-4">
                        <select
                          value={lead.status}
                          onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border bg-transparent focus:outline-none cursor-pointer ${
                            statusColors[lead.status] || statusColors.new
                          }`}
                        >
                          <option value="new" className="bg-slate-900 text-white">NEW</option>
                          <option value="contacted" className="bg-slate-900 text-white">CONTACTED</option>
                          <option value="qualified" className="bg-slate-900 text-white">QUALIFIED</option>
                          <option value="converted" className="bg-slate-900 text-white">CONVERTED</option>
                          <option value="lost" className="bg-slate-900 text-white">LOST</option>
                        </select>
                      </td>
                      <td className="py-3.5 pr-4 max-w-xs truncate text-[11px] text-slate-400">
                        {lead.notes || "No notes"}
                      </td>
                      <td className="py-3.5 text-right space-x-2">
                        <button
                          onClick={() => handleDelete(lead.id)}
                          className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800 transition-colors"
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

      {/* Add Lead Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Add New Inbound Lead</h3>
              <button onClick={() => setCreateModalOpen(false)} className="text-slate-400 hover:text-white">
                <FiX />
              </button>
            </div>
            <form onSubmit={handleCreateSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Lead Name *</label>
                <input
                  type="text"
                  required
                  value={newLead.name}
                  onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                  placeholder="e.g. Vikramaditya Roy"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={newLead.email}
                  onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                  placeholder="vikram@domain.com"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={newLead.phone}
                    onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                    placeholder="+91 98000 00000"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Budget</label>
                  <input
                    type="text"
                    value={newLead.budget}
                    onChange={(e) => setNewLead({ ...newLead, budget: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Service Required</label>
                <input
                  type="text"
                  value={newLead.service}
                  onChange={(e) => setNewLead({ ...newLead, service: e.target.value })}
                  placeholder="Web Application / Keratin Treatment"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={newLead.notes}
                  onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })}
                  placeholder="Client requirements..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-md shadow-blue-600/30"
                >
                  Create Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
