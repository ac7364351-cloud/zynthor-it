/**
 * Zynthor Business OS — Demo & Initial Data Seeder
 * Populates realistic, verified operational records for Salon, Cafe, and Agency verticals.
 * Ensures strict tenant isolation via business_id partitioning.
 */

const db = require("./db");
const crypto = require("node:crypto");

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

async function seedData() {
  try {
    const existingBusinesses = await db.all("SELECT id, slug FROM businesses LIMIT 5");
    if (existingBusinesses && existingBusinesses.length > 0) {
      console.log(`[Seed] Database already contains ${existingBusinesses.length} businesses. Skipping seed.`);
      return;
    }

    console.log("[Seed] Seeding initial businesses, users, and operational data...");

    const defaultPasswordHash = hashPassword("Demo@123");
    const adminPasswordHash = hashPassword("Admin@123");

    // 1. Businesses
    const b1 = await db.run(
      `INSERT INTO businesses (name, slug, industry, email, phone, address, currency, plan, plan_status, is_demo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        "Luxe Aura Hair & Wellness Studio",
        "luxe-aura",
        "salon",
        "contact@luxeaura.com",
        "+91 98765 43210",
        "Suite 402, Horizon Pinnacle, Bandra West, Mumbai",
        "INR",
        "growth",
        "active",
        1,
      ]
    );
    const b1Id = b1.insertId;

    const b2 = await db.run(
      `INSERT INTO businesses (name, slug, industry, email, phone, address, currency, plan, plan_status, is_demo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        "Velvet & Vine Bistro",
        "velvet-vine",
        "cafe",
        "reservations@velvetvine.com",
        "+91 98234 56789",
        "Plot 18, Indiranagar 100ft Road, Bengaluru",
        "INR",
        "enterprise",
        "active",
        1,
      ]
    );
    const b2Id = b2.insertId;

    const b3 = await db.run(
      `INSERT INTO businesses (name, slug, industry, email, phone, address, currency, plan, plan_status, is_demo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        "Zynthor IT Agency",
        "zynthor-agency",
        "agency",
        "sales@zynthor.com",
        "+91 91234 56780",
        "Cyber City Hub, DLF Phase 2, Gurugram",
        "INR",
        "enterprise",
        "active",
        1,
      ]
    );
    const b3Id = b3.insertId;

    // 2. Users (Role: owner, admin, manager, staff)
    await db.run(
      `INSERT INTO users (business_id, name, email, password_hash, role, avatar)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        b1Id,
        "Elena Rostova",
        "elena@luxeaura.com",
        defaultPasswordHash,
        "owner",
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
      ]
    );

    await db.run(
      `INSERT INTO users (business_id, name, email, password_hash, role, avatar)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        b2Id,
        "Chef Arjun Malhotra",
        "chefarjun@velvetvine.com",
        defaultPasswordHash,
        "owner",
        "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=256&q=80",
      ]
    );

    await db.run(
      `INSERT INTO users (business_id, name, email, password_hash, role, avatar)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        b3Id,
        "Siddharth Rao",
        "admin@zynthor.com",
        adminPasswordHash,
        "owner",
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80",
      ]
    );

    // 3. Settings
    await db.run(
      `INSERT INTO business_settings (business_id, ai_system_prompt, brand_voice, ai_language_mode, auto_reply_enabled, notification_email, timezone, operating_hours)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        b1Id,
        "You are the Concierge AI for Luxe Aura Hair & Wellness Studio. Help clients explore services, check real specialist availability, and schedule appointments with elegance. Speak in English or polite Hindi/Hinglish as requested. Never invent fake slots.",
        "Obsidian Luxury & Warm Concierge",
        "auto",
        1,
        "concierge@luxeaura.com",
        "Asia/Kolkata",
        JSON.stringify({ mon_sat: "09:00 - 20:00", sun: "10:00 - 18:00" }),
      ]
    );

    await db.run(
      `INSERT INTO business_settings (business_id, ai_system_prompt, brand_voice, ai_language_mode, auto_reply_enabled, notification_email, timezone, operating_hours)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        b2Id,
        "You are the Digital Host at Velvet & Vine Bistro. Guide guests through our culinary menu, artisanal coffees, vegan/gluten-free options, and table bookings. Maintain a vibrant, gourmet culinary tone.",
        "Artisanal Culinary & Inviting",
        "auto",
        1,
        "host@velvetvine.com",
        "Asia/Kolkata",
        JSON.stringify({ all_week: "08:00 - 23:30" }),
      ]
    );

    await db.run(
      `INSERT INTO business_settings (business_id, ai_system_prompt, brand_voice, ai_language_mode, auto_reply_enabled, notification_email, timezone, operating_hours)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        b3Id,
        "You are the Solution Consultant AI for Zynthor IT. Assist enterprise clients in selecting custom web applications, Power BI business dashboards, and digital automation packages. Never claim unrealistic timelines.",
        "Precision Executive & Technical Authority",
        "auto",
        1,
        "solutions@zynthor.com",
        "Asia/Kolkata",
        JSON.stringify({ mon_fri: "09:30 - 18:30" }),
      ]
    );

    // ==========================================
    // SALON DATA (Luxe Aura Studio)
    // ==========================================
    const sc1 = await db.run("INSERT INTO salon_categories (business_id, name, description, display_order) VALUES (?, ?, ?, ?)", [b1Id, "Hair Styling & Colour", "Artistic balayage, precision cuts, and gloss treatments", 1]);
    const sc2 = await db.run("INSERT INTO salon_categories (business_id, name, description, display_order) VALUES (?, ?, ?, ?)", [b1Id, "Keratin & Texture", "Intense repair, silk smoothing, and curl sculpting", 2]);
    const sc3 = await db.run("INSERT INTO salon_categories (business_id, name, description, display_order) VALUES (?, ?, ?, ?)", [b1Id, "Skincare & Facials", "Clinical glow hydrafacials and botanical peels", 3]);
    const sc4 = await db.run("INSERT INTO salon_categories (business_id, name, description, display_order) VALUES (?, ?, ?, ?)", [b1Id, "Spa & Body Therapy", "Swedish relaxation, deep tissue, and warm aroma therapy", 4]);
    const sc5 = await db.run("INSERT INTO salon_categories (business_id, name, description, display_order) VALUES (?, ?, ?, ?)", [b1Id, "Bridal & Red Carpet", "Couture hair artistry and high-definition makeovers", 5]);

    // Salon Staff
    const st1 = await db.run(
      `INSERT INTO salon_staff (business_id, name, role, email, phone, avatar_url, working_days, start_time, end_time)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        b1Id,
        "Elena Rostova",
        "Creative Director & Master Stylist",
        "elena@luxeaura.com",
        "+91 98765 11111",
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
        "Mon,Tue,Wed,Thu,Fri,Sat",
        "10:00",
        "19:00",
      ]
    );
    const st2 = await db.run(
      `INSERT INTO salon_staff (business_id, name, role, email, phone, avatar_url, working_days, start_time, end_time)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        b1Id,
        "Marcus Vance",
        "Senior Barber & Texture Artist",
        "marcus@luxeaura.com",
        "+91 98765 22222",
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80",
        "Tue,Wed,Thu,Fri,Sat,Sun",
        "09:30",
        "18:30",
      ]
    );
    const st3 = await db.run(
      `INSERT INTO salon_staff (business_id, name, role, email, phone, avatar_url, working_days, start_time, end_time)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        b1Id,
        "Priya Sharma",
        "Lead Aesthetician & Spa Therapist",
        "priya@luxeaura.com",
        "+91 98765 33333",
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80",
        "Mon,Wed,Thu,Fri,Sat,Sun",
        "10:00",
        "20:00",
      ]
    );

    // Salon Services
    const srv1 = await db.run(
      `INSERT INTO salon_services (business_id, category_id, name, description, duration_mins, price, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        b1Id,
        sc1.insertId,
        "Signature French Balayage & Glaze",
        "Hand-painted contour highlights with bespoke toning glaze, conditioning bond builder, and couture blowout.",
        120,
        4500,
        "https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=600&q=80",
      ]
    );
    const srv2 = await db.run(
      `INSERT INTO salon_services (business_id, category_id, name, description, duration_mins, price, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        b1Id,
        sc2.insertId,
        "Brazilian Keratin Velvet Infusion",
        "Deep thermal nutrient complex eliminating 95% frizz while sealing brilliant mirror shine for up to 5 months.",
        150,
        6000,
        "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80",
      ]
    );
    const srv3 = await db.run(
      `INSERT INTO salon_services (business_id, category_id, name, description, duration_mins, price, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        b1Id,
        sc3.insertId,
        "HydraFacial Elite Luminescence",
        "Vortex cleansing, glycolic peel, painless blackhead extraction, and hyaluronic infusion with LED therapy.",
        60,
        3500,
        "https://images.unsplash.com/photo-1512290900672-1f4864c39c14?auto=format&fit=crop&w=600&q=80",
      ]
    );
    const srv4 = await db.run(
      `INSERT INTO salon_services (business_id, category_id, name, description, duration_mins, price, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        b1Id,
        sc4.insertId,
        "Deep Tissue Aroma Healing Massage",
        "Targeted muscle tension relief combining cold-pressed eucalyptus oil, acupressure points, and hot basalt stones.",
        75,
        2800,
        "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=600&q=80",
      ]
    );
    const srv5 = await db.run(
      `INSERT INTO salon_services (business_id, category_id, name, description, duration_mins, price, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        b1Id,
        sc1.insertId,
        "Executive Scissor Sculpt & Beard ritual",
        "Precision shear cut tailored to face morphology, botanical hot towel treatment, and straight-razor detailing.",
        45,
        1200,
        "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80",
      ]
    );
    const srv6 = await db.run(
      `INSERT INTO salon_services (business_id, category_id, name, description, duration_mins, price, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        b1Id,
        sc5.insertId,
        "Imperial Bridal Makeover & Hair Couture",
        "Ultra-HD airbrush makeup, artisanal floral hair styling, pre-drape trial, and luxury touch-up concierge kit.",
        240,
        15000,
        "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=600&q=80",
      ]
    );

    // Salon Appointments
    const todayStr = new Date().toISOString().split("T")[0];
    await db.run(
      `INSERT INTO salon_appointments (business_id, customer_name, customer_email, customer_phone, service_id, service_name, staff_id, staff_name, appointment_date, appointment_time, end_time, status, notes, total_price)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        b1Id,
        "Ananya Singhania",
        "ananya.s@gmail.com",
        "+91 99112 33445",
        srv1.insertId,
        "Signature French Balayage & Glaze",
        st1.insertId,
        "Elena Rostova",
        todayStr,
        "11:00",
        "13:00",
        "confirmed",
        "Requested honey blonde transition with warm undertones.",
        4500,
      ]
    );

    await db.run(
      `INSERT INTO salon_appointments (business_id, customer_name, customer_email, customer_phone, service_id, service_name, staff_id, staff_name, appointment_date, appointment_time, end_time, status, notes, total_price)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        b1Id,
        "Vikramaditya Roy",
        "vikram.roy@outlook.com",
        "+91 98101 22334",
        srv5.insertId,
        "Executive Scissor Sculpt & Beard ritual",
        st2.insertId,
        "Marcus Vance",
        todayStr,
        "14:30",
        "15:15",
        "confirmed",
        "First time client, prefers organic sandalwood aftershave.",
        1200,
      ]
    );

    await db.run(
      `INSERT INTO salon_appointments (business_id, customer_name, customer_email, customer_phone, service_id, service_name, staff_id, staff_name, appointment_date, appointment_time, end_time, status, notes, total_price)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        b1Id,
        "Meera Kapoor",
        "meera.k@yahoo.co.in",
        "+91 97200 44556",
        srv3.insertId,
        "HydraFacial Elite Luminescence",
        st3.insertId,
        "Priya Sharma",
        todayStr,
        "16:00",
        "17:00",
        "pending",
        "Sensitive skin profile; booked via online website widget.",
        3500,
      ]
    );

    // Salon Packages
    await db.run(
      `INSERT INTO salon_packages (business_id, name, description, price, validity_days, services_included)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        b1Id,
        "Bridal Luminescence Royal Club",
        "Complete 3-session preparatory ritual including 2 HydraFacials, Brazilian Silk Infusion, and Day-of Bridal Makeover.",
        22500,
        90,
        "HydraFacial (2x), Keratin Infusion (1x), Couture Bridal Styling (1x)",
      ]
    );

    // ==========================================
    // CAFE DATA (Velvet & Vine Bistro)
    // ==========================================
    const cc1 = await db.run("INSERT INTO cafe_categories (business_id, name, icon, display_order) VALUES (?, ?, ?, ?)", [b2Id, "Artisanal Coffee & Brews", "coffee", 1]);
    const cc2 = await db.run("INSERT INTO cafe_categories (business_id, name, icon, display_order) VALUES (?, ?, ?, ?)", [b2Id, "Gourmet Brunch", "egg", 2]);
    const cc3 = await db.run("INSERT INTO cafe_categories (business_id, name, icon, display_order) VALUES (?, ?, ?, ?)", [b2Id, "Chef Entrées & Mains", "utensils", 3]);
    const cc4 = await db.run("INSERT INTO cafe_categories (business_id, name, icon, display_order) VALUES (?, ?, ?, ?)", [b2Id, "Woodfired Pizzas", "pizza", 4]);
    const cc5 = await db.run("INSERT INTO cafe_categories (business_id, name, icon, display_order) VALUES (?, ?, ?, ?)", [b2Id, "Handcrafted Desserts", "cake", 5]);

    // Dishes with verified high quality food photography
    const cd1 = await db.run(
      `INSERT INTO cafe_dishes (business_id, category_id, name, description, price, is_veg, is_available, image_url, prep_time_mins, calories, addons_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        b2Id,
        cc1.insertId,
        "Single-Origin Spanish Cortado & Cinnamon Crunch",
        "Double ristretto pulled through washed Colombian beans, micro-textured whole milk, dusted with Ceylon bark.",
        240,
        1,
        1,
        "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80",
        6,
        120,
        JSON.stringify(["Oat Milk (+₹40)", "Double Shot (+₹60)", "Vanilla Bean Syrup (+₹30)"]),
      ]
    );

    const cd2 = await db.run(
      `INSERT INTO cafe_dishes (business_id, category_id, name, description, price, is_veg, is_available, image_url, prep_time_mins, calories, addons_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        b2Id,
        cc2.insertId,
        "Avocado Tartine with Soft Poached Free-Range Eggs",
        "Toasted 48-hour sourdough, smashed Hass avocado, Persian feta, pomegranate arils, and organic microgreens.",
        420,
        0,
        1,
        "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80",
        12,
        380,
        JSON.stringify(["Smoked Salmon (+₹120)", "Extra Poached Egg (+₹50)", "Gluten-Free Bread (+₹40)"]),
      ]
    );

    const cd3 = await db.run(
      `INSERT INTO cafe_dishes (business_id, category_id, name, description, price, is_veg, is_available, image_url, prep_time_mins, calories, addons_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        b2Id,
        cc3.insertId,
        "Wild Forest Truffle Mushroom Risotto",
        "Acquerello carnaroli rice simmered in golden vegetable broth, glazed with black truffle butter, and aged Parmigiano Reggiano.",
        580,
        1,
        1,
        "https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?auto=format&fit=crop&w=600&q=80",
        18,
        520,
        JSON.stringify(["Shaved Fresh Truffle (+₹180)", "Porcini Dust (+₹60)"]),
      ]
    );

    const cd4 = await db.run(
      `INSERT INTO cafe_dishes (business_id, category_id, name, description, price, is_veg, is_available, image_url, prep_time_mins, calories, addons_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        b2Id,
        cc4.insertId,
        "Burrata di Bufala & San Marzano Woodfired Pizza",
        "Slow-fermented Neapolitan crust, crushed San Marzano tomato sauce, fresh buffalo burrata, and garden basil.",
        650,
        1,
        1,
        "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80",
        15,
        680,
        JSON.stringify(["Spicy Hot Honey (+₹50)", "Extra Burrata (+₹120)", "Kalamata Olives (+₹40)"]),
      ]
    );

    const cd5 = await db.run(
      `INSERT INTO cafe_dishes (business_id, category_id, name, description, price, is_veg, is_available, image_url, prep_time_mins, calories, addons_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        b2Id,
        cc5.insertId,
        "Valrhona Molten Dark Chocolate Fondant",
        "70% single origin cacao cake with flowing lava core, paired with hand-churned Tahitian vanilla bean gelato.",
        380,
        1,
        1,
        "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80",
        14,
        460,
        JSON.stringify(["Extra Gelato Scoop (+₹80)", "Wild Raspberry Coulis (+₹40)"]),
      ]
    );

    // Cafe Tables
    for (let i = 1; i <= 8; i++) {
      const cap = i <= 2 ? 2 : i <= 6 ? 4 : 8;
      const status = i === 2 || i === 4 ? "occupied" : i === 7 ? "reserved" : "available";
      await db.run(
        `INSERT INTO cafe_tables (business_id, table_number, capacity, status, qr_token)
         VALUES (?, ?, ?, ?, ?)`,
        [b2Id, `T-${i < 10 ? "0" + i : i}`, cap, status, `qr_table_${b2Id}_${i}`]
      );
    }

    // Active Live Kitchen Orders
    await db.run(
      `INSERT INTO cafe_orders (business_id, table_number, order_type, customer_name, customer_phone, items_json, subtotal, tax, total, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        b2Id,
        "T-02",
        "dine_in",
        "Karan Oberoi",
        "+91 98200 99881",
        JSON.stringify([
          { name: "Burrata di Bufala & San Marzano Woodfired Pizza", qty: 1, price: 650 },
          { name: "Single-Origin Spanish Cortado", qty: 2, price: 240 },
        ]),
        1130,
        56.5,
        1186.5,
        "preparing",
        "Less spicy on the sauce.",
      ]
    );

    await db.run(
      `INSERT INTO cafe_orders (business_id, table_number, order_type, customer_name, customer_phone, items_json, subtotal, tax, total, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        b2Id,
        "T-04",
        "dine_in",
        "Rhea Sen",
        "+91 97110 55443",
        JSON.stringify([
          { name: "Wild Forest Truffle Mushroom Risotto", qty: 1, price: 580 },
          { name: "Valrhona Molten Dark Chocolate Fondant", qty: 1, price: 380 },
        ]),
        960,
        48.0,
        1008.0,
        "ready",
        "Serve dessert after main course.",
      ]
    );

    // Cafe Reservations
    await db.run(
      `INSERT INTO cafe_reservations (business_id, customer_name, customer_phone, customer_email, party_size, reservation_date, reservation_time, table_number, status, special_requests)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        b2Id,
        "Dr. Arvind Krishnan",
        "+91 99401 22889",
        "arvind.k@apollo.org",
        4,
        todayStr,
        "19:30",
        "T-07",
        "confirmed",
        "Anniversary dinner, requested quiet corner table.",
      ]
    );

    // ==========================================
    // AGENCY LEADS & INBOUND (Zynthor IT & Global)
    // ==========================================
    const leads = [
      {
        bId: b3Id,
        name: "Rohit Deshmukh",
        email: "rohit@fintechzen.io",
        phone: "+91 98450 12345",
        service: "Custom Web Application",
        budget: "₹25,000+",
        source: "Inbound Quote Request",
        status: "new",
        notes: "Needs multi-tenant billing microservice with Razorpay & Stripe integration.",
      },
      {
        bId: b3Id,
        name: "Sunita Roy",
        email: "sunita@novoretail.com",
        phone: "+91 98111 65432",
        service: "Standard Business Website",
        budget: "₹5,000 - ₹10,000",
        source: "Website Contact Form",
        status: "contacted",
        notes: "Called on 2nd Nov. Sent wireframes and design catalogue.",
      },
      {
        bId: b3Id,
        name: "Abhishek Bannerjee",
        email: "abhishek@hyperlogistics.in",
        phone: "+91 99201 88776",
        service: "Power BI Dashboard",
        budget: "₹10,000 - ₹25,000",
        source: "Referral Partner",
        status: "qualified",
        notes: "Verified real database access. Meeting scheduled for live PowerBI demo.",
      },
      {
        bId: b3Id,
        name: "Kavita Nair",
        email: "kavita@greengrocer.store",
        phone: "+91 97334 11223",
        service: "Basic Business Website",
        budget: "₹3,000 - ₹5,000",
        source: "Direct Organic Search",
        status: "converted",
        notes: "Paid deposit of ₹2,500. Development in progress.",
      },
    ];

    for (const l of leads) {
      await db.run(
        `INSERT INTO leads (business_id, name, email, phone, service, budget, source, status, notes, last_contacted_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [l.bId, l.name, l.email, l.phone, l.service, l.budget, l.source, l.status, l.notes, l.status !== "new" ? todayStr : null]
      );
    }

    // Customers
    await db.run(
      `INSERT INTO customers (business_id, name, email, phone, notes, total_spend, visit_count, last_visit)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [b1Id, "Ananya Singhania", "ananya.s@gmail.com", "+91 99112 33445", "Loyal client since 2024. Loves balayage & organic serums.", 18500, 4, todayStr]
    );
    await db.run(
      `INSERT INTO customers (business_id, name, email, phone, notes, total_spend, visit_count, last_visit)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [b2Id, "Karan Oberoi", "karan.o@gmail.com", "+91 98200 99881", "Regular Sunday brunch guest.", 8400, 7, todayStr]
    );
    await db.run(
      `INSERT INTO customers (business_id, name, email, phone, notes, total_spend, visit_count, last_visit)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [b3Id, "Kavita Nair", "kavita@greengrocer.store", "+91 97334 11223", "Converted from inbound lead. Ongoing retainer client.", 7500, 1, todayStr]
    );

    // Notifications
    await db.run(
      `INSERT INTO notifications (business_id, title, message, type, is_read, link)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [b1Id, "New Online Booking", "Meera Kapoor requested HydraFacial Elite for 16:00 today.", "booking", 0, "/app/salon"]
    );
    await db.run(
      `INSERT INTO notifications (business_id, title, message, type, is_read, link)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [b2Id, "Table 2 Order Placed", "Burrata Pizza & Cortados sent to Kitchen Display.", "order", 0, "/app/cafe"]
    );
    await db.run(
      `INSERT INTO notifications (business_id, title, message, type, is_read, link)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [b3Id, "High-Value Inbound Lead", "Rohit Deshmukh submitted ₹25,000+ Custom Web App quote.", "lead", 0, "/app/leads"]
    );

    // Activity Logs
    await db.run(
      `INSERT INTO activity_logs (business_id, user_id, user_name, action, entity_type, entity_id, details)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [b1Id, 1, "Elena Rostova", "Confirmed Appointment", "appointment", 1, "Confirmed Signature Balayage for Ananya Singhania"]
    );
    await db.run(
      `INSERT INTO activity_logs (business_id, user_id, user_name, action, entity_type, entity_id, details)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [b2Id, 2, "Chef Arjun", "Updated Order Status", "order", 1, "Table T-02 moved to 'preparing'"]
    );
    await db.run(
      `INSERT INTO activity_logs (business_id, user_id, user_name, action, entity_type, entity_id, details)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [b3Id, 3, "Siddharth Rao", "Status Updated", "lead", 2, "Marked lead Sunita Roy as 'contacted'"]
    );

    // Automation Rules
    await db.run(
      `INSERT INTO automation_rules (business_id, name, trigger_event, is_enabled, actions_json, conditions_json)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        b1Id,
        "Instant Booking Confirmation & SMS Alert",
        "appointment_created",
        1,
        JSON.stringify(["send_customer_email", "notify_assigned_staff", "create_activity_log"]),
        JSON.stringify({ status: "confirmed" }),
      ]
    );

    await db.run(
      `INSERT INTO automation_rules (business_id, name, trigger_event, is_enabled, actions_json, conditions_json)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        b2Id,
        "Kitchen Ticket Auto-Routing",
        "order_created",
        1,
        JSON.stringify(["route_to_kitchen_kds", "update_table_status_occupied", "print_kitchen_chits"]),
        JSON.stringify({ order_type: "dine_in" }),
      ]
    );

    await db.run(
      `INSERT INTO automation_rules (business_id, name, trigger_event, is_enabled, actions_json, conditions_json)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        b3Id,
        "Lead SLA Notification & Auto-Responder",
        "lead_created",
        1,
        JSON.stringify(["send_executive_quote_brochure", "notify_sales_channel", "schedule_24h_followup"]),
        JSON.stringify({ source: "Inbound Quote Request" }),
      ]
    );

    // Automation Logs
    await db.run(
      `INSERT INTO automation_logs (business_id, rule_id, rule_name, trigger_event, status, payload_json)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        b1Id,
        1,
        "Instant Booking Confirmation & SMS Alert",
        "appointment_created",
        "success",
        JSON.stringify({ customer: "Ananya Singhania", service: "Signature French Balayage", staff: "Elena Rostova" }),
      ]
    );

    console.log("[Seed] Initial data successfully seeded for all 3 business verticals.");
  } catch (err) {
    console.error("[Seed] Error during seeding:", err);
  }
}

module.exports = { seedData, hashPassword };
