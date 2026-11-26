# Plan y Ejecución de Sprints — El Lobo Jujeño

- **Sprint 0 (Auditoría e Investigación):** Completado — Capturas `before/` (`01` a `09`), `audit.md`, `research.md`, `sources.md`, `visual-identity.md`.
- **Sprint 1 (Identidad Visual, Menús, HUD y Escudos):** Completado — Lobby *El Lobo Jujeño*, selector de **Jugador Inicial**, `ClubBadges` SVG con caché y emblema del Lobo, HUD discreto con controles colapsables y banner de gol superior.
- **Sprint 2 (Futbolistas y Animaciones):** Completado — `PlayerRenderer` con rostro expresivo, 4 estilos de cabello, dorsal solo en espalda, articulaciones de codo/rodilla y reacciones (`frustrated`, `callingPass`, `saveCelebrate`, `celebrate`).
- **Sprint 3 (Hinchada Viva GPU + Mascota):** Completado — `CrowdSystem` con siluetas humanas instanciadas, 4 grupos de comportamiento, frustración/ola/explosión y **Mascota del Lobo 3D** animada.
- **Sprint 4 (Celebraciones de Gol):** Completado — `GoalCelebrationDirector` con **16 variantes contextuales**, historial anti-repetición, teclas interactivas `1–4`, botón Omitir, `Reducir movimiento` y `Sin flashes`.
- **Sprint 5–6 (Game Feel, Cámaras, Estadio y Audio):** Completado — Efecto Magnus, regate (`E`), hit-stop, deformación dinámica de red, banderines, fotógrafos, 5 cámaras (`broadcast`, `tactical`, `pro`, `free`, `tribuna`) y `AudioEngine` multicapa con volúmenes independientes.
- **Sprint 7 (QA y Comparación):** Completado — `node --check` en los 12 módulos JS, verificación en Playwright (`1366×768` y `390×844`) con **0 errores de consola** y capturas `after/` + `comparison.md`.
