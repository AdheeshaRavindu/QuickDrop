# FAQ

Frequently Asked Questions about QuickDrop.

---

## 🔒 Security & Privacy

### Q: Is my data safe with QuickDrop?
**A:** Yes. QuickDrop uses **peer-to-peer (P2P) technology**, meaning:
- Data transfers directly between your device and the recipient's device
- No data is stored on QuickDrop's servers
- Even QuickDrop can't access your files
- Transfer is encrypted via WebRTC's built-in DTLS-SRTP

### Q: What data does QuickDrop collect?
**A:** We collect:
- ❌ **No file contents** (P2P only)
- ❌ **No user data** (no accounts/logins)
- ❌ **No metadata** beyond what's necessary for signaling
- ✅ **Minimal signaling data** (temporary, auto-deleted when room closes)

### Q: How is my connection encrypted?
**A:** WebRTC uses:
- **DTLS-SRTP** for data encryption
- **TLS 1.2+** for WebSocket signaling
- **End-to-end encryption** between peers

### Q: Can someone intercept my file?
**A:** Extremely unlikely. To intercept, an attacker would need to:
1. Compromise one of the endpoints (your device or recipient's)
2. Or compromise the network infrastructure (unlikely on encrypted connection)
3. Or know the room ID before connection established

**Keep room IDs private** and you're protected.

### Q: Do I need a VPN?
**A:** Not required for QuickDrop itself (we use HTTPS + encrypted WebRTC). A VPN adds extra privacy if desired.

---

## 🎯 How It Works

### Q: How does peer-to-peer file transfer work?
**A:** In 4 steps:
1. **Signaling**: Sender and receiver exchange connection info via server
2. **Connection**: Direct WebRTC connection established between peers (no server involved)
3. **Transfer**: File sent directly peer-to-peer
4. **Cleanup**: Room and signaling data deleted after disconnect

[Deep dive in How WebRTC Works](How-WebRTC-Works)

### Q: What's a room ID?
**A:** A unique identifier for each transfer session. Think of it as a temporary "room" where:
- Only 2 people can connect (sender + receiver)
- Room exists only while connected
- Expires automatically after 1 hour of inactivity

### Q: What's the QR code for?
**A:** The QR code encodes the room ID + server URL. Scanning it opens QuickDrop with the room pre-filled—no manual typing needed.

### Q: What if someone guesses my room ID?
**A:** Room IDs are:
- 64 characters (alphanumeric + `-_`)
- Random and non-sequential
- Effectively impossible to guess
- Only 2 people can connect per room anyway

---

## 📊 Transfer

### Q: What's the file size limit?
**A:** **No hard limit.** Limited only by:
- Available device memory
- Available bandwidth
- Browser capability

Tested with files 100MB+. Larger files take longer but work fine.

### Q: How fast is the transfer?
**A:** Depends on:
- File size
- Your internet speed (typically upload/download speed)
- Network path (direct connection faster than TURN relay)

**Typical speeds:**
- 1MB: < 1 second
- 100MB: 1-5 minutes (on typical broadband)
- 1GB: 15-60 minutes

### Q: Can I pause and resume a transfer?
**A:** **Not currently.** If interrupted, restart the transfer. This is on our roadmap.

### Q: What if my connection drops mid-transfer?
**A:** The transfer fails. You'll see an error message. Start a new transfer to retry.

### Q: Can I transfer multiple files at once?
**A:** **Not in one session.** Send one at a time:
1. Transfer file #1
2. Click "Start another transfer"
3. Transfer file #2 (new room ID)

---

## 🌐 Connectivity

### Q: Why can't I connect?
**Possible issues:**
- **Network**: Check internet connection
- **Firewall**: Some corporate firewalls block WebRTC. Try from home.
- **VPN Issues**: Some VPNs block P2P. Try disabling temporarily.
- **Browser**: Ensure WebRTC is enabled (usually default)
- **NAT**: Some strict NAT configurations cause issues

[See Troubleshooting](Troubleshooting) for solutions.

### Q: Do I need a static IP?
**A:** No. QuickDrop works with dynamic IPs (DHCP). The STUN/TURN servers handle NAT traversal.

### Q: Does this work on public WiFi?
**A:** Usually yes, but some public WiFi blocks P2P. Try:
- Hotspot from a phone instead
- Ask the WiFi provider to allow P2P
- Use from home network

### Q: What's STUN/TURN?
**A:** Servers that help establish direct connections through NAT/firewalls:
- **STUN**: Discovers your public IP (most common)
- **TURN**: Relays data if direct connection fails (backup)

[More info](How-WebRTC-Works)

---

## 🖥️ Browser & Device

### Q: Which browsers work?
**A:** Modern browsers with WebRTC support:
- ✅ Chrome/Chromium 20+
- ✅ Firefox 22+
- ✅ Safari 11+
- ✅ Edge 79+
- ✅ Mobile Safari (iOS 14.5+)
- ✅ Chrome Mobile

### Q: Does this work on older devices?
**A:** Only if the browser supports WebRTC. Modern devices (last 5+ years) should work fine.

### Q: Can I use this on tablets?
**A:** Yes, iPad, Android tablets, etc. all work.

### Q: Does this work offline?
**A:** No. Both parties need internet to establish connection. Once connected (pending), transfers could theoretically continue offline (peer-to-peer), but that's not recommended.

---

## 💻 Technical

### Q: What's my IP address being shared?
**A:** During signaling, your public IP is determined via STUN/TURN servers. This is:
- Standard for WebRTC
- Necessary for peer-to-peer connection
- Not logged or stored

You can see your IP manually at [whatismyipaddress.com](https://whatismyipaddress.com).

### Q: Can I host QuickDrop myself?
**A:** Yes! It's open source on GitHub. See [Developer Setup](Developer-Setup).

### Q: How do I report a security issue?
**A:** See [SECURITY.md](https://github.com/YOUR-USERNAME/QuickDrop/blob/main/SECURITY.md) for responsible disclosure.

---

## 🤔 Other

### Q: Is QuickDrop free?
**A:** Yes, 100% free. No hidden costs, ads, or premium tiers.

### Q: Can I use this commercially?
**A:** Yes. QuickDrop is MIT licensed—free for personal and commercial use.

### Q: Who maintains QuickDrop?
**A:** Open source community. [Join us!](Contributing-Guide)

### Q: What's the business model?
**A:** Open source gift to the internet. No monetization planned.

### Q: Will this always be free?
**A:** The code is open source under MIT license. If the hosted version changes, you can always host it yourself.

---

## 🆘 Still Have Questions?

- **See [Getting Started](Getting-Started)** for a walkthrough
- **Check [Troubleshooting](Troubleshooting)** for technical issues
- **Ask in [GitHub Discussions](https://github.com/YOUR-USERNAME/QuickDrop/discussions)**
- **Report issues on [GitHub Issues](https://github.com/YOUR-USERNAME/QuickDrop/issues)**

---

**Happy sharing!** 🚀
