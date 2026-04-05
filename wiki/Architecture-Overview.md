# Architecture Overview

Detailed breakdown of QuickDrop's system architecture, components, and design decisions.

---

## 🏗️ System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────┐
│                        Browser (SPA)                               │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │  UI Layer                                                  │   │
│  │  • Send/Receive screens                                    │   │
│  │  • File selection + QR code display                        │   │
│  │  • Transfer progress + completion                          │   │
│  └──────────────────────────┬─────────────────────────────────┘   │
│                             │                                      │
│  ┌──────────────────────────▼─────────────────────────────────┐   │
│  │  WebRTC Manager                                            │   │
│  │  • RTCPeerConnection management                            │   │
│  │  • ICE candidate handling                                  │   │
│  │  • Data channel creation + transfer logic                  │   │
│  │  • File chunking (64KB blocks)                             │   │
│  └──────────────────────────┬─────────────────────────────────┘   │
│                             │                                      │
│  ┌──────────────────────────▼─────────────────────────────────┐   │
│  │  Signaling Client                                          │   │
│  │  • WebSocket connection to /ws/{roomId}                    │   │
│  │  • SDP offer/answer exchange                               │   │
│  │  • ICE candidate relay                                     │   │
│  └──────────────────────────┬─────────────────────────────────┘   │
└─────────────────────────────┼────────────────────────────────────┘
                              │
                        (WebSocket)
                              │
            ┌─────────────────▼──────────────────┐
            │   Cloudflare Worker                │
            │   ┌──────────────────────────┐     │
            │   │ Security & Routing       │     │
            │   │ • CSP headers            │     │
            │   │ • Input validation       │     │
            │   │ • Route WebSocket to DO  │     │
            │   └───────────┬──────────────┘     │
            │               │                    │
            │   ┌───────────▼──────────────┐     │
            │   │ WebSocket Handler        │     │
            │   │ • Upgrade connections    │     │
            │   │ • Protocol dispatch      │     │
            │   └───────────┬──────────────┘     │
            │               │                    │
            └───────────────┼────────────────────┘
                            │
                (Durable Object Binding)
                            │
            ┌───────────────▼────────────────────┐
            │  RoomSignalingDO                   │
            │  (Durable Object - Global State)   │
            │                                    │
            │  ┌────────────────────────────┐   │
            │  │ Room State                 │   │
            │  │ • Client list (max 2)      │   │
            │  │ • Pending ICE candidates   │   │
            │  │ • SDP offer/answer store   │   │
            │  │ • Expiration timer         │   │
            │  └────────────────────────────┘   │
            │                                    │
            │  ┌────────────────────────────┐   │
            │  │ Signal Router              │   │
            │  │ • Relay SDP messages       │   │
            │  │ • Forward ICE candidates   │   │
            │  │ • Lifecycle management     │   │
            │  └────────────────────────────┘   │
            └────────────────────────────────────┘
                         (after handshake)
         ┌────────────────────────────────────────┐
         │   Direct P2P Connection (WebRTC)       │
         │   ════════════════════════════════════  │
         │   Sender       ←→ Receiver             │
         │   (Data Channel)                       │
         │   • File chunks via encryption         │
         │   • No server involved in transfer     │
         └────────────────────────────────────────┘
```

---

## 📦 Component Breakdown

### Frontend (browser/index.html)

**Type:** Single-Page Application (SPA)

**Technologies:**
- HTML5 + CSS3 + Vanilla JavaScript
- No framework dependencies
- QRCode.js (CDN) for QR generation
- Google Fonts for typography

**Responsibilities:**
1. **Rendering UI**
   - Mode selection (Send/Receive)
   - File input + text input
   - Transfer progress display
   - Completion screens with role-aware actions

2. **Managing WebRTC Connection**
   - Create `RTCPeerConnection`
   - Set SDP offer/answer
   - Handle ICE candidates
   - Manage data channels

3. **Signaling**
   - Initiate WebSocket to Worker
   - Exchange SDP + ICE candidates
   - Relay through Durable Object

4. **File/Text Transfer**
   - Split files into 64KB chunks
   - Send via data channel
   - Receive and assemble chunks
   - Trigger download

**Key Functions:**
```javascript
initializePeerConnection()    // Create connection with STUN/TURN
createOffer()                 // Sender: Generate SDP offer
createAnswer()                // Receiver: Generate SDP answer
addIceCandidate()             // Process incoming ICE candidate
startTransfer()               // Begin file transmission
startAnotherTransfer()        // Reset state for next transfer
```

**State:**
```javascript
{
  mode: 'send' | 'receive',
  roomId: string,
  peerConnection: RTCPeerConnection,
  dataChannel: RTCDataChannel,
  transferFile: File | null,
  receivedData: Uint8Array[],
  isConnected: boolean,
  transferStarted: boolean
}
```

---

### Worker (worker/src/index.js)

**Type:** Cloudflare Workers (Serverless Edge Compute)

**Responsibilities:**
1. **Frontend Serving**
   - Serve `/` with `index.html`
   - Serve static pages
   - Fallback SPA routing to `/index.html`

2. **Security**
   - Apply CSP headers
   - Apply HSTS + frame options
   - Input validation
   - Payload size limits

3. **WebSocket Routing**
   - Upgrade HTTP to WebSocket
   - Extract room ID from URL
   - Route to Durable Object

**Security Functions:**
```javascript
securityCsp()                 // Generate strict CSP header
applySecurityHeaders()        // Apply all security headers uniformly
isValidRoomId(roomId)         // Validate room ID format
```

**Security Enforcement:**
```javascript
// Room ID validation
ROOM_ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/

