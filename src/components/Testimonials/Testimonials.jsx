import { motion, useReducedMotion } from "framer-motion";
import { FiCode, FiDollarSign, FiMessageSquare, FiShield, FiCheckCircle } from "react-icons/fi";

const commitments = [
  {
    icon: FiCode,
    title: "100% Source Code Ownership",
    description:
      "All code, database schemas, and configuration scripts belong entirely to your company upon delivery. No hidden proprietary licensing or vendor lock-in.",
  },
  {
    icon: FiDollarSign,
    title: "Milestone-Driven Transparency",
    description:
      "We work with clear, documented scopes and staged milestone payments. You review and verify functioning code before each milestone is signed off.",
  },
  {
    icon: FiMessageSquare,
    title: "Direct Technical Access",
    description:
      "No communication barriers with non-technical middlemen. You work directly with the developers actively architecting and building your system.",
  },
  {
    icon: FiShield,
    title: "Confidentiality & Security First",
    description:
      "We operate under strict Mutual Non-Disclosure Agreements (NDAs). Database credentials, API secrets, and proprietary business logic remain strictly confidential.",
  },
];

const Testimonials = () => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative py-28 bg-slate-900/50 border-t border-slate-900 overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          className="text-center max-w-3xl mx-auto"
          initial={{ opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.55 }}
        >
          <p className="text-blue-400 font-semibold uppercase tracking-[0.25em] text-xs">
            Client Commitments
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mt-4 tracking-tight">
            Why Businesses Choose{" "}
            <span className="text-blue-500">Zynthor IT</span>
          </h2>
          <p className="text-slate-400 text-base md:text-lg mt-5 leading-relaxed">
            We hold ourselves to strict delivery standards to ensure your digital project 
            is delivered with high technical quality, complete transparency, and zero business risk.
          </p>
        </motion.div>

        {/* Commitments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          {commitments.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-7 hover:border-blue-500/40 hover:bg-slate-950 transition-all duration-300 flex flex-col justify-between"
                initial={{ opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.45, delay: idx * 0.08 }}
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-6">
                    <Icon className="text-2xl" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3">
                    {item.title}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center gap-1.5 text-xs text-blue-400 font-medium">
                  <FiCheckCircle />
                  <span>Standard on every project</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;