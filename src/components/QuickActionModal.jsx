import { useState } from "react";
import { FiX, FiUserPlus, FiCalendar, FiPlusCircle, FiCheckCircle } from "react-icons/fi";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function QuickActionModal({ isOpen, onClose, onActionSuccess }) {
  const { business } = useAuth();
  const [tab, setTab] = useState("lead"); // 'lead' | 'appointment' | 'dish'
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
    if (!apptForm.customer_name || !apptForm.customer_phone) {
      setErrorMsg("Customer name and phone are required.");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    try {
      await api.createSalonAppointment(apptForm);
      setSuccessMsg("Appointment booked without conflict!");
      setTimeout(() => {
        setSuccessMsg("");
        onClose();
        if (onActionSuccess) onActionSuccess();
      }, 1000);
    } catch (err) {
      setErrorMsg(err.message || "Double-booking or validation error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div
        className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div>
            <h3 className="text-base font-semibold text-white">Quick Action Command</h3>
            <p className="text-xs text-slate-400">Instantly execute business operations</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
            <FiX className="text-lg" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950/30 px-6 pt-3 space-x-4">
          <button
            onClick={() => setTab("lead")}
            className={`pb-3 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors ${
              tab === "lead" ? "border-blue-500 text-blue-400" : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <FiUserPlus />
            <span>New Lead</span>
          </button>
          <button
            onClick={() => setTab("appointment")}
            className={`pb-3 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors ${
              tab === "appointment" ? "border-purple-500 text-purple-400" : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <FiCalendar />
            <span>Salon Booking</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center space-x-2">
              <FiCheckCircle className="text-base" />
              <span>{successMsg}</span>
            </div>
          )}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs">
              {errorMsg}
            </div>
          )}

          {tab === "lead" && (
            <form onSubmit={handleCreateLead} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Contact Name *</label>
                  <input
                    type="text"
                    required
                    value={leadForm.name}
                    onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                    placeholder="e.g. Vikramaditya"
                    className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={leadForm.email}
                    onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                    placeholder="client@domain.com"
                    className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={leadForm.phone}
                    onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                    placeholder="+91 98000 00000"
                    className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Target Service</label>
                  <input
                    type="text"
                    value={leadForm.service}
                    onChange={(e) => setLeadForm({ ...leadForm, service: e.target.value })}
                    placeholder="Custom App / Hair Balayage"
                    className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Initial Requirement Notes</label>
                <textarea
                  rows={2}
                  value={leadForm.notes}
                  onChange={(e) => setLeadForm({ ...leadForm, notes: e.target.value })}
                  placeholder="Key budget details, preferred timeline or channel..."
                  className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl shadow-lg shadow-blue-600/30 transition-all"
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
                  <label className="block text-xs font-medium text-slate-300 mb-1">Customer Name *</label>
                  <input
                    type="text"
                    required
                    value={apptForm.customer_name}
                    onChange={(e) => setApptForm({ ...apptForm, customer_name: e.target.value })}
                    placeholder="Ananya Singhania"
                    className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Phone *</label>
                  <input
                    type="tel"
                    required
                    value={apptForm.customer_phone}
                    onChange={(e) => setApptForm({ ...apptForm, customer_phone: e.target.value })}
                    placeholder="+91 99000 00000"
                    className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={apptForm.appointment_date}
                    onChange={(e) => setApptForm({ ...apptForm, appointment_date: e.target.value })}
                    className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Time Slot *</label>
                  <select
                    value={apptForm.appointment_time}
                    onChange={(e) => setApptForm({ ...apptForm, appointment_time: e.target.value })}
                    className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                  >
                    {["10:00", "11:30", "13:00", "14:30", "16:00", "17:30", "19:00"].map((t) => (
                      <option key={t} value={t} className="bg-slate-900 text-white">
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Special Treatment Notes</label>
                <input
                  type="text"
                  value={apptForm.notes}
                  onChange={(e) => setApptForm({ ...apptForm, notes: e.target.value })}
                  placeholder="Hair texture, preferred organic serum..."
                  className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 text-xs font-semibold bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-xl shadow-lg shadow-purple-600/30 transition-all"
                >
                  {loading ? "Checking..." : "Confirm Slot"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
