import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FiEdit3,
  FiGlobe,
  FiSave,
  FiCheckCircle,
  FiExternalLink,
  FiCoffee,
  FiScissors,
  FiLayout,
  FiEye,
} from "react-icons/fi";
import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import ZynthorLogo from "../../components/Brand/ZynthorLogo";

export default function BrandEditorPage() {
  const { business } = useAuth();
  const [formData, setFormData] = useState({
    businessName: "",
    tagline: "",
    primaryColor: "blue",
    brandVoice: "Obsidian Luxury & Warm Concierge",
    phone: "",
    address: "",
    announcement: "Special 20% discount on all bookings this week!",
  });
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.getSettings();
        if (res.success && res.business) {
          setFormData((prev) => ({
            ...prev,
            businessName: res.business.name || "",
            phone: res.business.phone || "",
            address: res.business.address || "",
            brandVoice: res.settings?.brand_voice || prev.brandVoice,
          }));
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadData();
  }, [business?.id]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);
    try {
      await api.updateSettings({
        businessName: formData.businessName,
        phone: formData.phone,
        address: formData.address,
        brand_voice: formData.brandVoice,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      alert("Error saving brand settings: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const portalUrl =
    business?.industry === "salon"
      ? `/book/${business.slug || "luxe-aura"}`
      : `/menu/${business.slug || "velvet-vine"}`;

  return (
    <div className="max-w-6xl mx-auto space-y-6 text-theme-primary w-full min-w-0 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-theme-primary flex items-center gap-2">
              <FiEdit3 className="text-blue-500" />
              <span>Website & Brand Editor</span>
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-950/40 border border-blue-500/40 text-blue-400">
              Live Customizer
            </span>
          </div>
          <p className="text-xs text-theme-muted mt-1">
            Customize customer-facing booking portals, digital QR menus, brand identity, and appearance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={portalUrl}
            target="_blank"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-theme-surface hover:bg-theme-surface-hover border border-theme-subtle text-xs font-semibold text-theme-secondary hover:text-theme-primary transition-colors"
          >
            <FiEye className="text-sm" />
            <span>Preview Customer Portal</span>
            <FiExternalLink className="text-xs" />
          </Link>
          <Link
            to="/website"
            target="_blank"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-theme-surface hover:bg-theme-surface-hover border border-theme-subtle text-xs font-semibold text-theme-secondary hover:text-theme-primary transition-colors"
          >
            <FiGlobe className="text-sm" />
            <span>Public Agency Site</span>
            <FiExternalLink className="text-xs" />
          </Link>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs flex items-center space-x-2 animate-in fade-in">
          <FiCheckCircle className="text-base flex-shrink-0" />
          <span>Brand styling updated and synchronized across all portals!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Brand Controls */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Brand Profile */}
          <div className="p-6 rounded-2xl bg-theme-card border border-theme-card shadow-sm space-y-4">
            <h2 className="text-base font-bold text-theme-primary pb-3 border-b border-theme-subtle flex items-center gap-2">
              <FiLayout className="text-blue-400" />
              <span>Identity & Styling</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-theme-secondary">Establishment Name</label>
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-theme-surface border border-theme-subtle text-xs text-theme-primary focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-theme-secondary">Public Tagline</label>
                <input
                  type="text"
                  placeholder="e.g. Luxury Hair Care & Spa Experience"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-theme-surface border border-theme-subtle text-xs text-theme-primary focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-theme-secondary">Primary Accent Theme</label>
                <select
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-theme-surface border border-theme-subtle text-xs text-theme-primary focus:outline-none focus:border-blue-500"
                >
                  <option value="blue">Royal Sapphire & Sky Blue</option>
                  <option value="gold">Obsidian Luxury & Antique Gold</option>
                  <option value="pink">Blush Rose & Velvet Salon</option>
                  <option value="amber">Warm Coffee & Bistro Amber</option>
                  <option value="emerald">Botanical Spa Emerald</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-theme-secondary">Brand Voice & Copilot Tone</label>
                <select
                  value={formData.brandVoice}
                  onChange={(e) => setFormData({ ...formData, brandVoice: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-theme-surface border border-theme-subtle text-xs text-theme-primary focus:outline-none focus:border-blue-500"
                >
                  <option value="Obsidian Luxury & Warm Concierge">Obsidian Luxury & Warm Concierge</option>
                  <option value="Executive & Formal Authority">Executive & Formal Authority</option>
                  <option value="Artisanal Culinary & Inviting">Artisanal Culinary & Inviting</option>
                  <option value="Casual & Fast-Paced">Casual & Fast-Paced</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-theme-secondary">Banner Announcement Message</label>
              <input
                type="text"
                value={formData.announcement}
                onChange={(e) => setFormData({ ...formData, announcement: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-theme-surface border border-theme-subtle text-xs text-theme-primary focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Section 2: Contact & Location */}
          <div className="p-6 rounded-2xl bg-theme-card border border-theme-card shadow-sm space-y-4">
            <h2 className="text-base font-bold text-theme-primary pb-3 border-b border-theme-subtle">
              Public Contact & Address
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-theme-secondary">Official Phone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-theme-surface border border-theme-subtle text-xs text-theme-primary focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-theme-secondary">Physical Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-theme-surface border border-theme-subtle text-xs text-theme-primary focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all cursor-pointer disabled:opacity-50"
            >
              <FiSave />
              <span>{saving ? "Publishing Changes..." : "Publish Brand Updates"}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Live Portal Previews */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-theme-card border border-theme-card shadow-sm space-y-4">
            <h2 className="text-base font-bold text-theme-primary pb-3 border-b border-theme-subtle">
              Live Customer Portals
            </h2>

            {/* Salon Portal Card */}
            <div className="p-4 rounded-xl bg-theme-surface border border-theme-subtle space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold text-xs text-theme-primary">
                  <FiScissors className="text-pink-400" />
                  <span>Salon Online Booking</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                  Live
                </span>
              </div>
              <p className="text-[11px] text-theme-muted">
                Allow customers to select stylist, services, time slots, and receive instant confirmation.
              </p>
              <Link
                to={business?.industry === "salon" ? `/book/${business.slug}` : "/book/luxe-aura"}
                target="_blank"
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-pink-600 hover:bg-pink-500 text-white text-xs font-medium transition-colors"
              >
                <span>Open Salon Portal</span>
                <FiExternalLink className="text-xs" />
              </Link>
            </div>

            {/* Cafe Portal Card */}
            <div className="p-4 rounded-xl bg-theme-surface border border-theme-subtle space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold text-xs text-theme-primary">
                  <FiCoffee className="text-amber-400" />
                  <span>Digital QR Menu & KOT</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                  Live
                </span>
              </div>
              <p className="text-[11px] text-theme-muted">
                Contactless QR table ordering with dish dietary filters, real-time cart, and KDS integration.
              </p>
              <Link
                to={business?.industry === "cafe" ? `/menu/${business.slug}` : "/menu/velvet-vine"}
                target="_blank"
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium transition-colors"
              >
                <span>Open Digital QR Menu</span>
                <FiExternalLink className="text-xs" />
              </Link>
            </div>

            {/* Agency Marketing Site Card */}
            <div className="p-4 rounded-xl bg-theme-surface border border-theme-subtle space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold text-xs text-theme-primary">
                  <FiGlobe className="text-blue-400" />
                  <span>Agency Marketing Site</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950/60 text-blue-400 border border-blue-800/40">
                  /website
                </span>
              </div>
              <p className="text-[11px] text-theme-muted">
                Standalone public marketing website with services, pricing tiers, and quote requests.
              </p>
              <Link
                to="/website"
                target="_blank"
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors"
              >
                <span>Visit Marketing Site</span>
                <FiExternalLink className="text-xs" />
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}