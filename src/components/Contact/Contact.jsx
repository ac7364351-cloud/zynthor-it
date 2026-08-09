import { useState } from "react";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setSubmitted(false);

    try {
const response = await fetch(
  "https://zynthor-it-production.up.railway.app/api/contact",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  }
);

      const data = await response.json();

      if (data.success) {
        setSubmitted(true);

        setFormData({
          name: "",
          email: "",
          message: "",
        });
      } else {
        alert(data.message || "Something went wrong.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="contact"
      className="relative py-24 bg-slate-900 overflow-hidden"
    >
      {/* Background Glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6">

        {/* Heading */}
        <div className="max-w-3xl">
          <p className="text-blue-500 font-semibold uppercase tracking-[0.25em] text-sm">
            Contact Us
          </p>

          <h2 className="text-4xl md:text-5xl font-bold text-white mt-4">
            Let's Build Something{" "}
            <span className="text-blue-500">Great</span>
          </h2>

          <p className="text-slate-400 text-lg mt-5 leading-relaxed">
            Have a project or idea in mind? Send us a message and let's
            discuss how we can help.
          </p>
        </div>

        {/* Contact Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-12">

          {/* Left */}
          <div className="space-y-6">

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-7">
              <h3 className="text-xl font-bold text-white">
                Start a Project
              </h3>

              <p className="text-slate-400 mt-3 leading-relaxed">
                Tell us about your business, project, or idea. We'll get
                back to you as soon as possible.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-7">
              <p className="text-blue-500 font-semibold">
                What we can help with
              </p>

              <ul className="mt-4 space-y-3 text-slate-400">
                <li>✓ Business Websites</li>
                <li>✓ Web Applications</li>
                <li>✓ E-Commerce Websites</li>
                <li>✓ Data Analytics</li>
                <li>✓ Custom Digital Solutions</li>
              </ul>
            </div>

          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="bg-slate-950 border border-slate-800 rounded-2xl p-8"
          >

            {/* Name */}
            <div>
              <label className="block text-slate-300 mb-2">
                Name
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your name"
                required
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-3 outline-none focus:border-blue-500 transition"
              />
            </div>

            {/* Email */}
            <div className="mt-5">
              <label className="block text-slate-300 mb-2">
                Email
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-3 outline-none focus:border-blue-500 transition"
              />
            </div>

            {/* Message */}
            <div className="mt-5">
              <label className="block text-slate-300 mb-2">
                Message
              </label>

              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Tell us about your project..."
                rows="6"
                required
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-3 outline-none focus:border-blue-500 transition resize-none"
              />

            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white py-3 rounded-lg font-semibold transition"
            >
              {loading ? "Sending..." : "Send Message →"}
            </button>

            {/* Success */}
            {submitted && (
              <div className="mt-5 bg-green-500/10 border border-green-500/30 text-green-400 rounded-lg p-4 text-center">
                Message sent successfully! We'll get back to you soon.
              </div>
            )}

          </form>

        </div>
      </div>
    </section>
  );
};

export default Contact;