# How WebRTC Works

Technical explanation of WebRTC and how QuickDrop uses it for peer-to-peer file transfer.

---

## 🎯 WebRTC Overview

**WebRTC** = Web Real-Time Communication

A browser API that enables **peer-to-peer (P2P) communication** without needing a server to relay data:

```
Traditional (Server-Based):
Device A → Server ← Device B
(server holds all data)

WebRTC (Peer-to-Peer):
Device A ←→ Device B
(direct connection, no intermediary)
```

### Key Capabilities

- **Real-time video/audio** (original purpose)
- **Data channels** (what QuickDrop uses)
- **Direct connection** (no server involvement)
- **Automatic encryption** (DTLS-SRTP)

---

## 🔄 Connection Phases

### Phase 1: Signaling (Server Required)

**Purpose:** Exchange connection info between peers

**Process:**
```
Device A                          Server                        Device B
(SDP Offer)  ────────────────────────────────────→  (receives offer)
                                                           ↓
                                                    (creates answer)
            ←────────────────────────────────────  (SDP Answer)
```

**Signaling Details:**

1. **Sender creates SDP Offer** (Session Description Protocol)
   - Lista of supported codecs
   - Connection parameters
   - ICE candidates (ways to reach me)

2. **Server relays to Receiver**
   - Server just forwards data
   - Doesn't process or cache

3. **Receiver creates SDP Answer**
   - Confirms compatible codecs
   - Provides their ICE candidates

4. **Sender receives Answer**
   - Now both have each other's info

**In QuickDrop:**
- Uses WebSocket at `/ws/{roomId}`
- Durable Object acts as relay
- Very low bandwidth (SDP is small)

### Phase 2: ICE Candidate Exchange

**Purpose:** Find the best network path between peers

**What's ICE?** Interactive Connectivity Establishment

**ICE Candidates:** Different ways to reach a device:

1. **Host Candidate** (Local IP)
   ```
   192.168.1.100:9000
   ```
   - Fastest if on same network
   - Won't work if separated by NAT/firewall

2. **Server Reflexive (STUN)** (Public IP)
   ```
   203.0.113.45:52400
   ```
   - Uses STUN server to discover public IP
   - Works through NAT/firewalls
   - Most common for internet transfers

3. **Peer Reflexive**
   ```
   Discovered during connection attempt
   ```
   - Learned from peer's feedback
   - Optimized route

4. **Relay (TURN)** (Via relay server)
   ```
   Turn.example.com:3478
   ```
   - Slowest but most reliable
   - Works even with strict NAT
   - Fallback when direct fails

**Process in QuickDrop:**

```
Sender                Server                                 Receiver
  │                    │                                       │
  │─ SDP Offer ─────────────────────────────────────────────> │
  │                    │                                       │
  │                    │                                       │
  │< ─ SDP Answer ─────────────────────────────────────────── │
  │                    │                                       │
  │ ICE Candidate #1 ─────────────────────────────────────────>│
  │ ICE Candidate #2 ─────────────────────────────────────────>│
  │ ICE Candidate #3 ─────────────────────────────────────────>│
  │                    │                                       │
  │< ─ ICE Candidate #1 ─────────────────────────────────────  │
  │< ─ ICE Candidate #2 ─────────────────────────────────────  │
  │                    │                                       │
  │ >>> Trying connections <<<                                │
  │ (testing each candidate pair)                              │
  │                    │                                       │
```

Both peers send **multiple ICE candidates**:
- Browser tries each one
- First successful connection = established
- Others discarded

### Phase 3: Connection Establishment

**Purpose:** Establish encrypted P2P connection

**Process:**
1. Peer A & B try connecting via each ICE candidate
2. First successful pair = active connection
3. Perform DTLS-SRTP handshake (encryption)
4. Connection ready for data

**Result:**
- P2P connection established
- Encrypted tunnel between peers
- Server not needed anymore

### Phase 4: Data Transfer

**Purpose:** Send actual files/data

