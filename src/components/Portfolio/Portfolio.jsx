import { motion, useReducedMotion } from "framer-motion";
import { FiCheckCircle, FiArrowRight } from "react-icons/fi";
import portfolioEcommerceImg from "../../assets/images/portfolio-ecommerce.jpg";
import portfolioJobPortalImg from "../../assets/images/portfolio-job-portal.jpg";
import portfolioAnalyticsImg from "../../assets/images/portfolio-analytics.jpg";
import portfolioBusinessWebImg from "../../assets/images/portfolio-business-web.jpg";

const projects = [
  {
    id: "ecommerce",
    title: "Full-Stack E-Commerce Engine",
    category: "Web Application",
    badge: "Full-Stack System",
    image: portfolioEcommerceImg,
    description:
      "A complete online commerce solution featuring catalog browsing, dynamic shopping cart logic, order processing, and customer inquiry management.",
    challenge: "Built to provide fast page loads, clean mobile checkout, and structured relational product data without expensive recurring SaaS subscription lock-in.",
    highlights: [
      "Modular React UI with responsive mobile navigation",
      "Node.js & Express REST API with parameterized queries",
      "Relational MySQL schema for products, categories & customer orders",
      "Secure client-side state management & form validation",
    ],
    tech: ["React", "Node.js", "Express", "MySQL", "Tailwind CSS"],
  },
  {
    id: "job-portal",
    title: "Corporate Recruitment & Job Portal",
    category: "Web Application",
    badge: "Multi-Role Portal",
    image: portfolioJobPortalImg,
    description:
      "A full-stack recruitment platform connecting candidates and hiring companies with structured job listings, search filtering, and application pipelines.",
    challenge: "Engineered to separate candidate and employer flows while maintaining fast search, application tracking, and automated status handling.",
    highlights: [
      "Role-based authentication structure for applicants & admins",
      "Dynamic search filters by role, technology & experience",
      "Application submission pipeline with resume metadata handling",
      "Relational database indexing for low-latency search",
    ],
    tech: ["React", "Node.js", "Express", "MySQL", "REST APIs"],
  },
  {
    id: "analytics-dashboard",
    title: "Executive KPI & Data Analytics Platform",
    category: "Data Analytics",
    badge: "Business Intelligence",
    image: portfolioAnalyticsImg,
    description:
      "An interactive business intelligence reporting suite that extracts raw transactional records and aggregates them into actionable metric visualizations.",
    challenge: "Designed to replace scattered manual spreadsheets with automated, visual KPI tracking for business stakeholders.",
    highlights: [
      "Automated data aggregation pipelines using Python & Pandas",
      "Interactive time-series charts, category breakdowns & KPI cards",
      "Custom SQL queries optimized for rapid metric calculations",
      "Exportable executive summaries for monthly reviews",
    ],
    tech: ["Python", "Pandas", "Power BI", "MySQL", "Data Pipelines"],
  },
  {
    id: "business-presence",
    title: "Digital Agency & Lead Capture Engine",
    category: "Website Development",
    badge: "High-Performance Web",
    image: portfolioBusinessWebImg,
    description:
      "A fast, modern responsive web platform engineered for business credibility, service discoverability, and high-conversion client inquiry capture.",
    challenge: "Optimized for sub-second load times, excellent mobile responsiveness, and seamless integration with a backend inquiry database.",
    highlights: [
      "Vite 8 & React 19 architecture for instant compilation",
      "Tailwind CSS v4 styling with dark navy aesthetic",
      "Dynamic inquiry form with server-side validation",
      "Automated connection pooling to persistent MySQL database",
    ],
    tech: ["React 19", "Vite 8", "Tailwind CSS v4", "Express", "MySQL"],
  },
];

const Portfolio = ({ onOpenQuote }) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section id="portfolio" className="relative py-28 bg-slate-950 overflow-hidden border-t border-slate-900">
      {/* Background Glow */}
      <div className="absolute right-0 top-1/3 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

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
            Proven Architectures
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mt-4 tracking-tight">
            Case Studies &{" "}
            <span className="text-blue-500">Technical Solutions</span>
          </h2>
          <p className="text-slate-400 text-base md:text-lg mt-5 leading-relaxed">
            Real software architectures built using our core technology stack. Each project 
            demonstrates practical engineering, clean code structure, and reliable data persistence.
          </p>
        </motion.div>

        {/* Case Studies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16">
          {projects.map((project, idx) => (
            <motion.div
              key={project.id}
              className="group bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden hover:border-blue-500/50 hover:bg-slate-900/90 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 flex flex-col justify-between shadow-sm"
              initial={{ opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.5, delay: idx * 0.1 }}
            >
              <div>
                {/* Visual Preview Header with Local Verified Asset */}
                <div className="relative h-52 sm:h-60 w-full overflow-hidden bg-slate-950 border-b border-slate-800/80">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover object-center filter brightness-95 contrast-105 group-hover:scale-105 transition-transform duration-700 ease-out"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
                  
                  {/* Badge Overlay */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-300 bg-blue-950/85 backdrop-blur-md px-3 py-1 rounded-full border border-blue-500/30 shadow-sm">
                      {project.badge}
                    </span>
                    <span className="text-xs font-medium text-slate-300 bg-slate-950/85 backdrop-blur-md px-2.5 py-1 rounded-full border border-slate-700/70 shadow-sm">
                      {project.category}
                    </span>
                  </div>
                </div>

                <div className="p-7">
                  {/* Title & Overview */}
                  <h3 className="text-2xl font-bold text-white tracking-tight group-hover:text-blue-400 transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-slate-400 text-sm mt-3 leading-relaxed">
                    {project.description}
                  </p>

                  {/* Architecture Highlights */}
                  <div className="mt-5 pt-5 border-t border-slate-800/80 space-y-3">
                    <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Architecture Highlights:
                    </p>
                    <ul className="space-y-2">
                      {project.highlights.map((item, hIdx) => (
                        <li key={hIdx} className="flex items-start gap-2 text-xs text-slate-400">
                          <FiCheckCircle className="text-blue-400 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Technologies Footer */}
              <div className="px-7 pb-7 pt-4 border-t border-slate-800/60 bg-slate-950/40 flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap gap-1.5">
                  {project.tech.map((t, tIdx) => (
                    <span
                      key={tIdx}
                      className="text-xs font-mono bg-slate-900 text-slate-300 px-2.5 py-1 rounded-md border border-slate-800"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={onOpenQuote}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors cursor-pointer group-hover:translate-x-0.5"
                >
                  <span>Scope Similar Project</span>
                  <FiArrowRight />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Portfolio;