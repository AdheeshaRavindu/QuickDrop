# Development Guide

This guide covers setting up your development environment, running the project locally, and deploying to production.

## Prerequisites

- **Node.js**: v16 or later
- **npm**: v7 or later
- **Cloudflare Workers Account**: Free account sufficient for development
- **Git**: For version control

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR-USERNAME/QuickDrop.git
cd QuickDrop
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Cloudflare Wrangler

Wrangler is the CLI for Cloudflare Workers development.

```bash
# Already installed as dev dependency
# Verify installation
npx wrangler --version
```

## Configuration

### Environment Variables

Create a `.env.local` file in the root directory (not tracked by git):

```bash
# Optional: Custom STUN servers
STUN_SERVERS=stun:stun.l.google.com:19302,stun:stun1.l.google.com:19302

# Optional: Custom TURN servers (uncomment to use)
# TURN_URLS=turn:your-turn-server.com:3478
# TURN_USERNAME=username
# TURN_CREDENTIAL=password

# Optional: ICE servers as JSON (overrides individual settings)
# ICE_SERVERS_JSON=[{"urls":["stun:stun.l.google.com:19302"]}]
```

### Wrangler Configuration

Edit `worker/wrangler.toml`:

```toml
name = "quickdrop-share"
type = "javascript"
account_id = "YOUR_ACCOUNT_ID"
workers_dev = true
route = "example.com/*"
zone_id = "YOUR_ZONE_ID"

[env.production]
name = "quickdrop-share-production"
account_id = "YOUR_ACCOUNT_ID"
workers_dev = true
```

Find your Account ID and Zone ID in Cloudflare dashboard.

## Local Development

### Start Development Server

```bash
npx wrangler dev
```

This starts a local server (default: `http://localhost:8787`).

- Frontend: Served at `/`
- Worker: Handles WebSocket at `/ws/{roomId}`

### Make Changes

1. **Frontend**: Edit `frontend/index.html` (auto-reloads)
2. **Worker**: Edit `worker/src/index.js` (auto-reloads)

### Testing

#### Manual Testing

1. Open `http://localhost:8787` in two browser windows
2. One as sender, one as receiver
3. Generate/scan QR code
4. Test file and text transfers
5. Check browser console for errors

#### Cross-Browser Testing

Test on:

- Chrome/Chromium (DevTools: `F12`)
- Firefox (DevTools: `F12`)
- Safari (DevTools: `Cmd+Option+I` or Safari menu)
- Edge (DevTools: `F12`)

#### Mobile Testing

```bash
# Find your local IP
ipconfig getifaddr en0  # macOS
hostname -I            # Linux
ipconfig                # Windows (look for IPv4 Address)

# Open on mobile: http://<YOUR-IP>:8787
```

#### Security Testing

1. **Check Headers**: Use browser DevTools → Network tab
2. **CSP Validation**: No CSP violations in console
3. **HSTS**: Verify `strict-transport-security` header
4. **Frame Protection**: Verify `x-frame-options: DENY`

View all headers:

```javascript
// In browser console
fetch('/').then(r => console.log([...r.headers]))
```

## Debugging

### Console Logging

```javascript
// Worker logs (visible in wrangler dev)
console.log('Frontend message');
console.warn('Warning from Worker');
console.error('Error details');
```

### Live Logs

```bash
npx wrangler tail
```

Streams all Worker logs in real-time (requires deployed Worker).

### WebRTC Debugging

Browser DevTools → Application tab → Local Storage

View active room IDs and status.

### WebSocket Debugging

Browser DevTools → Network tab → WS filter

Watch WebSocket messages between sender/receiver.

## Building

No build step required. The project uses:

- Vanilla JavaScript (no transpilation needed)
- Cloudflare's built-in bundling for Workers

## Deployment

### Deploy to Staging (Default)

```bash
npx wrangler deploy
```

Output:

```
✓ Uploaded quickdrop-share
URL: https://quickdrop-share.YOUR-ACCOUNT.workers.dev
```

### Deploy to Production

```bash
npx wrangler deploy --env production
```

### Verify Deployment

