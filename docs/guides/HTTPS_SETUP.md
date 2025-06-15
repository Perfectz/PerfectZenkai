# HTTPS Setup for PWA Development

This project is configured to run with HTTPS for proper PWA functionality on your local network.

## 🔧 Official Vite HTTPS Solution

The project uses the **official** `@vitejs/plugin-basic-ssl` plugin recommended by Vite for HTTPS in development.

### 1. Plugin Configuration
- ✅ `@vitejs/plugin-basic-ssl` installed and configured (official Vite plugin)
- ✅ Automatic self-signed certificate generation
- ✅ Works with all network interfaces including LAN access
- ✅ Certificates automatically include:
  - `localhost`
  - `127.0.0.1`
  - Your LAN IP addresses (including `10.0.0.9`)
  - `::1` (IPv6 localhost)

### 2. Vite Configuration
- ✅ Plugin automatically enables HTTPS
- ✅ Host set to `0.0.0.0` for LAN access
- ✅ PWA manifest updated with proper start_url

### 3. PWA Manifest
- ✅ Manifest linked in HTML
- ✅ Icons configured (192x192 and 512x512)
- ✅ Start URL includes `?source=pwa` parameter
- ✅ All required PWA fields present

## 🚀 Usage

### Start HTTPS Development Server
```bash
npm run dev
# or explicitly with HTTPS
npm run dev:https
```

### Access URLs
- **Local HTTPS:** `https://localhost:5173/`
- **LAN HTTPS:** `https://10.0.0.9:5173/`

## 📱 PWA Installation

1. Open `https://10.0.0.9:5173/` on any device on your network
2. Accept the certificate warning (one-time per device)
3. Look for the **Install** button in:
   - Chrome: Address bar (desktop) or menu (mobile)
   - Edge: Address bar or three-dot menu
   - Safari: Share menu → "Add to Home Screen"

## 🔍 Troubleshooting

### PWA Not Installable?
Run Lighthouse PWA audit:
1. Open Chrome DevTools
2. Go to Lighthouse tab
3. Select "Progressive Web App"
4. Click "Generate report"

### Certificate Issues?
The official plugin handles certificates automatically:
```bash
# The @vitejs/plugin-basic-ssl plugin automatically:
# 1. Generates self-signed certificates
# 2. Configures Vite to use HTTPS
# 3. Works with all network interfaces

# No manual certificate management needed!
# The plugin creates trusted certificates for development use.
```

### Icons Not Loading?
Check that these files exist:
- `public/icons/logo192.png`
- `public/icons/logo512.png`
- `public/manifest.json`

## 📋 PWA Checklist

- ✅ HTTPS enabled
- ✅ Service Worker registered
- ✅ Web App Manifest present
- ✅ Icons (192x192 and 512x512)
- ✅ Start URL configured
- ✅ Display mode: standalone
- ✅ Theme colors set

## 🌐 Network Access

Your PWA is now accessible to any device on your network at:
**`https://10.0.0.9:5173/`**

Devices will need to accept the self-signed certificate once, then the PWA will be fully installable!

## 🔒 Security Note

The SSL certificates are self-signed and only valid for development. For production, use proper SSL certificates from a trusted CA. 