import { Link, useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { FiChevronRight, FiCheckCircle } from "react-icons/fi";
import Services from "../components/Services/Services.jsx";
import Process from "../components/Process/Process.jsx";
import TechStack from "../components/TechStack/TechStack.jsx";
import FAQ from "../components/FAQ/FAQ.jsx";
import CTA from "../components/CTA/CTA.jsx";

const ServicesPage = ({ onSelectPackage }) => {
  const shouldReduceMotion = useReducedMotion();
  const navigate = useNavigate();

  const handleSelectAndNavigate = (serviceTitle) => {
    if (onSelectPackage) {
      onSelectPackage(serviceTitle);
    }
    navigate("/#contact-form");
  };

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
            <span className="text-blue-400">Services</span>
          </nav>

          <motion.div
            className="max-w-3xl"
            initial={{ opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.55 }}
          >
            <span className="text-blue-400 font-semibold uppercase tracking-[0.25em] text-xs">
              Engineering Capabilities
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mt-3 tracking-tight leading-tight">
              Full-Lifecycle{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                Digital Engineering
              </span>
            </h1>
            <p className="text-slate-300 text-base md:text-lg mt-5 leading-relaxed">
              From high-performance business websites to custom web applications, API integrations, 
              and Power BI analytics dashboards. Every service includes milestone-based pricing in INR (₹) 
              and 100% source code ownership.
            </p>

            <div className="flex flex-wrap items-center gap-6 mt-8 text-xs text-slate-400 font-medium">
              <span className="flex items-center gap-1.5">
                <FiCheckCircle className="text-blue-400" />
                Modern React 19 & Node.js
              </span>
              <span className="flex items-center gap-1.5">
                <FiCheckCircle className="text-blue-400" />
                Milestone-Driven Scopes
              </span>
              <span className="flex items-center gap-1.5">
                <FiCheckCircle className="text-blue-400" />
                Zero Vendor Lock-in
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services List */}
      <Services onSelectService={handleSelectAndNavigate} />

      {/* How We Deliver */}
      <Process />

      {/* Tech Stack */}
      <TechStack />

      {/* FAQ */}
      <FAQ />

      {/* CTA */}
      <CTA />
    </div>
  );
};

export default ServicesPage;
