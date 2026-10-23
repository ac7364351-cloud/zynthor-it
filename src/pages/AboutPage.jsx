import { Link, useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { FiChevronRight, FiCheckCircle } from "react-icons/fi";
import About from "../components/About/About.jsx";
import Testimonials from "../components/Testimonials/Testimonials.jsx";
import Process from "../components/Process/Process.jsx";
import CTA from "../components/CTA/CTA.jsx";

const AboutPage = () => {
  const shouldReduceMotion = useReducedMotion();
  const navigate = useNavigate();

  const handleOpenQuote = () => {
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
            <span className="text-blue-400">About</span>
          </nav>

          <motion.div
            className="max-w-3xl"
            initial={{ opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.55 }}
          >
            <span className="text-blue-400 font-semibold uppercase tracking-[0.25em] text-xs">
              Who We Are
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mt-3 tracking-tight leading-tight">
              An Independent Digital Studio Built on{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                Engineering Integrity
              </span>
            </h1>
            <p className="text-slate-300 text-base md:text-lg mt-5 leading-relaxed">
              We build production-ready digital products with a focus on clean software architecture, 
              direct communication with active developers, and transparent milestone pricing.
            </p>

            <div className="flex flex-wrap items-center gap-6 mt-8 text-xs text-slate-400 font-medium">
              <span className="flex items-center gap-1.5">
                <FiCheckCircle className="text-blue-400" />
                Zero Agency Overhead
              </span>
              <span className="flex items-center gap-1.5">
                <FiCheckCircle className="text-blue-400" />
                Direct Developer Access
              </span>
              <span className="flex items-center gap-1.5">
                <FiCheckCircle className="text-blue-400" />
                Remote Collaboration Across India & Globally
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* About Overview */}
      <About onOpenQuote={handleOpenQuote} />

      {/* Client Commitments */}
      <Testimonials />

      {/* Development Workflow */}
      <Process />

      {/* CTA */}
      <CTA onOpenQuote={handleOpenQuote} />
    </div>
  );
};

export default AboutPage;
