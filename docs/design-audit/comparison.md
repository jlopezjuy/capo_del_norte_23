# Comparación Visual y Funcional — Antes vs Después

**Capturas Antes:** `docs/design-audit/before/` (`04` a `09`)  
**Capturas Después:** `docs/design-audit/after/` (`01-lobby-after-1366x768.png` a `05-mobile-hud-after-390x844.png`)

---

## 1. Qué Cambió y Qué Mejoró

| Área | Antes (`before/`) | Después (`after/`) | Impacto |
|---|---|---|---|
| **Identidad & Lobby** | Tarjeta con blur y reloj genérico; sin selector de jugador. | Branding **El Lobo Jujeño • 23 de Agosto** con escudo de lobo SVG, selector de **Jugador Inicial** y tarjetas limpias sin blur excesivo. | Identidad propia desde el primer segundo. |
| **Futbolistas 3D** | Cubos rígidos sin rostro, dorsal en pecho/costados y sin rodillas/codos. | Cabeza redondeada con rostro expresivo y 4 estilos de cabello, torso con dorsal solo atrás, codos/rodillas articulados y reacciones (`frustrated`, `callingPass`, `saveCelebrate`). | Lectura clara en Broadcast y expresividad en Pro. |
| **Hinchada Viva** | 2.580 cubos saltando sincronizados. | Siluetas humanas instanciadas (torso + hombros + cabeza) con variación de escala, shader GPU desincronizado (`aPhase`, `aGroup`, `uFrustration`, `uWaveActive`) y **Mascota del Lobo 3D** detrás del arco Norte. | El estadio se siente vivo y reactivo al partido. |
| **Celebraciones** | 8 presets; banner central grande tapando el área. | **16 celebraciones contextuales**, banner superior no invasivo con escudo SVG, botones interactivos (`1–4`), `Omitir (Espacio)`, `Reducir movimiento` y `Sin flashes`. | Cada gol sorprende sin interrumpir el ritmo. |
| **Estadio & Game Feel** | Red rígida, llamadas duplicadas en `buildAll`, `volumes.sfx` roto. | Red con deformación elástica al impacto, banderines, fotógrafos, efecto Magnus en remates, hit-stop micro-frame, regate (`E`), 5 modos de cámara y audio por categorías corregido. | Mayor respuesta táctil y menos draw calls redundantes. |

---

## 2. Problemas Detectados y Corregidos en QA
- **Three.js r128 `InstancedMesh`:** Se detectó en consola `mesh.computeBoundingBox is not a function` al registrar la hinchada; se corrigió usando `mesh.geometry.computeBoundingSphere()` + `mesh.frustumCulled = false`, logrando **0 errores de consola** en la verificación final.
- **Camiseta local y advertencias `THREE.Material` (2026-11-26):** `game_engine.js` pasaba `GYE_CLUB.primaryColor` (`undefined`) en lugar de `GYE_CLUB.shirtColor`, causando 23 advertencias de consola y camisetas blancas lisas. Corregido en `game_engine.js` y `player_renderer.js` (ahora muestra bastones celestes y blancos reales y **0 advertencias de Three.js**, ver `15-gameplay-striped-crowd-after-1366x768.png`).
- **Cámara de celebración y toast inicial (2026-11-26):** Se reemplazó la cámara lejana desde la tribuna por una toma cinematográfica de replay en ángulo bajo seguida de órbita en primer plano sobre el goleador (`16-goal-celebration-closeup-after-1366x768.png`), se acortó el mensaje inicial para evitar truncado con `...`, se elevó la hinchada a **4.200 espectadores** y se instanciaron los edificios del entorno con textura de ventanas.
- **Truncado menor:** En `04-goal-celebration-after-1366x768.png`, títulos largos como `"GOL DE OTRO PLANETA"` se abrevian con `...` en el banner compacto (`max-w-xl`) sin afectar la lectura del goleador ni el marcador.
