import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  FiChevronRight,
  FiCheckCircle,
  FiArrowRight,
  FiUsers,
  FiCoffee,
  FiScissors,
  FiFileText,
  FiTrendingUp,
  FiCpu,
  FiShield,
  FiLayers,
  FiZap,
  FiCalendar,
  FiSmartphone,
  FiCheck,
} from "react-icons/fi";

const ProductBusinessOSPage = () => {
  const shouldReduceMotion = useReducedMotion();
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Zynthor Business OS — All-in-One Business Operating System | Zynthor IT";
  }, []);

  const screenshotTabs = [
    {
      id: "dashboard",
      label: "Executive Dashboard",
      img: "/images/screenshots/02-dashboard-dark.png",
      caption: "Real-time multi-tenant telemetry, gross verified revenue, active leads, and vertical status.",
    },
    {
      id: "leads",
      label: "Inbound CRM Leads",
      img: "/images/screenshots/12-leads-dark.png",
      caption: "Lead pipeline tracking, status progression, staff assignment, and scheduled follow-up dates.",
    },
    {
      id: "salon",
      label: "Salon & Spa Suite",
      img: "/images/screenshots/08-salon-dark.png",
      caption: "Specialist services, pricing, and double-booking collision prevention calendar.",
    },
    {
      id: "cafe",
      label: "Cafe QR Menu & KDS",
      img: "/images/screenshots/09-cafe-dark.png",
      caption: "Contactless QR menu catalogue, dietary tags, table orders, and live Kitchen Order Tickets (KOT).",
    },
    {
      id: "customers",
      label: "Customer Directory",
      img: "/images/screenshots/11-customers-dark.png",
      caption: "Customer relationship history, lifetime spend, order records, and privacy-isolated profiles.",
    },
    {
      id: "reports",
      label: "Financial Analytics",
      img: "/images/screenshots/13-reports-dark.png",
      caption: "Real database revenue calculation, conversion efficiency rates, and accounting CSV exports.",
    },
  ];

  const currentScreenshot = screenshotTabs.find((t) => t.id === activeTab) || screenshotTabs[0];

  return (
    <div className="pt-24 text-slate-100 bg-slate-950">
      {/* Hero Header */}
      <section className="relative py-20 bg-slate-950 border-b border-slate-900 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-r from-blue-600/15 via-indigo-600/15 to-amber-500/10 blur-[130px] rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6 font-medium">
            <Link to="/website" className="hover:text-blue-400 transition-colors">
              Home
            </Link>
            <FiChevronRight className="text-slate-600 text-xs" />
            <span className="text-slate-300">Products</span>
            <FiChevronRight className="text-slate-600 text-xs" />
            <span className="text-blue-400 font-semibold">Zynthor Business OS</span>
          </nav>

          <motion.div
            className="max-w-3xl space-y-5"
            initial={{ opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.55 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-950/80 border border-blue-500/40 text-blue-300 text-xs font-semibold uppercase tracking-wider">
              <FiLayers className="text-amber-400" />
              <span>Flagship SaaS Software</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-tight">
              Zynthor Business OS — The All-in-One Operating System for{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-amber-300">
                Modern Businesses
              </span>
            </h1>

            <p className="text-slate-300 text-base md:text-lg leading-relaxed">
              An enterprise-grade, multi-tenant SaaS platform built to power salons, bistros, agencies, consultancies,
              and local service enterprises. Unify customer acquisition, online bookings, dining menus, automated GST
              billing, and team workflows in one secure, high-contrast cloud workspace.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/website/book-demo"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-sm font-semibold shadow-xl shadow-blue-600/30 transition-all cursor-pointer"
              >
                <span>Book a Guided Walkthrough</span>
                <FiArrowRight />
              </Link>
              <Link
                to="/website/pricing"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-sm font-semibold transition-all hover:border-blue-500 cursor-pointer"
              >
                <span>View Pricing (From ₹799/mo)</span>
              </Link>
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-900/60 hover:bg-slate-900 text-blue-400 border border-blue-500/30 text-sm font-bold transition-all"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Launch Live System</span>
              </Link>
            </div>

            {/* Quick Proof Pills */}
            <div className="flex flex-wrap items-center gap-5 pt-4 text-xs text-slate-400 font-medium">
              <span className="flex items-center gap-1.5">
                <FiCheckCircle className="text-emerald-400" />
                100% Real Database Grounded
              </span>
              <span className="flex items-center gap-1.5">
                <FiCheckCircle className="text-blue-400" />
                Multi-Tenant Partitioned
              </span>
              <span className="flex items-center gap-1.5">
                <FiCheckCircle className="text-amber-400" />
                Bilingual AI (English / Hindi / Hinglish)
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Interactive Screenshot Showcase Gallery */}
      <section className="py-20 bg-slate-950 border-b border-slate-900 relative">
        <div className="max-w-7xl mx-auto px-6 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
              Live Software Interface
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Inspected, Verified & Production-Ready
            </h2>
            <p className="text-xs text-slate-400">
              Explore actual high-resolution interface captures from the running Zynthor Business OS environment.
            </p>
          </div>

          {/* Gallery Navigation Tabs */}
          <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 flex-wrap">
            {screenshotTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                    : "bg-slate-900 text-slate-300 hover:text-white border border-slate-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Active Screenshot Display */}
          <div className="p-3 sm:p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-xl space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 px-2">
              <span className="font-semibold text-slate-200">{currentScreenshot.label}</span>
              <span className="text-[11px] text-slate-400 font-mono">{currentScreenshot.caption}</span>
            </div>
            <div className="rounded-2xl overflow-hidden border border-slate-800 shadow-inner bg-slate-950">
              <img
                src={currentScreenshot.img}
                alt={currentScreenshot.label}
                className="w-full h-auto object-cover max-h-[650px]"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Deep-Dive Module Sections */}
      <section className="py-24 bg-slate-950 border-b border-slate-900 space-y-24">
        {/* Module 1: CRM & Inbound Leads */}
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-5">
            <div className="p-3 rounded-2xl bg-blue-950/60 border border-blue-500/40 text-blue-400 w-fit">
              <FiUsers className="text-2xl" />
            </div>
            <h3 className="text-3xl font-extrabold text-white">
              Inbound CRM Pipeline & Automatic Customer Onboarding
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Capture prospective inquiries automatically from your website, social campaigns, and offline visits.
              Filter by qualification stages (<code>New</code>, <code>Contacted</code>, <code>Qualified</code>,{" "}
              <code>Converted</code>, <code>Lost</code>), allocate staff members, and set follow-up reminders.
            </p>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <FiCheck className="text-emerald-400 mt-0.5 shrink-0" />
                <span>Automatic customer profile provisioning upon lead conversion</span>
              </li>
              <li className="flex items-start gap-2">
                <FiCheck className="text-emerald-400 mt-0.5 shrink-0" />
                <span>Follow-up schedule dates with proactive notification badges</span>
              </li>
              <li className="flex items-start gap-2">
                <FiCheck className="text-emerald-400 mt-0.5 shrink-0" />
                <span>One-click CSV accounting export for external sales auditing</span>
              </li>
            </ul>
          </div>
          <div className="rounded-2xl overflow-hidden border border-slate-800 shadow-xl bg-slate-900 p-2">
            <img
              src="/images/screenshots/12-leads-dark.png"
              alt="Inbound CRM Leads Management"
              className="w-full h-auto rounded-xl object-cover"
            />
          </div>
        </div>

        {/* Module 2: Cafe & Restaurant Dining */}
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center lg:flex-row-reverse">
          <div className="rounded-2xl overflow-hidden border border-slate-800 shadow-xl bg-slate-900 p-2 lg:order-2">
            <img
              src="/images/screenshots/09-cafe-dark.png"
              alt="Cafe Digital QR Menu & KDS"
              className="w-full h-auto rounded-xl object-cover"
            />
          </div>
          <div className="space-y-5 lg:order-1">
            <div className="p-3 rounded-2xl bg-amber-950/60 border border-amber-500/40 text-amber-400 w-fit">
              <FiCoffee className="text-2xl" />
            </div>
            <h3 className="text-3xl font-extrabold text-white">
              Contactless QR Dining Menus & Kitchen Display System (KDS)
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Equip every table with an instant QR code allowing patrons to browse categorized menus with dietary tags,
              pricing, and chef recommendations on their smartphones without downloading an app.
            </p>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <FiCheck className="text-amber-400 mt-0.5 shrink-0" />
                <span>Live Kitchen Display System (KDS) tracking Pending ➔ Preparing ➔ Ready ➔ Served</span>
              </li>
              <li className="flex items-start gap-2">
                <FiCheck className="text-amber-400 mt-0.5 shrink-0" />
                <span>Veg, Non-Veg, and Vegan dietary badges with real-time stock availability</span>
              </li>
              <li className="flex items-start gap-2">
                <FiCheck className="text-amber-400 mt-0.5 shrink-0" />
                <span>Direct table reservation scheduler preventing double-booking during peak hours</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Module 3: Salon & Wellness Suite */}
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-5">
            <div className="p-3 rounded-2xl bg-pink-950/60 border border-pink-500/40 text-pink-400 w-fit">
              <FiScissors className="text-2xl" />
            </div>
            <h3 className="text-3xl font-extrabold text-white">
              Salon, Spa & Appointment Scheduling Engine
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Empower your luxury salon or wellness studio with a customer booking portal that dynamically matches client
              requests with specialist stylists while preventing booking overlap.
            </p>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <FiCheck className="text-pink-400 mt-0.5 shrink-0" />
                <span>Algorithmic conflict prevention: Zero overlapping client time slots</span>
              </li>
              <li className="flex items-start gap-2">
                <FiCheck className="text-pink-400 mt-0.5 shrink-0" />
                <span>Staff specialist allocation, service duration buffers, and transparent pricing</span>
              </li>
              <li className="flex items-start gap-2">
                <FiCheck className="text-pink-400 mt-0.5 shrink-0" />
                <span>Instant client booking link at <code>/book/:slug</code> branded to your establishment</span>
              </li>
            </ul>
          </div>
          <div className="rounded-2xl overflow-hidden border border-slate-800 shadow-xl bg-slate-900 p-2">
            <img
              src="/images/screenshots/08-salon-dark.png"
              alt="Salon Appointments & Staff Management"
              className="w-full h-auto rounded-xl object-cover"
            />
          </div>
        </div>

        {/* Module 4: Home Services & On-Demand Booking */}
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center lg:flex-row-reverse">
          <div className="rounded-2xl overflow-hidden border border-slate-800 shadow-xl bg-slate-900 p-2 lg:order-2">
            <img
              src="/images/screenshots/14-settings-dark.png"
              alt="Custom Brand & Operations Configuration"
              className="w-full h-auto rounded-xl object-cover"
            />
          </div>
          <div className="space-y-5 lg:order-1">
            <div className="p-3 rounded-2xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-400 w-fit">
              <FiSmartphone className="text-2xl" />
            </div>
            <h3 className="text-3xl font-extrabold text-white">
              Home Services, Field Workflows & Custom Brand Control
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Whether you dispatch repair technicians, cleaning specialists, or digital consultants, Zynthor Business OS
              organizes client job requests, service quotations, and technician assignments in real-time.
            </p>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <FiCheck className="text-cyan-400 mt-0.5 shrink-0" />
                <span>Job quote dispatch with client approval confirmation</span>
              </li>
              <li className="flex items-start gap-2">
                <FiCheck className="text-cyan-400 mt-0.5 shrink-0" />
                <span>Custom brand identity: logo, primary accent theme, public tagline, and announcements</span>
              </li>
              <li className="flex items-start gap-2">
                <FiCheck className="text-cyan-400 mt-0.5 shrink-0" />
                <span>Persistent audit ledger tracking every update, status change, and user login</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Module 5: Financial Invoices & Real Analytics */}
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-5">
            <div className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 w-fit">
              <FiFileText className="text-2xl" />
            </div>
            <h3 className="text-3xl font-extrabold text-white">
              Official Tax Invoices, Promotional Coupons & Real Telemetry
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Say goodbye to manual invoice calculation errors. The financial subsystem generates sequential tax invoices,
              computes standard 18% GST server-side, validates promotional discount codes, and maintains an immutable payment ledger.
            </p>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <FiCheck className="text-emerald-400 mt-0.5 shrink-0" />
                <span>Sequential numbering: <code>INV-YYYY-XXXX</code> with dynamic itemized lines</span>
              </li>
              <li className="flex items-start gap-2">
                <FiCheck className="text-emerald-400 mt-0.5 shrink-0" />
                <span>Promotional coupons engine with percentage caps and minimum spend validation</span>
              </li>
              <li className="flex items-start gap-2">
                <FiCheck className="text-emerald-400 mt-0.5 shrink-0" />
                <span>Real database telemetry: Gross revenue calculated strictly from confirmed orders</span>
              </li>
            </ul>
          </div>
          <div className="rounded-2xl overflow-hidden border border-slate-800 shadow-xl bg-slate-900 p-2">
            <img
              src="/images/screenshots/13-reports-dark.png"
              alt="Financial Reports & Analytics"
              className="w-full h-auto rounded-xl object-cover"
            />
          </div>
        </div>
      </section>

      {/* CTA Final Banner */}
      <section className="py-20 bg-gradient-to-br from-blue-950/40 via-slate-950 to-indigo-950/40 border-b border-slate-900 text-center">
        <div className="max-w-4xl mx-auto px-6 space-y-6">
          <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
            Experience Zynthor Business OS In Action
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            Ready to Streamline Your Business Operations?
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto">
            Schedule a personalized 1-on-1 live walkthrough tailored to your vertical. Our solutions team will demonstrate
            how Business OS replaces fragmented tools and accelerates your business.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/website/book-demo"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-600/30 transition-all cursor-pointer text-sm"
            >
              <span>Schedule Free Live Demo</span>
              <FiArrowRight />
            </Link>
            <Link
              to="/website/pricing"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-sm transition-all"
            >
              <span>Explore Commercial Pricing</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductBusinessOSPage;
