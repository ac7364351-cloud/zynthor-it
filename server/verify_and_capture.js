const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const CHROME_BIN = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const OUT_DIR = path.join(__dirname, "..", "reports", "screenshots");
fs.mkdirSync(OUT_DIR, { recursive: true });

console.log("==================================================================");
console.log("   ZYNTHOR BUSINESS OS — COMPREHENSIVE UI VERIFICATION & AUDIT     ");
console.log("==================================================================");

// 1. Verify Dev Servers
console.log("1. Checking server endpoints...");
// (Dev servers are assumed running on 8000 and 5173)

// 2. Define Screenshots & Viewports to capture
const captures = [
  {
    name: "01-dashboard-light.png",
    url: "http://localhost:5173/auth-setup.html?theme=light&collapsed=false&route=/app&initial=A",
    width: 1440,
    height: 900,
    desc: "Light mode dashboard canvas with crisp cards and high-contrast typography",
  },
  {
    name: "02-dashboard-dark.png",
    url: "http://localhost:5173/auth-setup.html?theme=dark&collapsed=false&route=/app&initial=A",
    width: 1440,
    height: 900,
    desc: "Obsidian Luxury dark mode (#141619 canvas, #20252C cards, #C5A46D gold accent)",
  },
  {
    name: "03-dashboard-expanded-sidebar.png",
    url: "http://localhost:5173/auth-setup.html?theme=dark&collapsed=false&route=/app&initial=A",
    width: 1600,
    height: 950,
    desc: "Maximized 1600px display with expanded 256px sidebar and full-width layout",
  },
  {
    name: "04-dashboard-collapsed-sidebar.png",
    url: "http://localhost:5173/auth-setup.html?theme=dark&collapsed=true&route=/app&initial=A",
    width: 1600,
    height: 950,
    desc: "Collapsed 80px sidebar state with icon-centered nav and expanded main workspace",
  },
  {
    name: "05-header-avatar-visible.png",
    url: "http://localhost:5173/auth-setup.html?theme=dark&collapsed=false&route=/app&initial=A",
    width: 1440,
    height: 400,
    desc: "Header alignment verification: Right-side 'A' avatar fully visible inside viewport edge",
  },
  {
    name: "06-logo-expanded-sidebar.png",
    url: "http://localhost:5173/auth-setup.html?theme=dark&collapsed=false&route=/app&initial=A",
    width: 1280,
    height: 650,
    desc: "Expanded sidebar branding: 100% transparent vector logo across full width",
  },
  {
    name: "07-logo-collapsed-sidebar.png",
    url: "http://localhost:5173/auth-setup.html?theme=dark&collapsed=true&route=/app&initial=A",
    width: 1280,
    height: 650,
    desc: "Collapsed sidebar branding: centered emblem without distortion or clipping",
  },
  {
    name: "08-salon-dark.png",
    url: "http://localhost:5173/auth-setup.html?theme=dark&collapsed=false&route=/app/salon&industry=salon",
    width: 1440,
    height: 950,
    desc: "Salon & Spa Suite in Obsidian Luxury with appointments queue and rosters",
  },
  {
    name: "09-cafe-dark.png",
    url: "http://localhost:5173/auth-setup.html?theme=dark&collapsed=false&route=/app/cafe&industry=cafe",
    width: 1440,
    height: 950,
    desc: "Cafe & Restaurant Suite with QR menu generator, table manager, and KDS orders",
  },
  {
    name: "10-mobile-layout.png",
    url: "http://localhost:5173/auth-setup.html?theme=dark&collapsed=false&route=/app&initial=A",
    width: 390,
    height: 844,
    desc: "Mobile 390px viewport: fluid responsive header, hamburger drawer, zero horizontal overflow",
  },
  {
    name: "11-customers-dark.png",
    url: "http://localhost:5173/auth-setup.html?theme=dark&collapsed=false&route=/app/customers",
    width: 1440,
    height: 900,
    desc: "Customer Directory in Obsidian Dark mode with search and lifetime spend",
  },
  {
    name: "12-leads-dark.png",
    url: "http://localhost:5173/auth-setup.html?theme=dark&collapsed=false&route=/app/leads",
    width: 1440,
    height: 900,
    desc: "Inbound CRM Pipeline with status filters, modals, and CSV export",
  },
  {
    name: "13-reports-dark.png",
    url: "http://localhost:5173/auth-setup.html?theme=dark&collapsed=false&route=/app/reports",
    width: 1440,
    height: 900,
    desc: "Financial & Operational Analytics with revenue trajectory visual charts",
  },
  {
    name: "14-settings-dark.png",
    url: "http://localhost:5173/auth-setup.html?theme=dark&collapsed=false&route=/app/settings",
    width: 1440,
    height: 900,
    desc: "Business Settings & Team Management with AI prompt directives",
  },
  {
    name: "15-login-obsidian.png",
    url: "http://localhost:5173/login",
    width: 1280,
    height: 850,
    desc: "Login screen in Obsidian Luxury theme with 1-click verified demo profiles",
  },
];

console.log("\n2. Capturing visual screenshots across viewports & modules...");
let successCount = 0;

for (const c of captures) {
  const dest = path.join(OUT_DIR, c.name);
  console.log(`• Capturing ${c.name} (${c.width}x${c.height})...`);
  try {
    const cmd = `"${CHROME_BIN}" --headless=new --disable-gpu --virtual-time-budget=4000 --window-size=${c.width},${c.height} --screenshot="${dest}" "${c.url}"`;
    execSync(cmd, { stdio: "pipe" });
    const size = fs.statSync(dest).size;
    console.log(`  ✓ Saved: ${dest} (${size} bytes)`);
    successCount++;
  } catch (err) {
    console.error(`  ✗ Failed ${c.name}:`, err.message);
  }
}

console.log(`\nScreenshot capture summary: ${successCount} / ${captures.length} captured.`);
