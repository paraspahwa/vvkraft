# Design System Document

# VideoForge - AI Video Generation Platform

## Version: 1.

## Date: March 22, 2026

## Author: Design Team

## Status: Draft

## Related: PRD.md v1.0, TECH_SPEC.md v1.

## 1. Design Philosophy

## 1.1 Core Principles

## 1. Dark-First Aesthetic : Video content shines on dark backgrounds. Every interface element is

## optimized for dark mode.

## 2. Cinematic Feel : The UI should feel like a professional video editing suite—sleek, focused, and

## powerful.

## 3. Progressive Disclosure : Simple by default, powerful when needed. Advanced features reveal

## themselves contextually.

## 4. Responsive Fluidity : Seamless experience from mobile (9:16) to desktop (21:9 ultrawide).

## 5. Accessibility First : WCAG 2.1 AA compliant, keyboard navigable, screen reader friendly.

## 1.2 Brand Identity

## Brand Name : VideoForge

## Tagline : “Forge Your Vision”

## Personality : Professional, innovative, accessible, powerful

## 2. Color System

## 2.1 Primary Palette

## Token Hex RGB Usage

## --color-bg-primary #0A0A0F 10, 10, 15 Main background

## --color-bg-secondary #12121A 18, 18, 26 Cards, panels

## --color-bg-tertiary #1A1A25 26, 26, 37 Elevated surfaces

## --color-bg-elevated #252532 37, 37, 50 Modals, dropdowns

## 2.2 Accent Colors

## Token Hex RGB Usage

## --color-accent-primary #6366F1 99, 102, 241 Primary buttons, links

## --color-accent-secondary #8B5CF6 139, 92, 246 Secondary actions, gradients

## --color-accent-success #22C55E 34, 197, 94 Success states, credits


### Table 2 – continued

### Token Hex RGB Usage

### --color-accent-warning #F59E0B 245, 158, 11 Warnings, processing

### --color-accent-error #EF4444 239, 68, 68 Errors, failures

### --color-accent-info #3B82F6 59, 130, 246 Info, tips

### 2.3 Gradient Definitions

```
/* Primary Gradient - Buttons, CTAs */
--gradient-primary: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);
```
```
/* Hero Gradient - Landing page, hero sections */
--gradient-hero: linear-gradient(180deg, #0A0A0F 0%, #1A1A25 50%, #0A0A0F 100%);
```
```
/* Card Gradient - Feature cards, pricing */
--gradient-card: linear-gradient(145deg, rgba(99, 102, 241, 0. 1 ) 0%, rgba(139, 92, 246, 0. 05 ) 100%);
```
```
/* Glow Effect - Active states, hover */
--gradient-glow: radial-gradient(circle, rgba(99, 102, 241, 0. 3 ) 0%, transparent 70%);
```
### 2.4 Text Colors

### Token Hex Usage

### --color-text-primary #FFFFFF Headings, primary text

### --color-text-secondary #A1A1AA Body text, descriptions

### --color-text-tertiary #71717A Metadata, timestamps

### --color-text-muted #52525B Placeholders, disabled

### --color-text-inverse #0A0A0F Text on light backgrounds

### 2.5 Semantic Colors

### State Background Border Text Icon

### Default transparent #3F3F46 #A1A1AA #A1A1AA

### Hover rgba(99, 102, 241, 0.1) #6366F1 #FFFFFF #6366F

### Active rgba(99, 102, 241, 0.2) #6366F1 #FFFFFF #6366F

### Disabled #27272A #3F3F46 #52525B #52525B

### Loading #27272A #6366F1 #A1A1AA animate-spin

### Success rgba(34, 197, 94, 0.1) #22C55E #22C55E #22C55E

### Error rgba(239, 68, 68, 0.1) #EF4444 #EF4444 #EF

### Warning rgba(245, 158, 11, 0.1) #F59E0B #F59E0B #F59E0B

## 3. Typography System

### 3.1 Font Family

```
/* Primary: Inter for UI, system fallback */
```

