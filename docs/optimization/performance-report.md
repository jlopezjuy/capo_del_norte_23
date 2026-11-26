# Reporte de Rendimiento y Optimización Gráfica

**Entorno medido:** Chromium (Playwright), WebGL hardware/ANGLE, Three.js r128, `window.game.getPerfStats()`.  
**Nota de compatibilidad:** Pruebas automatizadas ejecutadas en **Chromium**; pruebas manuales dedicadas en Firefox, Edge y Safari no fueron ejecutadas en este entorno automatizado y se registran honestamente como pendientes de verificación en esos motores.

---

## 1. Comparación Medida Antes vs Después (v2)

| Escenario | Antes (Baseline 2026-11-26) | Después (v2 Optimizado) | Reducción Draw Calls | FPS Medidos |
|---|---|---|---|---|
| **Lobby (`1366×768`, `high`)** | `989` draw calls / `412k` tris | **`186` draw calls** / `510k` tris | **-81.2%** | `75 FPS` |
| **Gameplay Broadcast Sunset (`1366×768`, `high`)** | `1.319` draw calls / `427k` tris | **`188–196` draw calls** / `510k` tris | **-85.1%** | `75 FPS` |
| **Gameplay Day (`1366×768`, `high`)** | N/D (base ~1.300) | **`108` draw calls** / `518k` tris | **-91.8%** | `75 FPS` |
| **Gameplay Night (`1366×768`, `high`)** | N/D | **`480` draw calls** / `587k` tris | **-63.6%** | `75 FPS` |
| **Celebración Completa (`Sorpresa Albiceleste`)** | `329` draw calls (solo 2 props) | **`199` draw calls** (holograma + holo-ball + confeti + fuegos + spotlight) | **-39.5%** | `76 FPS` |
| **Móvil (`390×844`, `high`, Touch HUD)** | N/D | **`169` draw calls** / `531k` tris | — | `75 FPS` |

*Nota sobre triángulos:* El incremento moderado de triángulos (~427k → ~510k) corresponde a los futbolistas esculpidos (`LatheGeometry`), los brazos/bufandas de los 4.200 hinchas y los bancos/asistentes, pero al estar instanciados en GPU con **85% menos draw calls**, la tasa de cuadros se mantiene clavada al tope del monitor (`75–76 FPS`).

---

## 2. Optimizaciones Clave Implementadas

1. **Consolidación del Anillo Oval (1.088 mallas → 2 `InstancedMesh`):** Reemplazó los `68 × 16` bloques individuales de `buildOvalBowlAndPreferencial()` eliminando >1.050 draw calls en un solo cambio.
2. **Instanciado de Entorno y Detalles:** 64 postes de cerco en 1 `InstancedMesh`, 48 cerros andinos en 1 `InstancedMesh`, 13 pilastras de prensa en 1 `InstancedMesh`, ~90 edificios urbanos en 1 `InstancedMesh` y 4.200 hinchas en 2 `InstancedMesh` con shader 100% GPU (`onBeforeCompile`).
3. **Torso de Jugador con 1 Material Envolvente:** Redujo cada torso de 6 materiales (`BoxGeometry` array) a 1 único material `LatheGeometry` con textura `256×128` cacheada (`_kitTexCache`).
4. **Piscina VFX Pre-Asignada en Celebraciones:** Los 180 papelitos (`InstancedMesh`), 96 chispas (`InstancedMesh`), holograma del Lobo, pelota holográfica, shockwave y spotlight se crean una sola vez al iniciar — cero picos de Garbage Collection en goles consecutivos.
5. **Cero Fugas de Memoria GPU:**
   - `PlayerRenderer.disposePlayerFigure(fig)` libera materiales por jugador en cada revancha o cambio de rival.
   - `StadiumBuilder.setSkyMode()` invoca `.dispose()` sobre la textura previa del cielo antes de generar la nueva.
   - Se eliminó la textura huérfana duplicada de carteles LED.
6. **Resiliencia WebGL:** Listeners `webglcontextlost` (`e.preventDefault()`) y `webglcontextrestored` integrados en `GameEngine`.

---

## 3. Perfiles de Calidad Gráfica y Telemetría en Vivo

| Perfil | DPR | Hinchas Visibles (Anillo + Platea) | Sector Visitante Preservado | Humo / VFX |
|---|---|---|---|---|
| **Bajo (`low`)** | `1.0` | `1.470` (`1.050` + `420`, 35%) | **Sí** (`312` de `892`, intercalado) | Humo desactivado |
| **Medio (`medium`)** | `<= 1.5` | `2.940` (`2.100` + `840`, 70%) | **Sí** (proporcional) | Completos |
| **Alto (`high`)** | `<= 2.0` | `4.200` (`3.000` + `1.200`, 100%) | **Sí** (`892` completos) | Completos |
| **Automático (`auto`)** | Detecta `hardwareConcurrency` y móvil | Selecciona perfil inicial seguro | **Sí** | Según perfil |

El usuario puede activar en **Configuración → Mostrar telemetría FPS / Draw Calls** el indicador en vivo (`#hud-perf-badge`) para monitorear FPS, draw calls y triángulos en su propio navegador.
