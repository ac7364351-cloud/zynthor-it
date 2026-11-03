import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiLock, FiMail, FiArrowRight, FiScissors, FiCoffee, FiBriefcase, FiAlertCircle } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("elena@luxeaura.com");
  const [password, setPassword] = useState("Demo@123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      navigate("/app");
    } catch (err) {
      setError(err.message || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  const quickLoginAs = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setLoading(true);
    setError(null);
    login(demoEmail, demoPass)
      .then(() => navigate("/app"))
      .catch((err) => setError(err.message || "Failed to log in"))
      .finally(() => setLoading(false));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 selection:bg-blue-600 selection:text-white">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Logo & Title */}
        <div className="text-center space-y-2">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 p-0.5 shadow-xl shadow-blue-500/30 flex items-center justify-center mx-auto">
            <span className="font-extrabold text-white text-xl">Z</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Sign In to Zynthor OS</h1>
          <p className="text-xs text-slate-400">
            Autonomous multi-tenant operating system for luxury salons, bistros, and service businesses.
          </p>
        </div>

        {/* 1-Click Demo Profiles */}
        <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-2xl space-y-3">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center">
            One-Click Verified Demo Access
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => quickLoginAs("elena@luxeaura.com", "Demo@123")}
              className="p-2.5 rounded-2xl bg-slate-950 hover:bg-pink-950/40 border border-slate-800 hover:border-pink-500/50 text-left transition-all group"
            >
              <FiScissors className="text-pink-400 text-sm mb-1 group-hover:scale-110 transition-transform" />
              <div className="font-bold text-[11px] text-white">Salon OS</div>
              <div className="text-[9px] text-slate-400">Luxe Aura</div>
            </button>

            <button
              type="button"
              onClick={() => quickLoginAs("chefarjun@velvetvine.com", "Demo@123")}
              className="p-2.5 rounded-2xl bg-slate-950 hover:bg-amber-950/40 border border-slate-800 hover:border-amber-500/50 text-left transition-all group"
            >
              <FiCoffee className="text-amber-400 text-sm mb-1 group-hover:scale-110 transition-transform" />
              <div className="font-bold text-[11px] text-white">Cafe OS</div>
              <div className="text-[9px] text-slate-400">Velvet Bistro</div>
            </button>

            <button
              type="button"
              onClick={() => quickLoginAs("admin@zynthor.com", "Admin@123")}
              className="p-2.5 rounded-2xl bg-slate-950 hover:bg-blue-950/40 border border-slate-800 hover:border-blue-500/50 text-left transition-all group"
            >
              <FiBriefcase className="text-blue-400 text-sm mb-1 group-hover:scale-110 transition-transform" />
              <div className="font-bold text-[11px] text-white">Agency CRM</div>
              <div className="text-[9px] text-slate-400">Zynthor IT</div>
            </button>
          </div>
        </div>

        {/* Credentials Form */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-2xl space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-950/70 border border-red-500/50 text-red-300 text-xs flex items-center space-x-2">
              <FiAlertCircle className="text-sm flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Work Email</label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-3 text-slate-500 text-xs" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@business.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-3 text-slate-500 text-xs" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-2 transition-all"
            >
              <span>{loading ? "Authenticating..." : "Sign In to Workspace"}</span>
              <FiArrowRight />
            </button>
          </form>

          <div className="text-center pt-2 border-t border-slate-800">
            <Link
              to="/app/onboarding"
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
            >
              Onboard a New Business Profile →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