**Technology:** RTCDataChannel

```
Sender RTCDataChannel ←→ Encrypted P2P Connection ←→ Receiver RTCDataChannel
```

**How QuickDrop uses it:**

1. **Open data channel** (sender initiates)
2. **Split file into chunks** (64KB each)
3. **Send chunks** via data channel
4. **Receiver assembles chunks**
5. **Download complete**

**Example:**
```javascript
// Sender
const dc = peerConnection.createDataChannel('transfer');
dc.send(chunk1); // 64KB
dc.send(chunk2); // 64KB
// ...continues until all sent

// Receiver
peerConnection.ondatachannel = (event) => {
  const dc = event.channel;
  dc.onmessage = (msg) => {
    // Received chunk, assemble
  }
}
```

---

## 🔐 Encryption

WebRTC automatically encrypts all data:

**DTLS-SRTP** (Datagram Transport Layer Security)

```
Unencrypted Data
      ↓
[DTLS-SRTP Encryption]
      ↓
Encrypted Data Channel
      ↓
Peer's Network
      ↓
[DTLS-SRTP Decryption]
      ↓
Unencrypted Data (at destination)
```

**Key Points:**
- Handled automatically by browser
- No configuration needed
- End-to-end encryption (not even server sees data)

---

## 🌍 NAT & Firewalls

**NAT** = Network Address Translation

Your device sits behind a router, which translates:
- Internal IP: `192.168.1.100`
- External IP: `203.0.113.45` (what internet sees)

### NAT Types

| Type | How It Works | P2P Difficulty |
|------|-------------|-----------------|
| **Open/No NAT** | Device exposed to internet | Easy ✅ |
| **Full Cone** | Static translation | Medium |
| **Restricted** | Translation Depends on destination | Hard |
| **Symmetric (Strict)** | Dynamic translation | Very Hard |

### STUN (Session Traversal Utilities for NAT)

Discovers your public IP:

```
Device           STUN Server
   │                 │
   │─ "What's my IP?" │
   │                 │
   │ ← "203.0.113.45" │
```

Works for most cases (80%+).

### TURN (Traversal Using Relays around NAT)

When STUN fails, relay data through server:

```
Device A ←────────→ TURN Server ←────────→ Device B
           encrypted            encrypted
```

- Slowest option
- 100% reliable
- Fallback when direct fails

---

## 🎯 QuickDrop-Specific Flow

### Complete Connect → Transfer Sequence

```
1. USER ACTION: Open quickdrop, click "Send" or "Receive"

2. SENDER SIDE:
   a. Generate random room ID (alphanumeric)
   b. Create RTCPeerConnection
   c. Create SDP Offer
   d. Connect WebSocket to /ws/{roomId}
   e. Send offer through WebSocket to Durable Object

3. DURABLE OBJECT:
   a. Create room state
   b. Wait for receiver to join
   c. Store sender's offer
   d. When receiver joins, relay offer to them

4. RECEIVER SIDE:
   a. Scan QR or enter room ID
   b. Connect to /ws/{roomId}
   c. Receive sender's offer
   d. Create RTCPeerConnection
   e. Create SDP Answer
   f. Send answer back through WebSocket

5. DURABLE OBJECT:
   a. Relay receiver's answer to sender

6. BOTH SIDES:
   a. Exchange ICE candidates (multiple rounds)
   b. Try connecting via each candidate
   c. First successful = active connection
   d. Perform DTLS-SRTP encryption handshake

7. DATA TRANSFER:
   a. Open data channel
   b. Split file into 64KB chunks
   c. Send chunks rapid-fire
   d. Receiver assembles chunks
   e. Download when complete

8. CLEANUP:
   a. Connection closes
   b. Room deleted from Durable Object
   c. Both browser tabs release resources
```

### Network Timeline

