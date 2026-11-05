const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const path = require("path");
const fs = require("fs");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// ==========================================
// RESILIENT PERSISTENT BUFFER (Never Lose an Inquiry)
// ==========================================
const DATA_DIR = path.join(__dirname, "data");
const INQUIRIES_BUFFER_FILE = path.join(DATA_DIR, "inquiries_buffer.json");

if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (dirErr) {
    console.error("[Data Dir Error]:", dirErr.message);
  }
}

const loadBuffer = () => {
  try {
    if (fs.existsSync(INQUIRIES_BUFFER_FILE)) {
      const content = fs.readFileSync(INQUIRIES_BUFFER_FILE, "utf8");
      return JSON.parse(content || "[]");
    }
  } catch (err) {
    console.error("[Buffer Read Error]:", err.message);
  }
  return [];
};

const saveBuffer = (records) => {
  try {
    const tempFile = `${INQUIRIES_BUFFER_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(records, null, 2), "utf8");
    fs.renameSync(tempFile, INQUIRIES_BUFFER_FILE);
  } catch (err) {
    console.error("[Buffer Write Error]:", err.message);
  }
};

const recordInquiry = (inquiry) => {
  const records = loadBuffer();
  const newRecord = {
    id: Date.now(),
    name: inquiry.name,
    email: inquiry.email,
    phone: inquiry.phone || null,
    service: inquiry.service || null,
    budget: inquiry.budget || null,
    message: inquiry.message,
    inquiry_type: inquiry.inquiry_type || "contact",
    created_at: new Date().toISOString(),
    synced_to_mysql: false,
  };
  records.push(newRecord);
  saveBuffer(records);
  console.log(`[INQUIRY RECORDED] ID #${newRecord.id} | Type: ${newRecord.inquiry_type} | Name: "${newRecord.name}" | Email: "${newRecord.email}" | Phone: "${newRecord.phone || 'N/A'}"`);
  return newRecord;
};

const markSynced = (id) => {
  const records = loadBuffer();
  const rec = records.find((r) => r.id === id);
  if (rec) {
    rec.synced_to_mysql = true;
    rec.synced_at = new Date().toISOString();
    saveBuffer(records);
  }
};

// Database configuration helper (supports both DATABASE_URL and discrete variables)
const getPoolConfig = () => {
  const rawUrl = process.env.DATABASE_URL ? String(process.env.DATABASE_URL).trim() : "";
  const isValidUrl = rawUrl.startsWith("mysql://") || rawUrl.startsWith("mysqls://");

  if (isValidUrl) {
    const isCloud =
      !rawUrl.includes("localhost") &&
      !rawUrl.includes("127.0.0.1");
    const useSsl =
      process.env.DB_SSL === "true" ||
      isCloud ||
      process.env.NODE_ENV === "production";

    return {
      uri: rawUrl,
      waitForConnections: true,
      connectionLimit: 10,
      connectTimeout: 5000,
      queueLimit: 0,
      ssl: useSsl
        ? {
            minVersion: "TLSv1.2",
            rejectUnauthorized: false,
          }
        : undefined,
    };
  }

  if (rawUrl && !isValidUrl) {
    console.warn("[Database Config] Warning: DATABASE_URL does not start with mysql://. Falling back to discrete DB_* variables.");
  }

  const isLocal =
    !process.env.DB_HOST ||
    process.env.DB_HOST === "localhost" ||
    process.env.DB_HOST === "127.0.0.1";
  const useSsl =
    process.env.DB_SSL === "true" ||
    (!isLocal && process.env.NODE_ENV === "production");

  return {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || "zynthor_it",
    waitForConnections: true,
    connectionLimit: 10,
    connectTimeout: 5000,
    queueLimit: 0,
    ssl: useSsl
      ? {
          minVersion: "TLSv1.2",
          rejectUnauthorized: false,
        }
      : undefined,
  };
};

let pool;
try {
  pool = mysql.createPool(getPoolConfig());
} catch (poolErr) {
  console.error("[Database Pool Error]:", poolErr.message);
  pool = mysql.createPool({ host: "localhost", port: 3306 });
}

// Background worker to sync unsynced records to MySQL
const syncPendingInquiries = () => {
  const records = loadBuffer();
  const pending = records.filter((r) => !r.synced_to_mysql);
  if (pending.length === 0) return;

  pool.query("SELECT 1", (testErr) => {
    if (testErr) {
      return; // MySQL still unreachable, safely keep in buffer
    }

    pending.forEach((rec) => {
      const sql = `
        INSERT INTO contacts (name, email, phone, service, budget, message, inquiry_type)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      pool.query(
        sql,
        [rec.name, rec.email, rec.phone, rec.service, rec.budget, rec.message, rec.inquiry_type],
        (insertErr) => {
          if (!insertErr) {
            markSynced(rec.id);
            console.log(`[Sync Worker] Successfully synced buffered inquiry #${rec.id} to MySQL.`);
          }
        }
      );
    });
  });
};

