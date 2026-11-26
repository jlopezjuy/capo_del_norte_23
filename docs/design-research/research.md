# Investigación de Diseño de Videojuegos y Comunidades — El Lobo Jujeño

**Fecha de consulta:** 2026-11-25  
**Alcance:** Principios verificables de Game Feel, diseño de fútbol arcade, multitudes GPU en Three.js, celebraciones de gol y optimización WebGL.

---

## 1. Documentación Técnica Oficial

### 1.1 Three.js `InstancedMesh` y Presupuesto de Draw Calls
- **Fuente:** Three.js Documentation (`InstancedMesh`)
- **URL:** https://threejs.org/docs/#api/en/objects/InstancedMesh
- **Fecha de consulta:** 2026-11-25
- **Recomendación principal:** Agrupar miles de elementos repetidos (espectadores, banderas, asientos) en un único `InstancedMesh` con geometría y material compartidos, calculando manualmente `computeBoundingBox()` / `computeBoundingSphere()` cuando las instancias se distribuyen en un área amplia.
- **Evidencia / argumento:** Cada `Mesh` estándar emite al menos un draw call desde CPU a GPU. `InstancedMesh` reduce miles de espectadores a 1 draw call por capa de material.
- **Aplicabilidad al proyecto:** Directa en `js/crowd_system.js` y `js/stadium_builder.js` para mantener < 120 draw calls totales con 2.500+ hinchas.
- **Coste / limitación:** Un único bounding volume para todas las instancias impide frustum culling granular por sector si no se divide por tribuna.
- **Decisión:** **Implementar** dividiendo la hinchada en capas instanciadas (cuerpos, cabezas/gorras, bufandas/banderas) con bounding spheres calculadas y animación 100% en vertex shader.

### 1.2 Web Audio API y Capas Dinámicas sin Assets Pesados
- **Fuente:** MDN Web Docs — Web Audio API
- **URL:** https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
- **Fecha de consulta:** 2026-11-25
- **Recomendación principal:** Usar nodos `GainNode` separados por categoría (`crowd`, `sfx`, `music`) conectados al destino final, y modular filtros `BiquadFilterNode` en tiempo real según eventos del juego.
- **Evidencia / argumento:** Evita descargas MP3 pesadas y problemas de licencias musicales, manteniendo latencia < 20ms en navegadores.
- **Aplicabilidad al proyecto:** Corregir el ruteo de `volumes.sfx` y `volumes.crowd` en `js/audio_engine.js` y añadir capas reactivas (ambiente, reacción de peligro, golpes de balón, fanfarria de gol, menú).
- **Coste / limitación:** Requiere desbloqueo de `AudioContext` tras el primer gesto del usuario.
- **Decisión:** **Implementar** en Sprint 5-6.

---

## 2. Recomendaciones Comunitarias y Charlas GDC

### 2.1 Game Feel & "Juice It or Lose It" en Fútbol Arcade
- **Fuente:** GDC Vault — *Juice It or Lose It* (Martin Jonasson & Petri Purho) y discusiones en `r/gamedesign`
- **URL:** https://www.gdcvault.com/play/1016487/Juice-it-or-lose-it
- **Fecha de consulta:** 2026-11-25
- **Recomendación principal:** Primero asegurar que la mecánica central (conducción, pase, remate) responda sin demora ("input overrides animation"), y luego sumar feedback audiovisual proporcional: micro hit-stop en remates potentes, estela del balón, deformación física de la red y cámara dinámica.
- **Evidencia / argumento:** Los juegos deportivos tipo arcade (*Super Mario Strikers*, *Rocket League*) priorizan la respuesta inmediata sobre la inercia lenta de simuladores; el feedback auditivo y visual convierte un disparo común en un momento memorable.
- **Aplicabilidad al proyecto:** Añadir efecto/curva (Magnus) al balón, hit-stop de ~40ms en remates fuertes, deformación elástica de red al impacto y cámara con look-ahead.
- **Coste / limitación:** Exceso de screen shake o partículas ocultando el balón perjudica la lectura del partido.
- **Decisión:** **Implementar** con límites estrictos y toggle de `Reducir movimiento`.

### 2.2 Secuencia de Gol Cinematográfica (Hit-Stop + Slow-Mo + Replay)
- **Fuente:** Discusiones de diseño arcade deportivo (`r/gamedesign`, *Rocket League* / *Mario Strikers* post-mortems)
- **URL:** https://www.reddit.com/r/gamedesign/
- **Fecha de consulta:** 2026-11-25
- **Recomendación principal:** Separar el evento de gol en 3 fases breves: (1) Impacto (micro freeze-frame + rugido de estadio + red deformada), (2) Cámara lenta / replay breve de 1.5–2.5s o zoom heroico al goleador, (3) Transición limpia al saque sin menús invasivos y siempre omitible.
- **Evidencia / argumento:** Celebraciones largas o repetitivas frustran después del tercer gol; variedad contextual + opción de omitir mantienen la sorpresa sin cortar el ritmo.
- **Aplicabilidad al proyecto:** `GoalCelebrationDirector` con 16 variantes contextuales, replay lento opcional en golazos, teclas `1–4` opcionales para elegir festejo y botón/tecla `Espacio` para omitir.
- **Coste / limitación:** Requiere buffer circular de posiciones recientes (últimos ~3 segundos) para el replay sin duplicar goles.
- **Decisión:** **Implementar**.

### 2.3 Multitudes en Three.js: Vertex Animation + Desincronización por Instancia
- **Fuente:** `r/threejs` y Three.js Discourse (*InstancedMesh crowd vertex animation*)
- **URL:** https://discourse.threejs.org/
- **Fecha de consulta:** 2026-11-25
- **Recomendación principal:** Nunca actualizar miles de matrices en CPU por frame (`setMatrixAt` en bucle); usar atributos por instancia (`aPhase`, `aSector`, `aRole`) y animar saltos, aplausos, olas y banderas dentro de `onBeforeCompile` en el vertex shader, manteniendo geometría low-poly para evitar *fragment overdraw* al acercar la cámara.
- **Evidencia / argumento:** Mover matrices desde JS cada frame satura el bus CPU-GPU; las fases individuales eliminan el efecto "ejército de clones".
- **Aplicabilidad al proyecto:** Reemplazar los cubos planos actuales en `js/crowd_system.js` por siluetas estilizadas de hinchas (torso + cabeza + brazos/bufanda) animadas en GPU con estados de partido.
- **Coste / limitación:** Requiere cuidado con shaders WebGL1/WebGL2 compatibles con Three.js r128.
- **Decisión:** **Implementar**.
