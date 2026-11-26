# Sistema de Celebraciones de Gol (`js/goal_celebration_director.js`)

- **Desacoplamiento:** El marcador se actualiza una sola vez en `_handleGoal()` antes de iniciar el director.
- **8 variantes contextuales:** *El Grito del Lobo* (tótem 3D detrás del arco), *Terremoto en Jujuy*, *La Ola Celeste* (ola en shader de tribunas), *Gol de Otro Planeta* (aro holográfico orbital), *Baile Colectivo*, *Director de Orquesta*, *Todos al Córner* y *Gol Agónico Minuto 90* (slow-motion breve `0.42x`).
- **Reglas de UX:** Duración acotada (3.2–4.6s), sin repetición consecutiva, botón y tecla `Espacio`/`Enter` para omitir, y modo `Reducir movimiento` que desactiva *shake* y *slow-motion*.
