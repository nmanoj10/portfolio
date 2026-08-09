# Design System Guidelines (Manoj Portfolio)

All upcoming pages, layouts, and UI sections created or modified in this workspace must adhere to the design system established in `motion-footer.tsx`.

## 1. Typography
- **Primary Font:** `Plus Jakarta Sans`, sans-serif. Ensure it is imported/active.
- **Font Weights:**
  - Standard/Body: `400` / `500`
  - High Contrast Headings: `800` / `900` (`font-black`) with `tracking-tighter` / `letter-spacing: -0.04em`.
- **Editorial Text Style:** Metallic gradients instead of flat colors. Use a drop-shadow glow:
  ```css
  background: linear-gradient(180deg, var(--foreground) 0%, color-mix(in oklch, var(--foreground) 40%, transparent) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0px 0px 20px color-mix(in oklch, var(--foreground) 15%, transparent));
  ```

## 2. Colors & Background Patterns
- **Base Background:** `#0b0b0d` or dark theme (`oklch(0.145 0 0)` / pure black `bg-black`).
- **Ambient Aurora Glow:** Slow-breathing radial wash lights:
  ```css
  background: radial-gradient(
    circle at 50% 50%, 
    color-mix(in oklch, var(--primary) 15%, transparent) 0%, 
    color-mix(in oklch, var(--secondary) 15%, transparent) 40%, 
    transparent 70%
  );
  ```
- **Grid Overlay:**
  - Size: `60px 60px`
  - Lines: `color-mix(in oklch, var(--foreground) 3%, transparent) 1px`
  - Fade mask at top and bottom using linear gradients.

## 3. Interactive Buttons (Glass Pills)
- All interactive pills, tags, and secondary action buttons must match the glass pill design:
  - **Background:** `linear-gradient(145deg, var(--pill-bg-1) 0%, var(--pill-bg-2) 100%)`
  - **Border:** `1px solid color-mix(in oklch, var(--foreground) 16%, transparent)`
  - **Hover Border:** `color-mix(in oklch, var(--foreground) 35%, transparent)`
  - **Blur:** `backdrop-filter: blur(16px)`
  - **Default Text Color:** `text-muted-foreground`
  - **Hover Text Color:** `text-white` or `text-foreground`
  - **Micro-Animations:** Use GSAP magnetic pull effects on interactive hover states.
