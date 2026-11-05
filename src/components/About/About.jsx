import { motion, useReducedMotion } from "framer-motion";
import { FiCheckCircle, FiCode, FiLayers, FiGlobe, FiArrowRight } from "react-icons/fi";
import aboutTeamImg from "../../assets/images/about-team.jpg";

const About = ({ onOpenQuote }) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section id="about" className="relative py-28 bg-slate-950 border-t border-slate-900 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute right-0 top-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column (Content) */}
          <motion.div
            className="lg:col-span-7"
            initial={{ opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.55 }}
          >
            <p className="text-blue-400 font-semibold uppercase tracking-[0.25em] text-xs">
              About Zynthor IT
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mt-4 tracking-tight leading-tight">
              A Dedicated Engineering Studio for{" "}
              <span className="text-blue-500">Modern Digital Growth</span>
            </h2>

            <p className="text-slate-300 text-base md:text-lg mt-6 leading-relaxed">
              Zynthor IT is an independent digital engineering agency focused on custom website development, 
              full-stack web applications, business automation, and data analytics.
            </p>

            <p className="text-slate-400 text-base mt-4 leading-relaxed">
              We partner with business owners, founders, and growing enterprises across India and internationally 
              who need dependable, production-grade software without excessive agency overhead. Operating seamlessly 
              in remote collaboration, we build digital solutions designed to scale reliably.
            </p>

            {/* Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-8 pt-8 border-t border-slate-800/80">
              <div className="flex items-center gap-2.5 text-sm text-slate-300">
                <FiCheckCircle className="text-blue-400 shrink-0" />
                <span>100% Client Code Ownership</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm text-slate-300">
                <FiCheckCircle className="text-blue-400 shrink-0" />
                <span>Modern React 19 & Node.js Stack</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm text-slate-300">
                <FiCheckCircle className="text-blue-400 shrink-0" />
                <span>Mutual Non-Disclosure (NDA) Protected</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm text-slate-300">
                <FiCheckCircle className="text-blue-400 shrink-0" />
                <span>Transparent Milestone-Driven Pricing</span>
              </div>
            </div>

            <div className="mt-9">
              <button
                type="button"
                onClick={onOpenQuote}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold px-7 py-3.5 rounded-xl transition-all shadow-md shadow-blue-600/20 hover:shadow-blue-600/30 hover:-translate-y-0.5 cursor-pointer text-xs uppercase tracking-wider"
              >
                <span>Discuss Your Project With Us</span>
                <FiArrowRight className="text-base" />
              </button>
            </div>
          </motion.div>

          {/* Right Column: Visual Photo & Values Cards */}
          <motion.div
            className="lg:col-span-5 space-y-4"
            initial={{ opacity: shouldReduceMotion ? 1 : 0, scale: shouldReduceMotion ? 1 : 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.6 }}
          >
            {/* Realistic Collaborative Team Photo */}
            <div className="group relative rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl bg-slate-900 transition-all duration-300 hover:border-blue-500/40">
              <img
                src={aboutTeamImg}
                alt="Zynthor IT Collaborative Software Engineering Team"
                className="w-full h-56 sm:h-64 object-cover object-center filter brightness-95 contrast-105 group-hover:scale-105 transition-transform duration-700 ease-out"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
              
              {/* Badge chip over team photo */}
              <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-950/85 backdrop-blur-md border border-slate-700/70 shadow-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-semibold text-slate-200 uppercase tracking-wider">Engineers • Not Sales Agents</span>
              </div>

              <div className="absolute bottom-3 left-4 right-4">
                <p className="text-xs font-bold text-white tracking-tight">Direct Engineering Collaboration</p>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">Collaborating directly with active developers building your software architecture.</p>
              </div>
            </div>

            {/* Value Highlights */}
            <div className="grid grid-cols-1 gap-3">
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 hover:border-slate-700 transition-colors">
                <div className="flex items-center gap-2.5 mb-1">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 text-sm">
                    <FiCode />
                  </div>
                  <h4 className="text-sm font-bold text-white">Engineering Quality</h4>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Clean, well-documented, and modular codebases that your team can easily scale or maintain over time.
                </p>
              </div>

              <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 hover:border-slate-700 transition-colors">
                <div className="flex items-center gap-2.5 mb-1">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 text-sm">
                    <FiLayers />
                  </div>
                  <h4 className="text-sm font-bold text-white">Pragmatic Architecture</h4>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">
                  We select proven modern tools suited for your specific business requirements, avoiding over-engineering.
                </p>
              </div>

              <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 hover:border-slate-700 transition-colors">
                <div className="flex items-center gap-2.5 mb-1">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 text-sm">
                    <FiGlobe />
                  </div>
                  <h4 className="text-sm font-bold text-white">Global Remote Flexibility</h4>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Clear asynchronous communication, weekly progress updates, and staging demos across time zones.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;