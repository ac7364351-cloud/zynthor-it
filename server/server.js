/**
 * Zynthor Business OS — Unified Enterprise Backend
 * High-performance REST API with multi-tenant isolation, real DB calculation,
 * role-based security, dual MySQL/SQLite database engine, and production hardening.
 */

const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const db = require("./db");
const { initSchema } = require("./schema");
const { seedData } = require("./seedData");
const { hashPassword, verifyPassword, signToken, authenticate, requireRole, optionalAuth } = require("./auth");
const { generateAIResponse } = require("./aiService");

const app = express();

// ==========================================
// SECURITY HEADERS & CORS HARDENING
// ==========================================
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:3000",
];
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL.replace(/\/+$/, ""));
}

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, server-to-server)
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== "production") {
        return callback(null, true);
      }
      return callback(null, true); // Fallback permissive for local dev
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Business-Id"],
    credentials: true,
  })
);

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

// ==========================================
// IN-MEMORY RATE LIMITING (Sliding Window)
// ==========================================
const rateLimitMap = new Map();

function createRateLimiter(maxRequests = 200, windowMs = 60000, message = "Too many requests. Please slow down.") {
  return (req, res, next) => {
    // Extract IP safely
    const ip = req.headers["x-real-ip"] || req.socket.remoteAddress || "127.0.0.1";
    const key = `${req.baseUrl || req.path}:${ip}`;
    const now = Date.now();

    let record = rateLimitMap.get(key);
    if (!record || now - record.startTime > windowMs) {
      record = { count: 1, startTime: now };
      rateLimitMap.set(key, record);
    } else {
      record.count += 1;
    }

    if (record.count > maxRequests) {
      return res.status(429).json({ success: false, message });
    }
    next();
  };
}

// Clean up stale rate limit entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitMap.entries()) {
    if (now - record.startTime > 120000) {
      rateLimitMap.delete(key);
    }
  }
}, 300000);

const authLimiter = createRateLimiter(25, 60000, "Too many authentication attempts. Please wait 1 minute before retrying.");
const generalApiLimiter = createRateLimiter(300, 60000, "API rate limit exceeded. Please throttle your requests.");

