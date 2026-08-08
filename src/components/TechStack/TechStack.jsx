const TechStack = () => {
  const technologies = [
    {
      name: "React",
      description: "Modern frontend development",
    },
    {
      name: "Node.js",
      description: "Fast backend applications",
    },
    {
      name: "JavaScript",
      description: "Interactive web experiences",
    },
    {
      name: "MySQL",
      description: "Reliable database solutions",
    },
    {
      name: "Python",
      description: "Data and automation",
    },
    {
      name: "Tailwind CSS",
      description: "Modern responsive interfaces",
    },
    {
      name: "Git & GitHub",
      description: "Version control and collaboration",
    },
    {
      name: "Power BI",
      description: "Business intelligence dashboards",
    },
  ];

  return (
    <section
      id="tech-stack"
      className="relative py-24 bg-slate-900 overflow-hidden"
    >
      {/* Background Glow */}
      <div className="absolute left-1/2 top-0 -translate-x-1/2 w-96 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 max-w-6xl mx-auto px-6">

        {/* Heading */}
        <div className="text-center max-w-3xl mx-auto">

          <p className="text-blue-500 font-semibold uppercase tracking-[0.25em] text-sm">
            Technology
          </p>

          <h2 className="text-4xl md:text-5xl font-bold text-white mt-4">
            Built With{" "}
            <span className="text-blue-500">
              Modern Technology
            </span>
          </h2>

          <p className="text-slate-400 text-lg mt-5 leading-relaxed">
            We use modern and reliable technologies to build fast,
            scalable, and maintainable digital solutions.
          </p>

        </div>

        {/* Technologies */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-12">

          {technologies.map((technology) => (
            <div
              key={technology.name}
              className="group bg-slate-950 border border-slate-800 rounded-2xl p-6 text-center hover:border-blue-500/60 hover:-translate-y-2 transition-all duration-300"
            >

              {/* Icon */}
              <div className="mx-auto w-14 h-14 flex items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 group-hover:bg-blue-500/20 transition">
                <span className="text-blue-500 font-bold text-lg">
                  {technology.name.charAt(0)}
                </span>
              </div>

              <h3 className="text-xl font-bold text-white mt-5 group-hover:text-blue-400 transition">
                {technology.name}
              </h3>

              <p className="text-slate-500 text-sm mt-2">
                {technology.description}
              </p>

            </div>
          ))}

        </div>

      </div>
    </section>
  );
};

export default TechStack;