# Local Authentication System

Perfect Zenkai uses a simple but secure local authentication system designed for offline-first functionality and user privacy.

## 🔐 Overview

The authentication system provides:
- **Username/Password** authentication
- **Secure password hashing** using browser's built-in crypto APIs
- **User data isolation** with separate databases per user
- **Session management** with automatic expiry
- **Offline-first** design with no external dependencies

## 🏗️ Architecture

```
Authentication Flow:
1. User registers with username, email, password
2. Password is hashed using secure algorithms
3. User data stored in IndexedDB with encryption
4. User-specific databases created for data isolation
5. Session tokens manage authentication state
6. Automatic session cleanup on logout/expiry
```

## 🔧 Technical Implementation

### Password Security
- Passwords are hashed using `crypto.subtle.digest()` with SHA-256
- Salt generation for enhanced security
- Minimum 6 character password requirement
- No plain text passwords stored

### Data Isolation
- Each user gets their own IndexedDB databases
- Database names include sanitized user IDs
- Complete data separation between users
- Automatic cleanup on logout

### Session Management
- 7-day session expiry by default
- Automatic cleanup of expired sessions
- Secure session token generation
- Browser storage with automatic persistence

## 🚀 Quick Start

### Registration
```typescript
// User registration
await authStore.register({
  username: 'myusername',
  email: 'user@example.com',
  password: 'securepassword',
  name: 'John Doe' // optional
})
```

### Login
```typescript
// User login
await authStore.login({
  username: 'myusername',
  password: 'securepassword'
})
```

### Logout
```typescript
// User logout (cleans up all data)
await authStore.logout()
```

## 📊 User Data Structure

```typescript
interface User {
  id: string           // Unique user identifier
  username: string     // User's chosen username
  email: string        // User's email address
  name?: string        // Optional display name
  createdAt: string    // Account creation timestamp
}
```

## 🛡️ Security Features

### Data Protection
- **Local Storage Only**: All data stays on the user's device
- **User Isolation**: Complete separation between user accounts
- **Secure Hashing**: Industry-standard password protection
- **Session Security**: Automatic session management and cleanup

### Privacy Benefits
- **No Cloud Dependency**: Works completely offline
- **No Data Mining**: User data never leaves their device
- **No Tracking**: No external authentication providers
- **Complete Control**: Users own their data entirely

## 🔧 Configuration

The authentication system requires no external configuration:

- ✅ **No API keys** needed
- ✅ **No server setup** required
- ✅ **No external services** dependencies
- ✅ **Works offline** immediately

## 🧪 Testing

### Development Testing
```bash
# Start the development server
npm run dev

# Navigate to login page
# Try creating an account
# Test login/logout functionality
```

### User Account Testing
1. Register a new account with valid credentials
2. Logout and login again to test persistence
3. Try invalid credentials to test error handling
4. Test password visibility toggle
5. Verify user data isolation (multiple accounts)

## 🚦 Error Handling

Common error scenarios and their handling:

| Error | Cause | Resolution |
|-------|-------|------------|
| Username already exists | Duplicate registration | Choose different username |
| Invalid credentials | Wrong username/password | Verify credentials |
| Password too short | Less than 6 characters | Use longer password |
| Session expired | Old session token | Login again |

## 📱 Mobile Support

The authentication system is fully mobile-compatible:

- **Touch-friendly** input fields
- **Mobile keyboards** optimized for username/email
- **PWA integration** for app-like experience
- **Offline functionality** on mobile devices

## 🔄 Migration from Previous Systems

If migrating from Google OAuth or other systems:

1. **Data Export**: Use existing data export functionality
2. **New Account**: Register with new local authentication
3. **Data Import**: Re-import data to new account
4. **Cleanup**: Remove old authentication configuration

## 🛠️ Troubleshooting

### Common Issues

**Login not working**
- Check username and password spelling
- Ensure account was created successfully
- Try refreshing the page

**Registration failing**
- Ensure all required fields are filled
- Check password meets minimum requirements
- Verify email format is valid

**Data not persisting**
- Check browser storage permissions
- Ensure browser supports IndexedDB
- Try clearing browser cache and re-registering

### Browser Support

The authentication system works on:
- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+

## 🔮 Future Enhancements

Planned improvements:
- **Multi-factor authentication** options
- **Biometric authentication** (fingerprint/face)
- **Account recovery** mechanisms
- **Advanced password policies**
- **Account activity logs**

## 🤝 Contributing

To contribute to the authentication system:

1. Review the auth module structure in `src/modules/auth/`
2. Follow security best practices
3. Test thoroughly with multiple user accounts
4. Document any new features
5. Ensure offline functionality is maintained

## 📄 License

The authentication system is part of Perfect Zenkai and follows the same MIT license. 