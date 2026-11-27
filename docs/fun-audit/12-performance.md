# 12 — Rendimiento y Métricas Observadas

## Mediciones Reales en Build de Producción (`vite build` + `vite preview`)
Ejecutado con Chromium Headless (renderizado por software SwiftShader WebGL) mediante `window.game.getPerfStats()`:
- **Desafío del Lobito (`1366x768`):** `145` draw calls, `514.258` triángulos, calidad `high` (SwiftShader software rasterizer: 3 FPS en CPU).
- **Partido Completo (`1366x768`):** `374` draw calls, `562.682` triángulos, calidad `high` (SwiftShader software rasterizer: 6 FPS en CPU).
- **Bundle de Producción (`vite build`):**
  - `dist/index.html`: `64.81 kB` (`14.36 kB` gzip)
  - `dist/assets/index-*.js`: `273.10 kB` (`78.51 kB` gzip)
- **Layout Móvil (`390x844`):** `scrollWidth <= innerWidth` (`mobileOverflow: false`) sin desbordes horizontales.

## Optimizaciones Aplicadas
- Público de 4.200+ hinchas renderizado con `InstancedMesh` para mantener los draw calls acotados (~374 en partido completo).
- Geometrías y materiales de `ArcadeChallengeManager` y `GoalCelebrationDirector` reutilizados/disposeados limpiamente al salir del modo.
- Audio 100% procedural (0 MB de descargas extra para murga, carnavalito o reacciones de Lobito).

## Limitación de Entorno
No se grabó video `.mp4`/`.webm` en headless porque SwiftShader renderiza WebGL por CPU a baja tasa de cuadros; la validación visual se realizó mediante capturas reales en `docs/fun-audit/before/` y `docs/fun-audit/after/` junto con tests unitarios y de integración en Playwright.
