# Sistema de Animaciones — `PlayerRenderer.updatePose` (`js/player_renderer.js`)

## 1. Arquitectura de Blending

Todas las articulaciones (`bodyPivot`, `torsoPivot`, `headPivot`, `armLPivot`, `armRPivot`, `elbowLPivot`, `elbowRPivot`, `legL`, `legR`, `kneeL`, `kneeR`) se interpolan frame a frame con amortiguación exponencial independiente del framerate (`1 - exp(-speed * dt)`), eliminando saltos bruscos al pasar de carrera a remate, barrida o festejo.

---

## 2. Catálogo de Animaciones Implementadas

### Movimiento y Gameplay
| Estado | Condición de activación | Comportamiento corporal |
|---|---|---|
| **Respiración / Espera (`idle`)** | `speed <= 0.38` | Oscilación suave de pecho/brazos, ligero cambio de peso y postura semi-agachada alerta en arqueros (`GK`). |
| **Caminar / Trotar / Sprint** | Progresivo según `speed` | Amplitud de zancada, elevación de rodilla, braceo opuesto con codos flexionados, inclinación frontal del torso, contra-rotación de hombros y banqueo lateral en giros rápidos. |
| **Regate / Amague (`dribble`)** | `player.dribbleTimer > 0` | Quiebre de cintura con centro de gravedad bajo, inclinación lateral rápida y toque ágil. |
| **Pase / Remate Potente / Precisión** | `kickTimer > 0` | Escalado según `player.kickPower`: barrido controlado con cara interna en pases, carga amplia de pierna e inclinación hacia atrás en bombazos. |
| **Cabezazo / Volea (`header`)** | `player.headerTimer > 0` | Salto vertical en arco (`bodyY` hasta `+0.62`), arqueo dorsal y latigazo de frente hacia adelante. |
| **Barrida (`tackle`)** | `player.tackleTimer > 0` | Deslizamiento bajo sobre el césped con pierna de ataque extendida y pierna trasera recogida. |
| **Volada de Arquero (`gk_dive`)** | `player.diveTimer > 0` (juego abierto y penales) | Extensión lateral completa (`diveDir * 1.32`) con brazos y guantes estirados hacia el disparo. |

### Reacciones Emocionales (Rostro + Cuerpo)
| Reacción | Cuándo se dispara | Expresión facial y gesto |
|---|---|---|
| **Pedir el balón (`call_for_pass`)** | Delantero/compañero desmarcado en ataque (`callingPassTimer`) | Corre mientras agita el brazo derecho en alto pidiendo el pase. |
| **Frustración (`frustrated`)** | Remate desviado cerca del palo, disparo al poste/travesaño o atajada rival | Expresión `shock`, torso caído y **codos doblados hacia adentro con las manos sujetando la cabeza**. |
| **Festejo de Atajada (`gk_save_celebrate`)** | Arquero desvía/atrapa un remate peligroso | Expresión `joy`, salto corto con puño en alto. |
| **Desconsuelo Rival (Gol en contra)** | `GOAL_CELEBRATION` en equipo que recibió gol | Expresión `shock`; **el arquero rival cae de rodillas llevándose las manos a la cabeza**, mientras los jugadores de campo agachan la cabeza o ponen manos en cintura. |

### 7 Coreografías de Celebración de Gol
1. **`grito`:** Saltos heroicos con ambos puños al cielo y cabeza echada atrás gritando (`joy`).
2. **`knee_slide`:** Deslizamiento icónico de rodillas sobre el césped con torso hacia atrás y brazos abiertos en cruz.
3. **`airplane`:** Carrera en arco con los brazos completamente extendidos como alas y banqueo lateral.
4. **`dance`:** Coreografía rítmica sincronizada entre goleador y compañeros cercanos.
5. **`orchestra`:** Gestos rítmicos alternados dirigiendo a la tribuna durante *La Ola Celeste*.
6. **`backflip`:** Salto acrobático con giro completo de `360°` en el aire y aterrizaje con puño en alto.
7. **`corner` / `bench`:** Carrera efusiva hacia el banderín de córner o el banco de suplentes con braceo triunfal.
