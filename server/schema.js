/**
 * Zynthor Business OS — Schema Initializer & Migration Engine
 * Auto-creates all multi-tenant tables, indexes, and safely applies incremental migrations.
 */

const db = require("./db");

async function initSchema() {
  console.log("[Schema] Initializing database tables & applying migrations...");

  const driver = db.getDriver();
  const idType = driver === "sqlite" ? "INTEGER PRIMARY KEY AUTOINCREMENT" : "INT AUTO_INCREMENT PRIMARY KEY";
  const tsType = "DATETIME DEFAULT CURRENT_TIMESTAMP";

  const tables = [
    // 1. Businesses / Tenants
    `CREATE TABLE IF NOT EXISTS businesses (
      id ${idType},
      name VARCHAR(150) NOT NULL,
      slug VARCHAR(100) UNIQUE NOT NULL,
      industry VARCHAR(50) DEFAULT 'general',
      email VARCHAR(150) NOT NULL,
      phone VARCHAR(50),
      address TEXT,
      currency VARCHAR(10) DEFAULT 'INR',
      plan VARCHAR(50) DEFAULT 'growth',
      plan_status VARCHAR(50) DEFAULT 'active',
      status VARCHAR(50) DEFAULT 'active',
      is_archived INTEGER DEFAULT 0,
      archived_at DATETIME DEFAULT NULL,
      deleted_at DATETIME DEFAULT NULL,
      deleted_by INTEGER DEFAULT NULL,
      is_demo INTEGER DEFAULT 0,
      created_at ${tsType},
      updated_at ${tsType}
    )`,

    // 2. Users (Role-based access: owner, admin, manager, staff)
    `CREATE TABLE IF NOT EXISTS users (
      id ${idType},
      business_id INTEGER NOT NULL,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(150) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'admin',
      avatar VARCHAR(255),
      created_at ${tsType}
    )`,

    // 3. Contacts
    `CREATE TABLE IF NOT EXISTS contacts (
      id ${idType},
      name VARCHAR(100) NOT NULL,
      email VARCHAR(150) NOT NULL,
      phone VARCHAR(50) DEFAULT NULL,
      service VARCHAR(100) DEFAULT NULL,
      budget VARCHAR(50) DEFAULT NULL,
      message TEXT NOT NULL,
      inquiry_type VARCHAR(50) DEFAULT 'contact',
      created_at ${tsType}
    )`,

    // 4. Leads (Full CRM pipeline for businesses)
    `CREATE TABLE IF NOT EXISTS leads (
      id ${idType},
      business_id INTEGER NOT NULL,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(150) NOT NULL,
      phone VARCHAR(50),
      service VARCHAR(100),
      budget VARCHAR(50),
      source VARCHAR(50) DEFAULT 'Website Inbound',
      status VARCHAR(50) DEFAULT 'new',
      notes TEXT,
      follow_up_date VARCHAR(20),
      assigned_to VARCHAR(100),
      last_contacted_at DATETIME,
      created_at ${tsType},
      updated_at ${tsType}
    )`,

    // 5. Customers Directory
    `CREATE TABLE IF NOT EXISTS customers (
      id ${idType},
      business_id INTEGER NOT NULL,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(150),
      phone VARCHAR(50),
      notes TEXT,
      total_spend REAL DEFAULT 0,
      visit_count INTEGER DEFAULT 1,
      last_visit DATETIME,
      created_at ${tsType}
    )`,

    // 6. Notifications
    `CREATE TABLE IF NOT EXISTS notifications (
      id ${idType},
      business_id INTEGER NOT NULL,
      title VARCHAR(150) NOT NULL,
      message TEXT NOT NULL,
      type VARCHAR(50) DEFAULT 'system',
      is_read INTEGER DEFAULT 0,
      link VARCHAR(255),
      created_at ${tsType}
    )`,

    // 7. Activity Logs
    `CREATE TABLE IF NOT EXISTS activity_logs (
      id ${idType},
      business_id INTEGER NOT NULL,
      user_id INTEGER,
      user_name VARCHAR(100) DEFAULT 'System',
      action VARCHAR(100) NOT NULL,
      entity_type VARCHAR(50) NOT NULL,
      entity_id INTEGER,
      details TEXT,
      created_at ${tsType}
    )`,

    // 8. Salon Categories
    `CREATE TABLE IF NOT EXISTS salon_categories (
      id ${idType},
      business_id INTEGER NOT NULL,
      name VARCHAR(100) NOT NULL,
      description TEXT,
      display_order INTEGER DEFAULT 0
    )`,

    // 9. Salon Services Catalogue
    `CREATE TABLE IF NOT EXISTS salon_services (
      id ${idType},
      business_id INTEGER NOT NULL,
      category_id INTEGER,
      name VARCHAR(150) NOT NULL,
      description TEXT,
      duration_mins INTEGER DEFAULT 60,
      price REAL NOT NULL,
      image_url TEXT,
      is_active INTEGER DEFAULT 1,
      created_at ${tsType}
    )`,

    // 10. Salon Staff Profiles & Schedules
    `CREATE TABLE IF NOT EXISTS salon_staff (
      id ${idType},
      business_id INTEGER NOT NULL,
      name VARCHAR(100) NOT NULL,
      role VARCHAR(100) NOT NULL,
      email VARCHAR(150),
      phone VARCHAR(50),
      avatar_url TEXT,
      working_days VARCHAR(100) DEFAULT 'Mon,Tue,Wed,Thu,Fri,Sat',
      start_time VARCHAR(20) DEFAULT '09:00',
      end_time VARCHAR(20) DEFAULT '20:00',
      is_active INTEGER DEFAULT 1
    )`,

    // 11. Salon Appointments (with double-booking protection)
    `CREATE TABLE IF NOT EXISTS salon_appointments (
      id ${idType},
      business_id INTEGER NOT NULL,
      customer_id INTEGER,
      customer_name VARCHAR(100) NOT NULL,
      customer_email VARCHAR(150),
      customer_phone VARCHAR(50) NOT NULL,
      service_id INTEGER NOT NULL,
      service_name VARCHAR(150),
      staff_id INTEGER NOT NULL,
      staff_name VARCHAR(100),
      appointment_date VARCHAR(20) NOT NULL,
      appointment_time VARCHAR(20) NOT NULL,
      end_time VARCHAR(20),
      status VARCHAR(50) DEFAULT 'confirmed',
      notes TEXT,
      total_price REAL NOT NULL,
      created_at ${tsType}
    )`,

    // 12. Salon Packages & Memberships
    `CREATE TABLE IF NOT EXISTS salon_packages (
      id ${idType},
      business_id INTEGER NOT NULL,
      name VARCHAR(150) NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      validity_days INTEGER DEFAULT 365,
      services_included TEXT,
      is_active INTEGER DEFAULT 1
    )`,

    // 13. Cafe Categories
    `CREATE TABLE IF NOT EXISTS cafe_categories (
      id ${idType},
      business_id INTEGER NOT NULL,
      name VARCHAR(100) NOT NULL,
      icon VARCHAR(50) DEFAULT 'utensils',
      display_order INTEGER DEFAULT 0
    )`,

    // 14. Cafe Dishes
    `CREATE TABLE IF NOT EXISTS cafe_dishes (
      id ${idType},
      business_id INTEGER NOT NULL,
      category_id INTEGER,
      name VARCHAR(150) NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      is_veg INTEGER DEFAULT 1,
      is_available INTEGER DEFAULT 1,
      image_url TEXT,
      prep_time_mins INTEGER DEFAULT 15,
      calories INTEGER DEFAULT 350,
      addons_json TEXT,
      created_at ${tsType}
    )`,

    // 15. Cafe Tables
    `CREATE TABLE IF NOT EXISTS cafe_tables (
      id ${idType},
      business_id INTEGER NOT NULL,
      table_number VARCHAR(20) NOT NULL,
      capacity INTEGER DEFAULT 4,
      status VARCHAR(50) DEFAULT 'available',
      qr_token VARCHAR(100)
    )`,

    // 16. Cafe Orders (Live Kitchen Workflow)
    `CREATE TABLE IF NOT EXISTS cafe_orders (
      id ${idType},
      business_id INTEGER NOT NULL,
      table_number VARCHAR(20),
      order_type VARCHAR(50) DEFAULT 'dine_in',
      customer_name VARCHAR(100),
      customer_phone VARCHAR(50),
      items_json TEXT NOT NULL,
      subtotal REAL NOT NULL,
      tax REAL DEFAULT 0,
      total REAL NOT NULL,
      status VARCHAR(50) DEFAULT 'received',
      notes TEXT,
      created_at ${tsType},
      updated_at ${tsType}
    )`,

    // 17. Cafe Reservations
    `CREATE TABLE IF NOT EXISTS cafe_reservations (
      id ${idType},
      business_id INTEGER NOT NULL,
      customer_name VARCHAR(100) NOT NULL,
      customer_phone VARCHAR(50) NOT NULL,
      customer_email VARCHAR(150),
      party_size INTEGER DEFAULT 2,
      reservation_date VARCHAR(20) NOT NULL,
      reservation_time VARCHAR(20) NOT NULL,
      table_number VARCHAR(20),
      status VARCHAR(50) DEFAULT 'confirmed',
      special_requests TEXT,
      created_at ${tsType}
    )`,

    // 18. AI Conversations & Messages
    `CREATE TABLE IF NOT EXISTS ai_conversations (
      id ${idType},
      business_id INTEGER NOT NULL,
      session_id VARCHAR(100) NOT NULL,
      customer_name VARCHAR(100) DEFAULT 'Guest Client',
      channel VARCHAR(50) DEFAULT 'web_assistant',
      created_at ${tsType},
      updated_at ${tsType}
    )`,

    `CREATE TABLE IF NOT EXISTS ai_messages (
      id ${idType},
      conversation_id INTEGER NOT NULL,
      sender VARCHAR(50) NOT NULL,
      message TEXT NOT NULL,
      intent VARCHAR(100),
      suggested_actions_json TEXT,
      created_at ${tsType}
    )`,

    // 19. Automation Rules & Logs
    `CREATE TABLE IF NOT EXISTS automation_rules (
      id ${idType},
      business_id INTEGER NOT NULL,
      name VARCHAR(150) NOT NULL,
      trigger_event VARCHAR(100) NOT NULL,
      is_enabled INTEGER DEFAULT 1,
      actions_json TEXT,
      conditions_json TEXT,
      created_at ${tsType}
    )`,

    `CREATE TABLE IF NOT EXISTS automation_logs (
      id ${idType},
      business_id INTEGER NOT NULL,
      rule_id INTEGER,
      rule_name VARCHAR(150),
      trigger_event VARCHAR(100) NOT NULL,
      status VARCHAR(50) DEFAULT 'success',
      delivery_mode VARCHAR(50) DEFAULT 'simulated',
      payload_json TEXT,
      error_message TEXT,
      executed_at ${tsType}
    )`,

    // 20. Business Settings
    `CREATE TABLE IF NOT EXISTS business_settings (
      id ${idType},
      business_id INTEGER UNIQUE NOT NULL,
      ai_system_prompt TEXT,
      brand_voice VARCHAR(50) DEFAULT 'Executive & Warm',
      ai_language_mode VARCHAR(50) DEFAULT 'auto',
      auto_reply_enabled INTEGER DEFAULT 1,
      notification_email VARCHAR(150),
      notification_sms VARCHAR(50),
      timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
      operating_hours TEXT,
      tagline TEXT,
      primary_color VARCHAR(50) DEFAULT 'blue',
      banner_message TEXT,
      updated_at ${tsType}
    )`,

    // 21. Invoices (Phase 10)
    `CREATE TABLE IF NOT EXISTS invoices (
      id ${idType},
      business_id INTEGER NOT NULL,
      invoice_number VARCHAR(50) NOT NULL,
      customer_id INTEGER,
      customer_name VARCHAR(100) NOT NULL,
      customer_email VARCHAR(150),
      customer_phone VARCHAR(50),
      subtotal REAL NOT NULL,
      discount REAL DEFAULT 0,
      coupon_code VARCHAR(50),
      tax REAL DEFAULT 0,
      total REAL NOT NULL,
      status VARCHAR(50) DEFAULT 'pending',
      payment_method VARCHAR(50) DEFAULT 'online',
      due_date VARCHAR(20),
      paid_at DATETIME,
      notes TEXT,
      items_json TEXT NOT NULL,
      created_at ${tsType},
      updated_at ${tsType}
    )`,

    // 22. Coupons (Phase 10)
    `CREATE TABLE IF NOT EXISTS coupons (
      id ${idType},
      business_id INTEGER NOT NULL,
      code VARCHAR(50) NOT NULL,
      description TEXT,
      discount_type VARCHAR(20) DEFAULT 'percent',
      discount_val REAL NOT NULL,
      min_spend REAL DEFAULT 0,
      max_discount REAL,
      valid_from VARCHAR(20),
      valid_to VARCHAR(20),
      usage_limit INTEGER DEFAULT 100,
      used_count INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at ${tsType}
    )`,

    // 23. Payments Ledger (Phase 11)
    `CREATE TABLE IF NOT EXISTS payments (
      id ${idType},
      business_id INTEGER NOT NULL,
      invoice_id INTEGER,
      transaction_ref VARCHAR(100) NOT NULL,
      gateway VARCHAR(50) DEFAULT 'sandbox',
      amount REAL NOT NULL,
      currency VARCHAR(10) DEFAULT 'INR',
      status VARCHAR(50) DEFAULT 'captured',
      idempotency_key VARCHAR(100),
      payload_json TEXT,
      created_at ${tsType}
    )`,

    // 24. Deleted Businesses Audit (Phase 2 & Phase 14)
    `CREATE TABLE IF NOT EXISTS deleted_businesses_audit (
      id ${idType},
      business_id INTEGER NOT NULL,
      business_name VARCHAR(150) NOT NULL,
      deleted_by_user_id INTEGER,
      deleted_by_email VARCHAR(150),
      snapshot_json TEXT NOT NULL,
      records_count_json TEXT,
      deleted_at ${tsType}
    )`
  ];

  for (const sql of tables) {
    try {
      await db.exec(sql);
    } catch (err) {
      console.error(`[Schema] Table creation error:`, err.message);
    }
  }

  // Safe migrations for incremental columns on existing tables
  await applyIncrementalMigrations();

  // Create performance and tenant isolation indexes
  await applyIndexes();

  console.log("[Schema] All database tables and migrations ready.");
}

