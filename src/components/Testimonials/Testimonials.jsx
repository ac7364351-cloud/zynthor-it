const testimonials = [
  {
    name: "Rahul Sharma",
    role: "Startup Founder",
    text: "Zynthor IT helped us turn our idea into a clean and professional web application.",
  },
  {
    name: "Priya Singh",
    role: "Business Owner",
    text: "The website was modern, responsive, and exactly what we needed for our business.",
  },
  {
    name: "Amit Verma",
    role: "Entrepreneur",
    text: "The analytics dashboard made it much easier for us to understand our business data.",
  },
];

const Testimonials = () => {
  return (
    <section className="py-24 bg-slate-900 text-white">
      <div className="max-w-6xl mx-auto px-6">

        {/* Heading */}
        <div className="text-center mb-14">
          <p className="text-blue-500 font-semibold uppercase tracking-widest">
            Testimonials
          </p>

          <h2 className="text-4xl md:text-5xl font-bold mt-4">
            What Clients Say
          </h2>

          <p className="text-slate-400 text-lg mt-5 max-w-2xl mx-auto">
            We focus on building digital solutions that create real value
            for businesses.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="bg-slate-950 border border-slate-800 rounded-2xl p-8 hover:border-blue-500 transition"
            >

              <div className="text-blue-500 text-3xl">
                "
              </div>

              <p className="text-slate-300 mt-4 leading-relaxed">
                {testimonial.text}
              </p>

              <div className="border-t border-slate-800 mt-7 pt-5">
                <h3 className="font-semibold">
                  {testimonial.name}
                </h3>

                <p className="text-slate-500 text-sm mt-1">
                  {testimonial.role}
                </p>
              </div>

            </div>
          ))}

        </div>

      </div>
    </section>
  );
};

export default Testimonials;