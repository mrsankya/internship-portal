---
name: Academic Pulse
colors:
  surface: '#faf8ff'
  surface-dim: '#d9d9e5'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3fe'
  surface-container: '#ededf9'
  surface-container-high: '#e7e7f3'
  surface-container-highest: '#e1e2ed'
  on-surface: '#191b23'
  on-surface-variant: '#434655'
  inverse-surface: '#2e3039'
  inverse-on-surface: '#f0f0fb'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#505f76'
  on-secondary: '#ffffff'
  secondary-container: '#d0e1fb'
  on-secondary-container: '#54647a'
  tertiary: '#943700'
  on-tertiary: '#ffffff'
  tertiary-container: '#bc4800'
  on-tertiary-container: '#ffede6'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#d3e4fe'
  secondary-fixed-dim: '#b7c8e1'
  on-secondary-fixed: '#0b1c30'
  on-secondary-fixed-variant: '#38485d'
  tertiary-fixed: '#ffdbcd'
  tertiary-fixed-dim: '#ffb596'
  on-tertiary-fixed: '#360f00'
  on-tertiary-fixed-variant: '#7d2d00'
  background: '#faf8ff'
  on-background: '#191b23'
  surface-variant: '#e1e2ed'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.4'
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-xl-mobile:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '800'
    lineHeight: '1.1'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  3xl: 64px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
---

## Brand & Style

This design system is built for a high-energy collegiate environment, balancing institutional credibility with the vibrancy of student life. The aesthetic is **Corporate Modern** with a lean towards **Minimalism**, ensuring that the focus remains on event discovery and campus engagement. 

The visual language communicates reliability and intelligence through structured layouts and precise typography, while the "Electric Blue" primary color injects a sense of urgency and excitement. The interface is intentionally airy and spacious, optimized for mobile-first interactions where students can quickly scan, register, and share events.

## Colors

The palette is anchored by **Electric Blue**, a high-saturation primary color used for actions, progress, and branding. **Slate Gray** provides a professional secondary tone for metadata and secondary information.

### Color Strategy
- **Light Mode:** Uses a "Soft Off-White" (#F8FAFC) background to reduce eye strain compared to pure white, while keeping card surfaces pure white (#FFFFFF) for maximum elevation contrast.
- **Dark Mode:** Transitions to a **Zinc-based** palette. The background is a deep Zinc (#09090B) with surfaces at Zinc-900 (#18181B).
- **Accessibility:** All text-on-background combinations must meet WCAG AA standards. Primary buttons utilize white text on Electric Blue.

## Typography

The design system utilizes **Inter** exclusively to ensure a systematic, utilitarian, and clean feel across all platforms. 

- **Hierarchy:** Use `headline-xl` for page titles and hero sections to create impact.
- **Readability:** Body text uses a generous line height (1.5 - 1.6) to accommodate long event descriptions.
- **Labels:** Uppercase labels with increased letter spacing are used for event categories and metadata tags to distinguish them from standard body copy.

## Layout & Spacing

The design system follows a **Fluid Grid** model with an 8px base unit. 

- **Desktop:** 12-column grid with 24px gutters and a max container width of 1280px.
- **Mobile:** 4-column grid with 16px margins.
- **Rhythm:** Vertical spacing between sections should primarily use `3xl` (64px) on desktop and `xl` (32px) on mobile to maintain a sense of openness.
- **Safe Areas:** Ensure interactive elements (buttons/inputs) have at least 44px of hit area height for mobile accessibility.

## Elevation & Depth

This design system uses **Tonal Layers** combined with **Ambient Shadows** to define hierarchy.

- **Level 0 (Background):** Used for the main canvas (Slate-50 or Zinc-950).
- **Level 1 (Cards/Surfaces):** Pure white or Zinc-900. These use a very soft, diffused shadow: `0px 4px 20px rgba(0, 0, 0, 0.05)`.
- **Level 2 (Modals/Popovers):** Higher elevation with a more pronounced shadow: `0px 10px 30px rgba(0, 0, 0, 0.12)`.
- **Interactions:** On hover, cards should slightly lift (translate -2px vertically) and the shadow should increase in spread to provide tactile feedback.

## Shapes

The shape language is friendly but professional, utilizing a **Rounded** philosophy.

- **Standard Radius:** 0.5rem (8px) for buttons and inputs.
- **Large Radius (2xl):** 1rem (16px) for cards, event banners, and image containers.
- **Full Radius:** Used for status chips and user avatars to provide organic contrast against the structured grid.

## Components

### Buttons
- **Primary:** Electric Blue background, white text. 16px horizontal padding, 12px vertical. Semi-bold text.
- **Secondary:** Transparent background with a 1px Slate-200 border (Light Mode) or Zinc-700 (Dark Mode).

### Cards (Event Cards)
- Large `rounded-xl` corners.
- Padding should be internal-first: 24px padding for content below the image.
- Image aspect ratio fixed at 16:9 or 4:3.

### Chips & Tags
- Used for categories (e.g., "Workshop", "Social").
- Backgrounds should be low-opacity versions of the primary color (10%) with 100% opacity text for contrast.

### Input Fields
- 1px border. On focus, the border changes to Electric Blue with a subtle 2px outer glow of the same color.
- Labels are always positioned above the input field using `label-sm`.

### Specific System Components
- **Event Timeline:** A vertical line component with dots for multi-day events.
- **Registration Bar:** A sticky bottom bar for mobile screens containing the CTA button for event registration.