# Diseño de Hinchada Viva y Estética Jujeña — El Lobo Jujeño

## Arquitectura GPU (`js/crowd_system.js` + `js/stadium_builder.js`)
- **Siluetas humanas instanciadas:** Geometría combinada (torso + hombros + cabeza + brazos/bufanda) renderizada con `THREE.InstancedMesh` en 2 grupos principales (Platea Oeste = 780, Popular/Preferencial = 1.800), totalizando **2.580 hinchas en apenas 2 draw calls**.
- **Desincronización por instancia:** Atributos `aPhase` (fase individual) y `aGroup` (4 grupos de ritmo) para evitar el efecto "ejército de clones".
- **Estados reactivos al partido:**
  - *Expectativa / Ataque:* la hinchada se incorpora (`standUp`) y aumenta la frecuencia de salto.
  - *Frustración (`uFrustration`):* cuando se falla una ocasión clara o convierte el rival, los hinchas inclinan/agitan los hombros.
  - *Gol y Ola Celeste (`uGoalBurst`, `uWaveActive`):* salto explosivo y ola circunferencial por sectores.
- **Identidad Jujeña:** Banderas flameantes celestes y blancas, 7 tirantes verticales, trapos originales en el alambrado ("EL LOBO JUJEÑO • 1931", "LOS CACHORROS", "JUJUY ES DE GIMNASIA", "23 DE AGOSTO • MI CASA") y la **Mascota del Lobo 3D** animada detrás del arco Norte.
- **Presupuesto adaptativo:** `low` (35% = ~903), `medium` (70% = ~1.806), `high` (100% = 2.580).
