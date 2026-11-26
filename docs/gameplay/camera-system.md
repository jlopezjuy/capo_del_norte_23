# Sistema de Cámaras Cinematográficas y Jugables — `GameEngine._updateCamera` (`js/game_engine.js`)

## 1. Arquitectura Desacoplada

Las cámaras operan estrictamente como consumidores de lectura del `MatchState` y de las directivas de `GoalCelebrationDirector`. Ningún cambio de cámara modifica físicas, reglas ni marcador. Todas las transiciones usan interpolación suave (`camPos.lerp`, `camLook.lerp`) con guardas `Number.isFinite` contra `NaN`.

---

## 2. Cámaras de Gameplay (Tecla `C` o botón HUD)

| Modo | Encuadre y Comportamiento | Prioridad |
|---|---|---|
| **`broadcast` (TV Broadcast)** | Plano lateral televisivo desde la Platea Oeste (`x ≈ -51.. -43`) con **look-ahead dinámico** según velocidad del balón (`ball.vz * 0.16`) y acercamiento suave al entrar al área. | Máxima claridad táctica y lectura de ambos arcos. |
| **`tactical` (Táctica)** | Vista elevada de pájaro (`y = 38`) siguiendo el bloque completo del campo. Ejes de control sincronizados igual que Broadcast. | Lectura de líneas y pases al espacio. |
| **`pro` (3ra Persona)** | Detrás del futbolista activo (`y = 7.8`, `z + 14.5`) mirando hacia el arco Norte. | Inmersión y apreciación de animaciones y rostros. |
| **`free` (Libre 360°)** | **Interactiva con arrastre de mouse (yaw/pitch) y rueda (zoom `12–62m`)** alrededor del balón; si el usuario no interactúa, realiza órbita cinematográfica suave. | Exploración y capturas libres. |
| **`tribuna` (Vista de Tribuna)** | Recorre los 8 sectores reales de `STADIUM_SECTORS` (`popular_norte`, `platea_baja`, `platea_alta`, `preferencial`, `palcos_vip`, `popular_sur`, `codo_noroeste`, `drone_aereo`) — corregidas las claves rotas anteriores. | Sensación de espectador y exploración del estadio. |

---

## 3. Los 8 Planos Cinematográficos de Celebración (`GOAL_CELEBRATION`)

1. **`replay_track`:** Toma rasante detrás/costado del arco siguiendo la pelota del **ring buffer real de 2.5s** (`135` frames grabados) mientras entra a la red en cámara lenta (`REPLAY • CÁMARA LENTA`).
2. **`hero_orbit`:** Órbita dinámica en primer plano (`r = 5.6m`, `y = 2.35m`) alrededor del goleador y compañeros bailando/abrazándose.
3. **`low_dutch`:** Contrapicado heroico (`y = 1.75m`) que encuadra al goleador en primer plano con la Popular Norte explotando detrás.
4. **`gk_incredulous`:** Corte inicial (`1.85s`) al arquero rival de rodillas junto a la pelota en la red, seguido del corte al delantero festejando.
5. **`corner_run`:** Seguimiento dinámico hacia el banderín de córner elegido mientras el goleador y 3 compañeros corren a festejar.
6. **`bench_cam`:** Giro hacia el banco de suplentes local (`x = -36, z = 11`) encuadrando a los suplentes saltando.
7. **`stadium_wave`:** Barrido panorámico amplio sobre Popular Norte y Preferencial para mostrar *La Ola Celeste*.
8. **`mascot_closeup`:** Encuadre detrás del arco Norte destacando la **Mascota del Lobo 3D esculpida**, el holograma y las fuentes de chispas.

*Accesibilidad:* Toda vibración (`microShake` y `shakeOffset`) y cámara lenta se anula automáticamente cuando `Reducir movimiento` está activo.