/**
 * Safely add missing columns to existing tables without breaking data
 */
async function applyIncrementalMigrations() {
  const driver = db.getDriver();
  const migrations = [
    { table: "businesses", column: "status", def: "VARCHAR(50) DEFAULT 'active'" },
    { table: "businesses", column: "is_archived", def: "INTEGER DEFAULT 0" },
    { table: "businesses", column: "archived_at", def: "DATETIME DEFAULT NULL" },
    { table: "businesses", column: "deleted_at", def: "DATETIME DEFAULT NULL" },
    { table: "businesses", column: "deleted_by", def: "INTEGER DEFAULT NULL" },
    { table: "leads", column: "follow_up_date", def: "VARCHAR(20) DEFAULT NULL" },
    { table: "leads", column: "assigned_to", def: "VARCHAR(100) DEFAULT NULL" },
    { table: "business_settings", column: "tagline", def: "TEXT DEFAULT NULL" },
    { table: "business_settings", column: "primary_color", def: "VARCHAR(50) DEFAULT 'blue'" },
    { table: "business_settings", column: "banner_message", def: "TEXT DEFAULT NULL" },
    { table: "automation_logs", column: "delivery_mode", def: "VARCHAR(50) DEFAULT 'simulated'" },
  ];

  for (const m of migrations) {
    try {
      if (driver === "sqlite") {
        const cols = await db.all(`PRAGMA table_info(${m.table})`);
        const exists = cols.some((c) => c.name === m.column);
        if (!exists) {
          await db.exec(`ALTER TABLE ${m.table} ADD COLUMN ${m.column} ${m.def}`);
          console.log(`[Migration] Added column ${m.table}.${m.column}`);
        }
      } else {
        // MySQL check
        const cols = await db.all(
          `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = ? AND COLUMN_NAME = ?`,
          [m.table, m.column]
        );
        if (!cols || cols.length === 0) {
          await db.exec(`ALTER TABLE ${m.table} ADD COLUMN ${m.column} ${m.def}`);
          console.log(`[Migration] Added column ${m.table}.${m.column}`);
        }
      }
    } catch (_err) {
      // Ignore if already present
    }
  }
}

