# Sistema de Celebraciones de Gol — `GoalCelebrationDirector` (`js/goal_celebration_director.js`)

## 1. Arquitectura Desacoplada de Reglas

- **Regla inviolable:** El marcador se incrementa **una sola vez** en `GameEngine._handleGoal()` cuando `MatchState.phase === 'PLAYING'`, cambiando inmediatamente a `GOAL_CELEBRATION`.
- `GoalCelebrationDirector` nunca modifica puntajes ni físicas del balón; únicamente gestiona la selección contextual, la piscina de efectos 3D pre-asignados, directivas de cámara/coreografía, banner superior no invasivo y accesibilidad.
- Al finalizar el temporizador o al pulsar **Omitir (`Espacio` / `Enter` / botón)**, `stop()` oculta todos los props 3D, limpia el flash y el partido reinicia limpiamente en `KICKOFF` para el equipo que recibió el gol.

---

## 2. Las 16 Celebraciones Contextuales (Con Diferenciación Real en 3D)

| # | ID | Título | Disparador Contextual | Coreografía / Cámara / VFX 3D |
|---|---|---|---|---|
| 1 | `grito_gol` | EL GRITO DE GOL | Primer gol del partido | `grito` + plano bajo `low_dutch` + **Silueta 3D esculpida del Lobo** + onda expansiva (`shockwave`) + compañeros al abrazo + `wolf_howl`. |
| 2 | `terremoto_tribuna` | TERREMOTO EN LA TRIBUNA | Gol del empate | `knee_slide` + vibración controlada + onda expansiva + lluvia de papelitos + flash suave opcional + `quake`. |
| 3 | `gol_otro_planeta` | GOL DE OTRO PLANETA | Remate > 25m | `backflip` + cámara lenta + **pelota holográfica orbitando con anillos de energía** + spotlight + `arcade`. |
| 4 | `baile_colectivo` | BAILE COLECTIVO | Pool contextual | `dance` + 3 compañeros corren a formar fila de baile sincronizada (`dance_line`) + órbita cercana + `carnival`. |
| 5 | `ola_celeste` | LA OLA CELESTE | Pool contextual | `orchestra` + cámara panorámica `stadium_wave` + **ola real circunferencial en la hinchada GPU**. |
| 6 | `mascota_gigante` | LA MASCOTA DEL NORTE | Pool contextual | `mascot_closeup` enfocando la **Mascota del Lobo 3D esculpida saltando detrás del arco** + holograma + chispas/fuegos detrás del arco. |
| 7 | `golazo_cinematografico` | GOLAZO CINEMATOGRÁFICO | Pool contextual | **Replay real en cámara lenta (1.55s)** desde el ring buffer de 2.5s siguiendo la pelota al fondo de la red + corte a `knee_slide` con spotlight. |
| 8 | `lluvia_papelitos` | LLUVIA DE PAPELITOS | Pool contextual | `airplane` + cañón instanciado de 180 papelitos celestes/blancos/dorados + ola + `carnival`. |
| 9 | `arquero_incredulo` | EL ARQUERO INCRÉDULO | Pool contextual | Corte inicial `gk_incredulous` al **arquero rival de rodillas agarrándose la cabeza** junto al balón en la red, seguido del goleador en `airplane`. |
| 10 | `todos_al_corner` | TODOS AL CÓRNER | Pool contextual | Goleador y 3 compañeros corren al banderín de córner (`corner_rush`) + cámara `corner_run` + fuentes de chispas. |
| 11 | `gol_minuto_90` | GOL DEL MINUTO 90 | Minuto ≥ 85 decisivo / adición | **Replay real lento** + `knee_slide` + shockwave + holograma Lobo + spotlight + fuentes de chispas + banco saltando + ola + `epic`. |
| 12 | `gol_imposible` | EL GOL IMPOSIBLE | Remate > 25m | **Replay real lento** + `backflip` + pelota holográfica + shockwave + spotlight + `arcade`. |
| 13 | `director_orquesta` | DIRECTOR DE ORQUESTA | Pool contextual | `orchestra` + spotlight + cámara `stadium_wave` mientras la tribuna responde con La Ola Celeste. |
| 14 | `locura_banco` | LOCURA EN EL BANCO | Pool contextual | Goleador y compañeros corren hacia el banco local (`bench_rush`) + cámara `bench_cam` + **suplentes saltando en el banco**. |
| 15 | `fiesta_tribuna` | FIESTA EN LA TRIBUNA | Remontada | `airplane` + `dance_line` + holograma Lobo + chispas + humo celeste potenciado + ola + `carnival`. |
| 16 | `celebracion_sorpresa` | SORPRESA ALBICELESTE | Probabilidad rara (8%) | `backflip` + `dance_line` + pelota holográfica + holograma Lobo + chispas + spotlight + ola. |

*Además, si anota el equipo rival (`rival_goal`), se activa una secuencia sobria de 3.1s donde la hinchada visitante celebra en la Popular Sur, la hinchada local se frustra y el audio reproduce un murmullo contenido sin fanfarria local.*

---

## 3. Interactividad, Anti-Repetición y Accesibilidad

- **Anti-repetición:** Historial circular de las últimas 4 celebraciones locales (`recentIds`).
- **Teclas interactivas opcionales (`1–4` o clic en banner):**
  - `1` Solo (`grito_gol` / `knee_slide`)
  - `2` Baile colectivo (`baile_colectivo`)
  - `3` Hinchada (`director_orquesta` + Ola Celeste)
  - `4` Sorpresa (`celebracion_sorpresa`)
- **Accesibilidad:**
  - `Reducir movimiento` (detectado automáticamente vía `prefers-reduced-motion` y configurable): desactiva sacudida de cámara, cámara lenta, replay rápido y flash.
  - `Sin flashes intensos`: suprime el destello suave de pantalla y los flashes de fotógrafos.
  - Piscina VFX 100% pre-asignada (`dispose()` incluido): cero fugas de memoria tras celebraciones consecutivas.
