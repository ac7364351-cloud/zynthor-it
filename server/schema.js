/**
 * Zynthor Business OS — Schema Initializer
 * Auto-creates all multi-tenant tables for CRM, Salon, Cafe, AI & Settings.
 */

const db = require("./db");

async function initSchema() {
  console.log("[Schema] Initializing database tables...");

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

    // 3. Contacts (Preserves backward compatibility with existing Zynthor agency contact form)
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
      updated_at ${tsType}
    )`
  ];

  for (const sql of tables) {
    try {
      await db.exec(sql);
    } catch (err) {
      console.error(`[Schema] Table creation error:`, err.message);
    }
  }

  console.log("[Schema] All database tables ready.");
}

module.exports = { initSchema };
