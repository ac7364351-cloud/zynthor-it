import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  FiChevronRight,
  FiCheckCircle,
  FiCalendar,
  FiClock,
  FiShield,
  FiCheck,
  FiArrowRight,
  FiSend,
  FiAlertTriangle,
} from "react-icons/fi";
import { api } from "../services/api";

const BookDemoPage = () => {
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Book a Live Product Demo — Zynthor Business OS | Zynthor IT";
  }, []);

  const [formData, setFormData] = useState({
    business_name: "",
    owner_name: "",
    email: "",
    phone: "",
    business_category: "Cafe, Bistro & Dining",
    interested_plan: "Growth (₹1,499/mo)",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successData, setSuccessData] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    // Validate phone number format (at least 10 digits)
    const cleanPhone = formData.phone.replace(/[^0-9+]/g, "");
    if (cleanPhone.length < 10) {
      setErrorMsg("Please enter a valid phone number (at least 10 digits).");
      return;
    }

    setLoading(true);

    try {
      const res = await api.bookDemo(formData);
      if (res.success) {
        setSuccessData({
          business_name: formData.business_name,
          owner_name: formData.owner_name,
          email: formData.email,
          message: res.message,
        });
      } else {
        setErrorMsg(res.message || "Failed to submit demo booking request.");
      }
    } catch (err) {
      setErrorMsg(err.message || "Failed to submit demo request. Please check your network connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 text-slate-100 bg-slate-950 min-h-screen">
      {/* Header */}
      <section className="relative py-16 bg-slate-950 border-b border-slate-900 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-r from-blue-600/15 via-indigo-600/10 to-amber-500/10 blur-[130px] rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <nav className="flex items-center gap-2 text-xs text-slate-400 mb-4 font-medium">
            <Link to="/" className="hover:text-blue-400 transition-colors">
              Home
            </Link>
            <FiChevronRight className="text-slate-600 text-xs" />
            <Link to="/products/business-os" className="hover:text-blue-400 transition-colors">
              Zynthor Business OS
            </Link>
            <FiChevronRight className="text-slate-600 text-xs" />
            <span className="text-blue-400 font-semibold">Book a Demo</span>
          </nav>

          <motion.div
            className="max-w-3xl space-y-3"
            initial={{ opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.5 }}
          >
            <span className="text-blue-400 font-semibold uppercase tracking-[0.25em] text-xs">
              Live Interactive Walkthrough
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
              Experience Zynthor Business OS in Action
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Schedule a personalized 20-minute live demonstration. Our solutions team will walk you through
              inbound CRM workflows, QR dining menus, salon calendars, and automated GST billing tailored to your vertical.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="py-16 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: What to Expect & Value Props */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6 shadow-xl">
              <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <FiCalendar className="text-blue-400 text-xl" />
                <span>What Happens During Your Walkthrough?</span>
              </h2>

              <div className="space-y-4 text-xs text-slate-300">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-blue-950 border border-blue-800/60 text-blue-400 shrink-0 mt-0.5">
                    <FiClock />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">20-Minute Focused Session</h3>
                    <p className="text-slate-400 mt-0.5 leading-relaxed">
                      No generic slides. We dive straight into a live, interactive environment populated with your industry vertical data.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-amber-950 border border-amber-800/60 text-amber-400 shrink-0 mt-0.5">
                    <FiCheckCircle />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">Custom Operational Review</h3>
                    <p className="text-slate-400 mt-0.5 leading-relaxed">
                      We assess your current booking bottlenecks, staff scheduling overlaps, or manual billing friction.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-emerald-950 border border-emerald-800/60 text-emerald-400 shrink-0 mt-0.5">
                    <FiShield />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">Zero Obligation & Zero Spam</h3>
                    <p className="text-slate-400 mt-0.5 leading-relaxed">
                      Your contact information is strictly used to coordinate your walkthrough. We never sell or share commercial data.
                    </p>
                  </div>
                </div>
              </div>

              {/* Guarantees Box */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2 text-[11px] text-slate-400 font-medium">
                <div className="flex items-center gap-2 text-slate-300">
                  <FiCheck className="text-emerald-400" />
                  <span>Direct conversation with a Senior Solutions Engineer</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <FiCheck className="text-emerald-400" />
                  <span>14-day evaluation sandbox access after the demo</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <FiCheck className="text-emerald-400" />
                  <span>Custom migration plan for existing customer & menu records</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Demo Booking Form */}
          <div className="lg:col-span-7">
            <div className="p-8 sm:p-10 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl relative">
              {successData ? (
                <div className="py-12 text-center space-y-4 animate-in fade-in zoom-in-95">
                  <div className="w-16 h-16 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 mx-auto flex items-center justify-center text-3xl shadow-xl shadow-emerald-950/50">
                    <FiCheckCircle />
                  </div>

                  <h3 className="text-2xl font-extrabold text-white">Walkthrough Scheduled!</h3>

                  <p className="text-slate-300 text-sm max-w-md mx-auto leading-relaxed">
                    Thank you, <strong>{successData.owner_name}</strong>. We have received your demo request for{" "}
                    <strong>{successData.business_name}</strong>.
                  </p>

                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400 max-w-sm mx-auto space-y-1">
                    <div>Confirmation sent to: <span className="text-white font-mono">{successData.email}</span></div>
                    <div>Estimated response: <span className="text-emerald-400 font-bold">Within 24 Hours</span></div>
                  </div>

                  <div className="pt-4 flex justify-center gap-4">
                    <button
                      onClick={() => setSuccessData(null)}
                      className="text-xs text-blue-400 hover:underline cursor-pointer"
                    >
                      Book another walkthrough
                    </button>
                    <Link
                      to="/"
                      className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
                    >
                      Return to Homepage
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <h2 className="text-xl font-bold text-white">Request Your Live Walkthrough</h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Fill out your establishment details below and our team will get in touch with you.
                    </p>
                  </div>

                  {errorMsg && (
                    <div className="p-3.5 rounded-xl bg-red-950/50 border border-red-500/50 text-red-300 text-xs flex items-center gap-2">
                      <FiAlertTriangle className="text-base shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300 block">
                        Establishment / Business Name *
                      </label>
                      <input
                        type="text"
                        name="business_name"
                        required
                        value={formData.business_name}
                        onChange={handleChange}
                        placeholder="e.g. Velvet & Vine Cafe"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300 block">
                        Your Full Name (Owner / Leader) *
                      </label>
                      <input
                        type="text"
                        name="owner_name"
                        required
                        value={formData.owner_name}
                        onChange={handleChange}
                        placeholder="e.g. Rohan Verma"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300 block">
                        Business Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="rohan@establishment.com"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300 block">
                        Contact Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+91 98000 00000"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300 block">
                        Industry / Business Category *
                      </label>
                      <select
                        name="business_category"
                        value={formData.business_category}
                        onChange={handleChange}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                      >
                        <option value="Cafe, Bistro & Dining">Cafe, Bistro & Dining</option>
                        <option value="Salon, Spa & Wellness">Salon, Spa & Wellness</option>
                        <option value="Digital Agency & Consultancy">Digital Agency & Consultancy</option>
                        <option value="Home Services & Field Operations">Home Services & Field Operations</option>
                        <option value="Coaching & Education Institute">Coaching & Education Institute</option>
                        <option value="Retail & Local Commerce">Retail & Local Commerce</option>
                        <option value="Other Service Enterprise">Other Service Enterprise</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300 block">
                        Interested Plan Tier
                      </label>
                      <select
                        name="interested_plan"
                        value={formData.interested_plan}
                        onChange={handleChange}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                      >
                        <option value="Starter (₹799/mo)">Starter Essential — ₹799/month</option>
                        <option value="Growth (₹1,499/mo)">Growth Professional — ₹1,499/month (Recommended)</option>
                        <option value="Pro (₹2,999/mo)">Pro Advanced — ₹2,999/month</option>
                        <option value="Enterprise Custom">Enterprise — Custom Quote</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 block">
                      Operational Goals & Notes (Optional)
                    </label>
                    <textarea
                      name="message"
                      rows={3}
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us about your current challenges (e.g., 'Looking to replace paper registers with QR menus and automate client appointments')..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 leading-relaxed"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Scheduling Your Walkthrough...</span>
                      </>
                    ) : (
                      <>
                        <FiSend />
                        <span>Schedule Free Live Walkthrough</span>
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-center text-slate-500">
                    By submitting, you agree to receive a walkthrough invitation from Zynthor IT. No spam, ever.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BookDemoPage;
