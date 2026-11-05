import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  FiChevronRight,
  FiCheckCircle,
  FiCheck,
  FiArrowRight,
  FiLayers,
  FiCode,
  FiInfo,
  FiAlertCircle,
  FiShield,
  FiZap,
} from "react-icons/fi";
import Pricing from "../components/Pricing/Pricing.jsx";
import FAQ from "../components/FAQ/FAQ.jsx";
import CTA from "../components/CTA/CTA.jsx";

const PricingPage = ({ onSelectPackage }) => {
  const shouldReduceMotion = useReducedMotion();
  const navigate = useNavigate();
  const [pricingTab, setPricingTab] = useState("saas"); // "saas" | "agency"

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Plans & Pricing — Zynthor Business OS & IT Engineering | Zynthor IT";
  }, []);

  const saasPlans = [
    {
      id: "starter",
      name: "Starter Essential",
      badge: "Single Boutique / Clinic",
      price: "₹799",
      period: "/ month",
      setupFee: "₹1,499 one-time setup fee",
      isPopular: false,
      desc: "Ideal for boutique salons, single-branch cafes, wellness clinics, and independent consultants.",
      features: [
        "Up to 150 Inbound CRM Leads & Inquiries",
        "Up to 3 Staff Members / Stylist Accounts",
        "Up to 30 Menu Dishes or Catalog Services",
        "Digital QR Menu & Mobile Booking Portal",
        "Standard Email Notifications & Inquiries",
        "Automated Tax Invoice Generation (GST 18%)",
        "Standard 48-hour email support",
      ],
      limitations: [
        "Single branch establishment only",
        "Bilingual AI Copilot not included",
        "WhatsApp automation not included",
      ],
    },
    {
      id: "growth",
      name: "Growth Professional",
      badge: "⭐ Most Popular for SMBs",
      price: "₹1,499",
      period: "/ month",
      setupFee: "₹2,499 one-time setup fee",
      isPopular: true,
      desc: "Complete operational suite for scaling salons, active bistros, and service enterprises.",
      features: [
        "Up to 1,000 Inbound CRM Leads & Inquiries",
        "Up to 15 Staff Members / Specialists",
        "Up to 150 Menu Dishes or Catalog Services",
        "Live Kitchen Display System (KDS) & Floor Tables",
        "Salon Double-Booking Collision Prevention",
        "Bilingual AI Copilot (English + Hindi + Hinglish)",
        "Automated WhatsApp & SMS Trigger Dispatcher",
        "Promotional Coupons Engine & Discount Validation",
        "CSV Accounting & Real Telemetry Exports",
        "Priority 12-hour technical support",
      ],
      limitations: [
        "Single establishment location",
        "Custom domain mapping available as add-on",
      ],
    },
    {
      id: "pro",
      name: "Pro Advanced",
      badge: "Multi-Unit & High-Volume",
      price: "₹2,999",
      period: "/ month",
      setupFee: "₹3,999 one-time setup fee",
      isPopular: false,
      desc: "For busy restaurants, luxury spa centers, and multi-location service agencies.",
      features: [
        "Up to 5,000 Inbound CRM Leads & Inquiries",
        "Up to 50 Staff Members / Specialists",
        "Up to 500 Menu Dishes or Catalog Services",
        "Support for up to 3 Branch Establishments",
        "Priority Kitchen Display System (KDS)",
        "Advanced Bilingual AI Directives & Escalation",
        "Custom Domain & White-Label Theming",
        "Consolidated Multi-Branch Analytics Rollup",
        "Priority 4-hour SLA engineer support",
      ],
      limitations: [
        "Up to 3 branches (additional branches custom quoted)",
      ],
    },
    {
      id: "enterprise",
      name: "Enterprise Custom",
      badge: "Chains & Franchises",
      price: "Custom",
      period: "tailored billing",
      setupFee: "Scoped per deployment requirements",
      isPopular: false,
      desc: "Multi-branch chains, luxury spa resorts, franchises, and high-volume dining groups.",
      features: [
        "Unlimited Inbound CRM Leads & Profiles",
        "Unlimited Staff Members & Stylists",
        "Unlimited Menu Dishes, Services & Floor Tables",
        "Unlimited Multi-Branch Hierarchical Rollup",
        "Dedicated Database Instance & Custom Isolation",
        "Custom REST API Webhooks & ERP Integrations",
        "Fine-Tuned AI Concierge Directives",
        "24/7 Dedicated SLA Engineer & Account Manager",
      ],
      limitations: ["Requires annual enterprise agreement"],
    },
  ];

  return (
    <div className="pt-24 text-slate-100 bg-slate-950">
      {/* Page Hero Header */}
      <section className="relative py-20 bg-slate-950 border-b border-slate-900 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-r from-blue-600/15 via-indigo-600/10 to-amber-500/10 blur-[130px] rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6 font-medium">
            <Link to="/website" className="hover:text-blue-400 transition-colors">
              Home
            </Link>
            <FiChevronRight className="text-slate-600 text-xs" />
            <span className="text-blue-400 font-semibold">Pricing</span>
          </nav>

          <motion.div
            className="max-w-3xl space-y-4"
            initial={{ opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.55 }}
          >
            <span className="text-blue-400 font-semibold uppercase tracking-[0.25em] text-xs">
              Transparent, Predictable Investment
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-tight">
              Honest Plans for{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-amber-300">
                SaaS & Custom Software
              </span>
            </h1>
            <p className="text-slate-300 text-base md:text-lg leading-relaxed">
              Transparent rates in Indian Rupees (₹) with zero hidden surcharges. Choose between our flagship
              <strong> Zynthor Business OS</strong> cloud SaaS subscription or our bespoke agency website and web application engineering services.
            </p>

            {/* Plan Category Switcher Tabs */}
            <div className="pt-4 flex flex-wrap items-center gap-3">
              <button
                onClick={() => setPricingTab("saas")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  pricingTab === "saas"
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                    : "bg-slate-900 text-slate-300 hover:text-white border border-slate-800"
                }`}
              >
                <FiLayers className="text-amber-400 text-base" />
                <span>Zynthor Business OS (SaaS Platform)</span>
              </button>

              <button
                onClick={() => setPricingTab("agency")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  pricingTab === "agency"
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                    : "bg-slate-900 text-slate-300 hover:text-white border border-slate-800"
                }`}
              >
                <FiCode className="text-blue-400 text-base" />
                <span>Custom Website & Software Engineering</span>
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ================================================================
          TAB 1: ZYNTHOR BUSINESS OS SAAS SUBSCRIPTION PLANS
          ================================================================ */}
      {pricingTab === "saas" && (
        <section className="py-20 bg-slate-950 border-b border-slate-900 relative">
          <div className="max-w-7xl mx-auto px-6 space-y-16">
            {/* Header */}
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
                Flagship Subscription Tiers
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Simple Monthly Pricing with Separate One-Time Setup
              </h2>
              <p className="text-xs text-slate-400">
                Setup fees cover your dedicated tenant database provisioning, menu/service catalog digitization, and 1-on-1 team onboarding.
              </p>
            </div>

            {/* 4-Column SaaS Pricing Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
              {saasPlans.map((plan) => (
                <div
                  key={plan.id}
                  className={`p-6 rounded-3xl border flex flex-col justify-between space-y-6 relative transition-all ${
                    plan.isPopular
                      ? "bg-slate-900/90 border-blue-500 shadow-2xl shadow-blue-950/50 ring-1 ring-blue-500/40"
                      : "bg-slate-900/60 border-slate-800 hover:border-slate-700 shadow-xl"
                  }`}
                >
                  {plan.isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold tracking-wider uppercase shadow-md shadow-blue-600/30">
                      Most Popular
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-amber-400 block mb-1">
                        {plan.badge}
                      </span>
                      <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{plan.desc}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-800">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-extrabold text-white">{plan.price}</span>
                        <span className="text-xs text-slate-400 font-medium">{plan.period}</span>
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 mt-1 flex items-center gap-1">
                        <FiInfo className="text-blue-400 shrink-0" />
                        <span>{plan.setupFee}</span>
                      </div>
                    </div>

                    {/* Features List */}
                    <div className="pt-3 border-t border-slate-800 space-y-2">
                      <span className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider block">
                        Included Features:
                      </span>
                      {plan.features.map((feat, fIdx) => (
                        <div key={fIdx} className="flex items-start gap-2 text-xs text-slate-300">
                          <FiCheck className="text-emerald-400 mt-0.5 shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>

                    {/* Limitations */}
                    {plan.limitations.length > 0 && (
                      <div className="pt-3 border-t border-slate-800/60 space-y-1.5">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                          Limitations:
                        </span>
                        {plan.limitations.map((lim, lIdx) => (
                          <div key={lIdx} className="text-[11px] text-slate-400 flex items-start gap-1.5">
                            <span className="text-slate-500">•</span>
                            <span>{lim}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <Link
                      to={plan.id === "enterprise" ? "/website/contact" : "/website/book-demo"}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold text-center block transition-all shadow-md cursor-pointer ${
                        plan.isPopular
                          ? "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30"
                          : "bg-slate-800 hover:bg-slate-700 text-white"
                      }`}
                    >
                      {plan.id === "enterprise" ? "Contact Enterprise Sales" : `Book Demo for ${plan.name.split(" ")[0]}`}
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Legal, Tax & Third-Party Charges Disclosure Card */}
            <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6">
              <div className="flex items-center gap-2 text-base font-bold text-white border-b border-slate-800 pb-3">
                <FiShield className="text-blue-400 text-lg" />
                <span>Transparent Commercial Terms & Third-Party Fee Disclosure</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-300 leading-relaxed">
                <div className="space-y-2">
                  <h4 className="font-bold text-white flex items-center gap-1.5">
                    <FiCheckCircle className="text-emerald-400" />
                    <span>Taxes & GST Compliance</span>
                  </h4>
                  <p className="text-slate-400">
                    All listed monthly subscriptions and one-time setup fees are exclusive of applicable 18% standard GST (Goods & Services Tax) in India.
                    An official GST Tax Invoice (with your GSTIN) will be generated every billing cycle for full input tax credit eligibility.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-white flex items-center gap-1.5">
                    <FiCheckCircle className="text-blue-400" />
                    <span>One-Time Setup & Onboarding Fees</span>
                  </h4>
                  <p className="text-slate-400">
                    Displayed separately from recurring subscriptions. Covers your dedicated database schema provisioning, business settings branding,
                    up to 150 dishes/services digitized, team staff account configuration, and live 1-on-1 walkthrough training.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-white flex items-center gap-1.5">
                    <FiCheckCircle className="text-amber-400" />
                    <span>Third-Party Gateway & Carrier Charges</span>
                  </h4>
                  <p className="text-slate-400">
                    • <strong>WhatsApp Meta Cloud API:</strong> Conversation template charges are billed directly by Meta per delivered message.<br />
                    • <strong>Payment Gateways:</strong> Standard payment gateway merchant discount rates (~2% MDR) are deducted directly by Razorpay or Stripe.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ================================================================
          TAB 2: CUSTOM WEBSITE & SOFTWARE ENGINEERING PACKAGES
          ================================================================ */}
      {pricingTab === "agency" && (
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-6 mb-8 text-center max-w-2xl space-y-2">
            <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-widest">
              Bespoke Software Development
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Website, App & Dashboard Packages
            </h2>
            <p className="text-xs text-slate-400">
              Clear 50/50 staged milestones with 100% source code handover and 30-day post-launch warranty.
            </p>
          </div>
          <Pricing onSelectPackage={onSelectPackage} />
        </section>
      )}

      {/* FAQ & CTA */}
      <FAQ />
      <CTA />
    </div>
  );
};

export default PricingPage;
