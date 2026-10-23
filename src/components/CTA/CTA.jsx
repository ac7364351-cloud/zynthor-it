import { motion, useReducedMotion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { FiArrowRight, FiCheckCircle } from "react-icons/fi";

const CTA = ({ onOpenQuote }) => {
  const shouldReduceMotion = useReducedMotion();
  const location = useLocation();
  const isHome = location.pathname === "/" || location.pathname === "";

  return (
    <section className="py-20 bg-slate-950 border-t border-slate-900 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          className="relative overflow-hidden rounded-3xl border border-blue-500/25 bg-gradient-to-br from-blue-950/40 via-slate-950 to-slate-900 p-10 md:p-16"
          initial={{ opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.55 }}
        >
          {/* Ambient Lighting */}
          <div className="absolute -top-32 -right-32 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
            {/* Copy */}
            <div className="max-w-2xl">
              <span className="text-blue-400 font-semibold uppercase tracking-widest text-xs">
                Let's Build Together
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mt-3 leading-tight tracking-tight">
                Ready to Build{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                  Your Digital Platform?
                </span>
              </h2>
              <p className="text-slate-300 text-base md:text-lg mt-4 leading-relaxed font-normal">
                Affordable, high-converting digital solutions tailored for startups and businesses. 
                Get in touch today for a free technical consultation and an itemized milestone quotation in INR (₹).
              </p>
              <div className="flex flex-wrap items-center gap-5 mt-6 text-xs text-slate-400 font-medium">
                <span className="flex items-center gap-1.5">
                  <FiCheckCircle className="text-blue-400" />
                  Free 1-on-1 requirement consultation
                </span>
                <span className="flex items-center gap-1.5">
                  <FiCheckCircle className="text-blue-400" />
                  Transparent packages from ₹1,499 onwards
                </span>
              </div>
            </div>

            {/* CTA Button linking to Contact */}
            <div className="shrink-0 w-full lg:w-auto">
              {isHome ? (
                <button
                  type="button"
                  onClick={onOpenQuote}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-xl shadow-blue-600/25 hover:shadow-blue-600/40 hover:-translate-y-0.5 cursor-pointer"
                >
                  <span>Discuss Your Project</span>
                  <FiArrowRight className="text-base" />
                </button>
              ) : (
                <Link
                  to="/#contact-form"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-xl shadow-blue-600/25 hover:shadow-blue-600/40 hover:-translate-y-0.5 cursor-pointer"
                >
                  <span>Discuss Your Project</span>
                  <FiArrowRight className="text-base" />
                </Link>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;