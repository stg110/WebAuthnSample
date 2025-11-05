# WebAuthn Authentication Sample

This project demonstrates WebAuthn authentication with JWT token generation and Office HRD integration for collecting User Principal Names (UPN).

## Features

- **WebAuthn Authentication**: Uses platform authenticators (biometrics, security keys)
- **JWT Token Generation**: Displays JWT tokens after successful authentication
- **Office HRD Integration**: Redirects to Office 365/Azure AD for UPN collection when no passkey is available
- **Single HTML Page**: Complete implementation in one self-contained file

## Setup

### Prerequisites

1. **HTTPS Required**: WebAuthn requires HTTPS in production. For local testing:
   - Use `localhost` (HTTP is allowed for localhost)
   - Or set up a local HTTPS server

2. **Azure AD Application** (for Office HRD integration):
   - Register an application in Azure AD
   - Note the Client ID
   - Configure redirect URI to your application URL

### Running Locally

#### Option 1: Simple HTTP Server (localhost only)
```powershell
# Using Python (if installed)
python -m http.server 8000

# Using Node.js (if installed)
npx http-server

# Using PowerShell (Windows 10+)
cd WebAuthnSample
python -m http.server 8000
```

Then open: `http://localhost:8000`

#### Option 2: HTTPS Server for Testing
```powershell
# Using Node.js with HTTPS
npx http-server -S -C cert.pem -K key.pem

# Or use IIS Express (if available)
# Configure IIS Express to serve the directory
```

### Configuration

1. Open `index.html` in your browser
2. Configure the following in the Configuration section:
   - **Relying Party ID**: Use `localhost` for local testing, or your domain
   - **Office HRD Service URL**: Azure AD authorization endpoint (pre-filled)
   - **Client ID**: Your Azure AD application Client ID

## Usage

### Authentication Flow

1. **Check WebAuthn Support**: Verify browser compatibility
2. **Register Credential**: Create a new passkey/biometric credential
3. **Authenticate**: Use the registered credential to authenticate
4. **View JWT Token**: See the generated JWT token after successful authentication

### Fallback Flow (No Passkey)

1. If no passkey is registered or authentication fails
2. The application will prompt to redirect to Office HRD
3. User will authenticate with Office 365/Azure AD
4. UPN is collected and can be used for credential registration

## Project Structure

```
WebAuthnSample/
├── index.html          # Complete application (HTML + CSS + JavaScript)
├── README.md           # This file
└── server.js           # Optional: Simple HTTPS server
```

## Technical Details

### WebAuthn Implementation

- **Algorithms Supported**: ES256 (-7) and RS256 (-257)
- **Authenticator Selection**: Platform authenticators preferred
- **User Verification**: Preferred (uses biometrics when available)
- **Resident Keys**: Not required (server-side credential storage)

### JWT Token Structure

The generated JWT includes:
- **Header**: Algorithm and key ID
- **Payload**: User information, authentication method, credential details
- **Signature**: Mock signature (in production, use proper cryptographic signing)

### Security Considerations

⚠️ **Important**: This is a sample implementation for demonstration purposes.

**For Production Use:**
- Implement proper JWT signing with private keys
- Add server-side credential verification
- Use secure storage for credentials
- Implement proper error handling and logging
- Add rate limiting and security headers
- Validate all client-side data on the server

## Browser Compatibility

- **Chrome**: Full support
- **Firefox**: Full support
- **Safari**: iOS 14+, macOS with Touch ID
- **Edge**: Full support

## Troubleshooting

### Common Issues

1. **"WebAuthn not supported"**
   - Use a supported browser
   - Ensure HTTPS (or localhost)

2. **Registration/Authentication fails**
   - Check if biometric/security key is set up
   - Try different authenticator options
   - Check browser developer console for detailed errors

3. **Office HRD redirect fails**
   - Verify Azure AD Client ID
   - Check redirect URI configuration
   - Ensure proper OAuth 2.0 setup

### Debug Mode

Open browser developer tools to see detailed console logs for troubleshooting.

## License

This project is for educational and demonstration purposes.