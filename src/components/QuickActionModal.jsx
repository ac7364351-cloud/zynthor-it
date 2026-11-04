import { useState } from "react";
import { FiX, FiUserPlus, FiCalendar, FiCheckCircle } from "react-icons/fi";
import { api } from "../services/api";

export default function QuickActionModal({ isOpen, onClose, onActionSuccess }) {
  const [tab, setTab] = useState("lead"); // 'lead' | 'appointment'
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Lead Form State
  const [leadForm, setLeadForm] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    budget: "₹5,000 - ₹10,000",
    notes: "",
  });

  // Appointment Form State
  const [apptForm, setApptForm] = useState({
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    service_id: 1,
    staff_id: 1,
    appointment_date: new Date().toISOString().split("T")[0],
    appointment_time: "15:00",
    notes: "",
  });

  if (!isOpen) return null;

  const handleCreateLead = async (e) => {
    e.preventDefault();
    if (!leadForm.name || !leadForm.email) {
      setErrorMsg("Name and email are required.");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    try {
      await api.createLead(leadForm);
      setSuccessMsg("Lead successfully added to CRM pipeline!");
      setTimeout(() => {
        setSuccessMsg("");
        onClose();
        if (onActionSuccess) onActionSuccess();
      }, 1000);
    } catch (err) {
      setErrorMsg(err.message || "Failed to create lead.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAppointment = async (e) => {
    e.preventDefault();
    if (!apptForm.customer_name || !apptForm.appointment_date || !apptForm.appointment_time) {
      setErrorMsg("Customer name, date and time are required.");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    try {
      await api.createAppointment(apptForm);
      setSuccessMsg("Appointment booked and confirmed without conflict!");
      setTimeout(() => {
        setSuccessMsg("");
        onClose();
        if (onActionSuccess) onActionSuccess();
      }, 1000);
    } catch (err) {
      setErrorMsg(err.message || "Failed to create appointment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="w-full max-w-lg bg-theme-card border border-theme-subtle rounded-3xl shadow-2xl overflow-hidden text-theme-primary animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-theme-subtle flex items-center justify-between bg-theme-surface/60">
          <div>
            <h3 className="text-base font-bold text-theme-primary">Quick Operational Action</h3>
            <p className="text-xs text-theme-muted">Instant entry for leads and scheduled bookings</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-theme-muted hover:text-theme-primary rounded-xl hover:bg-theme-surface transition-colors cursor-pointer"
          >
            <FiX className="text-lg" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="flex border-b border-theme-subtle bg-theme-surface/30 p-1.5 gap-1.5">
          <button
            onClick={() => setTab("lead")}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              tab === "lead"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "text-theme-muted hover:text-theme-primary hover:bg-theme-surface"
            }`}
          >
            <FiUserPlus className="text-sm" />
            <span>New Inbound Lead</span>
          </button>
          <button
            onClick={() => setTab("appointment")}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              tab === "appointment"
                ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                : "text-theme-muted hover:text-theme-primary hover:bg-theme-surface"
            }`}
          >
            <FiCalendar className="text-sm" />
            <span>Book Appointment</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
              <FiCheckCircle className="text-base shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs">
              {errorMsg}
            </div>
          )}

          {tab === "lead" && (
            <form onSubmit={handleCreateLead} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-theme-secondary mb-1">Contact Name *</label>
                  <input
                    type="text"
                    required
                    value={leadForm.name}
                    onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                    placeholder="e.g. Vikramaditya"
                    className="w-full bg-theme-surface border border-theme-subtle rounded-xl px-3 py-2 text-xs text-theme-primary placeholder-theme-muted focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-theme-secondary mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={leadForm.email}
                    onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                    placeholder="client@domain.com"
                    className="w-full bg-theme-surface border border-theme-subtle rounded-xl px-3 py-2 text-xs text-theme-primary placeholder-theme-muted focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-theme-secondary mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={leadForm.phone}
                    onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                    placeholder="+91 98000 00000"
                    className="w-full bg-theme-surface border border-theme-subtle rounded-xl px-3 py-2 text-xs text-theme-primary placeholder-theme-muted focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-theme-secondary mb-1">Target Service</label>
                  <input
                    type="text"
                    value={leadForm.service}
                    onChange={(e) => setLeadForm({ ...leadForm, service: e.target.value })}
                    placeholder="Custom App / Hair Balayage"
                    className="w-full bg-theme-surface border border-theme-subtle rounded-xl px-3 py-2 text-xs text-theme-primary placeholder-theme-muted focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-theme-secondary mb-1">Initial Requirement Notes</label>
                <textarea
                  rows={2}
                  value={leadForm.notes}
                  onChange={(e) => setLeadForm({ ...leadForm, notes: e.target.value })}
                  placeholder="Key budget details, preferred timeline or channel..."
                  className="w-full bg-theme-surface border border-theme-subtle rounded-xl px-3 py-2 text-xs text-theme-primary placeholder-theme-muted focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-theme-muted hover:text-theme-primary rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
                >
                  {loading ? "Saving..." : "Create Lead"}
                </button>
              </div>
            </form>
          )}

          {tab === "appointment" && (
            <form onSubmit={handleCreateAppointment} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-theme-secondary mb-1">Customer Name *</label>
                  <input
                    type="text"
                    required
                    value={apptForm.customer_name}
                    onChange={(e) => setApptForm({ ...apptForm, customer_name: e.target.value })}
                    placeholder="Client Full Name"
                    className="w-full bg-theme-surface border border-theme-subtle rounded-xl px-3 py-2 text-xs text-theme-primary placeholder-theme-muted focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-theme-secondary mb-1">Customer Phone</label>
                  <input
                    type="tel"
                    value={apptForm.customer_phone}
                    onChange={(e) => setApptForm({ ...apptForm, customer_phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full bg-theme-surface border border-theme-subtle rounded-xl px-3 py-2 text-xs text-theme-primary placeholder-theme-muted focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-theme-secondary mb-1">Booking Date *</label>
                  <input
                    type="date"
                    required
                    value={apptForm.appointment_date}
                    onChange={(e) => setApptForm({ ...apptForm, appointment_date: e.target.value })}
                    className="w-full bg-theme-surface border border-theme-subtle rounded-xl px-3 py-2 text-xs text-theme-primary focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-theme-secondary mb-1">Slot Time *</label>
                  <input
                    type="time"
                    required
                    value={apptForm.appointment_time}
                    onChange={(e) => setApptForm({ ...apptForm, appointment_time: e.target.value })}
                    className="w-full bg-theme-surface border border-theme-subtle rounded-xl px-3 py-2 text-xs text-theme-primary focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-theme-muted hover:text-theme-primary rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 text-xs font-semibold bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-xl shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
                >
                  {loading ? "Confirming..." : "Confirm Slot"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