```
--font-sans:'Inter', system-ui, -apple-system, sans-serif;
```
```
/* Monospace: JetBrains Mono for code, data */
--font-mono:'JetBrains Mono','Fira Code', monospace;
```
```
/* Display: Optional for marketing pages */
--font-display:'Cal Sans','Inter', sans-serif;
```
### 3.2 Type Scale

### Token Size Line Height Weight Letter Spacing Usage

### --text-hero 48px /

### 3rem

### 1.1 800 -0.02em Landing

### hero

### --text-h1 36px /

### 2.25rem

### 1.2 700 -0.02em Page titles

### --text-h2 30px /

### 1.875rem

### 1.3 700 -0.01em Section

### headers

### --text-h3 24px /

### 1.5rem

### 1.4 600 -0.01em Card titles

### --text-h4 20px /

### 1.25rem

### 1.4 600 0 Subsection

### --text-h5 18px /

### 1.125rem

### 1.5 600 0 Labels

### --text-body 16px /

### 1rem

### 1.6 400 0 Body text

#### --text-

#### body-sm

### 14px /

### 0.875rem

### 1.5 400 0 Secondary

### text

#### --text-

#### caption

### 12px /

### 0.75rem

### 1.5 500 0.01em Captions

#### --text-

#### overline

### 11px /

### 0.6875rem

### 1.4 600 0.05em Tags, badges

### 3.3 Typography Patterns

```
/* Hero Title */
.hero-title{
font-size: var(--text-hero);
font-weight: 800;
letter-spacing: -0.02em;
background: linear-gradient(135deg, #FFFFFF 0%, #A1A1AA 100%);
-webkit-background-clip:text;
-webkit-text-fill-color:transparent;
}
```
```
/* Section Title */
.section-title{
font-size: var(--text-h2);
font-weight: 700;
```

```
color: var(--color-text-primary);
}
```
```
/* Card Title */
.card-title{
font-size: var(--text-h4);
font-weight: 600;
color: var(--color-text-primary);
}
```
```
/* Body Text */
.body-text{
font-size: var(--text-body);
line-height: 1.6;
color: var(--color-text-secondary);
}
```
```
/* Monospace Data */
.mono-data{
font-family: var(--font-mono);
font-size: var(--text-body-sm);
color: var(--color-text-secondary);
}
```
## 4. Spacing System

### 4.1 Base Unit

### Base unit: 4px (0.25rem)

### Token Value Pixels Usage

### --space-0 0 0px None

### --space-1 0.25rem 4px Tight gaps

### --space-2 0.5rem 8px Icon gaps

### --space-3 0.75rem 12px Small padding

### --space-4 1rem 16px Default gap

### --space-5 1.25rem 20px Medium padding

### --space-6 1.5rem 24px Card padding

### --space-8 2rem 32px Section gaps

### --space-10 2.5rem 40px Large sections

### --space-12 3rem 48px Page padding

### --space-16 4rem 64px Hero spacing

### --space-20 5rem 80px Major sections

### --space-24 6rem 96px Page breaks

### 4.2 Layout Grid

```
/* Container */
```

```
.container{
max-width: 1280px;
margin: 0auto;
padding: 0 var(--space-6);
}
```
```
/* Grid System */
.grid{
display:grid;
gap: var(--space-6);
}
```
```
.grid-cols-1{grid-template-columns: repeat(1, 1fr); }
.grid-cols-2{grid-template-columns: repeat(2, 1fr); }
.grid-cols-3{grid-template-columns: repeat(3, 1fr); }
.grid-cols-4{grid-template-columns: repeat(4, 1fr); }
```
```
/* Responsive */
@media(min-width: 640px) { .sm\:grid-cols-2 {grid-template-columns: repeat(2, 1fr); } }
@media(min-width: 768px) { .md\:grid-cols-3 {grid-template-columns: repeat(3, 1fr); } }
@media(min-width: 1024px) { .lg\:grid-cols-4 {grid-template-columns: repeat(4, 1fr); } }
```
## 5. Component Library

### 5.1 Buttons

### Primary Button

