const Hero = () => {
  return (
    <section
      id="home"
      className="relative min-h-screen bg-slate-950 flex items-center pt-28 pb-20 overflow-hidden"
    >
      {/* Background Glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-blue-600/20 rounded-full blur-3xl"></div>

        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 w-full">
        <div className="max-w-4xl">

          {/* Small Heading */}
          <p className="text-blue-500 font-semibold uppercase tracking-[0.3em] text-sm mb-6">
            Digital Solutions
          </p>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
            Innovating the{" "}
            <span className="text-blue-500">
              Digital Future
            </span>
          </h1>

          {/* Description */}
          <p className="text-slate-400 text-lg md:text-xl mt-7 max-w-2xl leading-relaxed">
            We build modern websites, powerful web applications,
            and data-driven digital solutions that help businesses
            grow and succeed online.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-10">

            <a
              href="#contact"
              className="bg-blue-600 hover:bg-blue-500 text-white px-7 py-4 rounded-lg font-semibold text-center transition"
            >
              Get Started →
            </a>

            <a
              href="#portfolio"
              className="border border-slate-700 hover:border-blue-500 text-white px-7 py-4 rounded-lg font-semibold text-center transition"
            >
              View Our Work
            </a>

          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 pt-10 border-t border-slate-800">

            <div>
              <h3 className="text-3xl font-bold text-white">
                10+
              </h3>

              <p className="text-slate-500 mt-2">
                Projects
              </p>
            </div>

            <div>
              <h3 className="text-3xl font-bold text-white">
                5+
              </h3>

              <p className="text-slate-500 mt-2">
                Technologies
              </p>
            </div>

            <div>
              <h3 className="text-3xl font-bold text-white">
                100%
              </h3>

              <p className="text-slate-500 mt-2">
                Responsive
              </p>
            </div>

            <div>
              <h3 className="text-3xl font-bold text-white">
                24/7
              </h3>

              <p className="text-slate-500 mt-2">
                Support
              </p>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;