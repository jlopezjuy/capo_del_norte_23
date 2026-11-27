# El Lobo Jujeño / Pasión de Tribuna 3D — Fun, Lobito & Arcade Challenge Overhaul
Branch: `develop` | Compliance: `node scripts/validate_compliance.mjs` (Escenario A) | Build: `npm run build`

## Specs
- S1 (Fase 1–2): Auditoría real de diversión (`docs/fun-audit/01-current-state.md`, `02-gameplay-problems.md`, `03-research-and-sources.md`, `04-fun-opportunities.md`) con capturas reales en `docs/fun-audit/before/`.
- S2 (Fase 3–4): Nuevo personaje **Lobito** articulado (cabeza, orejas móviles, cola, brazos, piernas, lentes estrella, pelota de jueguitos, bandera gigante) + `MascotController` + `MascotEventDirector` determinista (10 eventos + easter eggs, nunca invade campo durante `PLAYING`, configurable: `occasional` / `frequent` / `breaks_only` / `off`).
- S3 (Fase 5–6): Integración de Lobito en celebraciones de gol (`Lobito bailarín`, `Lobito se roba la cámara`, `El gol del carnaval`, `El arquero confundido`), sorpresas ambientales en previa/descansos/jugadas y audio procedural de murga (bombo + redoblante) y carnavalito (quena/charango) en `AudioEngine`.
- S4 (Fase 7–8): Minijuego vertical completo **"Desafío del Lobito"** (`ArcadeChallengeManager`: Penales Locos + Blancos en el Arco + Lobito Arquero cómico + combos + récord local), **Modo Sencillo vs Avanzado** (asistencia de apuntado/pase para chicos y familias) y **Medallas de Habilidad Saludables** (sin streaks ni mecánicas manipulativas).
- S5 (Fase 12–16): Tests automatizados deterministas (`scripts/test_fun_systems.mjs`), verificación en Playwright (`docs/fun-audit/after/`), reporte de rendimiento (`docs/fun-audit/12-performance.md`) y los 14 documentos concretos en `docs/fun-audit/`.

## Tasks
- [x] T1 (S1): Capturas `docs/fun-audit/before/` e investigación verificable de Game Feel, XAG 117 y UNICEF RITEC
- [x] T2 (S2, S3): Crear `js/mascot_controller.js` (`MascotController` + `MascotEventDirector`, 10 rutinas + pose blending + easter eggs) y mejorar el rig articulado de Lobito en `js/stadium_builder.js` | Route: delegated (Unit A)
- [x] T3 (S3): Agregar síntesis procedural de Murga (bombo/redoblante), Carnavalito (quena/charango) y SFX cómicos de Lobito en `js/audio_engine.js` | Route: delegated (Unit B)
- [x] T4 (S4): Crear `js/arcade_challenge.js` (`ArcadeChallengeManager` + blancos 3D en el arco + Medallas de Habilidad saludables) | Route: delegated (Unit C)
- [x] T5 (S2, S3, S4): Integrar Lobito, `MascotEventDirector`, `ArcadeChallengeManager`, Modo Sencillo/Avanzado y UI en `js/game_engine.js`, `js/goal_celebration_director.js`, `src/main.js`, `index.html` | Route: inline (Unit D)
- [x] T6 (S5): Tests deterministas (`scripts/test_fun_systems.mjs`), Playwright QA (`docs/fun-audit/after/`), `npm run build`, `npm run validate` y documentación completa en `docs/fun-audit/01..14` | Route: inline

## Log
- L1 (2026-11-27): User requested full Fun Overhaul: audit current fun gaps, design & implement expressive Lobito mascot with `MascotEventDirector`, murga/carnavalito audio, crazy goal celebrations, stadium surprises, complete playable mini-game, Easy/Advanced family mode, healthy badges, automated tests, after screenshots, and `docs/fun-audit/01..14`.
- L2 (2026-11-27): Captured 6 baseline screenshots in `docs/fun-audit/before/`. Inspected `wolfMascot` in `js/stadium_builder.js` (currently stationary behind North goal with rigid legs) and `startTraining` (basic free-roam without targets or score).
- L3 (2026-11-27): Completed Units A-D, fixed `MascotEventDirector.active` and `MascotController.group` getters caught during deterministic tests & Playwright QA, captured 6 screenshots in `docs/fun-audit/after/`, verified 0 JS `pageErrors` in desktop (1366x768) and mobile (390x844), and completed `docs/fun-audit/01..14`.