```
Time  |  Sender          |  Server          |  Receiver
------|-----------------|------------------|------------------
  0s  | Generate room   |                  |
  1s  | Send offer ─────→                  |
  2s  |                 → Relay to receiver|
  3s  |                 |                  | Receive offer
  4s  |                 |                  | Create answer
  5s  |                 ← Send answer back ←
  6s  | Receive answer  |                  |
      |                 |                  |
  7s  | Send ICE #1 ───→→→→→→ ICE exchange 
  8s  |                 |← ← ← ← ← ← ← ← ←
  9s  | [Testing ICE pairs...]
 10s  | Direct channel found!
 11s  | ========= P2P Connection Established =========
      | [Server no longer involved for data]
      |
 11s  | Start transfer  |                  |
 15s  | [Sending data chunks...]
 25s  | Transfer complete
 26s  | Close connection|
```

---

## 📊 Bandwidth Usage

### Signaling (Initial setup, via Server)

| Item | Size | Network Impact |
|------|------|-----------------|
| SDP Offer | ~1KB | Negligible |
| SDP Answer | ~1KB | Negligible |
| ICE Candidates (20x) | ~1-5KB each | Negligible |

**Total: ~100KB max** (once-per-transfer)

### Data Transfer (P2P)

| Item | Size | Network Impact |
|------|------|-----------------|
| File data | 100MB | 100% utilized |
| Protocol overhead | ~1-2% | Minimal |
| Encryption | Built-in | No extra bandwidth |

**Total: 100MB → 101-102MB on wire**

---

## 🚀 Why WebRTC for File Transfer?

### Advantages

✅ **Direct Connection** — No server storing files  
✅ **Fast** — Optimized network path  
✅ **Secure** — Automatic end-to-end encryption  
✅ **Private** — No data traces on servers  
✅ **No Size Limits** — Servers not involved  
✅ **Browser Native** — Works in all modern browsers  

### Limitations

❌ **Requires Signaling Server** — Need initial connection exchange  
❌ **NAT/Firewall Dependent** — Strict NAT needs TURN relay  
❌ **No Resume** — If connection drops, restart transfer  
❌ **Not Offline** — Need internet to establish (though data transfer could be local)  

---

## 🔬 Debugging WebRTC

### Browser DevTools

#### Check Connection Status
```javascript
// In browser console
pc.connectionState; // "connecting", "connected", "disconnected", "failed", "closed"
```

#### See ICE Candidates
```javascript
pc.onicecandidate = (event) => {
  if (event.candidate) {
    console.log(event.candidate.candidate);
    // Sample output:
    // "candidate:842163049 1 udp 1677729535 192.168.1.100 52000 typ srflx raddr 203.0.113.45 rport 52000"
  }
}
```

#### Monitor Data Channel
```javascript
dc.onopen = () => console.log('Data channel opened');
dc.onmessage = (event) => console.log('Received:', event.data);
dc.onerror = (error) => console.error('Error:', error);
dc.onclose = () => console.log('Data channel closed');
```

### Chrome WebRTC Stats

In Chrome: `chrome://webrtc-internals/`

View detailed statistics:
- Connection state
- ICE candidates tried
- DTLS encryption status
- Bandwidth usage
- Audio/video stats (if applicable)

---

## 📚 Standards & Specifications

- **RFC 3550** — RTP (Real-time Transport Protocol)
- **RFC 5245** — ICE (Interactive Connectivity Establishment)
- **RFC 6347** — DTLS (Datagram Transport Layer Security)
- **RFC 3711** — SRTP (Secure Real-time Transport Protocol)
- **W3C WebRTC 1.0** — Standard API

---

## 🎓 Further Reading

- [MDN WebRTC API](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)
- [WebRTC for Peer-to-Peer](https://www.html5rocks.com/en/tutorials/webrtc/basics/)
- [IANA STUN/TURN Registry](https://www.iana.org/assignments/stun-parameters/stun-parameters.xhtml)

---

**Need more info?** See [Architecture Overview](Architecture-Overview) for QuickDrop-specific details, or ask in [GitHub Discussions](https://github.com/YOUR-USERNAME/QuickDrop/discussions).