```
// Variants: default, ghost, outline
// Sizes: sm, md, lg
```
```
interfaceButtonProps {
variant?:'default'|'ghost'|'outline'|'destructive';
size?:'sm'|'md'|'lg';
loading?:boolean;
disabled?:boolean;
leftIcon?:React.ReactNode;
rightIcon?:React.ReactNode;
}
```
```
// Usage
<Button variant="default"size="md">
Generate Video
</Button>
```
### Specs:

- **Default** : Gradient background (--gradient-primary), white text
- **Ghost** : Transparent bg, hover shows subtle primary tint


- **Outline** : 1px border, transparent bg
- **Sizes** :
- sm: height 32px, padding 0 12px, text 14px
- md: height 40px, padding 0 16px, text 14px
- lg: height 48px, padding 0 24px, text 16px
- **Loading** : Spinner replaces text, disabled state
- **Hover** : Scale 1.02, brightness 1.1, shadow glow
- **Active** : Scale 0.
- **Disabled** : Opacity 0.5, cursor not-allowed

### Icon Button

```
<IconButton variant="ghost"size="md"aria-label="Settings">
<SettingsIcon className="w-5 h-5"/>
</IconButton>
```
### Specs:

- Sizes: xs (24px), sm (32px), md (40px), lg (48px)
- Border-radius: rounded-lg (8px) for md+, rounded-md (6px) for sm

### 5.2 Cards

### Generation Card

```
interfaceGenerationCardProps {
thumbnailUrl:string;
status:'pending'|'processing'|'completed'|'failed';
duration:number;
createdAt:Date;
onClick?: () =>void;
onDownload?: () =>void;
onDelete?: () =>void;
}
```
### Specs:

- Background:--color-bg-secondary
- Border: 1px solid--color-bg-tertiary
- Border-radius: 12px (rounded-xl)
- Shadow:0 4px 6px -1px rgba(0, 0, 0, 0.3)
- Hover: Border color--color-accent-primary, translateY -2px
- Thumbnail aspect ratio: 16:9 or 9:16 based on content
- Status badge: Top-right corner, colored by status


- Overlay actions: Bottom gradient with download/delete buttons

### Pricing Card

```
interfacePricingCardProps {
tier:'free'|'creator'|'pro'|'studio';
price:number;
features:string[];
highlighted?:boolean;
ctaText:string;
}
```
### Specs:

- Background:--gradient-cardfor highlighted,--color-bg-secondaryfor others
- Border: 2px solid--color-accent-primaryfor highlighted, 1px solid--color-bg-tertiaryfor others
- Border-radius: 16px (rounded-2xl)
- Padding: 32px (space-8)
- Badge: “Most Popular” for highlighted tier

### 5.3 Forms

### Input

```
interfaceInputProps {
label?:string;
placeholder?:string;
error?:string;
helperText?:string;
leftIcon?:React.ReactNode;
rightIcon?:React.ReactNode;
multiline?:boolean;
rows?:number;
}
```
### Specs:

- Background:--color-bg-tertiary
- Border: 1px solid--color-bg-elevated
- Border-radius: 8px (rounded-lg)
- Height: 40px (single line), auto (multiline)
- Padding: 10px 12px
- Text:--color-text-primary
- Placeholder:--color-text-muted
- Focus: Border--color-accent-primary, shadow0 0 0 2px rgba(99, 102, 241, 0.2)


- Error: Border--color-accent-error, text--color-accent-error
- Disabled: Background--color-bg-secondary, text--color-text-muted

### Prompt Input (Specialized)

```
interfacePromptInputProps {
value:string;
onChange: (value:string) =>void;
maxLength?:number;
enhancementEnabled?:boolean;
onEnhance?: () =>void;
}
```
### Specs:

- Large textarea: Min height 120px, max height 300px
- Character counter: Bottom-right, turns warning at 1800, error at 2000
- Enhance button: Magic wand icon, sparkles animation on hover
- Auto-resize: Grows with content up to max
- Quick actions: Toolbar with “Surprise me”, “Improve prompt”, “Clear”

### Slider

```
interfaceSliderProps {
min:number;
max:number;
step?:number;
value:number;
onChange: (value:number) =>void;
label?:string;
showValue?:boolean;
valueFormatter?: (value:number) =>string;
}
```
### Specs:

