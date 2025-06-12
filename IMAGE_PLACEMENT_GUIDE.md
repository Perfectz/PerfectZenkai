# Perfect Zenkai - Image Placement Guide

Quick reference for where to put your generated images:

## 🎯 App Icons & PWA
- **App Icon (192x192)** → `public/icons/icon-192.png`
- **App Icon (512x512)** → `public/icons/icon-512.png`
- **Maskable Icons** → `public/icons/icon-maskable-192.png` & `icon-maskable-512.png`
- **Favicon** → `public/icons/favicon.ico`
- **Apple Touch Icon** → `public/icons/apple-touch-icon.png`

## 🧭 Navigation Icons
- **Weight Scale Icon** → `src/assets/icons/navigation/weight.svg`
- **Tasks/Checklist Icon** → `src/assets/icons/navigation/tasks.svg`
- **Dashboard/Home Icon** → `src/assets/icons/navigation/dashboard.svg`

## 📊 Dashboard Card Icons
- **Weight Card Icon** → `src/assets/icons/dashboard/weight-card.svg`
- **Tasks Card Icon** → `src/assets/icons/dashboard/tasks-card.svg`
- **Streak Card Icon** → `src/assets/icons/dashboard/streak-card.svg`

## 🎨 Branding
- **Main Logo** → `src/assets/branding/logo.svg`
- **Logo (White Version)** → `src/assets/branding/logo-white.svg`
- **Wordmark** → `src/assets/branding/wordmark.svg`
- **Wordmark (White)** → `src/assets/branding/wordmark-white.svg`

## 🖼️ Empty State Illustrations
- **No Weight Data** → `src/assets/illustrations/empty-states/no-weight-data.svg`
- **No Todos** → `src/assets/illustrations/empty-states/no-todos.svg`

## 🚀 Onboarding Graphics
- **Install Prompt** → `src/assets/illustrations/onboarding/install-prompt.svg`
- **Welcome Screen** → `src/assets/illustrations/onboarding/welcome.svg`

## 🔔 Notifications
- **Push Reminder (24px)** → `src/assets/icons/notifications/reminder-24.png`
- **Push Reminder (48px)** → `src/assets/icons/notifications/reminder-48.png`

## 🎭 Backgrounds & Patterns
- **Subtle Pattern** → `src/assets/illustrations/backgrounds/subtle-pattern.svg`
- **Progress Background** → `src/assets/charts/progress-bg.svg`

## 📁 Module-Specific (Optional)
If you have module-specific graphics:
- **Weight Module** → `src/modules/weight/assets/`
- **Tasks Module** → `src/modules/tasks/assets/`
- **Dashboard Module** → `src/modules/dashboard/assets/`

---

## 🔧 After Adding Images

1. **SVG Icons**: Will be auto-imported via the index.ts files
2. **PWA Icons**: Update `public/manifest.json` if needed
3. **Test**: Run `pnpm dev` to ensure no import errors

## 📝 File Format Recommendations
- **Icons**: SVG (scalable, small file size)
- **PWA Icons**: PNG (required by PWA spec)
- **Illustrations**: SVG preferred, PNG if complex
- **Photos**: WebP or PNG 