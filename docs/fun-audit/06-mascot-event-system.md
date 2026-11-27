# 06 — Sistema de Eventos de Lobito (`MascotEventDirector`)

## Arquitectura (`js/mascot_controller.js`)
`MascotEventDirector` administra la frecuencia, prioridades, cooldowns, entrada a la cancha y cancelación segura de shows y easter eggs de Lobito.

## Regla de Seguridad de Gameplay (Invariante Verificada)
- Durante `phase === 'PLAYING'`:
  - `canTriggerBreakEvent()` retorna `false` siempre.
  - `triggerEvent(..., { phase: 'PLAYING' })` fuerza `allowPitchEntry = false`, `cameraFocus = 'none'`, `confetti = false` y duración máxima `3.5s` al costado de la cancha.
  - Al transicionar desde cualquier pausa o entretiempo a `PLAYING`, `update()` cancela inmediatamente cualquier evento con `allowPitchEntry === true` y devuelve a Lobito a su banda (`returnHome: true`).

## Catálogo de Eventos (`EVENTS` — 10 eventos)
1. `murguero` — *¡Lobito Murguero!* (`murga`, audio `murga`, ola en tribuna)
2. `carnavalito` — *¡Carnavalito Jujeño!* (`carnavalito`, audio `carnavalito`)
3. `jueguitos` — *¡Show de Jueguitos!* (`jueguitos`, pelota de freestyle)
4. `torpe` — *¡Tropiezo Legendario!* (`torpe`, patinazo y pose sentada)
5. `estrella` — *¡Modo Estrella!* (`estrella`, anteojos de sol y saludo)
6. `conductor` — *¡Director de Orquesta!* (`conductor`, dirige la hinchada)
7. `duelo` — *¡Duelo de Baile!* (`duelo`, pasos rítmicos alternados)
8. `desfile` — *¡Bandera Gigante!* (`desfile`, marcha con bandera celeste)
9. `backflip_show` — *¡Mortal Celeste!* (`backflip`, acrobacia de entretiempo)
10. `arquero_cheer` — *¡Aliento al Arco!* (`clap`, arenga detrás del arco)

## Easter Eggs (`EASTER_EGGS`, 5% de probabilidad)
- Eventos sorpresa raros con prioridad alta que desbloquean la medalla `lobito_friend` tras presenciar 3 apariciones en partida (`_mascotEventsSeen >= 3`).

## Configuración de Frecuencia (`#set-mascot-freq`)
- `occasional` (predeterminado, cooldown 120s), `frequent` (cooldown 55s), `breaks_only` (solo entretiempo/pausas/goles), `off` (desactivado).
