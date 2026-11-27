# 01 — Auditoría del Estado Actual de Diversión

**Fecha de auditoría:** 2026-11-27  
**Capturas reales base:** `docs/fun-audit/before/01-lobby-before.png` a `06-mascot-before.png`  
**Stack real verificado:** Vite 8 + JavaScript modular (14 módulos en `js/` + `src/main.js`) + Three.js r128 + Tailwind CSS 3.4.17 + Web Audio API + `@vercel/analytics`.

---

## 1. Inventario Comprobado en Código y Navegador

| Sistema | Estado Real Comprobado | Evidencia |
|---|---|---|
| **Partido 11 vs 11** | Completo y fluido (`75 FPS`, `195` draw calls) | `js/game_engine.js`, `js/physics_engine.js`, `js/tactical_ai.js` |
| **Futbolistas 3D** | Esculpidos (`LatheGeometry`, 3 expresiones, 6 peinados, 7 festejos) | `js/player_renderer.js` |
| **Hinchada GPU** | 4.200 fans con brazos/bufandas (`InstancedMesh`), sector visitante proporcional | `js/crowd_system.js`, `js/stadium_builder.js` |
| **Celebraciones** | 16 variantes con VFX pool + replay lento 2.5s + teclas `1–4` + `Omitir` | `js/goal_celebration_director.js` |
| **Mascota (Lobito)** | **Muy limitado:** estatua detrás del arco Norte que solo salta en el lugar sin piernas articuladas ni eventos | `js/stadium_builder.js:975-1130`, `js/crowd_system.js` |
| **Eventos de Mascota** | **Ausente:** no existe `MascotEventDirector`, ni apariciones en descansos/previa/goles, ni comedia | — |
| **Minijuegos** | **Mínimo:** `btn-training-mode` solo coloca al 9 en `z=-18` sin blancos, puntaje ni reto | `js/game_engine.js:startTraining` |
| **UX Chicos / Familias** | **Parcial:** existe `Reducir movimiento` y `Sin flashes`, pero falta **Modo Sencillo** (asistencia de apuntado/pase) y medallas de habilidad | `index.html` |
| **Audio Jujeño** | Parcial: `Jujuy_Match_Point.mp3` + ruido rosa + fanfarrias synth, pero **sin murga ni carnavalito procedural** | `js/audio_engine.js` |

---

## 2. Evaluación de la Experiencia (Primeros 30s a Segunda Partida)

- **Primeros 30 segundos:** El Lobby es claro y arranca rápido (`1` clic en `¡Salir a la Cancha!`), aunque para un chico nuevo elegir entre `PES` y `WASD` y apuntar manualmente puede costar en los primeros toques.
- **Primera interacción y remate:** La física 60 Hz, la curva Magnus y la red elástica responden muy bien.
- **Primer gol:** Muy fuerte visualmente gracias a los 16 festejos y al arquero rival incrédulo, pero **Lobito queda lejos detrás del arco como un muñeco fijo** y falta música de murga/carnavalito que haga sonreír.
- **Primera derrota / entretiempo:** El entretiempo y el final muestran estadísticas frías sin humor ni un momento simpático de mascota que saque una sonrisa al perder.
- **Motivación para segunda partida:** Todo depende de jugar otro partido 11v11 igual; **no hay un minijuego arcade corto con récord** ni medallas claras por habilidad.

---

## 3. ¿Qué hace divertido al juego hoy y qué le falta?

- **Lo que ya funciona bien:** Respuesta rápida de controles, arquitectura sólida a `75 FPS`, despeje seguro del arquero, hinchada reactiva y variedad de festejos de gol.
- **Lo que le falta para ser inolvidable:**
  1. **Un protagonista cómico vivo (Lobito):** que baile murga y carnavalito, haga jueguitos, se tropiece al intentar una pirueta y anime los descansos y festejos.
  2. **Un minijuego arcade adictivo de 60 segundos:** **Desafío del Lobito** (blancos móviles en el arco, Desafío del Travesaño y Lobito Arquero cómico).
  3. **Accesibilidad real para chicos (`Modo Sencillo`):** asistencia de apuntado al ángulo abierto + IA menos agresiva + medallas saludables sin presiones.
  4. **Atmósfera sonora del norte:** percusión de murga (bombo y redoblante) y motivos de carnavalito (quena y charango procedurales).
