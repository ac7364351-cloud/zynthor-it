import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiScissors,
  FiCoffee,
  FiBriefcase,
  FiShoppingBag,
  FiCheckCircle,
  FiArrowRight,
  FiArrowLeft,
  FiUserCheck,
} from "react-icons/fi";
import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Wizard Data State
  const [formData, setFormData] = useState({
    industry: "salon",
    businessName: "",
    email: "",
    phone: "",
    password: "",
    ownerName: "",
    firstItemName: "",
    firstItemPrice: "",
  });

  const industries = [
    {
      id: "salon",
      name: "Salon, Spa & Wellness",
      icon: FiScissors,
      desc: "Hair studios, beauty clinics, barbershops, and holistic luxury spas.",
    },
    {
      id: "cafe",
      name: "Cafe, Bistro & Dining",
      icon: FiCoffee,
      desc: "Coffee bars, brunch bistros, bakeries, and woodfired pizzerias.",
    },
    {
      id: "agency",
      name: "Digital & IT Services",
      icon: FiBriefcase,
      desc: "Engineering consultancies, creative agencies, and software studios.",
    },
    {
      id: "retail",
      name: "Boutique & Retail",
      icon: FiShoppingBag,
      desc: "Specialty apparel, artisanal goods, and high-end lifestyle stores.",
    },
  ];

  const handleComplete = async () => {
    setLoading(true);
    setError(null);
    try {
      await register({
        businessName: formData.businessName.trim(),
        industry: formData.industry,
        name: formData.ownerName.trim() || "Owner",
        email: formData.email.trim(),
        password: formData.password || "Password@123",
        phone: formData.phone.trim(),
      });
      navigate("/app");
    } catch (err) {
      setError(err.message || "Failed to initialize organization profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      {/* Wizard Step Indicator */}
      <div className="flex items-center justify-between mb-8">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center space-x-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step === s
                  ? "bg-blue-600 text-white ring-4 ring-blue-500/20 shadow-lg shadow-blue-500/30"
                  : step > s
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-800 text-slate-400"
              }`}
            >
              {step > s ? "✓" : s}
            </div>
            <span className="text-xs font-semibold text-slate-300 hidden sm:inline">
              {s === 1 ? "Industry" : s === 2 ? "Profile" : s === 3 ? "First Offering" : "Launch"}
            </span>
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-red-950/70 border border-red-500/40 text-red-300 text-xs">
          {error}
        </div>
      )}

      {/* STEP 1: INDUSTRY SELECTION */}
      {step === 1 && (
        <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-2xl space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-extrabold text-white">Choose Your Business Vertical</h2>
            <p className="text-xs text-slate-400">
              Zynthor Business OS will configure tailored modules, schemas, and AI instructions for your domain.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {industries.map((ind) => {
              const Icon = ind.icon;
              const isSelected = formData.industry === ind.id;
              return (
                <div
                  key={ind.id}
                  onClick={() => setFormData({ ...formData, industry: ind.id })}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-blue-950/40 border-blue-500 text-white shadow-xl shadow-blue-950/40"
                      : "bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-3 ${
                      isSelected ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    <Icon />
                  </div>
                  <h3 className="font-bold text-sm text-white">{ind.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">{ind.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={() => setStep(2)}
              className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all"
            >
              <span>Continue</span>
              <FiArrowRight />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: BUSINESS DETAILS */}
      {step === 2 && (
        <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-2xl space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-extrabold text-white">Business Information</h2>
            <p className="text-xs text-slate-400">Establish your organizational presence and credentials.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Company / Studio Name *</label>
              <input
                type="text"
                required
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                placeholder="e.g. Elysian Glow Wellness"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Owner / Manager Name *</label>
                <input
                  type="text"
                  required
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  placeholder="Aryan Choudhary"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Contact Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Business Work Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="contact@elysianglow.com"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Admin Password *</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setStep(1)}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl text-slate-400 hover:text-white text-xs font-semibold"
            >
              <FiArrowLeft />
              <span>Back</span>
            </button>
            <button
              onClick={() => {
                if (!formData.businessName || !formData.email) {
                  setError("Business name and work email are required.");
                  return;
                }
                setError(null);
                setStep(3);
              }}
              className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all"
            >
              <span>Next Step</span>
              <FiArrowRight />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: FIRST OFFERING */}
      {step === 3 && (
        <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-2xl space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-extrabold text-white">Add Your First Core Offering</h2>
            <p className="text-xs text-slate-400">
              Create your initial signature service or menu dish to populate your client portal.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {formData.industry === "cafe" ? "Signature Dish Name" : "Signature Service Name"}
              </label>
              <input
                type="text"
                value={formData.firstItemName}
                onChange={(e) => setFormData({ ...formData, firstItemName: e.target.value })}
                placeholder={
                  formData.industry === "cafe"
                    ? "e.g. Avocado Toast with Poached Eggs"
                    : "e.g. Organic Keratin Infusion"
                }
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Price (₹)</label>
              <input
                type="number"
                value={formData.firstItemPrice}
                onChange={(e) => setFormData({ ...formData, firstItemPrice: e.target.value })}
                placeholder="1500"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setStep(2)}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl text-slate-400 hover:text-white text-xs font-semibold"
            >
              <FiArrowLeft />
              <span>Back</span>
            </button>
            <button
              onClick={() => setStep(4)}
              className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all"
            >
              <span>Review & Launch</span>
              <FiArrowRight />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: REVIEW & LAUNCH */}
      {step === 4 && (
        <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-2xl space-y-6 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center text-3xl">
            <FiCheckCircle />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-extrabold text-white">Your Workspace Is Ready</h2>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              We have configured your isolated tenant database partition, multilingual AI rules, and client portals.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left text-xs space-y-2 max-w-md mx-auto">
            <div className="flex justify-between text-slate-300">
              <span>Business:</span>
              <span className="font-semibold text-white">{formData.businessName || "New Enterprise"}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Vertical Engine:</span>
              <span className="font-mono text-blue-400 capitalize">{formData.industry} Suite</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Plan:</span>
              <span className="font-mono text-emerald-400">Starter Tier (14-Day Pro Trial Active)</span>
            </div>
          </div>

          <button
            onClick={handleComplete}
            disabled={loading}
            className="w-full max-w-md mx-auto py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-2 transition-all"
          >
            <span>{loading ? "Initializing Workspace..." : "Launch Zynthor Business OS"}</span>
            <FiArrowRight />
          </button>
        </div>
      )}
    </div>
  );
}
