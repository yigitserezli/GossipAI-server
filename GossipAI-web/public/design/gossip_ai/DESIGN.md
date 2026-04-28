---
name: Gossip AI
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#3a3939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#cec3d3'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#978d9c'
  outline-variant: '#4b4451'
  surface-tint: '#dcb8ff'
  primary: '#dcb8ff'
  on-primary: '#460b7b'
  primary-container: '#c792ff'
  on-primary-container: '#552189'
  inverse-primary: '#7845ac'
  secondary: '#d0c0e5'
  on-secondary: '#362b48'
  secondary-container: '#4d4160'
  on-secondary-container: '#beafd3'
  tertiary: '#cfc2d8'
  on-tertiary: '#352d3e'
  tertiary-container: '#b1a5ba'
  on-tertiary-container: '#433b4c'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#efdbff'
  primary-fixed-dim: '#dcb8ff'
  on-primary-fixed: '#2b0052'
  on-primary-fixed-variant: '#5e2b93'
  secondary-fixed: '#ebdcff'
  secondary-fixed-dim: '#d0c0e5'
  on-secondary-fixed: '#201632'
  on-secondary-fixed-variant: '#4d4160'
  tertiary-fixed: '#ebdef4'
  tertiary-fixed-dim: '#cfc2d8'
  on-tertiary-fixed: '#201828'
  on-tertiary-fixed-variant: '#4c4355'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  h1:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  h2:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-caps:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
  caption:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  container-padding: 20px
---

## Brand & Style

This design system is built upon a foundation of **Nocturnal Sophistication**. It targets an audience that values discretion, high-level psychological insight, and modern technological aesthetics. The UI must feel like a "confidant in a pocket"—enigmatic yet reliable.

The chosen style is a hybrid of **Minimalism** and **Glassmorphism**. By utilizing deep, dark voids punctuated by translucent violet layers and vibrant accent glows, the interface evokes the feeling of a premium, high-fidelity AI service. The visual language avoids clutter, opting for generous negative space to allow the "advice" to take center stage, while subtle gradients and blurs provide a sense of depth and mystery.

## Colors

The color palette is strictly nocturnal, utilizing a "Dark Violet" spectrum. 

- **The Void (#0A0A0A):** Used for the primary screen background to ensure maximum contrast for text and to minimize eye strain.
- **Atmospheric Layers (#120B1A, #17111E):** Used for containers and interactive cards to create a sense of physical layering without breaking the dark aesthetic.
- **The Glow (#C792FF):** This brand accent should be used sparingly for primary actions, notification badges, and active states. It represents the "spark" of AI intelligence.
- **Muted Textures (#9B8DB0, #6B5C7A):** These desaturated purples handle secondary information, ensuring the visual hierarchy remains focused on the user's conversation.

## Typography

This design system utilizes **Manrope** for its balanced, modern, and highly legible characteristics. It bridges the gap between a technical "system-ui" feel and a high-end editorial look.

- **Headlines:** Use Bold (700) and Semibold (600) weights with slightly tight letter spacing to create a compact, authoritative presence.
- **Body:** Aim for high readability in AI-generated advice. Use Regular (400) weight with a generous line height (1.5x) to prevent text fatigue during long reading sessions.
- **Labels:** Small caps with tracking are used for metadata and category headers to provide a "technical dossier" feel.

## Layout & Spacing

This design system follows a **Fluid Grid** philosophy optimized for mobile viewports.

- **Grid:** A standard 4-column mobile grid with 16px gutters.
- **Margins:** 20px safe-area margins on the left and right to prevent content from feeling cramped against the device edges.
- **Rhythm:** An 8px linear scale is used for vertical spacing between elements to maintain a consistent mathematical rhythm.
- **Internal Padding:** Cards and containers should use 16px or 24px internal padding depending on the visual weight of the content.

## Elevation & Depth

Visual hierarchy is established through **Tonal Layers** and **Glassmorphism** rather than traditional drop shadows.

1. **Base (Level 0):** The deepest layer (#0A0A0A).
2. **Elevated (Level 1):** Subtle surfaces (#120B1A) used for navigation bars and tab bars.
3. **Interactive (Level 2):** Cards and buttons (#17111E). These elements use a semi-transparent border (`rgba(127, 25, 230, 0.22)`) to define their edges against the dark background.
4. **The Glow Effect:** For high-priority AI insights, apply a low-opacity radial gradient (20% opacity of #C792FF) behind the component to suggest an "ethereal" light source emanating from the AI.

## Shapes

The shape language is **Refined and Rounded**.

- **Standard Elements:** Buttons and input fields use a **0.5rem (8px)** corner radius to feel modern and accessible.
- **Large Containers:** Cards and modals use a **1rem (16px)** corner radius to create a soft, premium feel that contrasts with the "mysterious" dark palette.
- **Interactive Chips:** Tags or category filters use a **Pill-shape** (fully rounded) to distinguish them from structural card elements.

## Components

### Buttons
- **Primary:** Solid #C792FF background with #0A0A0A text. High contrast for the most important action.
- **Secondary:** Transparent background with the system-defined purple border and #FFFFFF text.
- **Ghost:** No background or border; used for secondary navigation actions.

### Cards
- Background: #17111E.
- Border: 1px solid rgba(127, 25, 230, 0.22).
- Content: 20px padding with Manrope Body-md text.

### Input Fields
- Dark-themed inputs with a #120B1A background. On focus, the border transitions to a solid #C792FF with a 4px soft outer glow.

### AI Chat Bubbles
- **User:** Muted, right-aligned, #17111E background.
- **AI Advice:** Left-aligned, featuring a subtle top-to-bottom gradient from #17111E to #120B1A, punctuated by a small #C792FF icon to indicate the source.

### Relationship Status Chips
- Small, pill-shaped indicators using secondary text colors (#9B8DB0) and a subtle background fill to categorize types of advice (e.g., "Professional," "Romantic," "Platonic").