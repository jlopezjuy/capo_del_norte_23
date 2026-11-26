# Diseño de Hinchada Viva GPU y Mascota 3D — `CrowdSystem` (`js/crowd_system.js`)

## 1. Geometría Humana con Brazos y Bufandas (`aPart`)

En lugar de cubos o pilares rígidos, `StadiumBuilder.createSpectatorGeometry()` construye una geometría humana estilizada fusionada (compatible con Three.js r128) con un atributo de vértice `aPart` que identifica cada zona sin aumentar draw calls:
- `aPart = 0.0`: Torso y piernas (color de camiseta/buzo por instancia).
- `aPart = 1.0`: Cabeza y tono de piel/cabello diferenciado en fragment shader.
- `aPart = 2.0` / `3.0`: Brazos izquierdo y derecho articulados en vertex shader.
- `aPart = 4.0`: Bufanda albiceleste/rival sobre la cabeza que se tensa y ondea al alentar o festejar.

---

## 2. Animación 100% en GPU (`onBeforeCompile`) y Desincronización

Los **4.200 espectadores** (3.000 en el anillo oval + 1.200 en la Platea Oeste) se renderizan en **2 `InstancedMesh`es (2 draw calls)** sin actualizar matrices en CPU por frame. Cada instancia posee atributos `aPhase` (desfase temporal aleatorio), `aGroup` (4 grupos de ritmo/comportamiento) y `aTeam` (`0 = local`, `1 = visitante`):

| Situación del Partido | Reacción en Shader GPU |
|---|---|
| **Juego en mediocampo** | Balanceo suave sentado/relajado y desincronizado entre los 4 grupos. |
| **Ataque cercano al arco (`uExcitement`)** | El público se levanta progresivamente (`standUp`), acelera saltos y eleva brazos/bufandas. |
| **Ocasión fallada / Palo (`uFrustration`)** | Los hinchas locales se agachan y llevan brazos a la cabeza en frustración colectiva. |
| **Gol local (`uGoalTeam > 0`)** | Explosión en Popular Norte, Preferencial y Platea: saltos máximos, brazos y bufandas flameando; sector visitante en Popular Sur permanece caído. |
| **Gol visitante (`uGoalTeam < 0`)** | Solo el sector visitante en Popular Sur salta y festeja con sus colores reales; hinchada local queda en silencio/frustración. |
| **La Ola Celeste (`uWaveActive`)** | Onda sinusoidal circunferencial (`instAngle * 2.0 - uTime * 5.2`) que recorre el estadio levantando sectores sucesivos con brazos en alto. |

---

## 3. Calidad Adaptativa y Preservación del Sector Visitante

- Los índices de hinchas locales y visitantes en `bowlCrowdMesh` se **intercalan uniformemente** a lo largo de `0..2999`.
- Al cambiar calidad gráfica (`CrowdSystem.applyQuality`), ajustar `mesh.count` preserva exactamente el porcentaje del sector visitante:
  - **Bajo (`low`, 35%):** `1.050` en anillo (`312` visitantes verificados) + `420` en platea = `1.470` hinchas.
  - **Medio (`medium`, 70%):** `2.100` en anillo + `840` en platea = `2.940` hinchas.
  - **Alto (`high`, 100%):** `3.000` en anillo (`892` visitantes) + `1.200` en platea = `4.200` hinchas.
- Además, `setAwayColors(primary, secondary)` recolora dinámicamente al público y banderas visitantes según el rival elegido (y su camiseta anti-choque).

---

## 4. Mascota del Lobo 3D Esculpida y Elementos de Tribuna

- **Mascota 3D (`buildWolfMascot`):** Ubicada detrás del arco Norte; figura estilizada multiparte con hocico esculpido, ojos expresivos con cejas, orejas puntiagudas, camiseta celeste y blanca a bastones, bufanda con colas al viento, brazos articulados y cola tupida animada que salta eufórica en goles locales y se detiene ante goles rivales.
- **Trapos, Tirantes y Banderas:** 4 trapos originales de tribuna generados desde `BrandRegistry.getActiveBrand().trapos`, 7 tirantes verticales y 30 banderas flameantes (locales celestes/blancas y visitantes con color del rival).
