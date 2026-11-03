import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  FiScissors,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiArrowRight,
} from "react-icons/fi";
import { api } from "../../services/api";

export default function PublicSalonBooking() {
  const { slug } = useParams();
  const [business, setBusiness] = useState(null);
  const [_categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [_error, setError] = useState(null);

  // Booking Flow State
  const [selectedService, setSelectedService] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [appointmentDate, setAppointmentDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  });
  const [appointmentTime, setAppointmentTime] = useState("11:00");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [conflictError, setConflictError] = useState("");

  useEffect(() => {
    async function loadPublicData() {
      try {
        setLoading(true);
        const res = await api.getPublicSalon(slug || "luxe-aura");
        if (res.success) {
          setBusiness(res.business);
          setCategories(res.categories || []);
          setServices(res.services || []);
          setStaff(res.staff || []);
          if (res.services && res.services.length > 0) setSelectedService(res.services[0]);
          if (res.staff && res.staff.length > 0) setSelectedStaff(res.staff[0]);
        } else {
          setError(res.message || "Salon profile not found.");
        }
      } catch (err) {
        setError(err.message || "Failed to load booking schedule.");
      } finally {
        setLoading(false);
      }
    }
    loadPublicData();
  }, [slug]);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!selectedService || !selectedStaff || !customerName || !customerPhone) {
      setConflictError("Please complete all required fields.");
      return;
    }

    setSubmitting(true);
    setConflictError("");
    try {
      const res = await api.bookPublicSalon({
        slug: slug || "luxe-aura",
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        customer_email: customerEmail.trim(),
        service_id: selectedService.id,
        staff_id: selectedStaff.id,
        appointment_date: appointmentDate,
        appointment_time: appointmentTime,
        notes: notes.trim(),
      });

      if (res.success) {
        setBookingSuccess({
          id: res.id,
          service: selectedService.name,
          staff: selectedStaff.name,
          date: appointmentDate,
          time: appointmentTime,
          price: selectedService.price,
        });
      }
    } catch (err) {
      setConflictError(err.message || "This slot is already booked. Please choose another time.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-pink-600 selection:text-white font-sans pb-16">
      {/* Top Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl px-4 lg:px-8 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-600 to-purple-600 flex items-center justify-center shadow-lg shadow-pink-500/25">
              <FiScissors className="text-white text-lg" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white leading-tight">
                {business?.name || "Luxe Aura Hair & Wellness Studio"}
              </h1>
              <p className="text-xs text-pink-400 font-medium flex items-center space-x-2">
                <span>★ 4.9 (180+ Reviews)</span>
                <span>•</span>
                <span>Verified Salon & Spa</span>
              </p>
            </div>
          </div>
          <div className="text-xs text-slate-400 hidden sm:block text-right">
            <div className="text-slate-300 font-medium">{business?.phone || "+91 98765 43210"}</div>
            <div>{business?.address || "Horizon Pinnacle, Bandra West, Mumbai"}</div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 lg:px-8 pt-8">
        {bookingSuccess ? (
          <div className="max-w-lg mx-auto p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl text-center space-y-6 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center text-3xl">
              <FiCheckCircle />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Appointment Confirmed!</h2>
              <p className="text-xs text-slate-400 mt-1">
                Your reservation #{bookingSuccess.id} has been recorded into our live salon schedule.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left text-xs space-y-2.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Treatment:</span>
                <span className="font-semibold text-white">{bookingSuccess.service}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Specialist:</span>
                <span className="font-semibold text-pink-300">{bookingSuccess.staff}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Scheduled Time:</span>
                <span className="font-semibold text-white">
                  {bookingSuccess.date} at {bookingSuccess.time}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-800 font-bold">
                <span className="text-slate-400">Amount to Pay at Studio:</span>
                <span className="text-pink-400">₹{Number(bookingSuccess.price).toLocaleString("en-IN")}</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400">
              A confirmation message has been dispatched to {customerPhone}. We look forward to welcoming you!
            </p>

            <button
              onClick={() => {
                setBookingSuccess(null);
                setCustomerName("");
                setCustomerPhone("");
              }}
              className="px-6 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-semibold shadow-lg shadow-pink-600/30 transition-all"
            >
              Book Another Treatment
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Step 1 & 2: Select Service & Specialist */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <h2 className="text-lg font-bold text-white">1. Select Luxury Service</h2>
                <p className="text-xs text-slate-400">Choose from our couture hair, skin, and spa treatments</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                  {services.map((s) => {
                    const isSelected = selectedService?.id === s.id;
                    return (
                      <div
                        key={s.id}
                        onClick={() => setSelectedService(s)}
                        className={`p-3.5 rounded-2xl cursor-pointer border transition-all ${
                          isSelected
                            ? "bg-pink-950/30 border-pink-500/60 shadow-lg shadow-pink-950/40"
                            : "bg-slate-900/70 border-slate-800 hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <h3 className="font-bold text-xs text-white leading-snug">{s.name}</h3>
                          <span className="text-xs font-bold text-pink-400 ml-2 whitespace-nowrap">
                            ₹{Number(s.price).toLocaleString("en-IN")}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{s.description}</p>
                        <div className="flex items-center space-x-1 text-[10px] text-slate-400 mt-2">
                          <FiClock className="text-pink-400" />
                          <span>{s.duration_mins} mins</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h2 className="text-lg font-bold text-white">2. Select Your Specialist</h2>
                <p className="text-xs text-slate-400">Handled by certified master stylists and aestheticians</p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                  {staff.map((st) => {
                    const isSelected = selectedStaff?.id === st.id;
                    return (
                      <div
                        key={st.id}
                        onClick={() => setSelectedStaff(st)}
                        className={`p-3 rounded-2xl cursor-pointer border text-center transition-all ${
                          isSelected
                            ? "bg-purple-950/40 border-purple-500/60 shadow-lg shadow-purple-950/40"
                            : "bg-slate-900/70 border-slate-800 hover:border-slate-700"
                        }`}
                      >
                        <img
                          src={st.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80"}
                          alt={st.name}
                          className="w-14 h-14 rounded-full mx-auto object-cover border border-slate-700 shadow-md mb-2"
                        />
                        <h4 className="font-bold text-xs text-white">{st.name}</h4>
                        <p className="text-[10px] text-pink-300 font-medium truncate">{st.role}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Step 3: Date, Time & Contact Info */}
            <div className="lg:col-span-5">
              <div className="sticky top-24 p-6 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-2xl space-y-5">
                <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3">
                  3. Schedule & Details
                </h2>

                {conflictError && (
                  <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/50 text-red-300 text-xs flex items-start space-x-2">
                    <FiAlertCircle className="text-base flex-shrink-0 mt-0.5" />
                    <span>{conflictError}</span>
                  </div>
                )}

                <form onSubmit={handleBookingSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Date *</label>
                      <input
                        type="date"
                        required
                        value={appointmentDate}
                        onChange={(e) => setAppointmentDate(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Time Slot *</label>
                      <select
                        value={appointmentTime}
                        onChange={(e) => setAppointmentTime(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
                      >
                        {["10:00", "11:00", "12:30", "14:00", "15:30", "17:00", "18:30"].map((t) => (
                          <option key={t} value={t} className="bg-slate-900 text-white">
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Ananya Singhania"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Phone *</label>
                      <input
                        type="tel"
                        required
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="+91 98000 00000"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Email</label>
                      <input
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="client@mail.com"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Special Notes</label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Color tone preference, allergies..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
                    />
                  </div>

                  {/* Booking Summary Box */}
                  <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-300">
                      <span>Selected Service:</span>
                      <span className="font-semibold text-white">{selectedService?.name || "None"}</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Specialist:</span>
                      <span className="font-semibold text-pink-300">{selectedStaff?.name || "None"}</span>
                    </div>
                    <div className="flex justify-between text-slate-200 pt-2 border-t border-slate-800 font-bold">
                      <span>Total Price:</span>
                      <span className="text-pink-400">
                        ₹{Number(selectedService?.price || 0).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 rounded-xl bg-pink-600 hover:bg-pink-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-pink-600/30 flex items-center justify-center space-x-2 transition-all"
                  >
                    <span>{submitting ? "Verifying Availability..." : "Confirm My Reservation"}</span>
                    <FiArrowRight />
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
