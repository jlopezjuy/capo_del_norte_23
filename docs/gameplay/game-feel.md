# Game Feel y Sensaciones de Juego — El Lobo Jujeño

- **Respuesta inmediata (`js/input_controller.js`):** Muestreo a 60 Hz para teclado, gamepad y joystick táctil; carga de remate progresiva (`L`/`F`) y regate rápido (`E`).
- **Física expresiva (`js/physics_engine.js`):** Efecto Magnus (`spinY`) en remates con dirección lateral, estela luminosa en disparos potentes y deformación física de la red (`onNetHit`).
- **Feedback de impacto:** Micro *hit-stop* (~36–45ms) y *micro-shake* en remates potentes, palos y goles (desactivables con `Reducir movimiento`).
- **Reacciones humanas:** Arquero festeja atajadas (`saveCelebrateTimer`), delantero se agarra la cabeza al fallar (`frustratedTimer`) y compañeros en ataque piden el balón (`callingPassTimer`).
