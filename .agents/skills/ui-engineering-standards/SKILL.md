---
name: ui-engineering-standards
description: Applies 2026 UI engineering and usability standards to front-end development tasks. Use when writing or reviewing CSS, React components, Tailwind styling, dark mode configuration, interactive layouts, or verifying WCAG 2.2 Level AA accessibility and color contrast.
---

# UI Engineering & Usability Standards (2026)

This Antigravity Skill serves as a system instruction guide to help you, the AI agent, design, evaluate, and implement high‑performance, accessible, and visually compelling user interfaces. Follow these constraints proactively when writing frontend layouts, styling modules, or auditing existing codebases.

## 1. Skill Execution Triggers

**Active Scenarios:** Proactively apply this skill when writing React/HTML structures, Tailwind configs, custom CSS, modal overlays, dark mode states, animations, transitions, or checking visual accessibility ratios.

**Deactivation Rules:** Do not apply these rules if the project constraints mandate a strict light‑only, flat monochrome, or print‑only presentation.

## 2. Core Visual and Usability Paradigms

When creating or modifying components, maintain the following visual structures:

- **Optimized Dark Mode** – Soft charcoal base (`#121212`) and desaturated accents; reduces bounce rate and visual fatigue.
- **Spatial Glassmorphism** – Translucent overlays using GPU‑optimized `backdrop-filter` with thin low‑opacity white stroke borders; fallback to solid high‑contrast cards when `prefers-reduced-transparency` is set.
- **Immediate Cognitive Hierarchy** – Layered depth with micro‑interactions providing feedback within 150‑300 ms.
- **Generative Anchors** – Shifting radial mesh‑gradient backdrops and dynamic orbs as ambient AI state indicators.

## 3. Dark Mode Implementation Constraints

- Avoid simple color inversion. Build dark themes with physiological considerations:
  - Use `#121212` or `#1a1a1a` instead of pure black to prevent halation.
  - Desaturate high‑saturation accents slightly.
  - Leverage OLED power savings (39‑47 % at max brightness).

## 4. Spatial Layering and Glassmorphic Containers

- **Performance Principle:** Limit `backdrop-filter: blur()` to small, static components (floating actions, nav headers, modals). Do not apply to large scrolling containers.
- **Visual Separation:** Add a thin border `rgba(255,255,255,0.1)` to prevent bleed.
- **Accessibility Fallbacks:** Detect `prefers-reduced-transparency` and switch to solid opaque cards.

## 5. Timing and Rules for Micro‑interactions

- **Strict UI Budgets:** Hover/toggle animations complete in 150‑300 ms; context shifts (modals, panels) under 500 ms.
- **GPU Acceleration:** Use `transform: translate3d()` and `opacity`; avoid animating `height`, `width`, or standard `box‑shadow`.
- **Reduced Motion:** Wrap key animations inside `@media (prefers-reduced-motion: reduce)`; provide static fallbacks.
- **Validation Feedback:** Apply rapid localized shake animation on validation errors rather than only red text.

## 6. Mathematical Contrast Calculations (WCAG 2.2 AA / AAA)

You must mathematically verify contrast compliance before generating or editing styling configurations.

### Relative Luminance Formula
```
L = 0.2126 × R + 0.7152 × G + 0.0722 × B
```
where each linearized component X is derived from sRGB:
```
if X_sRGB ≤ 0.04045 → X = X_sRGB / 12.92
else → X = ((X_sRGB + 0.055) / 1.055) ^ 2.4
```

### Contrast Ratio Equation
```
CR = (L1 + 0.05) / (L2 + 0.05)
```
- Normal text: Minimum 4.5:1 (AA) or 7:1 (AAA)
- Large text: Minimum 3:1 (AA) or 4.5:1 (AAA)
- Non‑text UI elements: Minimum 3:1
- **CVD Safeguard:** Never rely on color alone; pair with underlines, labels, patterns, or bold tags.

---

*Apply these standards whenever you author or review UI code to ensure modern, accessible, and performant experiences.*
