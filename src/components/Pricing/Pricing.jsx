import { motion, useReducedMotion } from "framer-motion";
import { FiCheck, FiArrowRight, FiInfo } from "react-icons/fi";

// The 3 primary website packages (aligned cleanly in the primary 3-column grid)
const websitePackages = [
  {
    id: "landing-page",
    name: "Landing Page Development",
    startingPrice: "₹1,499 onwards",
    tagline: "High-impact single-page website for product marketing, campaigns, and lead generation.",
    badge: "Introductory Package",
    isPopular: false,
    pages: "Single Page",
    deliverables: [
      "Single-page responsive layout for mobile, tablet & desktop",
      "Engaging Hero section with headline and action buttons",
      "Business overview & services presentation",
      "Direct contact section with working enquiry form",
      "Basic on-page SEO setup & meta tags",
    ],
  },
  {
    id: "basic-business",
    name: "Basic Business Website",
    startingPrice: "₹2,999 onwards",
    tagline: "Best choice for startups, consultancies, professional services, clinics, and businesses.",
    badge: "⭐ Best for Small Businesses",
    isPopular: true,
    pages: "Up to 5 Pages",
    deliverables: [
      "Up to 5 pages (Home, About Us, Services, Contact, + 1 custom page)",
      "Clean, modern mobile-responsive design for all viewports",
      "Working enquiry contact form saving to backend database",
      "Fast page load optimization & clean code structure",
      "Basic on-page SEO setup & search engine readiness",
    ],
  },
  {
    id: "standard-business",
    name: "Standard Business Website",
    startingPrice: "₹4,999 onwards",
    tagline: "For growing businesses needing a multi-page presence with custom photo galleries or portfolios.",
    badge: "Comprehensive",
    isPopular: false,
    pages: "Up to 7 Pages",
    deliverables: [
      "Up to 7 custom pages tailored to your brand identity",
      "Custom layout with interactive UI components",
      "Photo gallery or client portfolio showcase section",
      "Working enquiry form with client-side & server validation",
      "Basic on-page SEO setup & speed optimization",
    ],
  },
];

// Specialized enterprise solutions
const specializedPackages = [
  {
    id: "data-analytics",
    name: "Power BI Dashboard",
    startingPrice: "₹1,999 onwards",
    tagline: "Convert raw Excel or CSV sales records into clear, interactive business intelligence reports.",
    badge: "Data Intelligence",
    pages: "Interactive Dashboard",
    deliverables: [
      "Excel / CSV spreadsheet data cleaning & formatting",
      "Basic Power BI business intelligence dashboard",
      "Visual KPI metrics, charts & category performance breakdown",
      "Scope customized based on dataset volume & business metrics",
    ],
  },
  {
    id: "custom-app",
    name: "Custom Web Application",
    startingPrice: "₹7,999 onwards",
    tagline: "Custom full-stack web software, internal tools, and client portals built for your workflows.",
    badge: "Full-Stack System",
    pages: "Custom Scalable Scope",
    deliverables: [
      "Custom business workflow logic tailored to your exact needs",
      "Secure forms, records management & persistent MySQL database",
      "Dedicated admin management interface where required",
      "Built with modern React 19, Node.js & Express REST APIs",
    ],
  },
];

