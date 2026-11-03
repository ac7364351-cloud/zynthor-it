import { useState, useEffect } from "react";
import {
  FiSettings,
  FiUser,
  FiShield,
  FiCpu,
  FiCheckCircle,
  FiPlus,
  FiSave,
  FiX,
  FiLock,
} from "react-icons/fi";
import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function SettingsPage() {
  const { business, user } = useAuth();
  const [settings, setSettings] = useState(null);
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [inviteModal, setInviteModal] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    businessName: "",
    phone: "",
    address: "",
    brand_voice: "Executive & Warm",
    ai_system_prompt: "",
    ai_language_mode: "auto",
    auto_reply_enabled: 1,
    timezone: "Asia/Kolkata",
  });

  // Invite Form State
  const [inviteForm, setInviteForm] = useState({
    name: "",
    email: "",
    role: "staff",
    password: "",
  });

  const loadSettingsData = async () => {
    try {
      setLoading(true);
      const [sRes, tRes] = await Promise.all([api.getSettings(), api.getTeam()]);
      if (sRes.success) {
        setSettings(sRes.settings || {});
        setFormData({
          businessName: sRes.business?.name || "",
          phone: sRes.business?.phone || "",
          address: sRes.business?.address || "",
          brand_voice: sRes.settings?.brand_voice || "Executive & Warm",
          ai_system_prompt: sRes.settings?.ai_system_prompt || "",
          ai_language_mode: sRes.settings?.ai_language_mode || "auto",
          auto_reply_enabled: sRes.settings?.auto_reply_enabled ?? 1,
          timezone: sRes.settings?.timezone || "Asia/Kolkata",
        });
      }
      if (tRes.success) setTeam(tRes.members || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettingsData();
  }, [business?.id]);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);
    try {
      await api.updateSettings(formData);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      alert("Error saving settings: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleInviteMember = async (e) => {
    e.preventDefault();
    try {
      await api.inviteTeamMember(inviteForm);
      setInviteModal(false);
      setInviteForm({ name: "", email: "", role: "staff", password: "" });
      loadSettingsData();
    } catch (err) {
      alert("Error inviting member: " + err.message);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 w-full pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
          <FiSettings className="text-blue-400" />
          <span>Business Settings & Team Permissions</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure operating profile, custom AI persona, and staff role-based access controls.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs flex items-center space-x-2 animate-in fade-in">
          <FiCheckCircle className="text-base flex-shrink-0" />
          <span>Settings saved successfully and synchronized across active modules!</span>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Section 1: Business Profile */}
        <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl shadow-xl space-y-4">
          <h2 className="text-base font-bold text-white flex items-center space-x-2 pb-3 border-b border-slate-800">
            <FiUser className="text-blue-400" />
            <span>Organization Profile</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Company / Brand Name</label>
              <input
                type="text"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Official Contact Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Physical Business Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Section 2: AI Bot & Automation Instructions */}
        <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl shadow-xl space-y-4">
          <h2 className="text-base font-bold text-white flex items-center space-x-2 pb-3 border-b border-slate-800">
            <FiCpu className="text-purple-400" />
            <span>AI Copilot & Natural Language Directives</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Brand Voice</label>
              <select
                value={formData.brand_voice}
                onChange={(e) => setFormData({ ...formData, brand_voice: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              >
                <option value="Obsidian Luxury & Warm Concierge">Obsidian Luxury & Warm Concierge</option>
                <option value="Executive & Formal Authority">Executive & Formal Authority</option>
                <option value="Artisanal Culinary & Inviting">Artisanal Culinary & Inviting</option>
                <option value="Casual & Fast-Paced">Casual & Fast-Paced</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Language Processing Mode</label>
              <select
                value={formData.ai_language_mode}
                onChange={(e) => setFormData({ ...formData, ai_language_mode: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              >
                <option value="auto">Auto-Detect (English, Hindi & Hinglish)</option>
                <option value="en">English Only</option>
                <option value="hinglish">Hinglish Preferred</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Custom Business System Prompt Instructions
            </label>
            <textarea
              rows={3}
              value={formData.ai_system_prompt}
              onChange={(e) => setFormData({ ...formData, ai_system_prompt: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all"
          >
            <FiSave />
            <span>{saving ? "Saving Changes..." : "Save Preferences"}</span>
          </button>
        </div>
      </form>

      {/* Section 3: Team Members & Role Restrictions */}
      <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <FiShield className="text-emerald-400" />
              <span>Team Roster & Role Restrictions</span>
            </h2>
            <p className="text-xs text-slate-400">Strictly segregated access boundaries per user role</p>
          </div>

          <button
            onClick={() => setInviteModal(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
          >
            <FiPlus />
            <span>Invite Team Member</span>
          </button>
        </div>

        <div className="divide-y divide-slate-800/80">
          {team.map((m) => {
            const roleBadge = {
              owner: "bg-purple-950 text-purple-300 border-purple-800",
              admin: "bg-blue-950 text-blue-300 border-blue-800",
              manager: "bg-amber-950 text-amber-300 border-amber-800",
              staff: "bg-slate-800 text-slate-300 border-slate-700",
            };
            return (
              <div key={m.id} className="py-3.5 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white text-xs">
                    {m.name.charAt(0)}
                  </div>
                  <div>
                    <span className="font-semibold text-white">{m.name}</span>
                    <span className="text-slate-400 block text-[11px]">{m.email}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-mono uppercase font-bold border ${
                      roleBadge[m.role] || roleBadge.staff
                    }`}
                  >
                    {m.role}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Invite Modal */}
      {inviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Invite Team Member</h3>
              <button onClick={() => setInviteModal(false)} className="text-slate-400 hover:text-white">
                <FiX />
              </button>
            </div>
            <form onSubmit={handleInviteMember} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Name *</label>
                <input
                  type="text"
                  required
                  value={inviteForm.name}
                  onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                  placeholder="e.g. Priya Sharma"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  placeholder="priya@domain.com"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Role *</label>
                <select
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="admin">Admin (Full Control)</option>
                  <option value="manager">Manager (Operations & Bookings)</option>
                  <option value="staff">Staff (Assigned Tasks Only)</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setInviteModal(false)}
                  className="px-4 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-md shadow-blue-600/30"
                >
                  Send Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