- Track height: 4px
- Track background:--color-bg-elevated
- Fill background:--color-accent-primary
- Thumb size: 16px
- Thumb background:--color-accent-primary
- Thumb border: 2px solid white
- Thumb shadow:0 2px 4px rgba(0, 0, 0, 0.3)
- Hover: Thumb scale 1.


### 5.4 Navigation

### Top Navigation

```
interfaceTopNavProps {
user?:User;
credits:number;
onLogoClick?: () =>void;
}
```
### Specs:

- Height: 64px
- Background:--color-bg-primarywith backdrop-blur
- Border-bottom: 1px solid--color-bg-tertiary
- Logo: Left side, 32px height
- Nav links: Center (hidden on mobile)
- Credits badge: Right side, gradient background
- User menu: Avatar with dropdown
- Mobile: Hamburger menu, sheet slides from right

### Sidebar (Dashboard)

```
interfaceSidebarProps {
items:NavItem[];
activeItem:string;
collapsed?:boolean;
}
```
### Specs:

- Width: 240px (expanded), 72px (collapsed)
- Background:--color-bg-secondary
- Border-right: 1px solid--color-bg-tertiary
- Item height: 44px
- Active item: Background--color-accent-primary/10, left border 3px--color-accent-primary
- Hover: Background--color-bg-tertiary
- Icon: 20px, margin-right 12px
- Transition: Width 300ms ease

### 5.5 Feedback Components

### Toast Notification


```
interfaceToastProps {
type:'success'|'error'|'warning'|'info';
title:string;
description?:string;
duration?:number;
action?: {
label:string;
onClick: () =>void;
};
}
```
### Specs:

- Position: Bottom-right (desktop), top (mobile)
- Background:--color-bg-elevated
- Border-left: 4px solid (color by type)
- Border-radius: 8px
- Shadow:0 10px 15px -3px rgba(0, 0, 0, 0.5)
- Animation: Slide in from right, fade out
- Duration: 5s default, pause on hover

### Progress Indicator

```
interfaceProgressProps {
value:number;// 0-
size?:'sm'|'md'|'lg';
variant?:'linear'|'circular';
showLabel?:boolean;
labelFormatter?: (value:number) =>string;
}
```
### Specs:

- Linear height: 4px (sm), 8px (md)
- Circular size: 32px (sm), 48px (md), 64px (lg)
- Track:--color-bg-elevated
- Fill:--gradient-primary
- Animation: Smooth transition 300ms
- Indeterminate: Shimmer animation

### Skeleton Loader

```
interfaceSkeletonProps {
variant?:'text'|'circular'|'rectangular'|'rounded';
width?:string|number;
height?:string|number;
```

```
animate?:boolean;
}
```
### Specs:

- Background:--color-bg-tertiary
- Animation: Pulse opacity 0.5-1, 2s infinite
- Shimmer variant: Linear gradient animation

### 5.6 Data Display

### Badge

```
interfaceBadgeProps {
variant?:'default'|'secondary'|'outline'|'status';
size?:'sm'|'md';
color?:'neutral'|'primary'|'success'|'warning'|'error';
dot?:boolean;
}
```
### Specs:

- Height: 20px (sm), 24px (md)
- Padding: 0 8px (sm), 0 12px (md)
- Border-radius: 9999px (full)
- Font size: 11px (sm), 12px (md)
- Font weight: 500
- Status dot: 6px, positioned left

### Credit Display

```
interfaceCreditDisplayProps {
amount:number;
size?:'sm'|'md'|'lg';
showBuyButton?:boolean;
}
```
### Specs:

- Icon: Coin/sparkle icon,--color-accent-warning
- Amount: Monospace font,--color-text-primary
- Background:--color-bg-tertiarywith subtle gradient
- Border: 1px solid--color-accent-warning/
- Buy button: “+” icon, hover expands to “Buy Credits”


## 6. Layout Patterns

### 6.1 Generation Interface

##### ┌─────────────────────────────────────────────────────────────────────┐

##### │ TOP NAV │

##### ├─────────────────────────────────────────────────────────────────────┤

