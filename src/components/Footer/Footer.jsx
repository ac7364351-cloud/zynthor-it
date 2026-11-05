import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiClock, FiArrowRight } from "react-icons/fi";
import Logo from "../Brand/Logo.jsx";

const Footer = ({ onOpenQuote }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === "/" || location.pathname === "";

  const handleQuoteClick = (e) => {
    e.preventDefault();
    if (isHome) {
      if (onOpenQuote) {
        onOpenQuote();
      } else {
        const formElem = document.getElementById("contact-form") || document.getElementById("contact");
        if (formElem) {
          formElem.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    } else {
      navigate("/#contact-form");
    }
  };

  return (
    <footer className="bg-slate-950 border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Company Bio & New Geometric Logo */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="group cursor-pointer inline-block" aria-label="Zynthor IT Home">
              <Logo size="md" />
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              An independent digital engineering studio specializing in high-performance business websites, 
              custom full-stack web applications, and data analytics solutions.
            </p>
            <div className="pt-2 text-xs text-slate-500 space-y-1">
              <p className="flex items-center gap-2">
                <FiClock className="text-blue-400 text-sm" />
                <span>Response SLA: Within 2 to 4 business hours via Contact form</span>
              </p>
            </div>
          </div>

          {/* Core Services */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Services
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link to="/services" className="hover:text-blue-400 transition-colors">
                  Landing Pages (from ₹1,499)
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-blue-400 transition-colors">
                  Basic Websites (from ₹2,999)
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-blue-400 transition-colors">
                  Standard Websites (from ₹4,999)
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-blue-400 transition-colors">
                  Power BI Dashboards (from ₹1,999)
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-blue-400 transition-colors">
                  Custom Web Apps (from ₹7,999)
                </Link>
              </li>
            </ul>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link to="/" className="hover:text-blue-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-blue-400 transition-colors">
                  Services
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-blue-400 transition-colors">
                  Pricing (from ₹1,499)
                </Link>
              </li>
              <li>
                <Link to="/portfolio" className="hover:text-blue-400 transition-colors">
                  Case Studies
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-blue-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-blue-400 transition-colors">
                  Contact Form
                </Link>
              </li>
            </ul>
          </div>

          {/* Project Inquiry CTA */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Get Started
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Ready to start your project? Submit your requirements or send a message directly in the Contact section.
            </p>
            <button
              type="button"
              onClick={handleQuoteClick}
              className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-blue-600/20 cursor-pointer uppercase tracking-wider"
            >
              <span>Go to Contact Form</span>
              <FiArrowRight />
            </button>
          </div>
        </div>

        {/* Bottom Copyright & Disclaimer (No phone numbers or emails) */}
        <div className="border-t border-slate-800/80 mt-14 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Zynthor IT. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <span>Production-Grade Engineering</span>
            <span>•</span>
            <span>100% Source Code Ownership</span>
            <span>•</span>
            <span>Milestone Pricing in INR (₹)</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;