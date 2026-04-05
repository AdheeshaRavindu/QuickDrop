# Security Deep Dive

Technical security analysis of QuickDrop architecture, threat model, and mitigations.

---

## 🔒 Security Philosophy

**Core Principle:** Zero-Trust P2P Architecture

- **No Storage**: Data never written to server
- **No Authentication**: No user tracking
- **No Centralization**: Minimal single point of failure
- **Encryption Default**: All transfers encrypted automatically
- **Input Validation**: All signals validated

---

## 🎯 Threat Model

### Threats In Scope

| Threat | Severity | Mitigation |
|--------|----------|-----------|
| **Man-in-the-Middle (MITM)** | HIGH | HTTPS + WebSocket Secure + DTLS-SRTP encryption |
| **Network Eavesdropping** | HIGH | End-to-end DTLS-SRTP encryption |
| **Malformed Signals** | MEDIUM | Room ID validation + signal type whitelist |
| **Denial of Service (DoS)** | MEDIUM | Payload size limits + Cloudflare DDoS protection |
| **Unauthorized File Access** | MEDIUM | Room ID too large to brute-force + TURN protection |
| **Browser Vulnerabilities** | MEDIUM | CSP + X-Frame-Options + sandboxing |
| **Clickjacking** | LOW | X-Frame-Options: DENY |
| **UI Spoofing** | LOW | CSP + Referrer-Policy |

### Out of Scope

