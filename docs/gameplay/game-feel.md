# Game Feel, Mecánicas y Audio Reactivo

## 1. Núcleo Jugable (`PhysicsEngine`, `TacticalAI`, `GameEngine`, `InputController`)

- **Simulación Determinista:** Paso físico fijo de `60 Hz` (`FIXED_DT = 1/60`) completamente desacoplado del framerate visual y de los VFX de celebración.
- **Controles Responsivos (Doble Esquema + Gamepad + Táctil):**
  - **Clásico PES (por defecto):** `Flechas` mover, `E` correr, `S` pase al pie / quitar, `W` pase al espacio, `A` centro, `D` remate cargado / barrida / cabezazo, `Q` regate / cambiar jugador, `C` cámara.
  - **Moderno WASD:** `WASD` mover, `Shift` correr, `Espacio`/`J` pase (`Shift+Espacio` pase al espacio), `K`/`X` centro, `L`/`F` remate / barrida / cabezazo, `E` regate, `Q` cambiar jugador.
  - **Corrección de eje en cámara Táctica:** Tanto `broadcast` como `tactical` remapean ejes de pantalla a coordenadas de cancha de manera coherente.
  - **Móvil Táctil:** Joystick virtual con sprint automático en el borde exterior (`>82%`) + 5 botones dedicados (`REGATE`, `CAMBIAR`, `CENTRO`, `PASE/QUITAR`, `REMATE/BARRIDA`).

---

## 2. Mecánicas de Diversión Implementadas

| Mecánica | Implementación Real | Feedback Audiovisual |
|---|---|---|
| **Remate cargado con efecto Magnus** | Mantener tecla de remate carga barra (`hud-power-fill`), aplica velocidad `19.5–35` y spin lateral `ball.spinY` con curvatura aerodinámica. | Sonido grave con sub-bass boom (`playKick(power, true)`), hit-stop de `36ms`, micro-shake proporcional y estela celeste de 6 nodos. |
| **Pase al pie y Pase al espacio** | `TacticalAI.executePass(ms, p, target, isLob, isThrough)` proyecta la carrera del receptor hacia adelante (`+5.2m` al espacio libre) y cambia automáticamente el jugador activo. | Toque seco de cuero con micro-variación de pitch (`±8%`). |
| **Regate con amague real** | `dribbleTimer = 0.34s`: quiebre lateral ágil, protección breve de robo (`stealCooldown`) y pausa de reacción al defensor más cercano (`<2.6m`). | Animación de quiebre corporal + `playDribbleWhoosh()`. |
| **Cabezazos y Voleas aéreas** | Cuando el balón libre está entre `0.95m` y `2.55m` de altura a `<2.6m` del jugador activo, pulsar remate/pase dispara un cabezazo o volea direccionada al arco. | Salto vertical `headerTimer = 0.40s` + micro-shake + golpe seco. |
| **Atajadas aéreas y voladas en juego abierto** | `_resolveBallOwnership` permite a los arqueros atrapar/desviar disparos hasta `y <= 2.55m`; `TacticalAI._updateGoalkeeper` dispara `diveTimer`/`diveDir` ante remates rápidos. | Volada horizontal completa con guantes, festejo de atajada (`saveCelebrateTimer`), frustración del pateador (`frustratedTimer`) y "¡Uuuuh!" de la tribuna. |
| **IA Adaptativa por Dificultad** | `amateur` (1 marcador), `nacional` y `reducido` (doble presión real vía `tuning.pressCount = 2`), mejor velocidad de reacción y atajada. | Compañeros en ataque piden el balón agitando el brazo (`callingPassTimer`). |

---

## 3. Audio Reactivo Multicapa (`js/audio_engine.js`)

1. **Cama ambiental procedural:** Ruido rosa filtrado con `BiquadFilterNode` cuya ganancia y frecuencia de corte suben dinámicamente según la proximidad del balón a los arcos (`setCrowdDanger`).
2. **Pulso rítmico de tribuna (`playCrowdChantPulse`):** Bombo cálido de baja frecuencia en ataques locales peligrosos (con límite de tasa anti-spam).
3. **Pista musical con *ducking* (`Jujuy_Match_Point.mp3`):** Volumen independiente (`music`) que se atenúa suavemente durante el rugido de gol y regresa a los ~3.8s.
4. **SFX anti-repetición (`±8%` jitter):** Pases suaves, bombazos con sub-bass, roce de red (`playNetSwish`), palo metálico (`playPostHit`), atajada (`playSave`), amague (`playDribbleWhoosh`), silbato arbitral y 6 motivos de fanfarria de gol (`wolf_howl`, `epic`, `carnival`, `arcade`, `quake`, `stadium`), con murmullo contenido cuando anota el visitante.

---

## 4. Protocolo Sugerido de Playtesting con Usuarios Reales

*Nota de honestidad: las pruebas ejecutadas hasta ahora son verificaciones técnicas automatizadas en Chromium/Playwright; aún no se realizaron sesiones con jugadores humanos externos.* Para la primera sesión de playtesting real (5–8 minutos por persona) se propone medir:
1. Tiempo hasta completar el primer pase y primer remate sin pedir ayuda.
2. Claridad visual de la pelota, equipos y jugador activo en Broadcast vs Pro.
3. Reacción espontánea ante las primeras 3 celebraciones de gol distintas y uso de `Omitir` / teclas `1–4`.
4. Confort visual en móvil (`390×844`) y fatiga con/sin `Reducir movimiento`.
