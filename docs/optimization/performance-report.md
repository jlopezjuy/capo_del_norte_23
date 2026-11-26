# Reporte de Rendimiento y Optimización — El Lobo Jujeño

**Medición real en navegador (Chromium / Playwright, `1366×768`, perfil `high`):**
- **FPS observados:** `75 FPS` (`window.game.getPerfStats()`)
- **Draw calls (celebración close-up):** `329` (`402,323` triángulos); **Hinchada de 4.200 espectadores** en solo **2 draw calls** (`InstancedMesh`) y **~90 edificios urbanos** consolidados en **1 draw call** (`InstancedMesh` con textura compartida de ventanas).
- **Errores de consola:** `0` errores, `0` advertencias de `THREE.Material`.

## Niveles de Calidad (`GameEngine.applyGraphicsQuality`)
- **Bajo (`low`):** DPR = `1`, densidad de hinchada al `35%` (~1.470 hinchas), humo atmosférico desactivado.
- **Medio (`medium`):** DPR <= `1.5`, densidad de hinchada al `70%` (~2.940 hinchas).
- **Alto (`high`):** DPR <= `2`, densidad de hinchada al `100%` (4.200 hinchas), humo y confeti completos.
- **Automático (`auto`):** Detecta `navigator.hardwareConcurrency` y dispositivo móvil para elegir el perfil inicial seguro.

## Optimizaciones Aplicadas
1. Eliminación de llamadas duplicadas en `StadiumBuilder.buildAll` (arcos, cercos y bancos de suplentes se construían dos veces).
2. Consolidación de ~90 edificios del entorno urbano en un único `InstancedMesh` con textura procedural compartida (reducción de ~89 draw calls y ~89 materiales).
3. Caché de texturas (`_kitTexCache`, `_faceTexCache`) y emblemas SVG (`_svgCache`) para evitar regeneración en cada partido.
4. Animación de 4.200 espectadores 100% en GPU (`onBeforeCompile`) sin actualizar matrices en CPU por frame.
