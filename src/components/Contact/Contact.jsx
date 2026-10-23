import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { FiMail, FiClock, FiShield, FiSend, FiCheckCircle, FiAlertCircle, FiPhone } from "react-icons/fi";

const servicesList = [
  "Landing Page Development (from ₹1,499)",
  "Basic Business Website (from ₹2,999)",
  "Standard Business Website (from ₹4,999)",
  "Power BI Dashboard (from ₹1,999)",
  "Custom Web Application (from ₹7,999)",
  "General Consultation / Other",
];

const budgetRanges = [
  "Under ₹3,000",
  "₹3,000 - ₹5,000",
  "₹5,000 - ₹10,000",
  "₹10,000 - ₹25,000",
  "₹25,000+",
  "Flexible / Need Guidance",
];

const Contact = ({ preselectedService, initialTab = "quote" }) => {
  const shouldReduceMotion = useReducedMotion();
  const [activeTab, setActiveTab] = useState(initialTab); // 'quote' or 'contact'
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: preselectedService || servicesList[1],
    budget: budgetRanges[1],
    message: "",
  });

  // Safe React 19 prop-to-state sync without cascading useEffect warning
  const [lastPropService, setLastPropService] = useState(preselectedService);
  if (preselectedService && preselectedService !== lastPropService) {
    setLastPropService(preselectedService);
    // Find matching service option
    const matched = servicesList.find((s) => s.toLowerCase().includes(preselectedService.toLowerCase())) || preselectedService;
    setFormData((prev) => ({ ...prev, service: matched }));
    setActiveTab("quote");
  }

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submittedId, setSubmittedId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(null);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      newErrors.name = "Please enter your name (at least 2 characters).";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!formData.message.trim() || formData.message.trim().length < 5) {
      newErrors.message = "Please describe your project or requirements (at least 5 characters).";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
    if (serverError) {
      setServerError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }

    setLoading(true);
    setServerError(null);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const endpoint = activeTab === "quote" ? `${apiUrl}/api/quote` : `${apiUrl}/api/contact`;

      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: activeTab === "quote" ? formData.phone.trim() : null,
        service: activeTab === "quote" ? formData.service : null,
        budget: activeTab === "quote" ? formData.budget : null,
        message: formData.message.trim(),
        inquiry_type: activeTab,
      };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmitted(true);
        setSubmittedId(data.id || Math.floor(1000 + Math.random() * 9000));
        setFormData({
          name: "",
          email: "",
          phone: "",
          service: servicesList[1],
          budget: budgetRanges[1],
          message: "",
        });
      } else {
        setServerError(data.message || "Failed to submit your enquiry. Please try again.");
      }
    } catch (err) {
      console.error("Submission error:", err);
      // Avoid repeating phone number in error message to honor single-occurrence rule
      setServerError(
        "Unable to reach the server. Please check your internet connection or use the direct contact options shown below."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setSubmittedId(null);
    setServerError(null);
  };

  return (
    <section
      id="contact"
      className="scroll-mt-24 md:scroll-mt-28 relative py-24 bg-slate-950 overflow-hidden border-t border-slate-900"
    >
      {/* Background Lighting */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Section Heading */}
        <motion.div
          className="max-w-3xl mx-auto text-center"
          initial={{ opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.55 }}
        >
          <p className="text-blue-400 font-semibold uppercase tracking-[0.25em] text-xs">
            Start the Conversation
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mt-4 tracking-tight">
            Let's Discuss Your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              Next Project
            </span>
          </h2>
          <p className="text-slate-400 text-base md:text-lg mt-4 leading-relaxed max-w-2xl mx-auto">
            From business websites to data dashboards, we help companies build effective digital 
            experiences — wherever they are. Share your scope below for an itemized milestone quotation.
          </p>
        </motion.div>

        {/* Dedicated Full-Width Form Section (No side cards or clutter) */}
        <div
          id="contact-form"
          className="scroll-mt-24 md:scroll-mt-28 max-w-3xl mx-auto w-full mt-12"
        >
          <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-6 sm:p-9 md:p-11 shadow-2xl shadow-black/40 backdrop-blur-sm">
            {/* Tab Selector */}
            <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-xl mb-8">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("quote");
                  handleReset();
                }}
                className={`flex-1 py-3 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                  activeTab === "quote"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Request Project Quote
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("contact");
                  handleReset();
                }}
                className={`flex-1 py-3 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                  activeTab === "contact"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                General Inquiry
              </button>
            </div>

            {submitted ? (
              /* Success State */
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-400 mx-auto mb-5 text-3xl">
                  <FiCheckCircle />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  Inquiry Received Successfully!
                </h3>
                <p className="text-slate-300 text-sm max-w-md mx-auto mb-4 leading-relaxed">
                  Thank you, <span className="font-semibold text-white">{formData.name}</span>. Your 
                  {activeTab === "quote" ? " quote request" : " message"} has been logged in our database
                  (Reference ID: #{submittedId}).
                </p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mb-8 leading-relaxed">
                  Our engineering team reviews inquiries within 2 to 4 hours. We will follow up at{" "}
                  <span className="text-blue-400 font-mono">{formData.email}</span>.
                </p>

                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-6 py-3 rounded-xl transition-all cursor-pointer"
                >
                  Submit Another Request
                </button>
              </div>
            ) : (
              /* The Actual Clean Single-Column Form */
              <form onSubmit={handleSubmit} noValidate className="space-y-6">
                {serverError && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 text-xs text-red-300">
                    <FiAlertCircle className="text-base shrink-0 mt-0.5" />
                    <div>{serverError}</div>
                  </div>
                )}

                {/* Name Field (Full Width) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Your Name / Business Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Rahul Sharma / Acme Technologies"
                    className={`w-full bg-slate-950 border rounded-xl px-4 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 transition-colors ${
                      errors.name
                        ? "border-red-500/80 focus:ring-red-500"
                        : "border-slate-800 focus:border-blue-500 focus:ring-blue-500"
                    }`}
                  />
                  {errors.name && (
                    <p className="text-xs text-red-400 mt-1.5">{errors.name}</p>
                  )}
                </div>

                {/* Email & Phone Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Email Address <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@company.com"
                      className={`w-full bg-slate-950 border rounded-xl px-4 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 transition-colors ${
                        errors.email
                          ? "border-red-500/80 focus:ring-red-500"
                          : "border-slate-800 focus:border-blue-500 focus:ring-blue-500"
                      }`}
                    />
                    {errors.email && (
                      <p className="text-xs text-red-400 mt-1.5">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Phone Number {activeTab === "quote" && <span className="text-slate-500 font-normal">(Optional)</span>}
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Quote Specific Fields */}
                {activeTab === "quote" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                        Interested Package / Service
                      </label>
                      <select
                        name="service"
                        value={formData.service}
                        onChange={handleChange}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                      >
                        {servicesList.map((svc, sIdx) => (
                          <option key={sIdx} value={svc} className="bg-slate-950 text-white">
                            {svc}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                        Estimated Budget (INR)
                      </label>
                      <select
                        name="budget"
                        value={formData.budget}
                        onChange={handleChange}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                      >
                        {budgetRanges.map((b, bIdx) => (
                          <option key={bIdx} value={b} className="bg-slate-950 text-white">
                            {b}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* Message Field (Full Width) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Project Requirements & Details <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder={
                      activeTab === "quote"
                        ? "Describe your project goals, required pages, reference links, and target launch timeline..."
                        : "How can our engineering team assist your business?"
                    }
                    className={`w-full bg-slate-950 border rounded-xl px-4 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 transition-colors ${
                      errors.message
                        ? "border-red-500/80 focus:ring-red-500"
                        : "border-slate-800 focus:border-blue-500 focus:ring-blue-500"
                    }`}
                  />
                  {errors.message && (
                    <p className="text-xs text-red-400 mt-1.5">{errors.message}</p>
                  )}
                </div>

                {/* Submit Action */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:bg-blue-800 text-white font-semibold py-4 px-6 rounded-xl text-sm transition-all shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 cursor-pointer disabled:cursor-not-allowed uppercase tracking-wider"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        <span>Transmitting to Database...</span>
                      </>
                    ) : (
                      <>
                        <FiSend className="text-base" />
                        <span>
                          {activeTab === "quote"
                            ? "Send Request for Itemized Quote"
                            : "Submit General Inquiry"}
                        </span>
                      </>
                    )}
                  </button>
                  <p className="text-center text-[11px] text-slate-500 mt-3 flex items-center justify-center gap-1.5">
                    <FiShield className="text-blue-400" />
                    <span>Your requirements are protected under mutual confidentiality & NDA standards.</span>
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Contact Details ONLY at the Very End of the Website */}
        <div className="mt-20 pt-12 border-t border-slate-800/80 max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="text-xl font-bold text-white tracking-tight">
              Direct Contact & Verification
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              For urgent technical inquiries, RFP proposals, or direct communication
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Sole WhatsApp Display */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 hover:border-green-500/40 transition-colors flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400">
                    <FiPhone className="text-lg" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">WhatsApp & Phone</h4>
                    <p className="text-[11px] text-slate-400">Quickest Response</p>
                  </div>
                </div>
                <p className="text-slate-200 text-sm font-mono mt-3">
                  +91 9079368070
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-800">
                <a
                  href="https://wa.me/919079368070?text=Hello%20Zynthor%20IT!%20I%20want%20to%20discuss%20a%20project%20for%20my%20business."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-all shadow-md shadow-green-600/20"
                >
                  <FiPhone />
                  <span>Start WhatsApp Chat</span>
                </a>
              </div>
            </div>

            {/* Sole Email Display */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 hover:border-blue-500/40 transition-colors flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                    <FiMail className="text-lg" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Direct Email</h4>
                    <p className="text-[11px] text-slate-400">Proposals & RFP Documents</p>
                  </div>
                </div>
                <a
                  href="mailto:ac7364351@gmail.com"
                  className="text-blue-400 hover:text-blue-300 text-sm font-mono block mt-3 transition-colors"
                >
                  ac7364351@gmail.com
                </a>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-800">
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <FiClock className="text-blue-400" />
                  <span>Response SLA: Within 2 to 4 business hours</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;