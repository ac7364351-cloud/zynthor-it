const Portfolio = () => {
  const projects = [
    {
      number: "01",
      title: "E-Commerce Platform",
      description:
        "A modern online shopping platform with product management, responsive design, and a smooth user experience.",
      tech: "React • Node.js • MySQL",
    },
    {
      number: "02",
      title: "Job Portal",
      description:
        "A full-stack job portal connecting candidates and companies with registration, login, and job management.",
      tech: "React • Node.js • MySQL",
    },
    {
      number: "03",
      title: "Data Analytics Dashboard",
      description:
        "Interactive business dashboards that transform raw data into clear visual insights and reports.",
      tech: "Python • Pandas • Power BI",
    },
    {
      number: "04",
      title: "Business Website",
      description:
        "A professional digital presence for businesses with responsive layouts, modern design, and contact functionality.",
      tech: "React • Tailwind CSS",
    },
  ];

  return (
    <section
      id="portfolio"
      className="relative py-24 bg-slate-900 overflow-hidden"
    >
      {/* Background Glow */}
      <div className="absolute left-0 top-20 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 max-w-6xl mx-auto px-6">

        {/* Heading */}
        <div className="max-w-3xl">

          <p className="text-blue-500 font-semibold uppercase tracking-[0.25em] text-sm">
            Our Work
          </p>

          <h2 className="text-4xl md:text-5xl font-bold text-white mt-4">
            Projects That{" "}
            <span className="text-blue-500">
              Deliver
            </span>
          </h2>

          <p className="text-slate-400 text-lg mt-5 leading-relaxed">
            A selection of digital projects built using modern
            technologies and practical solutions.
          </p>

        </div>

        {/* Projects */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">

          {projects.map((project) => (
            <div
              key={project.number}
              className="group bg-slate-950 border border-slate-800 rounded-2xl p-8 hover:border-blue-500/60 hover:-translate-y-2 transition-all duration-300"
            >

              {/* Top */}
              <div className="flex items-center justify-between">

                <span className="text-blue-500 font-bold text-lg">
                  {project.number}
                </span>

                <span className="text-2xl text-slate-700 group-hover:text-blue-500 transition">
                  ↗
                </span>

              </div>

              {/* Project Title */}
              <h3 className="text-2xl font-bold text-white mt-8 group-hover:text-blue-400 transition">
                {project.title}
              </h3>

              {/* Description */}
              <p className="text-slate-400 mt-4 leading-relaxed">
                {project.description}
              </p>

              {/* Technology */}
              <div className="mt-8 pt-5 border-t border-slate-800">

                <p className="text-sm text-blue-400">
                  {project.tech}
                </p>

              </div>

            </div>
          ))}

        </div>

        {/* CTA */}
        <div className="text-center mt-14">

          <p className="text-slate-400">
            Have a project in mind?
          </p>

          <a
            href="#contact"
            className="inline-block mt-4 bg-blue-600 hover:bg-blue-500 text-white px-7 py-3 rounded-lg font-semibold transition"
          >
            Start a Project →
          </a>

        </div>

      </div>
    </section>
  );
};

export default Portfolio;