# RondaPlay Double Spot It - Design System Spec (Stitch Guide)

This document contains the visual identity, typography system, spacing architecture, color tokens, and layout guidelines for the **Double Spot It** (Speed Match) WebRTC P2P game sequence on **RondaPlay**. Use this file in Google Stitch to generate and edit matching mobile app screens and mockups.

---

## 🎨 Visual Palette & Color Tokens

Our brand colors are vibrant, tactile, and highly energetic, designed to look premium yet friendly for players of all ages (6 to 99).

### Primary Colors
*   **Ronda Purple** (`#431c5d` / `var(--color-ronda-purple)`): The dominant brand color. Used for headers, prominent containers, and dark-themed components.
*   **Ronda Purple Dark** (`#2a113a` / `var(--color-ronda-purpleDark)`): Used for deep background blocks, sidebar frames, and shadow bases.
*   **Ronda Teal** (`#34c2b2` / `var(--color-ronda-teal)`): The primary action color. Represents "Logic" & "Memory" modes. Used for active indicators, primary buttons, and borders.
*   **Ronda Teal Dark** (`#289689` / `var(--color-ronda-tealDark)`): Used for 3D tactile button shadows and hovered states.
*   **Ronda Pink** (`#ff75a0` / `var(--color-ronda-pink)`): The secondary action color. Represents "Speed" modes. Used for alerts, interactive badges, premium callouts, and secondary buttons.
*   **Ronda Pink Dark** (`#d95a82` / `var(--color-ronda-pinkDark)`): Used for 3D tactile pink button shadows.

### Neutral Colors
*   **Ronda Light** (`#fdf4ff` / `var(--color-ronda-light)`): Warm lavender-white. Used as background for standard cards and user panels.
*   **Ronda Slate** (`#2b2d42` / `var(--color-ronda-slate)`): Text and body color. Highly legible dark gray.
*   **Off-White Background** (`#f9fafb`): Default page canvas background.

---

## 🔠 Typography Hierarchy

RondaPlay uses a clean, distinct typography hierarchy optimized for readability on devices positioned in the middle of a table.

*   **Heading Font**: `Fredoka` (Sans-serif)
    *   *Tone*: Rounded, friendly, high presence.
    *   *Usage*: All titles, major headings, cards, and logo lockups.
*   **Body & UI Font**: `Poppins` (Sans-serif)
    *   *Tone*: Modern, clean, geometric.
    *   *Usage*: Navigations, badges, form labels, and UI headers.
*   **Long-form Content Font**: `Nunito` (Sans-serif)
    *   *Tone*: Highly legible, friendly curves.
    *   *Usage*: Body paragraphs, instructions, legal texts.

### Type Scale Rules (for mobile views)
| Token | Font Family | Size | Weight | Line Height | Usage |
|---|---|---|---|---|---|
| `h1` | Fredoka | `32px` | `700` (Bold) | `1.1` | Hero Title, Page Main Headers |
| `h2` | Fredoka | `24px` | `700` (Bold) | `1.2` | Card/Section Titles |
| `h3` | Fredoka | `18px` | `600` (SemiBold)| `1.3` | Small Group Titles, Form Headers |
| `body-large` | Poppins | `16px` | `500` (Medium)  | `1.5` | Lead sentences, large links |
| `body` | Nunito | `14px` | `400` (Regular) | `1.6` | Description text, paragraphs |
| `caption` | Poppins | `12px` | `700` (Bold) | `1.0` | Badges, tags, active buttons |

---

## 📐 Spacing & Layout Tokens

RondaPlay components are spacious, touch-friendly, and organic.

*   **Border Radius**:
    *   `rounded-[2rem]` (`32px`): Used for primary game cards, modals, and container wrappers.
    *   `rounded-xl` (`12px`): Used for inputs, textareas, and admin dashboard lists.
    *   `rounded-full`: Used for interactive pills, badges, and all primary buttons.
*   **Touch Targets (Buttons/Links)**: Minimum `48px` height for all mobile interactive items.
*   **Logo Clear Space**: Always keep a minimum of `20px` padding around the RondaPlay logo.

---

## 🧱 Component Styling System

To maintain the premium tactile feel, follow these component specifications in Stitch:

### 1. Game Mode & Interactive Cards
*   **Background**: `Ronda Light` (`#fdf4ff`)
*   **Border**: `1px` solid `rgba(67, 28, 93, 0.05)` (very light purple)
*   **Corner Radius**: `32px` (`rounded-[2rem]`)
*   **Shadow**: `0 15px 35px rgba(0, 0, 0, 0.05)` (subtle deep elevation)

### 2. Tactile Buttons (3D Game Feel)
*   **Primary Button (Teal)**:
    *   *Base color*: `#34c2b2`
    *   *3D Shadow*: `0 6px 0 #289689`
    *   *Transition on tap*: Shift down by `6px`, remove shadow.
