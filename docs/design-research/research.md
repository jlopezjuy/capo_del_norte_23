# Investigación de Diseño de Videojuegos y Comunidades — Pasión de Tribuna 3D / El Lobo Jujeño

**Fecha de consulta:** 2026-11-25 (ronda inicial) y 2026-11-26 (profundización técnica v2)  
**Alcance:** Principios verificables de Game Feel, diseño de fútbol arcade, siluetas de personajes estilizados 3D, multitudes GPU en Three.js, iluminación y tone mapping en estadios WebGL, celebraciones cinematográficas y audio reactivo por capas.

---

## 1. Documentación Técnica Oficial

### 1.1 Three.js `InstancedMesh`, Atributos por Vértice y Presupuesto de Draw Calls
- **Fuente:** Three.js Documentation (`InstancedMesh`) y Three.js Discourse (Community Crowd Showcases)
- **URL:** https://threejs.org/docs/#api/en/objects/InstancedMesh
- **Fecha de consulta:** 2026-11-26
- **Recomendación principal:** Consolidar geometrías repetitivas (espectadores, peldaños de tribunas, postes de cerco, edificios urbanos, cerros) en `THREE.InstancedMesh` con matrices escritas una sola vez y animación 100% en GPU (`onBeforeCompile`) usando atributos por instancia (`aPhase`, `aGroup`, `aTeam`) y un atributo por vértice (`aPart`) para distinguir cuerpo, cabeza, brazos y bufanda sin actualizar matrices en CPU cada frame.
- **Evidencia / argumento:** En nuestra auditoría inicial en Chromium, los 1.088 peldaños individuales del anillo oval disparaban el contador a **989–1.319 draw calls**. Mover gradas, postes, cerros y 4.200 espectadores a `InstancedMesh` mantiene el cuello de botella CPU-GPU bajo control en navegadores de escritorio y móviles.
- **Aplicabilidad al proyecto:** Directa en `js/stadium_builder.js` y `js/crowd_system.js`.
- **Coste / limitación:** `InstancedMesh` comparte un único `boundingSphere`; además, truncar `mesh.count` por calidad gráfica (`low`/`medium`) puede eliminar sectores si los índices no están intercalados proporcionalmente.
- **Decisión:** **Implementado** — gradas ovales, postes, cerros y 4.200 hinchas instanciados; índices visitantes intercalados proporcionalmente y animación de brazos/bufandas mediante `aPart` en shader GLSL compatible con Three.js r128.

### 1.2 Tone Mapping (`ACESFilmicToneMapping`) y Balance de Iluminación en Estadios WebGL
- **Fuente:** Three.js Documentation (`WebGLRenderer.toneMapping`) y Three.js Forum (*ACESFilmicToneMapping overexposed highlights*)
- **URL:** https://threejs.org/docs/#api/en/renderers/WebGLRenderer
- **Fecha de consulta:** 2026-11-26
- **Recomendación principal:** Activar `THREE.ACESFilmicToneMapping` con exposición controlada (`~1.0`) y equilibrar la suma acumulada de `AmbientLight` + `HemisphereLight` + `DirectionalLight` + luces de torres. Evitar combinar múltiples `PointLight` intensas con materiales blancos puros (`#ffffff`) sin tone mapping.
- **Evidencia / argumento:** Sin tone mapping, 5 `PointLight` de torres + sol + hemisferio superaban intensidad difusa `3.5–5.0`, quemando las gradas y los hinchas a blanco plano (`#FFFFFF`, visible en `docs/design-audit/before/14-baseline-pro-camera-1366x768.png`).
- **Aplicabilidad al proyecto:** Directa en `js/game_engine.js` (`ACESFilmicToneMapping`) y `js/stadium_builder.js` (`setSkyMode` calibrado para `day`, `sunset` y `night`, más tonos de hormigón arquitectónico en gradas).
- **Coste / limitación:** En Three.js r128 no existen `AgXToneMapping` ni `NeutralToneMapping`; `ACESFilmicToneMapping` es el estándar soportado y exige recalibrar intensidades para mantener verdes vivos en el césped.
- **Decisión:** **Implementado**.

