const CTA = () => {
  return (
    <section className="py-20 bg-slate-900 text-white">
      <div className="max-w-6xl mx-auto px-6">

        <div className="relative overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-600/20 via-slate-900 to-slate-950 p-10 md:p-16">

          {/* Background glow */}
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-600/20 rounded-full blur-3xl" />

          <div className="relative flex flex-col lg:flex-row items-center justify-between gap-10">

            {/* Text */}
            <div className="max-w-2xl">

              <p className="text-blue-400 font-semibold uppercase tracking-widest">
                Let's Build Something
              </p>

              <h2 className="text-4xl md:text-5xl font-bold mt-4 leading-tight">
                Have a Project
                <span className="text-blue-500"> in Mind?</span>
              </h2>

              <p className="text-slate-400 text-lg mt-5 leading-relaxed">
                Tell us about your idea and we'll help turn it into a
                modern digital solution for your business.
              </p>

            </div>

            {/* Button */}
            <div className="shrink-0">

              <a
                href="#contact"
                className="inline-block px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-semibold transition shadow-lg shadow-blue-600/20"
              >
                Start Your Project →
              </a>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

export default CTA;