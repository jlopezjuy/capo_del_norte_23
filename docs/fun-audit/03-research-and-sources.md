# 03 — Investigación de Game Design, Accesibilidad y Fuentes

Separación explícita entre guías técnicas/institucionales respaldadas por investigación y recomendaciones de industria/comunidad.

## 1. Fuentes Institucionales y Guías Técnicas Oficiales

| Fuente | URL | Fecha de consulta | Principio Extraído | Aplicación al Proyecto |
|---|---|---|---|---|
| **Xbox Accessibility Guidelines — XAG 117** (Visual Distractions & Motion) | https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/117 | 2026-11-27 | Proveer controles claros para reducir movimiento, sacudida de cámara y distracciones ambientales que afectan atención o generan mareo. | `Reducir movimiento` y `Sin flashes` aplicados también a `MascotController`, `MascotEventDirector` y `ArcadeChallengeManager`. |
| **Game Accessibility Guidelines (GAG)** — Cognitive Simplicity | https://gameaccessibilityguidelines.com/ | 2026-11-27 | Lenguaje simple, práctica libre de castigo, objetivos persistentes y asistencia de dificultad para públicos familiares/infantiles. | **Modo Sencillo (Chicos / Familiar)** con asistencia de apuntado + **Desafío del Lobito** sin penalización al fallar. |
| **UNICEF — Children's Rights and Online Gaming (RITEC)** | https://www.unicef.org/reports/childrens-rights-and-online-gaming | 2026-11-27 | Autonomía, competencia justa y progresión **no manipulativa**: prohibir FOMO, streaks punitivos, loot boxes y presión emocional para pagar. | Medallas puramente por habilidad local (`localStorage`), cero streaks, y enlaces de apoyo separados fuera del gameplay infantil. |
| **Three.js `InstancedMesh` Documentation** | https://threejs.org/docs/pages/InstancedMesh.html | 2026-11-27 | Reutilizar geometrías/materiales y pre-asignar pools de objetos para mantener 60 FPS en navegador. | Reutilización del mismo rig de Lobito y piscina fija de blancos 3D / VFX sin recrear mallas. |

## 2. Industria y Comunidades de Desarrollo

| Fuente | URL | Fecha de consulta | Consenso / Hallazgo | Decisión |
|---|---|---|---|---|
| **Game Developer — *Is your game juicy enough?* / GDC *Juice It or Lose It*** | https://www.gamedeveloper.com/design/video-is-your-game-juicy-enough- | 2026-11-27 | Sesiones cortas arcade necesitan feedback inmediato en cada impacto (ascenso de pitch en combos, hit-stop, partículas y humor físico). | **Implementado** en `playChallengeHit(combo)`, blancos reactivos y comedia física de Lobito (`torpe`, `estrella`). |
| **`r/gamedesign` & `r/gamedev`** — Humor emergente y ritmo | https://www.reddit.com/r/gamedesign/ | 2026-11-27 | El humor y las sorpresas funcionan mejor en **ventanas naturales de respiro** (goles, descansos, previa) y nunca robando el control en medio de una jugada. | **Implementado** como regla estricta de `MascotEventDirector`: nunca invade el campo durante `PLAYING`. |