### 1.3 Web Audio API — Arquitectura Multicapa y Variación Anti-Repetición
- **Fuente:** MDN Web Docs — Web Audio API & Game Audio Layering Guides
- **URL:** https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
- **Fecha de consulta:** 2026-11-26
- **Recomendación principal:** Separar el audio de estadio en tres capas: (1) cama procedural filtrada (murmullo de estadio con `BiquadFilterNode` modulado por peligro), (2) pista musical/ambiental con *ducking* dinámico en eventos pico (goles), y (3) *stingers* / SFX transitorios con micro-variación aleatoria de pitch (`±8%`) para evitar fatiga auditiva por repetición exacta.
- **Evidencia / argumento:** Un mismo oscilador repetido a frecuencia fija en cada pase suena robótico en segundos; variar pitch/timbre y atenuar temporalmente la música de fondo durante el rugido de gol eleva la claridad perceptiva sin peso de descarga adicional.
- **Aplicabilidad al proyecto:** `js/audio_engine.js` con volúmenes independientes (`crowd`, `sfx`, `music`), sonido diferenciado de pase vs remate potente, roce de red (`playNetSwish`), amague (`playDribbleWhoosh`), pulso rítmico de tribuna en ataque y fanfarrias según variante de gol.
- **Coste / limitación:** Los navegadores bloquean `AudioContext` hasta el primer gesto del usuario; requiere `resume()` seguro y tolerancia a silencio inicial.
- **Decisión:** **Implementado**.

---

## 2. Recomendaciones Comunitarias, Charlas GDC y Referencias de Diseño

### 2.1 Game Feel y "Juice" Proporcional sin Fatiga Visual
- **Fuente:** Steve Swink (*Game Feel*, 2008), Martin Jonasson & Petri Purho (*Juice It or Lose It*, GDC 2012), Jan Willem Nijman (*The Art of Screenshake*, GDC 2013) y discusiones de `r/gamedev` / `r/gamedesign`
- **URL:** https://www.gdcvault.com/play/1016487/Juice-it-or-lose-it
- **Fecha de consulta:** 2026-11-26
- **Recomendación principal:** Priorizar la respuesta inmediata del control (*input overrides animation*) y aplicar *juice* proporcional a la importancia de cada acción: micro-feedback sutil en pases/conducción y *hit-stop* (`36–45ms`), sacudida controlada de cámara, estela de balón y deformación de red reservados para bombazos, palos y goles.
- **Evidencia / argumento:** Hilos recurrentes de `r/gamedesign` advierten que abusar de *screen shake* o partículas en acciones cotidianas fatiga la vista y dificulta leer la pelota. Reservar la explosión sensorial para remates potentes, atajadas y goles maximiza el contraste emocional.
- **Aplicabilidad al proyecto:** `js/game_engine.js`, `js/physics_engine.js` y `js/tactical_ai.js` (curva Magnus, pase al espacio, regate con amague real, cabezazos/voleas aéreas, voladas de arquero en juego abierto, hit-stop y toggle de `Reducir movimiento`).
- **Coste / limitación:** Exige separar estrictamente el efecto visual del paso físico fijo de `60 Hz`.
- **Decisión:** **Implementado**.