const Pricing = ({ onSelectPackage }) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      id="pricing"
      className="scroll-mt-24 md:scroll-mt-28 relative py-24 bg-slate-950 border-t border-slate-900 overflow-hidden"
    >
      {/* Background Lighting */}
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

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
            Affordable Packages
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mt-4 tracking-tight">
            Transparent Pricing for{" "}
            <span className="text-blue-500">Your Business</span>
          </h2>
          <p className="text-slate-400 text-base md:text-lg mt-4 leading-relaxed">
            Affordable, high-performance website packages tailored for startups and growing businesses. 
            Equal deliverables with zero hidden costs.
          </p>
        </motion.div>

        {/* Primary 3 Website Cards Grid - Consistent Top Alignment and Equal Gaps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mt-14 items-stretch">
          {websitePackages.map((pkg, idx) => {
            return (
              <motion.div
                key={pkg.id}
                className={`relative rounded-2xl p-7 flex flex-col justify-between transition-all duration-300 ${
                  pkg.isPopular
                    ? "bg-slate-900/90 border-2 border-blue-500 shadow-xl shadow-blue-500/10"
                    : "bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/80"
                }`}
                initial={{ opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.45, delay: idx * 0.08 }}
              >
                <div>
                  {/* Top Badge and Page Count (Collision-proof layout) */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                    <span
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border shrink-0 ${
                        pkg.isPopular
                          ? "bg-blue-600 text-white border-blue-400 shadow-sm"
                          : "bg-slate-800/90 text-blue-400 border-slate-700"
                      }`}
                    >
                      {pkg.badge}
                    </span>
                    <span className="text-xs text-slate-400 font-mono font-medium shrink-0">
                      {pkg.pages}
                    </span>
                  </div>

                  {/* Name & Tagline */}
                  <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    {pkg.name}
                  </h3>
                  <p className="text-slate-400 text-xs sm:text-sm mt-2 leading-relaxed min-h-[40px]">
                    {pkg.tagline}
                  </p>

                  {/* Starting Price Block */}
                  <div className="mt-5 pt-5 border-t border-slate-800/80">
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block">
                      Starting Investment
                    </span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-2xl sm:text-3xl font-extrabold text-white">
                        {pkg.startingPrice}
                      </span>
                    </div>
                  </div>

                  {/* Deliverables List */}
                  <div className="mt-5 space-y-2.5">
                    <p className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                      Included Deliverables:
                    </p>
                    <ul className="space-y-2">
                      {pkg.deliverables.map((item, dIdx) => (
                        <li key={dIdx} className="flex items-start gap-2 text-xs text-slate-300">
                          <FiCheck className="text-blue-400 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Card Action Button */}
                <div className="mt-7 pt-5 border-t border-slate-800/60">
                  <button
                    type="button"
                    onClick={() => onSelectPackage && onSelectPackage(pkg.name)}
                    className={`w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                      pkg.isPopular
                        ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 hover:-translate-y-0.5"
                        : "bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 hover:text-white"
                    }`}
                  >
                    <span>Choose This Package</span>
                    <FiArrowRight className="text-sm" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Specialized Solutions Sub-Grid */}
        <div className="mt-12">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-white tracking-tight">
              Specialized Engineering & Analytics Solutions
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Custom applications and business intelligence reporting for deeper technical needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 items-stretch">
            {specializedPackages.map((pkg, idx) => (
              <motion.div
                key={pkg.id}
                className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-7 flex flex-col justify-between hover:border-slate-700 transition-all duration-300"
                initial={{ opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.45, delay: idx * 0.08 }}
              >
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full border bg-slate-800/90 text-blue-400 border-slate-700 shrink-0">
                      {pkg.badge}
                    </span>
                    <span className="text-xs text-slate-400 font-mono font-medium shrink-0">
                      {pkg.pages}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white tracking-tight">
                    {pkg.name}
                  </h3>
                  <p className="text-slate-400 text-xs sm:text-sm mt-2 leading-relaxed min-h-[40px]">
                    {pkg.tagline}
                  </p>

                  <div className="mt-5 pt-5 border-t border-slate-800/80">
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block">
                      Starting Investment
                    </span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-2xl font-extrabold text-white">
                        {pkg.startingPrice}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 space-y-2">
                    <p className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                      Included Deliverables:
                    </p>
                    <ul className="space-y-1.5">
                      {pkg.deliverables.map((item, dIdx) => (
                        <li key={dIdx} className="flex items-start gap-2 text-xs text-slate-300">
                          <FiCheck className="text-blue-400 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-7 pt-5 border-t border-slate-800/60">
                  <button
                    type="button"
                    onClick={() => onSelectPackage && onSelectPackage(pkg.name)}
                    className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-xs uppercase tracking-wider bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 hover:text-white transition-all cursor-pointer"
                  >
                    <span>Request Scope & Quote</span>
                    <FiArrowRight className="text-sm" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Transparent Terms Notice Box */}
        <div className="mt-12 p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 flex items-start gap-3.5 text-xs text-slate-400 leading-relaxed max-w-4xl mx-auto">
          <FiInfo className="text-blue-400 text-lg shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-200 block mb-1">
              Transparent Project Terms:
            </span>
            All packages are priced in Indian Rupees (₹) for design and development scope. Domain name registration, 
            cloud hosting infrastructure, and any third-party paid API subscriptions are billed directly by their providers, 
            ensuring you maintain 100% full ownership without vendor lock-in.
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
