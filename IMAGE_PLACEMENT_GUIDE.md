# Perfect Zenkai - Cyber-Ninja Image Placement Guide

Quick reference for where to put your cyber-themed generated images:

## 🎯 App Icons & PWA

- **App Icon (192x192)** → `public/icons/icon-192.png`
- **App Icon (512x512)** → `public/icons/icon-512.png`
- **Maskable Icons** → `public/icons/icon-maskable-192.png` & `icon-maskable-512.png`
- **Favicon** → `public/icons/favicon.ico`
- **Apple Touch Icon** → `public/icons/apple-touch-icon.png`

## 🧭 Navigation Icons (Cyber-Themed)

- **Cyber Weight Scale Icon** → `src/assets/icons/navigation/weight.svg`
- **Cyber Quest/Tasks Icon** → `src/assets/icons/navigation/tasks.svg`
- **Cyber Command Center Icon** → `src/assets/icons/navigation/dashboard.svg`

## 📊 Dashboard Card Icons (Cyber-Styled)

- **Cyber Weight Card Icon** → `src/assets/icons/dashboard/weight-card.svg`
- **Cyber Quest Card Icon** → `src/assets/icons/dashboard/tasks-card.svg`
- **Cyber Momentum/Streak Icon** → `src/assets/icons/dashboard/streak-card.svg`

## 🎨 Cyber-Ninja Branding

- **Cyber Logo (Press Start 2P)** → `src/assets/branding/logo.svg`
- **Cyber Logo (White + Glow)** → `src/assets/branding/logo-white.svg`
- **Cyber Wordmark** → `src/assets/branding/wordmark.svg`
- **Cyber Wordmark (Neon)** → `src/assets/branding/wordmark-white.svg`

## 🖼️ Cyber Empty State Illustrations

- **No Weight Data (Cyber Scale)** → `src/assets/illustrations/empty-states/no-weight-data.svg`
- **No Active Quests** → `src/assets/illustrations/empty-states/no-todos.svg`

## 🚀 Cyber Onboarding Graphics

- **Cyber Install Prompt** → `src/assets/illustrations/onboarding/install-prompt.svg`
- **Ninja Transformation Welcome** → `src/assets/illustrations/onboarding/welcome.svg`

## 🔔 Cyber Notifications

- **Cyber Reminder (24px)** → `src/assets/icons/notifications/reminder-24.png`
- **Cyber Reminder (48px)** → `src/assets/icons/notifications/reminder-48.png`

## 🎭 Cyber Backgrounds & Patterns

- **Cyber Grid Pattern** → `src/assets/illustrations/backgrounds/cyber-grid-pattern.svg`
- **Diagonal Rain Overlay** → `src/assets/illustrations/backgrounds/diagonal-rain-overlay.svg`

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

## 📝 Cyber File Format Recommendations

- **Icons**: SVG with glow effects (scalable, neon styling)
- **PWA Icons**: PNG (required by PWA spec, with cyber styling)
- **Illustrations**: SVG preferred for neon effects, PNG for complex cyber art
- **Patterns**: SVG for seamless tiling and glow effects
- **Backgrounds**: SVG for scalable cyber patterns

## 🎨 Cyber Color Palette

- **Ki-Green**: #22FFB7 (primary CTA, success, active states)
- **Hyper-Magenta**: #FF2EEA (accent, FAB, level badges)
- **Plasma-Cyan**: #1BE7FF (secondary actions, links, gradients)
- **Dark Navy**: #111827 (backgrounds, containers)
- **White**: #FFFFFF (primary text, icons)