// Run sync worker every 30 seconds
setInterval(syncPendingInquiries, 30 * 1000).unref();

// Safe column addition helper
const ensureColumn = (tableName, columnName, columnDefinition) => {
  const checkSql = `
    SELECT COLUMN_NAME 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?
  `;
  let dbName = process.env.DB_NAME || "zynthor_it";
  const rawUrl = process.env.DATABASE_URL ? String(process.env.DATABASE_URL).trim() : "";
  if (!process.env.DB_NAME && (rawUrl.startsWith("mysql://") || rawUrl.startsWith("mysqls://"))) {
    try {
      const parsed = new URL(rawUrl);
      if (parsed.pathname && parsed.pathname.length > 1) {
        dbName = parsed.pathname.slice(1);
      }
    } catch {
      // fallback
    }
  }
  pool.query(checkSql, [dbName, tableName, columnName], (err, rows) => {
    if (err) {
      console.error(`Error checking column ${columnName}:`, err.message);
      return;
    }
    if (!rows || rows.length === 0) {
      const alterSql = `ALTER TABLE \`${tableName}\` ADD COLUMN \`${columnName}\` ${columnDefinition}`;
      pool.query(alterSql, (alterErr) => {
        if (alterErr) {
          console.error(`Failed to add column ${columnName}:`, alterErr.message);
        } else {
          console.log(`Added column ${columnName} to ${tableName}`);
        }
      });
    }
  });
};

