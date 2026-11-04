const { spawn, execSync } = require("child_process");
const http = require("http");
const fs = require("fs");

const CHROME_BIN = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9225;

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on("error", reject);
  });
}

// Simple raw WebSocket client for CDP
const crypto = require("crypto");
const net = require("net");
const { URL } = require("url");

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = new URL(wsUrl);
    this.id = 1;
    this.callbacks = new Map();
  }

  async connect() {
    return new Promise((resolve, reject) => {
      const key = crypto.randomBytes(16).toString("base64");
      this.socket = net.connect(this.wsUrl.port, this.wsUrl.hostname, () => {
        const req = [
          `GET ${this.wsUrl.pathname} HTTP/1.1`,
          `Host: ${this.wsUrl.hostname}:${this.wsUrl.port}`,
          "Upgrade: websocket",
          "Connection: Upgrade",
          `Sec-WebSocket-Key: ${key}`,
          "Sec-WebSocket-Version: 13",
          "\r\n",
        ].join("\r\n");
        this.socket.write(req);
      });

      this.socket.once("data", (data) => {
        const header = data.toString();
        if (header.includes("101")) {
          this.setupDataHandler();
          resolve();
        } else {
          reject(new Error("WebSocket handshake failed: " + header));
        }
      });
    });
  }

  setupDataHandler() {
    let buffer = Buffer.alloc(0);
    this.socket.on("data", (chunk) => {
      buffer = Buffer.concat([buffer, chunk]);
      while (buffer.length >= 2) {
        const firstByte = buffer[0];
        const secondByte = buffer[1];
        const isMasked = (secondByte & 0x80) !== 0;
        let payloadLen = secondByte & 0x7f;
        let offset = 2;

        if (payloadLen === 126) {
          if (buffer.length < 4) break;
          payloadLen = buffer.readUInt16BE(2);
          offset = 4;
        } else if (payloadLen === 127) {
          if (buffer.length < 10) break;
          payloadLen = Number(buffer.readBigUInt64BE(2));
          offset = 10;
        }

        let mask = null;
        if (isMasked) {
          if (buffer.length < offset + 4) break;
          mask = buffer.slice(offset, offset + 4);
          offset += 4;
        }

        if (buffer.length < offset + payloadLen) break;

        const payload = buffer.slice(offset, offset + payloadLen);
        buffer = buffer.slice(offset + payloadLen);

        if (isMasked) {
          for (let i = 0; i < payload.length; i++) {
            payload[i] ^= mask[i % 4];
          }
        }

        const msgStr = payload.toString("utf8");
        try {
          const msg = JSON.parse(msgStr);
          if (msg.id && this.callbacks.has(msg.id)) {
            const cb = this.callbacks.get(msg.id);
            this.callbacks.delete(msg.id);
            if (msg.error) cb.reject(new Error(msg.error.message));
            else cb.resolve(msg.result);
          }
        } catch {
          // ignore
        }
      }
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.id++;
      this.callbacks.set(id, { resolve, reject });
      const payload = Buffer.from(JSON.stringify({ id, method, params }));
      
      let header;
      if (payload.length < 126) {
        header = Buffer.from([0x81, 0x80 | payload.length]);
      } else if (payload.length <= 65535) {
        header = Buffer.alloc(4);
        header[0] = 0x81;
        header[1] = 0x80 | 126;
        header.writeUInt16BE(payload.length, 2);
      } else {
        header = Buffer.alloc(10);
        header[0] = 0x81;
        header[1] = 0x80 | 127;
        header.writeBigUInt64BE(BigInt(payload.length), 2);
      }

      const mask = crypto.randomBytes(4);
      const maskedPayload = Buffer.alloc(payload.length);
      for (let i = 0; i < payload.length; i++) {
        maskedPayload[i] = payload[i] ^ mask[i % 4];
      }

      this.socket.write(Buffer.concat([header, mask, maskedPayload]));
    });
  }

  close() {
    if (this.socket) this.socket.destroy();
  }
}