```bash
# Check version
npx wrangler deployments list

# View live logs
npx wrangler tail
```

## Production Checklist

Before deploying to production:

- [ ] All tests pass locally
- [ ] No console errors or warnings
- [ ] Security headers present (`x-frame-options`, `strict-transport-security`, etc.)
- [ ] Code reviewed by maintainers
- [ ] Commits have clear messages
- [ ] No credentials in code
- [ ] All dependencies up-to-date

## Troubleshooting

### Port Already in Use

```bash
# Use different port
npx wrangler dev --port 3000
```

### WebSocket Connection Fails

1. Check Wrangler output for errors
2. Verify room ID format: alphanumeric + `-_` only
3. Check firewall/proxy settings
4. Test with direct connection (no VPN)

### QR Code Not Generating

1. Check CDN is accessible: `https://cdnjs.cloudflare.com`
2. Check CSP allows `cdnjs.cloudflare.com`
3. Check browser console for script errors

### ICE Candidates Not Exchanged

1. Check STUN/TURN servers are accessible
2. Try different STUN server: `stun:stun1.l.google.com:19302`
3. Check firewall allows UDP on port 3478 (TURN) or 19302 (STUN)

### File Transfer Stalls

1. Check available memory
2. Try smaller file first
3. Check browser DevTools Memory tab

## Project Structure

```
worker/
├── src/
│   └── index.js           # Worker logic: signaling, WebSocket, security
└── wrangler.toml          # Worker configuration

frontend/
└── index.html             # Single-page app: UI, WebRTC, QR generation

docs/
├── ARCHITECTURE.md        # System design
└── SECURITY.md           # Security details

README.md                  # Main documentation
CONTRIBUTING.md           # Contribution guidelines
DEVELOPMENT.md            # This file
SECURITY.md               # Security policy
CODE_OF_CONDUCT.md        # Community guidelines
LICENSE                   # MIT License
```

## Architecture Overview

```
Sender Browser ←→ Cloudflare Worker ←→ Receiver Browser
                  (Signaling Only)
                        ↓
                  Durable Object
                  (Room Manager)
                        
    [After handshake]
    
Sender ←↔→ WebRTC P2P Connection ←↔→ Receiver
(Data via Data Channel)
```

## Key Concepts

### Room ID

Unique identifier for each transfer session:
- Format: alphanumeric + `-` + `_` (max 64 chars)
- Example: `abc-123_XYZ`

### WebSocket Signaling

Temporary connection used only for ICE candidate exchange:
- Initiator's room ID is converted to signaling URL
- Worker routes to correct Durable Object
- Durable Object forwards signals between clients

### WebRTC Data Channel

Permanent P2P connection after SDP handshake:
- Used for actual file/text transfer
- Survives WebSocket closure
- No data passes through server

## Performance Tips

- **Local Testing**: Use Chrome DevTools Performance tab to profile
- **Network Latency**: Simulate in DevTools → Network conditions
- **Memory Usage**: Monitor in DevTools → Memory tab during large file transfers

## Security Development

### Adding New Security Headers

Edit `worker/src/index.js` → `applySecurityHeaders()` function:

```javascript
headers.set("x-your-header", "value");
```

### Validating Input

Example room ID validation:

```javascript
const ROOM_ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;

if (!ROOM_ID_PATTERN.test(roomId)) {
  // Reject invalid room ID
}
```

### Testing Security

```bash
# Use online CSP tester
# https://csp-evaluator.withgoogle.com

# Check headers
curl -I https://quickdrop-share.workers.dev
```

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature

# Make changes
# Test locally

# Stage and commit
git add .
git commit -m "feat: add your feature"

# Push to fork
git push origin feature/your-feature

# Create Pull Request on GitHub
```

## Resources

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Durable Objects API](https://developers.cloudflare.com/workers/learning/using-durable-objects/)
- [WebRTC API](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)
- [OWASP Security Guidelines](https://owasp.org/)

## Questions?

- See README.md for general info
- Check existing Issues/Discussions
- Open a new Discussion with your question

---

Happy coding! 🚀
