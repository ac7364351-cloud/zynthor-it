import { useState, useEffect } from "react";
import {
  FiCheck,
  FiLayers,
  FiCreditCard,
  FiZap,
  FiShield,
  FiStar,
  FiFileText,
  FiTag,
  FiPlus,
  FiX,
  FiCheckCircle,
  FiAlertCircle,
  FiRefreshCw,
  FiDownload,
} from "react-icons/fi";
import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function PlansPage() {
  const { business } = useAuth();
  const [activeTab, setActiveTab] = useState("plans"); // "plans" | "invoices" | "coupons"

  // Subscription state
  const [subscription, setSubscription] = useState(null);
  const [upgrading, setUpgrading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Invoices state
  const [invoices, setInvoices] = useState([]);
  const [invoicesLoading, setInvoicesLoading] = useState(false);
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState("all");
  const [createInvoiceModal, setCreateInvoiceModal] = useState(false);
  const [newInvoice, setNewInvoice] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    coupon_code: "",
    due_date: "",
    payment_method: "Online / UPI",
    notes: "",
    items: [{ name: "Consultation & Service", price: 1500, qty: 1 }],
  });

  // Coupons state
  const [coupons, setCoupons] = useState([]);
  const [couponsLoading, setCouponsLoading] = useState(false);
  const [createCouponModal, setCreateCouponModal] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    description: "",
    discount_type: "percent",
    discount_val: 15,
    min_spend: 500,
    max_discount: 1000,
    usage_limit: 100,
  });

  // Coupon Simulator
  const [testCouponCode, setTestCouponCode] = useState("");
  const [testAmount, setTestAmount] = useState(2000);
  const [couponValidationResult, setCouponValidationResult] = useState(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

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

  const loadInvoices = async () => {
    try {
      setInvoicesLoading(true);
      const res = await api.getInvoices(invoiceStatusFilter);
      if (res.success) {
        setInvoices(res.invoices || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setInvoicesLoading(false);
    }
  };

  const loadCoupons = async () => {
    try {
      setCouponsLoading(true);
      const res = await api.getCoupons();
      if (res.success) {
        setCoupons(res.coupons || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCouponsLoading(false);
    }
  };

  useEffect(() => {
    loadSub();
    loadInvoices();
    loadCoupons();
  }, [business?.id]);

  useEffect(() => {
    if (activeTab === "invoices") loadInvoices();
    if (activeTab === "coupons") loadCoupons();
  }, [invoiceStatusFilter, activeTab]);

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

  // Invoice Handlers
  const handleAddItem = () => {
    setNewInvoice((prev) => ({
      ...prev,
      items: [...prev.items, { name: "", price: 0, qty: 1 }],
    }));
  };

  const handleRemoveItem = (idx) => {
    setNewInvoice((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== idx),
    }));
  };

  const handleItemChange = (idx, field, value) => {
    setNewInvoice((prev) => {
      const updated = [...prev.items];
      updated[idx] = { ...updated[idx], [field]: value };
      return { ...prev, items: updated };
    });
  };

  const handleCreateInvoiceSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createInvoice(newInvoice);
      if (res.success) {
        setCreateInvoiceModal(false);
        setNewInvoice({
          customer_name: "",
          customer_email: "",
          customer_phone: "",
          coupon_code: "",
          due_date: "",
          payment_method: "Online / UPI",
          notes: "",
          items: [{ name: "Consultation & Service", price: 1500, qty: 1 }],
        });
        loadInvoices();
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handlePayInvoice = async (invoiceId) => {
    try {
      const res = await api.payInvoice(invoiceId);
      if (res.success) {
        alert(res.message);
        loadInvoices();
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleUpdateInvoiceStatus = async (invoiceId, status) => {
    try {
      await api.updateInvoiceStatus(invoiceId, status);
      loadInvoices();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  // Coupon Handlers
  const handleCreateCouponSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createCoupon(newCoupon);
      if (res.success) {
        setCreateCouponModal(false);
        setNewCoupon({
          code: "",
          description: "",
          discount_type: "percent",
          discount_val: 15,
          min_spend: 500,
          max_discount: 1000,
          usage_limit: 100,
        });
        loadCoupons();
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleValidateTestCoupon = async (e) => {
    e.preventDefault();
    if (!testCouponCode.trim()) return;
    setValidatingCoupon(true);
    setCouponValidationResult(null);
    try {
      const res = await api.validateCoupon(testCouponCode.trim(), Number(testAmount) || 0);
      setCouponValidationResult(res);
    } catch (err) {
      setCouponValidationResult({ success: false, message: err.message });
    } finally {
      setValidatingCoupon(false);
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

  // Calculate modal preview subtotal
  const calcSubtotal = newInvoice.items.reduce(
    (acc, it) => acc + (Number(it.price) || 0) * (Number(it.qty) || 1),
    0
  );
  const calcTax = Math.round(calcSubtotal * 0.18 * 100) / 100;
  const calcTotal = Math.round((calcSubtotal + calcTax) * 100) / 100;

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-theme-primary w-full pb-12">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-theme-primary flex items-center gap-2">
            <FiLayers className="text-blue-500" />
            <span>Commercial Subscriptions & Financial Center</span>
          </h1>
          <p className="text-xs text-theme-muted mt-1">
            Manage your SaaS tier quotas, generate verified GST invoices, and configure promotional coupons.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-theme-surface border border-theme-subtle self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("plans")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "plans"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "text-theme-muted hover:text-theme-primary"
            }`}
          >
            <FiZap className="text-xs" />
            <span>Subscription Plans</span>
          </button>
          <button
            onClick={() => setActiveTab("invoices")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "invoices"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "text-theme-muted hover:text-theme-primary"
            }`}
          >
            <FiFileText className="text-xs" />
            <span>Invoices & Billing</span>
            {invoices.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-950/60 border border-blue-400/40 text-blue-300">
                {invoices.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("coupons")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "coupons"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "text-theme-muted hover:text-theme-primary"
            }`}
          >
            <FiTag className="text-xs" />
            <span>Promotional Coupons</span>
            {coupons.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-950/60 border border-amber-400/40 text-amber-300">
                {coupons.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs text-center font-semibold animate-in fade-in">
          {successMsg}
        </div>
      )}

      {/* ====================================================================
          TAB 1: SUBSCRIPTION PLANS & QUOTAS
          ==================================================================== */}
      {activeTab === "plans" && (
        <div className="space-y-6">
          {/* Payment Gateway Sandbox Notification */}
          <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-500/30 flex items-start gap-3 text-xs text-blue-200">
            <FiShield className="text-base text-blue-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block">Payment Processing: Sandbox Test Mode Active</span>
              <span>
                Plan upgrades and invoice settlements operate in secure test mode without live card charges. Production
                payment gateways (Razorpay / Stripe) require official API merchant credentials configured in production environment.
              </span>
            </div>
          </div>

          {/* Tiers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            {tiers.map((t) => {
              const isCurrent = currentPlan.toLowerCase() === t.key;
              return (
                <div
                  key={t.key}
                  className={`p-6 rounded-3xl border bg-theme-card border-theme-card backdrop-blur-xl flex flex-col justify-between space-y-6 transition-all relative ${
                    t.popular
                      ? "ring-1 ring-blue-500/40 shadow-2xl shadow-blue-950/40"
                      : "shadow-xl"
                  }`}
                >
                  {t.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold tracking-wider uppercase shadow-md shadow-blue-600/30">
                      Most Popular
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-base font-bold text-theme-primary">{t.name}</h3>
                      <p className="text-xs text-theme-muted mt-1">{t.desc}</p>
                    </div>

                    <div className="flex items-baseline space-x-1">
                      <span className="text-3xl font-extrabold text-theme-primary">{t.price}</span>
                      <span className="text-xs text-theme-muted">{t.period}</span>
                    </div>

                    <div className="pt-4 border-t border-theme-subtle space-y-2.5">
                      <span className="text-[10px] font-semibold text-theme-muted uppercase tracking-wider block">
                        Features Included:
                      </span>
                      {t.features.map((f, fIdx) => (
                        <div key={fIdx} className="flex items-start space-x-2 text-xs text-theme-secondary">
                          <FiCheck className="text-emerald-400 mt-0.5 flex-shrink-0" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    {isCurrent ? (
                      <div className="w-full py-2.5 rounded-xl bg-theme-surface text-theme-primary text-xs font-bold text-center border border-theme-subtle">
                        Current Active Tier
                      </div>
                    ) : (
                      <button
                        onClick={() => handleUpgrade(t.key)}
                        disabled={upgrading}
                        className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ${
                          t.popular
                            ? "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30"
                            : "bg-theme-surface hover:bg-theme-surface-hover text-theme-primary border border-theme-subtle"
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
      )}

      {/* ====================================================================
          TAB 2: INVOICES & BILLING
          ==================================================================== */}
      {activeTab === "invoices" && (
        <div className="space-y-6">
          {/* Action & Filter Bar */}
          <div className="p-4 rounded-2xl bg-theme-card border border-theme-card flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
              {["all", "pending", "paid", "cancelled"].map((st) => (
                <button
                  key={st}
                  onClick={() => setInvoiceStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
                    invoiceStatusFilter === st
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                      : "text-theme-muted hover:text-theme-primary hover:bg-theme-surface"
                  }`}
                >
                  {st === "all" ? "All Invoices" : st}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              <button
                onClick={loadInvoices}
                className="p-2 rounded-xl bg-theme-surface hover:bg-theme-surface-hover border border-theme-subtle text-theme-secondary hover:text-theme-primary cursor-pointer"
                title="Refresh Invoices"
              >
                <FiRefreshCw className={`text-xs ${invoicesLoading ? "animate-spin" : ""}`} />
              </button>
              <button
                onClick={() => setCreateInvoiceModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 transition-all cursor-pointer"
              >
                <FiPlus className="text-sm" />
                <span>Create Invoice</span>
              </button>
            </div>
          </div>

          {/* Invoices Table */}
          <div className="p-5 rounded-2xl bg-theme-card border border-theme-card overflow-hidden">
            {invoicesLoading ? (
              <div className="py-16 text-center text-xs text-theme-muted">Loading financial records...</div>
            ) : invoices.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <p className="text-xs text-theme-muted">No invoices found matching current filter.</p>
                <button
                  onClick={() => setCreateInvoiceModal(true)}
                  className="text-xs text-blue-400 hover:underline cursor-pointer"
                >
                  Generate your first GST invoice
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="text-theme-muted border-b border-theme-subtle pb-3">
                      <th className="pb-3 font-semibold">Invoice #</th>
                      <th className="pb-3 font-semibold">Client Name</th>
                      <th className="pb-3 font-semibold">Subtotal</th>
                      <th className="pb-3 font-semibold">Discount</th>
                      <th className="pb-3 font-semibold">GST (18%)</th>
                      <th className="pb-3 font-semibold">Total</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-theme-subtle">
                    {invoices.map((inv) => {
                      const statusBadges = {
                        paid: "bg-emerald-950/60 text-emerald-400 border-emerald-800/50",
                        pending: "bg-amber-950/60 text-amber-400 border-amber-800/50",
                        cancelled: "bg-red-950/60 text-red-400 border-red-800/50",
                      };
                      return (
                        <tr key={inv.id} className="hover:bg-theme-surface/40 transition-colors">
                          <td className="py-3.5 pr-4 font-mono font-bold text-theme-primary">
                            {inv.invoice_number}
                          </td>
                          <td className="py-3.5 pr-4">
                            <div className="font-semibold text-theme-primary">{inv.customer_name}</div>
                            <div className="text-[10px] text-theme-muted">{inv.customer_phone || inv.customer_email || "Direct"}</div>
                          </td>
                          <td className="py-3.5 pr-4 text-theme-secondary font-mono">
                            ₹{Number(inv.subtotal).toLocaleString("en-IN")}
                          </td>
                          <td className="py-3.5 pr-4 font-mono text-emerald-400">
                            {inv.discount > 0 ? `-₹${Number(inv.discount).toLocaleString("en-IN")}` : "—"}
                          </td>
                          <td className="py-3.5 pr-4 text-theme-muted font-mono">
                            ₹{Number(inv.tax).toLocaleString("en-IN")}
                          </td>
                          <td className="py-3.5 pr-4 font-bold text-theme-primary font-mono">
                            ₹{Number(inv.total).toLocaleString("en-IN")}
                          </td>
                          <td className="py-3.5 pr-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                statusBadges[inv.status] || statusBadges.pending
                              }`}
                            >
                              {inv.status}
                            </span>
                          </td>
                          <td className="py-3.5 text-right space-x-2">
                            {inv.status === "pending" && (
                              <button
                                onClick={() => handlePayInvoice(inv.id)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-semibold transition-colors cursor-pointer"
                                title="Capture simulated payment"
                              >
                                Record Payment
                              </button>
                            )}
                            {inv.status === "pending" && (
                              <button
                                onClick={() => handleUpdateInvoiceStatus(inv.id, "cancelled")}
                                className="px-2.5 py-1 rounded-lg bg-theme-surface hover:bg-red-950/40 text-theme-muted hover:text-red-400 text-[10px] font-semibold border border-theme-subtle transition-colors cursor-pointer"
                              >
                                Void
                              </button>
                            )}
                            {inv.status === "paid" && (
                              <span className="text-[10px] text-emerald-400 font-medium">● Settled</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ====================================================================
          TAB 3: PROMOTIONAL COUPONS & VALIDATOR
          ==================================================================== */}
      {activeTab === "coupons" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Active Coupons */}
            <div className="lg:col-span-2 space-y-4">
              <div className="p-4 rounded-2xl bg-theme-card border border-theme-card flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-theme-primary">Promotional Campaign Codes</h2>
                  <p className="text-xs text-theme-muted">Coupons automatically validated during billing checkout</p>
                </div>
                <button
                  onClick={() => setCreateCouponModal(true)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-md shadow-amber-600/30 transition-all cursor-pointer"
                >
                  <FiPlus className="text-sm" />
                  <span>Create Coupon</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {coupons.map((c) => (
                  <div
                    key={c.id}
                    className="p-5 rounded-2xl bg-theme-card border border-theme-card space-y-3 relative overflow-hidden"
                  >
                    <div className="flex items-start justify-between">
                      <div className="px-2.5 py-1 rounded-lg bg-amber-950/60 border border-amber-500/40 text-amber-300 font-mono font-bold text-xs">
                        {c.code}
                      </div>
                      <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-800/40">
                        {c.is_active ? "Active" : "Expired"}
                      </span>
                    </div>

                    <div>
                      <div className="text-lg font-bold text-theme-primary">
                        {c.discount_type === "percent" ? `${c.discount_val}% OFF` : `₹${c.discount_val} FLAT OFF`}
                      </div>
                      <p className="text-xs text-theme-muted mt-0.5">{c.description || "Promotional discount"}</p>
                    </div>

                    <div className="pt-3 border-t border-theme-subtle flex items-center justify-between text-[11px] text-theme-secondary">
                      <span>Min Spend: <strong>₹{c.min_spend}</strong></span>
                      <span>Redeemed: <strong>{c.used_count || 0} / {c.usage_limit || 100}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Live Coupon Validator Sandbox */}
            <div className="p-6 rounded-2xl bg-theme-card border border-theme-card space-y-4">
              <div className="border-b border-theme-subtle pb-3">
                <h3 className="text-base font-bold text-theme-primary flex items-center gap-2">
                  <FiTag className="text-amber-400" />
                  <span>Coupon Testing Sandbox</span>
                </h3>
                <p className="text-xs text-theme-muted mt-0.5">
                  Verify discount calculation rules against minimum spend thresholds before public rollout.
                </p>
              </div>

              <form onSubmit={handleValidateTestCoupon} className="space-y-3 text-xs">
                <div>
                  <label className="block text-theme-secondary font-semibold mb-1">Coupon Code</label>
                  <input
                    type="text"
                    required
                    value={testCouponCode}
                    onChange={(e) => setTestCouponCode(e.target.value.toUpperCase())}
                    placeholder="e.g. LUXE10 or WELCOME500"
                    className="w-full bg-theme-surface border border-theme-subtle rounded-xl px-3 py-2 text-theme-primary uppercase font-mono placeholder-theme-muted focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-theme-secondary font-semibold mb-1">Test Order Subtotal (₹)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={testAmount}
                    onChange={(e) => setTestAmount(e.target.value)}
                    className="w-full bg-theme-surface border border-theme-subtle rounded-xl px-3 py-2 text-theme-primary focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={validatingCoupon}
                  className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl transition-all shadow-md shadow-amber-600/30 cursor-pointer text-xs"
                >
                  {validatingCoupon ? "Validating..." : "Test Coupon Rules"}
                </button>
              </form>

              {couponValidationResult && (
                <div
                  className={`p-4 rounded-xl border text-xs space-y-2 animate-in fade-in ${
                    couponValidationResult.valid
                      ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                      : "bg-red-950/40 border-red-500/40 text-red-300"
                  }`}
                >
                  <div className="font-bold flex items-center gap-1.5">
                    {couponValidationResult.valid ? <FiCheckCircle /> : <FiAlertCircle />}
                    <span>{couponValidationResult.valid ? "Coupon Valid & Applicable" : "Coupon Validation Failed"}</span>
                  </div>
                  {couponValidationResult.valid ? (
                    <div className="space-y-1 text-[11px]">
                      <div>Discount Applied: <strong>₹{couponValidationResult.discount}</strong></div>
                      <div>Net Payable: <strong>₹{couponValidationResult.payable}</strong></div>
                    </div>
                  ) : (
                    <div className="text-[11px]">{couponValidationResult.message}</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          CREATE INVOICE MODAL
          ==================================================================== */}
      {createInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-lg bg-theme-card border border-theme-subtle rounded-3xl p-6 space-y-4 shadow-2xl text-theme-primary my-8">
            <div className="flex items-center justify-between pb-3 border-b border-theme-subtle">
              <h3 className="text-base font-bold text-theme-primary">Generate Official Tax Invoice</h3>
              <button
                onClick={() => setCreateInvoiceModal(false)}
                className="text-theme-muted hover:text-theme-primary cursor-pointer"
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={handleCreateInvoiceSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-theme-secondary font-semibold mb-1">Customer Name *</label>
                <input
                  type="text"
                  required
                  value={newInvoice.customer_name}
                  onChange={(e) => setNewInvoice({ ...newInvoice, customer_name: e.target.value })}
                  placeholder="e.g. Radhika Apte"
                  className="w-full bg-theme-surface border border-theme-subtle rounded-xl px-3 py-2 text-theme-primary placeholder-theme-muted focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-theme-secondary font-semibold mb-1">Customer Email</label>
                  <input
                    type="email"
                    value={newInvoice.customer_email}
                    onChange={(e) => setNewInvoice({ ...newInvoice, customer_email: e.target.value })}
                    placeholder="client@domain.com"
                    className="w-full bg-theme-surface border border-theme-subtle rounded-xl px-3 py-2 text-theme-primary placeholder-theme-muted focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-theme-secondary font-semibold mb-1">Customer Phone</label>
                  <input
                    type="tel"
                    value={newInvoice.customer_phone}
                    onChange={(e) => setNewInvoice({ ...newInvoice, customer_phone: e.target.value })}
                    placeholder="+91 98000 00000"
                    className="w-full bg-theme-surface border border-theme-subtle rounded-xl px-3 py-2 text-theme-primary placeholder-theme-muted focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Line Items Builder */}
              <div className="space-y-2 pt-2 border-t border-theme-subtle">
                <div className="flex items-center justify-between">
                  <label className="text-theme-secondary font-semibold">Service / Product Items *</label>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-blue-400 hover:text-blue-300 font-semibold text-[11px] cursor-pointer flex items-center gap-1"
                  >
                    <FiPlus /> Add Item
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {newInvoice.items.map((it, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        required
                        placeholder="Item Description"
                        value={it.name}
                        onChange={(e) => handleItemChange(idx, "name", e.target.value)}
                        className="flex-1 bg-theme-surface border border-theme-subtle rounded-xl px-2.5 py-1.5 text-xs text-theme-primary focus:outline-none focus:border-blue-500"
                      />
                      <input
                        type="number"
                        min="0"
                        placeholder="Price"
                        value={it.price}
                        onChange={(e) => handleItemChange(idx, "price", e.target.value)}
                        className="w-20 bg-theme-surface border border-theme-subtle rounded-xl px-2.5 py-1.5 text-xs text-theme-primary font-mono focus:outline-none focus:border-blue-500"
                      />
                      <input
                        type="number"
                        min="1"
                        placeholder="Qty"
                        value={it.qty}
                        onChange={(e) => handleItemChange(idx, "qty", e.target.value)}
                        className="w-14 bg-theme-surface border border-theme-subtle rounded-xl px-2.5 py-1.5 text-xs text-theme-primary font-mono focus:outline-none focus:border-blue-500"
                      />
                      {newInvoice.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="p-1.5 text-red-400 hover:bg-theme-surface rounded-lg cursor-pointer"
                        >
                          <FiX />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Coupon Code & Due Date */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-theme-secondary font-semibold mb-1">Coupon Code (Optional)</label>
                  <input
                    type="text"
                    value={newInvoice.coupon_code}
                    onChange={(e) => setNewInvoice({ ...newInvoice, coupon_code: e.target.value.toUpperCase() })}
                    placeholder="e.g. LUXE10"
                    className="w-full bg-theme-surface border border-theme-subtle rounded-xl px-3 py-2 text-theme-primary font-mono uppercase focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-theme-secondary font-semibold mb-1">Due Date</label>
                  <input
                    type="date"
                    value={newInvoice.due_date}
                    onChange={(e) => setNewInvoice({ ...newInvoice, due_date: e.target.value })}
                    className="w-full bg-theme-surface border border-theme-subtle rounded-xl px-3 py-2 text-theme-primary focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Live Calculation Box */}
              <div className="p-3 rounded-xl bg-theme-surface border border-theme-subtle space-y-1 text-[11px] font-mono">
                <div className="flex justify-between text-theme-muted">
                  <span>Subtotal:</span>
                  <span>₹{calcSubtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-theme-muted">
                  <span>GST (18% Standard):</span>
                  <span>₹{calcTax.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-theme-primary font-bold text-xs pt-1 border-t border-theme-subtle">
                  <span>Estimated Total:</span>
                  <span>₹{calcTotal.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-theme-subtle">
                <button
                  type="button"
                  onClick={() => setCreateInvoiceModal(false)}
                  className="px-4 py-1.5 text-theme-muted hover:text-theme-primary cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-md shadow-blue-600/30 cursor-pointer"
                >
                  Create & Issue Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          CREATE COUPON MODAL
          ==================================================================== */}
      {createCouponModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-theme-card border border-theme-subtle rounded-3xl p-6 space-y-4 shadow-2xl text-theme-primary">
            <div className="flex items-center justify-between pb-3 border-b border-theme-subtle">
              <h3 className="text-base font-bold text-theme-primary">Create Promotional Coupon</h3>
              <button
                onClick={() => setCreateCouponModal(false)}
                className="text-theme-muted hover:text-theme-primary cursor-pointer"
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={handleCreateCouponSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-theme-secondary font-semibold mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  value={newCoupon.code}
                  onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. LUXE20 or FESTIVE500"
                  className="w-full bg-theme-surface border border-theme-subtle rounded-xl px-3 py-2 text-theme-primary font-mono uppercase focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-theme-secondary font-semibold mb-1">Campaign Description</label>
                <input
                  type="text"
                  value={newCoupon.description}
                  onChange={(e) => setNewCoupon({ ...newCoupon, description: e.target.value })}
                  placeholder="Seasonal promotional discount"
                  className="w-full bg-theme-surface border border-theme-subtle rounded-xl px-3 py-2 text-theme-primary focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-theme-secondary font-semibold mb-1">Discount Type</label>
                  <select
                    value={newCoupon.discount_type}
                    onChange={(e) => setNewCoupon({ ...newCoupon, discount_type: e.target.value })}
                    className="w-full bg-theme-surface border border-theme-subtle rounded-xl px-3 py-2 text-theme-primary focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="percent">Percentage (%)</option>
                    <option value="fixed">Fixed Flat (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-theme-secondary font-semibold mb-1">
                    Value {newCoupon.discount_type === "percent" ? "(%)" : "(₹)"} *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newCoupon.discount_val}
                    onChange={(e) => setNewCoupon({ ...newCoupon, discount_val: e.target.value })}
                    className="w-full bg-theme-surface border border-theme-subtle rounded-xl px-3 py-2 text-theme-primary font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-theme-secondary font-semibold mb-1">Min Spend (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={newCoupon.min_spend}
                    onChange={(e) => setNewCoupon({ ...newCoupon, min_spend: e.target.value })}
                    className="w-full bg-theme-surface border border-theme-subtle rounded-xl px-3 py-2 text-theme-primary font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-theme-secondary font-semibold mb-1">Usage Limit</label>
                  <input
                    type="number"
                    min="1"
                    value={newCoupon.usage_limit}
                    onChange={(e) => setNewCoupon({ ...newCoupon, usage_limit: e.target.value })}
                    className="w-full bg-theme-surface border border-theme-subtle rounded-xl px-3 py-2 text-theme-primary font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-theme-subtle">
                <button
                  type="button"
                  onClick={() => setCreateCouponModal(false)}
                  className="px-4 py-1.5 text-theme-muted hover:text-theme-primary cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl shadow-md shadow-amber-600/30 cursor-pointer"
                >
                  Publish Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
