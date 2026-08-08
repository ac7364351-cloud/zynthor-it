const About = () => {
  return (
    <section
      id="about"
      className="relative py-24 bg-slate-950 overflow-hidden"
    >
      {/* Background Glow */}
      <div className="absolute right-0 top-20 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 max-w-6xl mx-auto px-6">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left Side */}
          <div>

            <p className="text-blue-500 font-semibold uppercase tracking-[0.25em] text-sm">
              About Zynthor IT
            </p>

            <h2 className="text-4xl md:text-5xl font-bold text-white mt-4 leading-tight">
              Building Digital
              <span className="text-blue-500"> Experiences</span>
            </h2>

            <p className="text-slate-400 text-lg mt-6 leading-relaxed">
              Zynthor IT is a digital solutions company focused on
              building modern websites, web applications, and
              data-driven solutions for businesses.
            </p>

            <p className="text-slate-400 mt-5 leading-relaxed">
              We combine modern technologies, clean design, and
              practical business solutions to help companies build
              a stronger digital presence.
            </p>

            <a
              href="#contact"
              className="inline-block mt-8 bg-blue-600 hover:bg-blue-500 text-white px-7 py-3 rounded-lg font-semibold transition"
            >
              Work With Us →
            </a>

          </div>

          {/* Right Side */}
          <div className="grid grid-cols-2 gap-5">

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-7 hover:border-blue-500/50 transition">
              <h3 className="text-3xl font-bold text-blue-500">
                Modern
              </h3>

              <p className="text-slate-400 mt-3">
                Modern technologies and development practices.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-7 hover:border-blue-500/50 transition">
              <h3 className="text-3xl font-bold text-blue-500">
                Scalable
              </h3>

              <p className="text-slate-400 mt-3">
                Solutions designed to grow with your business.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-7 hover:border-blue-500/50 transition">
              <h3 className="text-3xl font-bold text-blue-500">
                Reliable
              </h3>

              <p className="text-slate-400 mt-3">
                Clean and reliable digital solutions.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-7 hover:border-blue-500/50 transition">
              <h3 className="text-3xl font-bold text-blue-500">
                Focused
              </h3>

              <p className="text-slate-400 mt-3">
                Focused on real business requirements.
              </p>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

export default About;