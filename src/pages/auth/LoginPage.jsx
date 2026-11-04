import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiLock,
  FiMail,
  FiArrowRight,
  FiScissors,
  FiCoffee,
  FiBriefcase,
  FiAlertCircle,
  FiSun,
  FiMoon,
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import ZynthorLogo from "../../components/Brand/ZynthorLogo";

export default function LoginPage() {
  const [email, setEmail] = useState("elena@luxeaura.com");
  const [password, setPassword] = useState("Demo@123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { login } = useAuth();
  const { isDark, toggleTheme } = useTheme();
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
    <div className="min-h-screen bg-theme-main text-theme-primary flex flex-col items-center justify-center p-4 selection:bg-blue-600 selection:text-white transition-colors relative">
      {/* Top Right Theme Toggle */}
      <div className="absolute top-4 right-4">
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-theme-surface border border-theme-subtle text-theme-secondary hover:text-theme-primary transition-colors cursor-pointer"
          title={isDark ? "Switch to Light Canvas" : "Switch to Obsidian Dark"}
        >
          {isDark ? <FiSun className="text-amber-400" /> : <FiMoon className="text-blue-500" />}
        </button>
      </div>

      <div className="w-full max-w-md space-y-6">
        {/* Full Brand Logo (100% Vector Transparent, No White Box) */}
        <div className="text-center space-y-3">
          <div className="flex justify-center py-2">
            <ZynthorLogo size="xl" collapsed={false} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-theme-primary">
            Sign In to Zynthor OS
          </h1>
          <p className="text-xs text-theme-muted">
            Autonomous multi-tenant operating system for luxury salons, bistros, and service businesses.
          </p>
        </div>

        {/* 1-Click Demo Profiles */}
        <div className="p-4 rounded-3xl bg-theme-card border border-theme-card shadow-2xl space-y-3">
          <div className="text-[11px] font-bold text-theme-muted uppercase tracking-wider text-center">
            One-Click Verified Demo Access
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => quickLoginAs("elena@luxeaura.com", "Demo@123")}
              className="p-2.5 rounded-2xl bg-theme-surface/70 hover:bg-pink-950/30 border border-theme-subtle hover:border-pink-500/50 text-left transition-all group cursor-pointer"
            >
              <FiScissors className="text-pink-400 text-sm mb-1 group-hover:scale-110 transition-transform" />
              <div className="font-bold text-[11px] text-theme-primary">Salon OS</div>
              <div className="text-[9px] text-theme-muted">Luxe Aura</div>
            </button>

            <button
              type="button"
              onClick={() => quickLoginAs("chefarjun@velvetvine.com", "Demo@123")}
              className="p-2.5 rounded-2xl bg-theme-surface/70 hover:bg-amber-950/30 border border-theme-subtle hover:border-amber-500/50 text-left transition-all group cursor-pointer"
            >
              <FiCoffee className="text-amber-400 text-sm mb-1 group-hover:scale-110 transition-transform" />
              <div className="font-bold text-[11px] text-theme-primary">Cafe OS</div>
              <div className="text-[9px] text-theme-muted">Velvet Bistro</div>
            </button>

            <button
              type="button"
              onClick={() => quickLoginAs("admin@zynthor.com", "Admin@123")}
              className="p-2.5 rounded-2xl bg-theme-surface/70 hover:bg-blue-950/30 border border-theme-subtle hover:border-blue-500/50 text-left transition-all group cursor-pointer"
            >
              <FiBriefcase className="text-blue-400 text-sm mb-1 group-hover:scale-110 transition-transform" />
              <div className="font-bold text-[11px] text-theme-primary">Agency CRM</div>
              <div className="text-[9px] text-theme-muted">Zynthor IT</div>
            </button>
          </div>
        </div>

        {/* Credentials Form */}
        <form
          onSubmit={handleLogin}
          className="p-6 rounded-3xl bg-theme-card border border-theme-card shadow-2xl space-y-4"
        >
          {error && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
              <FiAlertCircle className="text-base shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-theme-secondary flex items-center gap-1.5">
              <FiMail className="text-theme-muted" />
              <span>Email Address</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@business.com"
              className="w-full px-3.5 py-2.5 rounded-xl bg-theme-surface border border-theme-subtle text-xs text-theme-primary placeholder-theme-muted focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-theme-secondary flex items-center gap-1.5">
              <FiLock className="text-theme-muted" />
              <span>Password</span>
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl bg-theme-surface border border-theme-subtle text-xs text-theme-primary placeholder-theme-muted focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/30 transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Access Business Workspace</span>
                <FiArrowRight />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-theme-muted">
          <span>Need to register a new establishment? </span>
          <button
            type="button"
            onClick={() => navigate("/app/onboarding")}
            className="text-blue-400 hover:text-blue-300 font-semibold cursor-pointer"
          >
            Launch Setup Wizard
          </button>
        </div>
      </div>
    </div>
  );
}