##### │ │

##### │ ┌─────────────────────────┐ ┌─────────────────────────────────┐ │

##### │ │ │ │ │ │

##### │ │ PROMPT INPUT │ │ PREVIEW / PLAYER │ │

##### │ │ ───────────────── │ │ ┌─────────────────────────┐ │ │

```
│ │ [Text area ] │ │ │ │ │ │
│ │ [Enhance ▼] │ │ │ Video Preview │ │ │
│ │ │ │ │ or Placeholder │ │ │
│ │ SETTINGS PANEL │ │ │ │ │ │
│ │ ┌─────────────────┐ │ │ └─────────────────────────┘ │ │
│ │ │ Duration: [═══]│ │ │ │ │
│ │ │ Aspect: [16:9 ▼]│ │ │ STATUS / CONTROLS │ │
│ │ │ Model: [Pro ▼] │ │ │ ┌─────────────────────────┐ │ │
│ │ │ [ ] Enable Audio│ │ │ │ [Generate] [Queue: 3] │ │ │
│ │ └─────────────────┘ │ │ │ Cost: 2.5 credits │ │ │
│ │ │ │ └─────────────────────────┘ │ │
│ │ [Generate Video] │ │ │ │
│ │ │ │ │ │
│ └─────────────────────────┘ └─────────────────────────────────┘ │
│ │
│ RECENT GENERATIONS (Horizontal scroll) │
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ │
│ │ │ │ │ │ │ │ │ │ │ │
│ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ │
│ │
└─────────────────────────────────────────────────────────────────────┘
```
### 6.2 Gallery Layout

##### ┌─────────────────────────────────────────────────────────────────────┐

```
│ TOP NAV [Credits] [User]│
├─────────────────────────────────────────────────────────────────────┤
│ SIDEBAR │ CONTENT │
│ │ ┌────────────────────────────────────────────────────┐ │
│ Dashboard │ │ Filters: [All ▼] [Date ▼] [Status ▼] [Model ▼] │ │
│ ───────── │ └────────────────────────────────────────────────────┘ │
│ Generate │ │
│ Gallery │ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│ Characters │ │ │ │ │ │ │ │ │ │
│ Settings │ │ Video │ │ Video │ │ Video │ │ Video │ │
│ │ │ Card │ │ Card │ │ Card │ │ Card │ │
│ ───────── │ │ │ │ │ │ │ │ │ │
│ Help │ │ [Status] │ │ [Status] │ │ [Status] │ │ [Status] │ │
│ Logout │ └──────────┘ └──────────┘ └──────────┘ └──────────┘ │
│ │ │
```

```
│ │ [Load More...] │
└─────────────────────────────────────────────────────────────────────┘
```
### 6.3 Mobile Layout

##### ┌─────────────────────────┐

```
│ [≡] VideoForge [ ] │ ← Top Nav (compact)
├─────────────────────────┤
│ │
│ ┌───────────────────┐ │
│ │ │ │
│ │ VIDEO PLAYER │ │ ← Full width, 16:
│ │ (or preview) │ │
│ │ │ │
│ └───────────────────┘ │
│ │
│ PROMPT │
│ ┌───────────────────┐ │
│ │ │ │ ← Large touch target
│ │ Enter prompt... │ │
│ │ │ │
│ └───────────────────┘ │
│ │
│ SETTINGS (Accordion) │
│ ┌───────────────────┐ │
│ │ Duration │ │
│ │ Quality │ │
│ │ Advanced │ │
│ └───────────────────┘ │
│ │
│ [ GENERATE ] │ ← Full width CTA
│ │
│ RECENT → │ ← Horizontal scroll
│ ┌───┐ ┌───┐ ┌───┐ │
│ │ │ │ │ │ │ │
│ └───┘ └───┘ └───┘ │
│ │
├─────────────────────────┤
│ [ ] [ ] [ ] [ ] │ ← Bottom Tab Nav
└─────────────────────────┘
```
## 7. Motion & Animation

### 7.1 Animation Principles

### 1. Purposeful : Every animation guides attention or provides feedback

### 2. Performant : 60fps, use transform and opacity only

