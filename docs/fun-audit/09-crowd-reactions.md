# 09 — Reacciones de la Hinchada

## Estética y Sincronización (`js/stadium_builder.js`, `js/game_engine.js`)
- El estadio cuenta con público instanciado en populares y plateas con banderas y bufandas celestes y blancas.
- Durante el partido, la intensidad de la hinchada (`excitement`) responde a ataques del equipo local, ocasiones de peligro, goles y eventos de Lobito.
- **La Ola Celeste:** se activa tanto en celebraciones de gol con `wave: true` como durante shows de Lobito (`murguero`, `carnavalito`, `conductor`, `desfile`).
- **Frustración compartida:** ante goles rivales o ocasiones falladas (`crowdFrustrationTimer > 0`), Lobito adopta la pose `shock` o `frustrated` acompañando el clima de la tribuna.
