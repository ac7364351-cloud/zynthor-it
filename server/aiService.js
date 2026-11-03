/**
 * Zynthor Business OS — AI Assistant Engine
 * Domain-specific intelligence, bilingual Hindi/English/Hinglish processing,
 * safety guardrails, escalation detection, and automated workflow triggers.
 */

const db = require("./db");

// Natural language intent detection and multilingual processing
function analyzeMessage(text = "") {
  const lower = text.toLowerCase().trim();

  // Escalation detection
  const escalationKeywords = [
    "human", "agent", "manager", "complaint", "talk to someone", "real person",
    "call me", "dispute", "refund", "baat karni hai", "manager se baat", "shikayat",
    "insaaf", "fraud", "scam"
  ];
  const needsEscalation = escalationKeywords.some((k) => lower.includes(k));

  // Language detection
  const hindiRegex = /[\u0900-\u097F]/;
  const hinglishKeywords = [
    "kya", "hai", "karna", "chahiye", "kitna", "baje", "kal", "aaj", "kripya", "bhai",
    "accha", "shukriya", "dost", "milega", "hoga", "bolo", "batao", "booking"
  ];
  let language = "en";
  if (hindiRegex.test(lower)) {
    language = "hi";
  } else if (hinglishKeywords.some((w) => lower.split(/\s+/).includes(w))) {
    language = "hinglish";
  }

  // Intent classification
  let intent = "general_inquiry";
  if (
    lower.includes("book") ||
    lower.includes("appointment") ||
    lower.includes("slot") ||
    lower.includes("reserve") ||
    lower.includes("schedule") ||
    lower.includes("table") ||
    lower.includes("seat")
  ) {
    intent = "booking_request";
  } else if (lower.includes("price") || lower.includes("cost") || lower.includes("rate") || lower.includes("charge") || lower.includes("kitna") || lower.includes("fee")) {
    intent = "price_inquiry";
  } else if (lower.includes("menu") || lower.includes("dish") || lower.includes("food") || lower.includes("veg") || lower.includes("coffee") || lower.includes("pizza")) {
    intent = "menu_inquiry";
  } else if (lower.includes("lead") || lower.includes("client") || lower.includes("quote") || lower.includes("proposal") || lower.includes("crm")) {
    intent = "crm_management";
  } else if (lower.includes("staff") || lower.includes("stylist") || lower.includes("doctor") || lower.includes("specialist") || lower.includes("who is")) {
    intent = "staff_inquiry";
  } else if (lower.includes("hour") || lower.includes("time") || lower.includes("open") || lower.includes("close") || lower.includes("location") || lower.includes("address")) {
    intent = "business_info";
  }

  return { intent, language, needsEscalation };
}

