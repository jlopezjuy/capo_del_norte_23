# Diseño del Estadio, Césped, Red e Iluminación — `StadiumBuilder` (`js/stadium_builder.js`)

## 1. Arquitectura Reconocible (Dirección C)

El **Estadio de los Cerros** conserva la impronta arquitectónica de un estadio futbolero del norte argentino enclavado frente a los cerros andinos:
- **Platea Oeste** con dos bandejas, mosaicos albicelestes (`S S` / `C J`), torre de prensa de 4 niveles con ventanas emisivas y pilastras instanciadas.
- **Anillo Oval (`Popular Norte`, `Preferencial Este`, `Popular Sur`)** con 14 escalones de hormigón arquitectónico (`#CBD5E1` / `#94A3B8`) alternados con franjas celestes (`#0284C7` / `#0EA5E9`).
- **5 Torres de Iluminación LED** con focos emisivos y haces volumétricos aditivos activados progresivamente en Atardecer y Noche.
- **Entorno Andino y Urbano:** 48 cerros perimetrales instanciados con variación tonal (pizarra violácea a terracota), ~90 edificios urbanos instanciados con textura compartida de ventanas y autopista con 14 vehículos en movimiento.

---

## 2. Césped Realista y Red Abierta de 5 Caras

- **Césped (`createPitchTexture`, `1024×1536`):**
  - Franjas de corte en verde estadio natural (`#256D3B` / `#2E7D44`), evitando saturación neón.
  - Grano determinístico de brizna por píxel y parches sutiles de desgaste natural en ambas áreas chicas y puntos de penal.
  - Marcación reglamentaria nítida (círculo central, áreas, medialunas, líneas de cal).
- **Red de Arco Abierta (`createOpenGoalNetGeometry`):**
  - Reemplaza la antigua caja wireframe cerrada que tapaba la boca del arco.
  - Geometría `BufferGeometry` subdividida de **5 caras abiertas** (fondo, laterales izquierdo/derecho, techo y zócalo posterior; frente 100% despejado) con textura procedural de trama de red (`side: THREE.DoubleSide`, `alphaTest: 0.08`).
  - `deformGoalNet(goalZ, impactX, impactY, strength)` y `relaxGoalNets(dt)` generan abombamiento y onda elástica al impacto del balón manteniendo postes y base firmemente anclados.
- **Carteles LED Dinámicos:** Textura compartida única (`stadiumRefs.ledBoardTexture`) con desplazamiento horizontal continuo en `_syncVisuals`.

---

## 3. Iluminación y Corrección de Whiteout (`ACESFilmicToneMapping`)

En la versión base, la suma de `Ambient(0.26)` + `Hemi(0.88)` + `Sun(1.2)` + 5 `PointLight(0.82)` sin tone mapping quemaba las gradas a `#FFFFFF`. Ahora:
- `WebGLRenderer` opera con `THREE.ACESFilmicToneMapping` (`toneMappingExposure = 1.02`).
- `setSkyMode(mode)` libera con `.dispose()` la textura previa del domo celeste (cero fugas de memoria) y calibra los 3 horarios:
  - **Tarde (`day`):** Sol `#FFF8E7` (`0.95`), hemi `#BAE6FD`/`#24402E` (`0.55`), torres en `0.0`, cielo con nubes suaves.
  - **Atardecer Jujeño (`sunset`):** Sol `#FB923C` (`0.88`), hemi `#FDA4AF`/`#1E293B` (`0.48`), torres `0.18` (decay `1.5`), haces `0.055`, horizonte cálido.
  - **Noche (`night`):** Luz clave `#DBEAFE` (`0.45`), hemi `#93C5FD`/`#0B1120` (`0.30`), torres `0.34`, haces `0.11`, cielo estrellado y ventanas de prensa iluminadas.

---

## 4. Vida en Banda (Sideline Life)

- **Bancos de Suplentes Animados (`stadiumRefs.benchPlayers`):** 6 suplentes celestes + 1 director técnico en el banco local y 5 suplentes en el visitante; los suplentes locales saltan al anotar goles y especialmente en `"Locura en el banco"`.
- **4 Banderines de Córner Únicos (`stadiumRefs.cornerFlags`):** Eliminada la duplicación anterior; paños animados al viento y acelerados en festejos.
- **2 Árbitros Asistentes (`stadiumRefs.assistantRefs`):** Acompañan la línea de fuera de juego a lo largo de la banda y alzan banderín en eventos.
- **4 Fotógrafos de Prensa (`stadiumRefs.photographers`):** Figuras arrodilladas detrás de trípodes con destellos de cámara sutiles en goles locales (desactivados automáticamente con `Sin flashes` o `Reducir movimiento`).
- **Humo Celeste Suave (`createSoftSmokeTexture`):** Partículas con gradiente radial suave desde la Popular Norte (sin cuadrados duros).
