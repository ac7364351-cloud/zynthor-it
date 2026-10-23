import { motion, useReducedMotion } from "framer-motion";
import { FiGlobe, FiServer, FiCpu, FiBarChart2, FiCheck, FiArrowRight } from "react-icons/fi";
import servicesWebDevImg from "../../assets/images/services-web-dev.jpg";
import servicesWebAppImg from "../../assets/images/services-web-app.jpg";
import servicesAutomationImg from "../../assets/images/services-automation.jpg";
import servicesAnalyticsImg from "../../assets/images/services-analytics.jpg";

const services = [
  {
    id: "web-dev",
    icon: FiGlobe,
    badge: "Core Service",
    priceEstimate: "From ₹1,499 onwards",
    title: "Custom Website Development",
    image: servicesWebDevImg,
    description:
      "Modern, fast business websites engineered to reflect your brand identity, present your offerings with clarity, and convert visitors into active clients.",
    deliverables: [
      "Mobile-responsive, modern UI/UX design across all viewports",
      "Vite & React modern single-page or multi-page architecture",
      "Search Engine Optimization (SEO) & Core Web Vitals compliance",
      "Custom contact inquiry capture with backend database storage",
    ],
    tech: "React • Tailwind CSS • Vite • JavaScript",
  },
  {
    id: "web-apps",
    icon: FiServer,
    badge: "Full-Stack",
    priceEstimate: "From ₹7,999 onwards",
    title: "Web Applications & Portals",
    image: servicesWebAppImg,
    description:
      "Scalable custom web applications built for business workflows, customer portals, internal management tools, and multi-user digital platforms.",
    deliverables: [
      "Role-based authentication & secure session handling",
      "RESTful API architectures & relational MySQL schema",
      "Interactive data grids, search filters, and dynamic forms",
      "Production deployment with persistent relational storage",
    ],
    tech: "React • Node.js • Express • MySQL",
  },
  {
    id: "automation",
    icon: FiCpu,
    badge: "Operations",
    priceEstimate: "From ₹4,999 onwards",
    title: "Business Automation & APIs",
    image: servicesAutomationImg,
    description:
      "Automate manual operations and integrate disconnected systems using custom API endpoints, webhook processors, and secure third-party connectors.",
    deliverables: [
      "Custom RESTful APIs & middleware engineering",
      "Payment gateway integration (Stripe, Razorpay)",
      "Automated email notifications & alert pipelines",
      "Secure data synchronization & database migrations",
    ],
    tech: "Node.js • Express • REST APIs • Webhooks",
  },
  {
    id: "analytics",
    icon: FiBarChart2,
    badge: "Data Intelligence",
    priceEstimate: "From ₹1,999 onwards",
    title: "Power BI & Data Analytics",
    image: servicesAnalyticsImg,
    description:
      "Transform disorganized spreadsheets and raw transactional records into clean, interactive visual dashboards that reveal actionable business insights.",
    deliverables: [
      "Excel / CSV data cleaning, validation & modeling",
      "Custom KPI tracking & visual executive analytics",
      "Interactive time-series charts, breakdowns & drill-downs",
      "Automated summary reporting & metric export pipelines",
    ],
    tech: "Python • Pandas • Power BI • MySQL",
  },
];

const Services = ({ onSelectService }) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section id="services" className="relative py-28 bg-slate-950 overflow-hidden border-t border-slate-900">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

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
            What We Deliver
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mt-4 tracking-tight">
            Comprehensive Digital Services with{" "}
            <span className="text-blue-500">Transparent Pricing</span>
          </h2>
          <p className="text-slate-400 text-base md:text-lg mt-5 leading-relaxed">
            Every solution is custom-architected around your exact business requirements. 
            All starting prices are transparent in Indian Rupees (₹) with milestone-driven payments.
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16">
          {services.map((service, idx) => {
            const IconComponent = service.icon;
            return (
              <motion.div
                key={service.id}
                className="group relative bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden hover:border-blue-500/50 hover:bg-slate-900/90 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 flex flex-col justify-between shadow-sm"
                initial={{ opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.5, delay: idx * 0.1 }}
              >
                <div>
                  {/* Photo Header with Real Workstation / Tech Visual */}
                  <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-950 border-b border-slate-800/80">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out filter brightness-95"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />

                    {/* Floating Chip Overlay */}
                    <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-slate-950/85 backdrop-blur-md border border-slate-700/80 flex items-center justify-center text-blue-400 shadow-md">
                        <IconComponent className="text-xl" />
                      </div>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-300 bg-slate-950/85 backdrop-blur-md px-3 py-1 rounded-full border border-slate-700/70 shadow-sm">
                        {service.badge}
                      </span>
                    </div>

                    <div className="absolute bottom-3 right-4">
                      <span className="text-xs font-bold text-blue-300 bg-blue-950/90 backdrop-blur-md border border-blue-500/40 px-3 py-1 rounded-lg shadow-sm">
                        {service.priceEstimate}
                      </span>
                    </div>
                  </div>

                  <div className="p-7">
                    {/* Title */}
                    <h3 className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">
                      {service.title}
                    </h3>

                    <p className="text-slate-400 text-sm md:text-base mt-3 leading-relaxed">
                      {service.description}
                    </p>

                    {/* Deliverables List */}
                    <div className="mt-6 pt-6 border-t border-slate-800/80">
                      <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
                        Key Deliverables:
                      </p>
                      <ul className="space-y-2">
                        {service.deliverables.map((item, dIdx) => (
                          <li key={dIdx} className="flex items-start gap-2.5 text-xs text-slate-400">
                            <FiCheck className="text-blue-400 shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Footer with Tech & Action Button */}
                <div className="px-7 pb-7 pt-4 border-t border-slate-800/60 bg-slate-950/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="text-xs font-mono text-slate-400">
                    {service.tech}
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectService && onSelectService(service.title)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors cursor-pointer group-hover:translate-x-0.5"
                  >
                    <span>Request Scope & Quote</span>
                    <FiArrowRight />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Services;