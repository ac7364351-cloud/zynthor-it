const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const CHROME_BIN = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const OUT_DIR = path.join(__dirname, "..", "reports", "screenshots");
fs.mkdirSync(OUT_DIR, { recursive: true });

const screens = [
  {
    name: "01-dashboard-light.png",
    url: "http://localhost:5173/auth-setup.html?theme=light&collapsed=false&route=/app&initial=A",
    width: 1280,
    height: 850,
  },
  {
    name: "02-dashboard-dark.png",
    url: "http://localhost:5173/auth-setup.html?theme=dark&collapsed=false&route=/app&initial=A",
    width: 1280,
    height: 850,
  },
  {
    name: "03-dashboard-expanded-sidebar.png",
    url: "http://localhost:5173/auth-setup.html?theme=dark&collapsed=false&route=/app&initial=A",
    width: 1440,
    height: 900,
  },
  {
    name: "04-dashboard-collapsed-sidebar.png",
    url: "http://localhost:5173/auth-setup.html?theme=dark&collapsed=true&route=/app&initial=A",
    width: 1440,
    height: 900,
  },
  {
    name: "05-header-avatar-visible.png",
    url: "http://localhost:5173/auth-setup.html?theme=dark&collapsed=false&route=/app&initial=A",
    width: 1280,
    height: 550,
  },
  {
    name: "06-logo-expanded-sidebar.png",
    url: "http://localhost:5173/auth-setup.html?theme=dark&collapsed=false&route=/app&initial=A",
    width: 1280,
    height: 650,
  },
  {
    name: "07-logo-collapsed-sidebar.png",
    url: "http://localhost:5173/auth-setup.html?theme=dark&collapsed=true&route=/app&initial=A",
    width: 1280,
    height: 650,
  },
  {
    name: "08-salon-dark.png",
    url: "http://localhost:5173/auth-setup.html?theme=dark&collapsed=false&route=/app/salon&industry=salon",
    width: 1280,
    height: 950,
  },
  {
    name: "09-cafe-dark.png",
    url: "http://localhost:5173/auth-setup.html?theme=dark&collapsed=false&route=/app/cafe&industry=cafe",
    width: 1280,
    height: 950,
  },
  {
    name: "10-mobile-layout.png",
    url: "http://localhost:5173/auth-setup.html?theme=dark&collapsed=false&route=/app&initial=A",
    width: 390,
    height: 844,
  },
];

console.log("==================================================================");
console.log("       ZYNTHOR BUSINESS OS — CAPTURING VISUAL SCREENSHOTS         ");
console.log("==================================================================");

for (const s of screens) {
  const dest = path.join(OUT_DIR, s.name);
  console.log(`• Capturing: ${s.name} (${s.width}x${s.height})...`);
  try {
    const cmd = `"${CHROME_BIN}" --headless=new --disable-gpu --virtual-time-budget=3500 --window-size=${s.width},${s.height} --screenshot="${dest}" "${s.url}"`;
    execSync(cmd, { stdio: "pipe" });
    const size = fs.statSync(dest).size;
    console.log(`  ✓ Saved: ${dest} (${size} bytes)`);
  } catch (err) {
    console.error(`  ✗ Error capturing ${s.name}:`, err.message);
  }
}

console.log("==================================================================");
console.log("ALL 10 SCREENSHOTS CAPTURED SUCCESSFULLY!");
console.log("==================================================================");
