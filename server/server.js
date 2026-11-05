const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const path = require("path");
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
      connectTimeout: 10000,
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
    connectTimeout: 10000,
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
  pool.query("SELECT 1 AS healthy", (err) => {
    if (err) {
      console.error("[Health Check Error]:", err.message);
      return res.status(500).json({
        status: "error",
        database: "disconnected",
        hasDbUrl: Boolean(process.env.DATABASE_URL),
        hasDbHost: Boolean(process.env.DB_HOST),
        error: process.env.NODE_ENV === "production" ? "Database connection error" : (err ? (err.message || err.code || String(err)) : "unknown"),
      });
    }
    res.json({
      status: "ok",
      database: "connected",
      hasDbUrl: Boolean(process.env.DATABASE_URL),
      hasDbHost: Boolean(process.env.DB_HOST),
    });
  });
});

// Lightweight sliding-window IP rate limiter for spam protection
const ipSubmissions = new Map();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS_PER_WINDOW = 15; // Max 15 submissions per 15 mins per IP

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

  const sql = `
    INSERT INTO contacts (name, email, phone, service, budget, message, inquiry_type)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  pool.query(
    sql,
    [sanitizedName, sanitizedEmail, sanitizedPhone, sanitizedService, sanitizedBudget, sanitizedMessage, sanitizedType],
    (err, result) => {
      if (err) {
        console.error("Database query error:", err.message);

        // Fallback for systems where schema migration is pending
        const fallbackSql = `
          INSERT INTO contacts (name, email, message)
          VALUES (?, ?, ?)
        `;
        pool.query(fallbackSql, [sanitizedName, sanitizedEmail, sanitizedMessage], (fbErr, fbResult) => {
          if (fbErr) {
            console.error("Fallback query error:", fbErr.message);
            return res.status(500).json({
              success: false,
              message: "Database error. Please try again later."
            });
          }
          return res.status(201).json({
            success: true,
            message: "Inquiry submitted successfully.",
            id: fbResult.insertId
          });
        });
        return;
      }

      res.status(201).json({
        success: true,
        message: sanitizedType === "quote" ? "Quote request submitted successfully!" : "Message submitted successfully!",
        id: result.insertId
      });
    }
  );
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

  const sql = `
    INSERT INTO contacts (name, email, phone, service, budget, message, inquiry_type)
    VALUES (?, ?, ?, ?, ?, ?, 'demo')
  `;

  pool.query(
    sql,
    [sanitizedName, sanitizedEmail, sanitizedPhone, sanitizedService, sanitizedBudget, sanitizedMessage],
    (err, result) => {
      if (err) {
        console.error("Database query error for demo booking:", err.message);
        const fallbackSql = `INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)`;
        pool.query(fallbackSql, [sanitizedName, sanitizedEmail, sanitizedMessage], (fbErr, fbResult) => {
          if (fbErr) {
            console.error("Fallback query error:", fbErr.message);
            return res.status(500).json({
              success: false,
              message: "Database error. Please try again later."
            });
          }
          return res.status(201).json({
            success: true,
            message: "Demo request received! Our product specialist will contact you shortly to confirm your walkthrough time.",
            id: fbResult.insertId
          });
        });
        return;
      }
      res.status(201).json({
        success: true,
        message: "Demo request received! Our product specialist will contact you shortly to confirm your walkthrough time.",
        id: result.insertId
      });
    }
  );
};

app.post("/api/book-demo", inquiryRateLimiter, handleDemoBooking);

const PORT = process.env.PORT || 8000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});