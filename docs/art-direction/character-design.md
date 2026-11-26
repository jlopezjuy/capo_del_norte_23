# Diseño de Personajes 3D — `PlayerRenderer` (`js/player_renderer.js`)

## 1. Filosofía (Dirección C)

En lugar de modelos cúbicos rígidos o mallas `SkinnedMesh` pesadas, cada futbolista utiliza una **jerarquía modular esculpida** (compatible con Three.js r128) optimizada para leerse con nitidez tanto en cámara **TV Broadcast** como en primeros planos de **Cámara Pro** y **Celebraciones de Gol**.

---

## 2. Anatomía, Silueta y Variación Física

| Parte | Geometría Esculpida (Cacheada en `_sharedGeo`) | Detalle Visual |
|---|---|---|
| **Torso Atlético** | `LatheGeometry` en V-taper con hombros caídos y cuello elevado (escala oval `1.08 × 1.0 × 0.68`). | **1 solo material** con textura envolvente `256×128` (`_kitTexCache`): 12 bastones simétricos, cuello en V, escudo en pecho (`+Z`), dorsal con contorno de alto contraste solo en espalda (`-Z`), chevron de arquero y rayado de árbitro. |
| **Pantalón Corto** | `LatheGeometry` ovalada con dobladillo inferior. | Color independiente por club/arquero (`shortsColor`). |
| **Brazos Articulados** | Hombro esférico + manga ahusada (`upperArm`), codo esférico + antebrazo + mano esculpida (`forearmOutfield`). | Brazalete dorado de capitán en brazo izquierdo (`#2`, `#5` o `opts.isCaptain`). Arqueros usan manga larga y **guantes acolchados sobredimensionados** (`forearmGK` + `gkGlove`). |
| **Piernas y Botines** | Muslo esculpido con borde de short + rodilla esférica (`thigh`); pantorrilla con media alta y puño superior contrastante (`shin`); botín con talón redondeado, puntera perfilada y suela con tapones (`boot`). | Cero huecos visuales al doblar rodillas o deslizarse en `knee_slide` / `tackle`. |
| **Cabeza y Rostro** | Cabeza heroica ovalada (`1:6.5`) con puente nasal 3D, orejas esculpidas y cuello cilíndrico. | Textura `256×128` con **3 estados emocionales dinámicos** (`focused`, `joy`, `shock`) intercambiables sin asignar memoria en cada frame (`fig.setExpression(mood)`). |
| **Cabello (6 Estilos)** | 6 geometrías esculpidas según `number % 6`. | `0` corte clásico fade, `1` cresta/mohawk, `2` vincha deportiva con pelo, `3` afro rizado voluminoso, `4` flequillo lateral, `5` rodete/colita trasera. |
| **Complexión por Rol** | Escalado físico diferencial en `bodyPivot`. | `GK` más alto y ancho, `DF` más corpulento, `FW` ágil y estilizado, `MF` balanceado. |

---

## 3. Uniformes y Anti-Choque

- `AFA_DATA.resolveKitColors(opponent)` detecta automáticamente similitud cromática con los bastones celestes y blancos de San Salvador Celeste y activa la camiseta alternativa rival con aviso visible en el Lobby (`#lobby-kit-note`).
- Todos los clubes muestran emblemas SVG vectoriales reutilizables (`js/club_badges.js`, con caché en memoria) en Lobby, Scorebug HUD, Banner de Gol y Modal de Resultados.

---

## 4. Memoria y Assets Futuros

- **Disposición GPU:** `PlayerRenderer.disposePlayerFigure(fig)` libera materiales por jugador al reiniciar o cambiar de partido, conservando geometrías y cachés de texturas compartidas (cero fugas en revanchas).
- **Roadmap de Assets GLB opcionales:** Si en el futuro se incorporan modelos glTF/GLB con licencia CC0/propia (ej. creados en Blender con esqueleto unificado < 2.500 triángulos/jugador), el módulo está encapsulado tras `createPlayerFigure` / `updatePose` / `disposePlayerFigure` sin afectar a `GameEngine` ni `PhysicsEngine`.
