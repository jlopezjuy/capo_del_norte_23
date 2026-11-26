# Auditoría Visual y Funcional Inicial (Sprint 0)

**Fecha:** 2026-11-25  
**Capturas base:** `docs/design-audit/before/` (`01-tv-broadcast-before.png`, `02-pro-camera-before.png`, `03-popular-norte-before.png`)

---

## 1. Inventario Real del Código Base
- **Motor y render:** Three.js r128 vía CDN (`index.html`), sin bundler Vite (arquitectura estática compatible con Vercel y `file://`).
- **Módulos existentes:** `afa_fixture.js`, `audio_engine.js`, `match_state.js`, `input_controller.js`, `physics_engine.js`, `tactical_ai.js`, `stadium_builder.js`, `game_engine.js`.
- **Pantallas existentes:** Lobby «Partido de la Semana», HUD en partido (marcador, reloj, tarjeta jugador, minimapa, panel controles), Pausa, Estadísticas Entretiempo/Final, Tanda de Penales.
- **Pantallas ausentes al inicio de la auditoría:** Modo Entrenamiento / Tiros Libres, Exploración Libre del Estadio desde el menú, Configuración gráfica (`Bajo/Medio/Alto/Auto`), Reducción de movimiento y Volúmenes por categoría.

---

## 2. Evaluación por Criterio (1 a 10)

| Criterio | Puntaje | Evidencia y Diagnóstico |
|---|---:|---|
| Calidad visual estadio | 7/10 | Arquitectura fiel del 23 de Agosto, pero público estático en bloque y red del arco rígida. |
| Personajes 3D | 3/10 | Figuras cúbicas primitivas sin botines, medias, cabello, dorsales ni variación física. |
| Animaciones | 3/10 | Solo oscilación simple de piernas al correr; sin animaciones de remate, pase, barrida, celebración ni frustración. |
| Celebraciones de gol | 3/10 | Solo cambio de texto en tablero LED, papelitos y humo genérico; sin director contextual ni coreografías. |
| Escudos y camisetas | 4/10 | Monogramas de texto en cajas cuadradas en el Lobby y camisetas lisas sin bastones albicelestes. |
| Hinchada | 4/10 | `InstancedMesh` existente pero todo el bloque salta sincronizado (`position.y = sin(...)`); sin olas ni reacción por peligro. |
| Game Feel | 6/10 | Física 60 Hz sólida, pero falta estela de balón, deformación de red, hit/post feedback y modos de práctica. |
| Audio | 5/10 | Síntesis funcional básica, sin capas diferenciadas ni controles de volumen independientes. |
| Rendimiento | 8/10 | 60 FPS estables, pero sin selector de calidad gráfica para dispositivos de gama baja. |

---

## 3. Problemas Prioritarios Accionables
1. **Personajes primitivos y sin expresividad (Prioridad: ALTA)** → Rediseñar con anatomía estilizada (cabeza, pelo, torso con camiseta texturizada a bastones + dorsal, brazos articulados, shorts, medias, botines) y máquina de poses con blending suave (`idle`, `run`, `kick`, `tackle`, `celebrate`, `frustrated`, `gk_dive`).
2. **Celebraciones de gol planas (Prioridad: ALTA)** → Implementar `GoalCelebrationDirector` con 8+ celebraciones temáticas jujeñas, banner cinematográfico de gol, opción de omitir y accesibilidad.
3. **Hinchada sincronizada sin vida (Prioridad: ALTA)** → Migrar a animación por instancia en GPU (`onBeforeCompile`) con fases individuales, Ola Celeste por sectores y reacción dinámica al peligro de gol.
4. **Falta de escudos SVG y camisetas reales (Prioridad: MEDIA-ALTA)** → Crear `ClubBadges` SVG reutilizables y texturas procedurales de camisetas (albiceleste a bastones para Gimnasia, diseños propios para cada rival).
5. **Ausencia de Entrenamiento, Configuración gráfica y Audio multicapa (Prioridad: MEDIA)** → Agregar modo Entrenamiento/Desafío de Remates, menú de Configuración (`Bajo/Medio/Alto/Auto`, `Reducir movimiento`, volúmenes) y vista Explorar Estadio.
