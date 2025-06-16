# 📱 Mobile Testing Guide

## 🚨 **Current Issue**
When accessing your app via network IP (like `https://10.0.0.9:5173`) on mobile, authentication doesn't work because:
1. Supabase requires HTTPS
2. Redirect URLs need to be configured
3. Network IPs aren't in Supabase's allowed list

## ✅ **Quick Solutions**

### **Option 1: Use ngrok (Easiest)**

1. **Start your app with ngrok tunnel:**
   ```bash
   # Terminal 1: Start your app
   npm run dev
   
   # Terminal 2: Create HTTPS tunnel
   npm run dev:tunnel
   ```

2. **Get your HTTPS URL:**
   - ngrok will show something like: `https://abc123.ngrok.io`
   - Use this URL on your mobile device
   - ✅ **Authentication will work!**

### **Option 2: Configure Supabase (Permanent Fix)**

1. **Go to Supabase Dashboard:**
   - Visit [supabase.com](https://supabase.com)
   - Open your project: `kslvxxoykdkstnkjgpnd`

2. **Update Authentication Settings:**
   - Go to **Authentication** → **URL Configuration**
   - Add to **Site URL**:
     ```
     https://localhost:5173
     https://10.0.0.9:5173
     ```
   
   - Add to **Redirect URLs**:
     ```
     https://localhost:5173/**
     https://10.0.0.9:5173/**
     https://192.168.*.*:5173/**
     ```

3. **Save and test** - Mobile authentication should now work!

### **Option 3: Use Local Network Name**

Instead of IP address, try using your computer's network name:
```
https://YOUR-COMPUTER-NAME.local:5173
```

## 🔧 **Testing Commands**

```bash
# Start app normally
npm run dev

# Start app with ngrok tunnel (for mobile)
npm run dev:mobile

# Just create tunnel (if app already running)
npm run dev:tunnel

# Test production build
npm run build && npm run preview
```

## 📱 **Mobile Testing Checklist**

- [ ] **Install Prompt** - Appears after 30 seconds
- [ ] **Authentication** - Login/signup works
- [ ] **Offline Mode** - Works without internet after first visit
- [ ] **Touch Interactions** - All buttons respond properly
- [ ] **Responsive Design** - Looks good on mobile
- [ ] **PWA Features** - Can be installed to home screen

## 🌐 **Network Access URLs**

Your app is available at:
- **Local:** `https://localhost:5173`
- **Network:** `https://10.0.0.9:5173` (may need Supabase config)
- **ngrok:** `https://random.ngrok.io` (always works)

## 🔒 **Security Notes**

- ngrok URLs are temporary and change each time
- For permanent mobile testing, configure Supabase URLs
- Production deployment won't have these issues

## 🚀 **Ready for Production?**

Once mobile testing works, deploy with:
```bash
npm run deploy:vercel
```

Your deployed app will work perfectly on all devices! 🎉 