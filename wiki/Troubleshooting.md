# Troubleshooting

Having issues with QuickDrop? Here's how to fix common problems.

---

## 🔗 Connection Issues

### Can't Connect or "Waiting for connection" hangs

**Symptoms:**
- Receiver scans QR code but stays on "Waiting for connection"
- After 30+ seconds, connection fails

**Solutions:**

1. **Check Internet Connection**
   - Verify both devices have working internet
   - Try opening [google.com](https://google.com) on both devices

2. **Refresh and Retry**
   - Close QuickDrop tab completely
   - Wait 5 seconds
   - Reopen and try again

3. **Try a Different Room ID**
   - Sometimes room creation fails
   - Generate a new transfer (new room ID)

4. **Check Browser WebRTC**
   - Open browser console (`F12` → Console tab)
   - Look for WebRTC-related errors
   - Restart browser if errors present

5. **Firewall/NAT Issues**
   - Try from a different location (home vs. office)
   - Corporate firewalls often block P2P
   - Try from a mobile hotspot instead

6. **Check STUN/TURN Servers**
   - Some public WiFi blocks STUN/TURN ports
   - Try disabling VPN if active
   - Switch to a different network

**Still stuck?** Open a [GitHub Issue](https://github.com/YOUR-USERNAME/QuickDrop/issues) with:
- Browser + OS + network type
- Screenshot of console errors
- Exact error message shown

---

### "Connection Lost" During Transfer

**Symptoms:**
- File was transferring, then suddenly stopped
- "Connection Lost" error message appears

**Causes:**
- Network connectivity interrupted
- Browser tab crashed
- Device went to sleep
- Network switched (WiFi → cellular)

**Solutions:**

1. **Don't Close the Tab**
   - Keep QuickDrop tab open during transfers
   - Closing it terminates the connection

2. **Prevent Device Sleep**
   - On mobile: Disable auto-lock during transfer
   - On desktop: Keep monitor awake
   - Don't lock the device

3. **Stable Network**
   - Avoid switching networks mid-transfer
   - Stay on same WiFi for duration
   - Use 5GHz WiFi if 2.4GHz is unstable

4. **Restart and Retry**
   - Close both browser tabs
   - Start a new transfer with new room ID
   - Try smaller file first to test stability

5. **Check Device Storage**
   - Make sure device has enough storage space
   - Out of storage might cause interruption

---

### "Waiting to connect" then immediate error

**Symptoms:**
- Receiver joins room
- Immediately shows an error (not connection timeout)

**Possible Causes:**
- Room ID expired (> 1 hour old)
- Invalid room ID format
- Server-side error

**Solutions:**

1. **Use Fresh Room ID**
   - Don't wait >1 hour between generating and using room ID
   - Generate new QR code and retry

2. **Check Room ID Format**
   - Room IDs should be alphanumeric + `-_` only
   - Should be 1-64 characters
   - Does the room ID look normal? (no special chars?)

3. **Check Server Status**
   - Site unreachable? Server might be down
   - Try accessing homepage
   - [Check status here](https://quickdrop-share.adheesharavindu001.workers.dev)

---

## 📱 Mobile Issues

### QR Code Won't Scan

**Symptoms:**
- Camera app opens but doesn't recognize QR code
- "Not a valid QR code" error

**Solutions:**

1. **Clean Camera Lens**
   - Wipe your phone's camera lens (cloth/shirt)

2. **Better Lighting**
   - Ensure good lighting (not backlit)
   - Try indoors under lights

3. **Steady Hands**
   - Hold phone steady for 2-3 seconds
   - Let camera focus properly

4. **Try Different App**
   - Native camera app → try Google Lens
   - Or use QuickDrop's manual room ID entry

5. **Manual Entry**
   - Instead of scanning, copy room ID manually
   - Paste into QuickDrop's room ID field

---

### File Won't Download on Mobile

**Symptoms:**
- Transfer completes
- Download button clicked but nothing happens
- No file appears in Downloads

**Solutions:**

1. **Check Download Permissions**
   - Go to Settings → Browser → Permissions
   - Ensure "Download" permission is allowed

2. **Check Storage**
   - Mobile storage full? Free up space
   - Try downloading to different location

3. **Try Different Browser**
   - Safari → try Chrome, or vice versa
   - Some browsers have stricter restrictions

4. **Check Download Folder**
   - Downloads might be in a hidden folder
   - Check file manager: Files app (iOS) or Google Drive (Android)

---

## 🖥️ Desktop Issues

### File Transfer Very Slow

**Symptoms:**
- Transfer starts but progresses very slowly
- Percentage moves in single digits per minute

**Causes:**
- Slow internet connection
- WiFi signal weak
- Using TURN relay (slower than direct)
- Many devices on network (WiFi congestion)

**Solutions:**

1. **Check Internet Speed**
   - Visit [speedtest.net](https://speedtest.net)
   - Typical broadband should be 10+ Mbps upload

2. **Optimize WiFi**
   - Move closer to router
   - Reduce interference (other devices)
   - Try 5GHz band instead of 2.4GHz

3. **Use Wired Connection**
   - Ethernet is faster than WiFi
   - Connect via USB adapter if available

4. **Close Other Applications**
   - Stop large downloads in other tabs
   - Pause cloud sync (Google Drive, Dropbox, etc.)
   - Restart browser to free memory

5. **Try Direct Connection (Direct to Receiver's device)**
   - If on local network, use Local IP
   - Much faster than internet route

---

### Browser Crashes During Transfer

**Symptoms:**
- Browser tab/window closes unexpectedly
- "Browser crashed" message in DevTools

**Solutions:**

1. **Check Available Memory**
   - Large file more than device RAM?
   - Check Task Manager (Windows) / Activity Monitor (Mac)
   - Close other applications to free memory

2. **Update Browser**
   - Crashes often indicate old browser version
   - Update to latest version
   - Check: ⋮ → Help → About (Chrome)

3. **Clear Browser Cache**
   - Chrome: Ctrl+Shift+Delete → Clear browsing data
   - Firefox: Edit → Preferences → Privacy → Clear data
   - Try again

4. **Use Different Browser**
   - Try Chrome if using Firefox (or vice versa)
   - Each browser has different WebRTC implementations

5. **Restart Computer**
   - Sometimes helps with memory issues
   - Close all applications first

---

## 🔊 Error Messages

### "Payload too large"

**Message:** "Error: Payload too large"

**Cause:** Signal message exceeded 32KB limit

**Fix:** This is internal error. Report to [GitHub Issues](https://github.com/YOUR-USERNAME/QuickDrop/issues)

---

### "Invalid signal type"

**Message:** "Error: Invalid signal type"

**Cause:** WebRTC signal type unexpected

**Fix:** Close both tabs, start fresh. If persists, report to GitHub Issues.

---

### "Invalid room ID"

**Message:** "Error: Invalid room ID format"

**Cause:** Room ID contains invalid characters

**Solutions:**
- Room IDs must be alphanumeric + `-` and `_` only
- No spaces, special characters, emojis
- Check for typos when entering manually

---

### "Room doesn't exist" or "Room expired"

**Message:** "Error: Room doesn't exist" or timeout after joining

**Cause:** Room ID is invalid or > 1 hour old

**Fix:**
- Generate fresh room ID from sender
- Use within 1 hour of generation
- Don't share old room IDs

---

## 🎯 Performance Issues

### Transfer Speed Varies Wildly

**Symptoms:**
- Speed jumps between 1Mbps and 50Mbps
- Progress bar jerks instead of smooth

**Causes:**
- WiFi interference
- Network congestion
- TURN relay fallback

**Solutions:**

1. **Reduce WiFi Interference**
   - Move away from WiFi blocking objects (metal, water)
   - Try 5GHz band (less crowded, shorter range)
   - Reduce number of WiFi devices

2. **Use Ethernet (if possible)**
   - Wired connection more stable than wireless

3. **Transfer During Off-Peak**
   - Late night = less network congestion
   - Reduces competition for bandwidth

4. **Smaller Files First**
   - Test with 10MB file
   - Verify stable speed
   - Then attempt large transfer

---

## 🌐 Network Debugging

### Check WebRTC Connection Type

In browser console (`F12` → Console):

```javascript
// After connection established
// Check if direct connection or relay
// Look for: 'srflx' (STUN), 'prflx' (peer reflexive), 'relay' (TURN)
```

**Fastest to Slowest:**
1. `host` (local network) — Fastest
2. `srflx` (STUN) — Fast
3. `relay` (TURN) — Slower (fallback)

If seeing `relay`, your NAT prevents direct connection.

---

## 🚑 Emergency Help

**Still stuck?** Try:

1. **Check Status Page**
   - [quickdrop-share.adheesharavindu001.workers.dev](https://quickdrop-share.adheesharavindu001.workers.dev)
   - Verify site is online

2. **Search Existing Issues**
   - [GitHub Issues](https://github.com/YOUR-USERNAME/QuickDrop/issues)
   - Your problem might already have a solution

3. **Ask in Discussions**
   - [GitHub Discussions](https://github.com/YOUR-USERNAME/QuickDrop/discussions)
   - Community can help

4. **Report a New Issue**
   - [Create GitHub Issue](https://github.com/YOUR-USERNAME/QuickDrop/issues/new)
   - Include: browser, OS, error message, console logs

---

## 📝 Useful Information to Include When Getting Help

When posting for help, include:

```
Browser: Chrome 120.0 (example)
OS: Windows 11 / macOS 14 / Ubuntu 22.04
Network: WiFi / Ethernet / Mobile Hotspot
Error Message: [exact error shown]
Console Errors: [F12 → Console → any red errors]
File Size: 5MB / 100MB / etc
Connection Status: Connecting timeout / Lost mid-transfer / etc
```

---

**Can't find your issue?** Open a [GitHub Discussion](https://github.com/YOUR-USERNAME/QuickDrop/discussions) with:
- What you were doing (sending/receiving)
- What happened instead
- Steps to reproduce
- Any error messages

Happy troubleshooting! 🚀
