# Guía de Dirección de Arte — El Lobo Jujeño

## 1. Comparación de Direcciones y Elección

| Dirección | Ventajas | Desventajas | Decisión |
|---|---|---|---|
| **A. Realismo deportivo optimizado** | Fidelidad fotográfica del estadio. | Personajes realistas en WebGL sin assets pesados caen en *uncanny valley* y consumen demasiada GPU. | Descartada |
| **B. Arcade estilizado premium** | Muy expresivo y divertido. | Corre el riesgo de perder la arquitectura reconocible del Estadio 23 de Agosto. | Descartada |
| **C. Híbrido Realista + Arcade (ELEGIDA)** | **Estadio 23 de Agosto fiel en escala, tribunas y entorno jujeño**, combinado con **futbolistas estilizados expresivos, hinchada viva y celebraciones exageradas**. | Exige coherencia cromática para que el estadio realista y los personajes estilizados convivan sin chocar. | **SELECCIONADA** |

---

## 2. Sistema Visual (Dirección C)

- **Paleta Principal (Identidad Albiceleste + Jujuy):**
  - Celeste Lobo (primario): `#1EA7FD` / `#0EA5E9`
  - Blanco Puro (contraste): `#F8FAFC`
  - Azul Nocturno Estadio (fondos UI sólidos, sin blur excesivo): `#0B1320`
  - Grafito Técnico (tarjetas HUD): `#111B2B` con borde `1px solid rgba(248, 250, 252, 0.14)`
  - Oro Gol / Alerta: `#FACC15`
  - Césped 23 de Agosto: `#2E7D32` / `#388E3C` (franjas de corte limpias)
  - Terracota / Cerros Jujeños: `#8C5A4B` / `#4A3835`
- **Tipografía:**
  - Títulos, dorsales y marcador: `Barlow Condensed` (700/800/900, tabular-nums para reloj y goles).
  - UI, controles y lectura rápida: `Plus Jakarta Sans` (500/600/700).
- **Reglas de UI (Anti-clutter):**
  - Cero glassmorphism pesado sobre el campo de juego; usar paneles compactos de alto contraste en esquinas.
  - Durante el partido, el HUD ocupa < 12% de la pantalla; el banner de gol se ubica en el tercio superior dejando visible al goleador y la hinchada.
  - Cero glow decorativo sin función: el resaltado luminoso se reserva exclusivamente para el jugador activo, la carga de remate y eventos de gol.
- **Estilo de Personajes e Hinchada:**
  - Proporciones heroicas estilizadas (cabeza ligeramente expresiva 1:6.5 respecto al cuerpo, hombros marcados, torso en V, ojos y cejas legibles en cámara Pro y celebraciones).
  - Hinchada con siluetas humanas simplificadas (cabeza + torso + brazos) y colores celeste/blanco/azul marino, evitando bloques cúbicos sueltos.
