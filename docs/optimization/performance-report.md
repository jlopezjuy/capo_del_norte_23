# Reporte de Rendimiento y Optimización — El Lobo Jujeño

**Medición real en navegador (Chromium / Playwright, `1366×768`, perfil `high`):**
- **FPS observados:** `75 FPS` (`window.game.getPerfStats()`)
- **Draw calls:** `1011` (incluyendo gradas detalladas del Estadio 23 de Agosto; la hinchada de 2.580 espectadores consume solo **2 draw calls** mediante `InstancedMesh`)
- **Triángulos:** `267,682`
- **Errores de consola:** `0`

## Niveles de Calidad (`GameEngine.applyGraphicsQuality`)
- **Bajo (`low`):** DPR = `1`, densidad de hinchada al `35%` (~903 hinchas), humo atmosférico desactivado.
- **Medio (`medium`):** DPR <= `1.5`, densidad de hinchada al `70%` (~1.806 hinchas).
- **Alto (`high`):** DPR <= `2`, densidad de hinchada al `100%` (2.580 hinchas), humo y confeti completos.
- **Automático (`auto`):** Detecta `navigator.hardwareConcurrency` y dispositivo móvil para elegir el perfil inicial seguro.

## Optimizaciones Aplicadas
1. Eliminación de llamadas duplicadas en `StadiumBuilder.buildAll` (arcos, cercos y bancos de suplentes se construían dos veces).
2. Caché de texturas (`_kitTexCache`, `_faceTexCache`) y emblemas SVG (`_svgCache`) para evitar regeneración en cada partido.
3. Animación de 2.580 espectadores 100% en GPU (`onBeforeCompile`) sin actualizar matrices en CPU por frame.
