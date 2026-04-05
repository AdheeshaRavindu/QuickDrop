# Security Policy

## Reporting Security Vulnerabilities

**Do not create public issues for security vulnerabilities.** Instead, please follow responsible disclosure:

1. **Email**: Send details to the project maintainers (see repository for contact)
2. **Be Specific**: Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)
3. **Timeline**: We aim to acknowledge reports within 48 hours and provide updates regularly

## Security Commitments

QuickDrop is built with security-first principles:

### ✅ What We Protect

- **User Privacy**: P2P transfers mean no server-side data storage
- **Data Integrity**: End-to-end encryption via WebRTC
- **Transport Security**: HTTPS only; HSTS preload list ready
- **Input Validation**: All user inputs and WebSocket messages validated
- **API Hardening**: Strict Content Security Policy, X-Frame-Options, etc.

### 🔒 Security Features

**Frontend:**
- Vanilla JavaScript (minimal dependencies reduce attack surface)
- Content-Security-Policy with strict allow-list
- No sensitive data in local storage
- Input sanitization for QR codes and room IDs

**Backend (Cloudflare Workers):**
- Room ID validation (regex pattern: `/^[A-Za-z0-9_-]{1,64}$/`)
- WebSocket payload size limits (32KB max)
- Signal type whitelist (offer, answer, ice-candidate only)
- HTTP Security Headers:
  - Content-Security-Policy (CSP)
  - HTTP Strict Transport Security (HSTS)
  - X-Frame-Options: DENY
  - X-Content-Type-Options: nosniff
  - Referrer-Policy: strict-origin-when-cross-origin
  - Permissions-Policy (disables sensitive APIs)
  - Cross-Origin-Opener-Policy: same-origin
  - Cross-Origin-Resource-Policy: same-origin

## Known Limitations

- Browser WebRTC support required (no support for older browsers)
- NAT traversal depends on STUN/TURN availability
- Local network transfers subject to firewall rules
- Large file transfers limited by available memory

## Dependencies

We keep dependencies minimal to reduce attack surface:

- **QRCode.js**: QR code generation (CDN, no npm)
- **Google Fonts**: Typography only
- **Cloudflare Workers Runtime**: First-party security

All dependencies are reviewed for security vulnerabilities.

## Best Practices for Users

- Only scan QR codes from trusted sources
- Close transfers when complete
- Don't share room IDs over insecure channels
- Use HTTPS when accessing the application

## Incident Response

If a vulnerability is discovered and exploited:

1. We will acknowledge the incident
2. Assess impact on users
3. Deploy patches immediately
4. Notify users of the vulnerability and mitigation steps
5. Post-mortem review to prevent recurrence

## Compliance

QuickDrop follows:

- OWASP Top 10 prevention guidelines
- Web security best practices (MDN, IETF)
- Privacy principles (P2P = no data retention)

## Security Advisories

Security advisories will be published in:

- GitHub Security Advisories
- Release notes

Subscribe to GitHub releases for notifications.

## Contact

For security inquiries, please reach out to the project maintainers.

---

**Your security concerns help us improve. Thank you for responsible disclosure.**
