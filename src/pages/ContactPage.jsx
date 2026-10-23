import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { FiChevronRight, FiCheckCircle } from "react-icons/fi";
import Contact from "../components/Contact/Contact.jsx";
import FAQ from "../components/FAQ/FAQ.jsx";
import officeWorkspaceImg from "../assets/images/office-workspace.jpg";

const ContactPage = ({ selectedService }) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="pt-24">
      {/* Page Hero Header */}
      <section className="relative py-20 bg-slate-950 border-b border-slate-900 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-600/10 blur-[130px] rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6 font-medium">
            <Link to="/" className="hover:text-blue-400 transition-colors">
              Home
            </Link>
            <FiChevronRight className="text-slate-600 text-xs" />
            <span className="text-blue-400">Contact</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <motion.div
              className="lg:col-span-7"
              initial={{ opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.55 }}
            >
              <span className="text-blue-400 font-semibold uppercase tracking-[0.25em] text-xs">
                Project Scoping & Inquiries
              </span>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mt-3 tracking-tight leading-tight">
                Let's Discuss Your{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                  Next Project
                </span>
              </h1>
              <p className="text-slate-300 text-base md:text-lg mt-5 leading-relaxed">
                From business websites to data dashboards, we help businesses build effective digital 
                experiences — wherever they are. Share your scope below or reach our team directly.
              </p>

              <div className="flex flex-wrap items-center gap-6 mt-8 text-xs text-slate-400 font-medium">
                <span className="flex items-center gap-1.5">
                  <FiCheckCircle className="text-blue-400" />
                  Response Within 2 to 4 Business Hours
                </span>
                <span className="flex items-center gap-1.5">
                  <FiCheckCircle className="text-blue-400" />
                  Free Itemized Proposal in INR (₹)
                </span>
                <span className="flex items-center gap-1.5">
                  <FiCheckCircle className="text-blue-400" />
                  NDA & Confidentiality Assured
                </span>
              </div>
            </motion.div>

            <motion.div
              className="lg:col-span-5"
              initial={{ opacity: shouldReduceMotion ? 1 : 0, scale: shouldReduceMotion ? 1 : 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.6, delay: 0.15 }}
            >
              <div className="group relative rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl bg-slate-900">
                <img
                  src={officeWorkspaceImg}
                  alt="Zynthor IT Engineering Studio and Modern Workspace"
                  className="w-full h-56 sm:h-64 object-cover object-center filter brightness-95 contrast-105 group-hover:scale-105 transition-transform duration-700 ease-out"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-950/85 backdrop-blur-md border border-slate-700/70 shadow-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-semibold text-slate-200 uppercase tracking-wider">Active Engineering Studio</span>
                </div>
                <div className="absolute bottom-3 left-4 right-4">
                  <p className="text-xs font-bold text-white tracking-tight">Direct Development Partner</p>
                  <p className="text-[11px] text-slate-300 mt-0.5">Reliable communication, clear milestones, and verified production code.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Contact & Quote Engine */}
      <Contact preselectedService={selectedService} initialTab="quote" />

      {/* Relevant FAQs */}
      <FAQ />
    </div>
  );
};

export default ContactPage;