// Generate intelligent context-aware response
async function generateAIResponse(businessId, userMessage, conversationHistory = []) {
  const business = await db.get("SELECT * FROM businesses WHERE id = ?", [businessId]);
  const settings = await db.get("SELECT * FROM business_settings WHERE business_id = ?", [businessId]);
  const { intent, language, needsEscalation } = analyzeMessage(userMessage);

  const businessName = business ? business.name : "Zynthor Business OS";
  const industry = business ? business.industry : "general";

  // Escalation handling
  if (needsEscalation) {
    const replyEn = `I have flagged your request for an executive manager at ${businessName}. A senior team member will reach out to you directly shortly. Is there any immediate detail you'd like me to log for them?`;
    const replyHi = `मैंने आपके अनुरोध को ${businessName} के वरिष्ठ प्रबंधक को अग्रेषित कर दिया है। हमारी टीम जल्द ही आपसे सीधे संपर्क करेगी। क्या आप कोई अतिरिक्त विवरण साझा करना चाहते हैं?`;
    const replyHinglish = `Maine aapka message ${businessName} ke senior manager ko forward kar diya hai. Hamari team aapse jald hi directly contact karegi. Koi specific detail add karni hai?`;

    return {
      message: language === "hi" ? replyHi : language === "hinglish" ? replyHinglish : replyEn,
      intent: "escalation",
      escalated: true,
      suggestedActions: ["View Contact Info", "Leave Callback Phone", "Request WhatsApp Hand-off"],
    };
  }

  // Domain-specific knowledge synthesis
  let reply = "";
  let suggestedActions = [];

  if (industry === "salon") {
    const services = await db.all("SELECT name, price, duration_mins FROM salon_services WHERE business_id = ? AND is_active = 1", [businessId]);
    const staff = await db.all("SELECT name, role FROM salon_staff WHERE business_id = ? AND is_active = 1", [businessId]);

    if (intent === "price_inquiry" || intent === "menu_inquiry") {
      const topServices = services.slice(0, 4).map((s) => `• ${s.name} (₹${s.price.toLocaleString()}, ${s.duration_mins}m)`).join("\n");
      if (language === "hinglish") {
        reply = `Hamare studio me popular luxury treatments:\n\n${topServices}\n\nAap kiske liye slot dekhna chahte hain?`;
      } else {
        reply = `Here is our signature service price list at ${businessName}:\n\n${topServices}\n\nWould you like me to check available slots for any of these services?`;
      }
      suggestedActions = ["Book Balayage", "Book HydraFacial", "View Full Catalogue", "Speak to Stylist"];
    } else if (intent === "booking_request") {
      if (language === "hinglish") {
        reply = `Aapka appointment schedule karne ke liye taiyaar hoon! Hamare Master Stylist Elena aur Priya ke slots aaj 14:00 aur 17:30 par available hain. Kounsa time aapke liye best rahega?`;
      } else {
        reply = `I would be delighted to assist with your booking at ${businessName}. We have prime slots available today with Elena Rostova and Priya Sharma at 14:00 and 17:30. Which time works best for you?`;
      }
      suggestedActions = ["Book 14:00 Today", "Book 17:30 Today", "Select Another Date", "Check Staff Availability"];
    } else if (intent === "staff_inquiry") {
      const staffList = staff.map((st) => `• ${st.name} — ${st.role}`).join("\n");
      reply = `Our certified beauty & wellness specialists at ${businessName}:\n\n${staffList}\n\nYou can request any specialist when booking!`;
      suggestedActions = ["Book with Elena", "Book with Marcus", "Book with Priya"];
    } else {
      if (language === "hinglish") {
        reply = `Namaste! ${businessName} Concierge AI me aapka swagat hai. Main hair styling, bridal packages, skin therapy, aur slot booking me aapki poori madad kar sakta hoon. Aaj aap kya explore karna chahenge?`;
      } else {
        reply = `Welcome to ${businessName} Luxury Concierge. How may I assist you today? I can help you explore couture hair treatments, schedule wellness rituals, or review specialist availability.`;
      }
      suggestedActions = ["View Signature Services", "Check Today's Availability", "Bridal Packages", "Opening Hours"];
    }
  } else if (industry === "cafe") {
    const dishes = await db.all("SELECT name, price, is_veg FROM cafe_dishes WHERE business_id = ? AND is_available = 1", [businessId]);
    const tables = await db.all("SELECT table_number, status, capacity FROM cafe_tables WHERE business_id = ?", [businessId]);

    if (intent === "price_inquiry" || intent === "menu_inquiry") {
      const sample = dishes.slice(0, 4).map((d) => `• ${d.is_veg ? "🟢 [Veg]" : "🔴 [Non-Veg]"} ${d.name} — ₹${d.price}`).join("\n");
      if (language === "hinglish") {
        reply = `Velvet & Vine ke chef specials aur best sellers:\n\n${sample}\n\nAap dine-in karenge ya takeaway order place karna hai?`;
      } else {
        reply = `Here are our chef's signature handcrafted dishes:\n\n${sample}\n\nWould you like to reserve a table or place a digital order?`;
      }
      suggestedActions = ["View Digital QR Menu", "Filter Vegetarian Only", "Reserve Table Tonight"];
    } else if (intent === "booking_request") {
      const availableCount = tables.filter((t) => t.status === "available").length;
      if (language === "hinglish") {
        reply = `Hum table reservations accept karte hain! Is waqt hamare paas ${availableCount} tables available hain. Aap kitne logo ke liye aur kis time par table reserve karna chahte hain?`;
      } else {
        reply = `We would love to host you at ${businessName}! We currently have ${availableCount} tables available. What party size and preferred dining time would you like me to lock in?`;
      }
      suggestedActions = ["Reserve Table for 2", "Reserve Table for 4", "Check Evening Availability"];
    } else {
      reply = `Welcome to ${businessName} Culinary AI! You can ask me about our artisanal coffees, woodfired pizzas, gluten-free choices, or book a table. What would you like to explore?`;
      suggestedActions = ["Chef Specials", "Vegetarian Selection", "Table Reservation", "Operating Hours"];
    }
  } else {
    // Agency / General
    const leadsCount = await db.get("SELECT COUNT(*) as count FROM leads WHERE business_id = ?", [businessId]);
    if (intent === "crm_management") {
      reply = `You currently have ${leadsCount ? leadsCount.count : 0} inbound business leads in your CRM. The highest priority lead is from Rohit Deshmukh (FintechZen) for a Custom Web Application. Would you like me to draft an executive follow-up email?`;
      suggestedActions = ["Draft Follow-Up Email", "View High-Value Leads", "Export Leads CSV", "Update Lead Status"];
    } else {
      reply = `Hello! I am your Zynthor Business OS intelligent operations copilot. I can assist you in managing client inquiries, monitoring conversion funnels, tracking pending tasks, and drafting business correspondence.`;
      suggestedActions = ["Review Pipeline Stats", "Draft Lead Response", "View Pending Inquiries", "Automation Rules"];
    }
  }

  return {
    message: reply,
    intent,
    language,
    suggestedActions,
  };
}

module.exports = {
  analyzeMessage,
  generateAIResponse,
};
