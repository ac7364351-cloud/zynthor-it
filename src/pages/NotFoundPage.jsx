import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { FiHome, FiArrowRight, FiCompass } from "react-icons/fi";

const NotFoundPage = () => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="pt-24 min-h-[80vh] flex items-center justify-center bg-slate-950 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-blue-600/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto px-6 py-20 text-center">
        <motion.div
          initial={{ opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.55 }}
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-6">
            <FiCompass className="text-sm" />
            <span>404 • Page Not Found</span>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-white tracking-tight">
            Lost in the{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              Digital Space
            </span>
          </h1>

          <p className="text-slate-400 text-base md:text-lg mt-5 max-w-md mx-auto leading-relaxed">
            The page you are looking for doesn't exist or has moved. Explore our core sections below.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-blue-600/25"
            >
              <FiHome />
              <span>Back to Homepage</span>
            </Link>

            <Link
              to="/services"
              className="inline-flex items-center gap-2 border border-slate-800 hover:border-slate-700 bg-slate-900/60 hover:bg-slate-900 text-slate-200 hover:text-white font-semibold px-6 py-3.5 rounded-xl text-sm transition-all"
            >
              <span>Explore Services</span>
              <FiArrowRight />
            </Link>
          </div>

          {/* Quick link directory */}
          <div className="mt-14 pt-8 border-t border-slate-800/80 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <Link to="/services" className="hover:text-blue-400 transition-colors">
              Services
            </Link>
            <span>•</span>
            <Link to="/pricing" className="hover:text-blue-400 transition-colors">
              Pricing Packages
            </Link>
            <span>•</span>
            <Link to="/portfolio" className="hover:text-blue-400 transition-colors">
              Case Studies
            </Link>
            <span>•</span>
            <Link to="/about" className="hover:text-blue-400 transition-colors">
              About Zynthor IT
            </Link>
            <span>•</span>
            <Link to="/contact" className="hover:text-blue-400 transition-colors">
              Contact Form
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFoundPage;
