# Perfect Zenkai - Image Generation Checklist

Track your progress generating and editing images for the Perfect Zenkai app.

## 🎯 Priority 1: Essential Images (Generate First)

### App Icons & PWA
- [ ] **Main App Icon** (1024x1024) → `public/icons/icon-512.png` & `icon-192.png`
- [ ] **Maskable Icons** → `public/icons/icon-maskable-512.png` & `icon-maskable-192.png`
- [ ] **Favicon** → `public/icons/favicon.ico`
- [ ] **Apple Touch Icon** → `public/icons/apple-touch-icon.png`

### Navigation Icons (Bottom Bar)
- [ ] **Weight Scale Icon** → `src/assets/icons/navigation/weight.svg`
- [ ] **Tasks/Checklist Icon** → `src/assets/icons/navigation/tasks.svg`
- [ ] **Dashboard/Home Icon** → `src/assets/icons/navigation/dashboard.svg`

### Empty State Illustrations
- [ ] **No Weight Data** → `src/assets/illustrations/empty-states/no-weight-data.svg`
- [ ] **No Todos/Tasks** → `src/assets/illustrations/empty-states/no-todos.svg`

---

## 🎨 Priority 2: Dashboard & Branding

### Dashboard Card Icons
- [ ] **Weight Card Icon** → `src/assets/icons/dashboard/weight-card.svg`
- [ ] **Tasks Card Icon** → `src/assets/icons/dashboard/tasks-card.svg`
- [ ] **Streak Card Icon** → `src/assets/icons/dashboard/streak-card.svg`

### Branding Elements
- [ ] **Main Logo** → `src/assets/branding/logo.svg`
- [ ] **Logo (White Version)** → `src/assets/branding/logo-white.svg`
- [ ] **Wordmark** → `src/assets/branding/wordmark.svg`
- [ ] **Wordmark (White)** → `src/assets/branding/wordmark-white.svg`

---

## 🚀 Priority 3: Enhanced Experience

### Onboarding Graphics
- [ ] **Install Prompt** → `src/assets/illustrations/onboarding/install-prompt.svg`
- [ ] **Welcome Screen** → `src/assets/illustrations/onboarding/welcome.svg`

### Notification Icons
- [ ] **Push Reminder (24px)** → `src/assets/icons/notifications/reminder-24.png`
- [ ] **Push Reminder (48px)** → `src/assets/icons/notifications/reminder-48.png`

### Background Elements
- [ ] **Subtle Pattern** → `src/assets/illustrations/backgrounds/subtle-pattern.svg`
- [ ] **Progress Background** → `src/assets/charts/progress-bg.svg`

---

## ✅ Post-Generation Tasks

### Photoshop Editing
- [ ] All icons have consistent stroke weights (2px)
- [ ] All images use correct color palette
- [ ] SVG files are properly vectorized
- [ ] PNG files are optimized for web
- [ ] Multiple sizes created where needed
- [ ] Transparent backgrounds applied correctly

### Integration Testing
- [ ] All images placed in correct folders
- [ ] No import errors when running `pnpm dev`
- [ ] Images display correctly on mobile devices
- [ ] Dark theme compatibility verified
- [ ] PWA installation works with icons
- [ ] Notification icons display properly

### Quality Assurance
- [ ] All images follow brand guidelines
- [ ] Consistent visual style across all assets
- [ ] Proper file naming conventions used
- [ ] File sizes optimized for performance
- [ ] Cross-platform compatibility verified

---

## 📝 Notes & Iterations

**Generation Date**: ___________

**AI Tool Used**: ___________

**Issues Found**:
- 
- 
- 

**Improvements Needed**:
- 
- 
- 

**Next Steps**:
- 
- 
- 

---

## 🎯 Quick Start Workflow

1. **Generate Priority 1 images** using the prompts in `IMAGE_GENERATION_PROMPTS.md`
2. **Edit in Photoshop** following the guidelines
3. **Place in folders** using `IMAGE_PLACEMENT_GUIDE.md`
4. **Test integration** by running `pnpm dev`
5. **Check on mobile** device for real-world testing
6. **Iterate** based on results

**Goal**: Complete Priority 1 images first, then move to Priority 2 and 3 as you implement each MVP milestone. 