### 3. Consistent : Same easing curves throughout

### 4. Subtle : Enhance, don’t distract


### 5. Respectful : Honorprefers-reduced-motion

### 7.2 Easing Curves

```
/* Standard easing */
--ease-default: cubic-bezier(0. 4 , 0, 0. 2 , 1);
```
```
/* Enter (decelerate) */
--ease-in: cubic-bezier(0. 4 , 0, 1, 1);
```
```
/* Exit (accelerate) */
--ease-out: cubic-bezier(0, 0, 0. 2 , 1);
```
```
/* Bounce (playful) */
--ease-bounce: cubic-bezier(0. 68 , -0. 55 , 0. 265 , 1. 55 );
```
```
/* Spring (energetic) */
--ease-spring: cubic-bezier(0. 175 , 0. 885 , 0. 32 , 1. 275 );
```
### 7.3 Duration Scale

### Token Value Usage

### --duration-instant 50ms Micro-interactions

### --duration-fast 150ms Hover, focus

### --duration-normal 250ms Transitions

### --duration-slow 350ms Page transitions

### --duration-slower 500ms Complex animations

### 7.4 Common Animations

```
/* Fade In */
@keyframesfadeIn {
from {opacity: 0; }
to {opacity: 1; }
}
```
```
/* Slide Up */
@keyframesslideUp {
from {
opacity: 0;
transform: translateY(20px);
}
to {
opacity: 1;
transform: translateY(0);
}
}
```
```
/* Scale In */
@keyframesscaleIn {
```

```
from {
opacity: 0;
transform: scale(0.95);
}
to {
opacity: 1;
transform: scale(1);
}
}
```
```
/* Shimmer (loading) */
@keyframesshimmer {
0% {background-position: -200%0; }
100% {background-position: 200%0; }
}
```
```
/* Pulse (status) */
@keyframespulse {
0%, 100% {opacity: 1; }
50% {opacity: 0.5; }
}
```
```
/* Spin */
@keyframesspin {
from {transform: rotate(0deg); }
to {transform: rotate(360deg); }
}
```
```
/* Bounce (success) */
@keyframesbounce {
0%, 100% {transform: translateY(0); }
50% {transform: translateY(-10px); }
}
```
### 7.5 Component-Specific Animations

### Button Hover

```
.button{
transition:transformvar(--duration-fast) var(--ease-spring),
box-shadowvar(--duration-fast) var(--ease-default);
}
```
```
.button:hover {
transform: scale(1.02);
box-shadow: 0 0 20pxrgba(99, 102, 241, 0.3);
}
```
```
.button:active {
transform: scale(0.98);
}
```

### Card Hover

```
.card{
transition:transformvar(--duration-normal) var(--ease-default),
border-colorvar(--duration-fast) var(--ease-default);
}
```
```
.card:hover {
transform: translateY(-4px);
border-color: var(--color-accent-primary);
}
```
### Modal/Sheet

```
.modal-overlay{
animation: fadeIn var(--duration-normal) var(--ease-default);
}
```
```
.modal-content{
animation: slideUp var(--duration-slow) var(--ease-spring);
}
```
### Toast

```
.toast-enter{
animation: slideInRight var(--duration-normal) var(--ease-spring);
}
```
```
.toast-exit{
animation: fadeOut var(--duration-fast) var(--ease-in);
}
```
## 8. Icons

### 8.1 Icon Library

### Primary : Lucide React (consistent, clean)

### Secondary : Custom icons for brand-specific concepts

### 8.2 Icon Sizes

### Token Size Usage

### --icon-xs 12px Inline text, badges

### --icon-sm 16px Buttons, inputs

### --icon-md 20px Navigation, tabs

### --icon-lg 24px Standalone actions

### --icon-xl 32px Feature highlights

### --icon-2xl 48px Empty states


### 8.3 Icon Color Rules

- Default:--color-text-secondary
- Hover:--color-text-primary
- Active/Selected:--color-accent-primary
- Disabled:--color-text-muted
- Success:--color-accent-success
- Error:--color-accent-error
- Warning:--color-accent-warning

### 8.4 Custom Icons