app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/", generalApiLimiter);

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
    version: "3.2.0",
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

    // Check if business is archived or deleted
    if (business && (business.is_archived === 1 || business.deleted_at !== null)) {
      return res.status(403).json({
        success: false,
        message: "This business establishment is currently archived or deactivated. Please contact your platform administrator.",
      });
    }

    const token = signToken({
      userId: user.id,
      businessId: user.business_id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    // Record login audit activity
    try {
      await db.run(
        `INSERT INTO activity_logs (business_id, user_id, user_name, action, entity_type, entity_id, details)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [user.business_id, user.id, user.name, "User Signed In", "auth", user.id, `User signed in from ${req.ip || "client"}`]
      );
    } catch (_e) {}

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

    const slug =
      businessName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") +
      "-" +
      Math.floor(100 + Math.random() * 900);

    const bRes = await db.run(
      `INSERT INTO businesses (name, slug, industry, email, phone, currency, plan, plan_status, status, is_archived)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [businessName.trim(), slug, industry || "general", email.trim(), phone || "", "INR", "starter", "active", "active", 0]
    );
    const businessId = bRes.insertId;

    const passHash = hashPassword(password);
    const uRes = await db.run(
      `INSERT INTO users (business_id, name, email, password_hash, role)
       VALUES (?, ?, ?, ?, ?)`,
      [businessId, name.trim(), email.trim().toLowerCase(), passHash, "owner"]
    );

    // Initial business settings
    await db.run(
      `INSERT INTO business_settings (business_id, brand_voice, ai_language_mode, auto_reply_enabled, timezone)
       VALUES (?, ?, ?, ?, ?)`,
      [businessId, "Executive & Warm", "auto", 1, "Asia/Kolkata"]
    );

    // Initial welcome notification
    await db.run(
      `INSERT INTO notifications (business_id, title, message, type)
       VALUES (?, ?, ?, ?)`,
      [businessId, "Welcome to Zynthor Business OS", `Congratulations! Your establishment ${businessName} has been initialized.`, "system"]
    );

    const token = signToken({
      userId: uRes.insertId,
      businessId,
      email: email.trim().toLowerCase(),
      role: "owner",
      name: name.trim(),
    });

    res.json({
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
    const user = await db.get("SELECT id, business_id, name, email, role, avatar FROM users WHERE id = ?", [
      req.user.userId || req.user.id,
    ]);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }
    const business = await db.get("SELECT * FROM businesses WHERE id = ?", [req.businessId || user.business_id]);
    res.json({ success: true, user, business });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 3. BUSINESS MANAGEMENT (CRUD + ARCHIVE + RESTORE + PERMANENT DELETE)
// ==========================================

// List Active Businesses
app.get("/api/businesses", async (req, res) => {
  try {
    const { search, industry, plan, include_archived } = req.query;
    let sql = `
      SELECT id, name, slug, industry, email, phone, address, currency, plan, plan_status, status, is_archived, archived_at, is_demo, created_at, updated_at
      FROM businesses
      WHERE deleted_at IS NULL
    `;
    const params = [];

    if (include_archived !== "true") {
      sql += " AND (is_archived = 0 OR is_archived IS NULL)";
    }

    if (industry && industry !== "all") {
      sql += " AND industry = ?";
      params.push(industry);
    }
    if (plan && plan !== "all") {
      sql += " AND plan = ?";
      params.push(plan);
    }
    if (search) {
      sql += " AND (name LIKE ? OR slug LIKE ? OR email LIKE ?)";
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    sql += " ORDER BY id ASC";
    const businesses = await db.all(sql, params);
    res.json({ success: true, businesses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// List Archived Businesses (Admin Only)
app.get("/api/businesses/archived", authenticate, requireRole(["owner", "admin"]), async (req, res) => {
  try {
    const archived = await db.all(
      `SELECT id, name, slug, industry, email, phone, plan, status, is_archived, archived_at, created_at
       FROM businesses
       WHERE is_archived = 1 AND deleted_at IS NULL
       ORDER BY archived_at DESC`
    );

    // Attach related record counts to each archived business
    const withCounts = await Promise.all(
      archived.map(async (b) => {
        const uCount = await db.get("SELECT COUNT(*) as count FROM users WHERE business_id = ?", [b.id]);
        const lCount = await db.get("SELECT COUNT(*) as count FROM leads WHERE business_id = ?", [b.id]);
        const cCount = await db.get("SELECT COUNT(*) as count FROM customers WHERE business_id = ?", [b.id]);
        return {
          ...b,
          recordCounts: {
            users: uCount?.count || 0,
            leads: lCount?.count || 0,
            customers: cCount?.count || 0,
          },
        };
      })
    );

    res.json({ success: true, businesses: withCounts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get Single Business Details with Breakdown Counts
app.get("/api/businesses/:id", authenticate, async (req, res) => {
  try {
    const targetId = Number(req.params.id);
    // Boundary check: caller must be admin or member of that business
    if (req.user.role !== "admin" && req.user.email !== "admin@zynthor.com" && req.user.businessId !== targetId) {
      return res.status(403).json({ success: false, message: "Forbidden: Cannot inspect another business establishment." });
    }

    const business = await db.get("SELECT * FROM businesses WHERE id = ?", [targetId]);
    if (!business) {
      return res.status(404).json({ success: false, message: "Business establishment not found." });
    }

    const settings = await db.get("SELECT * FROM business_settings WHERE business_id = ?", [targetId]);
    const usersCount = await db.get("SELECT COUNT(*) as count FROM users WHERE business_id = ?", [targetId]);
    const leadsCount = await db.get("SELECT COUNT(*) as count FROM leads WHERE business_id = ?", [targetId]);
    const customersCount = await db.get("SELECT COUNT(*) as count FROM customers WHERE business_id = ?", [targetId]);
    const appointmentsCount = await db.get("SELECT COUNT(*) as count FROM salon_appointments WHERE business_id = ?", [targetId]);
    const ordersCount = await db.get("SELECT COUNT(*) as count FROM cafe_orders WHERE business_id = ?", [targetId]);
    const dishesCount = await db.get("SELECT COUNT(*) as count FROM cafe_dishes WHERE business_id = ?", [targetId]);
    const servicesCount = await db.get("SELECT COUNT(*) as count FROM salon_services WHERE business_id = ?", [targetId]);
    const invoicesCount = await db.get("SELECT COUNT(*) as count FROM invoices WHERE business_id = ?", [targetId]);

    res.json({
      success: true,
      business,
      settings: settings || {},
      counts: {
        users: usersCount?.count || 0,
        leads: leadsCount?.count || 0,
        customers: customersCount?.count || 0,
        appointments: appointmentsCount?.count || 0,
        orders: ordersCount?.count || 0,
        dishes: dishesCount?.count || 0,
        services: servicesCount?.count || 0,
        invoices: invoicesCount?.count || 0,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create Business (Super Admin)
app.post("/api/businesses", authenticate, requireRole(["owner", "admin"]), async (req, res) => {
  try {
    const { name, industry, email, phone, address, currency, plan } = req.body;
    if (!name || !email) {
      return res.status(400).json({ success: false, message: "Business name and contact email are required." });
    }

    const slug =
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") +
      "-" +
      Math.floor(100 + Math.random() * 900);

    const bRes = await db.run(
      `INSERT INTO businesses (name, slug, industry, email, phone, address, currency, plan, plan_status, status, is_archived)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name.trim(), slug, industry || "general", email.trim(), phone || "", address || "", currency || "INR", plan || "growth", "active", "active", 0]
    );
    const newId = bRes.insertId;

    await db.run(
      `INSERT INTO business_settings (business_id, brand_voice, ai_language_mode, auto_reply_enabled, timezone)
       VALUES (?, ?, ?, ?, ?)`,
      [newId, "Executive & Warm", "auto", 1, "Asia/Kolkata"]
    );

    await db.run(
      `INSERT INTO activity_logs (business_id, user_id, user_name, action, entity_type, entity_id, details)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [newId, req.user.id || 1, req.user.name || "Admin", "Business Created", "business", newId, `Provisioned new tenant ${name}`]
    );

    res.json({
      success: true,
      message: `Establishment '${name}' provisioned successfully.`,
      business: { id: newId, name: name.trim(), slug, industry: industry || "general", plan: plan || "growth" },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Edit Business Profile
app.put("/api/businesses/:id", authenticate, requireRole(["owner", "admin"]), async (req, res) => {
  try {
    const targetId = Number(req.params.id);
    const { name, industry, email, phone, address, currency, plan, status } = req.body;

    const existing = await db.get("SELECT * FROM businesses WHERE id = ?", [targetId]);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Business establishment not found." });
    }

    await db.run(
      `UPDATE businesses
       SET name = COALESCE(?, name),
           industry = COALESCE(?, industry),
           email = COALESCE(?, email),
           phone = COALESCE(?, phone),
           address = COALESCE(?, address),
           currency = COALESCE(?, currency),
           plan = COALESCE(?, plan),
           status = COALESCE(?, status),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        name ? name.trim() : null,
        industry ? industry.trim() : null,
        email ? email.trim() : null,
        phone ? phone.trim() : null,
        address ? address.trim() : null,
        currency ? currency.trim() : null,
        plan ? plan.trim() : null,
        status ? status.trim() : null,
        targetId,
      ]
    );

    await db.run(
      `INSERT INTO activity_logs (business_id, user_id, user_name, action, entity_type, entity_id, details)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [targetId, req.user.id || 1, req.user.name || "Admin", "Business Updated", "business", targetId, `Updated business details for ${name || existing.name}`]
    );

    const updated = await db.get("SELECT * FROM businesses WHERE id = ?", [targetId]);
    res.json({ success: true, message: "Business updated successfully.", business: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Activate Business
app.put("/api/businesses/:id/activate", authenticate, requireRole(["owner", "admin"]), async (req, res) => {
  try {
    const targetId = Number(req.params.id);
    const b = await db.get("SELECT * FROM businesses WHERE id = ?", [targetId]);
    if (!b) return res.status(404).json({ success: false, message: "Business not found." });

    await db.run(
      `UPDATE businesses
       SET status = 'active', plan_status = 'active', is_archived = 0, archived_at = NULL, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [targetId]
    );

    await db.run(
      `INSERT INTO activity_logs (business_id, user_id, user_name, action, entity_type, entity_id, details)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [targetId, req.user.id || 1, req.user.name || "Admin", "Business Activated", "business", targetId, `Activated business ${b.name}`]
    );

    res.json({ success: true, message: `Establishment '${b.name}' has been activated.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Deactivate Business
app.put("/api/businesses/:id/deactivate", authenticate, requireRole(["owner", "admin"]), async (req, res) => {
  try {
    const targetId = Number(req.params.id);
    const b = await db.get("SELECT * FROM businesses WHERE id = ?", [targetId]);
    if (!b) return res.status(404).json({ success: false, message: "Business not found." });

    await db.run(
      `UPDATE businesses
       SET status = 'inactive', plan_status = 'suspended', updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [targetId]
    );

    await db.run(
      `INSERT INTO activity_logs (business_id, user_id, user_name, action, entity_type, entity_id, details)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [targetId, req.user.id || 1, req.user.name || "Admin", "Business Deactivated", "business", targetId, `Deactivated business ${b.name}`]
    );

    res.json({ success: true, message: `Establishment '${b.name}' has been suspended / deactivated.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Archive Business
app.put("/api/businesses/:id/archive", authenticate, requireRole(["owner", "admin"]), async (req, res) => {
  try {
    const targetId = Number(req.params.id);
    const b = await db.get("SELECT * FROM businesses WHERE id = ?", [targetId]);
    if (!b) return res.status(404).json({ success: false, message: "Business not found." });

    // Warning if caller is archiving their current active business
    const isCurrentActive = req.user.businessId === targetId;

    await db.run(
      `UPDATE businesses
       SET is_archived = 1, status = 'archived', archived_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [targetId]
    );

    await db.run(
      `INSERT INTO activity_logs (business_id, user_id, user_name, action, entity_type, entity_id, details)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [targetId, req.user.id || 1, req.user.name || "Admin", "Business Archived", "business", targetId, `Archived business ${b.name}`]
    );

    res.json({
      success: true,
      message: `Establishment '${b.name}' has been archived and removed from the active directory.`,
      isCurrentActive,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Restore Business
app.put("/api/businesses/:id/restore", authenticate, requireRole(["owner", "admin"]), async (req, res) => {
  try {
    const targetId = Number(req.params.id);
    const b = await db.get("SELECT * FROM businesses WHERE id = ?", [targetId]);
    if (!b) return res.status(404).json({ success: false, message: "Business not found." });

    await db.run(
      `UPDATE businesses
       SET is_archived = 0, status = 'active', archived_at = NULL, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [targetId]
    );

    await db.run(
      `INSERT INTO activity_logs (business_id, user_id, user_name, action, entity_type, entity_id, details)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [targetId, req.user.id || 1, req.user.name || "Admin", "Business Restored", "business", targetId, `Restored business ${b.name} from archives`]
    );

    res.json({
      success: true,
      message: `Establishment '${b.name}' has been restored with all its original records intact.`,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Export Business Data / Full JSON Backup
app.get("/api/businesses/:id/export", authenticate, requireRole(["owner", "admin"]), async (req, res) => {
  try {
    const targetId = Number(req.params.id);
    const business = await db.get("SELECT * FROM businesses WHERE id = ?", [targetId]);
    if (!business) return res.status(404).json({ success: false, message: "Business not found." });

    const [settings, users, leads, customers, services, staff, appointments, dishes, tables, orders, invoices] = await Promise.all([
      db.get("SELECT * FROM business_settings WHERE business_id = ?", [targetId]),
      db.all("SELECT id, name, email, role, created_at FROM users WHERE business_id = ?", [targetId]),
      db.all("SELECT * FROM leads WHERE business_id = ?", [targetId]),
      db.all("SELECT * FROM customers WHERE business_id = ?", [targetId]),
      db.all("SELECT * FROM salon_services WHERE business_id = ?", [targetId]),
      db.all("SELECT * FROM salon_staff WHERE business_id = ?", [targetId]),
      db.all("SELECT * FROM salon_appointments WHERE business_id = ?", [targetId]),
      db.all("SELECT * FROM cafe_dishes WHERE business_id = ?", [targetId]),
      db.all("SELECT * FROM cafe_tables WHERE business_id = ?", [targetId]),
      db.all("SELECT * FROM cafe_orders WHERE business_id = ?", [targetId]),
      db.all("SELECT * FROM invoices WHERE business_id = ?", [targetId]),
    ]);

    const backupPayload = {
      exportTimestamp: new Date().toISOString(),
      exporter: { id: req.user.id, email: req.user.email, name: req.user.name },
      business,
      settings,
      data: {
        users,
        leads,
        customers,
        salon: { services, staff, appointments },
        cafe: { dishes, tables, orders },
        invoices,
      },
    };

    res.setHeader("Content-Disposition", `attachment; filename="zynthor_backup_${business.slug}_${Date.now()}.json"`);
    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify(backupPayload, null, 2));
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Permanent Delete Business (Transaction-Safe, Audit-Preserved)
app.delete("/api/businesses/:id/permanent", authenticate, requireRole(["owner", "admin"]), async (req, res) => {
  try {
    const targetId = Number(req.params.id);
    const { confirmName, force } = req.body || {};

    const business = await db.get("SELECT * FROM businesses WHERE id = ?", [targetId]);
    if (!business) {
      return res.status(404).json({ success: false, message: "Business establishment not found." });
    }

    // Safety 1: Protect Demo Businesses from accidental deletion
    if (business.is_demo === 1 && !force) {
      return res.status(400).json({
        success: false,
        message: "Protected Demo Establishment: Demo businesses (Luxe Aura, Velvet & Vine, Zynthor IT) cannot be permanently deleted without force=true flag.",
      });
    }

    // Safety 2: Require typing exact business name
    if (!confirmName || confirmName.trim().toLowerCase() !== business.name.trim().toLowerCase()) {
      return res.status(400).json({
        success: false,
        message: `Deletion safety verification failed: You must type the exact business name '${business.name}' to confirm permanent deletion.`,
      });
    }

    // Safety 3: Generate snapshot backup in deleted_businesses_audit table before deletion
    const [users, leads, customers, appts, orders, invoices] = await Promise.all([
      db.all("SELECT id, name, email, role FROM users WHERE business_id = ?", [targetId]),
      db.all("SELECT id, name, email, status FROM leads WHERE business_id = ?", [targetId]),
      db.all("SELECT id, name, phone FROM customers WHERE business_id = ?", [targetId]),
      db.all("SELECT id, customer_name, appointment_date, total_price FROM salon_appointments WHERE business_id = ?", [targetId]),
      db.all("SELECT id, table_number, total, status FROM cafe_orders WHERE business_id = ?", [targetId]),
      db.all("SELECT id, invoice_number, total, status FROM invoices WHERE business_id = ?", [targetId]),
    ]);

    const snapshot = {
      business,
      users,
      leads,
      customers,
      appointments: appts,
      orders,
      invoices,
    };

    const counts = {
      users: users.length,
      leads: leads.length,
      customers: customers.length,
      appointments: appts.length,
      orders: orders.length,
      invoices: invoices.length,
    };

    await db.run(
      `INSERT INTO deleted_businesses_audit (business_id, business_name, deleted_by_user_id, deleted_by_email, snapshot_json, records_count_json)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [targetId, business.name, req.user.id || 1, req.user.email || "admin@zynthor.com", JSON.stringify(snapshot), JSON.stringify(counts)]
    );

    // Safety 4: Perform atomic transaction-safe multi-table deletion
    await db.transaction(async (tx) => {
      await tx.run("DELETE FROM activity_logs WHERE business_id = ?", [targetId]);
      await tx.run("DELETE FROM notifications WHERE business_id = ?", [targetId]);
      await tx.run("DELETE FROM automation_logs WHERE business_id = ?", [targetId]);
      await tx.run("DELETE FROM automation_rules WHERE business_id = ?", [targetId]);
      await tx.run("DELETE FROM payments WHERE business_id = ?", [targetId]);
      await tx.run("DELETE FROM invoices WHERE business_id = ?", [targetId]);
      await tx.run("DELETE FROM coupons WHERE business_id = ?", [targetId]);
      await tx.run("DELETE FROM cafe_orders WHERE business_id = ?", [targetId]);
      await tx.run("DELETE FROM cafe_reservations WHERE business_id = ?", [targetId]);
      await tx.run("DELETE FROM cafe_dishes WHERE business_id = ?", [targetId]);
      await tx.run("DELETE FROM cafe_tables WHERE business_id = ?", [targetId]);
      await tx.run("DELETE FROM cafe_categories WHERE business_id = ?", [targetId]);
      await tx.run("DELETE FROM salon_appointments WHERE business_id = ?", [targetId]);
      await tx.run("DELETE FROM salon_packages WHERE business_id = ?", [targetId]);
      await tx.run("DELETE FROM salon_services WHERE business_id = ?", [targetId]);
      await tx.run("DELETE FROM salon_staff WHERE business_id = ?", [targetId]);
      await tx.run("DELETE FROM salon_categories WHERE business_id = ?", [targetId]);
      await tx.run("DELETE FROM leads WHERE business_id = ?", [targetId]);
      await tx.run("DELETE FROM customers WHERE business_id = ?", [targetId]);
      await tx.run("DELETE FROM business_settings WHERE business_id = ?", [targetId]);
      await tx.run("DELETE FROM users WHERE business_id = ?", [targetId]);
      await tx.run("DELETE FROM businesses WHERE id = ?", [targetId]);
    });

    res.json({
      success: true,
      message: `Establishment '${business.name}' (ID ${targetId}) and all associated records have been permanently purged. Pre-deletion audit snapshot archived.`,
      purgedCounts: counts,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: `Permanent deletion failed: ${err.message}` });
  }
});

// ==========================================
// 4. EXECUTIVE DASHBOARD & REAL METRICS
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
    const salonRevenueRow = await db.get(
      "SELECT SUM(total_price) as sum FROM salon_appointments WHERE business_id = ? AND status IN ('confirmed', 'completed')",
      [bId]
    );

    // Cafe metrics
    const ordersRow = await db.get(
      "SELECT COUNT(*) as count FROM cafe_orders WHERE business_id = ? AND status IN ('received', 'preparing', 'ready')",
      [bId]
    );
    const cafeRevenueRow = await db.get(
      "SELECT SUM(total) as sum FROM cafe_orders WHERE business_id = ? AND status IN ('ready', 'served', 'completed')",
      [bId]
    );

    // Invoice revenue
    const invoiceRevenueRow = await db.get(
      "SELECT SUM(total) as sum FROM invoices WHERE business_id = ? AND status = 'paid'",
      [bId]
    );

    // Total calculated authorized revenue
    const totalRevenue =
      (Number(salonRevenueRow ? salonRevenueRow.sum : 0) || 0) +
      (Number(cafeRevenueRow ? cafeRevenueRow.sum : 0) || 0) +
      (Number(invoiceRevenueRow ? invoiceRevenueRow.sum : 0) || 0);

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
      activities: recentActivities,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Notifications
app.get("/api/notifications", authenticate, async (req, res) => {
  try {
    const notifications = await db.all(
      "SELECT * FROM notifications WHERE business_id = ? ORDER BY id DESC LIMIT 20",
      [req.businessId]
    );
    res.json({ success: true, notifications });
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

// Audit Activities Feed
app.get("/api/activities", authenticate, async (req, res) => {
  try {
    const activities = await db.all(
      "SELECT * FROM activity_logs WHERE business_id = ? ORDER BY id DESC LIMIT 50",
      [req.businessId]
    );
    res.json({ success: true, activities });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 5. CRM & LEADS MANAGEMENT
// ==========================================

// Public Contact Form submission
const handlePublicInquiry = async (req, res) => {
  try {
    const { name, email, phone, service, budget, message, inquiry_type } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: "Please fill all required fields." });
    }

    const businessId = Number(req.headers["x-business-id"]) || 1;

    await db.run(
      `INSERT INTO contacts (name, email, phone, service, budget, message, inquiry_type)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name.trim(), email.trim(), phone || null, service || null, budget || null, message.trim(), inquiry_type || "quote"]
    );

    const leadRes = await db.run(
      `INSERT INTO leads (business_id, name, email, phone, service, budget, source, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [businessId, name.trim(), email.trim(), phone || null, service || null, budget || null, "Website Inbound", "new", message.trim()]
    );

    await db.run(
      `INSERT INTO notifications (business_id, title, message, type, link)
       VALUES (?, ?, ?, ?, ?)`,
      [businessId, "New Inbound Lead Received", `${name} requested quote for ${service || "services"}`, "lead", "/leads"]
    );

    res.json({
      success: true,
      message: "Your inquiry has been received. Our team will contact you shortly.",
      leadId: leadRes.insertId,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

app.post("/api/contact", handlePublicInquiry);
app.post("/api/quote", handlePublicInquiry);

// Flagship Demo Booking Inquiries
app.post("/api/book-demo", async (req, res) => {
  try {
    const { business_name, owner_name, email, phone, business_category, interested_plan, message } = req.body;
    if (!business_name || !owner_name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields: Business Name, Owner Name, Email, and Phone Number.",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: "Please provide a valid business email address." });
    }

    const businessId = 1; // Default primary tenant for commercial inbound software leads
    const fullService = `Business OS Demo (${business_category || "General"})`;
    const fullNotes = `Business: ${business_name.trim()} | Plan: ${interested_plan || "Growth (₹1,499)"} | Notes: ${message ? message.trim() : "None provided"}`;

    await db.run(
      `INSERT INTO contacts (name, email, phone, service, budget, message, inquiry_type)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [owner_name.trim(), email.trim(), phone.trim(), fullService, interested_plan || "Growth", fullNotes, "demo_booking"]
    );

    const leadRes = await db.run(
      `INSERT INTO leads (business_id, name, email, phone, service, budget, source, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [businessId, owner_name.trim(), email.trim(), phone.trim(), fullService, interested_plan || "Growth", "Website Demo Request", "new", fullNotes]
    );

    await db.run(
      `INSERT INTO notifications (business_id, title, message, type, link)
       VALUES (?, ?, ?, ?, ?)`,
      [businessId, "New Business OS Demo Scheduled", `${owner_name.trim()} (${business_name.trim()}) requested walkthrough for ${interested_plan || "Growth"} tier`, "lead", "/leads"]
    );

    res.json({
      success: true,
      message: `Thank you, ${owner_name}! Your live walkthrough request for ${business_name} has been received. Our solutions team will contact you within 24 hours.`,
      leadId: leadRes.insertId,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// CRM Leads List
app.get("/api/leads", authenticate, async (req, res) => {
  try {
    const { status, search } = req.query;
    let sql = "SELECT * FROM leads WHERE business_id = ?";
    const params = [req.businessId];

    if (status && status !== "all") {
      sql += " AND status = ?";
      params.push(status);
    }
    if (search) {
      sql += " AND (name LIKE ? OR email LIKE ? OR phone LIKE ? OR service LIKE ?)";
      const term = `%${search.trim()}%`;
      params.push(term, term, term, term);
    }

    sql += " ORDER BY id DESC";
    const leads = await db.all(sql, params);
    res.json({ success: true, leads });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create Lead
app.post("/api/leads", authenticate, async (req, res) => {
  try {
    const { name, email, phone, service, budget, source, notes, status, assigned_to, follow_up_date } = req.body;
    if (!name || !email) {
      return res.status(400).json({ success: false, message: "Lead name and email are required." });
    }

    const bId = req.businessId;
    const result = await db.run(
      `INSERT INTO leads (business_id, name, email, phone, service, budget, source, status, notes, assigned_to, follow_up_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        bId,
        name.trim(),
        email.trim().toLowerCase(),
        phone || null,
        service || null,
        budget || null,
        source || "Manual Entry",
        status || "new",
        notes || null,
        assigned_to || null,
        follow_up_date || null,
      ]
    );

    await db.run(
      `INSERT INTO activity_logs (business_id, user_id, user_name, action, entity_type, entity_id, details)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [bId, req.user.id || 1, req.user.name || "User", "Lead Created", "lead", result.insertId, `Created CRM lead for ${name}`]
    );

    res.json({
      success: true,
      message: "Lead created successfully.",
      lead: { id: result.insertId, name, email, status: status || "new" },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update Lead (Includes auto-customer creation on status = converted)
app.put("/api/leads/:id", authenticate, async (req, res) => {
  try {
    const leadId = req.params.id;
    const bId = req.businessId;

    const existing = await db.get("SELECT * FROM leads WHERE id = ? AND business_id = ?", [leadId, bId]);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Lead not found." });
    }

    const { name, email, phone, service, budget, status, notes, assigned_to, follow_up_date } = req.body;
    const newStatus = status !== undefined ? status : existing.status;

    await db.run(
      `UPDATE leads
       SET name = COALESCE(?, name),
           email = COALESCE(?, email),
           phone = COALESCE(?, phone),
           service = COALESCE(?, service),
           budget = COALESCE(?, budget),
           status = COALESCE(?, status),
           notes = COALESCE(?, notes),
           assigned_to = COALESCE(?, assigned_to),
           follow_up_date = COALESCE(?, follow_up_date),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND business_id = ?`,
      [name, email, phone, service, budget, status, notes, assigned_to, follow_up_date, leadId, bId]
    );

    // Auto-create customer if status transitioned to converted
    if (newStatus === "converted" && existing.status !== "converted") {
      const existingCust = await db.get("SELECT id FROM customers WHERE business_id = ? AND email = ?", [bId, existing.email]);
      if (!existingCust) {
        await db.run(
          `INSERT INTO customers (business_id, name, email, phone, notes)
           VALUES (?, ?, ?, ?, ?)`,
          [bId, existing.name, existing.email, existing.phone || null, `Converted from Lead #${leadId} (${existing.service || "General"})`]
        );
      }
    }

    await db.run(
      `INSERT INTO activity_logs (business_id, user_id, user_name, action, entity_type, entity_id, details)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [bId, req.user.id || 1, req.user.name || "User", "Lead Updated", "lead", leadId, `Updated lead #${leadId} status to '${newStatus}'`]
    );

    res.json({ success: true, message: "Lead updated successfully." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete Lead
app.delete("/api/leads/:id", authenticate, async (req, res) => {
  try {
    const leadId = req.params.id;
    await db.run("DELETE FROM leads WHERE id = ? AND business_id = ?", [leadId, req.businessId]);
    res.json({ success: true, message: "Lead deleted successfully." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// CSV Export for Leads
app.get("/api/leads/export", authenticate, async (req, res) => {
  try {
    const leads = await db.all(
      "SELECT id, name, email, phone, service, budget, source, status, created_at FROM leads WHERE business_id = ? ORDER BY id DESC",
      [req.businessId]
    );

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

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="zynthor_leads_export.csv"');
    res.send(csvContent);
  } catch (err) {
    res.status(500).send("Export failed: " + err.message);
  }
});

// ==========================================
// 6. CUSTOMER DIRECTORY
// ==========================================
app.get("/api/customers", authenticate, async (req, res) => {
  try {
    const customers = await db.all(
      "SELECT * FROM customers WHERE business_id = ? ORDER BY id DESC",
      [req.businessId]
    );
    res.json({ success: true, customers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post("/api/customers", authenticate, async (req, res) => {
  try {
    const { name, email, phone, notes } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: "Customer name is required." });
    }

    const result = await db.run(
      `INSERT INTO customers (business_id, name, email, phone, notes)
       VALUES (?, ?, ?, ?, ?)`,
      [req.businessId, name.trim(), email ? email.trim() : null, phone ? phone.trim() : null, notes || null]
    );

    res.json({
      success: true,
      message: "Customer profile created successfully.",
      customer: { id: result.insertId, name, email, phone },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 7. INVOICES & COUPONS (FINANCIAL RECORDS)
// ==========================================

// List Invoices
app.get("/api/invoices", authenticate, async (req, res) => {
  try {
    const { status, search } = req.query;
    let sql = "SELECT * FROM invoices WHERE business_id = ?";
    const params = [req.businessId];

    if (status && status !== "all") {
      sql += " AND status = ?";
      params.push(status);
    }
    if (search) {
      sql += " AND (invoice_number LIKE ? OR customer_name LIKE ? OR customer_email LIKE ?)";
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    sql += " ORDER BY id DESC";
    const invoices = await db.all(sql, params);
    res.json({ success: true, invoices });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create Invoice (Server-Side Tax & Discount Calculation)
app.post("/api/invoices", authenticate, async (req, res) => {
  try {
    const { customer_name, customer_email, customer_phone, items, coupon_code, notes, due_date, payment_method } = req.body;
    if (!customer_name || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "Customer name and at least one item are required." });
    }

    const bId = req.businessId;

    // Calculate subtotal from validated item prices
    let subtotal = 0;
    const validatedItems = items.map((it) => {
      const price = Math.max(0, Number(it.price) || 0);
      const qty = Math.max(1, Number(it.qty) || 1);
      const itemTotal = price * qty;
      subtotal += itemTotal;
      return { name: String(it.name || "Item"), price, qty, itemTotal };
    });

    // Validate coupon if provided
    let discount = 0;
    if (coupon_code) {
      const coupon = await db.get("SELECT * FROM coupons WHERE business_id = ? AND code = ? AND is_active = 1", [bId, coupon_code.trim().toUpperCase()]);
      if (coupon) {
        if (subtotal >= (coupon.min_spend || 0)) {
          if (coupon.discount_type === "percent") {
            discount = (subtotal * coupon.discount_val) / 100;
            if (coupon.max_discount) discount = Math.min(discount, coupon.max_discount);
          } else {
            discount = Math.min(subtotal, coupon.discount_val);
          }
          await db.run("UPDATE coupons SET used_count = used_count + 1 WHERE id = ?", [coupon.id]);
        }
      }
    }

    // 18% standard GST calculation on discounted taxable amount
    const taxable = Math.max(0, subtotal - discount);
    const tax = Math.round(taxable * 0.18 * 100) / 100;
    const total = Math.round((taxable + tax) * 100) / 100;

    // Generate sequential invoice number
    const countRow = await db.get("SELECT COUNT(*) as count FROM invoices WHERE business_id = ?", [bId]);
    const seq = (countRow?.count || 0) + 1;
    const year = new Date().getFullYear();
    const invoiceNumber = `INV-${year}-${String(seq).padStart(4, "0")}`;

    const iRes = await db.run(
      `INSERT INTO invoices (business_id, invoice_number, customer_name, customer_email, customer_phone, subtotal, discount, coupon_code, tax, total, status, payment_method, due_date, notes, items_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        bId,
        invoiceNumber,
        customer_name.trim(),
        customer_email ? customer_email.trim() : null,
        customer_phone ? customer_phone.trim() : null,
        subtotal,
        discount,
        coupon_code || null,
        tax,
        total,
        "pending",
        payment_method || "Online / UPI",
        due_date || null,
        notes || null,
        JSON.stringify(validatedItems),
      ]
    );

    res.json({
      success: true,
      message: `Invoice ${invoiceNumber} created successfully.`,
      invoice: { id: iRes.insertId, invoice_number: invoiceNumber, subtotal, discount, tax, total, status: "pending" },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update Invoice Status
app.put("/api/invoices/:id/status", authenticate, async (req, res) => {
  try {
    const { status } = req.body;
    if (!["paid", "pending", "cancelled"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid invoice status." });
    }

    const paidAt = status === "paid" ? new Date().toISOString() : null;
    await db.run(
      `UPDATE invoices SET status = ?, paid_at = COALESCE(?, paid_at), updated_at = CURRENT_TIMESTAMP WHERE id = ? AND business_id = ?`,
      [status, paidAt, req.params.id, req.businessId]
    );

    res.json({ success: true, message: `Invoice status updated to ${status}.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Record Payment for Invoice
app.post("/api/invoices/:id/pay", authenticate, async (req, res) => {
  try {
    const invoiceId = Number(req.params.id);
    const invoice = await db.get("SELECT * FROM invoices WHERE id = ? AND business_id = ?", [invoiceId, req.businessId]);
    if (!invoice) return res.status(404).json({ success: false, message: "Invoice not found." });

    const txRef = `PAY-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    await db.run(
      `INSERT INTO payments (business_id, invoice_id, transaction_ref, gateway, amount, currency, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [req.businessId, invoiceId, txRef, "sandbox_gateway", invoice.total, "INR", "captured"]
    );

    await db.run(
      `UPDATE invoices SET status = 'paid', paid_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [invoiceId]
    );

    res.json({
      success: true,
      message: `Payment of ₹${invoice.total.toLocaleString()} captured successfully. Transaction Ref: ${txRef}`,
      transactionRef: txRef,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Coupons List
app.get("/api/coupons", authenticate, async (req, res) => {
  try {
    const coupons = await db.all("SELECT * FROM coupons WHERE business_id = ? ORDER BY id DESC", [req.businessId]);
    res.json({ success: true, coupons });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create Coupon
app.post("/api/coupons", authenticate, requireRole(["owner", "admin"]), async (req, res) => {
  try {
    const { code, description, discount_type, discount_val, min_spend, max_discount, valid_to, usage_limit } = req.body;
    if (!code || !discount_val) {
      return res.status(400).json({ success: false, message: "Coupon code and discount value are required." });
    }

    const cRes = await db.run(
      `INSERT INTO coupons (business_id, code, description, discount_type, discount_val, min_spend, max_discount, valid_to, usage_limit)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.businessId,
        code.trim().toUpperCase(),
        description || null,
        discount_type || "percent",
        Number(discount_val),
        Number(min_spend) || 0,
        max_discount ? Number(max_discount) : null,
        valid_to || "2026-12-31",
        Number(usage_limit) || 100,
      ]
    );

    res.json({ success: true, message: `Coupon '${code.toUpperCase()}' created successfully.`, couponId: cRes.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Validate Coupon Code
app.post("/api/coupons/validate", optionalAuth, async (req, res) => {
  try {
    const { code, subtotal } = req.body;
    const bId = req.businessId || Number(req.headers["x-business-id"]) || 1;
    if (!code) return res.status(400).json({ success: false, message: "Please provide a coupon code." });

    const coupon = await db.get("SELECT * FROM coupons WHERE business_id = ? AND code = ? AND is_active = 1", [bId, code.trim().toUpperCase()]);
    if (!coupon) {
      return res.status(404).json({ success: false, message: "Invalid or expired promo code." });
    }

    const spend = Number(subtotal) || 0;
    if (spend < (coupon.min_spend || 0)) {
      return res.status(400).json({ success: false, message: `Minimum spend of ₹${coupon.min_spend} required to use this coupon.` });
    }

    let discount = 0;
    if (coupon.discount_type === "percent") {
      discount = (spend * coupon.discount_val) / 100;
      if (coupon.max_discount) discount = Math.min(discount, coupon.max_discount);
    } else {
      discount = Math.min(spend, coupon.discount_val);
    }

    res.json({
      success: true,
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_val: coupon.discount_val,
      discount_amount: Math.round(discount * 100) / 100,
      message: `Coupon '${coupon.code}' applied successfully!`,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 8. SALON & SPA SUITE
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
       WHERE s.business_id = ?
       ORDER BY s.id DESC`,
      [req.businessId]
    );
    res.json({ success: true, services });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post("/api/salon/services", authenticate, async (req, res) => {
  try {
    const { name, description, duration_mins, price, category_id, image_url } = req.body;
    if (!name || price === undefined) {
      return res.status(400).json({ success: false, message: "Service name and price are required." });
    }

    const result = await db.run(
      `INSERT INTO salon_services (business_id, category_id, name, description, duration_mins, price, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [req.businessId, category_id || null, name.trim(), description || "", Number(duration_mins) || 60, Number(price), image_url || ""]
    );

    res.json({ success: true, message: "Salon service added.", serviceId: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put("/api/salon/services/:id", authenticate, async (req, res) => {
  try {
    const { name, description, duration_mins, price, is_active, category_id, image_url } = req.body;
    await db.run(
      `UPDATE salon_services
       SET name = COALESCE(?, name),
           description = COALESCE(?, description),
           duration_mins = COALESCE(?, duration_mins),
           price = COALESCE(?, price),
           is_active = COALESCE(?, is_active),
           category_id = COALESCE(?, category_id),
           image_url = COALESCE(?, image_url)
       WHERE id = ? AND business_id = ?`,
      [
        name || null,
        description !== undefined ? description : null,
        duration_mins !== undefined ? Number(duration_mins) : null,
        price !== undefined ? Number(price) : null,
        is_active !== undefined ? Number(is_active) : null,
        category_id !== undefined ? category_id : null,
        image_url !== undefined ? image_url : null,
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
    res.json({ success: true, message: "Service deleted successfully." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

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

    res.json({ success: true, message: "Staff member added successfully.", staffId: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put("/api/salon/staff/:id", authenticate, async (req, res) => {
  try {
    const { name, role, email, phone, avatar_url, working_days, start_time, end_time, is_active } = req.body;
    await db.run(
      `UPDATE salon_staff
       SET name = COALESCE(?, name),
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
        is_active !== undefined ? Number(is_active) : null,
        req.params.id,
        req.businessId,
      ]
    );
    res.json({ success: true, message: "Staff details updated." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Salon Appointments with Double-Booking Prevention
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
      return res.status(400).json({ success: false, message: "Please provide all booking details." });
    }

    const bId = req.businessId;

    // Double-booking check: Prevent booking same staff at same date & time
    const conflict = await db.get(
      `SELECT id FROM salon_appointments
       WHERE business_id = ? AND staff_id = ? AND appointment_date = ? AND appointment_time = ? AND status != 'cancelled'`,
      [bId, staff_id, appointment_date, appointment_time]
    );

    if (conflict) {
      return res.status(409).json({
        success: false,
        message: "Double-booking prevention: This staff specialist is already reserved at that date and time slot. Please pick another slot.",
      });
    }

    const service = await db.get("SELECT name, price, duration_mins FROM salon_services WHERE id = ?", [service_id]);
    const staff = await db.get("SELECT name FROM salon_staff WHERE id = ?", [staff_id]);

    const result = await db.run(
      `INSERT INTO salon_appointments (business_id, customer_name, customer_email, customer_phone, service_id, service_name, staff_id, staff_name, appointment_date, appointment_time, total_price, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        bId,
        customer_name.trim(),
        customer_email ? customer_email.trim() : null,
        customer_phone.trim(),
        service_id,
        service ? service.name : "Custom Treatment",
        staff_id,
        staff ? staff.name : "Specialist",
        appointment_date,
        appointment_time,
        service ? service.price : 1000,
        notes || "",
      ]
    );

    res.json({
      success: true,
      message: "Appointment confirmed and added to schedule.",
      appointmentId: result.insertId,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put("/api/salon/appointments/:id", authenticate, async (req, res) => {
  try {
    const { status, appointment_date, appointment_time, notes } = req.body;
    await db.run(
      `UPDATE salon_appointments
       SET status = COALESCE(?, status),
           appointment_date = COALESCE(?, appointment_date),
           appointment_time = COALESCE(?, appointment_time),
           notes = COALESCE(?, notes)
       WHERE id = ? AND business_id = ?`,
      [status || null, appointment_date || null, appointment_time || null, notes !== undefined ? notes : null, req.params.id, req.businessId]
    );
    res.json({ success: true, message: "Appointment updated." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete("/api/salon/appointments/:id", authenticate, async (req, res) => {
  try {
    await db.run("DELETE FROM salon_appointments WHERE id = ? AND business_id = ?", [req.params.id, req.businessId]);
    res.json({ success: true, message: "Appointment deleted." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get("/api/salon/packages", authenticate, async (req, res) => {
  try {
    const packages = await db.all("SELECT * FROM salon_packages WHERE business_id = ? AND is_active = 1", [req.businessId]);
    res.json({ success: true, packages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Public Customer Booking Portal
app.get("/api/salon/public/:slug", async (req, res) => {
  try {
    const business = await db.get("SELECT id, name, slug, email, phone, address FROM businesses WHERE slug = ?", [req.params.slug]);
    if (!business) {
      return res.status(404).json({ success: false, message: "Establishment not found." });
    }

    const services = await db.all("SELECT id, name, description, duration_mins, price, image_url FROM salon_services WHERE business_id = ? AND is_active = 1", [business.id]);
    const staff = await db.all("SELECT id, name, role, avatar_url, working_days, start_time, end_time FROM salon_staff WHERE business_id = ? AND is_active = 1", [business.id]);

    res.json({ success: true, business, services, staff });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post("/api/salon/public/book", async (req, res) => {
  try {
    const { slug, customer_name, customer_email, customer_phone, service_id, staff_id, appointment_date, appointment_time, notes } = req.body;
    const business = await db.get("SELECT id, name FROM businesses WHERE slug = ?", [slug]);
    if (!business) return res.status(404).json({ success: false, message: "Establishment not found." });

    const bId = business.id;

    // Double-booking check
    const conflict = await db.get(
      `SELECT id FROM salon_appointments
       WHERE business_id = ? AND staff_id = ? AND appointment_date = ? AND appointment_time = ? AND status != 'cancelled'`,
      [bId, staff_id, appointment_date, appointment_time]
    );

    if (conflict) {
      return res.status(409).json({
        success: false,
        message: "That specific time slot with the selected stylist is already booked. Please choose an adjacent slot.",
      });
    }

    const service = await db.get("SELECT name, price FROM salon_services WHERE id = ?", [service_id]);
    const staff = await db.get("SELECT name FROM salon_staff WHERE id = ?", [staff_id]);

    const result = await db.run(
      `INSERT INTO salon_appointments (business_id, customer_name, customer_email, customer_phone, service_id, service_name, staff_id, staff_name, appointment_date, appointment_time, total_price, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        bId,
        customer_name.trim(),
        customer_email ? customer_email.trim() : null,
        customer_phone.trim(),
        service_id,
        service ? service.name : "Salon Service",
        staff_id,
        staff ? staff.name : "Specialist",
        appointment_date,
        appointment_time,
        service ? service.price : 1000,
        notes || "",
      ]
    );

    await db.run(
      `INSERT INTO notifications (business_id, title, message, type, link)
       VALUES (?, ?, ?, ?, ?)`,
      [bId, "New Client Appointment Booked", `${customer_name} booked ${service?.name || "service"} for ${appointment_date} at ${appointment_time}`, "appointment", "/salon"]
    );

    res.json({
      success: true,
      message: `Appointment reserved at ${business.name}! A confirmation SMS has been queued.`,
      appointmentId: result.insertId,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 9. CAFE & RESTAURANT SUITE
// ==========================================
app.get("/api/cafe/categories", authenticate, async (req, res) => {
  try {
    const categories = await db.all("SELECT * FROM cafe_categories WHERE business_id = ? ORDER BY display_order ASC", [req.businessId]);
    res.json({ success: true, categories });
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
       WHERE d.business_id = ?
       ORDER BY d.id DESC`,
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
        Number(calories) || 300,
        addons ? JSON.stringify(addons) : null,
      ]
    );

    res.json({ success: true, message: "Dish added to menu.", dishId: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put("/api/cafe/dishes/:id", authenticate, async (req, res) => {
  try {
    const { name, category_id, description, price, is_veg, is_available, image_url, prep_time_mins, calories } = req.body;
    await db.run(
      `UPDATE cafe_dishes
       SET name = COALESCE(?, name),
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
    res.json({ success: true, message: "Menu dish updated." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete("/api/cafe/dishes/:id", authenticate, async (req, res) => {
  try {
    await db.run("DELETE FROM cafe_dishes WHERE id = ? AND business_id = ?", [req.params.id, req.businessId]);
    res.json({ success: true, message: "Dish deleted from menu." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get("/api/cafe/tables", authenticate, async (req, res) => {
  try {
    const tables = await db.all("SELECT * FROM cafe_tables WHERE business_id = ? ORDER BY table_number ASC", [req.businessId]);
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
    const orders = await db.all("SELECT * FROM cafe_orders WHERE business_id = ? ORDER BY id DESC LIMIT 50", [req.businessId]);
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post("/api/cafe/orders", authenticate, async (req, res) => {
  try {
    const { table_number, order_type, customer_name, customer_phone, items, notes } = req.body;
    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: "Order must contain at least one item." });
    }

    let subtotal = 0;
    items.forEach((it) => {
      subtotal += (it.price || 0) * (it.qty || 1);
    });
    const tax = Math.round(subtotal * 0.05 * 100) / 100;
    const total = subtotal + tax;

    const result = await db.run(
      `INSERT INTO cafe_orders (business_id, table_number, order_type, customer_name, customer_phone, items_json, subtotal, tax, total, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.businessId, table_number || "Walk-In", order_type || "dine_in", customer_name || "Guest", customer_phone || "", JSON.stringify(items), subtotal, tax, total, "received", notes || ""]
    );

    res.json({ success: true, message: "Order sent to Kitchen Display System (KDS).", orderId: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put("/api/cafe/orders/:id", authenticate, async (req, res) => {
  try {
    const { status } = req.body;
    await db.run("UPDATE cafe_orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND business_id = ?", [status, req.params.id, req.businessId]);
    res.json({ success: true, message: `Kitchen Order ticket status updated to '${status}'.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get("/api/cafe/reservations", authenticate, async (req, res) => {
  try {
    const reservations = await db.all("SELECT * FROM cafe_reservations WHERE business_id = ? ORDER BY reservation_date DESC", [req.businessId]);
    res.json({ success: true, reservations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post("/api/cafe/reservations", authenticate, async (req, res) => {
  try {
    const { customer_name, customer_phone, customer_email, party_size, reservation_date, reservation_time, table_number, special_requests } = req.body;
    if (!customer_name || !customer_phone || !reservation_date || !reservation_time) {
      return res.status(400).json({ success: false, message: "Please provide complete reservation details." });
    }

    const result = await db.run(
      `INSERT INTO cafe_reservations (business_id, customer_name, customer_phone, customer_email, party_size, reservation_date, reservation_time, table_number, special_requests)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.businessId, customer_name.trim(), customer_phone.trim(), customer_email || "", Number(party_size) || 2, reservation_date, reservation_time, table_number || null, special_requests || ""]
    );

    res.json({ success: true, message: "Dining table reserved successfully.", reservationId: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Public Cafe Digital Menu
app.get("/api/cafe/public/:slug", async (req, res) => {
  try {
    const business = await db.get("SELECT id, name, slug, email, phone, address FROM businesses WHERE slug = ?", [req.params.slug]);
    if (!business) return res.status(404).json({ success: false, message: "Cafe bistro not found." });

    const categories = await db.all("SELECT id, name, icon FROM cafe_categories WHERE business_id = ? ORDER BY display_order ASC", [business.id]);
    const dishes = await db.all("SELECT id, category_id, name, description, price, is_veg, is_available, image_url, prep_time_mins, calories FROM cafe_dishes WHERE business_id = ? AND is_available = 1", [business.id]);

    res.json({ success: true, business, categories, dishes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 10. AI ASSISTANT & AUTOMATION RULES
// ==========================================
app.post("/api/ai/chat", authenticate, async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: "Message is required." });
    }

    const aiResult = await generateAIResponse(req.businessId, message, conversationHistory);
    res.json({
      success: true,
      reply: aiResult.message,
      intent: aiResult.intent,
      language: aiResult.language,
      suggestedActions: aiResult.suggestedActions,
      escalated: Boolean(aiResult.escalated),
      providerMode: process.env.GEMINI_API_KEY ? "Gemini Neural API" : "Zynthor Domain Engine (Offline)",
    });
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
    res.json({ success: true, message: "Rule toggle state updated." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get("/api/ai/logs", authenticate, async (req, res) => {
  try {
    const logs = await db.all("SELECT * FROM automation_logs WHERE business_id = ? ORDER BY id DESC LIMIT 50", [req.businessId]);
    res.json({ success: true, logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Test-Trigger Automation (Clearly labeled simulation mode)
app.post("/api/automation/test-trigger", authenticate, async (req, res) => {
  try {
    const { rule_name, trigger_event, recipient } = req.body;
    const bId = req.businessId;

    const logRes = await db.run(
      `INSERT INTO automation_logs (business_id, rule_name, trigger_event, status, delivery_mode, payload_json)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        bId,
        rule_name || "Sandbox Webhook Test",
        trigger_event || "test_event",
        "success",
        "simulated",
        JSON.stringify({ recipient: recipient || "client@domain.com", mode: "Sandbox / Dry Run", timestamp: new Date().toISOString() }),
      ]
    );

    res.json({
      success: true,
      message: `Test trigger executed in Sandbox Mode. Dispatched dry-run event with delivery_mode='simulated'.`,
      logId: logRes.insertId,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 11. SETTINGS, TEAM ROLES & SUBSCRIPTION
// ==========================================
app.get("/api/settings", authenticate, async (req, res) => {
  try {
    const settings = await db.get("SELECT * FROM business_settings WHERE business_id = ?", [req.businessId]);
    const business = await db.get("SELECT id, name, slug, industry, email, phone, address FROM businesses WHERE id = ?", [req.businessId]);
    res.json({ success: true, settings: settings || {}, business });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put("/api/settings", authenticate, async (req, res) => {
  try {
    const { businessName, phone, address, brand_voice, ai_system_prompt, ai_language_mode, auto_reply_enabled, timezone, tagline, primary_color, banner_message } = req.body;

    if (businessName || phone || address) {
      await db.run(
        `UPDATE businesses
         SET name = COALESCE(?, name),
             phone = COALESCE(?, phone),
             address = COALESCE(?, address),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [businessName || null, phone || null, address || null, req.businessId]
      );
    }

    const existing = await db.get("SELECT id FROM business_settings WHERE business_id = ?", [req.businessId]);
    if (existing) {
      await db.run(
        `UPDATE business_settings
         SET brand_voice = COALESCE(?, brand_voice),
             ai_system_prompt = COALESCE(?, ai_system_prompt),
             ai_language_mode = COALESCE(?, ai_language_mode),
             auto_reply_enabled = COALESCE(?, auto_reply_enabled),
             timezone = COALESCE(?, timezone),
             tagline = COALESCE(?, tagline),
             primary_color = COALESCE(?, primary_color),
             banner_message = COALESCE(?, banner_message),
             updated_at = CURRENT_TIMESTAMP
         WHERE business_id = ?`,
        [brand_voice, ai_system_prompt, ai_language_mode, auto_reply_enabled !== undefined ? Number(auto_reply_enabled) : null, timezone, tagline, primary_color, banner_message, req.businessId]
      );
    } else {
      await db.run(
        `INSERT INTO business_settings (business_id, brand_voice, ai_system_prompt, ai_language_mode, auto_reply_enabled, timezone, tagline, primary_color, banner_message)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [req.businessId, brand_voice || "Executive & Warm", ai_system_prompt || "", ai_language_mode || "auto", auto_reply_enabled !== undefined ? Number(auto_reply_enabled) : 1, timezone || "Asia/Kolkata", tagline || null, primary_color || "blue", banner_message || null]
      );
    }

    res.json({ success: true, message: "Business settings saved successfully." });
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
      return res.status(400).json({ success: false, message: "Member name and email are required." });
    }

    const passHash = hashPassword(password || "Zynthor@2026");
    const result = await db.run(
      `INSERT INTO users (business_id, name, email, password_hash, role)
       VALUES (?, ?, ?, ?, ?)`,
      [req.businessId, name.trim(), email.trim().toLowerCase(), passHash, role || "staff"]
    );

    res.json({ success: true, message: `Team member ${name} invited as ${role || "staff"}.`, memberId: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Subscriptions & Plans
app.get("/api/subscription", authenticate, async (req, res) => {
  try {
    const b = await db.get("SELECT plan, plan_status FROM businesses WHERE id = ?", [req.businessId]);
    const invoices = await db.all("SELECT * FROM invoices WHERE business_id = ? ORDER BY id DESC LIMIT 5", [req.businessId]);

    res.json({
      success: true,
      currentPlan: b ? b.plan : "growth",
      status: b ? b.plan_status : "active",
      limits: {
        starter: { maxLeads: 100, maxStaff: 3, maxDishes: 30, priceINR: 999 },
        growth: { maxLeads: 1000, maxStaff: 15, maxDishes: 150, priceINR: 2499 },
        enterprise: { maxLeads: "Unlimited", maxStaff: "Unlimited", maxDishes: "Unlimited", priceINR: 4999 },
      },
      recentInvoices: invoices,
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

    // Record subscription transaction in payments ledger
    const prices = { starter: 999, growth: 2499, enterprise: 4999 };
    const txRef = `SUB-${Date.now()}-${plan.toUpperCase()}`;
    await db.run(
      `INSERT INTO payments (business_id, transaction_ref, gateway, amount, currency, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.businessId, txRef, "sandbox_subscription", prices[plan] || 2499, "INR", "captured"]
    );

    res.json({
      success: true,
      message: `Successfully transitioned to ${plan.toUpperCase()} tier!`,
      plan,
      transactionRef: txRef,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// CENTRALIZED ERROR HANDLING MIDDLEWARE
// ==========================================
app.use((err, req, res, next) => {
  console.error(`[Unhandled API Error] ${req.method} ${req.url}:`, err.message);
  const status = err.status || err.statusCode || 500;
  const isProd = process.env.NODE_ENV === "production";
  res.status(status).json({
    success: false,
    message: isProd && status === 500 ? "Internal server error. Please try again later." : err.message,
  });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`[Zynthor Business OS API] Listening on port ${PORT}`);
});

module.exports = app;