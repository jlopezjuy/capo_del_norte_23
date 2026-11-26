# Game Feel (`js/physics_engine.js`, `js/game_engine.js`, `js/input_controller.js`)

- **Física 60 Hz:** *Fixed timestep* (`1/60s`), rozamiento en césped, rebote elástico, colisión con postes/travesaño y amortiguación en red.
- **Juice implementado:**
  - Estela celeste (`ballTrailPoints`) en remates de velocidad > 16.5 m/s.
  - Micro *camera shake* acotado en impactos contra el palo y remates potentes (desactivable con `Reducir movimiento`).
  - Indicador de caída aérea en césped (`dropRingMesh`).
  - Remate rápido con potencia mínima `0.58` y carga hasta `1.0`.
- **Modo Entrenamiento:** Acceso directo desde el Lobby para practicar pases y remates cerca del área rival sin reloj.
