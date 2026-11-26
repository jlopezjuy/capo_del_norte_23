# Reporte de Optimización Gráfica

- **Geometrías y texturas compartidas:** `PlayerRenderer` comparte todas las geometrías (`torso`, `shorts`, `head`, `hair`, `arm`, `thigh`, `sock`, `boot`, `shadow`) entre los 22 jugadores y el árbitro, y cachea las texturas de camiseta (`jerseyTexCache`).
- **Multitudes en GPU:** `CrowdSystem` mueve toda la animación de espectadores al Vertex Shader (`onBeforeCompile`) evitando actualizaciones por frame en CPU.
- **Perfiles configurables (`Ajustes` → `Calidad Gráfica`):**
  - `Automático`: detecta `hardwareConcurrency` y dispositivo móvil.
  - `Bajo`: `pixelRatio = 1`, 35% densidad de público, humo ambiental desactivado.
  - `Medio`: `pixelRatio <= 1.5`, 70% densidad de público.
  - `Alto`: `pixelRatio <= 2`, 100% densidad de público y VFX completos.
- **Telemetría integrada:** `game.getPerfStats()` expone `{ fps, calls, triangles, quality }`.