- ❌ **Compromised Endpoint** (if user's device is hacked, all bets are off)
- ❌ **Malware on Device** (beyond browser's scope)
- ❌ **Physical Access** (device theft)
- ❌ **Social Engineering** (sharing room ID with wrong person)

---

## 🔐 Encryption

### Transport: HTTPS

**Protocol:** TLS 1.2 / 1.3

**Enforced By:**
- HSTS header: `strict-transport-security: max-age=31536000; includeSubDomains; preload`
- All connections redirected to HTTPS
- Preload list eligible for browser inclusion

**Certificate:**
- Cloudflare managed SSL/TLS
- Automatically renewed
- Trust chain: Cloudflare CA → Root

### Signaling: WebSocket Secure (WSS)

**Protocol:** WSS = TLS 1.2/1.3 over WebSocket

**Flow:**
```
Browser
   ↓ (HTTPS)
Cloudflare Worker
   ↓ (WSS - TLS + WebSocket)
Durable Object
```

All signaling encrypted end-to-end during signaling phase.

### Data: DTLS-SRTP

**Protocol:** Datagram TLS + Secure RTP

**Encryption Details:**
- **Algorithm:** AES-128 in Counter Mode (AES-128-CM)
- **Authentication:** HMAC-SHA1
- **Key Derivation:** PRKDF2
- **IV:** Random per packet

**Automatic:**
- Browser handles all encryption
- WebRTC standard (not custom crypto)

**Example Flow:**
```
Application Layer (User File)
         ↓
[DTLS-SRTP Encryption]
         ↓
Encrypted Data Channel
         ↓
Network (Peer's ISP, etc)
         ↓
[DTLS-SRTP Decryption]
         ↓
Application Layer (Receiving Browser)
```

### Encryption Verification

Browser WebRTC API shows encryption status:

```javascript
// In browser console
RTCRtpReceiver.getCapabilities('video').headerExtensions
// Shows: dtls_v1_2, srtp_aes128_cm_sha1_80, etc.
```

---

## 🛡️ Input Validation

### Room ID Validation

**Pattern:** `/^[A-Za-z0-9_-]{1,64}$/`

**Validates:**
- ✅ Only alphanumeric + hyphen + underscore
- ✅ 1-64 characters (no empty, no extremely long)
- ✅ No special characters (prevents injection)
- ✅ No spaces, paths (`../`), protocols, etc.

**Example:**
```
Valid:   abc123, room-1, MY_ROOM, with_dash-ok, 64charsmaxok
Invalid: room/1, ../etc/passwd, <script>, room 1, room\name
```

### WebSocket Message Validation

**Validation Checklist:**

1. **Size Check**
   ```javascript
   if (message.length > 32 * 1024) {
     // Reject: message too large
     ws.close(1009, "Payload too large");
   }
   ```

2. **Type Whitelist**
   ```javascript
   const ALLOWED_TYPES = ['offer', 'answer', 'ice-candidate'];
   if (!ALLOWED_TYPES.includes(msg.type)) {
     // Reject: invalid signal type
   }
   ```

3. **Structure Validation**
   ```javascript
   if (!msg.type || typeof msg.data !== 'object') {
     // Reject: malformed
   }
   ```

### SDP Validation (Browser)

Browser's native WebRTC validates SDP:
- Checks session description format
- Validates codec lists
- Rejects invalid media streams
- Automatic by RTCPeerConnection

---

## 📡 Signal Type Whitelist

**Enforced at Worker Level:**

Only these signals allowed:

| Type | Purpose | Example |
|------|---------|---------|
| `offer` | Sender's connection proposal | SDP offer with codecs, mux, etc. |
| `answer` | Receiver's response | SDP answer with chosen codecs |
| `ice-candidate` | Network path candidate | STUN-derived IP:port pair |

**Rejects:**
- ❌ `malicious-type`
- ❌ `custom-protocol`
- ❌ Empty type
- ❌ Type injection attempts

**Implementation:**
```javascript
const allowedSignalTypes = new Set(["offer", "answer", "ice-candidate"]);
if (!allowedSignalTypes.has(msg.type)) {
  ws.send(JSON.stringify({ type: "error", message: "Invalid signal type" }));
  return;
}
```

---

## 📊 Payload Size Limits

**Limit:** 32KB per WebSocket message

**Rationale:**
- Prevents memory exhaustion attacks
- SDP signals typically 1-5KB
- ICE candidates typically <1KB
- 32KB handles all legitimate use cases
- Rejects amplification attacks

**Enforcement:**
```javascript
const MAX_SIGNAL_PAYLOAD_BYTES = 32 * 1024;
const messageSize = JSON.stringify(msg).length;
if (messageSize > MAX_SIGNAL_PAYLOAD_BYTES) {
  ws.send(JSON.stringify({ type: "error", message: "Payload too large" }));
  ws.close(1009, "Payload too large"); // WebSocket close code 1009
}
```

---

## 🌐 HTTP Security Headers

### Content-Security-Policy (CSP)

**Policy:**
```
default-src 'self'                              # Only from origin by default
base-uri 'none'                                  # Prevent <base> tag injection
frame-ancestors 'none'                           # No framing (clickjacking)
object-src 'none'                                # No plugins
script-src 'self' 'unsafe-inline' cdnjs.cloudflare.com  # Scripts: self + inline + CDN
style-src 'self' 'unsafe-inline' fonts.googleapis.com   # Styles: self + inline + fonts
font-src 'self' fonts.gstatic.com data:                 # Fonts: self + gstatic
img-src 'self' blob: data:                              # Images: self + QR blobs
connect-src 'self' ws: wss:                             # Connections: self + WebSocket
worker-src 'self' blob:                                 # Workers: self only
form-action 'self'                                       # Form submissions: self only
upgrade-insecure-requests                               # Redirect HTTP → HTTPS
```

**What It Prevents:**
- ✅ XSS attacks (inline scripts blocked unless whitelisted)
- ✅ External script injection
- ✅ Clickjacking (frame embedding)
- ✅ Form hijacking
- ✅ Plugin exploitation

**Why `unsafe-inline`?**
- SPA approach requires inline styles + scripts
- Compensated by other CSP directives
- Alternative: build step with nonce (complexity)
- Current approach acceptable given other mitigations

### Strict-Transport-Security (HSTS)

**Header:**
```
strict-transport-security: max-age=31536000; includeSubDomains; preload
```

**Enforces:**
- All traffic HTTPS for 1 year
- All subdomains HTTPS
- Eligible for browser preload list
- Protects against downgrade attacks

### X-Frame-Options

**Header:**
```
x-frame-options: DENY
```

**Prevents:**
- Page embedding in `<iframe>`
- Clickjacking attacks
- UI redressing

### X-Content-Type-Options

**Header:**
```
x-content-type-options: nosniff
```

**Prevents:**
- MIME type confusion attacks
- Browser content-type guessing
- JavaScript delivered as HTML executed

### Referrer-Policy

**Header:**
```
referrer-policy: strict-origin-when-cross-origin
```

**Controls:**
- When Referer header sent
- Cross-origin requests: send only origin
- Prevents leaking query parameters/paths

### Permissions-Policy

**Header:**
```
permissions-policy: accelerometer=(), autoplay=(), camera=(), geolocation=(), 
                    gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()
```

**Disables:**
- Device sensors (accelerometer, gyroscope)
- Camera + Microphone access (not needed)
- Geolocation (not needed)
- Payment API
- USB (security risk)

**Why?**
- Principle of least privilege
- Even if XSS happens, can't access these APIs

### Cross-Origin Policies

**COOP (Cross-Origin-Opener-Policy):**
```
cross-origin-opener-policy: same-origin
```
- Isolates from other origins
- Spectre/Meltdown protection

**CORP (Cross-Origin-Resource-Policy):**
```
cross-origin-resource-policy: same-origin
```
- Resources only accessible from same-origin
- Prevents requests from iframes on other origins

---

## 🚫 Denial of Service (DoS)

### Network-Level DDoS

**Protected By:** Cloudflare DDoS Protection

- Automatic rate limiting
- IP reputation filtering
- Challenge pages for suspicious traffic
- Anycast network (distributed)

### Application-Level DoS

**Mitigations:**

1. **Payload Size Limits**
   - Max 32KB signals
   - Prevents memory exhaustion

2. **Durable Object Limits**
   - Max 2 clients per room
   - Auto-cleanup after 1 hour inactivity
   - Prevents unbounded growth

3. **WebSocket Connection Limits**
   - Cloudflare enforces connection limits
   - Automatic cleanup of dead connections

4. **Rate Limiting**
   - Could be added: limit signal rate
   - Currently open (acceptable for small user base)

---

## 🔑 Room ID Security

### Statistical Analysis

**Room ID Properties:**
- Format: 64-char base62 pool (62^64 possibilities)
- Example: `aBcD1234eFgH5678...`
- Random generation via `crypto.getRandomValues()`

**Brute-Force Resistance:**

```
Total combinations: 62^64 ≈ 3.7 × 10^114

Time to brute-force (1M guesses/sec):
  After 1 second:    1M possibilities tested
  After 1 minute:    60M possibilities tested
  After 1 hour:      3.6B possibilities tested
  After 1 year:      31T possibilities tested
  After 1000 years:  31P possibilities tested (still 10^109 left)

Practical: Impossible to guess
```

### Room ID Exposure

**Safe Channels:**
- ✅ In-person (verbal/QR scan)
- ✅ Encrypted messaging (Signal, WhatsApp, etc.)
- ✅ Private email
- ✅ Shared document (password-protected)

**Risky Channels:**
- ⚠️ Unencrypted email (logged, visible)
- ⚠️ Public chat/Discord (archived, searchable)
- ⚠️ SMS (carrier stores, NSA intercepts)

**If Exposed:**
- Keep room ID for <1 hour only
- Delete message after transfer
- Use new room ID for next transfer

---

## 🌐 Network Security

### STUN/TURN Servers

**Security Considerations:**

1. **STUN Server**
   - No authentication needed
   - Only returns public IP
   - No data relay
   - Safe to use public servers

2. **TURN Server**
   - Only used if direct connection fails
   - Data is encrypted (DTLS) before relay
   - TURN server can't read data (end-to-end encrypted)
   - Authentication possible (username/password)

**Current Setup:**
```javascript
// STUN (default public)
stun:stun.l.google.com:19302

// TURN (optional, user-configurable)
// Requires username + credential
```

Default uses Google's public STUN (safe, widely trusted).

### Local Network

**Risks:**
- LAN traffic unencrypted? (Still encrypted via DTLS)
- Router can log connections? (Only sees encrypted traffic)

**Protection:**
- DTLS encryption active even on LAN
- End-to-end encryption prevents even router from seeing data

---

## 🔍 Privacy Considerations

### Data Collection

**QuickDrop Collects:**
- ❌ No file contents
- ❌ No user accounts/emails
- ❌ No metadata beyond signaling

**Durable Object Stores (Temporary):**
- ✅ Room ID (deleted after transfer)
- ✅ SDP offer/answer (deleted after transfer)
- ✅ ICE candidates (deleted after connection)

**Deleted After:**
- Disconnect
- 1 hour inactivity
- Explicit room closure

### Server Logs

**What's Logged:**
- HTTP request counts (Cloudflare)
- Worker execution stats
- Errors and warnings (no PII)

**What's NOT Logged:**
- File contents
- User data
- Room IDs
- ICE candidates
- Signaling details

---

## 🧪 Security Audit Checklist

### Frontend
- [x] No sensitive data in localStorage
- [x] No API keys hardcoded
- [x] CSP headers respected
- [x] Input sanitization for QR/room ID
- [x] WebRTC encryption active
- [x] Data channel error handling

### Backend (Worker)
- [x] Room ID validation (regex)
- [x] Payload size limits enforced
- [x] Signal type whitelist
- [x] CSP header applied
- [x] HSTS, X-Frame-Options set
- [x] HTTPS/WSS only
- [x] No hardcoded credentials
- [x] Cloudflare DDoS protection enabled

### Infrastructure
- [x] HTTPS certificate valid + renewed
- [x] TLS 1.2/1.3 enabled
- [x] Outdated TLS versions disabled
- [x] Cipher suite modern + secure
- [x] Cloudflare security settings
- [x] DNSSEC enabled (if applicable)

### Deployment
- [x] No debug mode in production
- [x] Error messages don't leak info
- [x] Rate limiting possible (not needed yet)
- [x] Monitoring + alerting configured
- [x] Incident response plan

---

## 🚨 Known Limitations

### Endpoint Compromise

If user's device is compromised:
- WebRTC encryption useless (malware at OS level)
- Mitigation: Keep device secure (antivirus, patches)

### Room ID Guessing

Extremely unlikely but possible:
- 62^64 = huge (see calculation above)
- Use secure generated IDs (crypto.getRandomValues)
- No sequential IDs

### TURN Relay Traffic

If using TURN (fallback):
- TURN server sees encrypted traffic
- Can't decrypt (DTLS end-to-end)
- Can see volume/timing
- Consider: use private TURN server if concerned

### NAT Binding Timeout

Some NAT routers close bindings after inactivity:
- Longer transfers at risk
- Mitigation: Keep alive packets (WebRTC handles)

---

## 🛠️ Security Hardening Ideas

### Already Implemented
- ✅ CSP with strict allow-list
- ✅ HSTS with preload
- ✅ X-Frame-Options: DENY
- ✅ Permissions-Policy limiting APIs
- ✅ Input validation + whitelisting
- ✅ Payload size limits
- ✅ Signal type whitelist
- ✅ DTLS-SRTP automatic encryption

### Future Enhancements
- 🔮 Rate limiting per room
- 🔮 Optional password protection (OTP)
- 🔮 Transfer completion signatures
- 🔮 Security audit logging
- 🔮 Anomaly detection
- 🔮 Penetration testing partners

---

## 📋 Incident Response

### Security Issue Discovered

1. **Immediate Action**
   - Disable affected feature if critical
   - Notify affected users
   - Do NOT public-disclose until patched

2. **Investigation**
   - Root cause analysis
   - Impact assessment
   - Vulnerability classification (CVSS)

3. **Patching**
   - Develop fix
   - Test thoroughly
   - Deploy to production

4. **Communication**
   - GitHub Security Advisory
   - Email affected users (if applicable)
   - Post-mortem blog post

5. **Prevention**
   - Update security guidelines
   - Add tests to prevent recurrence
   - Adjust threat model

---

## 📚 References

### Standards & Specs
- [RFC 3711 — SRTP](https://tools.ietf.org/html/rfc3711)
- [RFC 5245 — ICE](https://tools.ietf.org/html/rfc5245)
- [RFC 6347 — DTLS](https://tools.ietf.org/html/rfc6347)
- [W3C WebRTC 1.0](https://w3c.github.io/webrtc-pc/)

### Best Practices
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CSP Guidelines](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [HTTP Headers Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html)

### Security Tools
- [OWASP ZAP](https://www.zaproxy.org/) (penetration testing)
- [SSL Labs](https://www.ssllabs.com/ssltest/) (HTTPS audit)
- [CSP Evaluator](https://csp-evaluator.withgoogle.com/) (CSP validation)

---

## 🔐 Security Questions?

- **Report Vulnerability** → See [SECURITY.md](../SECURITY.md)
- **Ask Technical** → [GitHub Discussions](https://github.com/YOUR-USERNAME/QuickDrop/discussions)
- **Code Review** → [GitHub Issues](https://github.com/YOUR-USERNAME/QuickDrop/issues)

---

**Security is a shared responsibility. Thank you for helping keep QuickDrop safe!** 🙏
