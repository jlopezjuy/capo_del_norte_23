# Sistema de Animaciones (`js/player_renderer.js`)

- **Blending suave:** Interpolación exponencial (`lerp`, factor `dt * 14`) entre poses para evitar cortes bruscos.
- **Estados:** `idle` (respiración), `run` / `sprint` (brazos y piernas en contrafase + inclinación), `kick` (`kickTimer`), `tackle` (barrida al ras), `gk_dive` (`GOALKEEPER_DIVE`), `celebrate` (saltos/brazos en V/orquesta) y `frustrated` (manos a la cabeza).
