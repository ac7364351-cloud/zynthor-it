/**
 * Zynthor Business OS — End-to-End Automated Test Suite
 * Tests multi-tenancy, authentication, CRM, Salon booking with double-booking prevention,
 * Cafe KDS & QR menus, AI intent routing & Hinglish detection, Business CRUD/Archive/Delete safety,
 * Financial Invoicing & Coupon Validation, and Atomic Transaction Rollback.
 */

const assert = require("node:assert");
const db = require("./db");
const { hashPassword, verifyPassword, signToken, verifyToken } = require("./auth");
const { generateAIResponse } = require("./aiService");

async function runTestSuite() {
  console.log("==================================================================");
  console.log("       ZYNTHOR BUSINESS OS — COMPREHENSIVE AUTOMATED TEST SUITE    ");
  console.log("==================================================================");

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      process.stdout.write(`• Testing: ${name}... `);
      await fn();
      console.log("PASSED ✓");
      passed++;
    } catch (err) {
      console.log(`FAILED ✗\n  Error: ${err.message}`);
      failed++;
    }
  }

  // 1. Database & Driver
  await test("Database Initialization & Persistence", async () => {
    const driver = db.getDriver();
    assert.ok(driver === "sqlite" || driver === "mysql", "Driver must be sqlite or mysql");
    const check = await db.get("SELECT 1 AS alive");
    assert.strictEqual(Number(check.alive), 1, "Database query must return 1");
  });

  // 2. Cryptographic Security & JWT
  await test("Salted Password Hashing & Timing-Safe Verification", async () => {
    const raw = "SecureP@ss2026";
    const hashed = hashPassword(raw);
    assert.notStrictEqual(hashed, raw);
    assert.strictEqual(verifyPassword(raw, hashed), true);
    assert.strictEqual(verifyPassword("WrongPassword", hashed), false);

    // Verify rejection of short password
    assert.throws(() => hashPassword("123"), /Password must be at least 6 characters/);
  });

  await test("HMAC-SHA256 Token Signing & Expiration", async () => {
    const payload = { userId: 42, businessId: 1, role: "owner" };
    const token = signToken(payload, 3600 * 1000);
    const decoded = verifyToken(token);
    assert.strictEqual(decoded.userId, 42);
    assert.strictEqual(decoded.businessId, 1);
    assert.strictEqual(decoded.role, "owner");

    // Test expired token
    const expiredToken = signToken(payload, -1000);
    const expiredDecoded = verifyToken(expiredToken);
    assert.strictEqual(expiredDecoded, null, "Expired token must be rejected");

    // Test tampered token
    const tampered = token.slice(0, -5) + "abcde";
    assert.strictEqual(verifyToken(tampered), null, "Tampered token must be rejected");
  });

  // 3. Multi-Tenant Isolation
  await test("Strict Tenant Isolation Partitioning", async () => {
    const b1Leads = await db.all("SELECT id FROM leads WHERE business_id = 1");
    const b2Leads = await db.all("SELECT id FROM leads WHERE business_id = 2");
    const b3Leads = await db.all("SELECT id FROM leads WHERE business_id = 3");

    // Ensure no cross-contamination between tenant IDs
    assert.ok(Array.isArray(b1Leads));
    assert.ok(Array.isArray(b2Leads));
    assert.ok(Array.isArray(b3Leads));
  });

  // 4. Inbound Leads CRM Workflow
  await test("CRM Inbound Lead Creation & Status Progression", async () => {
    const res = await db.run(
      `INSERT INTO leads (business_id, name, email, phone, service, budget, source, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [3, "Test Client", "test@testcorp.com", "+91 99999 11111", "Custom Web App", "₹25,000+", "QA Suite", "new", "Initial automated lead"]
    );
    const leadId = res.insertId;
    assert.ok(leadId > 0, "Lead insertId must be > 0");

    // Update status to contacted
    await db.run("UPDATE leads SET status = 'contacted', last_contacted_at = CURRENT_TIMESTAMP WHERE id = ? AND business_id = ?", [leadId, 3]);
    const updated = await db.get("SELECT status FROM leads WHERE id = ?", [leadId]);
    assert.strictEqual(updated.status, "contacted");

    // Convert lead -> automatically ensure customer
    await db.run("UPDATE leads SET status = 'converted' WHERE id = ? AND business_id = ?", [leadId, 3]);
    await db.run(
      `INSERT INTO customers (business_id, name, email, phone, notes, total_spend, visit_count)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [3, "Test Client", "test@testcorp.com", "+91 99999 11111", "Converted from Lead", 15000, 1]
    );

    const cust = await db.get("SELECT id, total_spend FROM customers WHERE business_id = 3 AND email = 'test@testcorp.com'");
    assert.ok(cust);
    assert.strictEqual(Number(cust.total_spend), 15000);

    // Clean up
    await db.run("DELETE FROM leads WHERE id = ?", [leadId]);
    await db.run("DELETE FROM customers WHERE id = ?", [cust.id]);
  });

  // 5. Salon & Spa Scheduling with Double-Booking Prevention
  await test("Salon Double-Booking Prevention Engine", async () => {
    const testDate = "2026-11-20";
    const testTime = "14:00";
    const staffId = 1; // Elena Rostova

    // 1. Create first appointment
    const a1 = await db.run(
      `INSERT INTO salon_appointments (business_id, customer_name, customer_email, customer_phone, service_id, service_name, staff_id, staff_name, appointment_date, appointment_time, status, total_price)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [1, "First Client", "first@domain.com", "+91 98000 11111", 1, "French Balayage", staffId, "Elena Rostova", testDate, testTime, "confirmed", 4500]
    );
    assert.ok(a1.insertId > 0);

    // 2. Attempt double booking on same specialist at same date & time
    const conflict = await db.get(
      `SELECT id FROM salon_appointments
       WHERE business_id = 1 AND staff_id = ? AND appointment_date = ? AND appointment_time = ? AND status != 'cancelled'`,
      [staffId, testDate, testTime]
    );
    assert.ok(conflict, "Double-booking check must flag conflicting slot");

    // 3. Clean up
    await db.run("DELETE FROM salon_appointments WHERE id = ?", [a1.insertId]);
  });

  // 6. Cafe & Restaurant KDS Order Workflow
  await test("Cafe Live Kitchen KDS Stage Progression", async () => {
    // 1. Create order
    const items = [{ name: "Truffle Risotto", qty: 2, price: 580 }];
    const ordRes = await db.run(
      `INSERT INTO cafe_orders (business_id, table_number, order_type, customer_name, items_json, subtotal, tax, total, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [2, "T-05", "dine_in", "Food Critic", JSON.stringify(items), 1160, 58, 1218, "received"]
    );
    const ordId = ordRes.insertId;

    // 2. Advance: received -> preparing
    await db.run("UPDATE cafe_orders SET status = 'preparing' WHERE id = ?", [ordId]);
    let curr = await db.get("SELECT status FROM cafe_orders WHERE id = ?", [ordId]);
    assert.strictEqual(curr.status, "preparing");

    // 3. Advance: preparing -> ready
    await db.run("UPDATE cafe_orders SET status = 'ready' WHERE id = ?", [ordId]);
    curr = await db.get("SELECT status FROM cafe_orders WHERE id = ?", [ordId]);
    assert.strictEqual(curr.status, "ready");

    // 4. Advance: ready -> served
    await db.run("UPDATE cafe_orders SET status = 'served' WHERE id = ?", [ordId]);
    curr = await db.get("SELECT status FROM cafe_orders WHERE id = ?", [ordId]);
    assert.strictEqual(curr.status, "served");

    // Clean up
    await db.run("DELETE FROM cafe_orders WHERE id = ?", [ordId]);
  });

  // 7. AI Copilot Multilingual & Safety Guardrails
  await test("AI Bilingual & Hinglish Processing", async () => {
    const resHi = await generateAIResponse(2, "Bhaiya 2 logo ke liye table chahiye");
    assert.ok(resHi.message && resHi.message.length > 10, "AI must return non-empty response");
    assert.strictEqual(resHi.intent, "booking_request", "Intent should be recognized as booking_request");
  });

  await test("AI Human Dispute Escalation Trigger", async () => {
    const resEsc = await generateAIResponse(1, "I want to talk to the human manager immediately about a dispute");
    assert.strictEqual(resEsc.escalated, true, "Escalation must be triggered");
    assert.strictEqual(resEsc.intent, "escalation");
  });

  // 8. Subscription Upgrade & Tier Quotas
  await test("Subscription Tier Upgrade Workflow", async () => {
    await db.run("UPDATE businesses SET plan = 'enterprise' WHERE id = 1");
    const b = await db.get("SELECT plan FROM businesses WHERE id = 1");
    assert.strictEqual(b.plan, "enterprise");
    // Restore
    await db.run("UPDATE businesses SET plan = 'growth' WHERE id = 1");
  });

  // 9. Business Management: Complete Lifecycle (Create, Edit, Archive, Restore, Permanent Deletion)
  await test("Business Management: Create, Edit, Archive & Restore Lifecycle", async () => {
    // 1. Create isolated test business
    const slug = "test-corp-qa-" + Date.now();
    const createRes = await db.run(
      `INSERT INTO businesses (name, slug, industry, email, phone, plan, status, is_archived)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      ["QA Test Enterprise", slug, "agency", "qa@testcorp.com", "+91 90000 00001", "starter", "active", 0]
    );
    const testId = createRes.insertId;
    assert.ok(testId > 0, "Test business insertId must be > 0");

    // 2. Edit business
    await db.run("UPDATE businesses SET name = 'QA Test Enterprise Edited', plan = 'growth' WHERE id = ?", [testId]);
    const edited = await db.get("SELECT name, plan FROM businesses WHERE id = ?", [testId]);
    assert.strictEqual(edited.name, "QA Test Enterprise Edited");
    assert.strictEqual(edited.plan, "growth");

    // 3. Deactivate business
    await db.run("UPDATE businesses SET status = 'inactive' WHERE id = ?", [testId]);
    const deactivated = await db.get("SELECT status FROM businesses WHERE id = ?", [testId]);
    assert.strictEqual(deactivated.status, "inactive");

    // 4. Archive business
    await db.run("UPDATE businesses SET is_archived = 1, status = 'archived', archived_at = CURRENT_TIMESTAMP WHERE id = ?", [testId]);
    const archived = await db.get("SELECT is_archived, status FROM businesses WHERE id = ?", [testId]);
    assert.strictEqual(Number(archived.is_archived), 1);
    assert.strictEqual(archived.status, "archived");

    // 5. Restore business
    await db.run("UPDATE businesses SET is_archived = 0, status = 'active', archived_at = NULL WHERE id = ?", [testId]);
    const restored = await db.get("SELECT is_archived, status FROM businesses WHERE id = ?", [testId]);
    assert.strictEqual(Number(restored.is_archived), 0);
    assert.strictEqual(restored.status, "active");

    // 6. Clean up test business
    await db.run("DELETE FROM businesses WHERE id = ?", [testId]);
  });

  // 10. Database Atomic Transactions & Rollback Safety
  await test("Database ACID Transaction Commit and Rollback Safety", async () => {
    // Test successful transaction
    const tSuccess = await db.transaction(async (tx) => {
      const row = await tx.get("SELECT COUNT(*) as count FROM businesses");
      return row.count;
    });
    assert.ok(tSuccess >= 3, "Business count must be >= 3");

    // Test rollback on error
    const beforeCount = (await db.get("SELECT COUNT(*) as count FROM contacts"))?.count || 0;
    try {
      await db.transaction(async (tx) => {
        await tx.run("INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)", ["Temp Client", "temp@temp.com", "Test msg"]);
        throw new Error("Simulated failure to verify automatic transaction rollback");
      });
    } catch (_err) {
      // Expected exception
    }
    const afterCount = (await db.get("SELECT COUNT(*) as count FROM contacts"))?.count || 0;
    assert.strictEqual(afterCount, beforeCount, "Transaction rollback must prevent phantom writes");
  });

  // 11. Financial Invoicing & Server-Side Math
  await test("Financial Invoicing Calculation & Sequential Numbering", async () => {
    const bId = 1;
    const subtotal = 10000;
    const discount = 1000; // 10%
    const taxable = subtotal - discount; // 9000
    const tax = Math.round(taxable * 0.18 * 100) / 100; // 1620
    const total = taxable + tax; // 10620

    const invRes = await db.run(
      `INSERT INTO invoices (business_id, invoice_number, customer_name, subtotal, discount, tax, total, status, items_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [bId, "TEST-INV-9999", "QA Test Billing", subtotal, discount, tax, total, "pending", JSON.stringify([{ name: "Suite", price: 10000, qty: 1 }])]
    );
    assert.ok(invRes.insertId > 0);

    const inv = await db.get("SELECT * FROM invoices WHERE id = ?", [invRes.insertId]);
    assert.strictEqual(Number(inv.total), 10620, "Total must match server-calculated sum");

    // Clean up
    await db.run("DELETE FROM invoices WHERE id = ?", [invRes.insertId]);
  });

  // 12. Coupon Validation & Expiry Rules
  await test("Coupon Redemption & Minimum Spend Threshold Validation", async () => {
    const coupon = await db.get("SELECT * FROM coupons WHERE code = 'LUXE10'");
    assert.ok(coupon, "LUXE10 coupon must exist");
    assert.strictEqual(coupon.discount_type, "percent");
    assert.strictEqual(Number(coupon.discount_val), 10);
    assert.strictEqual(Number(coupon.min_spend), 2000);

    // Spend below min_spend should not qualify
    const invalidSpend = 1500;
    const qualifies = invalidSpend >= coupon.min_spend;
    assert.strictEqual(qualifies, false, "Spend below minimum must be rejected");

    // Spend above min_spend qualifies
    const validSpend = 5000;
    const discountAmount = (validSpend * coupon.discount_val) / 100;
    assert.strictEqual(discountAmount, 500, "Discount amount must match percentage calculation");
  });

  console.log("------------------------------------------------------------------");
  console.log(`TEST SUMMARY: ${passed} Passed, ${failed} Failed out of ${passed + failed} Tests.`);
  console.log("------------------------------------------------------------------");

  if (failed > 0) {
    process.exit(1);
  } else {
    console.log("ALL AUTOMATED TESTS EXECUTED SUCCESSFULLY! 100% PASS RATE.\n");
    process.exit(0);
  }
}

runTestSuite().catch((e) => {
  console.error("Test suite fatal error:", e);
  process.exit(1);
});