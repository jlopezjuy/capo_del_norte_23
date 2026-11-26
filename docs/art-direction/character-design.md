# Diseño de Personajes 3D — El Lobo Jujeño

## Arquitectura Anatómica (`js/player_renderer.js`)
- **Estilo:** Estilizado deportivo (Dirección C) con lectura clara desde cámara Broadcast y expresividad en cámara Pro/Celebración.
- **Cabeza y rostro:** Esfera suavizada con `CanvasTexture` facial (ojos, cejas según color de cabello, boca) + 4 estilos de cabello/vincha según dorsal.
- **Torso y uniformes:** Camiseta con textura separada para frente (bastones albicelestes + escudo) y espalda (bastones + dorsal legible en `Barlow Condensed`), evitando repetir el dorsal en pecho y costados.
- **Articulaciones:** Hombros, codos, caderas y rodillas articulados (`armLPivot`, `elbowLPivot`, `legL`, `kneeL`, etc.), más medias en color del club y botines diferenciados.
- **Variación física:** Altura y contextura escaladas por rol (arquero y defensores más altos/anchos; delanteros más ágiles).
