# QuickDrop Wiki - Copy Paste Content

Use this file to manually add wiki pages to GitHub. Copy each section below and create a new wiki page with the corresponding name.

---

## PAGE 1: Home

# Home

Welcome to the QuickDrop Wiki! 👋

QuickDrop is a **fast, secure, peer-to-peer file and text sharing application**. This wiki is your comprehensive guide to understanding, using, and contributing to the project.

## 📚 Wiki Navigation

### For Users
- **Getting Started** — How to use QuickDrop to send and receive files
- **FAQ** — Answers to common questions
- **Troubleshooting** — Solutions to common issues

### For Developers
- **How WebRTC Works** — Understanding the P2P technology
- **Architecture Overview** — System design and components
- **Security Deep Dive** — Technical security details

---

## 🚀 Quick Start

1. **Open** [quickdrop-share.adheesharavindu001.workers.dev](https://quickdrop-share.adheesharavindu001.workers.dev)
2. **Choose**: Send or Receive
3. **Share**: QR code or room ID
4. **Transfer**: Automatic once connected

**No setup. No registration. Just share.**

---

## ✨ Key Features

- ✅ **P2P Transfer** — Direct peer-to-peer, no servers handling your files
- ✅ **No Size Limits** — Share files of any size
- ✅ **No Cloud** — Data stays on your device
- ✅ **Private** — End-to-end encrypted
- ✅ **Simple** — QR code or room ID sharing
- ✅ **Fast** — Optimized WebRTC connections

---

## 📰 Blog Guides

QuickDrop includes a set of browser-sharing guides you can read from the blog page.

- [Blog home](https://quickdrops.link/blog)
- [Snapdrop alternative](https://quickdrops.link/blog/snapdrop-alternative)
- [AirDrop for Windows](https://quickdrops.link/blog/airdrop-for-windows)
- [Send large files online for free](https://quickdrops.link/blog/send-large-files-online-free)
- [File sharing without login](https://quickdrops.link/blog/file-sharing-without-login)
- [Send files without internet](https://quickdrops.link/blog/send-files-without-internet)
- [QR code file transfer](https://quickdrops.link/blog/qr-code-file-transfer)

---

## 🤝 Join the Community

- **Questions?** Start a [Discussion](https://github.com/AdheeshaRavindu/QuickDrop/discussions)
- **Found a bug?** Open an [Issue](https://github.com/AdheeshaRavindu/QuickDrop/issues)
- **Want to help?** See Contributing Guide

---

## 📄 Important Documents

- [README.md](https://github.com/AdheeshaRavindu/QuickDrop/blob/main/README.md) — Project overview
- [CONTRIBUTING.md](https://github.com/AdheeshaRavindu/QuickDrop/blob/main/CONTRIBUTING.md) — Contribution guidelines
- [SECURITY.md](https://github.com/AdheeshaRavindu/QuickDrop/blob/main/SECURITY.md) — Security policy

---

## 🎯 Project Status

- ✅ Core P2P functionality complete
- ✅ Security hardened
- ✅ Cross-browser tested
- 🚀 Ready for contributions

---

**Let's make file sharing fast, private, and simple.** 🚀

---

## PAGE 2: Getting-Started

# Getting Started

Let's get you sharing files with QuickDrop in under 5 minutes! 🚀

## 📱 Before You Start

QuickDrop works on **any device with a modern web browser**:
- ✅ Chrome/Chromium
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Mobile browsers

**All you need: a stable internet connection.**

---

## 🎯 Sending a File

### Step 1: Open QuickDrop
Go to: **[quickdrop-share.adheesharavindu001.workers.dev](https://quickdrop-share.adheesharavindu001.workers.dev)**

### Step 2: Choose "Send"
Click the **"Send"** button

### Step 3: Select Your File
Click or drag-drop a file. **No size limit.**

### Step 4: Share the QR Code
- **Scan** with receiver's camera app, or
- **Copy** room ID manually

### Step 5: Wait for Connection
Transfer starts automatically once receiver joins.

✅ **Done! File sent securely.**

---

## 📥 Receiving a File

### Step 1: Open QuickDrop
Go to: **[quickdrop-share.adheesharavindu001.workers.dev](https://quickdrop-share.adheesharavindu001.workers.dev)**

### Step 2: Choose "Receive"

### Step 3: Join the Room
**Option A:** Scan QR code  
**Option B:** Enter room ID manually

### Step 4: Download
Click **"Download"** when transfer completes

✅ **File downloaded!**

---

## 💬 Sending Text

1. Click **"Send"** → **"Text"**
2. Type or paste text
3. Share QR code or room ID
4. Receiver clicks **"Receive"** → scans/joins
5. Receiver clicks **"Copy"**

---

## 🔄 Start Another Transfer

After transfer completes:
- Click **"Start another transfer"**
- New room ID auto-generated
- No page reload needed

---

## ⚡ Pro Tips

- **Large Files?** Keep tab open, patience required
- **Slow Connection?** Try again, fallback paths available
- **Close Tab?** Transfer fails, keep open
- **Multiple Files?** Transfer one at a time
- **Privacy?** Share room IDs over encrypted channels only

---

## ❓ FAQ Quick Answers

**Q: Is it safe?**  
A: Yes. P2P only, no server storage, encrypted.

**Q: How long?**  
A: Seconds for small files, minutes for large.

**Q: Connection drops?**  
A: Restart transfer.

---

**Ready to share?** Go to [quickdrop-share.adheesharavindu001.workers.dev](https://quickdrop-share.adheesharavindu001.workers.dev) 🚀

---

## PAGE 3: FAQ

# FAQ

Frequently Asked Questions about QuickDrop.

---

## 🔒 Security & Privacy

### Q: Is my data safe?
**A:** Yes. P2P technology means:
- Data transfers directly between devices
- No server storage
- End-to-end encrypted
- QuickDrop can't access files

### Q: What data is collected?
**A:** We collect:
- ❌ No file contents
- ❌ No user data
- ✅ Minimal signaling data (auto-deleted)

### Q: How is transfer encrypted?
**A:** WebRTC's DTLS-SRTP encryption:
- Automatic
- Standards-based (IETF)
- Browser-native

### Q: Can someone intercept?
**A:** Extremely unlikely. Attacker would need to compromise device or network. **Keep room IDs private.**

---

## 🎯 How It Works

### Q: How does P2P work?
**A:**
1. Sender/receiver exchange connection info via server
2. Direct WebRTC connection established
3. File transferred peer-to-peer
4. Server no longer involved

### Q: What's a room ID?
**A:** Unique identifier for session:
- Only 2 people can connect
- Expires after 1 hour inactivity
- 64-char random (impossible to guess)

### Q: What's the QR code?
**A:** Encodes room ID. Scan with camera app = instant connection.

---

## 📊 Transfer

### Q: File size limit?
**A:** **No limit.** Only device memory/bandwidth.

### Q: How fast?
**A:**
- 1MB: <1 second
- 100MB: 1-5 minutes
- 1GB: 15-60 minutes

### Q: Pause/resume?
**A:** Not yet. On roadmap.

### Q: Connection drops?
**A:** Transfer fails. Restart needed.

### Q: Multiple files?
**A:** One at a time. Click "Start another transfer" after each.

---

## 🌐 Connectivity

### Q: Why can't connect?
**A:**
- Check internet connection
- Firewall might block P2P
- Try disabling VPN
- Ensure WebRTC enabled (default)

### Q: Public WiFi?
**A:** Usually yes. Some block P2P.
- Try hotspot instead
- Ask WiFi provider

### Q: Do I need static IP?
**A:** No. Works with dynamic IPs.

---

## 🖥️ Browser & Device

### Q: Which browsers?
**A:** All modern:
- Chrome 20+
- Firefox 22+
- Safari 11+
- Edge 79+
- Mobile browsers

### Q: Older devices?
**A:** Need WebRTC support (last 5+ years ok).

### Q: Tablets work?
**A:** Yes, iPad and Android tablets work.

### Q: Offline?
**A:** No. Need internet to establish connection.

---

## 🤔 Other

### Q: Cost?
**A:** 100% free, forever.

### Q: Commercial use?
**A:** Yes. MIT licensed.

### Q: Who maintains?
**A:** Open source community.

### Q: Always free?
**A:** Code is MIT. Hosted version open-source, you can self-host.

---

**More questions?** Open [GitHub Discussion](https://github.com/AdheeshaRavindu/QuickDrop/discussions)

---

## PAGE 4: Troubleshooting

# Troubleshooting

Having issues? Here's how to fix them.

---

## 🔗 Connection Issues

### Can't Connect / "Waiting for connection" hangs

**Solutions:**

1. **Check Internet** — Try opening google.com on both devices
2. **Refresh and Retry** — Close tab, wait 5 sec, reopen
3. **Try Different Room ID** — Generate new transfer
4. **Check Browser Console** — Open DevTools (F12), look for errors
5. **Firewall/NAT** — Try different location (home vs office)
6. **Try Without VPN** — Some VPNs block P2P

### "Connection Lost" During Transfer

**Solutions:**

1. **Keep Tab Open** — Closing it terminates connection
2. **Prevent Sleep** — Disable auto-lock, keep screen on
3. **Stable Network** — Stay on same WiFi
4. **Restart** — Close both tabs, try again
5. **Check Storage** — Ensure enough device space

---

## 📱 Mobile Issues

### QR Code Won't Scan

**Solutions:**

1. **Clean Lens** — Wipe camera
2. **Better Lighting** — Good light, not backlit
3. **Steady Hands** — Hold still 2-3 seconds
4. **Different App** — Google Lens or try Android camera
5. **Manual Entry** — Copy room ID, paste manually

### File Won't Download

**Solutions:**

1. **Check Permissions** — Settings → Browser → Allow Downloads
2. **Check Storage** — Free up space
3. **Try Different Browser** — Safari → Chrome
4. **Check Files App** — May be in Downloads folder

---

## 🖥️ Desktop Issues

### Transfer Very Slow

**Solutions:**

1. **Check Speed** — Visit speedtest.net
2. **Optimize WiFi** — Move closer to router, use 5GHz
3. **Use Ethernet** — Wired faster than WiFi
4. **Close Apps** — Stop large downloads, pause syncs
5. **Try Local** — Same network faster

### Browser Crashes

**Solutions:**

1. **Check Memory** — Task Manager (Windows) / Activity Monitor (Mac)
2. **Update Browser** — Old versions crash more
3. **Clear Cache** — Ctrl+Shift+Delete
4. **Try Different Browser** — Chrome vs Firefox
5. **Restart Computer** — Free up memory

---

## 🚨 Error Messages

### "Payload too large"
**Cause:** Signal exceeded limit  
**Fix:** Report to [GitHub Issues](https://github.com/AdheeshaRavindu/QuickDrop/issues)

### "Invalid room ID"
**Cause:** Room ID has invalid characters  
**Fix:** Use alphanumeric + hyphen/underscore only

### "Room doesn't exist"
**Cause:** Room ID invalid or >1 hour old  
**Fix:** Generate fresh room ID, use within 1 hour

---

## 🆘 Still Stuck?

1. Check [status page](https://quickdrop-share.adheesharavindu001.workers.dev)
2. Search [GitHub Issues](https://github.com/AdheeshaRavindu/QuickDrop/issues)
3. Ask [GitHub Discussions](https://github.com/AdheeshaRavindu/QuickDrop/discussions)
4. Include: browser, OS, error message, console logs

---

## PAGE 5: How-WebRTC-Works

# How WebRTC Works

Technical explanation of WebRTC and P2P file transfer.

---

## 🎯 WebRTC Overview

**WebRTC** = Web Real-Time Communication

Enables **peer-to-peer** communication without server relay:

```
Traditional:  Device A → Server ← Device B
WebRTC:       Device A ←→ Device B (direct)
```

---

## 🔄 Connection Phases

### Phase 1: Signaling (Server Required)

Both peers exchange **SDP offer/answer** via server:

1. Sender creates SDP offer → sends to server
2. Server relays to receiver
3. Receiver creates SDP answer → sends back
4. Both now have connection info

Server only relays, doesn't process data.

### Phase 2: ICE Candidates

**ICE** = Ways to reach a device

Candidates prioritized:
1. **Local IP** (if same network) — Fastest
2. **Public IP** (STUN) — Most common
3. **Relay** (TURN) — Fallback, slower

### Phase 3: Connection Established

First successful ICE candidate = active connection.

**DTLS-SRTP encryption** handshake begins.

### Phase 4: Data Transfer

Once connected, data flows **peer-to-peer**:
- Server no longer involved
- Encrypted automatically
- File transfers at full speed

---

## 🔐 Encryption

**DTLS-SRTP** = Encrypted data channel

```
Unencrypted File
      ↓
[DTLS Encryption]
      ↓
Encrypted Data
      ↓
P2P Network
      ↓
[DTLS Decryption]
      ↓
Unencrypted File (at destination)
```

Browser handles automatically (no setup needed).

---

## 🌍 NAT & Firewalls

Your device behind **NAT** (Network Address Translation):
- Internal IP: `192.168.1.100`
- External IP: `203.0.113.45`

**STUN** discovers public IP (works in most cases).  
**TURN** relays if direct connection fails (backup).

---

## 🎯 QuickDrop Flow

```
1. Sender/Receiver open app
2. Generate room ID
3. Exchange SDP via WebSocket
4. Exchange ICE candidates
5. Direct P2P connection established
6. File transfer begins (server not involved)
7. Download completed
8. Connection closes, room deleted
```

---

## 📊 Bandwidth

**Signaling:** ~100KB (once per transfer)  
**Data Transfer:** 100% of available (P2P)

Server handles only small signaling packets.

---

## 📚 Further Reading

- [MDN WebRTC API](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)
- [RFC 5245 — ICE](https://tools.ietf.org/html/rfc5245)
- [W3C WebRTC 1.0](https://w3c.github.io/webrtc-pc/)

---

## PAGE 6: Architecture-Overview

# Architecture Overview

System design and component breakdown.

---

## 🏗️ High-Level Architecture

```
Browser (SPA)
    ↓ WebSocket
Worker
    ↓ Durable Object
RoomSignalingDO
    
[After handshake]
    
Device A ←→ Device B (P2P via WebRTC)
```

---

## 📦 Components

### Frontend (browser/index.html)

**Single-Page App:**
- HTML5 + CSS3 + Vanilla JavaScript
- No framework dependencies
- WebRTC connection management
- File chunking + transfer
- QR code generation

**State Management:**
- Room ID
- Peer connection
- Transfer progress
- File data

### Backend (Worker)

**Cloudflare Workers:**
- Serve frontend
- Apply security headers
- Validate inputs
- Route WebSocket to Durable Object

**Security:**
- Room ID validation (regex)
- Payload size limits (32KB)
- Signal type whitelist
- CSP headers

### Durable Objects (RoomSignalingDO)

**Global State Store:**
- Manage individual transfer sessions
- Max 2 clients per room
- Store SDP + ICE candidates
- Auto-cleanup after 1 hour inactivity
- Relay signals between peers

---

## 🔐 Security Model

**Core Principle:** Zero-trust P2P

- No storage (data never on server)
- No authentication (no user tracking)
- End-to-end encrypted (DTLS-SRTP)
- Input validated (room ID, signal types, payloads)
- Auto-cleanup (ephemeral state)

---

## 📊 Scalability

| Item | Limit |
|------|-------|
| Concurrent Transfers | Unlimited |
| File Size | Device memory only |
| Room Lifetime | 1 hour inactivity |
| Clients per Room | 2 max |

Each transfer = separate room (no bottleneck).

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5 + CSS3 + Vanilla JS |
| Backend | Cloudflare Workers |
| State | Durable Objects |
| Transport | WebRTC DataChannel |
| Signaling | WebSocket |
| Encryption | DTLS-SRTP (built-in) |

---

## 🚀 Why This Architecture?

✅ **P2P** — No server storage  
✅ **Scalable** — Each room independent  
✅ **Fast** — Edge compute + direct connections  
✅ **Secure** — Automatic encryption  
✅ **Simple** — Minimal dependencies  

---

## PAGE 7: Security-Deep-Dive

# Security Deep Dive

Technical security analysis.

---

## 🔒 Threat Model

| Threat | Mitigation |
|--------|-----------|
| MITM Attack | HTTPS + WSS + DTLS-SRTP |
| Eavesdropping | End-to-end encryption |
| Malformed Signals | Input validation + whitelist |
| DoS | Payload limits + rate limiting |
| Unauthorized Access | Room ID too large to brute-force |
| Clickjacking | X-Frame-Options: DENY |

---

## 🔐 Encryption

**Transport:** TLS 1.2/1.3 (HTTPS + WSS)  
**Data:** DTLS-SRTP (WebRTC standard)  
**Algorithm:** AES-128-CM + HMAC-SHA1  

All automatic, no configuration needed.

---

## 🛡️ HTTP Security Headers

```
Content-Security-Policy: strict allow-list
Strict-Transport-Security: 1 year + preload
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: disable camera, mic, etc.
```

---

## 📡 Input Validation

**Room ID:** `/^[A-Za-z0-9_-]{1,64}$/`  
**Signal Type:** offer | answer | ice-candidate (whitelist)  
**Payload Size:** Max 32KB  

Prevents injection, DoS, and malformed messages.

---

## 🔑 Room ID Security

**Statistical:** 62^64 possibilities ≈ impossible to guess  
**Duration:** <1 hour (auto-expires)  
**Generator:** `crypto.getRandomValues()` (secure random)

---

## 📊 Privacy

**Collected:**
- ❌ File contents
- ❌ User data
- ✅ Room ID (temporary, deleted)
- ✅ SDP (temporary, deleted)

**Deleted:** After transfer or 1 hour inactivity

---

## 🚨 Known Limitations

- **Endpoint Compromise** — If device hacked, encryption useless
- **NAT Binding Timeout** — Some routers disconnect after inactivity
- **TURN Relay Timing** — Can see data volume/timing (not contents)

---

## 🔍 Audit Checklist

✅ CSP headers  
✅ HSTS + preload  
✅ X-Frame-Options: DENY  
✅ Room ID validation  
✅ Payload size limits  
✅ Signal type whitelist  
✅ Input sanitization  
✅ No hardcoded credentials  
✅ HTTPS/WSS only  

---

## 🚨 Report Security Issues

See SECURITY.md for responsible disclosure.

---

END OF WIKI CONTENT

---

## Instructions:

1. Go to your GitHub repo's Wiki tab
2. Create a new page for each section (Home, Getting-Started, FAQ, Troubleshooting, How-WebRTC-Works, Architecture-Overview, Security-Deep-Dive)
3. Copy the markdown content for each page
4. Paste into the corresponding wiki page
5. Click Save

All 7 pages are ready to copy-paste! 📝
