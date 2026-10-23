import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiMenu, FiX, FiArrowRight } from "react-icons/fi";
import Logo from "../Brand/Logo.jsx";

const Navbar = ({ onOpenQuote }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === "/" || location.pathname === "";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const handleQuoteClick = (e) => {
    e.preventDefault();
    closeMenu();

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
      // Navigate to homepage contact form or contact page
      navigate("/#contact-form");
    }
  };

  // Nav link helper to handle both anchor scrolling on Home and route navigation across pages
  const handleAnchorClick = (e, targetId) => {
    closeMenu();
    if (isHome) {
      e.preventDefault();
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  const navLinks = [
    { label: "Home", href: "/", anchor: "home", isPage: true },
    { label: "Services", href: "/services", anchor: "services" },
    { label: "Pricing", href: "/pricing", anchor: "pricing" },
    { label: "Process", href: "/#process", anchor: "process" },
    { label: "Portfolio", href: "/portfolio", anchor: "portfolio" },
    { label: "About", href: "/about", anchor: "about" },
    { label: "FAQ", href: "/#faq", anchor: "faq" },
    { label: "Contact", href: "/contact", anchor: "contact" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 shadow-lg shadow-black/30"
          : "bg-slate-950/80 backdrop-blur-sm border-b border-slate-800/40"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo with New Geometric Circuit Identity */}
          <Link
            to="/"
            onClick={(e) => {
              closeMenu();
              if (isHome) {
                e.preventDefault();
                window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
              }
            }}
            className="group cursor-pointer"
            aria-label="Zynthor IT Homepage"
          >
            <Logo size="md" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href;
              return isHome ? (
                <a
                  key={link.label}
                  href={`#${link.anchor}`}
                  onClick={(e) => handleAnchorClick(e, link.anchor)}
                  className="text-slate-300 hover:text-blue-400 transition-colors py-2 text-xs uppercase tracking-wider font-semibold"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.label}
                  to={link.href}
                  onClick={closeMenu}
                  className={`transition-colors py-2 text-xs uppercase tracking-wider font-semibold ${
                    isActive ? "text-blue-400 font-bold" : "text-slate-300 hover:text-blue-400"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Action Button: Dedicated Quote trigger */}
          <div className="hidden md:flex items-center gap-3">
            <button
              type="button"
              onClick={handleQuoteClick}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-all shadow-md shadow-blue-600/20 hover:shadow-blue-600/30 hover:-translate-y-0.5 cursor-pointer uppercase tracking-wider"
              aria-label="Get a Project Quote"
            >
              <span>Get a Quote</span>
              <FiArrowRight className="text-sm" />
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <FiX className="text-2xl" /> : <FiMenu className="text-2xl" />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {menuOpen && (
          <div className="lg:hidden border-t border-slate-800/80 py-5 bg-slate-950/98 backdrop-blur-xl">
            <div className="flex flex-col gap-1 text-sm">
              {navLinks.map((link) => {
                return isHome ? (
                  <a
                    key={link.label}
                    href={`#${link.anchor}`}
                    onClick={(e) => handleAnchorClick(e, link.anchor)}
                    className="px-4 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-900 transition-colors font-medium text-xs uppercase tracking-wider"
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.label}
                    to={link.href}
                    onClick={closeMenu}
                    className={`px-4 py-2.5 rounded-lg font-medium transition-colors text-xs uppercase tracking-wider ${
                      location.pathname === link.href
                        ? "text-blue-400 bg-slate-900 font-bold"
                        : "text-slate-300 hover:text-white hover:bg-slate-900"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}

              <div className="pt-4 mt-2 border-t border-slate-800/80 px-4">
                <button
                  type="button"
                  onClick={handleQuoteClick}
                  className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl text-xs uppercase tracking-wider shadow-md cursor-pointer"
                >
                  <span>Request Project Quote</span>
                  <FiArrowRight />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;