async function run() {
  console.log("Launching Headless Chrome on port " + PORT + "...");
  const chrome = spawn(CHROME_BIN, [
    "--headless=new",
    "--disable-gpu",
    `--remote-debugging-port=${PORT}`,
    "--user-data-dir=/tmp/chrome-test-dir",
    "--no-first-run",
    "--no-default-browser-check",
    "about:blank",
  ]);

  await sleep(2500);

  try {
    const list = await getJson(`http://localhost:${PORT}/json/list`);
    const page = list.find((t) => t.type === "page") || list[0];
    const cdp = new CDPClient(page.webSocketDebuggerUrl);
    await cdp.connect();
    console.log("Connected to Chrome via CDP.");

    await cdp.send("Page.enable");
    await cdp.send("Runtime.enable");

    const tests = [
      { name: "Maximized 1920x1080 (Expanded Sidebar)", w: 1920, h: 1080, collapsed: false },
      { name: "Maximized 1920x1080 (Collapsed Sidebar)", w: 1920, h: 1080, collapsed: true },
      { name: "Desktop 1440x900 (Expanded Sidebar)", w: 1440, h: 900, collapsed: false },
      { name: "Desktop 1440x900 (Collapsed Sidebar)", w: 1440, h: 900, collapsed: true },
      { name: "Laptop 1280x800 (Expanded Sidebar)", w: 1280, h: 800, collapsed: false },
      { name: "Laptop 1280x800 (Collapsed Sidebar)", w: 1280, h: 800, collapsed: true },
      { name: "Small Screen 1024x768 (Expanded Sidebar)", w: 1024, h: 768, collapsed: false },
      { name: "Small Screen 1024x768 (Collapsed Sidebar)", w: 1024, h: 768, collapsed: true },
      { name: "Mobile 390x844", w: 390, h: 844, collapsed: false },
    ];

    console.log("\n==================================================================");
    console.log("         MATHEMATICAL AVATAR & LAYOUT GEOMETRY AUDIT              ");
    console.log("==================================================================");

    let allPassed = true;

    for (const t of tests) {
      await cdp.send("Emulation.setDeviceMetricsOverride", {
        width: t.w,
        height: t.h,
        deviceScaleFactor: 1,
        mobile: t.w < 600,
      });

      const url = `http://localhost:5173/auth-setup.html?theme=dark&collapsed=${t.collapsed}&route=/app&initial=A`;
      await cdp.send("Page.navigate", { url });
      await sleep(1500);

      const evalRes = await cdp.send("Runtime.evaluate", {
        expression: `(function() {
          const winW = window.innerWidth;
          const winH = window.innerHeight;
          const docScrollW = document.documentElement.scrollWidth;
          const bodyScrollW = document.body.scrollWidth;

          // Header and Header Avatar
          const header = document.querySelector('header');
          const headerRect = header ? header.getBoundingClientRect() : null;
          const headerAvatar = header ? header.querySelector('button div.rounded-full') : null;
          const headerAvatarRect = headerAvatar ? headerAvatar.getBoundingClientRect() : null;

          // Sidebar and Sidebar Avatar
          const sidebar = document.querySelector('aside');
          const sidebarRect = sidebar ? sidebar.getBoundingClientRect() : null;
          const sidebarProfile = sidebar ? sidebar.querySelector('div.p-3.border-t') : null;
          const sidebarAvatar = sidebarProfile ? sidebarProfile.querySelector('div.rounded-full') : null;
          const sidebarAvatarRect = sidebarAvatar ? sidebarAvatar.getBoundingClientRect() : null;

          // Logo
          const logoSvg = document.querySelector('svg[aria-label="Zynthor Logo Emblem"]');
          const logoRect = logoSvg ? logoSvg.getBoundingClientRect() : null;

          // Theme Tokens
          const computedStyle = getComputedStyle(document.documentElement);
          const bgMain = computedStyle.getPropertyValue('--bg-main').trim();
          const bgCard = computedStyle.getPropertyValue('--bg-card').trim();
          const accent = computedStyle.getPropertyValue('--accent').trim();

          return {
            winW,
            winH,
            docScrollW,
            bodyScrollW,
            hasHorizontalOverflow: docScrollW > winW || bodyScrollW > winW,
            header: headerRect ? {
              left: Math.round(headerRect.left),
              right: Math.round(headerRect.right),
              width: Math.round(headerRect.width),
              height: Math.round(headerRect.height),
            } : null,
            headerAvatar: headerAvatarRect ? {
              left: Math.round(headerAvatarRect.left),
              right: Math.round(headerAvatarRect.right),
              width: Math.round(headerAvatarRect.width),
              height: Math.round(headerAvatarRect.height),
              isFullyInsideViewport: headerAvatarRect.right <= winW && headerAvatarRect.left >= 0,
              distanceFromRightEdge: Math.round(winW - headerAvatarRect.right),
            } : null,
            sidebarAvatar: sidebarAvatarRect ? {
              left: Math.round(sidebarAvatarRect.left),
              right: Math.round(sidebarAvatarRect.right),
              width: Math.round(sidebarAvatarRect.width),
            } : null,
            sidebar: sidebarRect ? {
              width: Math.round(sidebarRect.width),
              visible: sidebarRect.width > 0,
            } : null,
            hasSidebarProfile: !!sidebarProfile,
            logo: logoRect ? {
              width: Math.round(logoRect.width),
              height: Math.round(logoRect.height),
            } : null,
            themeTokens: {
              bgMain,
              bgCard,
              accent,
            }
          };
        })()`,
        returnByValue: true,
      });

      const res = evalRes.result.value;
      const hAvatar = res.headerAvatar;
      const avatarOk = hAvatar && hAvatar.isFullyInsideViewport && hAvatar.distanceFromRightEdge >= 0;
      const overflowOk = !res.hasHorizontalOverflow;
      const pass = avatarOk && overflowOk;

      if (!pass) allPassed = false;

      console.log(`\n• [TEST] ${t.name}:`);
      console.log(`  - Viewport: ${res.winW} x ${res.winH}`);
      console.log(`  - Horizontal Overflow: ${res.hasHorizontalOverflow ? "FAIL (scrollW: " + res.docScrollW + ")" : "PASS (0px overflow)"}`);
      if (hAvatar) {
        console.log(`  - Header Avatar "A" Box: [${hAvatar.left}px .. ${hAvatar.right}px], W: ${hAvatar.width}px, H: ${hAvatar.height}px`);
        console.log(`  - Distance from Right Viewport Edge: ${hAvatar.distanceFromRightEdge}px (Inside screen: ${hAvatar.isFullyInsideViewport ? "YES" : "NO - CLIPPED!"})`);
      } else {
        console.log(`  - Header Avatar "A": NOT FOUND!`);
      }
      if (res.header) {
        console.log(`  - Header: Left ${res.header.left}px, Right ${res.header.right}px, Width ${res.header.width}px`);
      }
      if (res.sidebar) {
        console.log(`  - Sidebar Width: ${res.sidebar.width}px (Profile Section: ${res.hasSidebarProfile ? "YES" : "NO"})`);
      }
      console.log(`  - Result: ${pass ? "✓ 100% PASSED" : "✗ FAILED"}`);
    }

    console.log("\n==================================================================");
    console.log(`AUDIT COMPLETE: ${allPassed ? "ALL SCENARIOS PASSED WITH ZERO CLIPPING!" : "SOME TESTS FAILED!"}`);
    console.log("==================================================================");

    cdp.close();
  } catch (err) {
    console.error("CDP Test Error:", err);
  } finally {
    chrome.kill();
  }
}

run();
