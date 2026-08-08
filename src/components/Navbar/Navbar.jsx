import { useState } from "react";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-6xl mx-auto px-6">

        <div className="flex items-center justify-between h-20">

          {/* Logo */}
          <a
            href="#home"
            onClick={closeMenu}
            className="text-2xl font-bold text-white"
          >
            Zynthor <span className="text-blue-500">IT</span>
          </a>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">

            <a
              href="#home"
              className="text-slate-300 hover:text-blue-400 transition"
            >
              Home
            </a>

            <a
              href="#services"
              className="text-slate-300 hover:text-blue-400 transition"
            >
              Services
            </a>

            <a
              href="#portfolio"
              className="text-slate-300 hover:text-blue-400 transition"
            >
              Portfolio
            </a>

            <a
              href="#about"
              className="text-slate-300 hover:text-blue-400 transition"
            >
              About
            </a>

            <a
              href="#contact"
              className="text-slate-300 hover:text-blue-400 transition"
            >
              Contact
            </a>

            <a
              href="#contact"
              className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg font-semibold transition"
            >
              Get a Quote
            </a>

          </div>

          {/* Mobile Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-white text-3xl"
            aria-label="Toggle menu"
          >
            {menuOpen ? "✕" : "☰"}
          </button>

        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden pb-6">

            <div className="flex flex-col gap-2">

              <a
                href="#home"
                onClick={closeMenu}
                className="text-slate-300 hover:text-blue-400 py-3"
              >
                Home
              </a>

              <a
                href="#services"
                onClick={closeMenu}
                className="text-slate-300 hover:text-blue-400 py-3"
              >
                Services
              </a>

              <a
                href="#portfolio"
                onClick={closeMenu}
                className="text-slate-300 hover:text-blue-400 py-3"
              >
                Portfolio
              </a>

              <a
                href="#about"
                onClick={closeMenu}
                className="text-slate-300 hover:text-blue-400 py-3"
              >
                About
              </a>

              <a
                href="#contact"
                onClick={closeMenu}
                className="text-slate-300 hover:text-blue-400 py-3"
              >
                Contact
              </a>

              <a
                href="#contact"
                onClick={closeMenu}
                className="bg-blue-600 hover:bg-blue-500 text-white text-center px-5 py-3 rounded-lg font-semibold mt-2"
              >
                Get a Quote
              </a>

            </div>

          </div>
        )}

      </div>
    </nav>
  );
};

export default Navbar;