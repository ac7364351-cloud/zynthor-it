import { motion, useReducedMotion } from "framer-motion";
import { FiMessageSquare, FiFileText, FiCode, FiCheckCircle } from "react-icons/fi";

const steps = [
  {
    step: "01",
    icon: FiMessageSquare,
    title: "Discuss Your Requirements",
    description:
      "We discuss your business objectives, target audience, technical specifications, and key features to define the ideal project scope.",
    outputs: ["Free requirement consultation", "Architecture recommendation", "Timeline & content guidelines"],
  },
  {
    step: "02",
    icon: FiFileText,
    title: "Receive a Proposal",
    description:
      "You receive a clear, fixed-price proposal in Indian Rupees (₹) detailing deliverables, milestone payments, and completion timelines.",
    outputs: ["Itemized milestone quote in INR (₹)", "Agreed deliverables checklist", "Clear scope with no hidden charges"],
  },
  {
    step: "03",
    icon: FiCode,
    title: "Development & Review",
    description:
      "We build your website or application using modern React & mobile-first design, sharing a live preview link for your feedback and revisions.",
    outputs: ["Clean, responsive frontend development", "Live staging preview link for your review", "Feedback incorporation & testing"],
  },
  {
    step: "04",
    icon: FiCheckCircle,
    title: "Final Delivery & Launch",
    description:
      "Upon your final approval, we launch your website, connect your domain and contact pipelines, and hand over complete ownership.",
    outputs: ["Live deployment & launch", "Inquiry form verification", "Full source code & asset handover"],
  },
];

const Process = () => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section id="process" className="relative py-28 bg-slate-900/40 border-t border-slate-900 overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          className="max-w-3xl"
          initial={{ opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.55 }}
        >
          <p className="text-blue-400 font-semibold uppercase tracking-[0.25em] text-xs">
            Simple 4-Step Process
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mt-4 tracking-tight">
            How It Works: From Idea to{" "}
            <span className="text-blue-500">Live Website</span>
          </h2>
          <p className="text-slate-400 text-base md:text-lg mt-5 leading-relaxed">
            A straightforward, hassle-free development workflow designed specifically 
            for busy business owners. You stay informed at every milestone.
          </p>
        </motion.div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.step}
                className="relative bg-slate-950/80 border border-slate-800/80 rounded-2xl p-7 flex flex-col justify-between hover:border-blue-500/40 hover:bg-slate-950 transition-all duration-300"
                initial={{ opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.45, delay: idx * 0.08 }}
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-3xl font-black text-slate-800 tracking-tighter">
                      {item.step}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                      <Icon className="text-xl" />
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-3">
                    {item.title}
                  </h3>
                  <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-6">
                    {item.description}
                  </p>
                </div>

                <div className="pt-5 border-t border-slate-800/80">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-300 mb-2">
                    Key Deliverables:
                  </p>
                  <ul className="space-y-1.5 text-xs text-slate-400">
                    {item.outputs.map((out, oIdx) => (
                      <li key={oIdx} className="flex items-start gap-1.5">
                        <span className="text-blue-400 font-bold">•</span>
                        <span>{out}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Process;