/**
 * Apply performance and foreign key indexes
 */
async function applyIndexes() {
  const indexes = [
    "CREATE INDEX IF NOT EXISTS idx_leads_business ON leads(business_id)",
    "CREATE INDEX IF NOT EXISTS idx_customers_business ON customers(business_id)",
    "CREATE INDEX IF NOT EXISTS idx_users_business ON users(business_id)",
    "CREATE INDEX IF NOT EXISTS idx_salon_appts_business ON salon_appointments(business_id)",
    "CREATE INDEX IF NOT EXISTS idx_cafe_orders_business ON cafe_orders(business_id)",
    "CREATE INDEX IF NOT EXISTS idx_invoices_business ON invoices(business_id)",
    "CREATE INDEX IF NOT EXISTS idx_coupons_business ON coupons(business_id)",
    "CREATE INDEX IF NOT EXISTS idx_payments_business ON payments(business_id)",
    "CREATE INDEX IF NOT EXISTS idx_activity_business ON activity_logs(business_id)",
    "CREATE INDEX IF NOT EXISTS idx_businesses_archived ON businesses(is_archived)",
  ];

  for (const idxSql of indexes) {
    try {
      await db.exec(idxSql);
    } catch (_err) {
      // Indexes may exist
    }
  }
}

module.exports = { initSchema };