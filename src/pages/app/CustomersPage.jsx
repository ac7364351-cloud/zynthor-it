import { useState, useEffect } from "react";
import { FiUsers, FiSearch, FiDollarSign, FiCalendar, FiPlus, FiPhone, FiMail, FiX } from "react-icons/fi";
import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function CustomersPage() {
  const { business } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const [newCust, setNewCust] = useState({
    name: "",
    email: "",
    phone: "",
    notes: "",
  });

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await api.getCustomers();
      if (res.success) {
        setCustomers(res.customers || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [business?.id]);

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    try {
      await api.createCustomer(newCust);
      setModalOpen(false);
      setNewCust({ name: "", email: "", phone: "", notes: "" });
      fetchCustomers();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.phone && c.phone.includes(searchTerm))
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
            <span>Customer Directory</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400">
              {customers.length} Profiles
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Lifetime relationship history, visits, and spending records for {business?.name || "your business"}.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all self-start sm:self-auto"
        >
          <FiPlus className="text-sm" />
          <span>New Customer Profile</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl">
        <div className="relative max-w-md">
          <FiSearch className="absolute left-3 top-2.5 text-slate-500 text-xs" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search customers by name, phone or email..."
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Directory Grid */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Loading customer profiles...</div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-xs text-slate-400 bg-slate-900/40 rounded-2xl border border-slate-800/80">
          No customer records found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <div
              key={c.id}
              className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl shadow-xl shadow-black/20 space-y-4 hover:border-slate-700 transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">{c.name}</h3>
                  <div className="text-[11px] text-slate-400 flex items-center space-x-2 mt-0.5">
                    {c.email && (
                      <span className="flex items-center space-x-1 truncate max-w-[150px]">
                        <FiMail className="text-[10px]" />
                        <span>{c.email}</span>
                      </span>
                    )}
                  </div>
                  {c.phone && (
                    <div className="text-[11px] text-slate-400 flex items-center space-x-1 mt-0.5">
                      <FiPhone className="text-[10px]" />
                      <span>{c.phone}</span>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-emerald-400">
                    ₹{(c.total_spend || 0).toLocaleString("en-IN")}
                  </div>
                  <div className="text-[10px] text-slate-400">Lifetime Spend</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-800/80 text-slate-400">
                <div className="flex items-center space-x-1">
                  <FiCalendar className="text-[11px]" />
                  <span>{c.visit_count || 1} Visits recorded</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">{c.last_visit || "Recent"}</span>
              </div>

              {c.notes && (
                <p className="text-[11px] text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
                  {c.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Create Customer Profile</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <FiX />
              </button>
            </div>
            <form onSubmit={handleCreateCustomer} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Customer Full Name *</label>
                <input
                  type="text"
                  required
                  value={newCust.name}
                  onChange={(e) => setNewCust({ ...newCust, name: e.target.value })}
                  placeholder="e.g. Meera Kapoor"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={newCust.email}
                    onChange={(e) => setNewCust({ ...newCust, email: e.target.value })}
                    placeholder="meera@domain.com"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={newCust.phone}
                    onChange={(e) => setNewCust({ ...newCust, phone: e.target.value })}
                    placeholder="+91 98000 00000"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Preferences & Notes</label>
                <textarea
                  rows={2}
                  value={newCust.notes}
                  onChange={(e) => setNewCust({ ...newCust, notes: e.target.value })}
                  placeholder="Service preferences, allergies, VIP status..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-md shadow-blue-600/30"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
