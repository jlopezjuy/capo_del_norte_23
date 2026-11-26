# Sistema de Cámaras — El Lobo Jujeño (`js/game_engine.js`)

- **`broadcast` (TV Broadcast):** Seguimiento lateral desde Platea Alta con *look-ahead* según velocidad del balón y zoom suave cerca de las áreas.
- **`tactical` (Táctica):** Plano elevado amplio para lectura de pases y desmarques.
- **`pro` (3ra Persona):** Cámara baja detrás del futbolista activo.
- **`free` (Libre 360°):** Órbita dinámica alrededor del balón.
- **`tribuna` (Explorar Estadio):** Recorrido por los 8 sectores del Estadio 23 de Agosto (`popular_norte`, `platea_baja`, `platea_alta`, `preferencial`, `palcos_vip`, `popular_sur`, `campo_juego`, `vista_aerea`).
- **Seguridad:** Validación `Number.isFinite` en `camPos` y `camLook` contra `NaN`, más separación total respecto a las reglas del partido.