// Payload size limit
MAX_SIGNAL_PAYLOAD_BYTES = 32 * 1024

// Signal type whitelist
ALLOWED_TYPES = ['offer', 'answer', 'ice-candidate']
```

**Security Headers Applied:**
| Header | Value | Purpose |
|--------|-------|---------|
| Content-Security-Policy | Strict allow-list | Prevent injection attacks |
| Strict-Transport-Security | 1 year + preload | Force HTTPS |
| X-Frame-Options | DENY | Prevent clickjacking |
| X-Content-Type-Options | nosniff | Prevent MIME sniffing |
| Referrer-Policy | strict-origin-when-cross-origin | Control referrer |
| Permissions-Policy | Disable APIs | Restrict sensitive APIs |

---

### Durable Objects: RoomSignalingDO

**Type:** Cloudflare Durable Objects (Global Mutable State)

**Purpose:** Manage individual transfer sessions (rooms)

**Responsibilities:**
1. **Room Lifecycle**
   - Create on first client connect
   - Track 2 clients (sender + receiver)
   - Delete on disconnect or timeout
   - Auto-cleanup after 1 hour inactivity

2. **Signal Relay**
   - Store and forward SDP offer/answer
   - Relay ICE candidates between peers
   - Validate signal structure
   - Error handling + logging

3. **WebSocket Management**
   - Accept client connection
   - Manage WebSocket state
   - Handle disconnect
   - Clean up resources

**Key Methods:**
```javascript
onConnect(ws)                 // Client joins room
relaySignal(from, signal)     // Relay SDP/ICE to other client
onDisconnect()                // Client leaves
cleanup()                     // Delete room state
```

**State:**
```javascript
{
  roomId: string,
  clients: Map<id, WebSocket>,
  pendingOffers: [],
  pendingAnswers: [],
  iceCandiates: [],
  createdAt: timestamp,
  lastActivity: timestamp,
  maxClients: 2
}
```

---

## 🔄 Data Flow

### Transfer Initiation

```
User opens QuickDrop
    ↓
 Selects SEND/RECEIVE
    ↓
 Browser generates unique room ID
    ↓
 Creates RTCPeerConnection with STUN/TURN
    ↓
 Opens WebSocket to /ws/{roomId}
    ↓
 Worker receives WebSocket upgrade
    ↓
 Creates/joins Durable Object for room
    ↓
 Browser ready to exchange signals
```

### Connection Establishment

```
SENDER:
  1. Generate SDP offer
  2. Set as local description
  3. Send offer to Durable Object via WebSocket

DURABLE OBJECT:
  4. Store offer (awaiting receiver)

RECEIVER:
  5. Connect to same room ID
  6. Receive sender's offer via WebSocket
  7. Set as remote description
  8. Generate SDP answer
  9. Send answer to Durable Object

DURABLE OBJECT:
  10. Relay answer to sender

BOTH:
  11. Collect ICE candidates as browser finds them
  12. Send each candidate through WebSocket
  13. Peer receives and adds to connection
  14. First successful candidate → connection established
  15. DTLS-SRTP encryption handshake
  16. Ready for data transfer
  17. WebSocket no longer needed (can close)
```

### File Transfer

```
SENDER:
  1. Open data channel: dc = peerConnection.createDataChannel('transfer')
  2. Split file into 64KB chunks
  3. For each chunk: dc.send(chunk)
  4. Send completion signal: dc.send({type: 'done'})

RECEIVER:
  1. Wait for data channel
  2. Receive chunks via dc.onmessage
  3. Append chunks to buffer
  4. On 'done' signal, assemble file
  5. Trigger download blob

BOTH:
  6. Close connection after transfer
  7. Durable Object deletes room state
  8. WebSocket connection closes
