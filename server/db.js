/**
 * Zynthor Business OS — Universal Database Layer
 * Supports Cloud MySQL (TiDB / Aiven / standard MySQL) with automatic fallback
 * to persistent Node 22 built-in SQLite (zero-dependency, works offline & in sandboxes).
 */

const path = require("path");
const fs = require("fs");
require("dotenv").config({ path: path.join(__dirname, ".env") });

let activeDriver = "sqlite"; // 'mysql' or 'sqlite'
let mysqlPool = null;
let sqliteDb = null;

const DATA_DIR = path.join(__dirname, "data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
const SQLITE_FILE = path.join(DATA_DIR, "zynthor.db");

// Initialize SQLite fallback database using Node 22 native SQLite
function initSqlite() {
  try {
    const { DatabaseSync } = require("node:sqlite");
    sqliteDb = new DatabaseSync(SQLITE_FILE);
    // Enable WAL mode for high concurrency
    sqliteDb.exec("PRAGMA journal_mode = WAL;");
    sqliteDb.exec("PRAGMA foreign_keys = ON;");
    activeDriver = "sqlite";
    console.log(`[Database] Initialized persistent SQLite database at: ${SQLITE_FILE}`);
    return true;
  } catch (err) {
    console.error("[Database] Failed to initialize SQLite:", err.message);
    return false;
  }
}

// Check if MySQL should be attempted
function initMySQL() {
  const rawUrl = process.env.DATABASE_URL ? String(process.env.DATABASE_URL).trim() : "";
  const hasDbConfig = Boolean(rawUrl || process.env.DB_HOST);

  if (!hasDbConfig) {
    console.log("[Database] No MySQL credentials provided. Using persistent SQLite.");
    initSqlite();
    return;
  }

  const mysql = require("mysql2");
  const isCloud = rawUrl && !rawUrl.includes("localhost") && !rawUrl.includes("127.0.0.1");
  const useSsl = process.env.DB_SSL === "true" || isCloud || process.env.NODE_ENV === "production";

  let poolConfig;
  if (rawUrl && (rawUrl.startsWith("mysql://") || rawUrl.startsWith("mysqls://"))) {
    poolConfig = {
      uri: rawUrl,
      waitForConnections: true,
      connectionLimit: 10,
      connectTimeout: 5000,
      queueLimit: 0,
      ssl: useSsl ? { minVersion: "TLSv1.2", rejectUnauthorized: false } : undefined,
    };
  } else {
    poolConfig = {
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "zynthor_it",
      waitForConnections: true,
      connectionLimit: 10,
      connectTimeout: 5000,
      queueLimit: 0,
      ssl: useSsl ? { minVersion: "TLSv1.2", rejectUnauthorized: false } : undefined,
    };
  }

  try {
    const pool = mysql.createPool(poolConfig);
    // Test connectivity
    pool.getConnection((err, conn) => {
      if (err) {
        console.warn(`[Database] MySQL connection attempt failed (${err.code || err.message}). Gracefully falling back to SQLite.`);
        mysqlPool = null;
        initSqlite();
      } else {
        console.log("[Database] Connected successfully to Cloud/Local MySQL.");
        conn.release();
        mysqlPool = pool;
        activeDriver = "mysql";
      }
    });
  } catch (err) {
    console.warn(`[Database] MySQL pool creation failed: ${err.message}. Falling back to SQLite.`);
    mysqlPool = null;
    initSqlite();
  }
}

// Start database initialization
initMySQL();

/**
 * Universal query runner
 */
async function query(sql, params = []) {
  if (activeDriver === "mysql" && mysqlPool) {
    return new Promise((resolve, reject) => {
      mysqlPool.query(sql, params, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  }

  // SQLite execution
  if (!sqliteDb) {
    initSqlite();
  }

  // Normalize MySQL syntax to SQLite if necessary
  let normalizedSql = sql
    .replace(/INT AUTO_INCREMENT PRIMARY KEY/gi, "INTEGER PRIMARY KEY AUTOINCREMENT")
    .replace(/TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP/gi, "DATETIME DEFAULT CURRENT_TIMESTAMP")
    .replace(/TIMESTAMP DEFAULT CURRENT_TIMESTAMP/gi, "DATETIME DEFAULT CURRENT_TIMESTAMP")
    .replace(/NOW\(\)/gi, "DATETIME('now')");

  try {
    const trimmed = normalizedSql.trim();
    const isSelect = /^SELECT|^PRAGMA|^EXPLAIN/i.test(trimmed);

    if (isSelect) {
      const stmt = sqliteDb.prepare(normalizedSql);
      const rows = stmt.all(...params);
      return rows;
    } else {
      const stmt = sqliteDb.prepare(normalizedSql);
      const result = stmt.run(...params);
      return {
        insertId: Number(result.lastInsertRowid),
        affectedRows: Number(result.changes),
      };
    }
  } catch (err) {
    // If table doesn't exist or SQL error, rethrow
    throw err;
  }
}

async function get(sql, params = []) {
  const rows = await query(sql, params);
  return rows && rows.length > 0 ? rows[0] : null;
}

async function all(sql, params = []) {
  const rows = await query(sql, params);
  return Array.isArray(rows) ? rows : [];
}

async function run(sql, params = []) {
  const result = await query(sql, params);
  return result;
}

async function exec(sql) {
  if (activeDriver === "mysql" && mysqlPool) {
    return new Promise((resolve, reject) => {
      mysqlPool.query(sql, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  }
  if (!sqliteDb) initSqlite();
  return sqliteDb.exec(sql);
}

function getDriver() {
  return activeDriver;
}

module.exports = {
  query,
  get,
  all,
  run,
  exec,
  getDriver,
};
