# Plan y Ejecución de Sprints — Rediseño Integral (v1 + Transformación v2)

Cada sprint produjo código funcional verificable en navegador, validado con `node --check`, `node scripts/validate_compliance.mjs` y capturas reales en Playwright.

- **Sprint 0 — Auditoría Visual e Investigación (`docs/design-audit/before/`, `docs/design-research/`):**
  - Inspección real del código completo, medición baseline (`989–1.319` draw calls, causa raíz del whiteout en tribunas, brechas en jugadores y celebraciones), capturas reales en `1920×1080`, `1366×768` y `390×844`, investigación verificable (`research.md`, `sources.md`) y guía de Dirección Artística C (`visual-identity.md`).
- **Sprint 1 — Diseño Visual Global, Menús, HUD y Accesibilidad (`index.html`, `js/club_badges.js`):**
  - Sincronización dinámica del Lobby con el esquema real (`Clásico PES` ↔ `Moderno WASD`) + botón de cambio inmediato, acceso a Ajustes desde Pausa, persistencia en `localStorage` (`pasion_settings_v2`), detección automática de `prefers-reduced-motion`, telemetría opcional FPS/Draw Calls, `role="dialog" aria-modal="true"`, botón táctil `REGATE` en móvil y limpieza total de Escenario A.
- **Sprint 2 — Futbolistas Esculpidos y Sistema de Animación (`js/player_renderer.js`):**
  - Reemplazo total de bloques `BoxGeometry` por anatomía estilizada `LatheGeometry` con juntas esféricas, torso envolvente de 1 material, brazalete de capitán, manos y guantes de arquero, medias con puño, botines esculpidos, 3 expresiones faciales dinámicas (`focused`/`joy`/`shock`), 6 peinados, blending exponencial, 7 coreografías de gol y `disposePlayerFigure()`.
- **Sprint 3 — Hinchada Viva GPU y Mascota 3D (`js/crowd_system.js`, `js/stadium_builder.js`):**
  - 4.200 hinchas en 2 `InstancedMesh`es con atributo `aPart` (brazos levantados y bufandas al viento en GPU), reacción diferenciada local vs visitante, sector visitante intercalado para preservarse en calidad `low`/`medium`/`high`, trapos y **Mascota del Lobo 3D esculpida**.
- **Sprint 4 — 16 Celebraciones de Gol Reales en 3D (`js/goal_celebration_director.js`, `js/game_engine.js`):**
  - 16 variantes diferenciadas con piscina VFX pre-asignada (holograma 3D del Lobo, pelota holográfica orbitando, onda expansiva, spotlight, 180 papelitos instanciados, 96 chispas de fuegos detrás del arco, flash accesible), **ring buffer real de replay de 2.5s**, coreografía activa del goleador y 3 compañeros, suplentes saltando, arquero rival de rodillas, teclas `1–4` y `Omitir`.
- **Sprint 5 — Game Feel, Física, IA y Cámaras (`js/game_engine.js`, `js/tactical_ai.js`, `js/input_controller.js`, `js/audio_engine.js`):**
  - Atajadas aéreas hasta `2.55m` y voladas de arquero en juego abierto, cabezazos/voleas, regate con amague real y aturdimiento breve, pase al espacio, doble presión IA (`pressCount`), frustración en tiros desviados/palos, ejes de cámara `tactical` corregidos, cámara `free` controlable con mouse/rueda, 8 planos de cámara de gol y audio multicapa con variación `±8%`, roce de red, bombo y ducking de música.
- **Sprint 6 — Estadio, Iluminación, Césped, Red y Optimización (`js/stadium_builder.js`, `js/game_engine.js`):**
  - `ACESFilmicToneMapping` + recalibración `day`/`sunset`/`night` eliminando whiteout, instanciado de 1.088 peldaños ovales (→ 2 `InstancedMesh`), cerros, postes y pilastras (**-85% draw calls**), césped esmeralda natural con desgaste, red abierta de 5 caras con ripple elástico, LED deslizándose, bancos animados, árbitros asistentes, fotógrafos, `webglcontextlost`/`restored` y liberación GPU `.dispose()`.
- **Sprint 7 — QA Integral, Capturas Después y Documentación (`docs/design-audit/after/v2-*`, `docs/`):**
  - Verificación en Playwright (`1920×1080`, `1366×768`, `390×844`), `0` errores de consola, `75–76 FPS`, `108–199` draw calls en gameplay/celebración, corrección visual de botones `1–4` en gol visitante, `COMPLIANCE PASS` en los 17 archivos públicos y documentación completa actualizada.
