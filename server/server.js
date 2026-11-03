/**
 * Zynthor Business OS — Unified Enterprise Backend
 * High-performance REST API with multi-tenant isolation, real DB calculation,
 * role-based security, and dual MySQL/SQLite database engine.
 */

const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const db = require("./db");
const { initSchema } = require("./schema");
const { seedData } = require("./seedData");
const { hashPassword, verifyPassword, signToken, authenticate, requireRole } = require("./auth");
const { generateAIResponse } = require("./aiService");

const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Business-Id"],
  })
);
app.use(express.json());

// Boot sequence: Initialize database tables & seed data
(async () => {
  try {
    await initSchema();
    await seedData();
  } catch (err) {
    console.error("[Boot Error]:", err.message);
  }
})();

// ==========================================
// 1. HEALTH & SYSTEM DIAGNOSTICS
// ==========================================
app.get("/", (req, res) => {
  res.json({
    status: "online",
    name: "Zynthor Business OS API",
    version: "3.0.0",
    driver: db.getDriver(),
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/health", async (req, res) => {
  try {
    const check = await db.get("SELECT 1 AS healthy");
    res.json({
      status: "ok",
      database: "connected",
      driver: db.getDriver(),
      healthy: Boolean(check),
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      database: "disconnected",
      driver: db.getDriver(),
      error: err.message,
    });
  }
});

// ==========================================
// 2. AUTHENTICATION & MULTI-TENANCY
// ==========================================
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required." });
    }

    const user = await db.get("SELECT * FROM users WHERE email = ?", [email.trim().toLowerCase()]);
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or credentials." });
    }

    const valid = verifyPassword(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ success: false, message: "Invalid email or credentials." });
    }

    const business = await db.get("SELECT * FROM businesses WHERE id = ?", [user.business_id]);
    const token = signToken({
      userId: user.id,
      businessId: user.business_id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
      business: business || { id: user.business_id, name: "Zynthor Business", industry: "general" },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post("/api/auth/register", async (req, res) => {
  try {
    const { businessName, industry, name, email, password, phone } = req.body;
    if (!businessName || !email || !password || !name) {
      return res.status(400).json({ success: false, message: "Please fill all required registration fields." });
    }

    const existingUser = await db.get("SELECT id FROM users WHERE email = ?", [email.trim().toLowerCase()]);
    if (existingUser) {
      return res.status(400).json({ success: false, message: "An account with this email already exists." });
    }

    const slug = businessName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Math.floor(100 + Math.random() * 900);
    const bRes = await db.run(
      `INSERT INTO businesses (name, slug, industry, email, phone, currency, plan, plan_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [businessName.trim(), slug, industry || "general", email.trim(), phone || "", "INR", "starter", "active"]
    );
    const businessId = bRes.insertId;

    const passHash = hashPassword(password);
    const uRes = await db.run(
      `INSERT INTO users (business_id, name, email, password_hash, role)
       VALUES (?, ?, ?, ?, ?)`,
      [businessId, name.trim(), email.trim().toLowerCase(), passHash, "owner"]
    );

    // Default settings
    await db.run(
      `INSERT INTO business_settings (business_id, ai_system_prompt, brand_voice, ai_language_mode, auto_reply_enabled, notification_email, timezone)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        businessId,
        `You are the AI assistant for ${businessName}. Help clients with inquiries, bookings, and product questions.`,
        "Professional & Helpful",
        "auto",
        1,
        email.trim(),
        "Asia/Kolkata",
      ]
    );

    const token = signToken({
      userId: uRes.insertId,
      businessId,
      email: email.trim().toLowerCase(),
      role: "owner",
      name: name.trim(),
    });

    res.status(201).json({
      success: true,
      token,
      user: { id: uRes.insertId, name: name.trim(), email: email.trim().toLowerCase(), role: "owner" },
      business: { id: businessId, name: businessName.trim(), slug, industry: industry || "general", plan: "starter" },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get("/api/auth/me", authenticate, async (req, res) => {
  try {
    const user = await db.get("SELECT id, business_id, name, email, role, avatar FROM users WHERE id = ?", [req.user.userId || req.user.id]);
    const business = await db.get("SELECT * FROM businesses WHERE id = ?", [req.businessId]);
    res.json({ success: true, user, business });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get("/api/businesses", async (req, res) => {
  try {
    const businesses = await db.all("SELECT id, name, slug, industry, plan, is_demo FROM businesses ORDER BY id ASC");
    res.json({ success: true, businesses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 3. EXECUTIVE DASHBOARD & REAL METRICS
// ==========================================
app.get("/api/dashboard/stats", authenticate, async (req, res) => {
  try {
    const bId = req.businessId;

    // Leads metrics
    const totalLeadsRow = await db.get("SELECT COUNT(*) as count FROM leads WHERE business_id = ?", [bId]);
    const newLeadsRow = await db.get("SELECT COUNT(*) as count FROM leads WHERE business_id = ? AND status = 'new'", [bId]);
    const convertedLeadsRow = await db.get("SELECT COUNT(*) as count FROM leads WHERE business_id = ? AND status = 'converted'", [bId]);
    const totalLeads = totalLeadsRow ? totalLeadsRow.count : 0;
    const newLeads = newLeadsRow ? newLeadsRow.count : 0;
    const convertedLeads = convertedLeadsRow ? convertedLeadsRow.count : 0;
    const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;

    // Salon metrics
    const appointmentsRow = await db.get("SELECT COUNT(*) as count FROM salon_appointments WHERE business_id = ?", [bId]);
    const salonRevenueRow = await db.get("SELECT SUM(total_price) as sum FROM salon_appointments WHERE business_id = ? AND status IN ('confirmed', 'completed')", [bId]);

    // Cafe metrics
    const ordersRow = await db.get("SELECT COUNT(*) as count FROM cafe_orders WHERE business_id = ? AND status IN ('received', 'preparing', 'ready')", [bId]);
    const cafeRevenueRow = await db.get("SELECT SUM(total) as sum FROM cafe_orders WHERE business_id = ? AND status IN ('ready', 'served', 'completed')", [bId]);

    // Total calculated authorized revenue
    const totalRevenue = (Number(salonRevenueRow ? salonRevenueRow.sum : 0) || 0) + (Number(cafeRevenueRow ? cafeRevenueRow.sum : 0) || 0);

    // Recent Inbound Leads (strictly authorized)
    const recentLeads = await db.all(
      "SELECT id, name, email, phone, service, budget, status, created_at FROM leads WHERE business_id = ? ORDER BY id DESC LIMIT 5",
      [bId]
    );

    // Recent Activities
    const recentActivities = await db.all(
      "SELECT id, user_name, action, entity_type, details, created_at FROM activity_logs WHERE business_id = ? ORDER BY id DESC LIMIT 6",
      [bId]
    );

    // Unread Notifications Count
    const unreadNotifRow = await db.get("SELECT COUNT(*) as count FROM notifications WHERE business_id = ? AND is_read = 0", [bId]);

    res.json({
      success: true,
      stats: {
        totalLeads,
        newLeads,
        conversionRate,
        totalRevenue,
        appointmentsCount: appointmentsRow ? appointmentsRow.count : 0,
        activeOrdersCount: ordersRow ? ordersRow.count : 0,
        unreadNotifications: unreadNotifRow ? unreadNotifRow.count : 0,
      },
      recentLeads,
      recentActivities,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Notifications
app.get("/api/notifications", authenticate, async (req, res) => {
  try {
    const list = await db.all("SELECT * FROM notifications WHERE business_id = ? ORDER BY id DESC LIMIT 20", [req.businessId]);
    res.json({ success: true, notifications: list });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put("/api/notifications/:id/read", authenticate, async (req, res) => {
  try {
    await db.run("UPDATE notifications SET is_read = 1 WHERE id = ? AND business_id = ?", [req.params.id, req.businessId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put("/api/notifications/read-all", authenticate, async (req, res) => {
  try {
    await db.run("UPDATE notifications SET is_read = 1 WHERE business_id = ?", [req.businessId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get("/api/activities", authenticate, async (req, res) => {
  try {
    const list = await db.all("SELECT * FROM activity_logs WHERE business_id = ? ORDER BY id DESC LIMIT 50", [req.businessId]);
    res.json({ success: true, activities: list });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 4. CRM & INBOUND LEADS
// ==========================================
// Public contact & quote submission (compatible with agency website form)
const handlePublicInquiry = async (req, res) => {
  try {
    const { name, email, phone, service, budget, message, inquiry_type } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ success: false, message: "Please provide a valid name (at least 2 characters)." });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      return res.status(400).json({ success: false, message: "Please provide a valid email address." });
    }
    if (!message || message.trim().length < 5) {
      return res.status(400).json({ success: false, message: "Please provide a description (at least 5 characters)." });
    }

    const cleanName = name.trim().slice(0, 100);
    const cleanEmail = email.trim().slice(0, 150);
    const cleanPhone = phone ? String(phone).trim().slice(0, 50) : null;
    const cleanService = service ? String(service).trim().slice(0, 100) : null;
    const cleanBudget = budget ? String(budget).trim().slice(0, 50) : null;
    const cleanMessage = message.trim().slice(0, 5000);
    const cleanType = inquiry_type === "quote" ? "quote" : "contact";

    // 1. Insert into contacts table (backward compatibility)
    const cRes = await db.run(
      `INSERT INTO contacts (name, email, phone, service, budget, message, inquiry_type)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [cleanName, cleanEmail, cleanPhone, cleanService, cleanBudget, cleanMessage, cleanType]
    );

    // 2. Also insert into leads for Agency business (Business #3 or default business)
    const targetBusiness = await db.get("SELECT id FROM businesses WHERE industry = 'agency' LIMIT 1") || { id: 3 };
    const targetBId = targetBusiness.id || 1;

    await db.run(
      `INSERT INTO leads (business_id, name, email, phone, service, budget, source, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [targetBId, cleanName, cleanEmail, cleanPhone, cleanService, cleanBudget, `Website ${cleanType.toUpperCase()}`, "new", cleanMessage]
    );

    // 3. Create Notification & Activity Log
    await db.run(
      `INSERT INTO notifications (business_id, title, message, type, link)
       VALUES (?, ?, ?, ?, ?)`,
      [targetBId, `New Inbound ${cleanType === "quote" ? "Quote Request" : "Message"}`, `${cleanName} inquired about ${cleanService || "Services"}.`, "lead", "/app/leads"]
    );

    await db.run(
      `INSERT INTO activity_logs (business_id, user_name, action, entity_type, entity_id, details)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [targetBId, cleanName, "Inbound Lead Created", "lead", cRes.insertId, `Budget: ${cleanBudget || "Standard"}`]
    );

    res.status(201).json({
      success: true,
      message: cleanType === "quote" ? "Quote request submitted successfully!" : "Message submitted successfully!",
      id: cRes.insertId,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Database error: " + err.message });
  }
};

app.post("/api/contact", handlePublicInquiry);
app.post("/api/quote", handlePublicInquiry);

// Authorized Leads CRM endpoints
app.get("/api/leads", authenticate, async (req, res) => {
  try {
    const { status, search } = req.query;
    let sql = "SELECT * FROM leads WHERE business_id = ?";
    const params = [req.businessId];

    if (status && status !== "all") {
      sql += " AND status = ?";
      params.push(status);
    }
    if (search && search.trim()) {
      sql += " AND (name LIKE ? OR email LIKE ? OR phone LIKE ? OR service LIKE ?)";
      const pattern = `%${search.trim()}%`;
      params.push(pattern, pattern, pattern, pattern);
    }

    sql += " ORDER BY id DESC";
    const leads = await db.all(sql, params);
    res.json({ success: true, leads });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post("/api/leads", authenticate, async (req, res) => {
  try {
    const { name, email, phone, service, budget, source, status, notes } = req.body;
    if (!name || !email) {
      return res.status(400).json({ success: false, message: "Name and email are required." });
    }

    const result = await db.run(
      `INSERT INTO leads (business_id, name, email, phone, service, budget, source, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.businessId, name.trim(), email.trim(), phone || "", service || "", budget || "", source || "Manual Entry", status || "new", notes || ""]
    );

    await db.run(
      `INSERT INTO activity_logs (business_id, user_name, action, entity_type, entity_id, details)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.businessId, req.user.name || "User", "Created Lead", "lead", result.insertId, `Added lead ${name.trim()}`]
    );

    res.status(201).json({ success: true, id: result.insertId, message: "Lead added successfully." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put("/api/leads/:id", authenticate, async (req, res) => {
  try {
    const { status, notes, last_contacted_at, name, email, phone, service, budget } = req.body;
    const existing = await db.get("SELECT * FROM leads WHERE id = ? AND business_id = ?", [req.params.id, req.businessId]);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Lead not found." });
    }

    await db.run(
      `UPDATE leads SET
        status = COALESCE(?, status),
        notes = COALESCE(?, notes),
        last_contacted_at = COALESCE(?, last_contacted_at),
        name = COALESCE(?, name),
        email = COALESCE(?, email),
        phone = COALESCE(?, phone),
        service = COALESCE(?, service),
        budget = COALESCE(?, budget),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND business_id = ?`,
      [
        status || null,
        notes !== undefined ? notes : null,
        last_contacted_at || (status === "contacted" ? new Date().toISOString() : null),
        name || null,
        email || null,
        phone || null,
        service || null,
        budget || null,
        req.params.id,
        req.businessId,
      ]
    );

    // If converted, automatically ensure customer record exists
    if (status === "converted") {
      const cust = await db.get("SELECT id FROM customers WHERE business_id = ? AND email = ?", [req.businessId, existing.email]);
      if (!cust) {
        await db.run(
          `INSERT INTO customers (business_id, name, email, phone, notes, total_spend, visit_count, last_visit)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [req.businessId, existing.name, existing.email, existing.phone, "Converted from Inbound Lead", 5000, 1, new Date().toISOString()]
        );
      }
    }

    await db.run(
      `INSERT INTO activity_logs (business_id, user_name, action, entity_type, entity_id, details)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.businessId, req.user.name || "User", "Updated Lead", "lead", req.params.id, `Status updated to ${status || existing.status}`]
    );

    res.json({ success: true, message: "Lead updated successfully." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete("/api/leads/:id", authenticate, async (req, res) => {
  try {
    await db.run("DELETE FROM leads WHERE id = ? AND business_id = ?", [req.params.id, req.businessId]);
    res.json({ success: true, message: "Lead removed." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// CSV Export for Leads
app.get("/api/leads/export", authenticate, async (req, res) => {
  try {
    const leads = await db.all("SELECT id, name, email, phone, service, budget, source, status, created_at FROM leads WHERE business_id = ? ORDER BY id DESC", [req.businessId]);
    const headers = ["ID", "Name", "Email", "Phone", "Service", "Budget", "Source", "Status", "Created At"];
    const rows = leads.map((l) => [
      l.id,
      `"${(l.name || "").replace(/"/g, '""')}"`,
      `"${(l.email || "").replace(/"/g, '""')}"`,
      `"${(l.phone || "").replace(/"/g, '""')}"`,
      `"${(l.service || "").replace(/"/g, '""')}"`,
      `"${(l.budget || "").replace(/"/g, '""')}"`,
      `"${(l.source || "").replace(/"/g, '""')}"`,
      l.status,
      l.created_at,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="zynthor_leads_export.csv"');
    res.send(csvContent);
  } catch (err) {
    res.status(500).send("Export failed: " + err.message);
  }
});

// Customers
app.get("/api/customers", authenticate, async (req, res) => {
  try {
    const list = await db.all("SELECT * FROM customers WHERE business_id = ? ORDER BY total_spend DESC", [req.businessId]);
    res.json({ success: true, customers: list });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post("/api/customers", authenticate, async (req, res) => {
  try {
    const { name, email, phone, notes } = req.body;
    if (!name) return res.status(400).json({ success: false, message: "Name is required." });

    const result = await db.run(
      `INSERT INTO customers (business_id, name, email, phone, notes) VALUES (?, ?, ?, ?, ?)`,
      [req.businessId, name.trim(), email || "", phone || "", notes || ""]
    );
    res.status(201).json({ success: true, id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 5. SALON & SPA MODULE
// ==========================================
app.get("/api/salon/categories", authenticate, async (req, res) => {
  try {
    const categories = await db.all("SELECT * FROM salon_categories WHERE business_id = ? ORDER BY display_order ASC", [req.businessId]);
    res.json({ success: true, categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get("/api/salon/services", authenticate, async (req, res) => {
  try {
    const services = await db.all(
      `SELECT s.*, c.name as category_name
       FROM salon_services s
       LEFT JOIN salon_categories c ON s.category_id = c.id
       WHERE s.business_id = ? ORDER BY s.id DESC`,
      [req.businessId]
    );
    res.json({ success: true, services });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post("/api/salon/services", authenticate, async (req, res) => {
  try {
    const { name, category_id, description, duration_mins, price, image_url } = req.body;
    if (!name || price === undefined) {
      return res.status(400).json({ success: false, message: "Name and price are required." });
    }

    const result = await db.run(
      `INSERT INTO salon_services (business_id, category_id, name, description, duration_mins, price, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [req.businessId, category_id || null, name.trim(), description || "", Number(duration_mins) || 60, Number(price), image_url || ""]
    );

    res.status(201).json({ success: true, id: result.insertId, message: "Service added to catalogue." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put("/api/salon/services/:id", authenticate, async (req, res) => {
  try {
    const { name, category_id, description, duration_mins, price, image_url, is_active } = req.body;
    await db.run(
      `UPDATE salon_services SET
        name = COALESCE(?, name),
        category_id = COALESCE(?, category_id),
        description = COALESCE(?, description),
        duration_mins = COALESCE(?, duration_mins),
        price = COALESCE(?, price),
        image_url = COALESCE(?, image_url),
        is_active = COALESCE(?, is_active)
       WHERE id = ? AND business_id = ?`,
      [
        name || null,
        category_id !== undefined ? category_id : null,
        description !== undefined ? description : null,
        duration_mins ? Number(duration_mins) : null,
        price !== undefined ? Number(price) : null,
        image_url !== undefined ? image_url : null,
        is_active !== undefined ? is_active : null,
        req.params.id,
        req.businessId,
      ]
    );
    res.json({ success: true, message: "Service updated successfully." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete("/api/salon/services/:id", authenticate, async (req, res) => {
  try {
    await db.run("DELETE FROM salon_services WHERE id = ? AND business_id = ?", [req.params.id, req.businessId]);
    res.json({ success: true, message: "Service removed." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Staff
app.get("/api/salon/staff", authenticate, async (req, res) => {
  try {
    const staff = await db.all("SELECT * FROM salon_staff WHERE business_id = ? ORDER BY id ASC", [req.businessId]);
    res.json({ success: true, staff });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post("/api/salon/staff", authenticate, async (req, res) => {
  try {
    const { name, role, email, phone, avatar_url, working_days, start_time, end_time } = req.body;
    if (!name || !role) {
      return res.status(400).json({ success: false, message: "Name and role are required." });
    }

    const result = await db.run(
      `INSERT INTO salon_staff (business_id, name, role, email, phone, avatar_url, working_days, start_time, end_time)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.businessId, name.trim(), role.trim(), email || "", phone || "", avatar_url || "", working_days || "Mon,Tue,Wed,Thu,Fri,Sat", start_time || "09:00", end_time || "19:00"]
    );
    res.status(201).json({ success: true, id: result.insertId, message: "Staff member registered." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put("/api/salon/staff/:id", authenticate, async (req, res) => {
  try {
    const { name, role, email, phone, avatar_url, working_days, start_time, end_time, is_active } = req.body;
    await db.run(
      `UPDATE salon_staff SET
        name = COALESCE(?, name),
        role = COALESCE(?, role),
        email = COALESCE(?, email),
        phone = COALESCE(?, phone),
        avatar_url = COALESCE(?, avatar_url),
        working_days = COALESCE(?, working_days),
        start_time = COALESCE(?, start_time),
        end_time = COALESCE(?, end_time),
        is_active = COALESCE(?, is_active)
       WHERE id = ? AND business_id = ?`,
      [
        name || null,
        role || null,
        email !== undefined ? email : null,
        phone !== undefined ? phone : null,
        avatar_url !== undefined ? avatar_url : null,
        working_days || null,
        start_time || null,
        end_time || null,
        is_active !== undefined ? is_active : null,
        req.params.id,
        req.businessId,
      ]
    );
    res.json({ success: true, message: "Staff updated." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Appointments & Double Booking Prevention
app.get("/api/salon/appointments", authenticate, async (req, res) => {
  try {
    const { date, staff_id } = req.query;
    let sql = "SELECT * FROM salon_appointments WHERE business_id = ?";
    const params = [req.businessId];

    if (date) {
      sql += " AND appointment_date = ?";
      params.push(date);
    }
    if (staff_id) {
      sql += " AND staff_id = ?";
      params.push(staff_id);
    }

    sql += " ORDER BY appointment_date DESC, appointment_time ASC";
    const appointments = await db.all(sql, params);
    res.json({ success: true, appointments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post("/api/salon/appointments", authenticate, async (req, res) => {
  try {
    const { customer_name, customer_email, customer_phone, service_id, staff_id, appointment_date, appointment_time, notes } = req.body;

    if (!customer_name || !customer_phone || !service_id || !staff_id || !appointment_date || !appointment_time) {
      return res.status(400).json({ success: false, message: "Please fill all required appointment fields." });
    }

    // Double-Booking Check: Check if staff already has active booking at this date & time
    const conflict = await db.get(
      `SELECT id, customer_name, appointment_time FROM salon_appointments
       WHERE business_id = ? AND staff_id = ? AND appointment_date = ? AND appointment_time = ? AND status != 'cancelled'`,
      [req.businessId, staff_id, appointment_date, appointment_time]
    );

    if (conflict) {
      return res.status(409).json({
        success: false,
        message: `Schedule Conflict: The selected specialist already has an active appointment at ${appointment_time} on ${appointment_date}. Please choose another time slot.`,
      });
    }

    const service = await db.get("SELECT name, price FROM salon_services WHERE id = ?", [service_id]);
    const staff = await db.get("SELECT name FROM salon_staff WHERE id = ?", [staff_id]);

    const serviceName = service ? service.name : "Custom Treatment";
    const staffName = staff ? staff.name : "Specialist";
    const price = service ? service.price : 1000;

    const result = await db.run(
      `INSERT INTO salon_appointments (business_id, customer_name, customer_email, customer_phone, service_id, service_name, staff_id, staff_name, appointment_date, appointment_time, status, notes, total_price)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.businessId, customer_name.trim(), customer_email || "", customer_phone.trim(), service_id, serviceName, staff_id, staffName, appointment_date, appointment_time, "confirmed", notes || "", price]
    );

    // Auto customer record
    const existingCust = await db.get("SELECT id, visit_count, total_spend FROM customers WHERE business_id = ? AND phone = ?", [req.businessId, customer_phone.trim()]);
    if (existingCust) {
      await db.run("UPDATE customers SET visit_count = visit_count + 1, total_spend = total_spend + ?, last_visit = ? WHERE id = ?", [price, appointment_date, existingCust.id]);
    } else {
      await db.run("INSERT INTO customers (business_id, name, email, phone, total_spend, visit_count, last_visit) VALUES (?, ?, ?, ?, ?, 1, ?)", [req.businessId, customer_name.trim(), customer_email || "", customer_phone.trim(), price, appointment_date]);
    }

    // Activity Log & Notification
    await db.run(
      `INSERT INTO notifications (business_id, title, message, type, link)
       VALUES (?, ?, ?, ?, ?)`,
      [req.businessId, "New Appointment Confirmed", `${customer_name} booked ${serviceName} with ${staffName} on ${appointment_date} at ${appointment_time}.`, "booking", "/app/salon"]
    );

    res.status(201).json({ success: true, id: result.insertId, message: "Appointment confirmed without conflict." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put("/api/salon/appointments/:id", authenticate, async (req, res) => {
  try {
    const { status, notes, appointment_date, appointment_time } = req.body;
    await db.run(
      `UPDATE salon_appointments SET
        status = COALESCE(?, status),
        notes = COALESCE(?, notes),
        appointment_date = COALESCE(?, appointment_date),
        appointment_time = COALESCE(?, appointment_time)
       WHERE id = ? AND business_id = ?`,
      [status || null, notes !== undefined ? notes : null, appointment_date || null, appointment_time || null, req.params.id, req.businessId]
    );
    res.json({ success: true, message: "Appointment updated." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete("/api/salon/appointments/:id", authenticate, async (req, res) => {
  try {
    await db.run("DELETE FROM salon_appointments WHERE id = ? AND business_id = ?", [req.params.id, req.businessId]);
    res.json({ success: true, message: "Appointment removed." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get("/api/salon/packages", authenticate, async (req, res) => {
  try {
    const packages = await db.all("SELECT * FROM salon_packages WHERE business_id = ? ORDER BY id ASC", [req.businessId]);
    res.json({ success: true, packages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Public customer booking portal data
app.get("/api/salon/public/:slug", async (req, res) => {
  try {
    const business = await db.get("SELECT id, name, slug, phone, email, address, industry FROM businesses WHERE slug = ?", [req.params.slug]);
    if (!business) return res.status(404).json({ success: false, message: "Salon not found." });

    const categories = await db.all("SELECT * FROM salon_categories WHERE business_id = ? ORDER BY display_order ASC", [business.id]);
    const services = await db.all("SELECT * FROM salon_services WHERE business_id = ? AND is_active = 1", [business.id]);
    const staff = await db.all("SELECT id, name, role, avatar_url, working_days, start_time, end_time FROM salon_staff WHERE business_id = ? AND is_active = 1", [business.id]);

    res.json({ success: true, business, categories, services, staff });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post("/api/salon/public/book", async (req, res) => {
  try {
    const { slug, customer_name, customer_email, customer_phone, service_id, staff_id, appointment_date, appointment_time, notes } = req.body;
    const business = await db.get("SELECT id, name FROM businesses WHERE slug = ?", [slug]);
    if (!business) return res.status(404).json({ success: false, message: "Salon not found." });

    // Double booking check
    const conflict = await db.get(
      `SELECT id FROM salon_appointments
       WHERE business_id = ? AND staff_id = ? AND appointment_date = ? AND appointment_time = ? AND status != 'cancelled'`,
      [business.id, staff_id, appointment_date, appointment_time]
    );
    if (conflict) {
      return res.status(409).json({ success: false, message: "This slot is already reserved. Please select another time." });
    }

    const service = await db.get("SELECT name, price FROM salon_services WHERE id = ?", [service_id]);
    const staff = await db.get("SELECT name FROM salon_staff WHERE id = ?", [staff_id]);

    const result = await db.run(
      `INSERT INTO salon_appointments (business_id, customer_name, customer_email, customer_phone, service_id, service_name, staff_id, staff_name, appointment_date, appointment_time, status, notes, total_price)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [business.id, customer_name.trim(), customer_email || "", customer_phone.trim(), service_id, service ? service.name : "", staff_id, staff ? staff.name : "", appointment_date, appointment_time, "confirmed", notes || "", service ? service.price : 0]
    );

    await db.run(
      `INSERT INTO notifications (business_id, title, message, type, link)
       VALUES (?, ?, ?, ?, ?)`,
      [business.id, "New Online Client Booking", `${customer_name} booked ${service ? service.name : "treatment"} for ${appointment_date} at ${appointment_time}.`, "booking", "/app/salon"]
    );

    res.status(201).json({ success: true, id: result.insertId, message: "Booking confirmed successfully!" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 6. CAFE & RESTAURANT MODULE
// ==========================================
app.get("/api/cafe/categories", authenticate, async (req, res) => {
  try {
    const list = await db.all("SELECT * FROM cafe_categories WHERE business_id = ? ORDER BY display_order ASC", [req.businessId]);
    res.json({ success: true, categories: list });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get("/api/cafe/dishes", authenticate, async (req, res) => {
  try {
    const dishes = await db.all(
      `SELECT d.*, c.name as category_name
       FROM cafe_dishes d
       LEFT JOIN cafe_categories c ON d.category_id = c.id
       WHERE d.business_id = ? ORDER BY d.id DESC`,
      [req.businessId]
    );
    res.json({ success: true, dishes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post("/api/cafe/dishes", authenticate, async (req, res) => {
  try {
    const { name, category_id, description, price, is_veg, is_available, image_url, prep_time_mins, calories, addons } = req.body;
    if (!name || price === undefined) {
      return res.status(400).json({ success: false, message: "Dish name and price are required." });
    }

    const result = await db.run(
      `INSERT INTO cafe_dishes (business_id, category_id, name, description, price, is_veg, is_available, image_url, prep_time_mins, calories, addons_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.businessId,
        category_id || null,
        name.trim(),
        description || "",
        Number(price),
        is_veg !== undefined ? Number(is_veg) : 1,
        is_available !== undefined ? Number(is_available) : 1,
        image_url || "",
        Number(prep_time_mins) || 15,
        Number(calories) || 350,
        addons ? JSON.stringify(addons) : null,
      ]
    );

    res.status(201).json({ success: true, id: result.insertId, message: "Dish created." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put("/api/cafe/dishes/:id", authenticate, async (req, res) => {
  try {
    const { name, category_id, description, price, is_veg, is_available, image_url, prep_time_mins, calories } = req.body;
    await db.run(
      `UPDATE cafe_dishes SET
        name = COALESCE(?, name),
        category_id = COALESCE(?, category_id),
        description = COALESCE(?, description),
        price = COALESCE(?, price),
        is_veg = COALESCE(?, is_veg),
        is_available = COALESCE(?, is_available),
        image_url = COALESCE(?, image_url),
        prep_time_mins = COALESCE(?, prep_time_mins),
        calories = COALESCE(?, calories)
       WHERE id = ? AND business_id = ?`,
      [
        name || null,
        category_id !== undefined ? category_id : null,
        description !== undefined ? description : null,
        price !== undefined ? Number(price) : null,
        is_veg !== undefined ? Number(is_veg) : null,
        is_available !== undefined ? Number(is_available) : null,
        image_url !== undefined ? image_url : null,
        prep_time_mins !== undefined ? Number(prep_time_mins) : null,
        calories !== undefined ? Number(calories) : null,
        req.params.id,
        req.businessId,
      ]
    );
    res.json({ success: true, message: "Dish updated successfully." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete("/api/cafe/dishes/:id", authenticate, async (req, res) => {
  try {
    await db.run("DELETE FROM cafe_dishes WHERE id = ? AND business_id = ?", [req.params.id, req.businessId]);
    res.json({ success: true, message: "Dish deleted." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Tables & Live Orders
app.get("/api/cafe/tables", authenticate, async (req, res) => {
  try {
    const tables = await db.all("SELECT * FROM cafe_tables WHERE business_id = ? ORDER BY id ASC", [req.businessId]);
    res.json({ success: true, tables });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put("/api/cafe/tables/:id", authenticate, async (req, res) => {
  try {
    const { status } = req.body;
    await db.run("UPDATE cafe_tables SET status = ? WHERE id = ? AND business_id = ?", [status, req.params.id, req.businessId]);
    res.json({ success: true, message: "Table status updated." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get("/api/cafe/orders", authenticate, async (req, res) => {
  try {
    const orders = await db.all("SELECT * FROM cafe_orders WHERE business_id = ? ORDER BY id DESC", [req.businessId]);
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post("/api/cafe/orders", authenticate, async (req, res) => {
  try {
    const { table_number, order_type, customer_name, customer_phone, items, notes } = req.body;
    if (!items || !items.length) {
      return res.status(400).json({ success: false, message: "Order must contain at least one item." });
    }

    const subtotal = items.reduce((acc, it) => acc + (it.price * (it.qty || 1)), 0);
    const tax = Math.round(subtotal * 0.05 * 100) / 100;
    const total = subtotal + tax;

    const result = await db.run(
      `INSERT INTO cafe_orders (business_id, table_number, order_type, customer_name, customer_phone, items_json, subtotal, tax, total, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.businessId, table_number || "T-01", order_type || "dine_in", customer_name || "Guest", customer_phone || "", JSON.stringify(items), subtotal, tax, total, "received", notes || ""]
    );

    // Update table status to occupied if dine_in
    if (order_type === "dine_in" && table_number) {
      await db.run("UPDATE cafe_tables SET status = 'occupied' WHERE business_id = ? AND table_number = ?", [req.businessId, table_number]);
    }

    await db.run(
      `INSERT INTO notifications (business_id, title, message, type, link)
       VALUES (?, ?, ?, ?, ?)`,
      [req.businessId, `Order #${result.insertId} Placed`, `${table_number || "Takeaway"} — ₹${total}`, "order", "/app/cafe"]
    );

    res.status(201).json({ success: true, id: result.insertId, message: "Order sent to Kitchen Display System." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put("/api/cafe/orders/:id", authenticate, async (req, res) => {
  try {
    const { status } = req.body;
    await db.run("UPDATE cafe_orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND business_id = ?", [status, req.params.id, req.businessId]);
    res.json({ success: true, message: `Order marked as ${status}` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Reservations
app.get("/api/cafe/reservations", authenticate, async (req, res) => {
  try {
    const list = await db.all("SELECT * FROM cafe_reservations WHERE business_id = ? ORDER BY reservation_date DESC, reservation_time ASC", [req.businessId]);
    res.json({ success: true, reservations: list });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post("/api/cafe/reservations", authenticate, async (req, res) => {
  try {
    const { customer_name, customer_phone, customer_email, party_size, reservation_date, reservation_time, table_number, special_requests } = req.body;
    if (!customer_name || !customer_phone || !reservation_date || !reservation_time) {
      return res.status(400).json({ success: false, message: "All reservation details are required." });
    }

    const result = await db.run(
      `INSERT INTO cafe_reservations (business_id, customer_name, customer_phone, customer_email, party_size, reservation_date, reservation_time, table_number, status, special_requests)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.businessId, customer_name.trim(), customer_phone.trim(), customer_email || "", Number(party_size) || 2, reservation_date, reservation_time, table_number || "T-01", "confirmed", special_requests || ""]
    );
    res.status(201).json({ success: true, id: result.insertId, message: "Table reservation confirmed." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Public digital QR menu
app.get("/api/cafe/public/:slug", async (req, res) => {
  try {
    const business = await db.get("SELECT id, name, slug, phone, email, address, industry FROM businesses WHERE slug = ?", [req.params.slug]);
    if (!business) return res.status(404).json({ success: false, message: "Cafe not found." });

    const categories = await db.all("SELECT * FROM cafe_categories WHERE business_id = ? ORDER BY display_order ASC", [business.id]);
    const dishes = await db.all("SELECT * FROM cafe_dishes WHERE business_id = ? AND is_available = 1", [business.id]);

    res.json({ success: true, business, categories, dishes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 7. AI BOT & AUTOMATION
// ==========================================
app.post("/api/ai/chat", authenticate, async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: "Message is required." });
    }

    const response = await generateAIResponse(req.businessId, message.trim(), conversationHistory || []);

    // Log AI interaction
    const conv = await db.run(
      "INSERT INTO ai_conversations (business_id, session_id, customer_name) VALUES (?, ?, ?)",
      [req.businessId, "sess_" + Date.now(), req.user.name || "App Client"]
    );
    await db.run(
      "INSERT INTO ai_messages (conversation_id, sender, message, intent) VALUES (?, ?, ?, ?)",
      [conv.insertId, "user", message.trim(), response.intent]
    );
    await db.run(
      "INSERT INTO ai_messages (conversation_id, sender, message, intent, suggested_actions_json) VALUES (?, ?, ?, ?, ?)",
      [conv.insertId, "assistant", response.message, response.intent, JSON.stringify(response.suggestedActions)]
    );

    res.json({ success: true, ...response });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get("/api/ai/rules", authenticate, async (req, res) => {
  try {
    const rules = await db.all("SELECT * FROM automation_rules WHERE business_id = ? ORDER BY id ASC", [req.businessId]);
    res.json({ success: true, rules });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put("/api/ai/rules/:id", authenticate, async (req, res) => {
  try {
    const { is_enabled } = req.body;
    await db.run("UPDATE automation_rules SET is_enabled = ? WHERE id = ? AND business_id = ?", [Number(is_enabled), req.params.id, req.businessId]);
    res.json({ success: true, message: "Automation rule updated." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get("/api/ai/logs", authenticate, async (req, res) => {
  try {
    const logs = await db.all("SELECT * FROM automation_logs WHERE business_id = ? ORDER BY id DESC LIMIT 30", [req.businessId]);
    res.json({ success: true, logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 8. SETTINGS, TEAM ROLES & SUBSCRIPTION
// ==========================================
app.get("/api/settings", authenticate, async (req, res) => {
  try {
    const settings = await db.get("SELECT * FROM business_settings WHERE business_id = ?", [req.businessId]);
    const business = await db.get("SELECT * FROM businesses WHERE id = ?", [req.businessId]);
    res.json({ success: true, settings, business });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put("/api/settings", authenticate, async (req, res) => {
  try {
    const { ai_system_prompt, brand_voice, ai_language_mode, auto_reply_enabled, notification_email, timezone, businessName, phone, address } = req.body;

    if (businessName || phone || address) {
      await db.run(
        `UPDATE businesses SET
          name = COALESCE(?, name),
          phone = COALESCE(?, phone),
          address = COALESCE(?, address),
          updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [businessName || null, phone || null, address || null, req.businessId]
      );
    }

    await db.run(
      `UPDATE business_settings SET
        ai_system_prompt = COALESCE(?, ai_system_prompt),
        brand_voice = COALESCE(?, brand_voice),
        ai_language_mode = COALESCE(?, ai_language_mode),
        auto_reply_enabled = COALESCE(?, auto_reply_enabled),
        notification_email = COALESCE(?, notification_email),
        timezone = COALESCE(?, timezone),
        updated_at = CURRENT_TIMESTAMP
       WHERE business_id = ?`,
      [
        ai_system_prompt !== undefined ? ai_system_prompt : null,
        brand_voice || null,
        ai_language_mode || null,
        auto_reply_enabled !== undefined ? Number(auto_reply_enabled) : null,
        notification_email || null,
        timezone || null,
        req.businessId,
      ]
    );

    res.json({ success: true, message: "Settings saved successfully." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get("/api/team", authenticate, async (req, res) => {
  try {
    const members = await db.all("SELECT id, name, email, role, avatar, created_at FROM users WHERE business_id = ? ORDER BY id ASC", [req.businessId]);
    res.json({ success: true, members });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post("/api/team", authenticate, requireRole(["owner", "admin"]), async (req, res) => {
  try {
    const { name, email, role, password } = req.body;
    if (!name || !email) {
      return res.status(400).json({ success: false, message: "Name and email are required." });
    }

    const passHash = hashPassword(password || "Zynthor@2026");
    const result = await db.run(
      `INSERT INTO users (business_id, name, email, password_hash, role)
       VALUES (?, ?, ?, ?, ?)`,
      [req.businessId, name.trim(), email.trim().toLowerCase(), passHash, role || "staff"]
    );
    res.status(201).json({ success: true, id: result.insertId, message: "Team member invited." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get("/api/subscription", authenticate, async (req, res) => {
  try {
    const b = await db.get("SELECT plan, plan_status FROM businesses WHERE id = ?", [req.businessId]);
    res.json({
      success: true,
      currentPlan: b ? b.plan : "growth",
      status: b ? b.plan_status : "active",
      limits: {
        starter: { maxLeads: 100, maxStaff: 3, maxDishes: 30 },
        growth: { maxLeads: 1000, maxStaff: 15, maxDishes: 150 },
        enterprise: { maxLeads: "Unlimited", maxStaff: "Unlimited", maxDishes: "Unlimited" },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post("/api/subscription/upgrade", authenticate, async (req, res) => {
  try {
    const { plan } = req.body;
    if (!["starter", "growth", "enterprise"].includes(plan)) {
      return res.status(400).json({ success: false, message: "Invalid plan selected." });
    }
    await db.run("UPDATE businesses SET plan = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [plan, req.businessId]);
    res.json({ success: true, message: `Successfully upgraded to ${plan.toUpperCase()} tier.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`[Zynthor Business OS API] Listening on port ${PORT}`);
});

module.exports = app;
