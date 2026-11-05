import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiCheckCircle,
  FiZap,
  FiUsers,
  FiCoffee,
  FiScissors,
  FiFileText,
  FiCpu,
  FiTrendingUp,
  FiShield,
  FiLayers,
  FiEye,
} from "react-icons/fi";

const BusinessOSPromo = () => {
  const features = [
    {
      icon: <FiUsers className="text-blue-400 text-lg" />,
      title: "Inbound Leads CRM & Conversion",
      desc: "Capture website inquiries, assign staff, schedule follow-ups, and auto-convert qualified leads into customer accounts.",
    },
    {
      icon: <FiCoffee className="text-amber-400 text-lg" />,
      title: "Digital QR Menu & Kitchen KDS",
      desc: "Interactive dining menus, table management, live Kitchen Order Tickets (KOT), and end-to-end table billing.",
    },
    {
      icon: <FiScissors className="text-pink-400 text-lg" />,
      title: "Salon & Wellness Appointments",
      desc: "Client booking calendar with strict double-booking collision prevention and specialist team rostering.",
    },
    {
      icon: <FiFileText className="text-emerald-400 text-lg" />,
      title: "Official GST Invoices & Coupons",
      desc: "Server-calculated 18% GST invoices, sequential numbering (INV-YYYY-XXXX), and promotional discount validation.",
    },
    {
      icon: <FiCpu className="text-indigo-400 text-lg" />,
      title: "Bilingual AI Business Copilot",
      desc: "Domain-grounded assistance supporting English, हिन्दी, and Hinglish with automated human manager escalation.",
    },
    {
      icon: <FiZap className="text-yellow-400 text-lg" />,
      title: "Multi-Channel Workflow Automations",
      desc: "Event-triggered WhatsApp, SMS, and email alerts for appointment confirmations, orders, and inquiries.",
    },
  ];

  const benefits = [
    {
      title: "3x Faster Inbound Conversion",
      desc: "Never lose a customer inquiry with automated instant follow-ups and centralized CRM tracking.",
    },
    {
      title: "Eliminate Manual Paperwork",
      desc: "Replace chaotic paper registers, notebooks, and scattered spreadsheets with an audit-ready database.",
    },
    {
      title: "Zero Double-Booking Conflicts",
      desc: "Algorithmic calendar slot checks protect your stylists, dining tables, and consultants from scheduling overlaps.",
    },
    {
      title: "Predictable, Transparent ROI",
      desc: "Flat starting rate from ₹799/month with zero revenue percentage deductions or hidden renewal surcharges.",
    },
  ];

  return (
    <section className="relative py-28 bg-slate-950 border-t border-slate-900 overflow-hidden text-slate-100">
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
            Zynthor Business OS — The All-in-One Operating System for{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-amber-300">
              Modern Businesses
            </span>
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Stop juggling six disjointed subscriptions. Built from the ground up by Zynthor IT, Business OS
            unifies your leads, customers, online bookings, dining menus, invoices, and operations into a single
            secure, high-contrast cloud workspace.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              to="/website/products/business-os"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
            >
              <span>Explore Product Details</span>
              <FiArrowRight />
            </Link>

            <Link
              to="/website/book-demo"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs sm:text-sm font-semibold transition-all hover:border-amber-500 cursor-pointer"
            >
              <FiEye className="text-amber-400" />
              <span>Book a Live Demo</span>
            </Link>

            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-950/80 hover:bg-blue-900/80 text-blue-300 border border-blue-500/40 text-xs sm:text-sm font-semibold transition-all hover:border-blue-400 cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Launch Live SaaS App</span>
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
                https://app.zynthor.com/dashboard • Obsidian Luxury Theme
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-mono text-emerald-400 uppercase font-semibold">
                Multi-Tenant Cloud Live
              </span>
            </div>
          </div>

          {/* Genuine Application Screenshot */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-inner bg-slate-950">
            <img
              src="/images/screenshots/02-dashboard-dark.png"
              alt="Zynthor Business OS Executive Dashboard Preview"
              className="w-full h-auto object-cover transform group-hover:scale-[1.01] transition-transform duration-500"
              loading="lazy"
            />

            {/* Floating Metric Badges */}
            <div className="absolute top-4 right-4 hidden md:flex flex-col gap-2 pointer-events-none">
              <div className="p-3 rounded-2xl bg-slate-950/90 border border-emerald-500/40 text-emerald-300 text-xs shadow-xl backdrop-blur-md flex items-center gap-2.5">
                <FiTrendingUp className="text-emerald-400 text-base" />
                <div>
                  <div className="text-[10px] uppercase font-mono text-slate-400 font-bold">Real Revenue</div>
                  <div className="font-extrabold text-white text-sm">₹3,42,800 Realized</div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/90 border border-blue-500/40 text-blue-300 text-xs shadow-xl backdrop-blur-md flex items-center gap-2.5">
                <FiShield className="text-blue-400 text-base" />
                <div>
                  <div className="text-[10px] uppercase font-mono text-slate-400 font-bold">Tenant Boundary</div>
                  <div className="font-extrabold text-white text-sm">100% Data Isolated</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="space-y-6">
          <div className="text-center max-w-xl mx-auto">
            <h3 className="text-xl sm:text-2xl font-bold text-white">Engineered For Operational Precision</h3>
            <p className="text-xs text-slate-400 mt-1">
              Every feature runs against real database records—never simulated mockups.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feat, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/90 transition-all space-y-3 group"
              >
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 w-fit group-hover:border-blue-500/40 transition-colors">
                  {feat.icon}
                </div>
                <h4 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors">
                  {feat.title}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Business Benefits Section */}
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-slate-900/90 via-slate-950 to-slate-900/90 border border-slate-800 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest block">
                Quantifiable SMB Advantage
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                Why Growing Businesses Choose Zynthor
              </h3>
            </div>
            <Link
              to="/website/pricing"
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1.5 w-fit"
            >
              <span>View Transparent Pricing (From ₹799/mo)</span>
              <FiArrowRight />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((b, bIdx) => (
              <div key={bIdx} className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <FiCheckCircle className="text-emerald-400 shrink-0 text-base" />
                  <span>{b.title}</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BusinessOSPromo;
