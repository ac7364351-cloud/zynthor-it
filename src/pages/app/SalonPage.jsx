import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FiScissors,
  FiCalendar,
  FiUserCheck,
  FiAward,
  FiClock,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiCheckCircle,
  FiAlertCircle,
  FiExternalLink,
  FiX,
  FiPhone,
  FiMail,
} from "react-icons/fi";
import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function SalonPage() {
  const { business } = useAuth();
  const [activeTab, setActiveTab] = useState("services"); // 'services' | 'staff' | 'calendar' | 'packages'

  // Data states
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [staff, setStaff] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Category filter
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Modals
  const [addServiceModal, setAddServiceModal] = useState(false);
  const [addStaffModal, setAddStaffModal] = useState(false);
  const [addApptModal, setAddApptModal] = useState(false);
  const [conflictError, setConflictError] = useState("");
  const [successToast, setSuccessToast] = useState("");

  // New Service Form
  const [serviceForm, setServiceForm] = useState({
    name: "",
    category_id: "",
    description: "",
    duration_mins: 60,
    price: "",
    image_url: "",
  });

  // New Staff Form
  const [staffForm, setStaffForm] = useState({
    name: "",
    role: "",
    email: "",
    phone: "",
    avatar_url: "",
    working_days: "Mon,Tue,Wed,Thu,Fri,Sat",
    start_time: "09:30",
    end_time: "19:00",
  });

  // New Appointment Form
  const [apptForm, setApptForm] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    service_id: "",
    staff_id: "",
    appointment_date: new Date().toISOString().split("T")[0],
    appointment_time: "11:00",
    notes: "",
  });

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [srvRes, catRes, stfRes, aptRes, pkgRes] = await Promise.all([
        api.getSalonServices(),
        api.getSalonCategories(),
        api.getSalonStaff(),
        api.getSalonAppointments(),
        api.getSalonPackages(),
      ]);

      if (srvRes.success) setServices(srvRes.services || []);
      if (catRes.success) setCategories(catRes.categories || []);
      if (stfRes.success) setStaff(stfRes.staff || []);
      if (aptRes.success) setAppointments(aptRes.appointments || []);
      if (pkgRes.success) setPackages(pkgRes.packages || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [business?.id]);

  // Set defaults for appointment modal
  useEffect(() => {
    if (services.length > 0 && !apptForm.service_id) {
      setApptForm((prev) => ({ ...prev, service_id: services[0].id }));
    }
    if (staff.length > 0 && !apptForm.staff_id) {
      setApptForm((prev) => ({ ...prev, staff_id: staff[0].id }));
    }
  }, [services, staff]);

  // Handlers
  const handleCreateService = async (e) => {
    e.preventDefault();
    try {
      await api.createSalonService(serviceForm);
      setAddServiceModal(false);
      setServiceForm({ name: "", category_id: "", description: "", duration_mins: 60, price: "", image_url: "" });
      setSuccessToast("Service successfully added to catalogue!");
      setTimeout(() => setSuccessToast(""), 3000);
      loadAllData();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm("Remove service from catalogue?")) return;
    try {
      await api.deleteSalonService(id);
      setServices((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    try {
      await api.createSalonStaff(staffForm);
      setAddStaffModal(false);
      setStaffForm({ name: "", role: "", email: "", phone: "", avatar_url: "", working_days: "Mon,Tue,Wed,Thu,Fri,Sat", start_time: "09:30", end_time: "19:00" });
      setSuccessToast("Staff member registered!");
      setTimeout(() => setSuccessToast(""), 3000);
      loadAllData();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleCreateAppointment = async (e) => {
    e.preventDefault();
    setConflictError("");
    try {
      await api.createSalonAppointment(apptForm);
      setAddApptModal(false);
      setApptForm({
        customer_name: "",
        customer_email: "",
        customer_phone: "",
        service_id: services[0]?.id || "",
        staff_id: staff[0]?.id || "",
        appointment_date: new Date().toISOString().split("T")[0],
        appointment_time: "11:00",
        notes: "",
      });
      setSuccessToast("Appointment confirmed without double-booking conflict!");
      setTimeout(() => setSuccessToast(""), 3000);
      loadAllData();
    } catch (err) {
      setConflictError(err.message || "Double-booking detected or slot unavailable.");
    }
  };

  const handleUpdateApptStatus = async (id, status) => {
    try {
      await api.updateSalonAppointment(id, { status });
      setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const filteredServices = selectedCategory === "all"
    ? services
    : services.filter((s) => String(s.category_id) === String(selectedCategory));

  return (
    <div className="max-w-7xl mx-auto space-y-6 w-full overflow-hidden">
      {/* Top Banner & Module Heading (Fixed width & clean typography) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
              <FiScissors className="text-pink-400" />
              <span>Salon & Spa Operations Suite</span>
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-pink-950/80 border border-pink-500/40 text-pink-300">
              Luxe Edition
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Complete scheduling, service catalogue, staff availability, and conflict-free booking for {business?.name || "Luxe Aura"}.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to={`/book/${business?.slug || "luxe-aura"}`}
            target="_blank"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-colors shadow-sm"
          >
            <span>Public Booking Portal</span>
            <FiExternalLink className="text-xs" />
          </Link>
          <button
            onClick={() => setAddApptModal(true)}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/30 transition-all"
          >
            <FiCalendar className="text-sm" />
            <span>Book Appointment</span>
          </button>
        </div>
      </div>

      {successToast && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs flex items-center space-x-2 animate-in fade-in">
          <FiCheckCircle className="text-base flex-shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800/80 pb-2 overflow-x-auto">
        {[
          { id: "services", label: "Service Catalogue", count: services.length, icon: FiScissors },
          { id: "staff", label: "Staff & Availability", count: staff.length, icon: FiUserCheck },
          { id: "calendar", label: "Appointments Queue", count: appointments.length, icon: FiCalendar },
          { id: "packages", label: "Packages & Memberships", count: packages.length, icon: FiAward },
        ].map((t) => {
          const Icon = t.icon;
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                active
                  ? "bg-slate-900 text-white border border-slate-700 shadow-md"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border border-transparent"
              }`}
            >
              <Icon className={active ? "text-pink-400" : "text-slate-400"} />
              <span>{t.label}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                {t.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: SERVICE CATALOGUE */}
      {activeTab === "services" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            {/* Category Filter Pills */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                  selectedCategory === "all"
                    ? "bg-pink-600 text-white shadow-md shadow-pink-600/30"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                All Services
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                    String(selectedCategory) === String(c.id)
                      ? "bg-pink-600 text-white shadow-md shadow-pink-600/30"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>

            <button
              onClick={() => setAddServiceModal(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-200 transition-colors self-start sm:self-auto"
            >
              <FiPlus />
              <span>Add Service</span>
            </button>
          </div>

          {/* Service Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredServices.map((srv) => (
              <div
                key={srv.id}
                className="rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl overflow-hidden shadow-xl shadow-black/20 flex flex-col justify-between hover:border-slate-700 transition-all group"
              >
                {/* Image */}
                <div className="relative h-44 w-full bg-slate-950 overflow-hidden">
                  <img
                    src={srv.image_url || "https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=600&q=80"}
                    alt={srv.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = "https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=600&q=80";
                    }}
                  />
                  <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/10 text-xs font-bold text-pink-300">
                    ₹{Number(srv.price).toLocaleString("en-IN")}
                  </div>
                  {srv.category_name && (
                    <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-md border border-white/10 text-[10px] font-semibold text-slate-300 uppercase tracking-wider">
                      {srv.category_name}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-bold text-sm text-white">{srv.name}</h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {srv.description || "Signature wellness & styling treatment."}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-800/80 text-slate-400">
                    <span className="flex items-center space-x-1">
                      <FiClock className="text-pink-400" />
                      <span>{srv.duration_mins || 60} mins</span>
                    </span>
                    <button
                      onClick={() => handleDeleteService(srv.id)}
                      className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800 transition-colors"
                      title="Delete Service"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: STAFF & AVAILABILITY */}
      {activeTab === "staff" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">
              Manage specialists, operating schedules, and assigned shift hours.
            </p>
            <button
              onClick={() => setAddStaffModal(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-200"
            >
              <FiPlus />
              <span>Add Staff Profile</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {staff.map((st) => (
              <div
                key={st.id}
                className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl shadow-xl shadow-black/20 flex flex-col justify-between hover:border-slate-700 transition-all space-y-4"
              >
                <div className="flex items-start space-x-3.5">
                  <img
                    src={st.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80"}
                    alt={st.name}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-700 shadow-md"
                    onError={(e) => {
                      e.target.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80";
                    }}
                  />
                  <div>
                    <h3 className="font-bold text-sm text-white">{st.name}</h3>
                    <p className="text-xs text-pink-400 font-medium">{st.role}</p>
                    <div className="text-[11px] text-slate-400 flex items-center space-x-2 mt-1">
                      {st.phone && <span>{st.phone}</span>}
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Active Roster</span>
                    <span className="text-[11px] font-mono text-emerald-400">Available</span>
                  </div>
                  <div className="text-[11px] text-slate-300">{st.working_days}</div>
                  <div className="text-[11px] text-slate-400 flex items-center space-x-1">
                    <FiClock className="text-slate-500" />
                    <span>{st.start_time} — {st.end_time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: APPOINTMENTS QUEUE */}
      {activeTab === "calendar" && (
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl shadow-xl shadow-black/20">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
            <div>
              <h2 className="text-base font-semibold text-white">Confirmed Booking Queue</h2>
              <p className="text-xs text-slate-400">Double-booking protection active on all specialist schedules</p>
            </div>
            <button
              onClick={() => setAddApptModal(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-600/30"
            >
              <FiPlus />
              <span>Create Booking</span>
            </button>
          </div>

          <div className="overflow-x-auto mt-4">
            {appointments.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">No scheduled appointments.</div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-800/80">
                    <th className="pb-3 font-semibold">Client Name</th>
                    <th className="pb-3 font-semibold">Service</th>
                    <th className="pb-3 font-semibold">Assigned Specialist</th>
                    <th className="pb-3 font-semibold">Date & Time</th>
                    <th className="pb-3 font-semibold">Price</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {appointments.map((a) => {
                    const statusColors = {
                      confirmed: "bg-emerald-950/80 text-emerald-400 border-emerald-800/60",
                      pending: "bg-amber-950/80 text-amber-400 border-amber-800/60",
                      completed: "bg-blue-950/80 text-blue-400 border-blue-800/60",
                      cancelled: "bg-red-950/80 text-red-400 border-red-800/60",
                    };
                    return (
                      <tr key={a.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 pr-3">
                          <div className="font-semibold text-white">{a.customer_name}</div>
                          <div className="text-[11px] text-slate-400">{a.customer_phone}</div>
                        </td>
                        <td className="py-3.5 pr-3 font-medium text-slate-200">
                          {a.service_name}
                        </td>
                        <td className="py-3.5 pr-3">
                          <span className="text-pink-300 font-medium">{a.staff_name}</span>
                        </td>
                        <td className="py-3.5 pr-3">
                          <div className="text-white font-semibold">{a.appointment_time}</div>
                          <div className="text-[10px] text-slate-400">{a.appointment_date}</div>
                        </td>
                        <td className="py-3.5 pr-3 font-bold text-white">
                          ₹{Number(a.total_price || 0).toLocaleString("en-IN")}
                        </td>
                        <td className="py-3.5 pr-3">
                          <select
                            value={a.status}
                            onChange={(e) => handleUpdateApptStatus(a.id, e.target.value)}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border bg-transparent focus:outline-none cursor-pointer ${
                              statusColors[a.status] || statusColors.pending
                            }`}
                          >
                            <option value="confirmed" className="bg-slate-900 text-white">CONFIRMED</option>
                            <option value="pending" className="bg-slate-900 text-white">PENDING</option>
                            <option value="completed" className="bg-slate-900 text-white">COMPLETED</option>
                            <option value="cancelled" className="bg-slate-900 text-white">CANCELLED</option>
                          </select>
                        </td>
                        <td className="py-3.5 text-right">
                          <button
                            onClick={async () => {
                              if (window.confirm("Remove booking?")) {
                                await api.deleteSalonAppointment(a.id);
                                setAppointments((prev) => prev.filter((it) => it.id !== a.id));
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800"
                          >
                            <FiTrash2 />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: PACKAGES */}
      {activeTab === "packages" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl shadow-xl shadow-black/20 space-y-4 hover:border-slate-700 transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-base text-white">{pkg.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">{pkg.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-pink-400">
                    ₹{Number(pkg.price).toLocaleString("en-IN")}
                  </div>
                  <div className="text-[10px] text-slate-400">{pkg.validity_days} days validity</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 text-xs">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                  Services Included:
                </span>
                <span className="text-slate-200">{pkg.services_included}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: ADD APPOINTMENT (with Double-Booking Prevention) */}
      {addApptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Schedule Salon Appointment</h3>
              <button onClick={() => setAddApptModal(false)} className="text-slate-400 hover:text-white">
                <FiX />
              </button>
            </div>

            {conflictError && (
              <div className="p-3 rounded-xl bg-red-950/70 border border-red-500/50 text-red-300 text-xs flex items-start space-x-2">
                <FiAlertCircle className="text-base flex-shrink-0 mt-0.5" />
                <span>{conflictError}</span>
              </div>
            )}

            <form onSubmit={handleCreateAppointment} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Customer Name *</label>
                <input
                  type="text"
                  required
                  value={apptForm.customer_name}
                  onChange={(e) => setApptForm({ ...apptForm, customer_name: e.target.value })}
                  placeholder="e.g. Ananya Singhania"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Phone *</label>
                  <input
                    type="tel"
                    required
                    value={apptForm.customer_phone}
                    onChange={(e) => setApptForm({ ...apptForm, customer_phone: e.target.value })}
                    placeholder="+91 99000 00000"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={apptForm.customer_email}
                    onChange={(e) => setApptForm({ ...apptForm, customer_email: e.target.value })}
                    placeholder="client@mail.com"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Select Service *</label>
                  <select
                    value={apptForm.service_id}
                    onChange={(e) => setApptForm({ ...apptForm, service_id: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    {services.map((s) => (
                      <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                        {s.name} (₹{s.price})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Select Specialist *</label>
                  <select
                    value={apptForm.staff_id}
                    onChange={(e) => setApptForm({ ...apptForm, staff_id: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    {staff.map((st) => (
                      <option key={st.id} value={st.id} className="bg-slate-900 text-white">
                        {st.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={apptForm.appointment_date}
                    onChange={(e) => setApptForm({ ...apptForm, appointment_date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Time Slot *</label>
                  <select
                    value={apptForm.appointment_time}
                    onChange={(e) => setApptForm({ ...apptForm, appointment_time: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    {["10:00", "11:00", "12:30", "14:00", "15:30", "17:00", "18:30"].map((t) => (
                      <option key={t} value={t} className="bg-slate-900 text-white">
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAddApptModal(false)}
                  className="px-4 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white rounded-xl shadow-md shadow-purple-600/30"
                >
                  Confirm & Reserve
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD SERVICE */}
      {addServiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Add Treatment Service</h3>
              <button onClick={() => setAddServiceModal(false)} className="text-slate-400 hover:text-white">
                <FiX />
              </button>
            </div>
            <form onSubmit={handleCreateService} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Service Title *</label>
                <input
                  type="text"
                  required
                  value={serviceForm.name}
                  onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                  placeholder="e.g. Moroccan Oil Silk Spa"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={serviceForm.price}
                    onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })}
                    placeholder="3500"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Duration (Mins)</label>
                  <input
                    type="number"
                    value={serviceForm.duration_mins}
                    onChange={(e) => setServiceForm({ ...serviceForm, duration_mins: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Image URL</label>
                <input
                  type="url"
                  value={serviceForm.image_url}
                  onChange={(e) => setServiceForm({ ...serviceForm, image_url: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                  placeholder="Treatment benefits and experience..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAddServiceModal(false)}
                  className="px-4 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-pink-600 hover:bg-pink-500 text-white rounded-xl shadow-md shadow-pink-600/30"
                >
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD STAFF */}
      {addStaffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Register Specialist Staff</h3>
              <button onClick={() => setAddStaffModal(false)} className="text-slate-400 hover:text-white">
                <FiX />
              </button>
            </div>
            <form onSubmit={handleCreateStaff} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={staffForm.name}
                  onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                  placeholder="e.g. Priya Sharma"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Role / Designation *</label>
                <input
                  type="text"
                  required
                  value={staffForm.role}
                  onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })}
                  placeholder="Lead Aesthetician"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={staffForm.phone}
                    onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                    placeholder="+91 98000 00000"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={staffForm.email}
                    onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                    placeholder="priya@luxeaura.com"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAddStaffModal(false)}
                  className="px-4 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-pink-600 hover:bg-pink-500 text-white rounded-xl shadow-md shadow-pink-600/30"
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
