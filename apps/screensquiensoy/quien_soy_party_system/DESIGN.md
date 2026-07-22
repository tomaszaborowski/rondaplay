---
name: Quien Soy Party System
colors:
  surface: '#fff7fc'
  surface-dim: '#e0d8de'
  surface-bright: '#fff7fc'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#faf1f8'
  surface-container: '#f4ebf2'
  surface-container-high: '#eee6ec'
  surface-container-highest: '#e8e0e7'
  on-surface: '#1e1a1f'
  on-surface-variant: '#4c444e'
  inverse-surface: '#332f34'
  inverse-on-surface: '#f7eef5'
  outline: '#7d747f'
  outline-variant: '#cec3d0'
  surface-tint: '#764d91'
  primary: '#2c0247'
  on-primary: '#ffffff'
  primary-container: '#431c5d'
  on-primary-container: '#b285cd'
  inverse-primary: '#e3b5ff'
  secondary: '#006a61'
  on-secondary: '#ffffff'
  secondary-container: '#72f5e3'
  on-secondary-container: '#006f65'
  tertiary: '#3d0019'
  on-tertiary: '#ffffff'
  tertiary-container: '#63002d'
  on-tertiary-container: '#f06994'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#f4daff'
  primary-fixed-dim: '#e3b5ff'
  on-primary-fixed: '#2e0348'
  on-primary-fixed-variant: '#5d3577'
  secondary-fixed: '#75f7e6'
  secondary-fixed-dim: '#55dbca'
  on-secondary-fixed: '#00201c'
  on-secondary-fixed-variant: '#005048'
  tertiary-fixed: '#ffd9e1'
  tertiary-fixed-dim: '#ffb1c4'
  on-tertiary-fixed: '#3f001a'
  on-tertiary-fixed-variant: '#881644'
  background: '#fff7fc'
  on-background: '#1e1a1f'
  surface-variant: '#e8e0e7'
  correct-green: '#4ade80'
  incorrect-red: '#f87171'
  ronda-slate: '#2b2d42'
  ronda-light: '#fdf4ff'
  purple-dark: '#2a113a'
  teal-dark: '#289689'
  pink-dark: '#d95a82'
typography:
  display-lg:
    fontFamily: Fredoka
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 52px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Fredoka
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 36px
  headline-lg-mobile:
    fontFamily: Fredoka
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Fredoka
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Nunito Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 28px
  body-md:
    fontFamily: Nunito Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-lg:
    fontFamily: Nunito Sans
    fontSize: 14px
    fontWeight: '800'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-md:
    fontFamily: Nunito Sans
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 14px
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  margin-mobile: 1.25rem
  margin-desktop: 2.5rem
  gutter: 1rem
  touch-target-min: 3rem
  stack-sm: 0.5rem
  stack-md: 1rem
  stack-lg: 2rem
---

## Brand & Style

The design system for **¿Quién Soy?** is built upon the **Tactile / Skeuomorphic** movement, blended with **High-Contrast Bold** elements to create a high-energy, premium party game atmosphere. The brand personality is joyful, inclusive, and kinetic, designed to evoke the excitement of a live social gathering.

Visuals emphasize physical presence through "squishy" 3D buttons, thick strokes, and layered depth. The interface must feel responsive and "clickable," ensuring that players of all ages—from children to grandparents—feel an immediate, intuitive connection to the game mechanics. The aesthetic is bilingual by nature, ensuring that Spanish and English typography receive equal visual weight and legibility.

## Colors

The palette is anchored by the RondaPlay trio: **Ronda Purple** for structural identity, **Ronda Teal** for logic-based actions, and **Ronda Pink** for speed and excitement. 

### Color Usage
- **Primary (Purple):** Backgrounds, headers, and core branding.
- **Secondary (Teal):** Primary success actions and "Logic" mode UI.
- **Tertiary (Pink):** High-alert interactions, secondary buttons, and "Speed" mode UI.
- **Game States:** Use **Vibrant Green** for correct guesses and **Bright Red** for passes or errors.
- **Neutral:** **Ronda Slate** provides high-legibility text contrast, while **Ronda Light** serves as a warm, inviting canvas for cards and panels.

This system supports a **Dark Mode** where the background shifts to `purple-dark`, and surface containers utilize semi-transparent glassmorphism over the deep base.

## Typography

Typography focuses on approachable geometry. **Fredoka** is the voice of the game—used for all headlines, big scores, and character names. Its rounded terminals mirror the tactile nature of the UI. 

**Nunito Sans** handles the functional heavy lifting. It is used for instructions, settings, and bilingual toggle labels. To maintain the "game" feel, labels and buttons often use the Heavy (800) weight of Nunito with slight letter spacing to ensure readability during fast-paced play. Bilingual text should always maintain the same weight and size for both languages, often stacked vertically or separated by a clear divider.

## Layout & Spacing

This design system utilizes a **Fluid Grid** model with high safe-margin priorities to accommodate various mobile aspect ratios. 

- **Vertical Rhythm:** Components are stacked using 8px increments.
- **Touch Areas:** Every interactive element must adhere to a minimum `48px` (3rem) height. 
- **Bilingual Layouts:** When displaying English and Spanish simultaneously, use a 2-column grid for short labels or a vertical stack for long sentences, with English always appearing first (top or left).
- **Safe Zones:** High-density play areas (like the "Who Am I?" card) are centered with 20px of clear space to avoid accidental triggers of the system navigation.

## Elevation & Depth

Hierarchy is established through **Physical Layering** and **3D Extrusions** rather than traditional soft shadows.

1.  **Level 0 (Background):** Flat brand purple or a gradient.
2.  **Level 1 (Cards):** Surfaces use a 32px (`rounded-2xl`) corner radius with a subtle 1px border.
3.  **Level 2 (Interactive):** Buttons use a "block-shadow" technique—a solid, non-blurred offset color (6px) that matches the base color but darker (`teal-dark` or `pink-dark`).
4.  **Game State Overlays:** Use **Glassmorphism** (backdrop-filter: blur(12px)) for pauses or settings menus to keep the game context visible while focusing on the task.

## Shapes

The shape language is dominated by **extreme roundedness**. 

- **Pill Shapes:** All primary action buttons and score badges use `rounded-full` to emphasize safety and friendliness.
- **Card Containers:** Main game cards use a specific 32px radius to feel like physical board game tiles.
- **Icons:** Icons should feature rounded caps and corners to match the Fredoka typeface. 
- **Selection States:** Active choices are indicated by thick (4px-6px) rounded strokes surrounding the element.

## Components

### Tactile Buttons
Buttons must feature a 6px bottom "offset" to simulate a 3D physical object. On `active` or `pressed` states, the button should translate 4px downward on the Y-axis, reducing the offset to create a "pushed" effect.

### Bottom Navigation Bar
The navigation bar is a semi-transparent floating capsule or a glassmorphic bar.
- **Play:** `gamepad` icon. Primary center focus.
- **How to Play?:** `question_mark` icon.
- **Settings:** `settings` icon.
- *Styling:* Icons are rendered in `ronda-light` when inactive and `secondary (teal)` when active.

### Game State Cards
Large-format white cards with `rounded-[2rem]`. 
- **Wait State:** Neutral gray background with a subtle "RondaPlay" pattern.
- **Correct State:** Neon Green border pulse + particle burst.
- **Pass State:** Red border shake animation.

### Input Fields
Rounded-xl (12px) fields with a warm lavender background (`ronda-light`). Focus states use a 2px `ronda-teal` stroke.

### Bilingual Toggle
A pill-shaped switch that allows instant swapping between English and Spanish, or a dual-text mode where both are displayed.