import { useState, useEffect } from "react";
import { FiZap, FiCheckCircle, FiClock, FiAlertCircle, FiSettings, FiToggleLeft, FiToggleRight } from "react-icons/fi";
import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function AutomationPage() {
  const { business } = useAuth();
  const [rules, setRules] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="max-w-7xl mx-auto space-y-6 w-full">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
          <FiZap className="text-amber-400" />
          <span>Automation Rules & Execution Logs</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Event-driven business triggers configured for {business?.name || "your organization"}.
        </p>
      </div>

      {/* Rules Section */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold text-white">Active Operational Triggers</h2>
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
                className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl shadow-xl flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <span className="text-xs font-mono font-bold uppercase text-amber-400 px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800/50">
                      {rule.trigger_event}
                    </span>
                    <button
                      onClick={() => handleToggleRule(rule.id, rule.is_enabled)}
                      className="text-2xl transition-colors"
                      title={rule.is_enabled ? "Disable Rule" : "Enable Rule"}
                    >
                      {rule.is_enabled ? (
                        <FiToggleRight className="text-emerald-400" />
                      ) : (
                        <FiToggleLeft className="text-slate-600" />
                      )}
                    </button>
                  </div>
                  <h3 className="font-bold text-sm text-white mt-3">{rule.name}</h3>
                </div>

                <div className="pt-3 border-t border-slate-800/80 space-y-1 text-[11px] text-slate-400">
                  <span className="font-semibold text-slate-300 block">Actions Dispatched:</span>
                  <div className="space-y-0.5">
                    {Array.isArray(actions) &&
                      actions.map((act, i) => (
                        <div key={i} className="flex items-center space-x-1.5 text-slate-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
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
      <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-base font-semibold text-white">Automation Audit History</h2>
            <p className="text-xs text-slate-400">Immutable ledger of automated workflow executions</p>
          </div>
          <span className="text-[10px] font-mono uppercase bg-slate-800 px-2.5 py-1 rounded text-slate-300 font-semibold">
            {logs.length} Logged Runs
          </span>
        </div>

        <div className="overflow-x-auto">
          {logs.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">No automation logs recorded yet.</div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800 pb-3">
                  <th className="pb-3 font-semibold">Trigger Event</th>
                  <th className="pb-3 font-semibold">Rule Executed</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Payload Summary</th>
                  <th className="pb-3 font-semibold text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40">
                    <td className="py-3 font-mono text-amber-300">{log.trigger_event}</td>
                    <td className="py-3 font-semibold text-white">{log.rule_name || "System Workflow"}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                        {log.status}
                      </span>
                    </td>
                    <td className="py-3 text-slate-300 font-mono text-[11px] max-w-xs truncate">
                      {log.payload_json || "{}"}
                    </td>
                    <td className="py-3 text-right text-slate-400 text-[11px]">
                      {log.executed_at || "Recent"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
