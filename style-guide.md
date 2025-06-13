# Perfect Zenkai UI Style Guide

_AI-powered fitness tracker with cyber-ninja aesthetics_

---

## Brand Foundations

### Color Tokens

```
PRIMARY PALETTE
Dark Navy     #111827    rgb(17, 24, 39)     Background, containers
White         #FFFFFF    rgb(255, 255, 255)  Primary text, icons
Ki-Green      #22FFB7    rgb(34, 255, 183)   CTA buttons, success states
Hyper-Magenta #FF2EEA    rgb(255, 46, 234)   Accent, highlights
Plasma-Cyan   #1BE7FF    rgb(27, 231, 255)   Secondary actions, links

NEUTRAL SCALE
Gray-900      #0F172A    rgb(15, 23, 42)     Deep backgrounds
Gray-800      #1E293B    rgb(30, 41, 59)     Card backgrounds
Gray-700      #334155    rgb(51, 65, 85)     Borders, dividers
Gray-600      #475569    rgb(71, 85, 105)    Disabled text
Gray-500      #64748B    rgb(100, 116, 139)  Placeholder text
Gray-400      #94A3B8    rgb(148, 163, 184)  Secondary text
Gray-300      #CBD5E1    rgb(203, 213, 225)  Light borders
Gray-200      #E2E8F0    rgb(226, 232, 240)  Light backgrounds
Gray-100      #F1F5F9    rgb(241, 245, 249)  Subtle backgrounds

SEMANTIC COLORS
Success       #22FFB7    Ki-Green variant
Warning       #FBBF24    rgb(251, 191, 36)
Error         #EF4444    rgb(239, 68, 68)
Info          #1BE7FF    Plasma-Cyan variant
```

### Typography Scale

```
FONT FAMILIES
Headings      'Press Start 2P', 'Courier New', monospace
Body/UI       'Inter', -apple-system, BlinkMacSystemFont, sans-serif
Code/Stats    'JetBrains Mono', 'SF Mono', 'Consolas', monospace

TYPE SCALE (rem / sp)
H1 Display    2.5rem / 40sp    Press Start 2P, 600 weight
H2 Title      2rem / 32sp      Press Start 2P, 600 weight
H3 Heading    1.5rem / 24sp    Inter, 600 weight
H4 Subhead    1.25rem / 20sp   Inter, 600 weight
Body Large    1.125rem / 18sp  Inter, 400 weight
Body          1rem / 16sp      Inter, 400 weight
Body Small    0.875rem / 14sp  Inter, 400 weight
Caption       0.75rem / 12sp   Inter, 400 weight
Code          1rem / 16sp      JetBrains Mono, 400 weight

LINE HEIGHTS
Display       1.2
Headings      1.3
Body          1.5
Code          1.4
```

### Spacing & Grid

```
SPACING SCALE (4pt system)
xs    4px     0.25rem
sm    8px     0.5rem
md    16px    1rem
lg    24px    1.5rem
xl    32px    2rem
2xl   48px    3rem
3xl   64px    4rem

BREAKPOINTS
Mobile        320px - 767px
Tablet        768px - 1023px
Desktop       1024px+

GRID
Columns       12-column grid
Gutter        16px (mobile), 24px (tablet+)
Margins       16px (mobile), 32px (tablet+)
```

---

## Core Components

### Buttons

```
PRIMARY BUTTON
Background    Ki-Green (#22FFB7)
Text          Dark Navy (#111827)
Font          Inter 600, 1rem
Padding       12px 24px
Border Radius 8px
Min Height    44px
Glow Effect   0 0 20px rgba(34, 255, 183, 0.3)

SECONDARY BUTTON
Background    Transparent
Border        2px solid Plasma-Cyan (#1BE7FF)
Text          Plasma-Cyan (#1BE7FF)
Font          Inter 600, 1rem
Padding       10px 22px
Border Radius 8px
Min Height    44px

GHOST BUTTON
Background    Transparent
Text          White (#FFFFFF)
Font          Inter 600, 1rem
Padding       12px 24px
Border Radius 8px
Min Height    44px
Hover         Background Gray-800 (#1E293B)

BUTTON STATES
Hover         Scale 1.02, brightness 110%
Pressed       Scale 0.96, brightness 90%
Disabled      Opacity 0.5, no interactions
Loading       Spinner + "Processing..." text
```

### Cards & Panels

```
CARD COMPONENT
Background    Gray-800 (#1E293B)
Border        1px solid Gray-700 (#334155)
Border Radius 12px
Padding       20px
Shadow        0 4px 20px rgba(0, 0, 0, 0.3)
Glow          0 0 1px rgba(34, 255, 183, 0.1)

ELEVATED CARD
Background    Gray-800 (#1E293B)
Border        1px solid Gray-600 (#475569)
Border Radius 12px
Padding       24px
Shadow        0 8px 32px rgba(0, 0, 0, 0.4)
Glow          0 0 2px rgba(34, 255, 183, 0.2)

PANEL HEADER
Background    Gray-900 (#0F172A)
Border Bottom 1px solid Gray-700 (#334155)
Padding       16px 20px
Font          Inter 600, 1.125rem
```

