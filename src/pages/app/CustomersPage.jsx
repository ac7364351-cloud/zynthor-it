import { useState, useEffect } from "react";
import { FiSearch, FiCalendar, FiPlus, FiPhone, FiMail, FiX } from "react-icons/fi";
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
    <div className="max-w-7xl mx-auto space-y-6 text-theme-primary">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-theme-primary flex items-center gap-2">
            <span>Customer Directory</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-950/40 border border-emerald-500/40 text-emerald-400">
              {customers.length} Profiles
            </span>
          </h1>
          <p className="text-xs text-theme-muted mt-1">
            Lifetime relationship history, visits, and spending records for {business?.name || "your business"}.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all self-start sm:self-auto cursor-pointer"
        >
          <FiPlus className="text-sm" />
          <span>New Customer Profile</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-theme-card border border-theme-card">
        <div className="relative max-w-md">
          <FiSearch className="absolute left-3 top-2.5 text-theme-muted text-xs" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search customers by name, phone or email..."
            className="w-full bg-theme-surface border border-theme-subtle rounded-xl pl-8 pr-3 py-1.5 text-xs text-theme-primary placeholder-theme-muted focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Directory Grid */}
      {loading ? (
        <div className="py-16 text-center text-xs text-theme-muted">Loading customer profiles...</div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-xs text-theme-muted bg-theme-card rounded-2xl border border-theme-card">
          No customer records found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <div
              key={c.id}
              className="p-5 rounded-2xl bg-theme-card border border-theme-card space-y-4 hover:border-slate-500/50 transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-theme-primary">{c.name}</h3>
                  <div className="text-[11px] text-theme-muted flex items-center gap-2 mt-0.5">
                    {c.email && (
                      <span className="flex items-center gap-1 truncate max-w-[150px]">
                        <FiMail className="text-[10px]" />
                        <span>{c.email}</span>
                      </span>
                    )}
                  </div>
                  {c.phone && (
                    <div className="text-[11px] text-theme-muted flex items-center gap-1 mt-0.5">
                      <FiPhone className="text-[10px]" />
                      <span>{c.phone}</span>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-emerald-400">
                    ₹{(c.total_spend || 0).toLocaleString("en-IN")}
                  </div>
                  <div className="text-[10px] text-theme-muted">Lifetime Spend</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-3 border-t border-theme-subtle text-theme-muted">
                <div className="flex items-center gap-1">
                  <FiCalendar className="text-[11px]" />
                  <span>{c.visit_count || 1} Visits recorded</span>
                </div>
                <span className="text-[10px] font-mono text-theme-muted">{c.last_visit || "Recent"}</span>
              </div>

              {c.notes && (
                <p className="text-[11px] text-theme-secondary bg-theme-surface p-2.5 rounded-xl border border-theme-subtle">
                  {c.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* New Customer Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-theme-card border border-theme-subtle rounded-3xl p-6 space-y-4 shadow-2xl text-theme-primary">
            <div className="flex items-center justify-between pb-3 border-b border-theme-subtle">
              <h3 className="text-base font-bold text-theme-primary">Create Customer Profile</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-theme-muted hover:text-theme-primary cursor-pointer"
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-3 text-xs">
              <div>
                <label className="block text-theme-secondary font-semibold mb-1">Customer Full Name *</label>
                <input
                  type="text"
                  required
                  value={newCust.name}
                  onChange={(e) => setNewCust({ ...newCust, name: e.target.value })}
                  placeholder="e.g. Radhika Apte"
                  className="w-full bg-theme-surface border border-theme-subtle rounded-xl px-3 py-2 text-theme-primary placeholder-theme-muted focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-theme-secondary font-semibold mb-1">Email</label>
                  <input
                    type="email"
                    value={newCust.email}
                    onChange={(e) => setNewCust({ ...newCust, email: e.target.value })}
                    placeholder="client@mail.com"
                    className="w-full bg-theme-surface border border-theme-subtle rounded-xl px-3 py-2 text-theme-primary placeholder-theme-muted focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-theme-secondary font-semibold mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={newCust.phone}
                    onChange={(e) => setNewCust({ ...newCust, phone: e.target.value })}
                    placeholder="+91 99000 00000"
                    className="w-full bg-theme-surface border border-theme-subtle rounded-xl px-3 py-2 text-theme-primary placeholder-theme-muted focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-theme-secondary font-semibold mb-1">Client Preferences & Notes</label>
                <textarea
                  rows={2}
                  value={newCust.notes}
                  onChange={(e) => setNewCust({ ...newCust, notes: e.target.value })}
                  placeholder="Specific allergy, preferred stylist, VIP notes..."
                  className="w-full bg-theme-surface border border-theme-subtle rounded-xl px-3 py-2 text-theme-primary placeholder-theme-muted focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-theme-subtle">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-1.5 text-theme-muted hover:text-theme-primary cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-md shadow-blue-600/30 cursor-pointer"
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
