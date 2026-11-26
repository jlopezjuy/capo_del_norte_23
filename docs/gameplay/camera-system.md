# Sistema de Cámaras (`js/game_engine.js`)

- **TV Broadcast (por defecto):** `x = -51, y = 25.5, FOV = 58°`, por delante de la visera de Platea Alta, con zoom dinámico al acercarse a las áreas.
- **3ra Persona (`pro`):** Detrás del jugador controlado mirando hacia `-Z`, acotada (`z <= 54`) para no invadir la Popular Sur.
- **Tribuna (`tribuna`):** Cicla entre sectores reales del 23 de Agosto (`popular_norte`, `platea_baja`, `preferencial`, `palcos_vip`, `popular_sur`) mediante `_getSectorCameraPos()` seguro contra `NaN`.
- **Celebración:** Ángulo detrás del arco anotado (`popular_norte` para goles de Gimnasia, `popular_sur` para goles rivales).
