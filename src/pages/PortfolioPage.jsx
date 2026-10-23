import { Link, useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { FiChevronRight, FiCheckCircle } from "react-icons/fi";
import Portfolio from "../components/Portfolio/Portfolio.jsx";
import TechStack from "../components/TechStack/TechStack.jsx";
import CTA from "../components/CTA/CTA.jsx";

const PortfolioPage = () => {
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
            <span className="text-blue-400">Portfolio</span>
          </nav>

          <motion.div
            className="max-w-3xl"
            initial={{ opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.55 }}
          >
            <span className="text-blue-400 font-semibold uppercase tracking-[0.25em] text-xs">
              Proven Architecture
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mt-3 tracking-tight leading-tight">
              Case Studies &{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                Technical Implementations
              </span>
            </h1>
            <p className="text-slate-300 text-base md:text-lg mt-5 leading-relaxed">
              Explore real-world software architectures built across our core stack. From relational database 
              portals and responsive commerce engines to interactive data visualization dashboards.
            </p>

            <div className="flex flex-wrap items-center gap-6 mt-8 text-xs text-slate-400 font-medium">
              <span className="flex items-center gap-1.5">
                <FiCheckCircle className="text-blue-400" />
                Production-Tested Architectures
              </span>
              <span className="flex items-center gap-1.5">
                <FiCheckCircle className="text-blue-400" />
                Structured Database Schemas
              </span>
              <span className="flex items-center gap-1.5">
                <FiCheckCircle className="text-blue-400" />
                Sub-Second Page Performance
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Case Studies */}
      <Portfolio onOpenQuote={handleOpenQuote} />

      {/* Tech Stack */}
      <TechStack />

      {/* CTA */}
      <CTA onOpenQuote={handleOpenQuote} />
    </div>
  );
};

export default PortfolioPage;
