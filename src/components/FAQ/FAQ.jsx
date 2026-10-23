import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { FiChevronDown } from "react-icons/fi";

const faqs = [
  {
    question: "What services does Zynthor IT specialize in?",
    answer:
      "We specialize in four core areas: custom website development (React 19, Vite, Tailwind CSS), full-stack web applications (Node.js, Express, MySQL), business automation & REST API integrations (payment gateways, webhooks), and data analytics dashboards (Power BI, Python, SQL).",
  },
  {
    question: "How are project fees structured, and what are typical starting prices in INR (₹)?",
    answer:
      "We believe in transparent, affordable, fixed-scope milestone pricing in Indian Rupees (₹). Single-page landing pages start at ₹1,499 onwards; basic business websites (up to 5 pages) start at ₹2,999 onwards; standard websites (up to 7 pages with gallery/portfolio) start at ₹4,999 onwards; Power BI analytics dashboards start at ₹1,999 onwards; and custom web applications start at ₹7,999 onwards. Payments are divided into clear milestones (50% upon kickoff and architecture, and 50% upon testing and final delivery).",
  },
  {
    question: "Are domain, hosting, and ongoing maintenance included in the package prices?",
    answer:
      "Domain name registration, cloud server hosting, paid third-party API subscriptions, and ongoing monthly maintenance are listed separately where applicable. We guide you transparently to the best, most cost-effective hosting options (such as free or low-cost cloud tiers) so you retain 100% direct account ownership.",
  },
  {
    question: "How long does it typically take to complete and deliver a website?",
    answer:
      "A single-page landing page is typically completed in 3 to 5 business days. A 5-page basic business website takes approximately 7 to 12 business days. Full-stack custom web applications generally require 3 to 6 weeks depending on database complexity and custom workflow specifications.",
  },
  {
    question: "Who owns the source code, design assets, and intellectual property?",
    answer:
      "You do — 100%. Upon final delivery and sign-off, complete source code, GitHub repository access, database schemas, and all design assets are transferred entirely to your ownership. We never lock you into recurring proprietary platform subscriptions.",
  },
  {
    question: "What post-launch support and warranty do you provide?",
    answer:
      "Every project includes a 30-day post-launch warranty period during which any technical defects or bugs are resolved promptly at zero additional cost. We also offer affordable support retainers for ongoing updates and performance monitoring.",
  },
];

const FAQ = () => {
  const shouldReduceMotion = useReducedMotion();
  const [openIndex, setOpenIndex] = useState(1); // Open pricing FAQ by default for clarity

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="relative py-28 bg-slate-900/40 border-t border-slate-900 overflow-hidden">
      <div className="relative z-10 max-w-4xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.55 }}
        >
          <p className="text-blue-400 font-semibold uppercase tracking-[0.25em] text-xs">
            Clear Answers
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mt-4 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-400 text-base md:text-lg mt-5">
            Everything you need to know about our engagement model, starting prices in INR (₹), and deliverables.
          </p>
        </motion.div>

        {/* Accordion List */}
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <motion.div
                key={index}
                className={`border rounded-2xl transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? "bg-slate-950 border-blue-500/40 shadow-lg shadow-black/20"
                    : "bg-slate-950/60 border-slate-800/80 hover:border-slate-700"
                }`}
                initial={{ opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.4, delay: index * 0.05 }}
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex items-center justify-between text-left p-6 gap-4 cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="font-bold text-base md:text-lg text-white">
                    {faq.question}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-200 ${
                      isOpen
                        ? "bg-blue-600/20 text-blue-400 rotate-180"
                        : "bg-slate-900 text-slate-400"
                    }`}
                  >
                    <FiChevronDown className="text-lg" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-1 text-slate-300 text-sm md:text-base leading-relaxed border-t border-slate-800/50">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FAQ;