/**
 * Zynthor Business OS — Universal API Client
 * Provides strongly typed client calls with automatic tenant context injection.
 */

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/+$/, "");

async function request(endpoint, options = {}) {
  const token = localStorage.getItem("zynthor_token");
  let businessId = "1";
  try {
    const b = localStorage.getItem("zynthor_business");
    if (b) businessId = String(JSON.parse(b).id || "1");
  } catch (_e) {
    businessId = "1";
  }

  const headers = {
    "Content-Type": "application/json",
    "X-Business-Id": businessId,
    ...(options.headers || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const url = `${API_BASE}${endpoint.startsWith("/") ? endpoint : "/" + endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return { success: true };
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || `API Error: ${response.status} ${response.statusText}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // 1. Dashboard & Core
  getDashboardStats: () => request("/api/dashboard/stats"),
  getNotifications: () => request("/api/notifications"),
  markNotificationRead: (id) => request(`/api/notifications/${id}/read`, { method: "PUT" }),
  markAllNotificationsRead: () => request("/api/notifications/read-all", { method: "PUT" }),
  getActivities: () => request("/api/activities"),

  // Business Management (Full Super Admin Lifecycle)
  getBusinesses: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/api/businesses${qs ? "?" + qs : ""}`);
  },
  getArchivedBusinesses: () => request("/api/businesses/archived"),
  getBusiness: (id) => request(`/api/businesses/${id}`),
  createBusiness: (data) => request("/api/businesses", { method: "POST", body: JSON.stringify(data) }),
  updateBusiness: (id, data) => request(`/api/businesses/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  activateBusiness: (id) => request(`/api/businesses/${id}/activate`, { method: "PUT" }),
  deactivateBusiness: (id) => request(`/api/businesses/${id}/deactivate`, { method: "PUT" }),
  archiveBusiness: (id) => request(`/api/businesses/${id}/archive`, { method: "PUT" }),
  restoreBusiness: (id) => request(`/api/businesses/${id}/restore`, { method: "PUT" }),
  exportBusinessUrl: (id) => {
    const token = localStorage.getItem("zynthor_token") || "";
    return `${API_BASE}/api/businesses/${id}/export?token=${token}`;
  },
  deleteBusinessPermanent: (id, confirmName, force = false) =>
    request(`/api/businesses/${id}/permanent`, {
      method: "DELETE",
      body: JSON.stringify({ confirmName, force }),
    }),

  // 2. Leads & CRM
  getLeads: (status, search) => {
    const params = new URLSearchParams();
    if (status && status !== "all") params.append("status", status);
    if (search) params.append("search", search);
    const qs = params.toString();
    return request(`/api/leads${qs ? "?" + qs : ""}`);
  },
  createLead: (data) => request("/api/leads", { method: "POST", body: JSON.stringify(data) }),
  updateLead: (id, data) => request(`/api/leads/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteLead: (id) => request(`/api/leads/${id}`, { method: "DELETE" }),
  exportLeadsCsvUrl: () => {
    let businessId = "1";
    try {
      const b = localStorage.getItem("zynthor_business");
      if (b) businessId = String(JSON.parse(b).id || "1");
    } catch (_e) {
      businessId = "1";
    }
    const token = localStorage.getItem("zynthor_token") || "";
    return `${API_BASE}/api/leads/export?token=${token}&x_bid=${businessId}`;
  },

  // 3. Customers
  getCustomers: () => request("/api/customers"),
  createCustomer: (data) => request("/api/customers", { method: "POST", body: JSON.stringify(data) }),

  // 4. Salon & Spa
  getSalonCategories: () => request("/api/salon/categories"),
  getSalonServices: () => request("/api/salon/services"),
  createSalonService: (data) => request("/api/salon/services", { method: "POST", body: JSON.stringify(data) }),
  updateSalonService: (id, data) => request(`/api/salon/services/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteSalonService: (id) => request(`/api/salon/services/${id}`, { method: "DELETE" }),
  getSalonStaff: () => request("/api/salon/staff"),
  createSalonStaff: (data) => request("/api/salon/staff", { method: "POST", body: JSON.stringify(data) }),
  updateSalonStaff: (id, data) => request(`/api/salon/staff/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  getSalonAppointments: (date, staffId) => {
    const params = new URLSearchParams();
    if (date) params.append("date", date);
    if (staffId) params.append("staff_id", staffId);
    const qs = params.toString();
    return request(`/api/salon/appointments${qs ? "?" + qs : ""}`);
  },
  createSalonAppointment: (data) => request("/api/salon/appointments", { method: "POST", body: JSON.stringify(data) }),
  updateSalonAppointment: (id, data) => request(`/api/salon/appointments/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteSalonAppointment: (id) => request(`/api/salon/appointments/${id}`, { method: "DELETE" }),
  getSalonPackages: () => request("/api/salon/packages"),
  getPublicSalon: (slug) => request(`/api/salon/public/${slug}`),
  bookPublicSalon: (data) => request("/api/salon/public/book", { method: "POST", body: JSON.stringify(data) }),

  // 5. Cafe & Restaurant
  getCafeCategories: () => request("/api/cafe/categories"),
  getCafeDishes: () => request("/api/cafe/dishes"),
  createCafeDish: (data) => request("/api/cafe/dishes", { method: "POST", body: JSON.stringify(data) }),
  updateCafeDish: (id, data) => request(`/api/cafe/dishes/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteCafeDish: (id) => request(`/api/cafe/dishes/${id}`, { method: "DELETE" }),
  getCafeTables: () => request("/api/cafe/tables"),
  updateCafeTableStatus: (id, status) => request(`/api/cafe/tables/${id}`, { method: "PUT", body: JSON.stringify({ status }) }),
  getCafeOrders: () => request("/api/cafe/orders"),
  createCafeOrder: (data) => request("/api/cafe/orders", { method: "POST", body: JSON.stringify(data) }),
  updateCafeOrderStatus: (id, status) => request(`/api/cafe/orders/${id}`, { method: "PUT", body: JSON.stringify({ status }) }),
  getCafeReservations: () => request("/api/cafe/reservations"),
  createCafeReservation: (data) => request("/api/cafe/reservations", { method: "POST", body: JSON.stringify(data) }),
  getPublicCafe: (slug) => request(`/api/cafe/public/${slug}`),

  // 6. AI & Automations
  sendAIChat: (message, conversationHistory) => request("/api/ai/chat", { method: "POST", body: JSON.stringify({ message, conversationHistory }) }),
  getAIRules: () => request("/api/ai/rules"),
  updateAIRule: (id, is_enabled) => request(`/api/ai/rules/${id}`, { method: "PUT", body: JSON.stringify({ is_enabled }) }),
  getAILogs: () => request("/api/ai/logs"),
  testAutomationTrigger: (data) => request("/api/automation/test-trigger", { method: "POST", body: JSON.stringify(data) }),

  // 7. Financial Invoices & Coupons
  getInvoices: (status, search) => {
    const params = new URLSearchParams();
    if (status && status !== "all") params.append("status", status);
    if (search) params.append("search", search);
    const qs = params.toString();
    return request(`/api/invoices${qs ? "?" + qs : ""}`);
  },
  createInvoice: (data) => request("/api/invoices", { method: "POST", body: JSON.stringify(data) }),
  updateInvoiceStatus: (id, status) => request(`/api/invoices/${id}/status`, { method: "PUT", body: JSON.stringify({ status }) }),
  payInvoice: (id) => request(`/api/invoices/${id}/pay`, { method: "POST" }),
  getCoupons: () => request("/api/coupons"),
  createCoupon: (data) => request("/api/coupons", { method: "POST", body: JSON.stringify(data) }),
  validateCoupon: (code, subtotal) => request("/api/coupons/validate", { method: "POST", body: JSON.stringify({ code, subtotal }) }),

  // 8. Settings, Team & Billing
  getSettings: () => request("/api/settings"),
  updateSettings: (data) => request("/api/settings", { method: "PUT", body: JSON.stringify(data) }),
  getTeam: () => request("/api/team"),
  inviteTeamMember: (data) => request("/api/team", { method: "POST", body: JSON.stringify(data) }),
  getSubscription: () => request("/api/subscription"),
  upgradeSubscription: (plan) => request("/api/subscription/upgrade", { method: "POST", body: JSON.stringify({ plan }) }),
};
