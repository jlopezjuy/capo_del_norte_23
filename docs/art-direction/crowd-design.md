# Diseño de Multitudes (`js/crowd_system.js`)

- **Arquitectura GPU:** `InstancedMesh` con atributo por instancia `aPhase` y shader inyectado vía `onBeforeCompile`.
- **Comportamiento reactivo:**
  - `uExcitement`: escala frecuencia y amplitud de salto según cercanía del balón a los arcos.
  - `uWaveActive`: activa **La Ola Celeste** por ángulo alrededor del estadio (`atan(z, x)`).
  - `uGoalBurst`: explosión de saltos durante `GOAL_CELEBRATION`.
- **Escalado por calidad gráfica:** `low` (35% instancias), `medium` (70%), `high` (100%).