### Forms

```
INPUT FIELD
Background    Gray-900 (#0F172A)
Border        2px solid Gray-700 (#334155)
Border Radius 8px
Padding       12px 16px
Font          Inter 400, 1rem
Min Height    44px
Placeholder   Gray-500 (#64748B)

FOCUS STATE
Border        2px solid Ki-Green (#22FFB7)
Glow          0 0 8px rgba(34, 255, 183, 0.3)
Outline       None

ERROR STATE
Border        2px solid Error (#EF4444)
Glow          0 0 8px rgba(239, 68, 68, 0.3)

TOGGLE SWITCH
Track         Gray-700 (#334155)
Thumb         White (#FFFFFF)
Active Track  Ki-Green (#22FFB7)
Size          24px height, 44px width

SLIDER
Track         Gray-700 (#334155)
Fill          Ki-Green (#22FFB7)
Thumb         White (#FFFFFF) with Ki-Green glow
Height        4px
Thumb Size    20px
```

### Navigation

```
BOTTOM NAV BAR
Background    Gray-900 (#0F172A)
Border Top    1px solid Gray-700 (#334155)
Height        72px
Padding       8px 0

NAV ITEM
Icon Size     24px
Font          Inter 600, 0.75rem
Active Color  Ki-Green (#22FFB7)
Inactive      Gray-500 (#64748B)
Glow          0 0 8px rgba(34, 255, 183, 0.4) (active)

FLOATING ACTION BUTTON (FAB)
Background    Hyper-Magenta (#FF2EEA)
Size          56px diameter
Icon          24px, White
Shadow        0 6px 20px rgba(255, 46, 234, 0.4)
Position      Fixed, bottom-right
Margin        20px from edges
```

### Status & Progress

```
PROGRESS RING (XP Bar)
Track         Gray-700 (#334155)
Fill          Linear gradient Ki-Green to Plasma-Cyan
Stroke Width  6px
Size          80px diameter
Glow          0 0 12px rgba(34, 255, 183, 0.5)

STATUS CHIP
Background    Gray-800 (#1E293B)
Border        1px solid semantic color
Text          Semantic color
Padding       4px 12px
Border Radius 16px
Font          Inter 600, 0.875rem

LEVEL BADGE
Background    Hyper-Magenta (#FF2EEA)
Text          White (#FFFFFF)
Font          Press Start 2P, 0.75rem
Padding       6px 10px
Border Radius 6px
Glow          0 0 10px rgba(255, 46, 234, 0.6)
```

---

## States & Feedback

### Interaction States

```
HOVER EFFECTS
Scale         1.02 (buttons, cards)
Brightness    110%
Glow          Increase opacity by 50%
Duration      150ms ease-out

PRESSED STATES
Scale         0.96
Brightness    90%
Duration      90ms ease-in

DISABLED STATES
Opacity       0.5
Cursor        not-allowed
Interactions  None
```

### Feedback Colors

```
SUCCESS RAMP
Success-50    #ECFDF5
Success-500   #22FFB7    (Ki-Green)
Success-700   #1AA876
Success-900   #0F5132

WARNING RAMP
Warning-50    #FFFBEB
Warning-500   #FBBF24
Warning-700   #D97706
Warning-900   #92400E

ERROR RAMP
Error-50      #FEF2F2
Error-500     #EF4444
Error-700     #DC2626
Error-900     #991B1B
```

### Loading States

```
SKELETON LOADER
Background    Gray-800 (#1E293B)
Shimmer       Linear gradient with Plasma-Cyan
Animation     Pixel-scan effect, 1.5s duration
Border Radius Match component shape

SPINNER
Color         Ki-Green (#22FFB7)
Size          24px (small), 32px (medium), 48px (large)
Stroke Width  3px
Animation     Smooth rotation, 1s duration
```

---

## Iconography & Imagery

### Icon Specifications

```
ICON GRID
Base Size     24px × 24px
Stroke Width  2px
Corner Radius 2px (when applicable)
Style         Outline, minimal fill
Color         White (#FFFFFF) default
Active Color  Ki-Green (#22FFB7)

ICON VARIANTS
Small         16px × 16px (inline text)
Medium        24px × 24px (standard)
Large         32px × 32px (headers)
XL            48px × 48px (empty states)

GLOW EFFECTS
Active Icons  0 0 8px rgba(34, 255, 183, 0.6)
Hover Icons   0 0 4px rgba(255, 255, 255, 0.3)
```

### Character Art Guidelines

```
STYLE
Rendering     Cel-shaded, flat colors
Lighting      Neon rim-light on edges
Effects       Diagonal rain overlay (15° angle)
Gradients     Synthwave (magenta to cyan)
Glow          Soft outer glow on characters

COMPOSITION
Background    Dark Navy with subtle grid
Rain Effect   Diagonal lines, 2px width, 20% opacity
Character     Center-focused, 60% of frame height
Lighting      Top-left rim light, bottom-right fill
```

