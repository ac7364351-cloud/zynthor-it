import { useState, useEffect, useRef } from "react";
import {
  FiCpu,
  FiSend,
  FiUser,
  FiAlertTriangle,
  FiCheckCircle,
  FiZap,
  FiCornerDownLeft,
  FiCopy,
  FiCheck,
  FiSliders,
} from "react-icons/fi";
import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function AIBotPage() {
  const { business, user } = useAuth();
  const [messages, setMessages] = useState([
    {
      sender: "assistant",
      text: `Hello ${user?.name?.split(" ")[0] || "there"}! I am your Zynthor Business OS Copilot tailored for ${
        business?.name || "your business"
      }. I support English, हिन्दी, and Hinglish. How can I assist your operations today?`,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      suggestedActions: ["Check today's schedule", "Show service pricing", "Review recent leads", "Operating hours"],
    },
  ]);
  const [inputVal, setInputVal] = useState("");
  const [loading, setLoading] = useState(false);
  const [escalated, setEscalated] = useState(false);
  const [copiedTemplate, setCopiedTemplate] = useState(null);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputVal;
    if (!text.trim() || loading) return;

    const userMsg = {
      sender: "user",
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal("");
    setLoading(true);

    try {
      const res = await api.sendAIChat(text.trim(), messages.slice(-5));
      if (res.success) {
        if (res.escalated) setEscalated(true);
        const botMsg = {
          sender: "assistant",
          text: res.message,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          intent: res.intent,
          language: res.language,
          suggestedActions: res.suggestedActions || [],
        };
        setMessages((prev) => [...prev, botMsg]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "assistant",
          text: "I encountered a transient service error. Please try again or check connection.",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const templates = [
    {
      title: "WhatsApp Booking Reminder",
      content: `Namaste {{name}}, your appointment at ${business?.name} is confirmed for {{time}} today with {{specialist}}. Please let us know if you need to reschedule!`,
    },
    {
      title: "Inbound Lead Follow-Up",
      content: `Hi {{name}}, thank you for reaching out to ${business?.name} regarding {{service}}. We have prepared a customized estimate for your requirements. When is a good time for a brief 10-minute briefing?`,
    },
    {
      title: "Table Reservation Confirmation",
      content: `Hello {{name}}, your table for {{guests}} guests at ${business?.name} is confirmed for tonight at {{time}}. We look forward to hosting you!`,
    },
  ];

  const handleCopyTemplate = (idx, text) => {
    navigator.clipboard.writeText(text);
    setCopiedTemplate(idx);
    setTimeout(() => setCopiedTemplate(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
              <FiCpu className="text-blue-400" />
              <span>Zynthor AI Copilot</span>
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-950/80 border border-blue-500/40 text-blue-300">
              Multilingual (EN / HI / Hinglish)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Contextual business assistant powered by authorized database models and domain rules.
          </p>
        </div>

        {/* Telemetry pill */}
        <div className="flex items-center space-x-3 text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Domain Context: <strong className="text-white capitalize">{business?.industry}</strong></span>
          </div>
        </div>
      </div>

      {/* Escalation Alert */}
      {escalated && (
        <div className="p-4 rounded-2xl bg-amber-950/70 border border-amber-500/50 text-amber-300 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center space-x-2">
            <FiAlertTriangle className="text-base flex-shrink-0" />
            <span>
              <strong>Human Escalation Triggered:</strong> A client requested human manager intervention. Flagged in operational alerts.
            </span>
          </div>
          <button
            onClick={() => setEscalated(false)}
            className="px-2.5 py-1 rounded-lg bg-amber-900/60 hover:bg-amber-900 text-amber-200 text-[11px] font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Workspace: Chat + Templates Sidecar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Chat Window */}
        <div className="lg:col-span-8 flex flex-col h-[70vh] rounded-3xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl shadow-2xl overflow-hidden">
          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.map((m, idx) => {
              const isAssistant = m.sender === "assistant";
              return (
                <div
                  key={idx}
                  className={`flex flex-col ${isAssistant ? "items-start" : "items-end"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed shadow-lg ${
                      isAssistant
                        ? "bg-slate-950/90 border border-slate-800 text-slate-200"
                        : "bg-blue-600 text-white font-medium shadow-blue-600/25"
                    }`}
                  >
                    <div className="whitespace-pre-line">{m.text}</div>
                    <div
                      className={`text-[9px] mt-2 font-mono ${
                        isAssistant ? "text-slate-400" : "text-blue-200"
                      }`}
                    >
                      {m.time} {m.language && `• ${m.language.toUpperCase()}`}
                    </div>
                  </div>

                  {/* Suggested Quick Action Chips */}
                  {isAssistant && m.suggestedActions && m.suggestedActions.length > 0 && (
                    <div className="flex items-center flex-wrap gap-1.5 mt-2">
                      {m.suggestedActions.map((action, aIdx) => (
                        <button
                          key={aIdx}
                          onClick={() => handleSendMessage(action)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-[11px] text-blue-300 font-medium transition-colors"
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center space-x-2 p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400 max-w-xs">
                <div className="w-3 h-3 rounded-full bg-blue-500 animate-ping" />
                <span>Copilot synthesizing response...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="p-3 sm:p-4 border-t border-slate-800/80 bg-slate-950/80">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center space-x-2"
            >
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Ask in English or Hinglish (e.g. 'Balayage ke rates kya hain?', 'Book table for 4')..."
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={loading || !inputVal.trim()}
                className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white shadow-lg shadow-blue-600/30 transition-all"
              >
                <FiSend className="text-sm" />
              </button>
            </form>
          </div>
        </div>

        {/* Right: Operational Sidecar & Reply Templates */}
        <div className="lg:col-span-4 space-y-4">
          {/* Quick Reply Templates Card */}
          <div className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl shadow-xl space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <FiZap className="text-amber-400" />
              <span>Executive Reply Templates</span>
            </h2>
            <p className="text-[11px] text-slate-400">
              One-click response templates formatted for WhatsApp and email communication.
            </p>

            <div className="space-y-3">
              {templates.map((tpl, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
                    <span>{tpl.title}</span>
                    <button
                      onClick={() => handleCopyTemplate(idx, tpl.content)}
                      className="p-1 text-slate-400 hover:text-white rounded"
                      title="Copy text"
                    >
                      {copiedTemplate === idx ? (
                        <FiCheck className="text-emerald-400" />
                      ) : (
                        <FiCopy className="text-xs" />
                      )}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{tpl.content}</p>
                </div>
              ))}
            </div>
          </div>

          {/* AI Safety & Guardrails Specs */}
          <div className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl shadow-xl space-y-3 text-xs">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
              Guardrails & Compliance
            </span>
            <div className="space-y-2 text-[11px] text-slate-300">
              <div className="flex items-start space-x-2">
                <FiCheckCircle className="text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>Zero Price Hallucination: Verifies real database rates.</span>
              </div>
              <div className="flex items-start space-x-2">
                <FiCheckCircle className="text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>Conflict Protection: Checks specialist calendar.</span>
              </div>
              <div className="flex items-start space-x-2">
                <FiCheckCircle className="text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>Dispute Escalation: Automatically alerts manager.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
