const Services = () => {
  const services = [
    {
      number: "01",
      title: "Website Development",
      description:
        "Modern, responsive business websites designed to build your online presence and attract more customers.",
    },
    {
      number: "02",
      title: "Web Applications",
      description:
        "Custom web applications built with modern frontend and backend technologies for your business.",
    },
    {
      number: "03",
      title: "Data Analytics",
      description:
        "Data analysis, dashboards, and visualizations that turn your business data into useful insights.",
    },
    {
      number: "04",
      title: "Custom Solutions",
      description:
        "Customized digital solutions designed around your specific business requirements.",
    },
  ];

  return (
    <section
      id="services"
      className="relative py-24 bg-slate-950 overflow-hidden"
    >
      {/* Background Glow */}
      <div className="absolute top-20 right-0 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 max-w-6xl mx-auto px-6">

        {/* Heading */}
        <div className="max-w-3xl">

          <p className="text-blue-500 font-semibold uppercase tracking-[0.25em] text-sm">
            Our Services
          </p>

          <h2 className="text-4xl md:text-5xl font-bold text-white mt-4">
            What We{" "}
            <span className="text-blue-500">
              Build
            </span>
          </h2>

          <p className="text-slate-400 text-lg mt-5 leading-relaxed">
            We create modern digital solutions that help businesses
            establish their online presence, improve operations, and grow.
          </p>

        </div>

        {/* Services */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">

          {services.map((service) => (
            <div
              key={service.number}
              className="group relative bg-slate-900 border border-slate-800 rounded-2xl p-8 hover:border-blue-500/60 hover:-translate-y-2 transition-all duration-300"
            >

              {/* Number */}
              <div className="flex items-center justify-between">

                <span className="text-blue-500 font-bold text-lg">
                  {service.number}
                </span>

                <span className="text-slate-700 group-hover:text-blue-500 text-2xl transition">
                  ↗
                </span>

              </div>

              {/* Title */}
              <h3 className="text-2xl font-bold text-white mt-8 group-hover:text-blue-400 transition">
                {service.title}
              </h3>

              {/* Description */}
              <p className="text-slate-400 mt-4 leading-relaxed">
                {service.description}
              </p>

              {/* Bottom Line */}
              <div className="mt-8 h-px bg-slate-800 group-hover:bg-blue-500/50 transition"></div>

              <p className="text-sm text-slate-500 mt-4 group-hover:text-slate-300 transition">
                Learn more →
              </p>

            </div>
          ))}

        </div>

      </div>
    </section>
  );
};

export default Services;