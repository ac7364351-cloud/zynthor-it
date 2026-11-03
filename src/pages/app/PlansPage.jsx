import { useState, useEffect } from "react";
import { FiCheck, FiLayers, FiCreditCard, FiZap, FiShield, FiStar } from "react-icons/fi";
import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function PlansPage() {
  const { business } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [upgrading, setUpgrading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const loadSub = async () => {
    try {
      const res = await api.getSubscription();
      if (res.success) {
        setSubscription(res);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadSub();
  }, [business?.id]);

  const handleUpgrade = async (planKey) => {
    setUpgrading(true);
    setSuccessMsg("");
    try {
      const res = await api.upgradeSubscription(planKey);
      if (res.success) {
        setSuccessMsg(`Successfully transitioned to ${planKey.toUpperCase()} tier!`);
        setTimeout(() => setSuccessMsg(""), 3500);
        loadSub();
      }
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setUpgrading(false);
    }
  };

  const currentPlan = subscription?.currentPlan || business?.plan || "growth";

  const tiers = [
    {
      key: "starter",
      name: "Starter Essential",
      price: "₹999",
      period: "/ month",
      desc: "Ideal for boutique salons, single-branch cafes, and independent digital consultants.",
      features: [
        "Up to 100 Inbound CRM Leads",
        "Up to 3 Staff Members / Stylists",
        "Up to 30 Menu Dishes / Services",
        "Standard Email Notifications",
        "Online Booking & QR Menu Portals",
      ],
    },
    {
      key: "growth",
      name: "Growth Professional",
      price: "₹2,499",
      period: "/ month",
      popular: true,
      desc: "Complete operational suite for scaling salons, active bistros, and service agencies.",
      features: [
        "Up to 1,000 Inbound CRM Leads",
        "Up to 15 Staff Members / Specialists",
        "Up to 150 Menu Dishes / Services",
        "Bilingual AI Copilot (English + Hindi + Hinglish)",
        "Kitchen Display System (KDS) & Floor Tables",
        "Automated SMS & Webhook Triggers",
        "CSV Accounting & Tax Exports",
      ],
    },
    {
      key: "enterprise",
      name: "Enterprise Titanium",
      price: "₹4,999",
      period: "/ month",
      desc: "Multi-branch chains, luxury spa resorts, and high-volume dining establishments.",
      features: [
        "Unlimited CRM Leads & Profiles",
        "Unlimited Staff Members & Rosters",
        "Unlimited Dishes, Services & Tables",
        "Custom Fine-Tuned AI Concierge Directives",
        "Dedicated Multi-Branch Rollup Analytics",
        "24/7 Priority SLA Engineer Support",
        "Custom Domain & White-Label Theming",
      ],
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 w-full pb-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-blue-950 text-blue-300 border border-blue-800/60 inline-block">
          Predictable Commercial Pricing
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Subscription Tiers & Quotas
        </h1>
        <p className="text-xs text-slate-400">
          Scale your business operations seamlessly with transparent quotas and instant tier switching.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs text-center font-semibold animate-in fade-in">
          {successMsg}
        </div>
      )}

      {/* Tiers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        {tiers.map((t) => {
          const isCurrent = currentPlan.toLowerCase() === t.key;
          return (
            <div
              key={t.key}
              className={`p-6 rounded-3xl border backdrop-blur-xl flex flex-col justify-between space-y-6 transition-all relative ${
                t.popular
                  ? "bg-slate-900/90 border-blue-500/60 shadow-2xl shadow-blue-950/40 ring-1 ring-blue-500/30"
                  : "bg-slate-900/60 border-slate-800/80 hover:border-slate-700 shadow-xl"
              }`}
            >
              {t.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold tracking-wider uppercase shadow-md shadow-blue-600/30">
                  Most Popular
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-white">{t.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">{t.desc}</p>
                </div>

                <div className="flex items-baseline space-x-1">
                  <span className="text-3xl font-extrabold text-white">{t.price}</span>
                  <span className="text-xs text-slate-400">{t.period}</span>
                </div>

                <div className="pt-4 border-t border-slate-800/80 space-y-2.5">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Features Included:
                  </span>
                  {t.features.map((f, fIdx) => (
                    <div key={fIdx} className="flex items-start space-x-2 text-xs text-slate-300">
                      <FiCheck className="text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                {isCurrent ? (
                  <div className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold text-center border border-slate-700">
                    Current Active Tier
                  </div>
                ) : (
                  <button
                    onClick={() => handleUpgrade(t.key)}
                    disabled={upgrading}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all shadow-md ${
                      t.popular
                        ? "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30"
                        : "bg-slate-800 hover:bg-slate-700 text-white"
                    }`}
                  >
                    {upgrading ? "Switching..." : `Select ${t.name.split(" ")[0]}`}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
