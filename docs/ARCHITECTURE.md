# Architecture

This document explains QuickDrop's system design and how components interact.

## System Overview

QuickDrop is a P2P file sharing application built on:

- **Frontend**: Single-page app (SPA) with vanilla JavaScript
- **Backend**: Cloudflare Workers + Durable Objects
- **Protocol**: WebRTC for P2P, WebSocket for signaling

```
┌─────────────────────────────────────────────────────┐
│                   Browser (SPA)                     │
│  ┌─────────────────────────────────────────────┐   │
│  │  UI Layer (HTML/CSS)                        │   │
│  │  - Send/Receive forms                       │   │
│  │  - QR code display                          │   │
│  │  - Transfer progress                        │   │
│  └─────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────┐   │
│  │  WebRTC Manager                             │   │
│  │  - ICE candidate handling                   │   │
│  │  - Data channel management                  │   │
│  │  - Transfer logic                           │   │
│  └─────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────┐   │
│  │  WebSocket Client                           │   │
│  │  - Signal exchange                          │   │
│  │  - Room management                          │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────┬──────────────────────────────────┘
                  │
            (WebSocket)
                  │
    ┌─────────────▼──────────────┐
    │  Cloudflare Worker         │
    │  ┌────────────────────┐    │
    │  │ Router             │    │
    │  │ - Route requests   │    │
    │  │ - Auth & validation│    │
    │  └──────┬─────────────┘    │
    │         │                  │
    │  ┌──────▼─────────────┐    │
    │  │ WebSocket Handler  │    │
    │  │ - Signal relay     │    │
    │  │ - Room connection  │    │
    │  └────────────────────┘    │
    └─────────────┬──────────────┘
                  │
         (Durable Object)
                  │
    ┌─────────────▼──────────────┐
    │ RoomSignalingDO            │
    │ ┌────────────────────┐     │
    │ │ Room State         │     │
    │ │ - Client list      │     │
    │ │ - ICE candidates   │     │
    │ │ - SDP offer/answer │     │
    │ └────────────────────┘     │
    │ ┌────────────────────┐     │
    │ │ Signal Router      │     │
    │ │ - Relay messages   │     │
    │ │ - Manage lifetime  │     │
    │ └────────────────────┘     │
    └────────────────────────────┘
                  │
           (P2P Connection)
         ┌────────┴────────┐
         │                 │
    ┌────▼─────┐      ┌────▼─────┐
    │ Sender    │      │ Receiver  │
    │ Browser   │◄────►│  Browser  │
    │           │      │           │
    │ (WebRTC   │      │ (WebRTC   │
    │  Data Ch) │      │  Data Ch) │
    └───────────┘      └───────────┘
```

## Component Architecture

### Frontend (browser/index.html)

Single-page application with embedded HTML, CSS, and JavaScript.

#### Responsibilities:

1. **UI Rendering**
   - Forms for send/receive mode selection
   - File upload input
   - QR code display
   - Transfer progress indicators
   - Completion screens with role-aware actions

2. **WebRTC Management**
   - Create/manage RTCPeerConnection
   - Handle ICE candidates
   - Set SDP offer/answer
   - Create and use data channels

3. **Signaling Client**
   - Connect to WebSocket at `/ws/{roomId}`
   - Exchange ICE candidates and SDP through server
   - Handle connection lifecycle

4. **File/Text Transfer**
   - Read files via File API
   - Send data via data channel
   - Receive and assemble data
   - Trigger downloads

#### Key Functions:

- `initializePeerConnection()` — Create RTCPeerConnection with ICE servers
- `createOffer()` / `createAnswer()` — Generate and send SDP
- `addIceCandidate()` — Handle ICE candidates from peer
- `startTransfer()` — Begin file transfer via data channel
- `startAnotherTransfer()` — Reset state for next transfer

#### State Management:

```javascript
const state = {
  mode: null,                    // 'send' or 'receive'
  roomId: null,                  // Unique session ID
  peerConnection: null,          // RTCPeerConnection
  dataChannel: null,             // RTCDataChannel
  transferFile: null,            // File to send
  receivedData: [],              // Chunks received
  isConnected: false,            // P2P connection status
  transferStarted: false,        // Transfer in progress
};
```

### Worker (worker/src/index.js)

Cloudflare Worker acts as orchestrator and signaling server.

#### Responsibilities:

1. **Routing**
   - Serve frontend HTML at `/`
   - Handle WebSocket upgrade at `/ws/{roomId}`
   - Apply security headers to all responses

2. **Security**
   - Validate room IDs with regex pattern
   - Enforce payload size limits on WebSocket messages
   - Validate signal types (offer, answer, ice-candidate)
   - Apply CSP, HSTS, and other security headers

3. **Signaling Coordination**
   - Route WebSocket connections to Durable Objects
   - Relay ICE candidates and SDP between peers
   - Manage room lifecycle

#### Key Functions:

- `fetch(request)` — Main request handler
- `securityCsp()` — Generate CSP header
- `applySecurityHeaders()` — Apply security headers uniformly
- `isValidRoomId(roomId)` — Validate room ID format

#### Security Mechanisms:

```javascript
// Room ID validation
const ROOM_ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;

// Payload size limit
const MAX_SIGNAL_PAYLOAD_BYTES = 32 * 1024;

// Signal type whitelist
const ALLOWED_SIGNAL_TYPES = ['offer', 'answer', 'ice-candidate'];

// Security headers
const CSP = "default-src 'self'; script-src 'self' 'unsafe-inline' ...";
```

### Durable Object: RoomSignalingDO (worker/src/index.js)

Durable Object (global distributed state store) manages each transfer session.

#### Responsibilities:

1. **Room Lifecycle**
   - Create room when first client connects
   - Maintain list of connected clients (max 2)
   - Close room when both clients disconnect
   - Auto-cleanup after inactivity

2. **Signal Relay**
   - Receive signals from one client
   - Validate signal structure
   - Forward to other client
   - Handle protocol errors

3. **State Management**
   - Store pending ICE candidates
   - Store SDP offer/answer
   - Manage WebSocket lifecycle

#### Message Flow:

```
Sender:
  1. Generate SDP offer
  2. Send via WebSocket: { type: 'offer', data: sdpOffer }
  
RoomSignalingDO:
  3. Receive and validate
  4. Forward to receiver
  
Receiver:
  5. Set remote description
  6. Generate and send SDP answer
  
RoomSignalingDO:
  7. Forward answer to sender
  
Sender & Receiver:
  8. Exchange ICE candidates repeatedly
  
Both:
  9. Once enough ICE candidates gathered, P2P connection establishes
  10. Data channel opens
  11. File/text transfer proceeds
```

## Data Flow

### Transfer Initiation

```
User clicks "Send" / "Receive"
         ↓
Browser generates room ID (or uses provided one)
         ↓
Generate SDP offer (sender) / prepare to receive (receiver)
         ↓
Connect WebSocket to /ws/{roomId}
         ↓
Worker routes to RoomSignalingDO
         ↓
Durable Object creates/joins room
         ↓
WebSocket connected, ready to exchange signals
```

### ICE Candidate Exchange

```
Sender:
  - Browser collects local ICE candidates (STUN, TURN)
  - For each: send { type: 'ice-candidate', candidate: {...} }
  - Worker validates payload size, type
  - Forwards to Receiver via RoomSignalingDO
  
Receiver:
  - Receives ICE candidate via WebSocket
  - Calls connection.addIceCandidate()
  - Collects own candidates, sends back
  - Sender receives and adds to connection
  
Result: Optimal P2P path discovered
```

### File Transfer

