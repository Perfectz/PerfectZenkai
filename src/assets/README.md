# Perfect Zenkai Assets

This folder contains all image assets for the Perfect Zenkai app, organized by type and usage.

## Folder Structure

```
src/assets/
├── icons/
│   ├── app/                    # App icons (internal use)
│   ├── navigation/             # Bottom navigation icons
│   ├── dashboard/              # Dashboard card icons
│   └── notifications/          # Push notification icons
├── illustrations/
│   ├── empty-states/           # Empty state graphics
│   ├── onboarding/             # Install prompts, welcome screens
│   └── backgrounds/            # Subtle patterns, textures
├── branding/                   # Logos, wordmarks
└── charts/                     # Chart backgrounds, progress graphics
```

## Usage Examples

### Navigation Icons

```typescript
import { WeightIcon, TasksIcon, DashboardIcon } from '@/assets/icons/navigation';

<WeightIcon className="w-6 h-6 text-primary" />
```

### Dashboard Card Icons

```typescript
import { WeightCardIcon } from '@/assets/icons/dashboard';

<WeightCardIcon className="w-8 h-8 text-muted-foreground" />
```

### Empty State Illustrations

```typescript
import { NoWeightData } from '@/assets/illustrations/empty-states';

<NoWeightData className="w-32 h-32 opacity-60" />
```

## File Naming Conventions

- **Icons**: `kebab-case.svg` (e.g., `weight-card.svg`)
- **Illustrations**: `descriptive-name.svg` (e.g., `no-weight-data.svg`)
- **Branding**: `logo.svg`, `wordmark.svg`, etc.

## Import Methods

### SVG as React Component

```typescript
import Icon from './icon.svg?react'
```

### SVG as URL String

```typescript
import iconUrl from './icon.svg'
```

## PWA Icons

PWA icons are stored in `public/icons/` and referenced in `manifest.json`:

- `icon-192.png` - Standard app icon
- `icon-512.png` - Large app icon
- `icon-maskable-192.png` - Maskable icon (safe area)
- `icon-maskable-512.png` - Large maskable icon
- `apple-touch-icon.png` - iOS home screen icon
- `favicon.ico` - Browser favicon

## Module-Specific Assets

Each module can have its own assets folder:

```
src/modules/weight/assets/
src/modules/tasks/assets/
src/modules/dashboard/assets/
```

Use these for module-specific graphics that aren't shared across the app.
