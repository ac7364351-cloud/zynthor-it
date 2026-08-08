import { useState } from "react";

const faqs = [
  {
    question: "What services does Zynthor IT provide?",
    answer:
      "We provide website development, full-stack web applications, data analytics, dashboards, and custom digital solutions.",
  },
  {
    question: "How much does a website cost?",
    answer:
      "The cost depends on the project's requirements, features, design, and complexity. Contact us with your requirements and we can discuss the best solution.",
  },
  {
    question: "How long does it take to build a website?",
    answer:
      "A simple business website can usually be completed faster than a custom web application. The timeline depends on the project's scope and requirements.",
  },
  {
    question: "Can you build custom web applications?",
    answer:
      "Yes. We can build custom frontend and backend applications based on your business requirements.",
  },
  {
    question: "Do you provide data analytics services?",
    answer:
      "Yes. We can work with business data to create analysis, dashboards, visualizations, and useful insights.",
  },
  {
    question: "How can I start a project?",
    answer:
      "Use the Get a Quote or Contact section on this website and send us your project requirements. We can then discuss the next steps.",
  },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-24 bg-slate-950 text-white">
      <div className="max-w-4xl mx-auto px-6">

        {/* Heading */}
        <div className="text-center mb-14">
          <p className="text-blue-500 font-semibold uppercase tracking-widest">
            FAQ
          </p>

          <h2 className="text-4xl md:text-5xl font-bold mt-4">
            Frequently Asked Questions
          </h2>

          <p className="text-slate-400 text-lg mt-5">
            Everything you need to know before starting a project.
          </p>
        </div>

        {/* FAQ List */}
        <div className="space-y-4">

          {faqs.map((faq, index) => (
            <div
              key={faq.question}
              className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex items-center justify-between text-left p-6 hover:bg-slate-800 transition"
              >
                <span className="font-semibold text-lg pr-6">
                  {faq.question}
                </span>

                <span className="text-blue-500 text-2xl">
                  {openIndex === index ? "−" : "+"}
                </span>
              </button>

              {openIndex === index && (
                <div className="px-6 pb-6">
                  <p className="text-slate-400 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}

        </div>

      </div>
    </section>
  );
};

export default FAQ;