```
Once P2P connection established:

Sender:
  1. Open data channel for transfer
  2. Split file into 64KB chunks
  3. For each chunk: send via data channel
  4. Track progress, display to UI
  5. Send completion signal
  
Receiver:
  1. Receive data channel open event
  2. Collect incoming chunks into buffer
  3. Monitor for completion signal
  4. Assemble file from chunks
  5. Trigger download via blob URL
```

## Security Model

### Transport Security

- **HTTPS Only**: Enforced via HSTS header
- **WSS (WebSocket Secure)**: Used for signaling
- **WebRTC Encryption**: Built-in via DTLS-SRTP

### Input Validation

```javascript
// Room ID
/^[A-Za-z0-9_-]{1,64}$/

// WebSocket Message
{
  type: 'offer' | 'answer' | 'ice-candidate',  // Whitelist
  data: {...}                                    // Validated structure
}

// Payload Size
message.toString().length <= 32 * 1024  // 32KB max
```

### Content Security

- **CSP**: Whitelist fonts.googleapis.com, cdnjs.cloudflare.com, self
- **X-Frame-Options**: DENY (prevents embedding)
- **X-Content-Type-Options**: nosniff (MIME confusion)
- **Referrer-Policy**: strict-origin-when-cross-origin
- **Permissions-Policy**: Disable camera, mic, geolocation, etc.

### Data Privacy

- **No Server Storage**: Data never written to disk
- **P2P Only**: After WebSocket signals, data goes peer-to-peer
- **Ephemeral Memory**: Room state exists only while clients connected
- **Auto-Cleanup**: Unused rooms deleted after timeout

## Performance Considerations

### Frontend Optimization

- **Vanilla JavaScript**: No framework overhead
- **Inline CSS**: No extra HTTP requests
- **CDN Dependencies**: QRCode.js and Fonts from CDN
- **Chunked Transfer**: 64KB chunks prevent memory spikes

### Worker Optimization

- **Durable Objects**: Global state store (low latency)
- **Edge Location**: Runs in Cloudflare data center nearest user
- **Stream Processing**: WebSocket allows streaming (not buffering)

### Scalability

- **Stateless Workers**: Multiple instances handle requests
- **Durable Objects**: One per room (auto-distributed)
- **P2P Data**: Bypasses worker (only signals through)

## Error Handling

### Network Failures

- **WebSocket Dropped**: Retry connection
- **ICE Candidates Fail**: Fall back to TURN servers
- **P2P Connection Fails**: Show error, allow restart

### Validation Errors

- **Invalid Room ID**: Reject with 400 Bad Request
- **Oversized Signal**: Close WebSocket with code 1009
- **Invalid Signal Type**: Reject, log event

### User Actions

- **Connection Timeout**: Display connection attempt message
- **Transfer Interrupted**: Allow resume if P2P still open
- **Browser Closes**: Graceful cleanup, peer notified

## Deployment Architecture

### Development

```
Local Machine
  ├─ npm install
  ├─ npx wrangler dev (localhost:8787)
  └─ Test locally before pushing
```

### Production

```
Cloudflare Global Network
  ├─ Worker instances (automatically scaled)
  ├─ Durable Objects storage
  └─ Static assets (frontend HTML)
  
DNS:
  quickdrop-share.adheesharavindu001.workers.dev
```

### Environments

- **Default**: Development/staging deployments
- **Production**: Separate subdomain with separate Durable Objects namespace

## Future Enhancements

Potential architectural improvements:

1. **Compression**: Gzip file data before transfer
2. **Resume Support**: Persist transfer state using Durable Objects
3. **Group Transfers**: Support >2 participants per room
4. **Scheduled Cleanup**: Regular audit of stale room state
5. **Analytics**: Track transfer success rates (privacy-preserving)
6. **Multi-Part**: Transfer management for large files

---

For development guidance, see [DEVELOPMENT.md](../DEVELOPMENT.md).  
For security details, see [SECURITY.md](../SECURITY.md).
