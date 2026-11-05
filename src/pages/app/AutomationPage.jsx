import { useState, useEffect } from "react";
import {
  FiZap,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiSettings,
  FiToggleLeft,
  FiToggleRight,
  FiPlay,
  FiX,
  FiRefreshCw,
  FiShield,
} from "react-icons/fi";
import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function AutomationPage() {
  const { business } = useAuth();
  const [rules, setRules] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [triggering, setTriggering] = useState(false);
  const [testSuccessMessage, setTestSuccessMessage] = useState("");

  const [testForm, setTestForm] = useState({
    rule_name: "Inbound Lead Instant WhatsApp Dispatch",
    trigger_event: "lead_created",
    recipient: "client@example.com",
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [rRes, lRes] = await Promise.all([api.getAIRules(), api.getAILogs()]);
      if (rRes.success) setRules(rRes.rules || []);
      if (lRes.success) setLogs(lRes.logs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [business?.id]);

  const handleToggleRule = async (ruleId, currentVal) => {
    const nextVal = currentVal === 1 ? 0 : 1;
    try {
      await api.updateAIRule(ruleId, nextVal);
      setRules((prev) =>
        prev.map((r) => (r.id === ruleId ? { ...r, is_enabled: nextVal } : r))
      );
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleRunTestTrigger = async (e) => {
    e.preventDefault();
    setTriggering(true);
    setTestSuccessMessage("");
    try {
      const res = await api.testAutomationTrigger(testForm);
      if (res.success) {
        setTestSuccessMessage(res.message);
        setTestModalOpen(false);
        loadData();
        setTimeout(() => setTestSuccessMessage(""), 5000);
      }
    } catch (err) {
      alert("Test Trigger Error: " + err.message);
    } finally {
      setTriggering(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-theme-primary w-full pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-theme-primary flex items-center gap-2">
            <FiZap className="text-amber-400" />
            <span>WhatsApp, Email & Webhook Automation</span>
          </h1>
          <p className="text-xs text-theme-muted mt-1">
            Event-driven business triggers configured for {business?.name || "your organization"}.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="p-2 rounded-xl bg-theme-surface hover:bg-theme-surface-hover border border-theme-subtle text-theme-secondary hover:text-theme-primary transition-colors cursor-pointer"
            title="Refresh Logs"
          >
            <FiRefreshCw className={`text-xs ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setTestModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-lg shadow-amber-600/30 transition-all cursor-pointer"
          >
            <FiPlay className="text-xs" />
            <span>Test Trigger (Simulation Mode)</span>
          </button>
        </div>
      </div>

      {/* Mode Transparency Banner */}
      <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 flex items-start gap-3 text-xs text-amber-200">
        <FiShield className="text-base text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-theme-primary block">Provider Credentials: Test & Simulation Mode Active</span>
          <span className="text-theme-muted">
            Outbound WhatsApp, SMS and Email dispatchers operate in simulation mode with explicit delivery tracking.
            Live external gateway delivery requires Meta WhatsApp Cloud API / Twilio / SendGrid API keys configured in production environment.
          </span>
        </div>
      </div>

      {testSuccessMessage && (
        <div className="p-4 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs font-semibold animate-in fade-in flex items-center gap-2">
          <FiCheckCircle className="text-base shrink-0" />
          <span>{testSuccessMessage}</span>
        </div>
      )}

      {/* Rules Section */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold text-theme-primary">Active Operational Triggers</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {rules.map((rule) => {
            let actions;
            try {
              actions = typeof rule.actions_json === "string" ? JSON.parse(rule.actions_json) : rule.actions_json;
            } catch {
              actions = [];
            }

            return (
              <div
                key={rule.id}
                className="p-5 rounded-3xl bg-theme-card border border-theme-card backdrop-blur-xl shadow-xl flex flex-col justify-between space-y-4 hover:border-slate-500/50 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <span className="text-[11px] font-mono font-bold uppercase text-amber-400 px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800/50">
                      {rule.trigger_event}
                    </span>
                    <button
                      onClick={() => handleToggleRule(rule.id, rule.is_enabled)}
                      className="text-2xl transition-colors cursor-pointer"
                      title={rule.is_enabled ? "Disable Rule" : "Enable Rule"}
                    >
                      {rule.is_enabled ? (
                        <FiToggleRight className="text-emerald-400" />
                      ) : (
                        <FiToggleLeft className="text-theme-muted" />
                      )}
                    </button>
                  </div>
                  <h3 className="font-bold text-sm text-theme-primary mt-3">{rule.name}</h3>
                </div>

                <div className="pt-3 border-t border-theme-subtle space-y-1 text-[11px] text-theme-muted">
                  <span className="font-semibold text-theme-secondary block">Actions Dispatched:</span>
                  <div className="space-y-0.5">
                    {Array.isArray(actions) &&
                      actions.map((act, i) => (
                        <div key={i} className="flex items-center space-x-1.5 text-theme-secondary">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                          <span>{act.replace(/_/g, " ")}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Execution Logs Section */}
      <div className="p-6 rounded-3xl bg-theme-card border border-theme-card backdrop-blur-xl shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-theme-subtle">
          <div>
            <h2 className="text-base font-semibold text-theme-primary">Automation Audit History</h2>
            <p className="text-xs text-theme-muted">Immutable ledger of automated workflow executions and dry-runs</p>
          </div>
          <span className="text-[10px] font-mono uppercase bg-theme-surface px-2.5 py-1 rounded text-theme-secondary font-semibold border border-theme-subtle">
            {logs.length} Logged Runs
          </span>
        </div>

        <div className="overflow-x-auto">
          {logs.length === 0 ? (
            <div className="py-8 text-center text-xs text-theme-muted">No automation logs recorded yet.</div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="text-theme-muted border-b border-theme-subtle pb-3">
                  <th className="pb-3 font-semibold">Trigger Event</th>
                  <th className="pb-3 font-semibold">Rule Executed</th>
                  <th className="pb-3 font-semibold">Execution Status</th>
                  <th className="pb-3 font-semibold">Delivery Mode</th>
                  <th className="pb-3 font-semibold">Payload Summary</th>
                  <th className="pb-3 font-semibold text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme-subtle">
                {logs.map((log) => {
                  const isSimulated = log.delivery_mode === "simulated";
                  return (
                    <tr key={log.id} className="hover:bg-theme-surface/40 transition-colors">
                      <td className="py-3 font-mono text-amber-400 font-semibold">{log.trigger_event}</td>
                      <td className="py-3 font-semibold text-theme-primary">{log.rule_name || "System Workflow"}</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
                          {log.status || "SUCCESS"}
                        </span>
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                            isSimulated
                              ? "bg-amber-950/60 text-amber-300 border-amber-500/40"
                              : "bg-blue-950/60 text-blue-300 border-blue-500/40"
                          }`}
                        >
                          {log.delivery_mode ? log.delivery_mode.toUpperCase() : "SIMULATED"}
                        </span>
                      </td>
                      <td className="py-3 text-theme-secondary font-mono text-[11px] max-w-xs truncate">
                        {log.payload_json || "{}"}
                      </td>
                      <td className="py-3 text-right text-theme-muted text-[11px] whitespace-nowrap">
                        {log.executed_at || "Recent"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Test Trigger Modal */}
      {testModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-theme-card border border-theme-subtle rounded-3xl p-6 space-y-4 shadow-2xl text-theme-primary">
            <div className="flex items-center justify-between pb-3 border-b border-theme-subtle">
              <div className="flex items-center gap-2">
                <FiPlay className="text-amber-400" />
                <h3 className="text-base font-bold text-theme-primary">Test Automation Trigger</h3>
              </div>
              <button
                onClick={() => setTestModalOpen(false)}
                className="text-theme-muted hover:text-theme-primary cursor-pointer"
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={handleRunTestTrigger} className="space-y-3 text-xs">
              <div>
                <label className="block text-theme-secondary font-semibold mb-1">Select Trigger Event</label>
                <select
                  value={testForm.trigger_event}
                  onChange={(e) => {
                    const evt = e.target.value;
                    const rName =
                      evt === "lead_created"
                        ? "Inbound Lead Instant WhatsApp Dispatch"
                        : evt === "booking_confirmed"
                        ? "Appointment Confirmation SMS & Cal Sync"
                        : evt === "order_placed"
                        ? "KDS Kitchen Routing Alert"
                        : "Post-Service Satisfaction Survey";
                    setTestForm({ ...testForm, trigger_event: evt, rule_name: rName });
                  }}
                  className="w-full bg-theme-surface border border-theme-subtle rounded-xl px-3 py-2 text-theme-primary focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="lead_created">lead_created (New Lead Captured)</option>
                  <option value="booking_confirmed">booking_confirmed (Salon/Spa Booking)</option>
                  <option value="order_placed">order_placed (Cafe Dining Order)</option>
                  <option value="lead_followup">lead_followup (CRM Follow-Up Due)</option>
                </select>
              </div>

              <div>
                <label className="block text-theme-secondary font-semibold mb-1">Rule Name</label>
                <input
                  type="text"
                  required
                  value={testForm.rule_name}
                  onChange={(e) => setTestForm({ ...testForm, rule_name: e.target.value })}
                  className="w-full bg-theme-surface border border-theme-subtle rounded-xl px-3 py-2 text-theme-primary focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-theme-secondary font-semibold mb-1">Target Recipient (Simulated)</label>
                <input
                  type="text"
                  required
                  value={testForm.recipient}
                  onChange={(e) => setTestForm({ ...testForm, recipient: e.target.value })}
                  placeholder="client@example.com or +919800000000"
                  className="w-full bg-theme-surface border border-theme-subtle rounded-xl px-3 py-2 text-theme-primary focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div className="p-3 rounded-xl bg-theme-surface border border-theme-subtle text-[11px] text-theme-muted space-y-1">
                <div>● Execution Mode: <strong>Simulation / Dry-Run</strong></div>
                <div>● External Cost: <strong>₹0.00</strong></div>
                <div>● Ledger Entry: Recorded with <code>delivery_mode='simulated'</code></div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-theme-subtle">
                <button
                  type="button"
                  onClick={() => setTestModalOpen(false)}
                  className="px-4 py-1.5 text-theme-muted hover:text-theme-primary cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={triggering}
                  className="px-5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl shadow-md shadow-amber-600/30 cursor-pointer"
                >
                  {triggering ? "Dispatching..." : "Fire Test Trigger"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