// Database connectivity and schema initialization
pool.getConnection((err, connection) => {
  if (err) {
    console.error("MySQL connection failed:", err.message);
    return;
  }
  console.log("MySQL Connected Successfully");
  connection.release();

  const initTableSql = `
    CREATE TABLE IF NOT EXISTS contacts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(150) NOT NULL,
      phone VARCHAR(50) DEFAULT NULL,
      service VARCHAR(100) DEFAULT NULL,
      budget VARCHAR(50) DEFAULT NULL,
      message TEXT NOT NULL,
      inquiry_type VARCHAR(50) DEFAULT 'contact',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  pool.query(initTableSql, (tableErr) => {
    if (tableErr) {
      console.error("Failed to initialize contacts table:", tableErr.message);
    } else {
      console.log("Contacts table ready");
      // Ensure all columns exist for existing installations
      ensureColumn("contacts", "phone", "VARCHAR(50) DEFAULT NULL");
      ensureColumn("contacts", "service", "VARCHAR(100) DEFAULT NULL");
      ensureColumn("contacts", "budget", "VARCHAR(50) DEFAULT NULL");
      ensureColumn("contacts", "inquiry_type", "VARCHAR(50) DEFAULT 'contact'");
    }
  });
});

// Health check endpoints
app.get("/", (req, res) => {
  res.json({
    status: "online",
    name: "Zynthor IT API",
    version: "2.0.0",
    timestamp: new Date().toISOString()
  });
});

app.get("/api/health", (req, res) => {
  const bufferRecords = loadBuffer();
  const pendingSync = bufferRecords.filter((r) => !r.synced_to_mysql).length;

  let dbTarget = {
    hasDbUrl: Boolean(process.env.DATABASE_URL),
    hasDbHost: Boolean(process.env.DB_HOST),
  };

  const rawUrl = process.env.DATABASE_URL ? String(process.env.DATABASE_URL).trim() : "";
  if (rawUrl) {
    try {
      const parsed = new URL(rawUrl);
      dbTarget.protocol = parsed.protocol;
      dbTarget.hostname = parsed.hostname;
      dbTarget.port = parsed.port || (parsed.protocol === "mysql:" ? 3306 : parsed.protocol === "postgres:" ? 5432 : "default");
      dbTarget.database = parsed.pathname ? parsed.pathname.replace(/^\/+/, "") : "";
    } catch {
      dbTarget.urlFormat = "custom";
    }
  } else {
    dbTarget.hostname = process.env.DB_HOST || "localhost";
    dbTarget.port = Number(process.env.DB_PORT) || 3306;
    dbTarget.database = process.env.DB_NAME || "zynthor_it";
  }

  pool.query("SELECT 1 AS healthy", (err) => {
    if (err) {
      console.error("[Health Check Database Warning]:", err.message);
      return res.status(200).json({
        status: "operational_with_buffer",
        database: "disconnected",
        dbTarget,
        dbError: err.code || err.message,
        buffer: {
          totalSaved: bufferRecords.length,
          pendingSync,
          status: "active_and_protecting_leads",
        },
      });
    }
    res.json({
      status: "ok",
      database: "connected",
      dbTarget,
      buffer: {
        totalSaved: bufferRecords.length,
        pendingSync,
        status: "synced",
      },
    });
  });
});

// Admin / Inspection endpoint for inquiries
app.get(["/api/contacts", "/api/inquiries"], (req, res) => {
  const bufferRecords = loadBuffer();

  pool.query("SELECT * FROM contacts ORDER BY id DESC LIMIT 100", (err, dbRows) => {
    if (err) {
      // MySQL unavailable, serve from persistent buffer
      return res.json({
        source: "resilient_buffer",
        total: bufferRecords.length,
        contacts: [...bufferRecords].reverse(),
      });
    }

    const existingIds = new Set(dbRows.map((r) => r.id));
    const unsynced = bufferRecords.filter((r) => !existingIds.has(r.id));
    return res.json({
      source: "database",
      total: dbRows.length + unsynced.length,
      contacts: [...unsynced.reverse(), ...dbRows],
    });
  });
});

// Lightweight sliding-window IP rate limiter for spam protection
const ipSubmissions = new Map();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS_PER_WINDOW = 30; // Max 30 submissions per 15 mins per IP

// Periodic cleanup of stale rate limiter timestamps (every 10 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [ip, timestamps] of ipSubmissions.entries()) {
    const valid = timestamps.filter(ts => now - ts < RATE_LIMIT_WINDOW_MS);
    if (valid.length === 0) {
      ipSubmissions.delete(ip);
    } else {
      ipSubmissions.set(ip, valid);
    }
  }
}, 10 * 60 * 1000).unref();

const inquiryRateLimiter = (req, res, next) => {
  const clientIp = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket.remoteAddress || "unknown";
  const now = Date.now();
  const timestamps = (ipSubmissions.get(clientIp) || []).filter(ts => now - ts < RATE_LIMIT_WINDOW_MS);

  if (timestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    return res.status(429).json({
      success: false,
      message: "Too many submission attempts. Please wait a few minutes before submitting another inquiry."
    });
  }

  timestamps.push(now);
  ipSubmissions.set(clientIp, timestamps);
  next();
};

// Inquiry handler (supports both general contact inquiries and detailed quote requests)
const handleInquiry = (req, res) => {
  const { name, email, phone, service, budget, message, inquiry_type } = req.body;

  // Validation
  if (!name || typeof name !== "string" || name.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid name (at least 2 characters)."
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || typeof email !== "string" || !emailRegex.test(email.trim())) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid email address."
    });
  }

  if (!message || typeof message !== "string" || message.trim().length < 5) {
    return res.status(400).json({
      success: false,
      message: "Please provide a project description or message (at least 5 characters)."
    });
  }

  const sanitizedName = name.trim().slice(0, 100);
  const sanitizedEmail = email.trim().slice(0, 150);
  const sanitizedPhone = phone ? String(phone).trim().slice(0, 50) : null;
  const sanitizedService = service ? String(service).trim().slice(0, 100) : null;
  const sanitizedBudget = budget ? String(budget).trim().slice(0, 50) : null;
  const sanitizedMessage = message.trim().slice(0, 5000);
  const sanitizedType = inquiry_type === "quote" ? "quote" : "contact";

  // 1. Immediately persist to resilient local buffer
  const savedRecord = recordInquiry({
    name: sanitizedName,
    email: sanitizedEmail,
    phone: sanitizedPhone,
    service: sanitizedService,
    budget: sanitizedBudget,
    message: sanitizedMessage,
    inquiry_type: sanitizedType,
  });

  // 2. Attempt MySQL write immediately
  const sql = `
    INSERT INTO contacts (name, email, phone, service, budget, message, inquiry_type)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  pool.query(
    sql,
    [sanitizedName, sanitizedEmail, sanitizedPhone, sanitizedService, sanitizedBudget, sanitizedMessage, sanitizedType],
    (err, result) => {
      if (!err && result) {
        markSynced(savedRecord.id);
        console.log(`[MySQL Insert Success] Inquiry #${savedRecord.id} saved to MySQL contacts table (insertId: ${result.insertId})`);
      } else {
        // Try fallback query with minimal schema if columns differ
        const fallbackSql = `INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)`;
        pool.query(fallbackSql, [sanitizedName, sanitizedEmail, sanitizedMessage], (fbErr, fbResult) => {
          if (!fbErr && fbResult) {
            markSynced(savedRecord.id);
            console.log(`[MySQL Fallback Insert Success] Inquiry #${savedRecord.id} saved to MySQL contacts table`);
          } else {
            console.warn(`[MySQL Insert Deferred] Database unavailable (${err?.code || err?.message || "connection error"}). Inquiry #${savedRecord.id} safely stored in resilient buffer; will auto-sync upon reconnection.`);
          }
        });
      }
    }
  );

  // 3. Always return HTTP 201 Success to the client so the visitor's lead is accepted
  const successMsg = sanitizedType === "quote"
    ? "Quote request submitted successfully! Our engineering team will review and get back to you within 24 hours."
    : "Message submitted successfully! Thank you for contacting Zynthor IT.";

  return res.status(201).json({
    success: true,
    message: successMsg,
    id: savedRecord.id,
  });
};

app.post("/api/contact", inquiryRateLimiter, handleInquiry);
app.post("/api/quote", inquiryRateLimiter, handleInquiry);

// Demo booking handler
const handleDemoBooking = (req, res) => {
  const { business_name, owner_name, email, phone, business_category, interested_plan, message } = req.body;
  const name = owner_name || req.body.name;
  if (!name || typeof name !== "string" || name.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid owner or contact name."
    });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || typeof email !== "string" || !emailRegex.test(email.trim())) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid email address."
    });
  }
  const cleanPhone = phone ? String(phone).replace(/[^0-9+]/g, "") : "";
  if (!cleanPhone || cleanPhone.length < 10) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid phone number (at least 10 digits)."
    });
  }

  const sanitizedName = `${name.trim().slice(0, 50)} (${(business_name || "").trim().slice(0, 40)})`;
  const sanitizedEmail = email.trim().slice(0, 150);
  const sanitizedPhone = phone ? String(phone).trim().slice(0, 50) : null;
  const sanitizedService = `Business OS Demo - ${(business_category || "").slice(0, 60)}`;
  const sanitizedBudget = interested_plan ? String(interested_plan).slice(0, 50) : "SaaS Demo";
  const noteContent = message ? `Notes: ${message.trim()}` : "Requested 20-min live guided walkthrough";
  const sanitizedMessage = `[Demo Booking Request] Business: ${business_name || "N/A"} | Category: ${business_category || "General"} | Plan: ${interested_plan || "Growth"} | ${noteContent}`.slice(0, 5000);

  // 1. Immediately persist to resilient buffer
  const savedRecord = recordInquiry({
    name: sanitizedName,
    email: sanitizedEmail,
    phone: sanitizedPhone,
    service: sanitizedService,
    budget: sanitizedBudget,
    message: sanitizedMessage,
    inquiry_type: "demo",
  });

  // 2. Attempt MySQL write
  const sql = `
    INSERT INTO contacts (name, email, phone, service, budget, message, inquiry_type)
    VALUES (?, ?, ?, ?, ?, ?, 'demo')
  `;

  pool.query(
    sql,
    [sanitizedName, sanitizedEmail, sanitizedPhone, sanitizedService, sanitizedBudget, sanitizedMessage],
    (err, result) => {
      if (!err && result) {
        markSynced(savedRecord.id);
        console.log(`[MySQL Insert Success] Demo booking #${savedRecord.id} saved to MySQL contacts table (insertId: ${result.insertId})`);
      } else {
        const fallbackSql = `INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)`;
        pool.query(fallbackSql, [sanitizedName, sanitizedEmail, sanitizedMessage], (fbErr, fbResult) => {
          if (!fbErr && fbResult) {
            markSynced(savedRecord.id);
            console.log(`[MySQL Fallback Insert Success] Demo booking #${savedRecord.id} saved to MySQL`);
          } else {
            console.warn(`[MySQL Insert Deferred] Demo booking #${savedRecord.id} safely stored in buffer; will auto-sync upon reconnection.`);
          }
        });
      }
    }
  );

  return res.status(201).json({
    success: true,
    message: "Demo request received! Our product specialist will contact you shortly to confirm your walkthrough time.",
    id: savedRecord.id,
  });
};

app.post("/api/book-demo", inquiryRateLimiter, handleDemoBooking);

const PORT = process.env.PORT || 8000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});