### 2.2 Celebraciones Cinematográficas: Teatralidad de Personajes (*Super Mario Strikers*) + Replay Espacial (*Rocket League*)
- **Fuente:** Análisis de diseño de *Super Mario Strikers* y *Rocket League* (principios de cámara y ritmo; sin copiar assets ni diseños protegidos) y debates en `r/gamedesign`
- **URL:** https://www.reddit.com/r/gamedesign/
- **Fecha de consulta:** 2026-11-26
- **Recomendación principal:** Tratar el gol como un pico emocional de 3 fases breves y siempre omitibles: (1) impacto y deformación elástica de red, (2) replay real en cámara lenta (1.5s) o plano teatral de personaje (ángulo bajo/Dutch tilt, spotlight, reacción incrédula del arquero rival), y (3) festejo colectivo con compañeros, hinchada y regreso limpio al saque sin alterar jamás la lógica del marcador.
- **Evidencia / argumento:** *Super Mario Strikers* genera memoria emocional mediante encuadres agresivos de personaje y contraste con la frustración rival; *Rocket League* convierte cada remate en espectáculo mediante replay cinético y explosiones espaciales de gol.
- **Aplicabilidad al proyecto:** `GoalCelebrationDirector` con 16 variantes realmente diferenciadas en 3D (ring buffer real de replay de 2.5s, 8 planos de cámara, 7 coreografías corporales, compañeros corriendo a abrazar/bailar, suplentes saltando en el banco, shockwave, pelota holográfica, silueta esculpida del Lobo, cañón de papelitos, teclas `1–4` y botón `Omitir`).
- **Coste / limitación:** Mantener todos los props VFX pre-asignados y reutilizados para evitar pausas de Garbage Collection al marcar goles consecutivos.
- **Decisión:** **Implementado**.

### 2.3 Siluetas de Personajes Low-Poly y Jerarquía Modular en Three.js
- **Fuente:** `r/threejs` y Three.js Discourse (*stylized low-poly character silhouette & procedural animation*)
- **URL:** https://discourse.threejs.org/
- **Fecha de consulta:** 2026-11-26
- **Recomendación principal:** En juegos web con 22+ personajes simultáneos, priorizar siluetas atléticas limpias (torso en V, hombros marcados, articulaciones esféricas en codos/rodillas para evitar huecos al doblar, manos/guantes y botines legibles) mediante jerarquías modulares con geometrías compartidas y texturas `CanvasTexture` cacheadas, en lugar de `SkinnedMesh` pesados que saturan la CPU/GPU en móviles.
- **Evidencia / argumento:** Evita deformaciones artificiales de pesos en articulaciones y permite expresiones faciales intercambiables (`focused`, `joy`, `shock`) y 6 estilos de peinado con una fracción del costo de carga de modelos glTF complejos.
- **Aplicabilidad al proyecto:** Rediseño completo de `js/player_renderer.js` con torso cilíndrico V-taper (1 material envolvente en lugar de 6 por torso), juntas esféricas, manos/guantes de arquero, medias con puño, botines esculpidos, 3 expresiones faciales dinámicas y `disposePlayerFigure()` para cero fugas en revanchas.
- **Coste / limitación:** Menor detalle facial fotorrealista que un modelo de alto poligonaje, totalmente alineado con la Dirección Artística C (híbrido estadio realista + jugadores estilizados expresivos).
- **Decisión:** **Implementado**.

### 2.4 Claridad de HUD Deportivo y Accesibilidad Web
- **Fuente:** Principios de presentación de información en videojuegos deportivos (referencias conceptuales de *Football Manager* y transmisiones TV) + MDN `prefers-reduced-motion`
- **URL:** https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion
- **Fecha de consulta:** 2026-11-26
- **Recomendación principal:** Mantener el HUD de juego por debajo del 12% de la pantalla con tipografía tabular (`font-variant-numeric: tabular-nums`) en reloj/marcador, tarjetas colapsables de controles sincronizadas con el esquema real activo (PES/WASD), persistencia de ajustes en `localStorage` y detección automática de `prefers-reduced-motion`.
- **Evidencia / argumento:** Un HUD sobrecargado o desincronizado con las teclas activas genera fricción inmediata en los primeros 10 segundos de partida.
- **Aplicabilidad al proyecto:** `index.html` y `js/input_controller.js` (sincronización dinámica de Lobby/HUD PES↔WASD, botón de Ajustes en Pausa, persistencia `pasion_settings_v2`, accesibilidad de modales y controles táctiles con botón dedicado de Regate).
- **Coste / limitación:** Ninguno relevante; costo mínimo y alto impacto UX.
- **Decisión:** **Implementado**.