*   **Secondary Button (Pink)**:
    *   *Base color*: `#ff75a0`
    *   *3D Shadow*: `0 6px 0 #d95a82`
    *   *Transition on tap*: Shift down by `6px`, remove shadow.

### 3. Glassmorphism Topbar & Headers
*   **Style**: Semi-transparent, blur background overlay.
*   **CSS Class / Styling**: `rgba(67, 28, 93, 0.60)` background, `backdrop-filter: blur(10px)`, white border-bottom at `1px` with `10%` opacity.

---

## 📱 Mobile App Screens Sequence (Game Flow)

This lists the step-by-step game screens and sequences for the local P2P WebRTC matchmaking game in RondaPlay.

### Screen 1: Main Menu (Mode Selection)
*   **Background**: Hero gradient backdrop (`linear-gradient(135deg, #2a0a4a 0%, #431c5d 40%, #209c95 80%, #a82d8c 100%)`).
*   **Header**: Centered RondaPlay logo (`w-48`) with clear space.
*   **Middle Section**:
    *   Vibrant title: "Speed Match" in large Fredoka heading (`h1`, `#34c2b2`).
    *   Body text describing play styles.
*   **Actions (Vertical stack of buttons)**:
    *   `🎮 Single Player Practice` (Primary teal tactile button, rounded-full)
    *   `📡 Host Multiplayer Arena` (Secondary pink tactile button, rounded-full)
    *   `📲 Join Game Session` (Glassmorphic border button, text white, rounded-full)

### Screen 2: WebRTC Host Lobby (Session Offer)
*   **Background**: Deep purple backdrop (`#2a113a`).
*   **Header**: Back arrow icon + "Host Arena" text.
*   **Middle Section**:
    *   Instruction badge: "Step 1: Have Guest scan this QR code"
    *   Central QR Code box: White rounded card (`rounded-[2rem]`) hosting the Offer QR code image.
    *   Lobby Status label: "Waiting for player connection..." (small spinner).
*   **Actions**:
    *   `📸 Scan Guest's Answer Code` (Tactile pink button, triggers camera/scanning page overlay).
    *   Manual link option: "Trouble with cameras? Copy link" (text link).

### Screen 3: WebRTC Joiner Lobby (Session Scan & Answer)
*   **Background**: Deep purple backdrop (`#2a113a`).
*   **Header**: Back arrow icon + "Join Arena" text.
*   **Middle Section**:
    *   Camera scanner viewport: Circular scanning frame with a green laser pulse animation overlay.
    *   Or, once scanned: "Step 2: Show this QR code to the Host".
    *   Lobby Status: "Generating response..." (displays Client Answer QR code card).

### Screen 4: Active Game Arena
*   **Background**: Radial dark purple-teal gradient (`#1e112a` to `#209c95`).
*   **Top HUD**:
    *   Dual Score capsule: Rounded-full badge showing "You: 3" vs "Opponent: 1" with colored avatars.
    *   Status indicator: Green dot representing "P2P Connected".
*   **Center Section (Common Card)**:
    *   A large white circle (`w-48 h-48`) with a solid teal border (`border-[6px] border-[#34c2b2]`).
    *   Contains 4 symbols (emojis: `🦖`, `🦊`, `⭐`, `🤖`) randomly rotated/scaled in distinct corners.
*   **Separator**: Bouncing white chevron icon pointing downwards (`v`).
*   **Bottom Section (Player Card)**:
    *   A slightly larger white circle (`w-56 h-56`) with a solid pink border (`border-[6px] border-[#ff75a0]`).
    *   Contains 4 symbols (emojis: `🦊`, `👻`, `🚀`, `🍎`).
    *   *Interaction*: The player taps the matching symbol (`🦊`).

### Screen 5: Match Feedback states
*   **Correct Match View**:
    *   Common Card flashes neon teal glow.
    *   Burst of pink star particles explodes outwards from the tapped symbol.
    *   Score changes color and floats upwards (+1).
*   **Incorrect Match View**:
    *   Player Card flashes border red (`#ef4444`).
    *   Card performs a rapid horizontal shake animation (`animate-shake`).
    *   Short low-pitch buzz sound synthetically played.

### Screen 6: Match Complete (Winner Reveal)
*   **Background**: Vibrant victory background with gold/teal lights.
*   **Middle Section**:
    *   Winner header: "🏆 Victory!" or "🥈 Good Game!" in Fredoka title font.
    *   Scores box: White card listing Final Scores side-by-side with avatars.
*   **Actions**:
    *   `🔄 Play Again` (Tactile teal button)
    *   `🏠 Return to Menu` (Glassmorphic purple border button)
