# Contributing to QuickDrop

Thank you for your interest in contributing to QuickDrop! We appreciate all contributions, whether it's code, documentation, bug reports, or feature suggestions.

## 🚀 Getting Started

1. **Fork the Repository**: Click the "Fork" button on GitHub
2. **Clone Your Fork**: `git clone https://github.com/YOUR-USERNAME/QuickDrop.git`
3. **Create a Feature Branch**: `git checkout -b feature/your-feature-name`
4. **Set Up Development Environment**: See [DEVELOPMENT.md](DEVELOPMENT.md)

## 📝 How to Contribute

### Reporting Bugs

Found a bug? Please report it by opening a GitHub Issue with:

- **Clear Title**: Concise description of the bug
- **Steps to Reproduce**: Detailed steps to replicate the issue
- **Expected Behavior**: What you expected to happen
- **Actual Behavior**: What actually happened
- **Screenshots/Video**: If applicable
- **Environment**: Browser, OS, and any relevant versions

### Suggesting Features

Have an idea? Open a GitHub Issue with:

- **Title**: Clear feature description
- **Use Case**: Why this feature would be useful
- **Proposed Behavior**: How the feature should work
- **Examples**: Any related ideas or implementations

### Submitting Code Changes

1. **Keep PRs Focused**: One feature or bug fix per PR
2. **Follow Code Style**: Use the existing code style in the project
3. **Test Your Changes**: Verify everything works before submitting
4. **Write Clear Commit Messages**: Use conventional commits format

   ```
   feat: add TURN server support
   fix: resolve QR code rendering on mobile
   docs: update security guidelines
   ```

5. **Update Documentation**: If your changes affect user-facing features, update README.md or create/update docs
6. **Add Comments**: Document complex logic with clear comments

### Code Style Guidelines

- **JavaScript**: Use vanilla JS (no framework dependencies)
- **HTML/CSS**: Keep markup semantic and styles organized
- **Naming**: Use camelCase for JS, kebab-case for CSS
- **Formatting**: 2-space indentation
- **Security**: Never log sensitive data; validate all inputs

### Security Considerations

- **Input Validation**: Always validate user inputs and WebSocket messages
- **Payload Limits**: Enforce size limits on data transfers
- **Headers**: Maintain security headers in Worker responses
- **Dependencies**: Keep dependencies minimal and audit for vulnerabilities
- **Reporting**: See [SECURITY.md](SECURITY.md) for vulnerability disclosure

## 🧪 Testing

- Test across multiple browsers (Chrome, Firefox, Safari, Edge)
- Test on both desktop and mobile devices
- Verify QR code generation and scanning
- Test P2P connections with varying file sizes
- Validate security headers are present (use browser DevTools)

## 📦 Deployment

Before deployment, ensure:

1. All tests pass
2. No console errors or warnings
3. Security headers are present
4. Code has been reviewed

See [DEVELOPMENT.md](DEVELOPMENT.md) for deployment instructions.

## 📋 Pull Request Process

1. **Create a PR** with a clear title and description
2. **Reference Issues**: Link related issues (e.g., `Fixes #42`)
3. **Address Feedback**: Respond to review comments promptly
4. **Keep PR Updated**: Rebase if the main branch changes
5. **One Approval**: At least one maintainer must approve before merge
6. **Pass All Checks**: CI/CD checks must pass

## 🤔 Review Process

- Code is reviewed for security, performance, and maintainability
- All feedback should be addressed before merge
- Constructive and respectful communication is expected

## 📚 Documentation

- Update README.md for user-facing changes
- Update docs/ for architecture or technical changes
- Add comments for complex logic
- Keep docs in sync with code changes

## ✅ Checklist Before Submitting a PR

- [ ] Code follows project style guidelines
- [ ] Comments added for complex logic
- [ ] No debug code or console.logs left in
- [ ] Tested on at least 2 browsers
- [ ] Security considerations addressed
- [ ] Documentation updated if needed
- [ ] Commit messages are clear
- [ ] PR description explains the change

## 🎓 Development Tips

- Use browser DevTools to debug P2P connections
- Check Wrangler logs for Worker errors: `npx wrangler tail`
- Test locally with `npx wrangler dev` before deploying
- Use `git diff` to review your changes before committing

## 📞 Questions?

- Check existing Issues and Discussions
- Read [DEVELOPMENT.md](DEVELOPMENT.md) for setup help
- Ask in a GitHub Discussion

## 🙏 Thank You

Your contributions make QuickDrop better. Thank you for helping!

---

**Code of Conduct**: All contributors must follow our [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
