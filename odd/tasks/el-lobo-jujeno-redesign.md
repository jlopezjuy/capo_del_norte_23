# El Lobo Jujeño — Rediseño Integral 3D
Branch: `develop` | Direction: C (Híbrido Realista + Arcade)
Tracking: ODD Feature Document

## Specs
- S1: Auditoría real con capturas en `docs/design-audit/before/` (1366x768, 1920x1080, 390x844) e investigación verificable en `docs/design-research/research.md` y `sources.md`.
- S2: Identidad visual única (Híbrido realista Estadio 23 de Agosto + arcade expresivo), Lobby con identidad "EL LOBO JUJEÑO", selector de jugador/titular inicial, HUD discreto con escudos SVG reutilizables, sin glassmorphism/glow genérico.
- S3: Futbolistas 3D estilizados con anatomía coherente (cabeza con rostro expresivo, cabello, torso con bastones albicelestes y dorsal solo atrás, brazos y piernas articulados, medias, botines, variación de altura/complexión) y blending de poses + reacciones (`frustrated`, `call_for_pass`, `gk_save_celebrate`, `celebrate`).
- S4: Hinchada viva GPU (`InstancedMesh` + `onBeforeCompile`) con siluetas humanas variadas, banderas, bufandas, trapos jujeños, Mascota del Lobo 3D, reacciones por peligro/gol/atajada y densidad adaptativa (`low`/`medium`/`high`/`auto`).
- S5: `GoalCelebrationDirector` con 16 celebraciones contextuales, replay cinematográfico, teclas interactivas opcionales (`1`-`4`), botón omitir, modo `Reducir movimiento` y separación estricta de las reglas del partido (marcador único).
- S6: Game feel (tiros con efecto/Magnus, pase al espacio, regate, hit-stop, estela), cámaras (`broadcast`, `pro`, `tactical`, `free`, `replay`, `celebration`, `tribuna`), deformación dinámica de red, detalles de estadio, audio multicapa con volúmenes independientes.
- S7: Validación integral en navegador (Playwright, 0 errores consola, métricas FPS/draw calls), capturas `docs/design-audit/after/`, `comparison.md` y documentación completa en `docs/`.

## Tasks
- [x] T1 (S1, S2): Investigación web, auditoría `before/`, guía visual, rediseño de Lobby/HUD/Escudos/Selector de jugador | Route: inline | Commit: working-tree
- [x] T2 (S3): Rediseño de futbolistas 3D expresivos y sistema de animación con blending | Route: inline | Commit: working-tree
- [x] T3 (S4): Hinchada viva GPU con siluetas, trapos jujeños y Mascota del Lobo | Route: inline | Commit: working-tree
- [x] T4 (S5): GoalCelebrationDirector (16 celebraciones, replay, interactividad 1-4, accesibilidad) | Route: inline | Commit: working-tree
- [x] T5 (S6): Game feel, cámaras, deformación de red, detalles de estadio y audio multicapa | Route: inline | Commit: working-tree
- [x] T6 (S7): QA en navegador, capturas `after/`, `comparison.md` y cierre de documentación | Route: inline | Commit: working-tree

## Log
- L1: User requested full mission "TRANSFORMAR EL LOBO JUJEÑO EN UN VIDEOJUEGO MEMORABLE" without clarifying questions: audit, run & screenshot before, research communities, define Art Direction C, redesign players, badges/kits, living crowd, 16+ goal celebrations, game feel, cameras, stadium/net/lighting, UI/HUD, reactive audio, optimization, after screenshots, comparison, QA, and full docs/.
- L2: Initial inspection on `develop` (commit `030f779`) showed existing prototype modules (`player_renderer.js`, `crowd_system.js`, `goal_celebration_director.js`, `club_badges.js`, etc.) with boxy/Minecraft-like players and crowd, static wireframe goal net, partial `volumes.sfx` bug, duplicate mesh calls in `stadium_builder.js`, missing player selector, and minimal placeholder docs. Captured `before/` screenshots in `docs/design-audit/before/`.