---

## Motion & Micro-Interactions

### Timing Tokens

```
DURATION TOKENS
t-instant     0ms       Immediate feedback
t-fast        90ms      Button press, quick hover
t-smooth      150ms     Standard transitions
t-slow        300ms     Page transitions, modals
t-lazy        500ms     Complex animations

EASING CURVES
ease-in       cubic-bezier(0.4, 0, 1, 1)
ease-out      cubic-bezier(0, 0, 0.2, 1)
ease-bounce   cubic-bezier(0.68, -0.55, 0.265, 1.55)
ease-elastic  cubic-bezier(0.175, 0.885, 0.32, 1.275)
```

### Animation Examples

```
BUTTON PRESS
Transform     scale(0.96)
Duration      90ms ease-in
Effect        Rain sparkle on release

CARD HOVER
Transform     scale(1.02) translateY(-2px)
Duration      150ms ease-out
Glow          Increase by 50%

PAGE TRANSITION
Transform     translateX(100%) → translateX(0)
Duration      300ms ease-out
Overlay       Diagonal rain sweep

PROGRESS FILL
Animation     Width 0% → target%
Duration      500ms ease-out
Effect        Glow pulse on completion
```

---

## Accessibility

### Contrast Matrix

```
DARK MODE (Default)
Text on Dark Navy     White (#FFFFFF)         15.8:1 AAA
Secondary on Dark     Gray-400 (#94A3B8)     4.7:1 AA
Ki-Green on Dark      Ki-Green (#22FFB7)     12.1:1 AAA
Plasma-Cyan on Dark   Plasma-Cyan (#1BE7FF)  10.3:1 AAA
Magenta on Dark       Hyper-Magenta (#FF2EEA) 5.2:1 AA

LIGHT MODE
Text on Light         Gray-900 (#0F172A)     15.8:1 AAA
Secondary on Light    Gray-600 (#475569)     4.5:1 AA
Ki-Green on Light     #0F5132 (adjusted)     4.5:1 AA
```

### Touch & Typography

```
MINIMUM TARGETS
Touch Target  44px × 44px minimum
Button Height 44px minimum
Tap Area      48px × 48px (including padding)

FONT SIZE LIMITS
Minimum Body  16px (1rem) - no smaller
Minimum UI    14px (0.875rem) for labels only
Maximum Line  65 characters for readability

COLOR-BLIND SAFE
Success       Use checkmark icon + color
Error         Use X icon + color
Warning       Use triangle icon + color
Info          Use info icon + color
```

---

## Sample Screens

### Dashboard

```
Layout        2-column grid (mobile), 3-column (tablet+)
Cards         Weight tracker, XP progress, daily quests
Header        "Perfect Zenkai" wordmark + level badge
Navigation    Bottom nav with 4 items
FAB           Quick add action (Hyper-Magenta)
```

### Weight Log

```
Layout        List view with chart header
Chart         Line graph with Ki-Green stroke
Entries       Card-based, swipe-to-delete
Empty State   Scale illustration + "Start tracking"
Input         Modal with number pad + date picker
```

### Quest Log

```
Layout        Grouped list (Daily, Weekly, Achievements)
Items         Checkbox + title + XP reward
Progress      Ring progress for completion %
Rewards       Animated XP gain with particle effects
Filter        Chip-based filter bar
```

### Settings

```
Layout        Grouped sections with dividers
Items         Toggle switches, disclosure arrows
Profile       Avatar + stats card at top
Theme         Dark/Light mode toggle
Data          Export, backup, reset options
```

---

## Download Assets

### Logo & Branding

- **SVG Logo**: `assets/branding/logo.svg` (scalable wordmark)
- **App Icon**: `assets/icons/app-icon-1024.png` (circular ninja-Z emblem)
- **Splash Screen**: `assets/branding/splash-2048x2048.png` (loading screen)

### Icon Library

- **Navigation Icons**: `assets/icons/navigation/` (weight, quests, dashboard, profile)
- **UI Icons**: `assets/icons/ui/` (add, edit, delete, settings, etc.)
- **Status Icons**: `assets/icons/status/` (success, warning, error, info)

### Illustrations

- **Empty States**: `assets/illustrations/empty/` (no data, offline, error)
- **Onboarding**: `assets/illustrations/onboard/` (welcome, tutorial steps)
- **Characters**: `assets/illustrations/characters/` (ninja avatars, poses)

### Patterns & Textures

- **Rain Overlay**: `assets/patterns/diagonal-rain.svg` (15° diagonal lines)
- **Grid Pattern**: `assets/patterns/cyber-grid.svg` (subtle background grid)
- **Glow Effects**: `assets/effects/` (various glow and particle PNGs)

---

_Perfect Zenkai Style Guide v1.0 - Cyber-ninja fitness tracking with neon aesthetics_

<!-- END OF STYLE GUIDE -->
