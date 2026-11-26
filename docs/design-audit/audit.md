# Auditoría Visual y Funcional Completa — Estado Inicial (`docs/design-audit/before/`)

**Fechas de auditoría:** 2026-11-25 (ronda 1) y 2026-11-26 (auditoría profunda de código + capturas baseline `12`–`14` en `1920×1080` y `1366×768`)  
**Capturas reales previas:** `docs/design-audit/before/01` a `14` (`1920×1080`, `1366×768`, `390×844`)

---

## 1. Inventario Real de las 18 Pantallas y Estados

| # | Pantalla / Estado | Estado Real en Baseline | Evidencia / Hallazgo |
|---|---|---|---|
| 1–2 | Pantalla inicial y Menú principal (`#lobby-overlay`) | Implementado | Tarjeta funcional con vista 3D de fondo, pero mostraba controles **WASD** fijos mientras el esquema activo real era **PES** (`input_controller.js:35`). |
| 3 | Selección de partido (`#sel-fixture`) | Implementado | 6 partidos regionales con anti-choque de camisetas y emblemas SVG. |
| 4 | Selección de jugador (`#sel-starter`) | Implementado | Selector de titular inicial en Lobby (sin pantalla de formación táctica independiente; registrado honestamente como ausente). |
| 5–8 | Vista general estadio, campo, platea, populares | Implementado con defectos graves | **Whiteout total** en gradas y pared de Platea (`before/14-baseline-pro-camera-1366x768.png`): 5 `PointLight` + `Hemi` + `Sun` + `NoToneMapping` quemaban el hormigón a `#FFFFFF`. **1.088 mallas sin instanciar** disparaban a `989–1.319` draw calls. LED boards congelados (textura huérfana). 8 banderines de córner duplicados. Red cerrada con wireframe cruzando la boca del arco. |
| 9–12 | Jugador en reposo, carrera, conducción, remate | Implementado básico | Cajas rígidas (`BoxGeometry`) tipo Minecraft/LEGO, sin manos ni guantes de arquero, rostro estático, solo 3 peinados reales, sin cabezazos ni amague visual, y el arquero nunca se tiraba visualmente en juego abierto ni podía atajar tiros con `y > 1.35`. |
| 13–14 | Gol y Celebración | Parcial / Cosmético | 16 títulos en `GoalCelebrationDirector`, pero **sin diferenciación real en 3D**: solo 2 toroides + 3 conos; `replay`, `flash`, `corner`, `banco` y `arquero_incredulo` no hacían nada distinto y los jugadores quedaban congelados en su lugar. |
| 15 | Marcador y HUD (`#match-hud`) | Implementado | Scorebug claro y minimapa, pero sin telemetría opcional, sin botón `REGATE` móvil y `tactical` tenía controles rotados 90°. |
| 16 | Pantalla de pausa (`#modal-pause`) | Implementado | Faltaba acceso a Ajustes desde Pausa y decía `"Volver al Lobby AFA"` (fuga menor Escenario A). |
| 17 | Resultado final (`#modal-stats`) | Implementado | Estadísticas completas + penales (fuga menor `"¡GANÓ GIMNASIA POR PENALES!"`). |
| 18 | Configuraciones (`#modal-settings`) | Implementado parcial | Los ajustes de calidad, volúmenes y accesibilidad **no se persistían en `localStorage`** ni detectaban `prefers-reduced-motion`. |

*Pantallas adicionales no presentes como vistas independientes:* splash/loading screen, tabla de posiciones/llave de torneo, editor de formación táctica, visor de replay independiente y podio de trofeo (registradas explícitamente como fuera del alcance actual del juego ligero sin bundler).

---

## 2. Evaluación Cuantitativa del Estado Baseline (1 a 10)

| Criterio | Nota Baseline | Evidencia Visual / Técnica | Causa Raíz | Impacto | Solución Aplicada en v2 | Prioridad |
|---|---:|---|---|---|---|---|
| **Calidad visual estadio & luz** | 4/10 | `before/14-baseline-pro-camera-1366x768.png`: tribunas y platea quemadas en blanco puro; red tapando boca del arco. | 5 `PointLight` + `Hemi` + `Sun` sin tone mapping + `BoxGeometry` wireframe. | Rompe inmersión y contrastes del campo. | `ACESFilmicToneMapping`, iluminación calibrada (`day`/`sunset`/`night`), hormigón arquitectónico, césped natural y red abierta de 5 caras. | Crítica |
| **Personajes 3D y animaciones** | 3/10 | `before/14`, `after/16`: bloques cúbicos rígidos, sin guantes/manos, rostro inmóvil, sin volada de arquero. | Primitivas `BoxGeometry` y timers de pose sin cablear en `TacticalAI`. | Jugadores se ven robóticos en Pro y festejos. | `PlayerRenderer` esculpido (`LatheGeometry`, juntas esféricas, 3 expresiones, 6 peinados, 7 festejos, voladas, cabezazos, amague). | Crítica |
| **Hinchada viva** | 4/10 | Pilares T sin brazos ni bufandas sobre blanco quemado; calidad baja cortaba sector visitante. | Geometría sin brazos/bufanda e índices visitantes agrupados al final. | Se siente plana y poco futbolera. | Siluetas con brazos y bufandas (`aPart` GPU), índices visitantes intercalados y Mascota 3D esculpida. | Crítica |
| **Celebraciones de gol** | 4/10 | Solo cambiaba texto del banner + 3 conos; jugadores quietos; sin replay real. | Flags `replay`/`flash`/`corner`/`bench` sin implementar en motor. | No sorprende tras el 2do gol. | 16 celebraciones reales en 3D + ring buffer de replay 2.5s + compañeros corriendo + banco saltando + arquero de rodillas + VFX pool. | Crítica |
| **Rendimiento y memoria** | 5/10 | **989–1.319 draw calls** en vivo; fugas en revancha y cambio de cielo; sin `webglcontextlost`. | 1.088 mallas individuales en gradas y falta de `.dispose()`. | Caída de FPS en laptops/móviles. | Instanciado masivo (-85% draw calls: `108–199` DC), `.dispose()` limpio y recuperación WebGL. | Crítica |
| **Game Feel y Controles** | 6/10 | Tiros `y > 1.35` inatajables; `tactical` rotado 90°; Lobby decía WASD estando en PES. | Hardcodes en `input_controller.js`, `game_engine.js` e `index.html`. | Frustración al jugar y disparar. | Atajadas hasta `2.55m`, voladas, cabezazos, pase al espacio, regate real, ejes `tactical` corregidos y Lobby sincronizado. | Alta |
| **Audio** | 6/10 | SFX idénticos en cada golpe; sin ducking de música; sin sonido de red ni bombo. | Osciladores con frecuencia fija. | Sensación repetitiva. | Variación `±8%`, pase vs bombazo, roce de red, ducking de `Jujuy_Match_Point.mp3`, bombo y 6 fanfarrias. | Media |
| **Accesibilidad y UX** | 6/10 | Sin persistencia de ajustes, sin `prefers-reduced-motion`, sin Ajustes en Pausa. | Faltaba capa de persistencia y atributos `aria-modal`. | Obliga a reconfigurar en cada sesión. | `localStorage`, detección `prefers-reduced-motion`, Ajustes en Pausa, `aria-modal` y botón `REGATE` móvil. | Media |