```

---

## 🔐 Security Model

### Transport Security
- **HTTPS Only** (enforced by HSTS header)
- **WebSocket Secure (WSS)** for signaling
- **DTLS-SRTP** automatic encryption for data

### Input Validation

**Frontend:**
- Room ID format validation
- File size awareness
- User input sanitization

**Backend:**
- Room ID regex: `/^[A-Za-z0-9_-]{1,64}$/`
- Payload size limit: 32KB max
- Signal type whitelist: offer/answer/ice-candidate only
- Malformed signals rejected

### Data Privacy
- **No Storage**: Room state ephemeral (memory only)
- **P2P Only**: Data doesn't traverse server
- **Auto Cleanup**: Rooms deleted after inactivity
- **No Logging**: Sensitive data not logged

### Encryption
- **Automatic**: WebRTC's DTLS-SRTP handles it
- **End-to-End**: Only sender/receiver have keys
- **Algorithm**: AES-128 CM + HMAC-SHA1 (standard)

---

## 🚀 Performance Optimizations

**Frontend:**
- Vanilla JS (no framework overhead)
- Inline CSS (single HTTP request)
- Chunked transfers (64KB blocks, prevents memory spikes)
- Lazy loading (QRCode.js on-demand)

**Worker:**
- Edge location (runs near user)
- Stateless (scales automatically)
- WebSocket streams (vs. polling)

**Durable Objects:**
- One per room (auto-distributed)
- Global state (no database roundtrip)
- Automatic failover + replication

**WebRTC:**
- Direct P2P (bypasses server for data)
- ICE optimization (tests multiple paths)
- TURN fallback (backup when direct fails)

---

## 📊 Scalability

| Component | Limit | Note |
|-----------|-------|------|
| Concurrent Transfers | Unlimited | Each uses separate Durable Object |
| File Size | Device Memory | No server limit |
| Room Lifetime | 1 hour inactivity | Auto-cleanup |
| Clients per Room | 2 max | Sender + receiver only |
| Signaling Bandwidth | ~100KB per transfer | Negligible |
| Data Transfer | 100% of available bandwidth | P2P, no server bottleneck |

---

## 🔧 Deployment Architecture

### Development
```
Local Machine
├─ npm install
├─ npx wrangler dev
└─ localhost:8787
```

### Production
```
Cloudflare Global Network
├─ Worker instances (auto-scaled in data centers worldwide)
├─ Durable Objects (namespace isolation)
└─ Static asset caching (frontend HTML)
```

### Environments
- **Default:** Development/staging
- **Production:** Separate subdomain

Each environment has isolated:
- Durable Objects namespace
- Workers deployment
- Configuration

---

## 🛠️ Technology Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Frontend** | HTML5 + CSS3 + Vanilla JS | Minimal dependencies, fast |
| **Backend** | Cloudflare Workers | Edge compute, global, scalable |
| **State** | Durable Objects | Global state without DB |
| **Transport** | WebRTC DataChannel | P2P, encrypted, browser-native |
| **Signaling** | WebSocket | Low latency, persistent |
| **Encryption** | DTLS-SRTP (built-in) | Automatic, standards-compliant |
| **Deployment** | GitHub + Wrangler | Simple CI/CD |

---

## 🎯 Design Decisions

### Why P2P?
✅ No server storage (privacy)  
✅ No bandwidth cost (P2P transfers server)  
✅ Unlimited file sizes  
✅ Low latency (direct connection)

### Why Cloudflare Workers?
✅ Edge location (fast)  
✅ Scales automatically  
✅ Durable Objects global state  
✅ Free tier sufficient for this use case

### Why Vanilla JS?
✅ No framework bloat  
✅ Smaller bundle (faster load)  
✅ No dependency vulnerabilities  
✅ Fast performance

### Why WebSocket for Signaling?
✅ Persistent connection  
✅ Low latency (vs. polling)  
✅ Server can push updates  
✅ Less overhead than HTTP

---

## 🔮 Future Architecture Enhancements

Potential improvements:
1. **Compression** — Gzip before transfer
2. **Resume Support** — Persist transfer state in Durable Objects
3. **Grouping** — Support >2 participants per room
4. **Scheduling** — Transfer at specific time
5. **WebTorrent** — Large file splitting
6. **Dashboard** — Transfer history + stats

---

## 📚 Related Documentation

- **[How WebRTC Works](How-WebRTC-Works)** — Technical WebRTC explanation
- **[Security Deep Dive](Security-Deep-Dive)** — Detailed security analysis
- **[Architecture.md](../docs/ARCHITECTURE.md)** — Main architecture doc
- **[DEVELOPMENT.md](../DEVELOPMENT.md)** — Development setup

---

**Need more detail?** Check the source code:
- [worker/src/index.js](https://github.com/YOUR-USERNAME/QuickDrop/blob/main/worker/src/index.js) — Worker implementation
- [frontend/index.html](https://github.com/YOUR-USERNAME/QuickDrop/blob/main/frontend/index.html) — Frontend code

Or ask in [GitHub Discussions](https://github.com/YOUR-USERNAME/QuickDrop/discussions) 💬
