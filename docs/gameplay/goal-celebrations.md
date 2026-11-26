# Sistema de Celebraciones de Gol — El Lobo Jujeño

## `GoalCelebrationDirector` (`js/goal_celebration_director.js`)
- **Desacoplamiento estricto:** El marcador se actualiza una sola vez en `MatchState.recordGoal()`; el director solo gestiona VFX, cámara, banner y duración.
- **16 variantes contextuales:**
  1. `El grito del Lobo` (primer gol / totem del Lobo)
  2. `Terremoto en Jujuy` (empate / vibración controlada)
  3. `Gol de otro planeta` (larga distancia / halo holográfico)
  4. `Baile colectivo` (coreografía grupal sincronizada)
  5. `La ola celeste` (ola circunferencial en tribunas)
  6. `El lobo gigante` (totem + mascota del Lobo)
  7. `Golazo cinematográfico` (cámara lenta + replay)
  8. `Lluvia de papelitos` (partículas celestes y blancas)
  9. `El arquero incrédulo` (contraste con arquero rival)
  10. `Todos al córner` (festejo hacia el banderín)
  11. `El gol del minuto 90` (goles agónicos >= 85')
  12. `El gol imposible` (remates > 25m)
  13. `El goleador director de orquesta` (animación alternada)
  14. `Locura en el banco` (festejo hacia los suplentes)
  15. `Fiesta del Lobo` (remontadas)
  16. `Celebración sorpresa` (aparición rara)
- **Control e interactividad:** Teclas `1–4` opcionales para cambiar el festejo en vivo, botón **Omitir (`Espacio`)**, historial de últimas 4 para evitar repeticiones y modos **Reducir movimiento** / **Sin flashes intensos**.
