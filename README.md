# QuickDrop

A fast, secure, peer-to-peer file and text sharing application. Share files and text instantly without any cloud storage or file size limits.

## ✨ Features

- **P2P Transfer**: Direct peer-to-peer connections using WebRTC—no servers involved
- **No Size Limits**: Share files of any size without server constraints
- **No Cloud Storage**: All data stays on your device; nothing is stored on servers
- **Privacy First**: End-to-end encrypted transfers; only you and the recipient have access
- **Simple QR Code Sharing**: Generate a QR code for easy sharing or copy a room ID
- **Text Sharing**: Share text snippets directly without file overhead
- **Cross-Device**: Works seamlessly across browsers and devices
- **Instant Setup**: No registration, no login—just open and share

## 📰 Blog

QuickDrop also includes a blog with step-by-step guides for sharing files in the browser.

- [Blog home](https://quickdrops.link/blog)
- [Snapdrop alternative](https://quickdrops.link/blog/snapdrop-alternative)
- [AirDrop for Windows](https://quickdrops.link/blog/airdrop-for-windows)
- [Send large files online for free](https://quickdrops.link/blog/send-large-files-online-free)
- [File sharing without login](https://quickdrops.link/blog/file-sharing-without-login)
- [Send files without internet](https://quickdrops.link/blog/send-files-without-internet)
- [QR code file transfer](https://quickdrops.link/blog/qr-code-file-transfer)

## 🚀 Quick Start

1. **Share a File or Text**: Open [quickdrop-share.adheesharavindu001.workers.dev](https://quickdrop-share.adheesharavindu001.workers.dev)
2. **Select Send or Receive**: Choose whether you're sending or receiving
3. **Generate or Scan QR Code**: Share the QR code or room ID with the recipient
4. **Transfer Completes**: Once connected, the transfer starts automatically

## 🏗️ Architecture

### Frontend
- **Technology**: HTML5 + CSS3 + Vanilla JavaScript
- **Dependencies**: QRCode.js (CDN)
- **Deployment**: Cloudflare Workers (static assets)

### Backend
- **Technology**: Cloudflare Workers + Durable Objects
- **Protocol**: WebSocket for signaling, WebRTC for data transfer
- **Security**: Strict CSP, HSTS, input validation, payload limits

### Security Features
- Content Security Policy (CSP) with strict allow-list
- HTTP Strict Transport Security (HSTS)
- X-Frame-Options to prevent clickjacking
- X-Content-Type-Options MIME type sniffing prevention
- Referrer-Policy for privacy
- Permissions-Policy limiting access to sensitive APIs
- Room ID validation with regex pattern
- WebSocket payload size limits (32KB)
- Signal type whitelist (offer, answer, ice-candidate only)

## 📋 Prerequisites

- **For Development**: Node.js 16+, Wrangler CLI
- **For Usage**: Modern browser with WebRTC support
- **For Deployment**: Cloudflare Workers account

## 🛠️ Development Setup

See [DEVELOPMENT.md](DEVELOPMENT.md) for detailed setup instructions, environment configuration, and deployment steps.

### Quick Development Start

```bash
# Install dependencies
npm install

# Start local development (Worker)
npx wrangler dev

# Deploy to Cloudflare Workers
npx wrangler deploy
```

## 📁 Project Structure

```
QuickDrop/
├── frontend/
│   ├── index.html          # Single-page application
│   ├── blog.html          # Blog landing page
│   └── blog-*.html        # Standalone blog article pages
├── worker/
│   ├── src/
│   │   └── index.js        # Cloudflare Worker entry point
│   └── wrangler.toml       # Worker configuration
├── docs/
│   ├── ARCHITECTURE.md     # Detailed system design
│   └── SECURITY.md         # Security documentation
├── README.md               # This file
├── CONTRIBUTING.md         # Contribution guidelines
├── CODE_OF_CONDUCT.md      # Community guidelines
└── LICENSE                 # MIT License
```

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to get started, reporting bugs, and submitting pull requests.

## 🔒 Security

If you discover a security vulnerability, please see [SECURITY.md](SECURITY.md) for responsible disclosure instructions.

## 📄 License

This project is licensed under the MIT License—see [LICENSE](LICENSE) for details.

## 💬 Community

- **Code of Conduct**: Please read [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
- **Issues**: Report bugs or request features on GitHub Issues
- **Discussions**: Share ideas and questions in GitHub Discussions

## 🎯 Roadmap

- TURN server support for NAT traversal
- Browser extension for quick access
- Desktop application (Electron)
- Mobile app (React Native)
- Selective file transfer (pause/resume)
- Compression support

## 💡 How It Works

1. **Connection Initiation**: Sender generates a unique room ID and shares it via QR code or direct copy
2. **Signaling**: Recipient joins the room through WebSocket connection to Cloudflare Durable Object
3. **P2P Handshake**: ICE candidates are exchanged via the server; a direct WebRTC connection is established
4. **Data Transfer**: Once connected, file or text transfers directly between peers via Data Channel
5. **Completion**: Transfer completes, and both parties can optionally start another transfer

## 🙋 FAQ

**Q: Is my data secure?**  
A: Yes. All transfers are P2P with no server-side storage. Data is end-to-end encrypted via WebRTC.

**Q: What happens if the connection drops?**  
A: The connection is reestablished automatically. For large files, you can pause and resume.

**Q: Can I use this offline?**  
A: No, you need internet to establish the P2P connection, but once connected, transfers are peer-to-peer.

**Q: What's the file size limit?**  
A: There's no hard limit. Limited only by device memory and bandwidth.

## 📞 Support

For questions or issues, please open a GitHub Issue or start a Discussion.

---

Made with ❤️ for fast and private file sharing.
