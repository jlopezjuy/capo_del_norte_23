# 11 — Accesibilidad, Seguridad Familiar e Identidad

## Accesibilidad para Chicos y Jugadores Casuales
- **Modo Sencillo (`#sel-difficulty = "easy"`):** agrega asistencia inteligente de puntería en pases y remates (`assistMode: 'easy'`) para que chicos o jugadores nuevos puedan anotar goles y disfrutar desde el primer minuto, manteniendo **Avanzado (`standard`)** intacto.
- **Movimiento Reducido (`reduceMotion`) y Sin Destellos (`noFlash`):** disponibles en Ajustes; suprimen slow-motion brusco, camera shake y flash blanco de gol (verificado en `scripts/test_fun_systems.mjs`).
- **Omitir Festejo:** botón visible `#btn-skip-celebration` y tecla `Espacio` para volver rápido al juego.
- **Frecuencia de Lobito (`#set-mascot-freq`):** configurable entre `occasional`, `frequent`, `breaks_only` y `off`.
- **Controles Duales:** esquema PES o WASD intercambiable en lobby/HUD + controles táctiles en móvil.

## Seguridad Psicológica y Diseño Ético (RITEC / XAG 117)
- Sin cajas de botín (loot boxes), sin monedas premium, sin temporizadores FOMO ni penalizaciones por no conectarse.
- Las 5 medallas de *Desafío del Lobito* y partido son hitos positivos de habilidad o descubrimiento, guardados únicamente en `localStorage`.
- Durante juego activo (`PLAYING`), Lobito jamás invade la cancha ni bloquea la cámara ni el balón (`allowPitchEntry: false`).

## Cumplimiento Legal (Escenario A)
Validado tras cada cambio con `node scripts/validate_compliance.mjs` (`COMPLIANCE PASS: 20 public files verified clean for Escenario A (independent)`).
