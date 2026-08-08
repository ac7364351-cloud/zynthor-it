const Footer = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800">

      <div className="max-w-6xl mx-auto px-6 py-16">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* Company */}
          <div>
            <h2 className="text-2xl font-bold text-white">
              Zynthor<span className="text-blue-500"> IT</span>
            </h2>

            <p className="text-slate-400 mt-4 leading-relaxed max-w-sm">
              Building modern websites, web applications, and
              data-driven digital solutions for growing businesses.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-lg">
              Quick Links
            </h3>

            <div className="flex flex-col gap-3 mt-5">

              <a
                href="#home"
                className="text-slate-400 hover:text-blue-400 transition"
              >
                Home
              </a>

              <a
                href="#services"
                className="text-slate-400 hover:text-blue-400 transition"
              >
                Services
              </a>

              <a
                href="#about"
                className="text-slate-400 hover:text-blue-400 transition"
              >
                About
              </a>

              <a
                href="#portfolio"
                className="text-slate-400 hover:text-blue-400 transition"
              >
                Portfolio
              </a>

              <a
                href="#contact"
                className="text-slate-400 hover:text-blue-400 transition"
              >
                Contact
              </a>

            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold text-lg">
              Let's Work Together
            </h3>

            <p className="text-slate-400 mt-5">
              Have a project in mind?
            </p>

            <a
              href="#contact"
              className="inline-block mt-5 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              Start a Project →
            </a>
          </div>

        </div>

        {/* Bottom */}
        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between gap-4">

          <p className="text-slate-500 text-sm">
            © 2026 Zynthor IT. All rights reserved.
          </p>

          <p className="text-slate-600 text-sm">
            Digital Solutions • Web Development • Data Analytics
          </p>

        </div>

      </div>

    </footer>
  );
};

export default Footer;