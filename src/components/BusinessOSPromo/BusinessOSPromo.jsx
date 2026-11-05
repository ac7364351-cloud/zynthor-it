import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiCheckCircle,
  FiUsers,
  FiCoffee,
  FiScissors,
  FiFileText,
  FiShield,
  FiLayers,
  FiEye,
  FiGrid,
  FiTool,
  FiUserCheck,
  FiCalendar,
} from "react-icons/fi";

const BusinessOSPromo = () => {
  const capabilities = [
    {
      icon: <FiGrid className="text-blue-400 text-lg" />,
      title: "Business Dashboard",
      desc: "Real-time executive telemetry, verified revenue metrics, appointment volume, and active business status.",
    },
    {
      icon: <FiUserCheck className="text-emerald-400 text-lg" />,
      title: "Customer Management",
      desc: "Complete client directory, contact history, lifetime spend, and privacy-partitioned customer records.",
    },
    {
      icon: <FiUsers className="text-sky-400 text-lg" />,
      title: "Enquiry & Lead Management",
      desc: "Multi-stage pipeline tracking (new, contacted, converted, lost), staff assignment, and scheduled follow-ups.",
    },
    {
      icon: <FiCoffee className="text-amber-400 text-lg" />,
      title: "Cafe QR Menu",
      desc: "Contactless digital QR menus, category filters, dietary indicators (Veg/Non-Veg), and dynamic catalog prices.",
    },
    {
      icon: <FiLayers className="text-orange-400 text-lg" />,
      title: "Orders & Tables (KDS)",
      desc: "Floor table management, live Kitchen Order Tickets (KOT), stage progression, and final bill generation.",
    },
    {
      icon: <FiScissors className="text-pink-400 text-lg" />,
      title: "Salon Appointments",
      desc: "Stylist calendars with algorithmic double-booking collision prevention and specialized service catalog.",
    },
    {
      icon: <FiTool className="text-indigo-400 text-lg" />,
      title: "Home Services Enquiries",
      desc: "Service dispatch management, customer visit scheduling, technician assignment, and work order tracking.",
    },
    {
      icon: <FiFileText className="text-teal-400 text-lg" />,
      title: "Business Reports",
      desc: "Automated GST 18% tax invoicing (INV-YYYY-XXXX), revenue analytics, and CSV data export reconciliations.",
    },
    {
      icon: <FiShield className="text-purple-400 text-lg" />,
      title: "Staff Roles & Permissions",
      desc: "Role-based access control for Super Admins, Business Owners, Stylists, and Cafe Kitchen staff.",
    },
  ];

  return (
    <section id="business-os" className="relative py-28 bg-slate-950 border-t border-slate-900 overflow-hidden text-slate-100">
      {/* Background Lighting Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-r from-blue-600/15 via-indigo-600/10 to-amber-500/10 blur-[140px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 space-y-16">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-950/80 border border-blue-500/40 text-blue-300 text-xs font-semibold uppercase tracking-wider shadow-sm">
            <FiLayers className="text-amber-400" />
            <span>Zynthor IT Flagship SaaS Product</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Zynthor Business OS —{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-amber-300">
              One Platform. Complete Business Management.
            </span>
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Zynthor IT offers its own proprietary business management software designed to help small and medium businesses 
            streamline their daily operations. From customer enquiries and table orders to salon bookings and tax invoicing, 
            everything is managed seamlessly in a single secure platform.
          </p>

          {/* Required 3 Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-3">
            <Link
              to="/products/business-os"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
            >
              <span>Explore Zynthor Business OS</span>
              <FiArrowRight />
            </Link>

            <Link
              to="/products/business-os#demo-gallery"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs sm:text-sm font-semibold transition-all hover:border-blue-500 cursor-pointer"
            >
              <FiEye className="text-sky-400" />
              <span>View Product Demo</span>
            </Link>

            <Link
              to="/book-demo"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/40 text-xs sm:text-sm font-semibold transition-all hover:border-amber-400 cursor-pointer shadow-sm"
            >
              <FiCalendar className="text-amber-400" />
              <span>Book a Demo</span>
            </Link>
          </div>
        </div>

        {/* Dashboard Visual Preview Showcase */}
        <div className="p-3 sm:p-5 rounded-3xl bg-slate-900/80 border border-slate-800/90 shadow-2xl backdrop-blur-xl relative group">
          {/* OS Window Chrome Bar */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800 text-xs text-slate-400 mb-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
              <span className="ml-2 font-mono text-[11px] text-slate-400 hidden sm:inline">
                Zynthor Business OS • Executive Telemetry & Management Dashboard
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-mono text-emerald-400 uppercase font-semibold">
                Verified Production Software
              </span>
            </div>
          </div>

          {/* Genuine Application Screenshot */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950">
            <img
              src="/images/screenshots/02-dashboard-dark.png"
              alt="Zynthor Business OS Authentic Executive Dashboard Interface"
              className="w-full h-auto object-cover object-top shadow-2xl filter contrast-[1.02]"
              loading="lazy"
            />
            {/* Ambient edge gradient for smooth blending */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />
          </div>
        </div>

        {/* 9 Genuine Capabilities Grid */}
        <div className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest block">
              Core Capabilities
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              Built Specifically for Small & Medium Businesses
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">
              Tested, authentic functionality designed to replace paper registers, disjointed spreadsheets, and expensive subscriptions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {capabilities.map((c, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all hover:-translate-y-1 space-y-3 shadow-lg"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center">
                  {c.icon}
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">{c.title}</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{c.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BusinessOSPromo;