```
// Custom icons for video-specific concepts
exportconstVideoIcons = {
Generate: (props) => <svg>...</svg>,// Sparkles + play
Processing: (props) => <svg>...</svg>,// Animated spinner
MultiShot: (props) => <svg>...</svg>,// Film strip
MotionControl: (props) => <svg>...</svg>,// Arrows
AudioWave: (props) => <svg>...</svg>,// Sound waves
CreditCoin: (props) => <svg>...</svg>,// Coin with sparkles
};
```
## 9. Responsive Design

### 9.1 Breakpoints

### Token Width Target

### xs < 640px Mobile portrait

### sm ￿ 640px Mobile landscape

### md ￿ 768px Tablet

### lg ￿ 1024px Desktop

### xl ￿ 1280px Large desktop

### 2xl ￿ 1536px Ultrawide

### 9.2 Responsive Patterns

### Generation Interface

- **Mobile** : Stacked layout, full-width inputs, bottom sheet for settings
- **Tablet** : Side-by-side with narrower preview
- **Desktop** : 50/50 split, persistent settings panel
- **Ultrawide** : 40/60 split with additional tools sidebar

### Gallery Grid

- **Mobile** : 2 columns
- **Tablet** : 3 columns
- **Desktop** : 4 columns
- **Large** : 5 columns


### Navigation

- **Mobile** : Bottom tab bar (4 items max)
- **Tablet** : Collapsible sidebar
- **Desktop** : Persistent sidebar + top nav

### 9.3 Touch Targets

- Minimum touch target: 44x44px
- Button height mobile: 48px
- Spacing between touch targets: 8px minimum
- Gesture areas: Full width for swipe actions

## 10. Accessibility

### 10.1 Color Contrast

### All text meets WCAG 2.1 AA:

- Normal text: 4.5:1 minimum
- Large text (18px+): 3:1 minimum
- Interactive elements: 3:1 minimum

### 10.2 Focus States

```
/* Visible focus ring */
:focus-visible {
outline: 2pxsolidvar(--color-accent-primary);
outline-offset: 2px;
}
```
```
/* Skip link for keyboard users */
.skip-link{
position:absolute;
top: -40px;
left: 0;
background: var(--color-bg-elevated);
color: var(--color-text-primary);
padding: 8px;
z-index: 100;
}
```
```
.skip-link:focus {
top: 0;
}
```
### 10.3 Screen Reader Support

```
// Proper ARIA labels
<button
```

```
aria-label="Generate video from prompt"
aria-describedby="prompt-help"
>
Generate
</button>
```
```
// Live regions for status updates
<div role="status"aria-live="polite"aria-atomic="true">
{statusMessage}
</div>
```
```
// Progress announcements
<div
role="progressbar"
aria-valuenow={progress}
aria-valuemin={0}
aria-valuemax={100}
aria-label="Video generation progress"
>
<div style={{ width:`${progress}%`}} />
</div>
```
### 10.4 Reduced Motion

```
@media(prefers-reduced-motion: reduce) {
*,
*::before,
*::after {
animation-duration: 0.01ms!important;
animation-iteration-count: 1!important;
transition-duration: 0.01ms!important;
}
}
```
## 11. Design Tokens (JSON)

##### {

```
"colors": {
"bg": {
"primary":"#0A0A0F",
"secondary":"#12121A",
"tertiary":"#1A1A25",
"elevated":"#252532"
},
"accent": {
"primary":"#6366F1",
"secondary":"#8B5CF6",
"success":"#22C55E",
"warning":"#F59E0B",
```

