# Sistema de Animaciones — El Lobo Jujeño

## Máquina de Poses y Blending (`PlayerRenderer.updatePose`)
- **Blending suave:** Interpolación exponencial (`dt * 15`) entre todas las poses para evitar cortes bruscos al cambiar de dirección, patear o celebrar.
- **Estados implementados:**
  - `idle`: respiración sutil y balanceo natural de brazos.
  - `walk` / `jog` / `sprint`: zancada proporcional a velocidad con flexión de rodillas, codos e inclinación de torso hacia adelante.
  - `kick`: retroceso de pierna de apoyo y látigo de remate/pase.
  - `tackle`: barrida horizontal con rodilla trasera flexionada.
  - `gk_dive` y `gk_save_celebrate`: estirada lateral del arquero y puño arriba tras atajada difícil.
  - `callingPass`: compañero desmarcado en ataque levanta el brazo pidiendo el pase.
  - `frustrated`: delantero que falla ocasión clara (o rival que recibe gol) se agarra la cabeza.
  - `celebrate`: variantes `grito`, `dance` (baile colectivo sincronizado), `orchestra` (director de orquesta) y festejo grupal.
