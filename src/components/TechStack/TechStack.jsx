import { motion, useReducedMotion } from "framer-motion";
import { FiCode, FiServer, FiDatabase, FiTrendingUp } from "react-icons/fi";

const categories = [
  {
    icon: FiCode,
    category: "Frontend Engineering",
    description: "Fast, responsive user interfaces built with modern reactive libraries.",
    skills: ["React 19", "JavaScript (ES6+)", "Tailwind CSS v4", "Vite 8", "HTML5 & Semantic CSS"],
  },
  {
    icon: FiServer,
    category: "Backend & API Architecture",
    description: "Lightweight, high-concurrency services and secure REST APIs.",
    skills: ["Node.js", "Express 5", "REST API Design", "Connection Pooling", "CORS & Security"],
  },
  {
    icon: FiDatabase,
    category: "Data & Storage",
    description: "ACID-compliant relational databases structured for performance and integrity.",
    skills: ["MySQL 8", "Schema Normalization", "Parameterized Queries", "Database Migrations", "Data Indexing"],
  },
  {
    icon: FiTrendingUp,
    category: "Analytics & Automation",
    description: "Data pipelines and interactive business intelligence reporting suites.",
    skills: ["Python", "Pandas", "Power BI", "Data Wrangling", "Automated Reporting"],
  },
];

const TechStack = () => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section id="tech-stack" className="relative py-28 bg-slate-950 border-t border-slate-900 overflow-hidden">
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
            Technology Foundation
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mt-4 tracking-tight">
            Built With Modern, Reliable{" "}
            <span className="text-blue-500">Industry Standards</span>
          </h2>
          <p className="text-slate-400 text-base md:text-lg mt-5 leading-relaxed">
            We avoid experimental fads in favor of mature, battle-tested technologies that 
            ensure maximum performance, maintainability, and long-term security.
          </p>
        </motion.div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <motion.div
                key={idx}
                className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-7 hover:border-blue-500/40 hover:bg-slate-900 transition-all duration-300 flex flex-col justify-between"
                initial={{ opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.45, delay: idx * 0.08 }}
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-5">
                    <Icon className="text-2xl" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {cat.category}
                  </h3>
                  <p className="text-slate-400 text-xs leading-relaxed mb-6">
                    {cat.description}
                  </p>
                </div>

                <div className="pt-5 border-t border-slate-800/80">
                  <div className="flex flex-wrap gap-1.5">
                    {cat.skills.map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        className="text-xs font-mono bg-slate-950 text-slate-300 px-2.5 py-1 rounded-md border border-slate-800"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TechStack;