"error":"#EF4444",
"info":"#3B82F6"
},
"text": {
"primary":"#FFFFFF",
"secondary":"#A1A1AA",
"tertiary":"#71717A",
"muted":"#52525B",
"inverse":"#0A0A0F"
}
},
"typography": {
"fontFamily": {
"sans":"Inter, system-ui, sans-serif",
"mono":"JetBrains Mono, monospace",
"display":"Cal Sans, Inter, sans-serif"
},
"sizes": {
"hero":"3rem",
"h1":"2.25rem",
"h2":"1.875rem",
"h3":"1.5rem",
"h4":"1.25rem",
"h5":"1.125rem",
"body":"1rem",
"bodySm":"0.875rem",
"caption":"0.75rem",
"overline":"0.6875rem"
}
},
"spacing": {
"0":"0",
"1":"0.25rem",
"2":"0.5rem",
"3":"0.75rem",
"4":"1rem",
"5":"1.25rem",
"6":"1.5rem",
"8":"2rem",
"10":"2.5rem",
"12":"3rem",
"16":"4rem",
"20":"5rem",
"24":"6rem"
},
"animation": {
"duration": {
"instant":"50ms",
"fast":"150ms",
"normal":"250ms",
"slow":"350ms",


```
"slower":"500ms"
},
"easing": {
"default":"cubic-bezier(0.4, 0, 0.2, 1)",
"in":"cubic-bezier(0.4, 0, 1, 1)",
"out":"cubic-bezier(0, 0, 0.2, 1)",
"bounce":"cubic-bezier(0.68, -0.55, 0.265, 1.55)",
"spring":"cubic-bezier(0.175, 0.885, 0.32, 1.275)"
}
},
"breakpoints": {
"xs":"640px",
"sm":"768px",
"md":"1024px",
"lg":"1280px",
"xl":"1536px"
}
}
```
## 12. File Structure

```
packages/ui/
├── src/
│ ├── components/
│ │ ├── button.tsx
│ │ ├── card.tsx
│ │ ├── input.tsx
│ │ ├── badge.tsx
│ │ ├── toast.tsx
│ │ ├── progress.tsx
│ │ ├── slider.tsx
│ │ ├── select.tsx
│ │ ├── dialog.tsx
│ │ ├── dropdown-menu.tsx
│ │ ├── tabs.tsx
│ │ ├── accordion.tsx
│ │ ├── tooltip.tsx
│ │ ├── skeleton.tsx
│ │ └── index.ts
│ │
│ ├── theme/
│ │ ├── colors.ts
│ │ ├── typography.ts
│ │ ├── spacing.ts
│ │ ├── animations.ts
│ │ ├── breakpoints.ts
│ │ └── index.ts
│ │
│ ├── hooks/
```

```
│ │ ├── use-theme.ts
│ │ ├── use-toast.ts
│ │ └── use-media-query.ts
│ │
│ ├── utils/
│ │ ├── cn.ts
│ │ └── formatters.ts
│ │
│ └── index.ts
│
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```
## 13. Usage Examples

### 13.1 Web (Next.js + Tailwind)

```
import{ Button, Card, Input, Badge }from'@videoforge/ui';
```
```
exportfunctionGenerationPage() {
return(
<div className="min-h-screen bg-bg-primary text-text-primary">
<Card className="max-w-4xl mx-auto p-6">
<div className="flex items-center justify-between mb-6">
<h1 className="text-h3 font-semibold">Generate Video</h1>
<Badge variant="status"color="warning">
Processing
</Badge>
</div>
```
```
<Input
label="Prompt"
placeholder="Describe your video..."
className="mb-4"
/>
```
```
<div className="flex gap-4">
<Button variant="outline"size="md">
Cancel
</Button>
<Button variant="default"size="md"className="flex-1">
Generate Video
</Button>
</div>
</Card>
</div>
);
}
```

### 13.2 Mobile (Expo + NativeWind)

```
import{ Button, Card, Input }from'@videoforge/ui';
import{ View }from'react-native';
```
```
exportfunctionGenerationScreen() {
return(
<View className="flex-1 bg-bg-primary p-4">
<Card className="p-4">
<Input
label="Prompt"
placeholder="Describe your video..."
multiline
numberOfLines={4}
className="mb-4"
/>
```
```
<Button variant="default"size="lg"className="w-full">
Generate Video
</Button>
</Card>
</View>
);
}
```
### Document Control:

- **Version History:**
- v1.0 (2026-03-22): Initial Design System
- **Related Documents:**
- PRD.md v1.0
- TECH_SPEC.md v1.0
- **Next Review Date:** 2026-04-22

### Contact: design@videoforge.ai


