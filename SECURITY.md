# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.x.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability in Perfect Zenkai, please report it by:

1. **DO NOT** create a public GitHub issue
2. Email the maintainers directly (contact information will be added when project is published)
3. Include detailed information about the vulnerability
4. Allow reasonable time for the issue to be addressed before public disclosure

## Security Measures

### Development Security
- All dependencies are regularly audited using `npm audit`
- ESLint security rules are enforced
- TypeScript strict mode is enabled
- No sensitive data is committed to the repository

### Build Security
- Build artifacts are excluded from version control
- Service worker is generated with secure defaults
- CSP headers are configured for production builds

### Runtime Security
- No eval() or similar dynamic code execution
- Input validation on all user inputs
- Secure storage practices for local data
- HTTPS-only in production

## Security Checklist

- [x] .gitignore configured to exclude sensitive files
- [x] No hardcoded secrets or API keys
- [x] Dependencies audited for vulnerabilities
- [x] TypeScript strict mode enabled
- [x] ESLint security rules configured
- [x] Build artifacts excluded from repository
- [ ] CSP headers configured (production)
- [ ] HTTPS enforced (production)
- [ ] Security headers configured (production)

## Known Security Considerations

### Development Dependencies
Some development dependencies may have security advisories that don't affect production builds:
- Lighthouse CLI tools (used only for testing)
- Vite/esbuild (development server vulnerabilities don't affect production builds)

These are acceptable for development but should be monitored for updates.

### Production Deployment
When deploying to production:
1. Use HTTPS only
2. Configure proper CSP headers
3. Enable security headers (HSTS, X-Frame-Options, etc.)
4. Regularly update dependencies
5. Monitor for security advisories

## Security Updates

Security updates will be prioritized and released as patch versions. Subscribe to repository notifications to stay informed about security updates. 