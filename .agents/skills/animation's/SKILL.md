---
name: animation's
description: Standards and guidelines for engineering highly aesthetic, fluid, and high-performance immersive web experiences. Use when implementing or reviewing advanced UI motions, WebGL shaders, or scroll-driven interactions.
---

# Creative Web Animation Skill

When engineering or reviewing creative motion on the web, follow these architectural principles and technical steps to ensure an ultra-premium, high-performance visual experience.

## Interaction Checklist

1. **Fluidity & Organic Curves**: Avoid rigid, linear transitions. Use custom cubic-beziers or spring-physics engines (`Framer Motion`, `GSAP` physics) to ensure motion feels natural and snappy.
2. **WebGL & Shader Integrity**: Ensure image distortions, particle systems, or liquid ripples are handled via the GPU (`Three.js`, `GLSL`). The CPU should not handle heavy visual calculations.
3. **Scrollytelling & Flow**: When building scroll-driven animations, verify that native browser scrolling is decoupled and smoothed using a virtual scroll engine (`Lenis`). Camera paths through 3D space should feel continuous, not disjointed.
4. **Tactile Micro-Interactions**: Interface elements (buttons, magnetic links, custom cursors) must provide immediate, organic feedback curves upon hover or proximity.

## Performance & Optimization Guardrails

To achieve a consistent 60fps/120fps experience without causing visual lag or overheating devices, verify the following strict performance boundaries:

- **Hardware Acceleration**: Only animate properties that do not trigger layout repaints. Stick strictly to `transform` (translations, scales, rotations) and `opacity`. Use `will-change` hints sparingly but strategically.
- **Render Loop Discipline**: Heavy mathematical computations must be bound tightly to a single `requestAnimationFrame` render loop or a framework hook (e.g., React Three Fiber's `useFrame`).
- **Asset Pipeline Efficiency**: Verify all 3D assets (`.gltf` / `.glb`) utilize Draco compression. Texture maps must be aggressively minified (WebP or Basis formats) and lazy-loaded.

## How to Provide Motion Feedback

When conducting code or visual reviews on creative animation PRs:
- **Quantify the curve**: Don't just say "the movement feels weird." Specify if the easing curve is too linear, if the spring tension needs adjusting, or if there is layout jank.
- **Check the profile**: Request a performance profile if the animation drops frames on mid-range mobile devices.
- **Enforce fallbacks**: Ensure there is always a clean, static fallback or a reduced-motion option (`prefers-reduced-motion`) for accessibility and lower-end hardware.